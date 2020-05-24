import { IDesignItem } from '../../item/IDesignItem';
import { IHtmlWriterService } from './IHtmlWriterService';
import { IHtmlWriterOptions } from './IHtmlWriterOptions';
import { DomConverter } from '../../widgets/designerView/DomConverter';
import { IndentedTextWriter } from '../../helper/IndentedTextWriter';

export class HtmlWriterService implements IHtmlWriterService {
  canWrite(designItem: IDesignItem) {
    return true;
  }

  write(indentedTextWriter: IndentedTextWriter, designItem: IDesignItem, options: IHtmlWriterOptions) {
    indentedTextWriter.writeIndent();
    indentedTextWriter.write('<' + designItem.name);

    if (designItem.hasAttributes) {
      for (const a of designItem.attributes) {
        indentedTextWriter.write(' ');
        indentedTextWriter.write(a[0] + '="' + DomConverter.normalizeAttributeValue(a[1]) + '"');
      }
    }

    if (designItem.hasStyles) {
      indentedTextWriter.write(' style="');
      for (const s of designItem.styles) {
        indentedTextWriter.write(s[0] + ':' + DomConverter.normalizeAttributeValue(s[1]) + ';');
      }
      indentedTextWriter.write('"');
    }
    indentedTextWriter.write('>');
    
    if (designItem.hasChildren) {
      indentedTextWriter.writeNewline();
      indentedTextWriter.levelRaise();
      for (const c of designItem.children()) {
        c.serviceContainer.forSomeServicesTillResult('htmlWriterService', (s) => {
          if (s.canWrite(c))
            s.write(indentedTextWriter, c, options);
        });
      }
      indentedTextWriter.levelShrink();
      indentedTextWriter.writeIndent();
    } else if (designItem.hasContent) {
      //indentedTextWriter.writeNewline();
      //indentedTextWriter.levelRaise();
      indentedTextWriter.write(DomConverter.normalizeContentValue(designItem.content));
      //indentedTextWriter.writeNewline();
      //indentedTextWriter.levelShrink();
      //indentedTextWriter.writeIndent();
    }

    if (!DomConverter.IsSelfClosingElement(designItem.name))
      indentedTextWriter.write('</' + designItem.name + '>');

    indentedTextWriter.writeNewline();
  }
}