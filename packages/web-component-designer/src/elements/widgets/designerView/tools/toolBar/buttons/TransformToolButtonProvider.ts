import { IDesignerCanvas } from "../../../IDesignerCanvas.js";
import { IDesignViewToolbarButtonProvider } from "../IDesignViewToolbarButtonProvider.js";
import { DesignerToolbarButton } from '../DesignerToolbarButton.js';
import { assetsPath } from "../../../../../../Constants.js";
import { TransformToolPopup } from "../popups/TransformToolPopup.js";

export class TransformToolButtonProvider implements IDesignViewToolbarButtonProvider {
  provideButton(designerCanvas: IDesignerCanvas): HTMLElement {
    const button =  new DesignerToolbarButton(designerCanvas, { 'TransformTool': { icon: assetsPath + 'images/layout/TransformTool.svg' } });
    button.popup = TransformToolPopup;
    return button;
  }
}