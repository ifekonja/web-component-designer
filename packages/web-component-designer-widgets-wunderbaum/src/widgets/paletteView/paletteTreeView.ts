import { css, html, BaseCustomWebComponentConstructorAppend } from '@node-projects/base-custom-webcomponent';
import { IElementsService, ServiceContainer, dragDropFormatNameElementDefinition } from '@node-projects/web-component-designer';
import { Wunderbaum } from 'wunderbaum'
//@ts-ignore
import wunderbaumStyle from 'wunderbaum/dist/wunderbaum.css' assert { type: 'css'}

export class PaletteTreeView extends BaseCustomWebComponentConstructorAppend {
  private _treeDiv: HTMLTableElement;
  private _tree: Wunderbaum;
  private _filter: HTMLInputElement;

  static override readonly style = css`
        :host {
          display: block;
        }
        * {
            touch-action: none;
        }
      `;

  static override readonly template = html`
  <div style="height: 100%;">
    <input id="input" style="width: 100%; height: 25px; box-sizing: border-box;" placeholder="Filter..." autocomplete="off">
    <div style="height: calc(100% - 26px);">
      <div id="treetable" style="min-width: 100%;"></div>
    </div>
  </div>`;

  constructor() {
    super();
    this._restoreCachedInititalValues();
    this.shadowRoot.adoptedStyleSheets = [PaletteTreeView.style, wunderbaumStyle];

    this._filter = this._getDomElement<HTMLInputElement>('input');
    this._filter.onkeyup = () => {
      let match = this._filter.value;
      this._tree.filterNodes((node) => {
        return new RegExp(match, "i").test(node.title);
      }, {});
    }

    this._treeDiv = this._getDomElement<HTMLTableElement>('treetable')

    this._tree = new Wunderbaum({
      element: this._treeDiv,
      quicksearch: true,
      source: [],
      filter: {
        autoExpand: true,
        mode: 'hide',
        highlight: true
      },
      dnd: {
        dropMarkerParent: this.shadowRoot,
        preventRecursion: true, // Prevent dropping nodes on own descendants
        preventVoidMoves: false,
        dropMarkerOffsetX: -24,
        dropMarkerInsertOffsetX: -16,
        //@ts-ignore
        dragStart: (e) => {
          e.event.dataTransfer.effectAllowed = "all";
          e.event.dataTransfer.setData(dragDropFormatNameElementDefinition, JSON.stringify(e.node.data.ref));
          e.event.dataTransfer.dropEffect = "copy";
          return true;
        },
        //@ts-ignore
        dragEnter: (e) => {
          return false;
        }
      }
    });
  }

  public async loadControls(serviceContainer: ServiceContainer, elementsServices: IElementsService[]) {
    let rootNode = this._tree.root;
    rootNode.removeChildren();

    for (const s of elementsServices) {
      const newNode = rootNode.addChildren({
        title: s.name
      });

      try {
        let elements = await s.getElements();
        for (let e of elements) {
          newNode.addChildren({
            title: e.name ?? e.tag,
            //@ts-ignore
            ref: e
          });
        }
      } catch (err) {
        console.warn('Error loading elements', err);
      }
    }
  }
}

customElements.define('node-projects-palette-tree-view', PaletteTreeView);