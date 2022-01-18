import * as THREE from 'three';
import { DialogInt } from './DialogInt';

export class Dialog implements DialogInt {
  meshItem: THREE.Mesh;
  constructor(
    item: THREE.Mesh,
    private type: string,
    private meshCache: THREE.Mesh[]
  ) {
    this.meshItem = item;
    if (!meshCache.includes(this.meshItem)) meshCache.push(this.meshItem);
  }

  addDialog(): void {
    document.querySelectorAll('.dialog').forEach((d) => d.remove());
    this.meshCache.forEach((mesh) => {
      this.adjustTransparency(mesh);
    });
    (this.meshItem.material as THREE.MeshLambertMaterial).transparent = true;
    (this.meshItem.material as THREE.MeshLambertMaterial).opacity = 0.5;

    let dialog = this.createElement('div', 'dialog', 'dialog');

    dialog.innerHTML = `
            <div class="title">Pick ${this.type}'s color </div>
            <div class="set">
                <span class="setItem" style="background-color:rgb(31,111,143)"></span>
                <span class="setItem" style="background-color:rgb(223,175,0)"></span>
                <span class="setItem" style="background-color:rgb(249,249,251)"></span>
                <span class="setItem" style="background-color:rgb(253,244,227)"></span>
                <span class="setItem" style="background-color:rgb(253,100,100)"></span>
                <span class="setItem" style="background-color:rgb(63,0,0)"></span>
            </div>
                </div>

            <div class="actionBtns">
                <button id="cancel" class="action">Cancel</button>
                <button id="confirm" class="action">Confirm</button>
            </div>
        `;
    document.body.appendChild(dialog);
    let selItems = document.querySelectorAll('.setItem');
    let selected = '';
    selItems.forEach((item) => {
      item.addEventListener('click', () => {
        selItems.forEach((i) => i.classList.remove('selected'));
        item.classList.add('selected');

        selected = (item as HTMLElement).style.backgroundColor;
        console.log(selected);
      });
    });
    let cancel = document.getElementById('cancel');
    let confirm = document.getElementById('confirm');
    cancel?.addEventListener('click', () => {
      this.adjustTransparency(this.meshItem);
      dialog.remove();
    });
    confirm?.addEventListener('click', () => {
      if (selected) {
        (this.meshItem.material as THREE.MeshLambertMaterial).color =
          new THREE.Color(selected);
        this.adjustTransparency(this.meshItem);
      }
      dialog.remove();
    });
  }

  createElement(type: string, id?: string, classNames?: string) {
    let el = document.createElement(type);
    if (id) el.id = id;
    if (classNames) {
      classNames.split(',').forEach((c) => el.classList.add(c));
    }
    return el;
  }

  private adjustTransparency(mesh: THREE.Mesh) {
    if (mesh.name.toLowerCase().includes('window')) {
      (mesh.material as THREE.MeshLambertMaterial).transparent = true;
      (mesh.material as THREE.MeshLambertMaterial).opacity = 0.2;
    } else {
      (mesh.material as THREE.MeshLambertMaterial).transparent = false;
      (mesh.material as THREE.MeshLambertMaterial).opacity = 1;
    }
    (mesh.material as THREE.MeshLambertMaterial).needsUpdate = true;
  }
}
