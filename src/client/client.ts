import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSG } from 'three-csg-ts';

import { EnvironmentManager } from './EnvironmentManager';
import { WallBorder } from './Models/WallBorder';
import { EditPanel } from './Controllers/EditPanel';
import { EditButton } from './Controllers/Control/EditButton';
import { MainPanel } from './Controllers/MainPanel';
import { WallItem } from './Models/WallItem';
import { ButtonPanel } from './Controllers/ButtonPanel';
import { DeleteBtn } from './Controllers/Control/DeleteButton';
import { ScaleButton } from './Controllers/Scale/ScaleButton';
import { WindowBorder } from './Models/WindowBorder';
import { AnimateButton } from './Controllers/Control/AnimateButton';
import { DialogWindow } from './Controllers/EditPanelWindow';

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
let panelManager = new MainPanel();
panelManager.registerPanelChange();
let xm = 999,
  xx = -999,
  ym = 999,
  yx = -999,
  zm = 999,
  zx = -999;

let house = new THREE.Group();

fbxLoader.load(
  'models/interior.fbx',
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
            // scene.add(item.wall);
            house.add(item.wall);
          });
          walls.forEach((item) => {
            wallBorderMap.set(item.name, item);
          });
          objects.forEach((item) => {
            // item.updateMatrix();
            // scene.add(item);
            house.add(item);
          });
          walls.forEach((item) => {
            xm = xm < item.border.getMinX() ? xm : item.border.getMinX();
            ym = ym < item.border.getMinY() ? ym : item.border.getMinY();
            zm = zm < item.border.getMinZ() ? zm : item.border.getMinZ();
            xx = xx > item.border.getMaxX() ? xx : item.border.getMaxX();
            yx = yx > item.border.getMaxY() ? yx : item.border.getMaxY();
            zx = zx > item.border.getMaxZ() ? zx : item.border.getMaxZ();
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
let doorsWindows: THREE.Object3D[] = [];
let draggable: THREE.Object3D[] = [];
let draggableCache: THREE.Object3D[] = [];

function addWindow() {
  fbxLoader.load(
    'models/window_2.fbx',
    (window: THREE.Object3D) => {
      window.position.set(0, 5, 10);
      window.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.position.x = 0;
          child.position.y = 0;
          child.position.z = 0;
          child.updateMatrix();
        }
      });
      window.scale.set(0.01, 0.01, 0.01);
      window.name = 'window';
      house.add(window);
      doorsWindows.push(window);
      draggable.push(window);
    },
    (xhr: { loaded: number; total: number }) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    (error: any) => {
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
          doorsWindows.push(door);
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
dControls.addEventListener('hoveron', function (event) {
  let eventObject = event.object;
  if (eventObject.parent) {
    if (eventObject.parent.name == 'window') {
      draggable.forEach((item) => {
        if (eventObject.parent.id !== item.id) draggableCache.push(item);
      });
      draggable.length = 0;
      draggable.push(eventObject.parent);
      dControls.transformGroup = true;
    } else {
      draggableCache.forEach((item) => {
        draggable.push(item);
      });
      draggableCache.length = 0;
      dControls.transformGroup = false;
    }
  }
});
dControls.addEventListener('hoveroff', function (event) {
  draggableCache.forEach((item) => {
    draggable.push(item);
  });
  draggableCache.length = 0;
  dControls.transformGroup = false;
});
dControls.addEventListener('dragstart', function (event) {
  controls.enabled = false;
});
dControls.addEventListener('dragend', function (event) {
  controls.enabled = true;
});

let mapScale = new Map<string, ScaleButton>();
dControls.addEventListener('drag', (event) => {
  let eventObject = event.object as THREE.Mesh;
  if (eventObject.name.toLowerCase().includes('scale')) {
    let b = mapScale.get(eventObject.name);
    console.log('ok');
    if (b) {
      if (b.type === 'z') {
        console.log('ok1');
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
        house.children
          .filter((item) => item.name.toLowerCase().includes('wall'))
          .forEach((item) => {
            let itemClone = (item as THREE.Mesh).clone();
            walls.filter((i) => i.name === item.name)[0].oWall = itemClone;
            walls.filter((i) => i.name === item.name)[0].wall = itemClone;
          });
        b.pastDistance = b.presentDistance;
      } else if (b.type === 'x') {
        console.log('ok2');
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

function adjustDoorAndWindow() {
  walls.forEach((wallItem) => {
    wallItem.resetWall();
    let wallBox = wallItem.border;
    doorsWindows.forEach((item) => {
      item.updateMatrix();
      let boundaryBox;
      if (item.name.toLowerCase().includes('window')) {
        boundaryBox = new WindowBorder(item as THREE.Group);
        item.position.y = item.position.y < 0 ? 2 : item.position.y;
        item.position.y =
          item.position.y > wallBox.getMaxY()
            ? wallBox.getMaxY() - 2
            : item.position.y;
      } else {
        boundaryBox = new WallBorder(item as THREE.Mesh);
        item.position.y = boundaryBox.getHeight() / 2 - 0.2;
      }
      if (
        wallItem.wall.position.z + 2 > item.position.z &&
        wallItem.wall.position.z - 2 < item.position.z &&
        wallItem.type == 'main' &&
        wallBox.getMinX() < item.position.x &&
        wallBox.getMaxX() > item.position.x
      ) {
        let g;
        if (item.name.toLowerCase().includes('window')) {
          g = new THREE.BoxBufferGeometry(
            boundaryBox.getWidth(),
            boundaryBox.getHeight(),
            boundaryBox.getDepth() * 8
          );
        } else {
          g = new THREE.BoxBufferGeometry(
            boundaryBox.getWidth(),
            boundaryBox.getHeight(),
            boundaryBox.getDepth() * 4
          );
        }
        let m = new THREE.MeshLambertMaterial();
        let d = new THREE.Mesh(g, m);
        item.rotation.y = 0;
        item.position.z = wallItem.wall.position.z;
        if (item.name.toLowerCase().includes('window')) {
          d.position.set(
            item.position.x,
            item.position.y,
            wallItem.wall.position.z
          );
        } else {
          d.position.set(
            item.position.x - 0.2,
            item.position.y,
            wallItem.wall.position.z
          );
        }

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
        wallItem.wall.position.x + 2 > item.position.x &&
        wallItem.wall.position.x - 2 < item.position.x &&
        wallItem.type == 'side' &&
        wallBox.getMinZ() < item.position.z &&
        wallBox.getMaxZ() > item.position.z
      ) {
        item.rotation.y = Math.PI / 2;
        item.position.x = wallItem.wall.position.x;
        let g;
        if (item.name.toLowerCase().includes('window')) {
          g = new THREE.BoxBufferGeometry(
            boundaryBox.getWidth() * 8,
            boundaryBox.getHeight(),
            boundaryBox.getDepth()
          );
        } else {
          g = new THREE.BoxBufferGeometry(
            boundaryBox.getWidth() * 4,
            boundaryBox.getHeight(),
            boundaryBox.getDepth()
          );
        }
        let m = new THREE.MeshLambertMaterial();
        let d = new THREE.Mesh(g, m);
        if (item.name.toLowerCase().includes('window')) {
          d.position.set(
            wallItem.wall.position.x,
            item.position.y,
            item.position.z
          );
        } else {
          d.position.set(
            wallItem.wall.position.x,
            item.position.y,
            item.position.z + 0.2
          );
        }
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
    let item = intersects[0];
    if (
      item.object.name.toLowerCase().includes('wall') ||
      item.object.name.toLowerCase().includes('floor') ||
      item.object.name.toLowerCase().includes('door') ||
      item.object.name.toLowerCase().includes('window') ||
      item.object.parent?.name.toLowerCase().includes('window')
    ) {
      let buttonPanel = new ButtonPanel(event.clientX, event.clientY);
      let editBtn = new EditButton();
      buttonPanel.addButton(editBtn);
      if (item.object.name.toLowerCase().includes('door')) {
        let deleteBtn = new DeleteBtn();
        buttonPanel.addButton(deleteBtn);
        deleteBtn.getButton().addEventListener('click', () => {
          let ob = doorsWindows.filter((d) => d.id === item.object.id)[0];
          draggable.splice(draggable.indexOf(ob), 1);
          doorsWindows.splice(doorsWindows.indexOf(ob), 1);
          house.remove(ob);
          buttonPanel.remove();
        });
      } else if (item.object.parent?.name.toLowerCase().includes('window')) {
        let deleteBtn = new DeleteBtn();
        buttonPanel.addButton(deleteBtn);
        let animateBtn = new AnimateButton();
        buttonPanel.addButton(animateBtn);

        deleteBtn.getButton().addEventListener('click', () => {
          let ob = doorsWindows.filter(
            (win) => win.id === item.object.parent?.id
          )[0];
          draggable.splice(draggable.indexOf(ob), 1);
          doorsWindows.splice(doorsWindows.indexOf(ob), 1);
          house.remove(ob);
          buttonPanel.remove();
        });
        animateBtn.getButton().addEventListener('click', () => {
          let ob = doorsWindows.filter(
            (win) => win.id === item.object.parent?.id
          )[0];
          let mixer = new THREE.AnimationMixer(ob);
          const clips = ob.animations;
          clips.forEach(function (clip) {
            mixer.clipAction(clip).play();
          });
          let clock = new THREE.Clock();
          let count = 1;
          let i = setInterval(() => {
            mixer.update(clock.getElapsedTime());
            count++;
            if (count == 31) {
              clearInterval(i);
            }
          }, 100);
          buttonPanel.remove();
        });
      }
      buttonPanel.display();
      setTimeout(() => buttonPanel.remove(), 4000);
      editBtn.button.addEventListener('click', () => {
        buttonPanel.remove();
        if (item.object.name.toLowerCase().includes('wall')) {
          let dialog = new EditPanel(
            item.object as THREE.Mesh,
            'Wall',
            meshCache
          );
          dialog.add();
        } else if (item.object.name.toLowerCase().includes('floor')) {
          let dialog = new EditPanel(
            item.object as THREE.Mesh,
            'Floor',
            meshCache
          );
          dialog.add();
        } else if (item.object.name.toLowerCase().includes('door')) {
          let dialog = new EditPanel(
            item.object as THREE.Mesh,
            'Door',
            meshCache
          );
          dialog.add();
        } else if (item.object.parent?.name.toLowerCase().includes('window')) {
          let dialog = new DialogWindow(
            item.object.parent as THREE.Group,
            'Window'
          );
          dialog.add();
        }
      });
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  adjustDoorAndWindow();
  controls.update();
  envManager.render();
}

animate();
document.getElementById('addDoor')?.addEventListener('click', addDoor);
document.getElementById('addWindow')?.addEventListener('click', addWindow);

function addButtons() {
  {
    let scaleButton = new ScaleButton('scaleBtn1', xx + 4, xx + 9, 'z');
    let button = scaleButton.getButton();
    button.position.set(0, 0.1, zx + 4);
    button.rotation.x += Math.PI / 2;
    button.rotation.z -= Math.PI / 2;
    scene.add(button);
    draggable.push(button);
    mapScale.set(button.name, scaleButton);
  }
  {
    let scaleButton = new ScaleButton('scaleBtn2', xx + 4, xx + 9, 'x');
    let button = scaleButton.getButton();
    button.position.set(xx + 4, 0.1, 0);
    button.rotation.x += Math.PI / 2;
    button.rotation.y += Math.PI;
    scene.add(button);
    draggable.push(button);
    mapScale.set(button.name, scaleButton);
  }
}
