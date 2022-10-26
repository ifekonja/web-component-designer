import { IProperty } from '../IProperty';
import { IDesignItem } from '../../../item/IDesignItem';
import { CommonPropertiesService } from "./CommonPropertiesService";
import { PropertyType } from '../PropertyType';

export class NativeElementsPropertiesService extends CommonPropertiesService {

  private inputProperties: IProperty[] = [
    {
      name: "type",
      type: "list",
      values: ["text", "number", "button", "checkbox", "color", "date", "datetime-local", "email", "file", "hidden", "image", "month", "password", "radio", "range", "reset", "search", "submit", "tel", "time", "url", "week"],
      service: this,
      defaultValue: "text",
      propertyType: PropertyType.propertyAndAttribute
    }, {
      name: "value",
      type: "string",
      service: this,
      propertyType: PropertyType.propertyAndAttribute
    }, {
      name: "placeholder",
      type: "string",
      service: this,
      propertyType: PropertyType.propertyAndAttribute
    }, {
      name: "checked",
      type: "boolean",
      service: this,
      propertyType: PropertyType.propertyAndAttribute
    }, {
      name: "min",
      type: "number",
      service: this,
      propertyType: PropertyType.propertyAndAttribute
    }, {
      name: "max",
      type: "number",
      service: this,
      propertyType: PropertyType.propertyAndAttribute
    }, {
      name: "readonly",
      type: "boolean",
      service: this,
      propertyType: PropertyType.propertyAndAttribute
    }
  ];

  private textareaProperties: IProperty[] = [
    {
      name: "placeholder",
      type: "string",
      service: this,
      propertyType: PropertyType.propertyAndAttribute
    }, {
      name: "maxlength",
      type: "number",
      service: this,
      propertyType: PropertyType.propertyAndAttribute
    }, {
      name: "cols",
      type: "number",
      service: this,
      propertyType: PropertyType.propertyAndAttribute
    }, {
      name: "rows",
      type: "number",
      service: this,
      propertyType: PropertyType.propertyAndAttribute
    }, {
      name: "readonly",
      type: "boolean",
      service: this,
      propertyType: PropertyType.propertyAndAttribute
    }
  ];

  private selectProperties: IProperty[] = [
    {
      name: "size",
      type: "number",
      service: this,
      propertyType: PropertyType.propertyAndAttribute
    }, {
      name: "multiple",
      type: "boolean",
      service: this,
      propertyType: PropertyType.propertyAndAttribute
    }
  ];

  private buttonProperties: IProperty[] = [
    {
      name: "type",
      type: "list",
      values: ["button", "submit", "reset"],
      service: this,
      defaultValue: "button",
      propertyType: PropertyType.propertyAndAttribute
    }, {
      name: "value",
      type: "string",
      service: this,
      propertyType: PropertyType.propertyAndAttribute
    }, {
      name: "disabled",
      type: "boolean",
      service: this,
      propertyType: PropertyType.propertyAndAttribute
    }
  ];

  private anchorProperties: IProperty[] = [
    {
      name: "href",
      type: "string",
      service: this,
      propertyType: PropertyType.propertyAndAttribute
    }
  ];

  private divProperties: IProperty[] = [
    {
      name: "title",
      type: "string",
      service: this,
      propertyType: PropertyType.propertyAndAttribute
    }
  ];

  private imgProperties: IProperty[] = [
    {
      name: "src",
      type: "string",
      service: this,
      propertyType: PropertyType.propertyAndAttribute
    }
  ];

  private iframeProperties: IProperty[] = [
    {
      name: "src",
      type: "string",
      service: this,
      propertyType: PropertyType.propertyAndAttribute
    }
  ];

  private formElementProperties: IProperty[] = [
    {
      name: "autofocus",
      type: "boolean",
      service: this,
      propertyType: PropertyType.propertyAndAttribute
    },
    {
      name: "disabled",
      type: "boolean",
      service: this,
      propertyType: PropertyType.propertyAndAttribute
    },
    {
      name: "required",
      type: "boolean",
      service: this,
      propertyType: PropertyType.propertyAndAttribute
    }
  ];

  public override name = "native"

  override isHandledElement(designItem: IDesignItem): boolean {
    switch (designItem.element.localName) {
      case 'input':
      case 'textarea':
      case 'select':
      case 'button':
      case 'a':
      case 'div':
      case 'span':
      case 'br':
      case 'img':
      case 'iframe':
        return true;
    }
    return false;
  }

  override getProperty(designItem: IDesignItem, name: string): IProperty {
    return this.getProperties(designItem)[name];
  }

  override getProperties(designItem: IDesignItem): IProperty[] {
    if (!this.isHandledElement(designItem))
      return null;
    switch (designItem.element.localName) {
      case 'input':
        return [...this.inputProperties, ...this.formElementProperties];
      case 'textarea':
        return [...this.textareaProperties, ...this.formElementProperties];
      case 'select':
        return [...this.selectProperties, ...this.formElementProperties];
      case 'button':
        return [...this.buttonProperties, ...this.formElementProperties];
      case 'a':
        return this.anchorProperties;
      case 'div':
        return this.divProperties;
      case 'img':
        return this.imgProperties;
      case 'iframe':
        return this.iframeProperties;
    }

    return null;
  }
}
