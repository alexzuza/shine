import { HtmlParser } from '../../angular/compiler/src/ml_parser/html_parser';
import * as html from '../../angular/compiler/src/ml_parser/ast';
import { split } from './util';

const htmlParser = new HtmlParser();
const code = document.getElementById('htmlCode');
const list = document.getElementById('html-elements-list');

function consumeCode(text: string, highlight: string): void {
  let span = document.createElement('span');
  span.textContent = text;

  span.setAttribute('data-highlight', highlight);
  span.setAttribute('data-all', '1');

  code.appendChild(span);
}

function consumeLi(text: string, highlight: string, container) {
  const li = document.createElement('li');

  const div = document.createElement('div');
  div.innerHTML = text;
  div.dataset.highlight = highlight;
  li.appendChild(div);

  container.appendChild(li);

  return li;
}


function consumeAttr(text: string, highlight: string, container) {
  const div = document.createElement('div');
  div.innerHTML = text;
  div.style.display = 'block';
  div.dataset.highlight = highlight;
  container.appendChild(div);
}

let counter = 1;
class MyVisitor implements html.Visitor {

  visitElement(element: html.Element, container: any): any {
    const type = 'html.element' + counter++;
    const start = element.startSourceSpan;

    consumeCode('', type);
    const li = consumeLi(`Element:<strong>${element.name}</strong>`, type, container);

    if(element.attrs.length) {
      consumeCode(start.start.file.content.substring(start.start.offset, element.attrs[0].sourceSpan.start.offset), type);
    } else {
      consumeCode(start.toString(), type);
    }

    element.attrs.forEach((attr, i) => {
      if(i > 0) {
        code.innerHTML += split(element.attrs[i - 1].sourceSpan.end, attr.sourceSpan.start)
      }
      this.visitAttribute(attr, li.children[0]);
    });

    if(element.attrs.length) {
      consumeCode(start.start.file.content.substring(element.attrs[element.attrs.length - 1].sourceSpan.end.offset, start.end.offset), type);
    }

    if(element.children.length) {
      const liContainer = document.createElement('ul');
      visitAll(this, element.children, liContainer);
      li.appendChild(liContainer);
    }

    if(element.endSourceSpan && element.startSourceSpan !== element.endSourceSpan) {
      consumeCode(element.endSourceSpan.toString(), type);
    }
    return undefined;
  }

  visitAttribute(attribute: html.Attribute, container: any): any {
    const type = 'html.attribute' + counter++;

    consumeAttr(` (attr:<strong>${attribute.name} - ${attribute.value}</strong>)`, type, container);
    consumeCode(attribute.sourceSpan.toString(), type);
  }

  visitText(text: html.Text, container): any {
    const type = 'html.text' + counter++;
    consumeLi('Text', type, container);
    consumeCode(text.sourceSpan.toString(), type);
  }

  visitComment(comment: html.Comment, context: any): any {
  }

  visitExpansion(expansion: html.Expansion, context: any): any {
  }

  visitExpansionCase(expansionCase: html.ExpansionCase, context: any): any {
  }
}


function visitAll(visitor: html.Visitor, nodes: html.Node[], container) {
  nodes.forEach(x => x.visit(visitor, container));
}

const visitor = new MyVisitor();

export function htmlParserTest(text) {
  const result = htmlParser.parse(text, '', true);
  visitAll(visitor, result.rootNodes, list);
}
