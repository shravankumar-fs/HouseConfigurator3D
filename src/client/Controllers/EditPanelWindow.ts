import * as THREE from 'three';

export class DialogWindow {
  meshItem: THREE.Group;
  constructor(item: THREE.Group, private type: string) {
    this.meshItem = item;
  }

  colors: string[] = [
    'rgb(31,111,143)',
    'rgb(223,175,0)',
    'rgb(249,249,251)',
    'rgb(253,244,227)',
    'rgb(253,100,100)',
    'rgb(63,0,0)',
    'rgb(10,255,255)',
    'rgb(100,255,50)',
  ];
  textures: string[] = [
    'images/wtext0.jpg',
    'images/wtext1.jpg',
    'images/wtext2.jpg',
    'images/wtext3.jpg',
    'images/wtext4.jpg',
    'images/wtext5.jpg',
  ];

  add(): void {
    document.querySelectorAll('.dialog').forEach((d) => d.remove());
    let dialog = this.createElement('div', 'dialog', 'dialog');
    this.fillDialogueContent(dialog as HTMLDivElement);
    document.getElementById('panel')?.appendChild(dialog);

    let selItems = document.querySelectorAll('.colorItem');
    let selectedColor = '';
    selItems.forEach((item) => {
      item.addEventListener('click', () => {
        selItems.forEach((i) => i.classList.remove('selected'));
        item.classList.add('selected');

        selectedColor = (item as HTMLElement).style.backgroundColor;
      });
    });

    let selTexture = document.querySelectorAll('.textureItem');
    let selectedTexture = '';
    selTexture.forEach((item) => {
      item.addEventListener('click', () => {
        selTexture.forEach((i) => i.classList.remove('selected'));
        item.classList.add('selected');

        let url = (item as HTMLElement).style.backgroundImage;
        selectedTexture = url.slice(4, -1).replace(/"/g, '');
      });
    });

    let cancel = document.getElementById('cancel');
    let confirm = document.getElementById('confirm');
    cancel?.addEventListener('click', () => {
      dialog.remove();
    });
    confirm?.addEventListener('click', () => {
      if (selectedTexture) {
        if (selectedTexture.indexOf('0') == -1) {
          let text = new THREE.TextureLoader().load(selectedTexture);
          text.wrapS = THREE.RepeatWrapping;
          text.wrapT = THREE.RepeatWrapping;
          this.meshItem.traverse((child) => {
            let childObj = child as THREE.Mesh;
            if (childObj.isMesh) {
              if (
                (childObj.material as THREE.MeshLambertMaterial[]).length > 0
              ) {
                (childObj.material as THREE.MeshLambertMaterial[])
                  .filter((item) => item.name.toLowerCase().includes('frame'))
                  .forEach((mat) => {
                    mat.map = text;
                    mat.needsUpdate = true;
                  });
              }
            }
          });
        } else {
          this.meshItem.traverse((child) => {
            let childObj = child as THREE.Mesh;
            if (childObj.isMesh) {
              if (
                (childObj.material as THREE.MeshLambertMaterial[]).length > 0
              ) {
                (childObj.material as THREE.MeshLambertMaterial[])
                  .filter((item) => item.name.toLowerCase().includes('frame'))
                  .forEach((mat) => {
                    mat.map = null;
                    mat.needsUpdate = true;
                  });
              }
            }
          });
        }
      }
      if (selectedColor) {
        this.meshItem.traverse((child) => {
          let childObj = child as THREE.Mesh;
          if (childObj.isMesh) {
            if ((childObj.material as THREE.MeshLambertMaterial[]).length > 0) {
              (childObj.material as THREE.MeshLambertMaterial[])
                .filter((item) => item.name.toLowerCase().includes('frame'))
                .forEach((mat) => {
                  mat.color = new THREE.Color(selectedColor);
                  mat.needsUpdate = true;
                });
            }
          }
        });
      }

      dialog.remove();
    });
  }

  fillDialogueContent(dialog: HTMLDivElement) {
    let colorSet = this.getDialogueColors();
    dialog.appendChild(colorSet);

    let textureSet = this.getDialogueTextures();
    dialog.appendChild(textureSet);

    let actions = this.getActionPanel();
    dialog.appendChild(actions);
  }

  private getDialogueColors() {
    let colorDialogue = this.createElement(
      'div',
      'colorDialogue',
      'subDialogue'
    );
    let title = this.createElement('div', 'dcTitle', 'title');
    title.innerHTML = `${this.type} Color`;
    colorDialogue.appendChild(title);

    let colorSet = this.createElement('div', 'colorSet', 'set');
    this.colors.forEach((color) => {
      let colorElement = this.createElement(
        'span',
        'color' + Math.random().toPrecision(3).replace('.', ''),
        'colorItem'
      );
      colorElement.style.background = color;
      colorSet.appendChild(colorElement);
    });
    colorDialogue.appendChild(colorSet);
    return colorDialogue;
  }

  private getDialogueTextures() {
    let textureDialogue = this.createElement(
      'div',
      'textureDialogue',
      'subDialogue'
    );
    let title = this.createElement('div', 'dtTitle', 'title');
    title.innerHTML = `${this.type} Texture`;
    textureDialogue.appendChild(title);

    let textureSet = this.createElement('div', 'textureSet', 'set');
    this.textures.forEach((texture) => {
      let textureElement = this.createElement(
        'span',
        'texture' + Math.random().toPrecision(3).replace('.', ''),
        'textureItem'
      );
      textureElement.style.background = `url(${texture}) center/cover`;
      textureSet.appendChild(textureElement);
    });
    textureDialogue.appendChild(textureSet);

    return textureDialogue;
  }

  private getActionPanel() {
    let actions = this.createElement('div', 'dActions', 'actionBtns');
    let cancel = this.createElement('button', 'cancel', 'action');
    cancel.innerHTML = 'Cancel';
    let confirm = this.createElement('button', 'confirm', 'action');
    confirm.innerHTML = 'Confirm';
    actions.appendChild(cancel);
    actions.appendChild(confirm);

    return actions;
  }

  private createElement(type: string, id?: string, classNames?: string) {
    let el = document.createElement(type);
    if (id) el.id = id;
    if (classNames) {
      classNames.split(',').forEach((c) => el.classList.add(c));
    }
    return el;
  }
}
