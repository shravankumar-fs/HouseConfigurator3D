import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
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
import { EditPanelGroup } from './Controllers/EditPanelWindow';

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
controls.target.set(5, 5, 0);

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
house.name = 'house';
fbxLoader.load(
  'models/interior.fbx',
  (obj) => {
    let totalHouseChildren = 0;
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        totalHouseChildren++;
      }
    });

    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        let mesh = child as THREE.Mesh<
          THREE.BufferGeometry,
          THREE.MeshLambertMaterial
        >;

        mesh.material = mesh.material.clone();
        mesh.material.side = THREE.DoubleSide;
        mesh.material.reflectivity = 0;
        mesh.material.refractionRatio = 0;
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
          // if (!mesh.name.toLowerCase().includes('roof'))
          objects.push(mesh);
        }
        ++count;
        if (count === totalHouseChildren) {
          walls.forEach((item) => {
            house.add(item.wall);
          });
          walls.forEach((item) => {
            wallBorderMap.set(item.name, item);
          });
          objects.forEach((item) => {
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

          // addButtons();
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
      window.position.set(10, 3, 10);
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
      window.matrixWorldNeedsUpdate = true;
      window.updateMatrixWorld(true);
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
      // house.updateMatrix();
      // house.scale.z += delta / 12;
      // house.children
      //   .filter((item) => item.name.toLowerCase().includes('wall'))
      //   .forEach((item) => {
      //     let itemClone = (item as THREE.Mesh).clone();
      //     walls.filter((i) => i.name === item.name)[0].oWall = itemClone;
      //     walls.filter((i) => i.name === item.name)[0].wall = itemClone;
      //   });
      walls
        .filter((item) => item.type == 'side')
        .forEach((item) => {
          item.wall.scale.z += delta / 2;
          if (item.wall.position.z > 0) {
            item.wall.position.z += delta / 4;
          } else if (item.wall.position.z < 0) {
            item.wall.position.z -= delta / 4;
          }
          item.wall.updateMatrix();
        });
      walls
        .filter((item) => item.type == 'main')
        .forEach((item) => {
          let pos = item.oWall.position;
          let dist = pos.z;
          console.log((delta / 2) * Math.abs(dist));
          if (pos.z > 0) {
            item.wall.position.z += (delta / 2) * Math.abs(dist);
          } else if (pos.z < 0) {
            item.wall.position.z -= (delta / 2) * Math.abs(dist);
          }
          item.wall.updateMatrix();
        });
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
      house.scale.x += delta / 15;
      house.updateMatrix();
      house.children.forEach((child) => {
        let isWall = wallBorderMap.get(child.name);
        let isMainWall = false;
        let isSideWall = false;
        if (isWall && isWall.type == 'main') {
          isMainWall = true;
          // isWall.wall.visible = false;
        } else if (isWall && isWall.type == 'side') {
          isSideWall = true;
          // isWall.wall.visible = false;
        }
        if (
          !isMainWall &&
          !child.name.toLowerCase().includes('floor') &&
          !child.name.toLowerCase().includes('roof')
        ) {
          let x = 1 / house.scale.x;
          let y = child.scale.y;
          let z = child.scale.z;
          console.log((child as THREE.Mesh).geometry);

          // child.updateMatrix();
          child.scale.x = x;
          // child.updateMatrix();
          // if (!child.name.toLowerCase().includes('wall')) {
          //   child.position.x += delta / 15;
          // }
        } else {
        }
      });
      console.log('ok true');

      // house.children
      //   .filter((item) => item.name.toLowerCase().includes('wall'))
      //   .forEach((item) => {
      //     let itemClone = (item as THREE.Mesh).clone();
      //     // walls.filter((i) => i.name === item.name)[0].oWall = itemClone;
      //     // walls.filter((i) => i.name === item.name)[0].wall = itemClone;
      //   });

      // walls
      //   .filter((wall) => wall.type === 'side')
      //   .forEach((item) => {
      //     item.wall.scale.x -= delta / 12;
      //     item.wall.updateMatrix();
      //   });

      // walls
      //   .filter((item) => item.type == 'main')
      //   .forEach((item) => {
      //     item.wall.scale.x += delta / 2;
      //     if (item.wall.position.x > 0) {
      //       item.wall.position.x += delta / 4;
      //     } else if (item.wall.position.x < 0) {
      //       item.wall.position.x -= delta / 4;
      //     }
      //     item.wall.updateMatrix();
      //   });
      // walls
      //   .filter(
      //     (item) =>
      //       item.type == 'side' &&
      //       ((item.oWall.position.x > xx - 2 &&
      //         item.oWall.position.x < xx + 2) ||
      //         (item.oWall.position.x > xm - 2 &&
      //           item.oWall.position.x < xm + 2))
      //   )
      // .forEach((item) => {
      //   let pos = item.oWall.position;
      //   let gamma = (delta / 4) * 4;
      //   if (pos.x > 0) {
      //     item.wall.position.x += gamma;
      //   } else if (pos.x < 0) {
      //     item.wall.position.x -= gamma;
      //   }
      // });
      b.pastDistance = b.presentDistance;
    }
    // else if (b.type === 'y') {
    //   eventObject.position.x = 0;
    //   eventObject.position.z = 0;
    //   if (eventObject.position.y < b.getMin()) {
    //     eventObject.position.y = b.getMin();
    //   }
    //   if (eventObject.position.y > b.getMax()) {
    //     eventObject.position.y = b.getMax();
    //   }
    //   b.presentDistance = b.getDistance();
    //   let delta = b.presentDistance - b.pastDistance;
    //   house.updateMatrix();
    //   house.scale.y += delta / 12;
    //   house.children
    //     .filter((item) => item.name.toLowerCase().includes('wall'))
    //     .forEach((item) => {
    //       let itemClone = (item as THREE.Mesh).clone();
    //       walls.filter((i) => i.name === item.name)[0].oWall = itemClone;
    //       walls.filter((i) => i.name === item.name)[0].wall = itemClone;
    //     });
    //   b.pastDistance = b.presentDistance;
    // }
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
            boundaryBox.getDepth() * 12
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
            boundaryBox.getWidth() * 12,
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
  let canvasBounds = renderer.context.canvas.getBoundingClientRect();

  const mouse = {
    x:
      ((event.clientX - canvasBounds.left) /
        (canvasBounds.right - canvasBounds.left)) *
        2 -
      1,
    y:
      -(
        (event.clientY - canvasBounds.top) /
        (canvasBounds.bottom - canvasBounds.top)
      ) *
        2 +
      1,
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
          let dialog = new EditPanelGroup(
            item.object.parent as THREE.Group,
            'Window',
            'frame'
          );
          dialog.add();
        }
      });
    }
  }
}

let time = 50;
let prev = Date.now();
function animate() {
  let nTime = Date.now();
  let delta = nTime - prev;
  prev = nTime;
  if (delta > time) requestAnimationFrame(animate);
  else
    setTimeout(() => {
      requestAnimationFrame(animate);
    }, time - delta);
  // if (doorsWindows.length > 0)
  adjustDoorAndWindow();
  controls.update();

  if (Math.random() > 0.8) envManager.render();
}

animate();
document.getElementById('addDoor')?.addEventListener('click', addDoor);
document.getElementById('addWindow')?.addEventListener('click', addWindow);
let arrows: THREE.Mesh[] = [];
function addButtons() {
  createScaleButton('scaleBtn1');
  createScaleButton('scaleBtn2');
  // createScaleButton('scaleBtn3');

  setTimeout(() => {
    {
      let button = arrows[0];
      button.position.set(xx + 7, 0.1, 0);
      button.rotation.z += Math.PI / 2;
      button.rotation.y += Math.PI / 2;
      scene.add(button);
      draggable.push(button);
      let scaleButton = new ScaleButton(button, xx + 7, xx + 13, 'x');
      mapScale.set(button.name, scaleButton);
    }
    {
      let button = arrows[1];
      button.position.set(0, 0.1, zx + 7);
      button.rotation.x += Math.PI / 2;
      scene.add(button);
      draggable.push(button);
      let scaleButton = new ScaleButton(button, zx + 7, zx + 13, 'z');
      mapScale.set(button.name, scaleButton);
    }
    // {
    //   let button = arrows[2];
    //   button.position.set(0, yx + 7, 0);
    //   scene.add(button);
    //   draggable.push(button);
    //   let scaleButton = new ScaleButton(button, yx + 7, yx + 13, 'y');
    //   mapScale.set(button.name, scaleButton);
    // }
  }, 1000);
}

function createScaleButton(name: string) {
  fbxLoader.load(
    'models/arrow.fbx',
    (obj: THREE.Object3D<THREE.Event>) => {
      obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          let arrow = child as THREE.Mesh;
          arrow.material = new THREE.MeshBasicMaterial();
          (arrow.material as THREE.MeshBasicMaterial).color = new THREE.Color(
            0xff0000
          );
          (arrow.material as THREE.MeshBasicMaterial).side = THREE.DoubleSide;
          (arrow.material as THREE.MeshBasicMaterial).transparent = true;
          (arrow.material as THREE.MeshBasicMaterial).opacity = 0.5;
          (arrow.material as THREE.MeshBasicMaterial).needsUpdate = true;
          arrow.name = name;
          // arrows.push(arrow);
          arrow.scale.set(0.2, 0.2, 0.2);
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

// let mass = ['none', 'outer_wall', 'inner_wall'];

// document.getElementById('massSel')?.addEventListener('change', () => {
//   let selected =
//     mass[+(document.getElementById('massSel') as HTMLSelectElement).value];
//   if (selected != 'none') {
//     let name = selected.replace('_', ' ');
//     let dialog = new EditPanelGroup(house, name, selected, true);
//     dialog.add();
//   }
// });

document.getElementById('outerwallchange')?.addEventListener('click', () => {
  let name = 'Exterior';
  let dialog = new EditPanelGroup(house, name, 'outer_wall', true);
  dialog.add();
});
document.getElementById('innerwallchange')?.addEventListener('click', () => {
  let name = 'Interior';
  let dialog = new EditPanelGroup(house, name, 'inner_wall', true);
  dialog.add();
});
document.getElementById('floorchange')?.addEventListener('click', () => {
  const floor = house.children.filter((item) =>
    item.name.toLowerCase().includes('floor')
  )[0];
  let dialog = new EditPanel(floor as THREE.Mesh, 'Floor', meshCache);
  dialog.add();
});

const controlsPointerLock = new PointerLockControls(
  camera,
  renderer.domElement
);
let oldpos = camera.position.clone();
controlsPointerLock.addEventListener('lock', () => {
  oldpos = camera.position.clone();

  controls.enabled = false;
  dControls.enabled = false;
});
controlsPointerLock.addEventListener('unlock', () => {
  controls.enabled = true;
});

document.getElementById('3dview')?.addEventListener('click', () => {
  controlsPointerLock.lock();
});

const onKeyDown = function (event: KeyboardEvent) {
  if (controlsPointerLock.isLocked) {
    switch (event.code) {
      case 'KeyW':
        controlsPointerLock.moveForward(1);
        break;
      case 'KeyA':
        controlsPointerLock.moveRight(-1);
        break;
      case 'KeyS':
        controlsPointerLock.moveForward(-1);
        break;
      case 'KeyD':
        controlsPointerLock.moveRight(1);
        break;
    }
  }
};
document.addEventListener('keydown', onKeyDown, false);
