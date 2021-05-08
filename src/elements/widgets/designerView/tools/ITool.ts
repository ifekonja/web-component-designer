import { IDisposable } from "../../../../interfaces/IDisposable";
import { IDesignerView } from "../IDesignerView";

export interface ITool extends IDisposable {
  readonly cursor: string
  pointerEventHandler(designerView: IDesignerView, event: PointerEvent, currentElement: Element)
}