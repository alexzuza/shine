

import {
  CompileAnimationEntryMetadata,
  CompileDirectiveMetadata,
  CompileDirectiveSummary, CompileEntryComponentMetadata, CompilePipeSummary, CompileProviderMetadata,
  CompileQueryMetadata, CompileStylesheetMetadata, CompileTemplateMetadata,
  CompileTypeMetadata, ProxyClass
} from '../../angular/compiler/src/compile_metadata';
import {
  ChangeDetectionStrategy, ComponentFactory, RendererType2, SchemaMetadata, ViewEncapsulation,
  ɵConsole as Console
} from '@angular/core';
import {
  AttrAst, BoundDirectivePropertyAst,
  BoundElementPropertyAst,
  BoundEventAst, BoundTextAst, DirectiveAst,
  ElementAst,
  EmbeddedTemplateAst,
  NgContentAst, PropertyBindingType, ReferenceAst,
  TemplateAst, TemplateAstVisitor,
  templateVisitAll, TextAst, VariableAst
} from '../../angular/compiler/src/template_parser/template_ast';
import { TemplateParser } from '../../angular/compiler/src/template_parser/template_parser';
import { CompilerConfig } from '../../angular/compiler/src/config';
import { JitReflector } from '../../angular/compiler/src/jit/jit_reflector';
import { Lexer } from '../../angular/compiler/src/expression_parser/lexer';
import { Parser } from '../../angular/compiler/src/expression_parser/parser';
import { DomElementSchemaRegistry } from '../../angular/compiler/src/schema/dom_element_schema_registry';
import { HtmlParser } from '../../angular/compiler/src/ml_parser/html_parser';
import * as i18n from '../../angular/compiler/src/i18n/index';
import { StaticSymbol } from '../../angular/compiler/src/aot/static_symbol';
import { noUndefined } from '../../angular/compiler/src/util';

import { ParseSourceSpan } from '../../angular/compiler/src/parse_util';
import { split } from './util';
const config = new CompilerConfig();
const reflector = new JitReflector();
const lexer = new Lexer();
const parser = new Parser(lexer);
const schema = new DomElementSchemaRegistry();

const baseHtmlParser = new HtmlParser();
const console = new Console()
const htmlParser =  new i18n.I18NHtmlParser(
  baseHtmlParser, null, null, config.missingTranslation !, console);
const templateParser = new TemplateParser(config, reflector, parser, schema, htmlParser, console, null);

const someModuleUrl = 'package:someModule';
function createTypeMeta({reference, diDeps}: {reference: any, diDeps?: any[]}):
CompileTypeMetadata {
  return {reference: reference, diDeps: diDeps || [], lifecycleHooks: []};
}

function compileDirectiveMetadataCreate(
  {isHost, type, isComponent, selector, exportAs, changeDetection, inputs, outputs, host,
    providers, viewProviders, queries, viewQueries, entryComponents, template, componentViewType,
    rendererType, componentFactory}: {
    isHost?: boolean,
    type?: CompileTypeMetadata,
    isComponent?: boolean,
    selector?: string | null,
    exportAs?: string | null,
    changeDetection?: ChangeDetectionStrategy | null,
    inputs?: string[],
    outputs?: string[],
    host?: {[key: string]: string},
    providers?: CompileProviderMetadata[] | null,
    viewProviders?: CompileProviderMetadata[] | null,
    queries?: CompileQueryMetadata[] | null,
    viewQueries?: CompileQueryMetadata[],
    entryComponents?: CompileEntryComponentMetadata[],
    template?: CompileTemplateMetadata,
    componentViewType?: StaticSymbol | ProxyClass | null,
    rendererType?: StaticSymbol | RendererType2 | null,
    componentFactory?: StaticSymbol | ComponentFactory<any>
  }) {
  return CompileDirectiveMetadata.create({
    isHost: !!isHost,
    type: noUndefined(type) !,
    isComponent: !!isComponent,
    selector: noUndefined(selector),
    exportAs: noUndefined(exportAs),
    changeDetection: null,
    inputs: inputs || [],
    outputs: outputs || [],
    host: host || {},
    providers: providers || [],
    viewProviders: viewProviders || [],
    queries: queries || [],
    viewQueries: viewQueries || [],
    entryComponents: entryComponents || [],
    template: noUndefined(template) !,
    componentViewType: noUndefined(componentViewType),
    rendererType: noUndefined(rendererType),
    componentFactory: noUndefined(componentFactory),
  });
}

function compileTemplateMetadata({encapsulation, template, templateUrl, styles, styleUrls,
                                   externalStylesheets, animations, ngContentSelectors,
                                   interpolation, isInline}: {
  encapsulation?: ViewEncapsulation | null,
  template?: string | null,
  templateUrl?: string | null,
  styles?: string[],
  styleUrls?: string[],
  externalStylesheets?: CompileStylesheetMetadata[],
  ngContentSelectors?: string[],
  animations?: any[],
  interpolation?: [string, string] | null,
  isInline?: boolean
}): CompileTemplateMetadata {
  return new CompileTemplateMetadata({
    encapsulation: noUndefined(encapsulation),
    template: noUndefined(template),
    templateUrl: noUndefined(templateUrl),
    styles: styles || [],
    styleUrls: styleUrls || [],
    externalStylesheets: externalStylesheets || [],
    animations: animations || [],
    ngContentSelectors: ngContentSelectors || [],
    interpolation: noUndefined(interpolation),
    isInline: !!isInline
  });
}

const someAnimation = new CompileAnimationEntryMetadata('someAnimation', []);
const someTemplate = compileTemplateMetadata({animations: [someAnimation]});
const component = compileDirectiveMetadataCreate({
  isHost: false,
  selector: 'root',
  template: someTemplate,
  type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'Root'}}),
  isComponent: true
});

let parse =
  (template: string, directives: CompileDirectiveSummary[],
   pipes: CompilePipeSummary[] | null = null,
   schemas: SchemaMetadata[] = []): TemplateAst[] => {
    if (pipes === null) {
      pipes = [];
    }
    return templateParser.parse(component, template, directives, pipes, schemas, 'TestComp')
      .template;
  };

const ngIf = compileDirectiveMetadataCreate({
               selector: '[ngIf]',
               template: someTemplate,
               type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'NgIf'}}),
               inputs: ['ngIf']
             }).toSummary();

const ngForOf = compileDirectiveMetadataCreate({
  selector: '[ngFor][ngForOf]',
  template: null,
  type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'ngForOf'}}),
  inputs: ['ngForOf', 'ngForTemplate', 'ngForTrackBy']
}).toSummary();
const templateWithOutput =
  compileDirectiveMetadataCreate({
    selector: 'template,ng-template',
    outputs: ['e'],
    type: createTypeMeta({reference: {filePath: someModuleUrl, name: 'DirA'}})
  }).toSummary();





const astCode = document.getElementById('astCode');
const list = document.getElementById('ast-list');

function consumeLi(text: string, highlight: string, context, className = null) {
  const li = document.createElement('li');

  const div = document.createElement('div');
  div.innerHTML = text;
  div.dataset.highlight = highlight;
  if(className) {
    div.className = className;
  }
  li.appendChild(div);

  context.appendChild(li);

  return li;
}

let lastSourceSpan: ParseSourceSpan;
function consumeSpan(sourceSpan: ParseSourceSpan, highlight: string): void {
  let span = document.createElement('span');

  if(lastSourceSpan === sourceSpan) {
    return;
  }
  if(lastSourceSpan) {
    const space = split(lastSourceSpan.end, sourceSpan.start);
    if(space) {
      const content = document.createTextNode(space);
      astCode.appendChild(content);
    }
  }

  span.textContent = sourceSpan.toString();

  span.setAttribute('data-highlight', highlight);

  astCode.appendChild(span);
  lastSourceSpan = sourceSpan;
}


function humanizeTplAstSourceSpans(templateAsts: TemplateAst[]): void {
  const humanizer = new TemplateHumanizer();
  templateVisitAll(humanizer, templateAsts, list);
}


function createDiv(className: string, parent) {
  const div = document.createElement('div');
  div.className = className;
  parent.appendChild(div);
  return div;
}

let counter = 0;


class TemplateHumanizer implements TemplateAstVisitor {
  visitElement(ast: ElementAst, context: any): any {
    const name = Object.getPrototypeOf(ast).constructor.name;
    const type = name + counter++;
    consumeSpan(ast.sourceSpan, type);

    const li = consumeLi(name + ' ' + ast.name, type, context, 'ast-block');

    const infoDiv = createDiv('ast-info', li.children[0]);

    ['attrs', 'inputs', 'outputs', 'references', 'directives'].forEach(key => {
      const div = createDiv('ast-props', infoDiv);
      const label = createDiv('ast-props__label', div);
      label.textContent = key
      templateVisitAll(this, ast[key], div);
    });

    const liContainer = document.createElement('ul');
    templateVisitAll(this, ast.children, liContainer);
    li.appendChild(liContainer);
  }

  visitNgContent(ast: NgContentAst, context: any): any {
    const name = Object.getPrototypeOf(ast).constructor.name;
    const type = name + counter++;
    consumeSpan(ast.sourceSpan, type);
    consumeLi(name, type, context);
  }
  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any {
    const name = Object.getPrototypeOf(ast).constructor.name;
    const type = name + counter++;
    consumeSpan(ast.sourceSpan, type);
    const li = consumeLi(name, type, context, 'ast-block');

    [ast.attrs, ast.outputs, ast.references, ast.variables, ast.directives].forEach(x => {
      const div = document.createElement('div');
      div.className = 'ast-props';
      templateVisitAll(this, x, div);
      li.children[0].appendChild(div);
    });

    const liContainer = document.createElement('ul');
    templateVisitAll(this, ast.children, liContainer);
    li.appendChild(liContainer);
    return null;
  }

  visitReference(ast: ReferenceAst, context: any): any {
    context.innerHTML += '<strong>ReferenceAst</strong> - ' + ast.name + ': ' + (ast.value ? ast.value.identifier.reference.name : '');
  }
  visitVariable(ast: VariableAst, context: any): any {
    context.innerHTML += '<strong>VariableAst</strong> - ' + ast.name + ': ' + ast.value;
  }
  visitEvent(ast: BoundEventAst, context: any): any {
    const res = [BoundEventAst, ast.name, ast.target, ast.handler];
    context.innerHTML += 'outputs<strong>BoundEventAst</strong> - ' + ast.name + ' ' + ast.target + ' ' + ast.handler;
  }
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any {
    const res = [BoundElementPropertyAst, ast.type, ast.name, ast.value, ast.unit];

    const type = PropertyBindingType[ast.type];

    context.innerHTML += `<strong>BoundElementPropertyAst</strong> - \n\t\ttype: PropertyBindingType.${type}, \n\t\tname: ${ast.name}, \n\t\tval: ${ast.value}, \n\t\tunits: ${ast.unit}`;
  }
  visitAttr(ast: AttrAst, context: any): any {
    context.innerHTML += '<strong>AttrAst</strong> - ' + ast.name + ': ' + ast.value;
  }
  visitBoundText(ast: BoundTextAst, context: any): any {
    const name = Object.getPrototypeOf(ast).constructor.name;
    const type = name + counter++;
    consumeSpan(ast.sourceSpan, type);
    consumeLi(name, type, context);
  }
  visitText(ast: TextAst, context: any): any {
    const name = Object.getPrototypeOf(ast).constructor.name;
    const type = name + counter++;
    consumeSpan(ast.sourceSpan, type);
    consumeLi(name, type, context);
  }
  visitDirective(ast: DirectiveAst, context: any): any {
    context.innerHTML = `<strong>DirectiveAst</strong> - selector: ${ast.directive.selector}, name: ${ast.directive.type.reference.name}`;

    [ast.inputs, ast.hostProperties, ast.hostEvents].forEach(x => {
      const div = document.createElement('div');
      div.className = 'ast-props';
      templateVisitAll(this, x, div);
      context.appendChild(div);
    });
  }
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any {
    context.innerHTML = 'inputs<strong>BoundDirectivePropertyAst</strong> - ' + ast.value;
  }
}


export function parseTemplate(template: string) {
  const result = parse(template, [ngIf, ngForOf, templateWithOutput]);

  humanizeTplAstSourceSpans(result);

  let span = document.createElement('span');
  span.textContent += lastSourceSpan.end.file.content.substring(lastSourceSpan.end.offset);
  astCode.appendChild(span);


}




// import {
//     CompileDirectiveMetadata, CompileDirectiveSummary, CompilePipeSummary,
//     CompilerConfig, CompileReflector, ElementSchemaRegistry, I18NHtmlParser, Parser,
//     TEMPLATE_TRANSFORMS, TemplateAst, TemplateAstVisitor, TemplateParser
// } from '@angular/compiler';
// import { Inject, Optional, SchemaMetadata, ɵConsole as Console } from '@angular/core';

// @Injectable()
// export class TemplateParser2 extends TemplateParser {
//     constructor(_config: CompilerConfig, _reflector: CompileReflector,
//                 _exprParser: Parser, _schemaRegistry: ElementSchemaRegistry,
//                 _htmlParser: I18NHtmlParser, _console: Console,
//                 @Optional() @Inject(TEMPLATE_TRANSFORMS) public transforms: TemplateAstVisitor[]) {
//         super(_config, _reflector, _exprParser, _schemaRegistry, _htmlParser, _console, transforms);

//     }

//     parse(component: CompileDirectiveMetadata, template: string, directives: CompileDirectiveSummary[], pipes: CompilePipeSummary[],
//           schemas: SchemaMetadata[], templateUrl: string): {
//         template: TemplateAst[];
//         pipes: CompilePipeSummary[];
//     } {
//         const result = super.parse(component, template, directives, pipes, schemas, templateUrl);
//         console.log(component.type.reference.name, result.template)
//         return result;
//     }
// }


// platformBrowserDynamic().bootstrapModule(AppModule, { providers: [ { provide: TemplateParser, useClass: TemplateParser2 }]});