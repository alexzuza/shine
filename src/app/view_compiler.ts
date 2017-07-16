
import { ViewCompiler } from '../../angular/compiler/src/view_compiler/view_compiler';
import { CompilerConfig } from '../../angular/compiler/src/config';
import { MissingTranslationStrategy, resolveForwardRef, Type, ViewEncapsulation } from '@angular/core';
import { JitReflector } from '../../angular/compiler/src/jit/jit_reflector';
import { ElementSchemaRegistry } from '../../angular/compiler/src/schema/element_schema_registry';
import { DomElementSchemaRegistry } from '../../angular/compiler/src/schema/dom_element_schema_registry';
import { OutputContext } from '../../angular/compiler/src/util';
import { identifierName } from '../../angular/compiler/src/compile_metadata';
import * as ir from '../../angular/compiler/src/output/output_ast';
import { jitStatements } from '../../angular/compiler/src/output/output_jit';
import { StyleCompiler } from '../../angular/compiler/src/style_compiler';
import { UrlResolver } from '../../angular/compiler/src/url_resolver';

import * as cpl from '../../angular/compiler/src/compile_metadata';
import {getAllLifecycleHooks} from '../../angular/compiler/src/lifecycle_reflector';
import { stringify } from '../../angular/core/src/util';

const config =  new CompilerConfig({
  useJit: true,
  defaultEncapsulation: ViewEncapsulation.Emulated,
  missingTranslation: MissingTranslationStrategy.Warning,
  enableLegacyTemplate: true,
});
const reflector = new JitReflector();
let schema: ElementSchemaRegistry = new DomElementSchemaRegistry();

const viewCompiler = new ViewCompiler(config, reflector, schema);


export function getTypeMetadata(
  type: Type<any>, dependencies: any[]|null = null,
  throwOnUnknownDeps = true): cpl.CompileTypeMetadata {
  const identifier = _getIdentifierMetadata(type);
  return {
    reference: identifier.reference,
    diDeps: [],
    lifecycleHooks: getAllLifecycleHooks(reflector, identifier.reference),
  };
}

function _getIdentifierMetadata(type: Type<any>): cpl.CompileIdentifierMetadata {
  type = resolveForwardRef(type);
  return {reference: type};
}

export function getComponentViewClass(dirType: any): any|cpl.ProxyClass {
  return _createProxyClass(dirType, cpl.viewClassName(dirType, 0));
}

function _createProxyClass(baseType: any, name: string): cpl.ProxyClass {
  let delegate: any = null;
  const proxyClass: cpl.ProxyClass = <any>function() {
    if (!delegate) {
      throw new Error(
        `Illegal state: Class ${name} for type ${stringify(baseType)} is not compiled yet!`);
    }
    return delegate.apply(this, arguments);
  };
  proxyClass.setDelegate = (d) => {
    delegate = d;
    (<any>proxyClass).prototype = d.prototype;
  };
  // Make stringify work correctly
  (<any>proxyClass).overriddenName = name;
  return proxyClass;
}


function createOutputContext(): OutputContext {
  const importExpr = (symbol: any) =>
    ir.importExpr({name: identifierName(symbol), moduleName: null, runtime: symbol});
  return {statements: [], genFilePath: '', importExpr};
}

const styleCompiler = new StyleCompiler(new UrlResolver());
export function compileComponent(compMeta, parsedTemplate) {
  const outputContext = createOutputContext();
  debugger

  const componentStylesheet = styleCompiler.compileComponent(outputContext, compMeta);
  viewCompiler.compileComponent(
    outputContext, compMeta, parsedTemplate, ir.variable(componentStylesheet.stylesVar),
    []);

  jitStatements('ng:///test.js', outputContext.statements);
}
