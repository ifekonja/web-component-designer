import { BindingTarget } from "../../item/BindingTarget";
import { IElementDefinition } from "../elementsService/IElementDefinition";
import { IElementsService } from "../elementsService/IElementsService";
import { IPropertiesService } from "../propertiesService/IPropertiesService";
import { IProperty } from "../propertiesService/IProperty";
import type { CustomElement, Package } from 'custom-elements-manifest/schema';
import { PropertyType } from "../propertiesService/PropertyType";
import { IDesignItem } from "../../item/IDesignItem";
import { UnkownElementPropertiesService } from "../propertiesService/services/UnkownElementPropertiesService";

export class WebcomponentManifestParserService extends UnkownElementPropertiesService implements IElementsService, IPropertiesService {

  private _name: string;
  get name() { return this._name; }

  private _packageData: Package;
  private _elementList: IElementDefinition[];
  private _propertiesList: Record<string, IProperty[]>;
  private _resolveStored: ((value: IElementDefinition[]) => void)[];
  private _rejectStored: ((errorCode: number) => void)[];

  constructor(name: string, file: string) {
    super();
    this._name = name;
    let path = file.split('/').slice(0, -1).join('/')
    import(file, { assert: { type: 'json' } }).then(module => {
      this._packageData = module.default;

      this._elementList = [];
      this._propertiesList = {};
      for (let m of this._packageData.modules) {
        for (let e of m.exports) {
          if (e.kind == 'custom-element-definition') {
            this._elementList.push({ tag: e.name, import: path + '/' + e.declaration.module });
            let properties: IProperty[] = [];
            let declaration: CustomElement = <CustomElement>m.declarations.find(x => x.name == e.declaration.name);
            for (let d of declaration.members) {
              if (d.kind == 'field') {
                let pType = PropertyType.property;
                pType = declaration.attributes.find(x => x.fieldName == d.name) != null ? PropertyType.propertyAndAttribute : PropertyType.property;
                properties.push({ name: d.name, service: this, propertyType: pType, type: this.manifestClassPropertyTypeToEditorPropertyType(d.type?.text) });
              }
            }
            this._propertiesList[e.name] = properties;
          }
        }
        if (this._resolveStored) {
          this._resolveStored.forEach(x => x(this._elementList));
          this._resolveStored = null;
          this._rejectStored = null;
        }
      }
    }).catch(err => {
      if (this._rejectStored) {
        this._rejectStored.forEach(x => x(err));
        this._resolveStored = null;
        this._rejectStored = null;
      }
    });
  }

  private manifestClassPropertyTypeToEditorPropertyType(type: string) {
    if (type) {
      if (type.toLowerCase() === 'boolean')
        return 'boolean';
      if (type.toLowerCase() === 'number')
        return 'number';
    }
    return type;
  }

  async getElements(): Promise<IElementDefinition[]> {
    if (this._packageData)
      return Promise.resolve(this._elementList);
    if (!this._resolveStored) {
      this._resolveStored = [];
      this._rejectStored = [];
    }
    return new Promise((resolve, reject) => { this._resolveStored.push(resolve); this._rejectStored.push(reject); });
  }


  override isHandledElement(designItem: IDesignItem): boolean {
    return this._elementList.find(x => x.tag == designItem.name) != null
  }

  override getProperties(designItem: IDesignItem): IProperty[] {
    return this._propertiesList[designItem.name];
  }

  override getProperty(designItem: IDesignItem, name: string): IProperty {
    return this._propertiesList[designItem.name].find(x => x.name == name);
  }

  override getPropertyTarget(designItem: IDesignItem, property: IProperty): BindingTarget {
    return this._propertiesList[designItem.name].find(x => x.name == property.name).propertyType == PropertyType.attribute ? BindingTarget.attribute : BindingTarget.property
  }
}