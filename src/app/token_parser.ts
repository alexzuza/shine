import { tokenize, TokenType } from '../../angular/compiler/src/ml_parser/lexer';
import { getHtmlTagDefinition } from '../../angular/compiler/src/ml_parser/html_tags';
import { ParseSourceSpan } from '../../angular/compiler/src/parse_util';
import { split } from './util';


function augmentMarkup(type: string, span: ParseSourceSpan | string): string {
  const text = span instanceof ParseSourceSpan ? span.toString().replace(/</g, '&lt;') : span;
  return `<span data-highlight="${type}">${text}</span>`;
}

let tokensLi = [];
function buildList() {
  const list = document.getElementById('types-list');
  tokensLi = [];
  list.innerHTML = '';
  for (let enumMember in TokenType) {
    const isValueProperty = parseInt(enumMember, 10) >= 0;
    if (isValueProperty) {
      const type = TokenType[enumMember];

      const li = document.createElement('li');
      li.id = 'token_' + type.toLowerCase();;
      li.className = 'hidden';
      tokensLi.push(li);
      const div = document.createElement('div');
      div.dataset.highlight = type.toLowerCase();
      div.textContent = type;
      li.appendChild(div);
      list.appendChild(li);
    }
  }
}

export function testParser(text: string) {
  buildList();
  const tokensAndErrors = tokenize(text, 'd', getHtmlTagDefinition, true);

  let result = '';

  tokensAndErrors.tokens.forEach((x, i) => {
    if (i > 0) {
      result += split(tokensAndErrors.tokens[i - 1].sourceSpan.end, x.sourceSpan.start);
    }

    const type = TokenType[x.type].toLowerCase();
    tokensLi.find(x => x.id === 'token_' + type).className = '';
    if (x.type === TokenType.EOF) {
      result += augmentMarkup(type, ' ');
      return;
    }

    result += augmentMarkup(type, x.sourceSpan);
  });

  const markup = document.getElementById('markup');
  markup.innerHTML = result;
}

