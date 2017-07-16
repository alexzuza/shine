

import { Expression } from './expressions';

//// Types
export enum TypeModifier {
  Const
}

export abstract class Type {
  constructor(public modifiers: TypeModifier[]|null = null) {
    if (!modifiers) {
      this.modifiers = [];
    }
  }
  abstract visitType(visitor: TypeVisitor, context: any): any;

  hasModifier(modifier: TypeModifier): boolean { return this.modifiers !.indexOf(modifier) !== -1; }
}

export enum BuiltinTypeName {
  Dynamic,
  Bool,
  String,
  Int,
  Number,
  Function,
  Inferred
}

export class BuiltinType extends Type {
  constructor(public name: BuiltinTypeName, modifiers: TypeModifier[]|null = null) {
    super(modifiers);
  }
  visitType(visitor: TypeVisitor, context: any): any {
    return visitor.visitBuiltintType(this, context);
  }
}

export class ExpressionType extends Type {
  constructor(public value: Expression, modifiers: TypeModifier[]|null = null) { super(modifiers); }
  visitType(visitor: TypeVisitor, context: any): any {
    return visitor.visitExpressionType(this, context);
  }
}

export class ArrayType extends Type {
  constructor(public of : Type, modifiers: TypeModifier[]|null = null) { super(modifiers); }
  visitType(visitor: TypeVisitor, context: any): any {
    return visitor.visitArrayType(this, context);
  }
}

export class MapType extends Type {
  public valueType: Type|null;
  constructor(valueType: Type|null|undefined, modifiers: TypeModifier[]|null = null) {
    super(modifiers);
    this.valueType = valueType || null;
  }
  visitType(visitor: TypeVisitor, context: any): any { return visitor.visitMapType(this, context); }
}

export const BOOL_TYPE = new BuiltinType(BuiltinTypeName.Bool);
export const INFERRED_TYPE = new BuiltinType(BuiltinTypeName.Inferred);

export interface TypeVisitor {
  visitBuiltintType(type: BuiltinType, context: any): any;
  visitExpressionType(type: ExpressionType, context: any): any;
  visitArrayType(type: ArrayType, context: any): any;
  visitMapType(type: MapType, context: any): any;
}
