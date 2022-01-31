export class MainPanel {
  constructor() {}

  public registerPanelChange() {
    document
      .getElementById('themeSel')
      ?.addEventListener('change', this.changePanelColor);
  }

  private changePanelColor() {
    let panelBgcolors = [
      'linear-gradient(135deg,hsla(207, 43%, 55%, 0.8),hsla(207, 43%, 35%, 0.8))',
      'linear-gradient(135deg,hsla(291, 44%, 63%, 0.8),hsla(291, 44%, 33%, 0.8))',
      'linear-gradient(135deg,hsla(43, 74%, 49%,0.8),hsla(43, 74%, 29%,0.8))',
    ];
    let buttonBgColors = [
      'linear-gradient(135deg,hsla(207, 44%, 49%, 1),hsla(207, 44%, 20%, 1))',
      'linear-gradient(135deg,hsla(291, 44%, 63%, 1),hsla(291, 44%, 20%, 1))',
      'linear-gradient(135deg,hsla(43, 74%, 49%,1),hsla(43, 74%, 19%,1))',
    ];
    let buttonBgColorsRev = [
      'hsla(207, 44%, 20%, 1)',
      'hsla(291, 44%, 20%, 1)',
      'hsla(43, 74%, 19%,1)',
    ];

    let rootCSS = document.querySelector(':root') as HTMLElement;

    rootCSS.style.setProperty(
      '--bg-panel',
      panelBgcolors[
        +(document.getElementById('themeSel') as HTMLSelectElement).value
      ]
    );
    rootCSS.style.setProperty(
      '--bg-button',
      buttonBgColors[
        +(document.getElementById('themeSel') as HTMLSelectElement).value
      ]
    );
    rootCSS.style.setProperty(
      '--bg-button-rev',
      buttonBgColorsRev[
        +(document.getElementById('themeSel') as HTMLSelectElement).value
      ]
    );
  }
}
