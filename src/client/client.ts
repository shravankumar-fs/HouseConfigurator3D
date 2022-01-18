import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';

import { EnvironmentManager } from './EnvironmentManager';
import { WallBorder } from './WallBorder';
import { Dialog } from './Dialog';
import { DialogInt } from './DialogInt';
import { CSG } from 'three-csg-ts';

const stats = Stats();
document.body.appendChild(stats.dom);
let envManager = new EnvironmentManager();
let scene = envManager.scene;
let renderer = envManager.renderer;
let camera = envManager.camera;
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.minPolarAngle = Math.PI / 3.5;
controls.maxPolarAngle = Math.PI / 2.2;
controls.maxDistance = 50;
controls.minDistance = -50;
controls.enableDamping = false;
controls.dampingFactor = 0.01;
controls.enablePan = false;
controls.screenSpacePanning = false;
window.addEventListener('resize', () => envManager.onWindowResize(), false);

{
  let light = new THREE.PointLight(0xffffff, 2, 60, 1);
  light.position.set(0, 40, 0);
  scene.add(light);

  // light.castShadow = true;
  scene.add(light);
}
{
  let light = new THREE.PointLight(0xffffff, 2, 60, 1);
  light.position.set(0, -40, 0);
  scene.add(light);
}
{
  let light = new THREE.PointLight(0xffffff, 2, 60, 1);
  light.position.set(0, 0, -45);
  scene.add(light);
}
{
  let light = new THREE.PointLight(0xffffff, 2, 60, 1);
  light.position.set(0, 0, 45);
  scene.add(light);
}
{
  let light = new THREE.PointLight(0xffffff, 2, 60, 1);
  light.position.set(45, 0, 0);
  scene.add(light);
}
{
  let light = new THREE.PointLight(0xffffff, 2, 60, 1);
  light.position.set(-45, 0, 0);
  scene.add(light);
}
let walls: THREE.Mesh[] = [];
const fbxLoader = new FBXLoader();
let objects: THREE.Mesh[] = [];
let count = 0;
const wallBorderMap = new Map<string, WallBorder>();
fbxLoader.load(
  // "resources/interior-4.fbx",
  // "resources/int5.fbx",
  'resources/intmodified.fbx',
  (obj) => {
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        let mesh = child as THREE.Mesh<
          THREE.BufferGeometry,
          THREE.MeshLambertMaterial
        >;
        mesh.material.side = THREE.DoubleSide;
        mesh.material.reflectivity = 0;
        mesh.material.refractionRatio = 0.3;
        mesh.updateMatrix();
        mesh.updateMatrixWorld(true);
        if (mesh.name.toLowerCase().includes('wall')) {
          //

          mesh.material.color = new THREE.Color(0x1f6f8f);
          mesh.position.y = 2.8;
          walls.push(mesh);
        } else {
          if (mesh.name.toLowerCase().includes('floor')) {
            mesh.material.color = new THREE.Color(0xdfaf00);
          } else {
            mesh.material.color = new THREE.Color(0xffffff);
          }
          objects.push(mesh);
        }
        ++count;

        if (count == 38) {
          walls.forEach((item) => {
            item.updateMatrix();
            // console.log(item.geometry.attributes.position);
            scene.add(item);
          });
          walls.forEach((item) => {
            let wb = new WallBorder(item);
            wallBorderMap.set(item.name, wb);
          });
          objects.forEach((item) => {
            item.updateMatrix();
            scene.add(item);
            // console.log(item.name);
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
    'resources/door.fbx',
    (obj: THREE.Object3D<THREE.Event>) => {
      obj.traverse(function (child) {
        if ((child as THREE.Mesh).isMesh) {
          let door = child as THREE.Mesh;
          door.name = 'door';
          door.geometry.scale(1, 1, 4);
          (door.material as THREE.MeshLambertMaterial).color = new THREE.Color(
            0xff0000
          );
          (door.material as THREE.MeshLambertMaterial).side = THREE.DoubleSide;
          (door.material as THREE.MeshLambertMaterial).needsUpdate = true;

          door.position.set(0, 5, 0);
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

function adjustDoor() {
  doors.forEach((door) => {
    door.updateMatrix();
    let doorBox = new WallBorder(door);
    door.position.y = doorBox.getHeight() / 2;
    walls.forEach((wall, idx) => {
      if (!wall.name.toLowerCase().includes('outer')) {
        let wallBox = wallBorderMap.get(wall.name);
        if (wallBox) {
          if (
            wall.position.z + 2 > door.position.z &&
            wall.position.z - 2 < door.position.z &&
            wallBox.getWidth() > wallBox.getDepth() &&
            wallBox.xMin < door.position.x &&
            wallBox.xMax > door.position.x
          ) {
            door.position.z = wall.position.z + 0.15;
          } else {
          }
        }
      }
    });
  });
}

function adjustWindow() {
  windows.forEach((window) => {
    window.updateMatrix();
    let windowBox = new WallBorder(window);
    // window.position.y = windowBox.getHeight() / 2;
    walls.forEach((wall, idx) => {
      if (!wall.name.toLowerCase().includes('outer')) {
        let wallBox = wallBorderMap.get(wall.name);
        if (wallBox) {
          let name = 'wallsub' + wall.name;
          if (
            wall.position.z + 2 > window.position.z &&
            wall.position.z - 2 < window.position.z &&
            wallBox.getWidth() > wallBox.getDepth() &&
            wallBox.xMin < window.position.x &&
            wallBox.xMax > window.position.x
          ) {
            scene.children
              .filter((item) => item.name == name)
              .forEach((item) => scene.remove(item));
            window.position.z = wall.position.z + 0.15;
            wall.updateMatrix();
            window.updateMatrix();

            const sRes = CSG.subtract(wall, window);
            sRes.name = name;
            sRes.position.set(
              wall.position.x,
              wall.position.y,
              wall.position.z
            );
            wall.visible = false;
            scene.add(sRes);
          } else {
            scene.children
              .filter((item) => item.name == name)
              .forEach((item) => scene.remove(item));
            wall.visible = true;
          }
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
  // console.log(mouse);

  raycaster.setFromCamera(mouse, camera);
  const intersects: THREE.Intersection[] = raycaster.intersectObjects(
    scene.children
  );

  if (intersects.length > 0) {
    let item = intersects[0];
    // console.log(item);
    if (item.object.name.toLowerCase().includes('wall')) {
      let d: DialogInt = new Dialog(
        item.object as THREE.Mesh,
        'Wall',
        meshCache
      );
      d.addDialog();
    } else if (item.object.name.toLowerCase().includes('floor')) {
      let d: DialogInt = new Dialog(
        item.object as THREE.Mesh,
        'Floor',
        meshCache
      );
      d.addDialog();
    } else if (item.object.name.toLowerCase().includes('door')) {
      let d: DialogInt = new Dialog(
        item.object as THREE.Mesh,
        'Door',
        meshCache
      );
      d.addDialog();
    } else if (item.object.name.toLowerCase().includes('window')) {
      let d: DialogInt = new Dialog(
        item.object as THREE.Mesh,
        'Window',
        meshCache
      );
      d.addDialog();
    }
  }
}

let groundG = new THREE.PlaneBufferGeometry(1000, 1000, 100, 100);
let tex = new THREE.TextureLoader().load('resources/grass.jpg');
tex.wrapS = THREE.RepeatWrapping;
tex.wrapT = THREE.RepeatWrapping;
tex.repeat.set(100, 100);
let groundM = new THREE.MeshBasicMaterial({ map: tex });
let ground = new THREE.Mesh(groundG, groundM);
ground.rotation.x -= Math.PI / 2;
ground.position.y = -0.2;
ground.receiveShadow = true;
ground.castShadow = true;
scene.add(ground);

function animate() {
  requestAnimationFrame(animate);

  if (doors.length > 0) adjustDoor();
  if (windows.length > 0) adjustWindow();
  controls.update();
  envManager.render();

  stats.update();
}

animate();

document.getElementById('addDoor')?.addEventListener('click', addDoor);
document.getElementById('addWindow')?.addEventListener('click', addWindow);
