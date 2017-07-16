

import { INFERRED_TYPE, Type, BOOL_TYPE, MapType } from './types';
import { ParseSourceSpan } from '../../../angular/compiler/src/parse_util';
import { DeclareFunctionStmt, DeclareVarStmt, ExpressionStatement, Statement, StmtModifier } from './statements';
import { FnParam } from './common';

export enum BinaryOperator {
  Equals,
  NotEquals,
  Identical,
  NotIdentical,
  Minus,
  Plus,
  Divide,
  Multiply,
  Modulo,
  And,
  Or,
  Lower,
  LowerEquals,
  Bigger,
  BiggerEquals
}


export abstract class Expression {
  public type: Type|null;
  public sourceSpan: ParseSourceSpan|null;

  constructor(type: Type|null|undefined, sourceSpan?: ParseSourceSpan|null) {
    this.type = type || null;
    this.sourceSpan = sourceSpan || null;
  }

  abstract visitExpression(visitor: ExpressionVisitor, context: any): any;

  prop(name: string, sourceSpan?: ParseSourceSpan|null): ReadPropExpr {
    return new ReadPropExpr(this, name, null, sourceSpan);
  }

  key(index: Expression, type?: Type|null, sourceSpan?: ParseSourceSpan|null): ReadKeyExpr {
    return new ReadKeyExpr(this, index, type, sourceSpan);
  }

  callMethod(name: string|BuiltinMethod, params: Expression[], sourceSpan?: ParseSourceSpan|null):
  InvokeMethodExpr {
    return new InvokeMethodExpr(this, name, params, null, sourceSpan);
  }

  callFn(params: Expression[], sourceSpan?: ParseSourceSpan|null): InvokeFunctionExpr {
    return new InvokeFunctionExpr(this, params, null, sourceSpan);
  }

  instantiate(params: Expression[], type?: Type|null, sourceSpan?: ParseSourceSpan|null):
  InstantiateExpr {
    return new InstantiateExpr(this, params, type, sourceSpan);
  }

  conditional(
    trueCase: Expression, falseCase: Expression|null = null,
    sourceSpan?: ParseSourceSpan|null): ConditionalExpr {
    return new ConditionalExpr(this, trueCase, falseCase, null, sourceSpan);
  }

  equals(rhs: Expression, sourceSpan?: ParseSourceSpan|null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Equals, this, rhs, null, sourceSpan);
  }
  notEquals(rhs: Expression, sourceSpan?: ParseSourceSpan|null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.NotEquals, this, rhs, null, sourceSpan);
  }
  identical(rhs: Expression, sourceSpan?: ParseSourceSpan|null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Identical, this, rhs, null, sourceSpan);
  }
  notIdentical(rhs: Expression, sourceSpan?: ParseSourceSpan|null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.NotIdentical, this, rhs, null, sourceSpan);
  }
  minus(rhs: Expression, sourceSpan?: ParseSourceSpan|null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Minus, this, rhs, null, sourceSpan);
  }
  plus(rhs: Expression, sourceSpan?: ParseSourceSpan|null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Plus, this, rhs, null, sourceSpan);
  }
  divide(rhs: Expression, sourceSpan?: ParseSourceSpan|null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Divide, this, rhs, null, sourceSpan);
  }
  multiply(rhs: Expression, sourceSpan?: ParseSourceSpan|null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Multiply, this, rhs, null, sourceSpan);
  }
  modulo(rhs: Expression, sourceSpan?: ParseSourceSpan|null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Modulo, this, rhs, null, sourceSpan);
  }
  and(rhs: Expression, sourceSpan?: ParseSourceSpan|null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.And, this, rhs, null, sourceSpan);
  }
  or(rhs: Expression, sourceSpan?: ParseSourceSpan|null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Or, this, rhs, null, sourceSpan);
  }
  lower(rhs: Expression, sourceSpan?: ParseSourceSpan|null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Lower, this, rhs, null, sourceSpan);
  }
  lowerEquals(rhs: Expression, sourceSpan?: ParseSourceSpan|null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.LowerEquals, this, rhs, null, sourceSpan);
  }
  bigger(rhs: Expression, sourceSpan?: ParseSourceSpan|null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Bigger, this, rhs, null, sourceSpan);
  }
  biggerEquals(rhs: Expression, sourceSpan?: ParseSourceSpan|null): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.BiggerEquals, this, rhs, null, sourceSpan);
  }
  isBlank(sourceSpan?: ParseSourceSpan|null): Expression {
    // Note: We use equals by purpose here to compare to null and undefined in JS.
    // We use the typed null to allow strictNullChecks to narrow types.
    return this.equals(TYPED_NULL_EXPR, sourceSpan);
  }
  cast(type: Type, sourceSpan?: ParseSourceSpan|null): Expression {
    return new CastExpr(this, type, sourceSpan);
  }

  toStmt(): Statement { return new ExpressionStatement(this, null); }
}

export enum BuiltinVar {
  This,
  Super,
  CatchError,
  CatchStack
}

export class ReadVarExpr extends Expression {
  public name: string|null;
  public builtin: BuiltinVar|null;

  constructor(name: string|BuiltinVar, type?: Type|null, sourceSpan?: ParseSourceSpan|null) {
    super(type, sourceSpan);
    if (typeof name === 'string') {
      this.name = name;
      this.builtin = null;
    } else {
      this.name = null;
      this.builtin = <BuiltinVar>name;
    }
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitReadVarExpr(this, context);
  }

  set(value: Expression): WriteVarExpr {
    if (!this.name) {
      throw new Error(`Built in variable ${this.builtin} can not be assigned to.`)
    }
    return new WriteVarExpr(this.name, value, null, this.sourceSpan);
  }
}

export class WriteVarExpr extends Expression {
  public value: Expression;
  constructor(
    public name: string, value: Expression, type?: Type|null, sourceSpan?: ParseSourceSpan|null) {
    super(type || value.type, sourceSpan);
    this.value = value;
  }

  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitWriteVarExpr(this, context);
  }

  toDeclStmt(type?: Type|null, modifiers?: StmtModifier[]|null): DeclareVarStmt {
    return new DeclareVarStmt(this.name, this.value, type, modifiers, this.sourceSpan);
  }
}

export class WriteKeyExpr extends Expression {
  public value: Expression;
  constructor(
    public receiver: Expression, public index: Expression, value: Expression, type?: Type|null,
    sourceSpan?: ParseSourceSpan|null) {
    super(type || value.type, sourceSpan);
    this.value = value;
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitWriteKeyExpr(this, context);
  }
}

export class WritePropExpr extends Expression {
  public value: Expression;
  constructor(
    public receiver: Expression, public name: string, value: Expression, type?: Type|null,
    sourceSpan?: ParseSourceSpan|null) {
    super(type || value.type, sourceSpan);
    this.value = value;
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitWritePropExpr(this, context);
  }
}

export enum BuiltinMethod {
  ConcatArray,
  SubscribeObservable,
  Bind
}

export class InvokeMethodExpr extends Expression {
  public name: string|null;
  public builtin: BuiltinMethod|null;
  constructor(
    public receiver: Expression, method: string|BuiltinMethod, public args: Expression[],
    type?: Type|null, sourceSpan?: ParseSourceSpan|null) {
    super(type, sourceSpan);
    if (typeof method === 'string') {
      this.name = method;
      this.builtin = null;
    } else {
      this.name = null;
      this.builtin = <BuiltinMethod>method;
    }
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitInvokeMethodExpr(this, context);
  }
}

export class InvokeFunctionExpr extends Expression {
  constructor(
    public fn: Expression, public args: Expression[], type?: Type|null,
    sourceSpan?: ParseSourceSpan|null) {
    super(type, sourceSpan);
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitInvokeFunctionExpr(this, context);
  }
}

export class InstantiateExpr extends Expression {
  constructor(
    public classExpr: Expression, public args: Expression[], type?: Type|null,
    sourceSpan?: ParseSourceSpan|null) {
    super(type, sourceSpan);
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitInstantiateExpr(this, context);
  }
}

export class LiteralExpr extends Expression {
  constructor(public value: any, type?: Type|null, sourceSpan?: ParseSourceSpan|null) {
    super(type, sourceSpan);
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitLiteralExpr(this, context);
  }
}

export class ExternalExpr extends Expression {
  constructor(
    public value: ExternalReference, type?: Type|null, public typeParams: Type[]|null = null,
    sourceSpan?: ParseSourceSpan|null) {
    super(type, sourceSpan);
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitExternalExpr(this, context);
  }
}

export class ExternalReference {
  constructor(public moduleName: string|null, public name: string|null, public runtime: any|null) {}
}

export class ConditionalExpr extends Expression {
  public trueCase: Expression;
  constructor(
    public condition: Expression, trueCase: Expression, public falseCase: Expression|null = null,
    type?: Type|null, sourceSpan?: ParseSourceSpan|null) {
    super(type || trueCase.type, sourceSpan);
    this.trueCase = trueCase;
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitConditionalExpr(this, context);
  }
}

export class NotExpr extends Expression {
  constructor(public condition: Expression, sourceSpan?: ParseSourceSpan|null) {
    super(BOOL_TYPE, sourceSpan);
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitNotExpr(this, context);
  }
}

export class AssertNotNull extends Expression {
  constructor(public condition: Expression, sourceSpan?: ParseSourceSpan|null) {
    super(condition.type, sourceSpan);
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitAssertNotNullExpr(this, context);
  }
}

export class CastExpr extends Expression {
  constructor(public value: Expression, type?: Type|null, sourceSpan?: ParseSourceSpan|null) {
    super(type, sourceSpan);
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitCastExpr(this, context);
  }
}

export class FunctionExpr extends Expression {
  constructor(
    public params: FnParam[], public statements: Statement[], type?: Type|null,
    sourceSpan?: ParseSourceSpan|null) {
    super(type, sourceSpan);
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitFunctionExpr(this, context);
  }

  toDeclStmt(name: string, modifiers: StmtModifier[]|null = null): DeclareFunctionStmt {
    return new DeclareFunctionStmt(
      name, this.params, this.statements, this.type, modifiers, this.sourceSpan);
  }
}

export class BinaryOperatorExpr extends Expression {
  public lhs: Expression;
  constructor(
    public operator: BinaryOperator, lhs: Expression, public rhs: Expression, type?: Type|null,
    sourceSpan?: ParseSourceSpan|null) {
    super(type || lhs.type, sourceSpan);
    this.lhs = lhs;
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitBinaryOperatorExpr(this, context);
  }
}

export class ReadPropExpr extends Expression {
  constructor(
    public receiver: Expression, public name: string, type?: Type|null,
    sourceSpan?: ParseSourceSpan|null) {
    super(type, sourceSpan);
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitReadPropExpr(this, context);
  }
  set(value: Expression): WritePropExpr {
    return new WritePropExpr(this.receiver, this.name, value, null, this.sourceSpan);
  }
}

export class ReadKeyExpr extends Expression {
  constructor(
    public receiver: Expression, public index: Expression, type?: Type|null,
    sourceSpan?: ParseSourceSpan|null) {
    super(type, sourceSpan);
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitReadKeyExpr(this, context);
  }
  set(value: Expression): WriteKeyExpr {
    return new WriteKeyExpr(this.receiver, this.index, value, null, this.sourceSpan);
  }
}

export class LiteralArrayExpr extends Expression {
  public entries: Expression[];
  constructor(entries: Expression[], type?: Type|null, sourceSpan?: ParseSourceSpan|null) {
    super(type, sourceSpan);
    this.entries = entries;
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitLiteralArrayExpr(this, context);
  }
}

export class LiteralMapEntry {
  constructor(public key: string, public value: Expression, public quoted: boolean) {}
}

export class LiteralMapExpr extends Expression {
  public valueType: Type|null = null;
  constructor(
    public entries: LiteralMapEntry[], type?: MapType|null, sourceSpan?: ParseSourceSpan|null) {
    super(type, sourceSpan);
    if (type) {
      this.valueType = type.valueType;
    }
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitLiteralMapExpr(this, context);
  }
}

export class CommaExpr extends Expression {
  constructor(public parts: Expression[], sourceSpan?: ParseSourceSpan|null) {
    super(parts[parts.length - 1].type, sourceSpan);
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitCommaExpr(this, context);
  }
}

export interface ExpressionVisitor {
  visitReadVarExpr(ast: ReadVarExpr, context: any): any;
  visitWriteVarExpr(expr: WriteVarExpr, context: any): any;
  visitWriteKeyExpr(expr: WriteKeyExpr, context: any): any;
  visitWritePropExpr(expr: WritePropExpr, context: any): any;
  visitInvokeMethodExpr(ast: InvokeMethodExpr, context: any): any;
  visitInvokeFunctionExpr(ast: InvokeFunctionExpr, context: any): any;
  visitInstantiateExpr(ast: InstantiateExpr, context: any): any;
  visitLiteralExpr(ast: LiteralExpr, context: any): any;
  visitExternalExpr(ast: ExternalExpr, context: any): any;
  visitConditionalExpr(ast: ConditionalExpr, context: any): any;
  visitNotExpr(ast: NotExpr, context: any): any;
  visitAssertNotNullExpr(ast: AssertNotNull, context: any): any;
  visitCastExpr(ast: CastExpr, context: any): any;
  visitFunctionExpr(ast: FunctionExpr, context: any): any;
  visitBinaryOperatorExpr(ast: BinaryOperatorExpr, context: any): any;
  visitReadPropExpr(ast: ReadPropExpr, context: any): any;
  visitReadKeyExpr(ast: ReadKeyExpr, context: any): any;
  visitLiteralArrayExpr(ast: LiteralArrayExpr, context: any): any;
  visitLiteralMapExpr(ast: LiteralMapExpr, context: any): any;
  visitCommaExpr(ast: CommaExpr, context: any): any;
}

export const THIS_EXPR = new ReadVarExpr(BuiltinVar.This, null, null);
export const SUPER_EXPR = new ReadVarExpr(BuiltinVar.Super, null, null);
export const CATCH_ERROR_VAR = new ReadVarExpr(BuiltinVar.CatchError, null, null);
export const CATCH_STACK_VAR = new ReadVarExpr(BuiltinVar.CatchStack, null, null);
export const NULL_EXPR = new LiteralExpr(null, null, null);
export const TYPED_NULL_EXPR = new LiteralExpr(null, INFERRED_TYPE, null);

export function variable(
  name: string, type?: Type | null, sourceSpan?: ParseSourceSpan | null): ReadVarExpr {
  return new ReadVarExpr(name, type, sourceSpan);
}

export function literalArr(
  values: Expression[], type?: Type | null,
  sourceSpan?: ParseSourceSpan | null): LiteralArrayExpr {
  return new LiteralArrayExpr(values, type, sourceSpan);
}

export function literal(
  value: any, type?: Type | null, sourceSpan?: ParseSourceSpan | null): LiteralExpr {
  return new LiteralExpr(value, type, sourceSpan);
}
