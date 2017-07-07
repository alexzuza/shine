

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
  NgContentAst, ReferenceAst,
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
import {
  DEFAULT_INTERPOLATION_CONFIG,
  InterpolationConfig
} from '../../angular/compiler/src/ml_parser/interpolation_config';
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


const astCode = document.getElementById('astCode');
const list = document.getElementById('types-list3');

function consumeLi(text: string, highlight: string, context) {
  var li = document.createElement('li');

  const div = document.createElement('div');
  div.innerHTML = text;
  div.dataset.highlight = highlight;
  li.appendChild(div);

  context.appendChild(li);

  return li;
}
function consumeSpan(text: string, highlight: string): void {
  let span = document.createElement('span');
  span.textContent = text;

  span.setAttribute('data-highlight', highlight);

  astCode.appendChild(span);
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



function humanizeTplAstSourceSpans(
  templateAsts: TemplateAst[]): any[] {
  const humanizer = new TemplateHumanizer(true);
  templateVisitAll(humanizer, templateAsts);
  return humanizer.result;
}

class TemplateHumanizer implements TemplateAstVisitor {
  result: any[] = [];

  constructor(private includeSourceSpan: boolean){};

  visitNgContent(ast: NgContentAst, context: any): any {
    const res = [NgContentAst.name];
    this.result.push(this._appendContext(ast, res));
    return null;
  }
  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any {
    const res = [EmbeddedTemplateAst.name];
    this.result.push(this._appendContext(ast, res));
    templateVisitAll(this, ast.attrs);
    templateVisitAll(this, ast.outputs);
    templateVisitAll(this, ast.references);
    templateVisitAll(this, ast.variables);
    templateVisitAll(this, ast.directives);
    templateVisitAll(this, ast.children);
    return null;
  }
  visitElement(ast: ElementAst, context: any): any {
    const res = [ElementAst.name, ast.name];
    this.result.push(this._appendContext(ast, res));
    templateVisitAll(this, ast.attrs);
    templateVisitAll(this, ast.inputs);
    templateVisitAll(this, ast.outputs);
    templateVisitAll(this, ast.references);
    templateVisitAll(this, ast.directives);
    templateVisitAll(this, ast.children);
    return null;
  }
  visitReference(ast: ReferenceAst, context: any): any {
    const res = [ReferenceAst.name, ast.name, ast.value];
    this.result.push(this._appendContext(ast, res));
    return null;
  }
  visitVariable(ast: VariableAst, context: any): any {
    const res = [VariableAst, ast.name, ast.value];
    this.result.push(this._appendContext(ast, res));
    return null;
  }
  visitEvent(ast: BoundEventAst, context: any): any {
    const res =
      [BoundEventAst, ast.name, ast.target, ast.handler];
    this.result.push(this._appendContext(ast, res));
    return null;
  }
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any {
    const res = [
      BoundElementPropertyAst, ast.type, ast.name, ast.value,
      ast.unit
    ];
    this.result.push(this._appendContext(ast, res));
    return null;
  }
  visitAttr(ast: AttrAst, context: any): any {
    const res = [AttrAst, ast.name, ast.value];
    this.result.push(this._appendContext(ast, res));
    return null;
  }
  visitBoundText(ast: BoundTextAst, context: any): any {
    const res = [BoundTextAst, ast.value];
    this.result.push(this._appendContext(ast, res));
    return null;
  }
  visitText(ast: TextAst, context: any): any {
    const res = [TextAst, ast.value];
    this.result.push(this._appendContext(ast, res));
    return null;
  }
  visitDirective(ast: DirectiveAst, context: any): any {
    const res = [DirectiveAst.name, ast.directive];
    this.result.push(this._appendContext(ast, res));
    templateVisitAll(this, ast.inputs);
    templateVisitAll(this, ast.hostProperties);
    templateVisitAll(this, ast.hostEvents);
    return null;
  }
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any {
    const res = [
      BoundDirectivePropertyAst, ast.directiveName, ast.value
    ];
    this.result.push(this._appendContext(ast, res));
    return null;
  }

  private _appendContext(ast: TemplateAst, input: any[]): any[] {
    if (!this.includeSourceSpan) return input;
    input.push(ast.sourceSpan !.toString());
    return input;
  }
}


let counter = 0;
export function parseTemplate(template: string) {
  const result = parse(template, [ngIf, ngForOf]);
  debugger
  const v = humanizeTplAstSourceSpans(result);


  result.forEach(x => {

    const name = Object.getPrototypeOf(x).constructor.name;
    const type = name + counter++;
    const span = x.sourceSpan.toString();

    consumeSpan(span, type);
    consumeLi(name, type, list);
  });


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