import Graphic from '@arcgis/core/Graphic';

export class PoiMarker extends HTMLElement {
  private map?: HTMLArcgisMapElement;
  private button?: HTMLCalciteButtonElement;
  private clickHandler?: IHandle;
  private poiModeEnabled: boolean = false;
  private clickEventListener: (event: MouseEvent) => void;

  constructor() {
    super();

    this.button = document.createElement('calcite-button');
    this.button.innerHTML = 'Add point';
    this.clickEventListener = (event: MouseEvent) => this.togglePoiMode(event);

    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(this.button);
  }

  connectedCallback() {
    this.map = this.closest('arcgis-map') as HTMLArcgisMapElement;
    this.clickHandler = this.map?.view?.on('click', (evt) => this.addMarker(evt));

    this.button?.addEventListener('click', this.clickEventListener);
  }

  disconnectedCallback() {
    this.clickHandler?.remove();

    this.button?.removeEventListener('click', this.clickEventListener);
  }

  togglePoiMode(event: MouseEvent) {
    this.poiModeEnabled = !this.poiModeEnabled;
    (event.target as HTMLCalciteButtonElement).innerHTML = this.poiModeEnabled ? 'Stop adding points' : 'Add point';
    if (this.map) {
      this.map.view.closePopup();
      this.map.view.popupEnabled = !this.poiModeEnabled;
    }
  }

  addMarker(event: __esri.ViewClickEvent) {
    if (!this.poiModeEnabled || !this.map) {
      return;
    }

    const markerSymbol = {
      type: "simple-marker",
      style: "diamond",
      size: "14",
      color: [0, 0, 255],
      outline: {
        color: [0, 255, 255],
        width: 2
      }
    };

    const pointGraphic = new Graphic({
      geometry: event.mapPoint,
      symbol: markerSymbol
    });

    this.map.view.graphics.add(pointGraphic);
  }
}

window.customElements.define('poi-marker', PoiMarker);