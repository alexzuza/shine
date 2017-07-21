import { htmlParserTest } from './app/html_parser_test';
declare let require: any;
require('../main.css');

import { testParser } from './app/parser_test';
import { parseTemplate } from './app/template_parser';
import { CompileDirectiveMetadata, CompileTemplateMetadata } from '../angular/compiler/src/compile_metadata';
import { ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { compileComponent, getComponentViewClass, getTypeMetadata } from './app/view_compiler';
import { emit } from './app/emitter_test';


let text = `
  <h1>Test {{ interpolation }}</h1>
  <div>
    <child [prop1]="x" label="{{ prefix + title }}">
      <ng-template>
        <div *ngFor="let item of items">{{ item }}</div>
      </ng-template>
    </child>
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

/*text = `
  <div *ngIf="3">hi</div>
  <ng-template #d let-t>Hello</ng-template>
`;*/

text = `
  <div *ngFor="let foo of foobars" (click)="2" (blur)="0" #d>
    Hello
  </div>
`;


const inputBox: any = document.getElementById('input');
const runBtn = document.getElementById('runBtn');

inputBox.value = text;
class Zuz {

}

runBtn.addEventListener('click', parse);
parse();
function parse() {
  text = inputBox.value;
  // Step 1
  testParser(text);
  // Step 2
  htmlParserTest(text);
  // Step 3
  const parsedResult = parseTemplate(text);

  const compMeta = CompileDirectiveMetadata.create({
    isHost: false,
    selector: 'zuz',
    exportAs: null,
    isComponent: true,
    type: getTypeMetadata(Zuz),
    template: new CompileTemplateMetadata({
      encapsulation: ViewEncapsulation.Emulated,
      template: text,
      templateUrl: null,
      styles: [],
      styleUrls: [],
      externalStylesheets: [],
      ngContentSelectors: [],
      animations: [],
      interpolation: null,
      isInline: true
    }),
    changeDetection: ChangeDetectionStrategy.Default,
    inputs: [],
    outputs: [],
    host: {},
    providers: [],
    viewProviders: [],
    queries: [],
    viewQueries: [],
    entryComponents: [],
    componentViewType: getComponentViewClass(Zuz),
    rendererType: <any>{},
    componentFactory: null
  });

  compileComponent(compMeta, parsedResult);

  handleHover();
}




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


