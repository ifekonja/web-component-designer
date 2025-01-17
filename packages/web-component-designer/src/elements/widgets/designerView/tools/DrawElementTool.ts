import { EventNames } from '../../../../enums/EventNames.js';
import { IPoint } from '../../../../interfaces/IPoint.js';
import { IDesignItem } from '../../../item/IDesignItem.js';
import { IElementDefinition } from '../../../services/elementsService/IElementDefinition.js';
import { ServiceContainer } from '../../../services/ServiceContainer.js';
import { InsertAction } from '../../../services/undoService/transactionItems/InsertAction.js';
import { OverlayLayer } from '../extensions/OverlayLayer.js';
import { IDesignerCanvas } from '../IDesignerCanvas.js';
import { ITool } from './ITool.js';

export class DrawElementTool implements ITool {
  private _elementDefinition: IElementDefinition;
  private _createdItem: IDesignItem;
  private _startPosition: IPoint;

  readonly cursor = 'crosshair';
  private _rect: any;

  constructor(elementDefinition: IElementDefinition) {
    this._elementDefinition = elementDefinition;
  }

  activated(serviceContainer: ServiceContainer) {
  }

  dispose(): void {
    if (this._createdItem)
      this._createdItem.element.parentElement.removeChild(this._createdItem.element);
  }

  pointerEventHandler(designerView: IDesignerCanvas, event: PointerEvent, currentElement: Element) {
    switch (event.type) {
      case EventNames.PointerDown:
        this._onPointerDown(designerView, event);
        break;
      case EventNames.PointerMove:
        this._onPointerMove(designerView, event);
        break;
      case EventNames.PointerUp:
        this._onPointerUp(designerView, event);
        break;
    }
  }

  keyboardEventHandler(designerCanvas: IDesignerCanvas, event: KeyboardEvent, currentElement: Element) 
  { }

  private async _onPointerDown(designerView: IDesignerCanvas, event: PointerEvent) {
    event.preventDefault();
    this._startPosition = { x: event.x, y: event.y };

    this._createdItem = await designerView.serviceContainer.forSomeServicesTillResult("instanceService", (service) => service.getElement(this._elementDefinition, designerView.serviceContainer, designerView.instanceServiceContainer));
    const targetRect = (<HTMLElement>event.target).getBoundingClientRect();
    this._createdItem.setStyle('position', 'absolute');

    this._createdItem.setStyle('left', event.offsetX + targetRect.left - designerView.containerBoundingRect.x + 'px');
    this._createdItem.setStyle('top', event.offsetY + targetRect.top - designerView.containerBoundingRect.y + 'px');
    this._createdItem.setStyle('width', '0');
    this._createdItem.setStyle('height', '0');
    (<HTMLElement>this._createdItem.element).style.overflow = 'hidden';

    //TODO: add items as last, with all properties set
    //draw via containerService??? how to draw into a grid, a stackpanel???
    designerView.instanceServiceContainer.undoService.execute(new InsertAction(designerView.rootDesignItem, designerView.rootDesignItem.childCount, this._createdItem));

    designerView.instanceServiceContainer.selectionService.clearSelectedElements();
  }

  private async _onPointerMove(designerCanvas: IDesignerCanvas, event: PointerEvent) {
    if (this._createdItem) {
      if (!this._rect) {
        designerCanvas.rootDesignItem.element.appendChild(this._createdItem.element);
        this._rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        designerCanvas.overlayLayer.addOverlay(this.constructor.name, this._rect, OverlayLayer.Foreground);
        this._rect.setAttribute('class', 'svg-draw-new-element');
        this._rect.setAttribute('x', <string><any>(this._startPosition.x - designerCanvas.containerBoundingRect.x));
        this._rect.setAttribute('y', <string><any>(this._startPosition.y - designerCanvas.containerBoundingRect.y));
      }

      const w = event.x - this._startPosition.x;
      const h = event.y - this._startPosition.y;
      if (w >= 0) {
        this._rect.setAttribute('width', w);
        this._createdItem.setStyle('width', w + 'px');
      }
      if (h >= 0) {
        this._rect.setAttribute('height', h);
        this._createdItem.setStyle('height', h + 'px');
      }
    }
  }

  private async _onPointerUp(designerView: IDesignerCanvas, event: PointerEvent) {
    designerView.overlayLayer.removeOverlay(this._rect);
    designerView.instanceServiceContainer.selectionService.setSelectedElements([this._createdItem]);
    this._startPosition = null;
    this._rect = null;
    this._createdItem = null;

    designerView.serviceContainer.globalContext.finishedWithTool(this);
  }
}