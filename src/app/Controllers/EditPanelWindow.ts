import * as THREE from 'three';

export class EditPanelGroup {
  meshItem: THREE.Group;
  materialPanel!: HTMLDivElement;

  constructor(
    item: THREE.Group,
    private type: string,
    private editElement: string,
    private singleMesh?: boolean
  ) {
    this.meshItem = item;
    document.getElementById('materialPanel')?.remove();
    this.materialPanel = document.createElement('div');
    this.materialPanel.classList.add('materialPanel');
    this.materialPanel.id = 'materialPanel';
    document.body.append(this.materialPanel);
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
    let dialog = this.createElement('div', 'dialog', 'dialog');
    this.fillDialogueContent(dialog as HTMLDivElement);
    this.materialPanel.appendChild(dialog);

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
      this.materialPanel.remove();
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
              if ((childObj.material as THREE.MeshPhongMaterial[]).length > 1) {
                (childObj.material as THREE.MeshPhongMaterial[])
                  .filter((item) =>
                    item.name.toLowerCase().includes(this.editElement)
                  )
                  .forEach((mat) => {
                    mat.map = text;
                    mat.needsUpdate = true;
                  });
              } else if (
                childObj.name.toLowerCase().includes(this.editElement)
              ) {
                let text = new THREE.TextureLoader().load(selectedTexture);
                text.wrapS = THREE.RepeatWrapping;
                text.wrapT = THREE.RepeatWrapping;
                // text.repeat.set(6, 6);
                (childObj.material as THREE.MeshPhongMaterial).map = text;
                (childObj.material as THREE.MeshPhongMaterial).needsUpdate =
                  true;
              }
            }
          });
        } else {
          this.meshItem.traverse((child) => {
            let childObj = child as THREE.Mesh;
            if (childObj.isMesh) {
              if ((childObj.material as THREE.MeshPhongMaterial[]).length > 1) {
                (childObj.material as THREE.MeshPhongMaterial[])
                  .filter((item) =>
                    item.name.toLowerCase().includes(this.editElement)
                  )
                  .forEach((mat) => {
                    mat.map = null;
                    mat.needsUpdate = true;
                  });
              } else if (
                childObj.name.toLowerCase().includes(this.editElement)
              ) {
                // text.repeat.set(6, 6);
                (childObj.material as THREE.MeshPhongMaterial).map = null;
                (childObj.material as THREE.MeshPhongMaterial).needsUpdate =
                  true;
              }
            }
          });
        }
      }
      if (selectedColor) {
        this.meshItem.traverse((child) => {
          let childObj = child as THREE.Mesh;
          if (childObj.isMesh) {
            if ((childObj.material as THREE.MeshPhongMaterial[]).length > 1) {
              (childObj.material as THREE.MeshPhongMaterial[])
                .filter((item) =>
                  item.name.toLowerCase().includes(this.editElement)
                )
                .forEach((mat) => {
                  mat.color = new THREE.Color(selectedColor);
                  mat.needsUpdate = true;
                });
            } else if (childObj.name.toLowerCase().includes(this.editElement)) {
              (childObj.material as THREE.MeshPhongMaterial).color =
                new THREE.Color(selectedColor);
              (childObj.material as THREE.MeshPhongMaterial).needsUpdate = true;
            }
          }
        });
      }

      this.materialPanel.remove();
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
    // let title = this.createElement('div', 'dcTitle', 'title');
    // title.innerHTML = `${this.type} Color`;
    // colorDialogue.appendChild(title);

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
    // let title = this.createElement('div', 'dtTitle', 'title');
    // title.innerHTML = `${this.type} Texture`;
    // textureDialogue.appendChild(title);

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
    cancel.innerHTML = '<img src="images/icons/cancel.svg"/>';
    let confirm = this.createElement('button', 'confirm', 'action');
    confirm.innerHTML = `<img src="images/icons/confirm.svg"/>`;
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
