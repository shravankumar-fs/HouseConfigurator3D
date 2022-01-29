import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { EnvironmentManager } from './EnvironmentManager';
import { WallBorder } from './WallBorder';
import { Dialog } from './Dialog';
import { ControlButton } from './ControlButton';
import { CSG } from 'three-csg-ts';
import { Border } from './Border';
import { EditButton } from './EditButton';
import { Panel } from './Panel';
import { WallItem } from './WallItem';
import { BoxBufferGeometry } from 'three';
import { ButtonPanel } from './buttonPanel';
import { DeleteBtn } from './DeleteButton';

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
            mesh.material.opacity = 0.5;
            mesh.material.color = new THREE.Color(0xffffff);
          } else {
            mesh.material.color = new THREE.Color(0xffffff);
          }
          objects.push(mesh);
        }
        ++count;
        if (count == 77) {
          walls.forEach((item) => {
            item.wall.updateMatrix();
            scene.add(item.wall);
          });
          walls.forEach((item) => {
            wallBorderMap.set(item.name, item);
          });
          objects.forEach((item) => {
            item.updateMatrix();
            scene.add(item);
          });
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
  let g = new THREE.BoxGeometry(2, 2, 1);
  let m = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
  });
  let window = new THREE.Mesh(g, m);
  window.name = 'window';
  window.position.set(0, 11, 0);
  draggable.push(window);
  scene.add(window);
  windows.push(window);
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
          scene.add(door);
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
        if (wallItem.name.toLowerCase().includes('outer'))
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
        scene.remove(wallItem.wall);
        wallItem.wall = sRes.clone();
        scene.add(wallItem.wall);
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
        scene.remove(wallItem.wall);
        wallItem.wall = sRes.clone();
        scene.add(wallItem.wall);
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
    scene.children
  );

  if (intersects.length > 0) {
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

function animate() {
  requestAnimationFrame(animate);

  // if (doors.length > 0)
  adjustDoor();
  // if (windows.length > 0)
  adjustWindow();
  controls.update();
  envManager.render();

  // stats.update();
}

animate();

document.getElementById('addDoor')?.addEventListener('click', addDoor);
document.getElementById('addWindow')?.addEventListener('click', addWindow);
