import { tokenize, TokenType } from '../../angular/compiler/src/ml_parser/lexer';
import { getHtmlTagDefinition } from '../../angular/compiler/src/ml_parser/html_tags';
import { ParseSourceSpan } from '../../angular/compiler/src/parse_util';
import { split } from './util';


// var Prism = require('prismjs');

// declare let module: any;
declare let require: any;

/*
 if (module.hot) {
 module.hot.accept('./parser/lexer', reload);
 }
 */



const typesListUl = document.getElementById('types-list');


for (var enumMember in TokenType) {
  var isValueProperty = parseInt(enumMember, 10) >= 0
  if (isValueProperty) {
    const type = TokenType[enumMember];

    var li = document.createElement('li');
    var div = document.createElement('div');
    div.dataset.highlight = type.toLowerCase();
    div.textContent = type;
    li.appendChild(div);
    typesListUl.appendChild(li);
  }
}

let expansion: boolean;


function encodedSpan(span: ParseSourceSpan) {
  return span.toString().replace(/</g, '&lt;')
}

export function testParser(text: string) {
  const tokensAndErrors = tokenize(text, 'd', getHtmlTagDefinition, true);

  let result = '';
  const len = tokensAndErrors.tokens.length;
  tokensAndErrors.tokens.forEach((x, i) => {

    if(i > 0) {
      result += split(tokensAndErrors.tokens[i - 1].sourceSpan.end, x.sourceSpan.start);
    }

    let type = TokenType[x.type].toLowerCase();
    if(x.type === TokenType.TAG_OPEN_START || x.type === TokenType.TAG_CLOSE || x.type === TokenType.TAG_OPEN_END) {
      result += `<span data-highlight="${type}">${encodedSpan(x.sourceSpan)}</span>`;
    }

    if(x.type === TokenType.TAG_OPEN_END_VOID) {
      result += `<span data-highlight="${type}">/&gt;</span>`;
    }

    if(x.type === TokenType.EXPANSION_FORM_START) {
      expansion = true;
    }
    if(x.type === TokenType.EXPANSION_FORM_END) {
      expansion = false;
    }

    if(x.type === TokenType.EXPANSION_FORM_START ||
      x.type === TokenType.EXPANSION_FORM_END ||
      x.type === TokenType.EXPANSION_CASE_EXP_START ||
      x.type === TokenType.EXPANSION_CASE_EXP_END) {
      result += `<span data-highlight="${type}">${encodedSpan(x.sourceSpan)}</span>`;
    }

    if(x.type === TokenType.EXPANSION_CASE_VALUE) {
      result += `<span data-highlight="${type}">${x.parts[0]}</span> `;
    }


    if(x.type === TokenType.ATTR_NAME) {
      result += `<span data-highlight="${type}">${encodedSpan(x.sourceSpan)}</span>`;
    }

    if(x.type === TokenType.ATTR_VALUE) {
      result = result.slice(0, -1)
      result += `=<span data-highlight="${type}">${encodedSpan(x.sourceSpan)}</span>`;
    }

    if(x.type === TokenType.TEXT || x.type === TokenType.ESCAPABLE_RAW_TEXT || x.type === TokenType.RAW_TEXT) {
      result += `<span data-highlight="${type}">${encodedSpan(x.sourceSpan)}</span>`;
    }


    if(x.type === TokenType.RAW_TEXT && expansion && len > i + 1 && tokensAndErrors.tokens[i + 1].type === TokenType.RAW_TEXT) {
      result += `,`;
    }


    if(x.type === TokenType.EOF) {
      result += `<span data-highlight="${type}"> </span>`;
    }

    if(x.type === TokenType.COMMENT_START) {
      result += `<span data-highlight="${type}">&lt;!--</span>`;
    }

    if(x.type === TokenType.COMMENT_END) {
      result += `<span data-highlight="${type}">--&gt;</span>`;
    }

    if(x.type === TokenType.CDATA_START) {
      result += `<span data-highlight="${type}">&lt;![CDATA[</span>`;
    }

    if(x.type === TokenType.CDATA_END) {
      result += `<span data-highlight="${type}">]]&gt;</span>`;
    }

    if(x.type === TokenType.DOC_TYPE) {
      result += `<span data-highlight="${type}">&lt;!${x.parts[0]}&gt;</span>`;
    }

  });

  // const html2 = Prism.highlight(text, Prism.languages.html);

  const code = document.getElementById('code');

  code.innerHTML =  result;
  // console.log(html2);
}
