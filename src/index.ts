import { htmlParserTest } from './app/html_parser_test';
declare let require: any;
require('../main.css');

import { testParser } from './app/parser_test';
import { parseTemplate } from './app/template_parser';


let text = `
  <h1>Test {{ interpolation }}</h1>
  <div>
    <child [prop1]="x" label="{{ prefix + title }}">name</child>
  </div>
  <input type="text">
  <input type="text"/>
  <img src="test.jpg"/>
  <area/>
  <link rel="stylesheet" href="#" />
  <hr/>
  <textarea>escapable raw text</textarea>
  <title>Title</title>

  <script>
    var a = 7;
  </script>
  <style>
    .someClass { color: red; }
  </style>
  <!-- some comment -->
  
  <![CDATA[
    Data block
  ]]>

  <!DOCTYPE html SYSTEM "about:legacy-compat">

  {one.two, three, =4 {four} =5 {five} foo {bar} }
  before{one.two, three, =4 {four}}after
  {one.two, three, =4 { {xx, yy, =x {one}} }}

  <comp/>
  <span>{a, b, =4 {c}}</span>
  <t a="{{v}}" b="s{{m}}e" c="s{{m//c}}e">
  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <svg:text x="10" y="15" fill="red">I love SVG!</svg:text>
  </svg>
`;

text = `
  <h1 [title]="1" (click)="d()" a="a" [prop]="test">
    Hooray
    {{ name }}
  </h1>
`;



testParser(text);
htmlParserTest(text);

const parsedTemplateResult = parseTemplate(text);
console.log(parsedTemplateResult);

handleHover();

function handleHover() {
  const types = document.querySelectorAll('[data-highlight]');
  Array.prototype.forEach.call(types, (li) => {
    li.addEventListener('mouseenter', (e) => highlightHandler(e, 'add'));
    li.addEventListener('mouseleave', (e) => highlightHandler(e, 'remove'));
  });

  function highlightHandler(e: any, action: string) {
    const clazz = e.target.dataset.highlight;
    let tagName = e.target.tagName === 'SPAN' ? 'div' : 'span';
    if(e.target.dataset.all) {
      tagName = '';
    }
    const tokens = document.querySelectorAll(`${tagName}[data-highlight="${clazz}"]`);
    Array.prototype.forEach.call(tokens, (x) => x.classList[action]('hover'));
  }
}

