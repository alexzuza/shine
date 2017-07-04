

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
import { TemplateAst } from '../../angular/compiler/src/template_parser/template_ast';
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


export function parseTemplate(template: string) {
  return parse(template, []);
}
