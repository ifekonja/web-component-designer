import { html } from "@node-projects/base-custom-webcomponent";
import { IDesignItem } from "../../../../item/IDesignItem";
import { IDesignerCanvas } from "../../IDesignerCanvas";
import { AbstractExtension } from "../AbstractExtension.js";
import { ExtensionType } from "../ExtensionType.js";
import { IExtensionManager } from "../IExtensionManger";
import { OverlayLayer } from "../OverlayLayer.js";

export class EditTextWithStyloExtension extends AbstractExtension {

  private _contentEditedBound: any;
  private _blurBound: any;

  private static template = html`
    <stylo-editor></stylo-editor>
  `;
  private _resizeObserver: ResizeObserver;
  private _rect1: SVGRectElement;
  private _rect2: SVGRectElement;
  private _rect3: SVGRectElement;
  private _rect4: SVGRectElement;

  constructor(extensionManager: IExtensionManager, designerView: IDesignerCanvas, extendedItem: IDesignItem) {
    super(extensionManager, designerView, extendedItem);
    import('@papyrs/stylo/dist/esm/loader.js').then(d => d.defineCustomElements());
  }

  override extend() {
    this.extendedItem.instanceServiceContainer.selectionService.clearSelectedElements();
    this.extendedItem.element.setAttribute('contenteditable', 'true');
    this.extendedItem.element.addEventListener('input', this._contentEditedBound);
    this.extendedItem.element.addEventListener('blur', this._blurBound);
    (<HTMLElement>this.extendedItem.element).focus();
    this.designerCanvas.eatEvents = this.extendedItem.element;

    const elements = <SVGGraphicsElement>(<any>EditTextWithStyloExtension.template.content.cloneNode(true));

    let foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    foreignObject.setAttribute('x', '0');
    foreignObject.setAttribute('y', '0');
    foreignObject.setAttribute('width', '100%');
    foreignObject.setAttribute('height', '100%');
    foreignObject.appendChild(elements)
    this.overlayLayerView.addOverlay(foreignObject, OverlayLayer.Foregorund);
    this.overlays.push(foreignObject);

    this._drawClickOverlayRects();
    this._rect1.addEventListener('pointerdown', (e) => this._clickOutside(e));
    this._rect1.addEventListener('pointerup', (e) => this._clickOutside(e));
    this._rect2.addEventListener('pointerdown', (e) => this._clickOutside(e));
    this._rect2.addEventListener('pointerup', (e) => this._clickOutside(e));
    this._rect3.addEventListener('pointerdown', (e) => this._clickOutside(e));
    this._rect3.addEventListener('pointerup', (e) => this._clickOutside(e));
    this._rect4.addEventListener('pointerdown', (e) => this._clickOutside(e));
    this._rect4.addEventListener('pointerup', (e) => this._clickOutside(e));

    requestAnimationFrame(() => {
      const stylo = foreignObject.querySelector('stylo-editor');
      //@ts-ignore
      stylo.containerRef = this.extendedItem.element;
      //@ts-ignore
      stylo.config = {
        dontInjectHeadCss: true
      };
    });
    this.designerCanvas.clickOverlay.style.pointerEvents = 'none';

    this._resizeObserver = new ResizeObserver(() => this._drawClickOverlayRects());
    this._resizeObserver.observe(this.extendedItem.element);
  }

  private _drawClickOverlayRects() {
    const normalized = this.designerCanvas.getNormalizedElementCoordinates(this.extendedItem.element);

    this._rect1 = this._drawRect(0, 0, this.designerCanvas.containerBoundingRect.width, normalized.y, 'svg-transparent', this._rect1, OverlayLayer.Normal);
    this._rect2 = this._drawRect(0, 0, normalized.x, this.designerCanvas.containerBoundingRect.height, 'svg-transparent', this._rect2, OverlayLayer.Normal);
    this._rect3 = this._drawRect(normalized.x + normalized.width, 0, this.designerCanvas.containerBoundingRect.width, this.designerCanvas.containerBoundingRect.height, 'svg-transparent', this._rect3, OverlayLayer.Normal);
    this._rect4 = this._drawRect(0, normalized.y + normalized.height, this.designerCanvas.containerBoundingRect.width, this.designerCanvas.containerBoundingRect.height, 'svg-transparent', this._rect4, OverlayLayer.Normal);
  }

  override refresh() {
    this.dispose();
  }

  override dispose() {
    this._resizeObserver.disconnect();
    this._removeAllOverlays();
    this.extendedItem.element.removeAttribute('contenteditable');
    this.designerCanvas.eatEvents = null;
    this.extendedItem.updateChildrenFromNodesChildren();
    this.designerCanvas.clickOverlay.style.pointerEvents = 'auto';
  }

  _clickOutside(e) {
    this.extendedItem.innerHTML = this.extendedItem.element.innerHTML;
    //TODO: the extension should remove itself, not the doubleclick extensions
    //      cause the extension could be applied in another way
    //maybe also the removal is maybe not desired (for example if it's permanet extension)
    this.extensionManager.removeExtension(this.extendedItem, ExtensionType.Doubleclick);
  }
}