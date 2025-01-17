import { IPropertiesService, RefreshMode } from '../IPropertiesService.js';
import { IProperty } from '../IProperty.js';
import { IDesignItem } from '../../../item/IDesignItem.js';
import { ValueType } from '../ValueType.js';
import { PropertiesHelper } from './PropertiesHelper.js';
import { BindingTarget } from '../../../item/BindingTarget.js';
import { IBinding } from '../../../item/IBinding.js';
import { PropertyType } from '../PropertyType.js';
import { NodeType } from '../../../item/NodeType.js';
import { IPropertyGroup } from '../IPropertyGroup.js';

export abstract class AbstractPropertiesService implements IPropertiesService {

  private static _stylesCache = new Map<IDesignItem, Set<string>>;
  private _cssCacheClearTimer: NodeJS.Timeout;
  private static _bindingsCache = new Map<IDesignItem, IBinding[]>;
  private _bindingsCacheClearTimer: NodeJS.Timeout;

  abstract getRefreshMode(designItem: IDesignItem): RefreshMode;

  abstract isHandledElement(designItem: IDesignItem): boolean;

  protected _notifyChangedProperty(designItem: IDesignItem, property: IProperty, value: any) {
  }

  getProperty(designItem: IDesignItem, name: string): IProperty {
    let properties = this.getProperties(designItem);
    if ('properties' in properties[0]) {
      return (<IPropertyGroup[]>properties).flatMap(x => x.properties).find(x => x.name == name);
    }
    else
      return (<IProperty[]>properties).find(x => x.name == name);
  }

  abstract getProperties(designItem: IDesignItem): IProperty[] | IPropertyGroup[];

  setValue(designItems: IDesignItem[], property: IProperty, value: any) {
    const cg = designItems[0].openGroup("property changed: " + property.name + " to " + value);
    for (let d of designItems) {
      if (!this.isHandledElement(d))
        continue;
      if (!this.getProperty(d, property.name))
        continue;

      if (property.propertyType == PropertyType.cssValue) {
        d.updateStyleInSheetOrLocal(property.name, value);
        //unkown css property names do not trigger the mutation observer of property grid, 
        //fixed by assinging stle again to the attribute
        (<HTMLElement>d.element).setAttribute('style', (<HTMLElement>d.element).getAttribute('style'));
      } else {
        let attributeName = property.attributeName
        if (!attributeName)
          attributeName = PropertiesHelper.camelToDashCase(property.name);


        if (property.type === 'object') {
          const json = JSON.stringify(value);
          if (property.propertyType == PropertyType.attribute || property.propertyType == PropertyType.propertyAndAttribute)
            d.setAttribute(attributeName, json);
          if (property.propertyType == PropertyType.property || property.propertyType == PropertyType.propertyAndAttribute)
            d.element[property.name] = value;
        } else if (property.type == 'boolean' && (value === false || value == null)) {
          if (property.propertyType == PropertyType.attribute || property.propertyType == PropertyType.propertyAndAttribute)
            d.removeAttribute(attributeName);
          if (property.propertyType == PropertyType.property || property.propertyType == PropertyType.propertyAndAttribute)
            d.element[property.name] = false;
        }
        else if (property.type == 'boolean' && value === true) {
          if (property.propertyType == PropertyType.attribute || property.propertyType == PropertyType.propertyAndAttribute)
            d.setAttribute(attributeName, "");
          if (property.propertyType == PropertyType.property || property.propertyType == PropertyType.propertyAndAttribute)
            d.element[property.name] = true;
        }
        else {
          if (property.propertyType == PropertyType.attribute || property.propertyType == PropertyType.propertyAndAttribute)
            d.setAttribute(attributeName, value.toString());
          if (property.propertyType == PropertyType.property || property.propertyType == PropertyType.propertyAndAttribute)
            d.element[property.name] = value;
        }
      }
      this._notifyChangedProperty(d, property, value);
    }
    cg.commit();
  }

  getPropertyTarget(designItem: IDesignItem, property: IProperty): BindingTarget {
    return BindingTarget.property;
  }

  clearValue(designItems: IDesignItem[], property: IProperty, clearType: 'all' | 'binding' | 'value') {
    const cg = designItems[0].openGroup("property cleared: " + property.name);
    for (let d of designItems) {
      if (clearType != 'binding') {
        if (property.propertyType == PropertyType.cssValue) {
          d.removeStyle(property.name);
        } else {
          let attributeName = property.attributeName
          if (!attributeName)
            attributeName = PropertiesHelper.camelToDashCase(property.name);
          d.removeAttribute(attributeName);
        }
      }
      if (clearType != 'value') {
        d.serviceContainer.forSomeServicesTillResult('bindingService', (s) => {
          return s.clearBinding(d, property.name, this.getPropertyTarget(d, property));
        });
      }
      this._notifyChangedProperty(d, property, undefined);
    }
    cg.commit();
  }

  isSet(designItems: IDesignItem[], property: IProperty): ValueType {
    let all = true;
    let some = false;
    if (designItems != null && designItems.length !== 0) {
      let attributeName = property.attributeName
      if (!attributeName)
        attributeName = PropertiesHelper.camelToDashCase(property.name);
      for (let x of designItems) {
        let has = false;
        if (property.propertyType == PropertyType.cssValue)
          has = x.hasStyle(property.name);
        else
          has = x.hasAttribute(attributeName);
        all = all && has;
        some = some || has;
        if (!all && some)
          break;
      };

      let bindings = AbstractPropertiesService._bindingsCache.get(designItems[0]);
      if (!bindings) {
        bindings = designItems[0].serviceContainer.forSomeServicesTillResult('bindingService', (s) => s.getBindings(designItems[0]));
        AbstractPropertiesService._bindingsCache.set(designItems[0], bindings);
        clearTimeout(this._bindingsCacheClearTimer);
        this._bindingsCacheClearTimer = setTimeout(() => AbstractPropertiesService._bindingsCache.clear(), 30);
      }
      if (property.propertyType == PropertyType.cssValue) {
        if (bindings && bindings.find(x => (x.target == BindingTarget.css || x.target == BindingTarget.cssvar) && x.targetName == property.name))
          return ValueType.bound;
      } else {
        if (bindings && bindings.find(x => x.target == BindingTarget.property && x.targetName == property.name))
          return ValueType.bound;
      }

      if (!all && property.propertyType == PropertyType.cssValue) {
        let styles = AbstractPropertiesService._stylesCache.get(designItems[0]);
        if (!styles) {
          styles = new Set(designItems[0].getAllStyles().filter(x => x.selector != null).flatMap(x => x.declarations).map(x => x.name));
          AbstractPropertiesService._stylesCache.set(designItems[0], styles);
          clearTimeout(this._cssCacheClearTimer);
          this._cssCacheClearTimer = setTimeout(() => AbstractPropertiesService._stylesCache.clear(), 30);
        }

        let cssValue = styles.has(property.name);
        if (cssValue)
          return ValueType.fromStylesheet;
      }
    }
    else
      return ValueType.none

    return all ? ValueType.all : some ? ValueType.some : ValueType.none;
  }

  getValue(designItems: IDesignItem[], property: IProperty) {
    if (designItems != null && designItems.length !== 0) {
      if (property.propertyType == PropertyType.cssValue) {
        let lastValue = designItems[0].getStyle(property.name);
        for (const d of designItems) {
          let value = d.getStyle(property.name);
          if (value != lastValue) {
            lastValue = null;
            break;
          }
        }
        return lastValue;
      } else {
        let attributeName = property.attributeName
        if (!attributeName)
          attributeName = PropertiesHelper.camelToDashCase(property.name);

        if (property.type == 'boolean') {
          if (designItems[0].hasAttribute(attributeName)) {
            const val = designItems[0].getAttribute(attributeName);
            if (val == "")
              return true;
            return val;
          }
          return false;
        }
        let lastValue = designItems[0].getAttribute(attributeName);
        /*
        for (const x of designItems) {
          let value = x.attributes.get(attributeName);
          if (value != lastValue) {
            lastValue = null;
            break;
          }
        }
        */
        return lastValue;
      }
    }
    return null;
  }

  getBinding(designItems: IDesignItem[], property: IProperty): IBinding {
    //TODO: optimize perf, do not call bindings service for each property. 
    const bindings = designItems[0].serviceContainer.forSomeServicesTillResult('bindingService', (s) => {
      return s.getBindings(designItems[0]);
    });
    if (bindings != null) {
      if (property.propertyType == PropertyType.cssValue) {
        return bindings.find(x => (x.target == BindingTarget.css || x.target == BindingTarget.cssvar) && x.targetName == property.name);
      } else {
        return bindings.find(x => (x.target == BindingTarget.property || x.target == BindingTarget.attribute) && x.targetName == property.name);
      }
    }
    return null;
  }

  getUnsetValue(designItems: IDesignItem[], property: IProperty) {
    if (property.propertyType == PropertyType.cssValue) {
      if (designItems != null && designItems.length !== 0) {
        if (designItems[0].nodeType == NodeType.Element) {
          let v = window.getComputedStyle(designItems[0].element)[property.name];
          return v;
        }
      }
      return null;
    }
    else
      return property.defaultValue;
  }
}