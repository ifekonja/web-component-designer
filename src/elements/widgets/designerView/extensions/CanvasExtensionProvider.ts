import { IDesignerExtensionProvider } from "./IDesignerExtensionProvider";
import { IDesignItem } from "../../../item/IDesignItem";
import { IDesignerView } from "../IDesignerView";
import { IDesignerExtension } from "./IDesignerExtension";
import { CanvasExtension } from './CanvasExtension';
import { IExtensionManager } from "./IExtensionManger";
import { css } from "@node-projects/base-custom-webcomponent";

export class CanvasExtensionProvider implements IDesignerExtensionProvider {

  shouldExtend(extensionManager: IExtensionManager, designerView: IDesignerView, designItem: IDesignItem): boolean {
    if (getComputedStyle((<HTMLElement>designItem.element)).display == 'block')
      return true;
    return false;
  }

  getExtension(extensionManager: IExtensionManager, designerView: IDesignerView, designItem: IDesignItem): IDesignerExtension {
    return new CanvasExtension(extensionManager, designerView, designItem);
  }

  readonly style = css`
    .svg-margin { fill: #ff944722; }
  `;      
}