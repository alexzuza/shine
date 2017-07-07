import { tokenize, TokenType } from '../../angular/compiler/src/ml_parser/lexer';
import { getHtmlTagDefinition } from '../../angular/compiler/src/ml_parser/html_tags';
import { ParseSourceSpan } from '../../angular/compiler/src/parse_util';
import { split } from './util';


function augmentMarkup(type: string, span: ParseSourceSpan | string): string {
  const text = span instanceof ParseSourceSpan ? span.toString().replace(/</g, '&lt;') : span;
  return `<span data-highlight="${type}">${text}</span>`;
}

function buildList() {
  const list = document.getElementById('types-list');

  for (let enumMember in TokenType) {
    const isValueProperty = parseInt(enumMember, 10) >= 0;
    if (isValueProperty) {
      const type = TokenType[enumMember];

      const li = document.createElement('li');
      const div = document.createElement('div');
      div.dataset.highlight = type.toLowerCase();
      div.textContent = type;
      li.appendChild(div);
      list.appendChild(li);
    }
  }
}


let expansion: boolean;

export function testParser(text: string) {
  const tokensAndErrors = tokenize(text, 'd', getHtmlTagDefinition, true);

  let result = '';
  const len = tokensAndErrors.tokens.length;

  tokensAndErrors.tokens.forEach((x, i) => {
    if (i > 0) {
      result += split(tokensAndErrors.tokens[i - 1].sourceSpan.end, x.sourceSpan.start);
    }

    const type = TokenType[x.type].toLowerCase();

    if (x.type === TokenType.TAG_OPEN_END_VOID) {
      result = result.slice(0, -1);
      result += augmentMarkup(type, '/&gt;');
      return;
    }

    if (x.type === TokenType.EXPANSION_FORM_START) {
      expansion = true;
    }
    if (x.type === TokenType.EXPANSION_FORM_END) {
      expansion = false;
    }

    if (x.type === TokenType.EXPANSION_CASE_VALUE) {
      result += augmentMarkup(type, x.parts[0]) + ' ';
      return;
    }

    if (x.type === TokenType.ATTR_VALUE) {
      result = result.slice(0, -1);
      result += '=' + augmentMarkup(type, x.sourceSpan);
      return;
    }

    if (x.type === TokenType.EOF) {
      result += augmentMarkup(type, ' ');
      return;
    }

    result += augmentMarkup(type, x.sourceSpan);
    if (x.type === TokenType.RAW_TEXT && expansion && len > i + 1 && tokensAndErrors.tokens[i + 1].type === TokenType.RAW_TEXT) {
      result += `,`;
    }
  });

  const markup = document.getElementById('markup');
  markup.innerHTML = result;

  buildList();
}
