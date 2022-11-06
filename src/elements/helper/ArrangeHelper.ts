import { ChangeGroup, IDesignerCanvas, IDesignItem } from "../..";
import { Orientation } from "../../enums/Orientation";

export abstract class ArrangeHelper {
    public static arrangeElements(orientation: Orientation, designerCanvas: IDesignerCanvas) {
        switch (orientation) {
            case Orientation.TOP: {
                const grp = this.formGroup(ArrangeDirection.TOP, designerCanvas);
                const primaryCoordinates = designerCanvas.getNormalizedElementCoordinates(designerCanvas.instanceServiceContainer.selectionService.selectedElements[0].element);

                for (let elem of designerCanvas.instanceServiceContainer.selectionService.selectedElements) {        
                    var selectedCoordinates = designerCanvas.getNormalizedElementCoordinates(elem.element);
                    if(primaryCoordinates.y != selectedCoordinates.y) {
                        var diffY = selectedCoordinates.y - primaryCoordinates.y;
                        var top = selectedCoordinates.y - diffY;
                        this.arrange(elem, 'top', top + "px" );
                    }
                }
                grp.commit();
                break;
            }
            case Orientation.RIGHT: {
                const grp = this.formGroup(ArrangeDirection.RIGHT, designerCanvas);
                const primaryCoordinates = designerCanvas.getNormalizedElementCoordinates(designerCanvas.instanceServiceContainer.selectionService.selectedElements[0].element);

                for (let elem of designerCanvas.instanceServiceContainer.selectionService.selectedElements) {        
                    var selectedCoordinates = designerCanvas.getNormalizedElementCoordinates(elem.element);
                    if(primaryCoordinates.x != selectedCoordinates.x) {
                        var diffX = primaryCoordinates.x + primaryCoordinates.width - selectedCoordinates.x - selectedCoordinates.width;
                        var right = selectedCoordinates.x + diffX;
                        this.arrange(elem, 'left', right + "px" );
                    }
                }
                grp.commit();
                break;
            }
            case Orientation.BOTTOM:
                const grp = this.formGroup(ArrangeDirection.BOTTOM, designerCanvas);
                const primaryCoordinates = designerCanvas.getNormalizedElementCoordinates(designerCanvas.instanceServiceContainer.selectionService.selectedElements[0].element);

                for (let elem of designerCanvas.instanceServiceContainer.selectionService.selectedElements) {        
                    var selectedCoordinates = designerCanvas.getNormalizedElementCoordinates(elem.element);
                    if(primaryCoordinates.y != selectedCoordinates.y) {
                        var diffY = primaryCoordinates.y + primaryCoordinates.height - selectedCoordinates.y - selectedCoordinates.height;
                        var bottom = selectedCoordinates.y + diffY;
                        this.arrange(elem, 'top', bottom + "px" );
                    }
                }
                grp.commit();
                break;

            case Orientation.LEFT: {
                const grp = this.formGroup(ArrangeDirection.LEFT, designerCanvas);
                const primaryCoordinates = designerCanvas.getNormalizedElementCoordinates(designerCanvas.instanceServiceContainer.selectionService.selectedElements[0].element);

                for (let elem of designerCanvas.instanceServiceContainer.selectionService.selectedElements) {        
                    var selectedCoordinates = designerCanvas.getNormalizedElementCoordinates(elem.element);
                    if(primaryCoordinates.x != selectedCoordinates.x) {
                        var diffX = selectedCoordinates.x - primaryCoordinates.x;
                        var left = selectedCoordinates.x - diffX;
                        this.arrange(elem, 'left', left + "px" );
                    }
                }
                grp.commit();
                break;
            }
            case Orientation.VERTICAL_CENTER: {
                const grp = this.formGroup(ArrangeDirection.VERTICAL_CENTER, designerCanvas);
                const primaryCoordinates = designerCanvas.getNormalizedElementCoordinates(designerCanvas.instanceServiceContainer.selectionService.selectedElements[0].element);

                for (let elem of designerCanvas.instanceServiceContainer.selectionService.selectedElements) {        
                    var selectedCoordinates = designerCanvas.getNormalizedElementCoordinates(elem.element);
                    if(primaryCoordinates.y != selectedCoordinates.y) {
                        var diffY = selectedCoordinates.y - primaryCoordinates.y;
                        var bottom = selectedCoordinates.y - diffY + (primaryCoordinates.height / 2) - (selectedCoordinates.height / 2);
                        this.arrange(elem, 'top', bottom + "px" );
                    }
                }
                grp.commit();
                break;
            }

            case Orientation.HORIZONTAL_CENTER: {
                const grp = this.formGroup(ArrangeDirection.HORIZONTAL_CENTER, designerCanvas);
                const primaryCoordinates = designerCanvas.getNormalizedElementCoordinates(designerCanvas.instanceServiceContainer.selectionService.selectedElements[0].element);

                for (let elem of designerCanvas.instanceServiceContainer.selectionService.selectedElements) {        
                    var selectedCoordinates = designerCanvas.getNormalizedElementCoordinates(elem.element);
                    if(primaryCoordinates.x != selectedCoordinates.x) {
                        var diffX = selectedCoordinates.x - primaryCoordinates.x;
                        var left = selectedCoordinates.x - diffX + (primaryCoordinates.width / 2) - (selectedCoordinates.width / 2);
                        this.arrange(elem, 'left', left + "px" );
                    }
                }
                grp.commit();
                break;
            }
        }
    }

    private static arrange(element: IDesignItem, attribut: string, value: string) {
        element.setStyle(attribut, value);
    }

    private static formGroup(name: string, designerCanvas: IDesignerCanvas): ChangeGroup {
        return designerCanvas.instanceServiceContainer.selectionService.primarySelection.openGroup(name);
    }
}

enum ArrangeDirection {
    TOP = 'arrangeTop',
    RIGHT = 'arrangeRight',
    BOTTOM = 'arrangeBottom',
    LEFT = 'arrangeLeft',
    HORIZONTAL_CENTER = 'arrangeHorizontalCenter',
    VERTICAL_CENTER = 'arrangeVerticalCenter',
}