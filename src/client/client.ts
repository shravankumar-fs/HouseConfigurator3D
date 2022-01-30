import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { EnvironmentManager } from './EnvironmentManager';
import { WallBorder } from './WallBorder';
import { Dialog } from './Dialog';
import { CSG } from 'three-csg-ts';
import { Border } from './Border';
import { EditButton } from './EditButton';
import { Panel } from './Panel';
import { WallItem } from './WallItem';
import { ButtonPanel } from './buttonPanel';
import { DeleteBtn } from './DeleteButton';
import { MeshBasicMaterial, MeshPhongMaterial } from 'three';
import { ScaleButton } from './ScaleButton';

// const stats = Stats();
// document.body.appendChild(stats.dom);
let envManager = new EnvironmentManager();
let scene = envManager.scene;
let renderer = envManager.renderer;
let camera = envManager.camera;
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.minPolarAngle = Math.PI / 10;
controls.maxPolarAngle = Math.PI / 2.2;
controls.maxDistance = 50;
controls.minDistance = -50;
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.enablePan = false;
controls.screenSpacePanning = false;
window.addEventListener('resize', () => envManager.onWindowResize(), false);

let walls: WallItem[] = [];
const fbxLoader = new FBXLoader();
let objects: THREE.Mesh[] = [];
let count = 0;
const wallBorderMap = new Map<string, WallItem>();
let panelManager = new Panel();
panelManager.registerPanelChange();
let xm = 999,
  xx = -999,
  ym = 999,
  yx = -999,
  zm = 999,
  zx = -999;

let house = new THREE.Group();

fbxLoader.load(
  'models/intmodified10.fbx',
  (obj) => {
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        let mesh = child as THREE.Mesh<
          THREE.BufferGeometry,
          THREE.MeshLambertMaterial
        >;
        mesh.material = mesh.material.clone();
        mesh.material.side = THREE.DoubleSide;
        mesh.material.reflectivity = 0.5;
        mesh.material.refractionRatio = 0.3;
        mesh.updateMatrix();
        mesh.updateMatrixWorld(true);
        if (mesh.name.toLowerCase().includes('wall')) {
          mesh.material.color = new THREE.Color(0x1f6f8f);
          let wallItem = new WallItem(mesh);
          walls.push(wallItem);
        } else {
          if (mesh.name.toLowerCase().includes('floor')) {
            mesh.material.color = new THREE.Color(0xdfaf00);
          } else if (mesh.name.toLowerCase().includes('roof')) {
            mesh.material.transparent = true;
            mesh.material.opacity = 0.7;
            mesh.material.color = new THREE.Color(0xffaf00);
          } else {
            mesh.material.color = new THREE.Color(0xffffff);
          }
          objects.push(mesh);
        }
        ++count;
        if (count == 77) {
          walls.forEach((item) => {
            // item.wall.updateMatrix();
            scene.add(item.wall);
            house.add(item.wall);
          });
          walls.forEach((item) => {
            wallBorderMap.set(item.name, item);
          });
          objects.forEach((item) => {
            // item.updateMatrix();
            scene.add(item);
            house.add(item);
          });
          walls.forEach((item) => {
            xm = xm < item.border.xMin ? xm : item.border.xMin;
            xx = xx > item.border.xMax ? xx : item.border.xMax;
            ym = ym < item.border.yMin ? ym : item.border.yMin;
            yx = yx > item.border.yMax ? yx : item.border.yMax;
            zm = zm < item.border.zMin ? zm : item.border.zMin;
            zx = zx > item.border.zMax ? zx : item.border.zMax;
          });
          addButtons();
          scene.add(house);
        }
      }
    });
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
  },
  (error) => {
    console.log(error);
  }
);
let doors: THREE.Mesh[] = [];
let windows: THREE.Mesh[] = [];
let draggable: THREE.Mesh[] = [];

function addWindow() {
  fbxLoader.load(
    'models/window2.fbx',
    (obj: THREE.Object3D<THREE.Event>) => {
      // obj.traverse(function (child) {
      //   if ((child as THREE.Mesh).isMesh) {
      //     let door = child as THREE.Mesh;
      //     // door.name = 'door';
      //     // (door.material as THREE.MeshLambertMaterial).color = new THREE.Color(
      //     //   0xff0000
      //     // );
      //     (door.material as THREE.MeshLambertMaterial).side = THREE.DoubleSide;
      //     (door.material as THREE.MeshLambertMaterial).needsUpdate = true;
      //     door.position.set(5, 5, 15);
      //     draggable.push(door);
      //     scene.add(door);
      //     windows.push(door);
      //   }
      // });
      // obj.traverse(function (child) {
      //   if ((child as THREE.Mesh).isMesh) {
      //     (child as THREE.Mesh).material = new THREE.MeshBasicMaterial({
      //       color: 0xffffff,
      //     });
      //     scene.add(child as THREE.Mesh);
      //   }
      // });
      // obj.position.set(0, 10, 10);
      // obj.scale.addScalar(100);
      // scene.add(obj);
      // console.log(obj);
    },
    // (obj: THREE.Object3D<THREE.Event>) => {
    //   // let windowMain = new THREE.Object3D();
    //   obj.traverse(function (child) {
    //     if ((child as THREE.Mesh).isMesh) {
    //       let window = child as THREE.Mesh;
    //       (window.material as THREE.MeshLambertMaterial).side =
    //         THREE.DoubleSide;
    //       (window.material as THREE.MeshLambertMaterial).needsUpdate = true;
    //       window.scale.set(0.1, 0.1, 0.01);
    //       window.position.set(5, 5, 15);
    //       draggable.push(window);
    //       scene.add(window);
    //       windows.push(window);
    //       // windowMain.add(window);
    //       // console.log(window, windowMain);
    //     }
    //   });

    // obj.children.forEach((item) => {
    //   if ((item as THREE.Mesh).isMesh) {
    //     windowMain.add(item);
    //   }
    // });
    // console.log(windowMain);
    // windowMain.name = 'window';
    // // (window.material as THREE.MeshLambertMaterial).side =
    // //   THREE.DoubleSide;
    // // (window.material as THREE.MeshLambertMaterial).needsUpdate = true;
    // // window.scale.set(0, 0.1, 0.01);
    // windowMain.position.set(5, 5, 15);
    // // draggable.push(window);
    // scene.add(windowMain);
    // // console.log(windowMain);

    // // windows.push(window);
    // },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    (error) => {
      console.log(error);
    }
  );
}
function addDoor() {
  fbxLoader.load(
    'models/door.fbx',
    (obj: THREE.Object3D<THREE.Event>) => {
      obj.traverse(function (child) {
        if ((child as THREE.Mesh).isMesh) {
          let door = child as THREE.Mesh;
          door.name = 'door';
          (door.material as THREE.MeshLambertMaterial).color = new THREE.Color(
            0xff0000
          );
          (door.material as THREE.MeshLambertMaterial).side = THREE.DoubleSide;
          (door.material as THREE.MeshLambertMaterial).needsUpdate = true;
          door.position.set(5, 5, 15);
          draggable.push(door);
          house.add(door);
          doors.push(door);
        }
      });
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    (error) => {
      console.log(error);
    }
  );
}

const dControls = new DragControls(draggable, camera, renderer.domElement);
dControls.addEventListener('dragstart', function (event) {
  controls.enabled = false;
});
let mapScale = new Map<string, ScaleButton>();
dControls.addEventListener('drag', (event) => {
  let eventObject = event.object as THREE.Mesh;
  if (eventObject.name.includes('scaleBtn')) {
    let b = mapScale.get(eventObject.name);
    if (b) {
      if (b.type === 'z') {
        eventObject.position.x = 0;
        eventObject.position.y = 0;
        if (eventObject.position.z < b.getMin()) {
          eventObject.position.z = b.getMin();
        }
        if (eventObject.position.z > b.getMax()) {
          eventObject.position.z = b.getMax();
        }
        b.presentDistance = b.getDistance();
        let delta = b.presentDistance - b.pastDistance;
        house.updateMatrix();
        house.scale.z += delta / 12;
        b.pastDistance = b.presentDistance;
      } else if (b.type === 'x') {
        eventObject.position.z = 0;
        eventObject.position.y = 0;
        if (eventObject.position.x < b.getMin()) {
          eventObject.position.x = b.getMin();
        }
        if (eventObject.position.x > b.getMax()) {
          eventObject.position.x = b.getMax();
        }
        b.presentDistance = b.getDistance();
        let delta = b.presentDistance - b.pastDistance;
        house.updateMatrix();
        house.scale.x += delta / 12;
        house.children
          .filter((item) => item.name.toLowerCase().includes('wall'))
          .forEach((item) => {
            let itemClone = (item as THREE.Mesh).clone();
            walls.filter((i) => i.name === item.name)[0].oWall = itemClone;
            walls.filter((i) => i.name === item.name)[0].wall = itemClone;
          });
        b.pastDistance = b.presentDistance;
      }
    }
  }
});
dControls.addEventListener('dragend', function (event) {
  controls.enabled = true;
});
let test = false;
let countIt = 0;
function adjustDoor() {
  countIt++;
  walls.forEach((wallItem) => {
    wallItem.resetWall();
    let wallBox = wallItem.border;
    doors.forEach((door) => {
      door.updateMatrix();
      let doorBox = new WallBorder(door);
      door.position.y = doorBox.getHeight() / 2 - 0.2;
      if (
        wallItem.wall.position.z + 2 > door.position.z &&
        wallItem.wall.position.z - 2 < door.position.z &&
        wallItem.type == 'main' &&
        wallBox.getMinX() < door.position.x &&
        wallBox.getMaxX() > door.position.x
      ) {
        let g = new THREE.BoxBufferGeometry(
          doorBox.getWidth(),
          doorBox.getHeight(),
          doorBox.getDepth() * 2
        );
        let m = (door.material as THREE.MeshLambertMaterial).clone();
        let d = new THREE.Mesh(g, m);
        door.rotation.y = 0;
        door.position.z = wallItem.wall.position.z;
        d.position.set(
          door.position.x - 0.2,
          door.position.y,
          wallItem.wall.position.z
        );
        d.updateMatrix();
        wallItem.wall.updateMatrix();
        const sRes = CSG.subtract(wallItem.wall, d);
        sRes.name = wallItem.name;
        sRes.position.set(
          wallItem.wall.position.x,
          wallItem.wall.position.y,
          wallItem.wall.position.z
        );
        wallItem.wall.visible = false;
        house.remove(wallItem.wall);
        wallItem.wall = sRes.clone();
        house.add(wallItem.wall);
      } else if (
        wallItem.wall.position.x + 2 > door.position.x &&
        wallItem.wall.position.x - 2 < door.position.x &&
        wallItem.type == 'side' &&
        wallBox.getMinZ() < door.position.z &&
        wallBox.getMaxZ() > door.position.z
      ) {
        door.rotation.y = Math.PI / 2;
        if (wallItem.name.toLowerCase().includes('outer'))
          door.position.x = wallItem.wall.position.x;
        let g = new THREE.BoxBufferGeometry(
          doorBox.getWidth() * 2,
          doorBox.getHeight(),
          doorBox.getDepth()
        );
        let m = (door.material as THREE.MeshLambertMaterial).clone();
        let d = new THREE.Mesh(g, m);
        d.position.set(
          wallItem.wall.position.x,
          door.position.y,
          door.position.z + 0.2
        );
        d.updateMatrix();
        wallItem.wall.updateMatrix();
        const sRes = CSG.subtract(wallItem.wall, d);
        sRes.name = wallItem.name;
        sRes.position.set(
          wallItem.wall.position.x,
          wallItem.wall.position.y,
          wallItem.wall.position.z
        );
        wallItem.wall.visible = false;
        house.remove(wallItem.wall);
        wallItem.wall = sRes.clone();
        house.add(wallItem.wall);
      }
    });
  });
}

function adjustWindow() {
  windows.forEach((window) => {
    window.updateMatrix();
    let windowBox: Border = new WallBorder(window);
    walls.forEach((wallItem, idx) => {
      let wallBox = wallItem.border;
      wallItem.resetWall();
      if (wallBox) {
        if (
          wallItem.wall.position.z + 2 > window.position.z &&
          wallItem.wall.position.z - 2 < window.position.z &&
          wallBox.getWidth() > wallBox.getDepth() &&
          wallBox.getMinX() < window.position.x &&
          wallBox.getMaxX() > window.position.x
        ) {
          let g = new THREE.BoxBufferGeometry(
            windowBox.getWidth(),
            windowBox.getHeight(),
            windowBox.getDepth()
          );
          const sRes = CSG.subtract(wallItem.wall, window);
          sRes.name = wallItem.name;
          sRes.position.set(
            wallItem.wall.position.x,
            wallItem.wall.position.y,
            wallItem.wall.position.z
          );
          scene.remove(wallItem.wall);
          wallItem.wall.visible = false;
          wallItem.wall = sRes;
          scene.add(sRes);
          window.rotation.y = 0;
          window.position.z = wallItem.wall.position.z + 0.1;
        }
      }
    });
  });
}

let meshCache: THREE.Mesh[] = [];
const raycaster = new THREE.Raycaster();
document.getElementById('canvas')?.addEventListener('click', changeEnvironment);
function changeEnvironment(event: THREE.Event) {
  event.preventDefault();

  const mouse = {
    x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
  };

  raycaster.setFromCamera(mouse, camera);
  const intersects: THREE.Intersection[] = raycaster.intersectObjects(
    house.children
  );

  if (intersects.length > 0) {
    console.log(intersects);

    let item = intersects[0];
    if (
      item.object.name.toLowerCase().includes('wall') ||
      item.object.name.toLowerCase().includes('floor') ||
      item.object.name.toLowerCase().includes('door') ||
      item.object.name.toLowerCase().includes('window')
    ) {
      let buttonPanel = new ButtonPanel(event.clientX, event.clientY);
      let editBtn = new EditButton();
      buttonPanel.addButton(editBtn);

      if (item.object.name.toLowerCase().includes('door')) {
        let deleteBtn = new DeleteBtn();
        buttonPanel.addButton(deleteBtn);
        deleteBtn.getButton().addEventListener('click', () => {
          let ob = doors.filter((d) => d.id === item.object.id)[0];
          draggable.splice(draggable.indexOf(ob), 1);
          doors.splice(doors.indexOf(ob), 1);
          scene.remove(ob);
          buttonPanel.remove();
        });
      } else if (item.object.name.toLowerCase().includes('window')) {
        let deleteBtn = new DeleteBtn();
        buttonPanel.addButton(deleteBtn);
        deleteBtn.getButton().addEventListener('click', () => {
          let ob = windows.filter((win) => win.id === item.object.id)[0];
          console.log(ob);

          draggable.splice(draggable.indexOf(ob), 1);
          windows.splice(windows.indexOf(ob), 1);
          scene.remove(ob);
          buttonPanel.remove();
        });
      }
      buttonPanel.display();
      setTimeout(() => buttonPanel.remove(), 4000);
      editBtn.button.addEventListener('click', () => {
        buttonPanel.remove();
        if (item.object.name.toLowerCase().includes('wall')) {
          let dialog = new Dialog(item.object as THREE.Mesh, 'Wall', meshCache);
          dialog.add();
        } else if (item.object.name.toLowerCase().includes('floor')) {
          let dialog = new Dialog(
            item.object as THREE.Mesh,
            'Floor',
            meshCache
          );
          dialog.add();
        } else if (item.object.name.toLowerCase().includes('door')) {
          let dialog = new Dialog(item.object as THREE.Mesh, 'Door', meshCache);
          dialog.add();
        } else if (item.object.name.toLowerCase().includes('window')) {
          let dialog = new Dialog(
            item.object as THREE.Mesh,
            'Window',
            meshCache
          );
          dialog.add();
        }
      });
    }
  }
}
// let buttons: THREE.Mesh[] = [];
function animate() {
  requestAnimationFrame(animate);

  adjustDoor();
  adjustWindow();
  controls.update();
  envManager.render();
}
function adjustItem() {}
animate();
document.getElementById('addDoor')?.addEventListener('click', addDoor);
document.getElementById('addWindow')?.addEventListener('click', addWindow);

function addButtons() {
  {
    let mc = createScaleButton();
    mc.name = 'scaleBtn1';
    mc.position.set(0, 0.1, zx + 4);
    mc.rotation.x += Math.PI / 2;
    mc.rotation.z -= Math.PI / 2;
    scene.add(mc);
    draggable.push(mc);
    let sb = new ScaleButton(mc, zx + 4, zx + 9, 'z');
    mapScale.set('scaleBtn1', sb);
  }
  {
    let mc = createScaleButton();
    mc.name = 'scaleBtn2';
    mc.position.set(xx + 4, 0.1, 0);
    mc.rotation.x += Math.PI / 2;
    mc.rotation.y += Math.PI;
    scene.add(mc);
    draggable.push(mc);
    let sb = new ScaleButton(mc, xx + 4, xx + 9, 'x');
    mapScale.set('scaleBtn2', sb);
  }
}

function createScaleButton(): THREE.Mesh {
  let g1 = new THREE.PlaneGeometry(2, 2, 100, 100);
  let m1 = new MeshBasicMaterial({
    color: 0x00ff00,
    map: new THREE.TextureLoader().load('images/arrow.png'),
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
  });
  let mc = new THREE.Mesh(g1, m1);
  return mc;
}

// dControls.addEventListener('drag')
// document.getElementById('canvas')?.addEventListener('drag', (event) => {
//   event.preventDefault();

//   const mouse = {
//     x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
//     y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
//   };

//   raycaster.setFromCamera(mouse, camera);
//   const intersects: THREE.Intersection[] = raycaster.intersectObjects(
//     scene.children
//   );

//   if (intersects.length > 0) {
//     let item = intersects[0];
//     if (item.object.name == 'scaleBtn') {
//       console.log('im here');
//     }
//   }
// });
