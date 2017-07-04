import { HtmlParser } from '../../angular/compiler/src/ml_parser/html_parser';
import * as html from '../../angular/compiler/src/ml_parser/ast';
import { split } from './util';

const htmlParser = new HtmlParser();
const code = document.getElementById('htmlCode');
const typesListUl = document.getElementById('types-list2');

function consumeSpan(text: string, highlight: string): void {
  let span = document.createElement('span');
  span.textContent = text;

  span.setAttribute('data-highlight', highlight);
  span.setAttribute('data-all', '1');

  code.appendChild(span);
}

function consumeLi(text: string, highlight: string, context: VisitorContext) {
  var li = document.createElement('li');

  const div = document.createElement('div');
  div.innerHTML = text;
  div.dataset.highlight = highlight;
  li.appendChild(div);

  context.liContainer.appendChild(li);

  return li;
}


function consumeAttr(text: string, highlight: string, context: VisitorContext) {
  const div = document.createElement('div');
  div.innerHTML = text;
  div.dataset.highlight = highlight;
  context.liContainer.appendChild(div);
}

let counter = 1;
class MyVisitor implements html.Visitor {

  visitElement(element: html.Element, context: any): any {
    const type = 'html.element' + counter++;
    const start = element.startSourceSpan;
    const startOffset = start.start.offset;

    consumeSpan('', type);
    const li = consumeLi(`Element:<strong>${element.name}</strong>`, type, context);

    if(element.attrs.length) {
      consumeSpan(start.start.file.content.substring(start.start.offset, element.attrs[0].sourceSpan.start.offset), type);
    } else {
      consumeSpan(start.toString(), type);
    }

    element.attrs.forEach((attr, i) => {
      console.log(attr.sourceSpan.start.offset - startOffset);
      if(i > 0) {
        code.innerHTML += split(element.attrs[i - 1].sourceSpan.end, attr.sourceSpan.start)
      }
      this.visitAttribute(attr, { liContainer: li});
    });

    if(element.attrs.length) {
      consumeSpan(start.start.file.content.substring(element.attrs[element.attrs.length - 1].sourceSpan.end.offset, start.end.offset), type);
    }

    if(element.children.length) {
      const liContainer = document.createElement('ul');
      visitAll(this, element.children, { liContainer });
      li.appendChild(liContainer);
    }

    if(element.endSourceSpan && element.startSourceSpan !== element.endSourceSpan) {
      consumeSpan(element.endSourceSpan.toString(), type);
    }
    return undefined;
  }

  visitAttribute(attribute: html.Attribute, context: any): any {
    const type = 'html.attribute' + counter++;
    consumeAttr(`(attr:<strong>${attribute.name}</strong>)`, type, context);
    consumeSpan(attribute.sourceSpan.toString(), type);
  }

  visitText(text: html.Text, context: VisitorContext): any {
    const type = 'html.text' + counter++;
    consumeLi('Text', type, context);
    consumeSpan(text.sourceSpan.toString(), type);
  }

  visitComment(comment: html.Comment, context: any): any {
  }

  visitExpansion(expansion: html.Expansion, context: any): any {
  }

  visitExpansionCase(expansionCase: html.ExpansionCase, context: any): any {
  }
}


function visitAll(visitor: html.Visitor, nodes: html.Node[], context: VisitorContext) {
  nodes.forEach(x => x.visit(visitor, context));
}

const visitor = new MyVisitor();

export function htmlParserTest(text) {
  const result = htmlParser.parse(text, 'd', true);
  visitAll(visitor, result.rootNodes, { liContainer: typesListUl});
}

export interface VisitorContext {
  liContainer: any;
}