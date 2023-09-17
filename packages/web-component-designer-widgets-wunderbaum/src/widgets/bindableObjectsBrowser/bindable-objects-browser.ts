import { BaseCustomWebComponentConstructorAppend, TypedEvent, css, html } from '@node-projects/base-custom-webcomponent';
import { IBindableObject, IBindableObjectsService, ServiceContainer, dragDropFormatNameBindingObject } from '@node-projects/web-component-designer';
import { WbNodeData } from 'types';
import { Wunderbaum } from 'wunderbaum'
//@ts-ignore
import wunderbaumStyle from 'wunderbaum/dist/wunderbaum.css' assert { type: 'css'}

type serviceNode = { service: IBindableObjectsService, bindable: IBindableObject<any> }

export class BindableObjectsBrowser extends BaseCustomWebComponentConstructorAppend {
  private _treeDiv: HTMLDivElement;
  private _tree: Wunderbaum;

  public selectedObject: IBindableObject<any>;

  public objectDoubleclicked = new TypedEvent<void>;

  static override readonly style = css``;

  static override template = html`
      <div id="tree" style="height: 100%; overflow: auto;" class="wb-skeleton wb-initializing wb-no-select wb-alternate">
      </div>`

  constructor() {
    super();
    this._restoreCachedInititalValues();
    this.shadowRoot.adoptedStyleSheets = [BindableObjectsBrowser.style, wunderbaumStyle];

    this._treeDiv = this._getDomElement<HTMLDivElement>('tree');
    this.shadowRoot.appendChild(this._treeDiv);

    this._tree = new Wunderbaum({
      element: this._treeDiv,
      debugLevel: 5,
      lazyLoad: (event) => {
        return new Promise(async resolve => {
          const service: IBindableObjectsService = (<serviceNode>event.node.data).service;
          const bindable: IBindableObject<any> = (<serviceNode>event.node.data).bindable;
          let children: IBindableObject<any>[];
          if (bindable?.children)
            children = bindable.children;
          else
            children = await service.getBindableObjects(bindable);
          resolve(children.map(x => ({
            title: x.name,
            service,
            bindable: x,
            lazy: x.children !== false
          })));
        });
      },
      dblclick: (e) => {
        this.objectDoubleclicked.emit();
        return true;
      },
      activate: (event) => {
        this.selectedObject = event.node.data.bindable;
      },
      dnd: {
        dropMarkerParent: this.shadowRoot,
        preventRecursion: true,
        preventVoidMoves: false,
        //@ts-ignore
        dragStart: (e) => {
          e.event.dataTransfer.effectAllowed = "all";
          e.event.dataTransfer.setData(dragDropFormatNameBindingObject, JSON.stringify(e.node.data.bindable));
          e.event.dataTransfer.dropEffect = "copy";
          return true
        },
        //@ts-ignore
        dragEnter: (e) => {
          return "over";
        }
      }
    });
  }

  public async initialize(serviceContainer: ServiceContainer) {
    let rootNode = this._tree.root;
    rootNode.removeChildren();

    const services = serviceContainer.bindableObjectsServices;
    for (const s of services) {
      this._tree.root.addChildren(<WbNodeData>{
        title: s.name,
        lazy: true,
        service: s
      });
    }
  }
}

customElements.define('node-projects-bindable-objects-browser', BindableObjectsBrowser);