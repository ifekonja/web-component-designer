import { EventNames } from '../../../../enums/EventNames.js';
import { IPoint } from '../../../../interfaces/IPoint.js';
import { cssMatrixToMatrixArray, extractRotationAngleFromDOMMatrix, getDesignerCanvasNormalizedTransformedCornerDOMPoints, getRotationAngleFromMatrix, getRotationMatrix3d, rotateElementByMatrix3d } from '../../../helper/TransformHelper.js';
import { IDesignItem } from '../../../item/IDesignItem.js';
import { IDesignerCanvas } from '../IDesignerCanvas.js';
import { AbstractExtension } from './AbstractExtension.js';
import { IExtensionManager } from './IExtensionManger.js';

export class RotateExtension extends AbstractExtension {

  private _initialPoint: IPoint;
  private _rotateIcon: any;
  private _initialElementAngle: number;
  private _initialOverlayAngle: number;
  private _textAngle: [SVGFilterElement, SVGFEFloodElement, SVGTextElement, SVGTextElement];
  private _actualRotationAngle: number;

  constructor(extensionManager: IExtensionManager, designerView: IDesignerCanvas, extendedItem: IDesignItem) {
    super(extensionManager, designerView, extendedItem);
  }

  override extend() {
    this.refresh();
  }

  override refresh() {
    const rect = this.extendedItem.element.getBoundingClientRect();
    this._actualRotationAngle = getRotationAngleFromMatrix(null, new DOMMatrix((<HTMLElement>this.extendedItem.element).style.transform));
    this._rotateIcon = this._drawRotateOverlay(rect, this._rotateIcon);
  }

  _drawRotateOverlay(itemRect: DOMRect, oldRotateIcon: any) {
    let transformedCornerPoints: DOMPoint[] = getDesignerCanvasNormalizedTransformedCornerDOMPoints(<HTMLElement>this.extendedItem.element, { x: 10, y: 10 }, this.designerCanvas);
    let rotateIconPosition: DOMPoint = transformedCornerPoints[0];

    if (!oldRotateIcon) {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      const line = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      line.setAttribute('r', <string><any>(7.5));
      line.setAttribute('class', 'svg-primary-rotate');
      line.setAttribute('style', 'cursor: grabbing');
      g.appendChild(line)
      const g2 = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g2.setAttribute('transform', 'translate(-8,0) scale(0.0015,-0.0015)');
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute('style', 'fill: white');
      path.setAttribute('d', 'M5260,4367.9c-1803.6-157-3329.6-1457-3771.9-3212.8c-34.5-135.9-72.7-331.2-86.2-430.8c-11.5-99.6-24.9-201-30.6-224l-7.7-44H731.8c-528.4,0-631.8-3.8-631.8-26.8c0-42.1,2029.5-2042.9,2104.2-2073.6c36.4-15.3,86.2-21.1,118.7-15.3c40.2,9.6,346.6,300.6,1089.4,1037.7C3981-58.8,4446.3,414.2,4446.3,429.5c0,23-103.4,26.8-620.3,26.8c-342.7,0-626.1,5.7-629.9,15.3c-13.4,21.1,38.3,245.1,93.8,415.5c114.9,348.5,319.7,681.6,582.1,947.8c478.7,484.4,1062.6,731.4,1742.3,735.2c317.8,0,482.5-23,765.9-114.9c402.1-128.3,725.7-331.2,1022.4-641.4c455.7-474.8,687.4-1047.3,687.4-1702.1c-1.9-693.1-254.6-1284.7-754.4-1771c-396.3-384.9-882.7-614.6-1430.3-679.7c-141.7-17.2-195.3-32.6-227.9-63.2l-44-38.3v-811.8v-811.8l49.8-49.8c49.8-47.9,53.6-49.8,243.2-36.4c1606.4,105.3,3048.1,1146.9,3658.9,2646c453.8,1112.4,415.5,2379.9-105.3,3463.6c-360,752.5-953.5,1397.7-1677.3,1828.5c-515,308.3-1139.2,513.1-1746.2,574.4C5872.7,4379.4,5438.1,4383.3,5260,4367.9z');
      g2.appendChild(path);
      g.appendChild(g2);

      g.addEventListener(EventNames.PointerDown, event => this._pointerActionTypeRotate(event));
      g.addEventListener(EventNames.PointerMove, event => this._pointerActionTypeRotate(event));
      g.addEventListener(EventNames.PointerUp, event => this._pointerActionTypeRotate(event));

      g.setAttribute('class', 'svg-primary-rotate');
      g.setAttribute('transform', 'translate(' + rotateIconPosition.x + ',' + rotateIconPosition.y + ') scale(' + 1 / this.designerCanvas.scaleFactor + ')');
      this._addOverlay(g);
      return g;
    } else {
      oldRotateIcon.setAttribute('transform', 'translate(' + rotateIconPosition.x + ',' + rotateIconPosition.y + ') scale(' + 1 / this.designerCanvas.scaleFactor + ')');
      return oldRotateIcon;
    }
  }

  _pointerActionTypeRotate(event: PointerEvent) {
    event.stopPropagation();
    const currentPoint = this.designerCanvas.getNormalizedEventCoordinates(event);

    switch (event.type) {
      case EventNames.PointerDown:
        const el = this.designerCanvas.getNormalizedElementCoordinates(this.extendedItem.element);

        let transformOriginInPx = {
          x: el.x + parseInt(getComputedStyle(this.extendedItem.element).transformOrigin.split(' ')[0].replace('px', '')),
          y: el.y + parseInt(getComputedStyle(this.extendedItem.element).transformOrigin.split(' ')[1].replace('px', ''))
        }

        this._initialPoint = currentPoint;
        this._initialElementAngle = getRotationAngleFromMatrix(cssMatrixToMatrixArray(getComputedStyle(this.extendedItem.element).transform), null);
        this._initialOverlayAngle = Math.atan2(currentPoint.y - transformOriginInPx.y, currentPoint.x - transformOriginInPx.x) * (180 / Math.PI);
        (<Element>event.target).setPointerCapture(event.pointerId);
        break;
      case EventNames.PointerMove:
        if (this._initialPoint) {
          const el = this.designerCanvas.getNormalizedElementCoordinates(this.extendedItem.element);

          let transformOriginInPx = {
            x: el.x + parseInt(getComputedStyle(this.extendedItem.element).transformOrigin.split(' ')[0].replace('px', '')),
            y: el.y + parseInt(getComputedStyle(this.extendedItem.element).transformOrigin.split(' ')[1].replace('px', ''))
          }

          let angle = Math.atan2(currentPoint.y - transformOriginInPx.y, currentPoint.x - transformOriginInPx.x) * (180 / Math.PI);
          angle = angle - this._initialOverlayAngle + this._initialElementAngle;
          angle *= -1;
          if (!event.ctrlKey)
            angle = Math.ceil(angle / 15) * 15
          const rotationMatrix3d = getRotationMatrix3d('z', angle);
          rotateElementByMatrix3d((<HTMLElement>this.extendedItem.element), rotationMatrix3d);

          const transformedCornerPoints = getDesignerCanvasNormalizedTransformedCornerDOMPoints(<HTMLElement>this.extendedItem.element, { x: 30, y: 30 }, this.designerCanvas);
          const angleTextPosition = transformedCornerPoints[0];
          this._textAngle = this._drawTextWithBackground(this._actualRotationAngle + '°', angleTextPosition.x, angleTextPosition.y, 'white', 'svg-rotate-text', this._textAngle);
          this._textAngle[2].style.fontSize = (12 / this.designerCanvas.scaleFactor) + 'px';
          this._textAngle[3].style.fontSize = (12 / this.designerCanvas.scaleFactor) + 'px';
        }
        this.extensionManager.refreshExtensions(this.designerCanvas.instanceServiceContainer.selectionService.selectedElements);
        break;
      case EventNames.PointerUp:
        let cg = this.extendedItem.openGroup("Rotate Elements");
        (<Element>event.target).releasePointerCapture(event.pointerId);

        let angle = extractRotationAngleFromDOMMatrix(new DOMMatrix((<HTMLElement>this.extendedItem.element).style.transform));
        (<HTMLElement>this.extendedItem.element).style.transform = angle == 0 ? '' : 'rotate(' + angle + 'deg)';
        
        this.extendedItem.setStyle('transform', (<HTMLElement>this.extendedItem.element).style.transform);

        cg.commit();

        this._textAngle.forEach(x => {
          this.designerCanvas.overlayLayer.removeOverlay(x);
        })
        this._textAngle = null;

        this._initialPoint = null;
        break;
    }
  }

  override dispose() {
    this._removeAllOverlays();
  }
}
