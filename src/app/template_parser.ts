

import { CompileDirectiveSummary, CompilePipeSummary } from '../../angular/compiler/src/compile_metadata';
import { SchemaMetadata } from '@angular/core';
import { TemplateAst } from '../../angular/compiler/src/template_parser/template_ast';
import { TemplateParser } from '../../angular/compiler/src/template_parser/template_parser';
import { CompilerConfig } from '../../angular/compiler/src/config';
import { JitReflector } from '../../angular/compiler/src/jit/jit_reflector';
import { Lexer } from '../../angular/compiler/src/expression_parser/lexer';
import { Parser } from '../../angular/compiler/src/expression_parser/parser';
import { DomElementSchemaRegistry } from '../../angular/compiler/src/schema/dom_element_schema_registry';

const config = new CompilerConfig();
const reflector = new JitReflector();
const lexer = new Lexer();
const parser = new Parser(lexer);
const schema = new DomElementSchemaRegistry();
// const templateParser = new TemplateParser(config, reflector, parser, schema, )
let parse: (
  template: string, directives: CompileDirectiveSummary[], pipes?: CompilePipeSummary[],
  schemas?: SchemaMetadata[]) => TemplateAst[];