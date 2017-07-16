

//// Statements
import { ParseSourceSpan } from '../../../angular/compiler/src/parse_util';
import { Expression, StatementVisitor } from '../../../angular/compiler/src/output/output_ast';
import { Type } from './types';
import { FnParam } from './common';

export enum StmtModifier {
  Final,
  Private,
  Exported
}

export abstract class Statement {
  public modifiers: StmtModifier[];
  public sourceSpan: ParseSourceSpan|null;
  constructor(modifiers?: StmtModifier[]|null, sourceSpan?: ParseSourceSpan|null) {
    this.modifiers = modifiers || [];
    this.sourceSpan = sourceSpan || null;
  }

  abstract visitStatement(visitor: StatementVisitor, context: any): any;

  hasModifier(modifier: StmtModifier): boolean { return this.modifiers !.indexOf(modifier) !== -1; }
}

export class DeclareVarStmt extends Statement {
  public type: Type|null;
  constructor(
    public name: string, public value: Expression, type?: Type|null,
    modifiers: StmtModifier[]|null = null, sourceSpan?: ParseSourceSpan|null) {
    super(modifiers, sourceSpan);
    this.type = type || value.type;
  }

  visitStatement(visitor: StatementVisitor, context: any): any {
    return visitor.visitDeclareVarStmt(this, context);
  }
}

export class DeclareFunctionStmt extends Statement {
  public type: Type|null;
  constructor(
    public name: string, public params: FnParam[], public statements: Statement[],
    type?: Type|null, modifiers: StmtModifier[]|null = null, sourceSpan?: ParseSourceSpan|null) {
    super(modifiers, sourceSpan);
    this.type = type || null;
  }

  visitStatement(visitor: StatementVisitor, context: any): any {
    return visitor.visitDeclareFunctionStmt(this, context);
  }
}

export class ExpressionStatement extends Statement {
  constructor(public expr: Expression, sourceSpan?: ParseSourceSpan|null) {
    super(null, sourceSpan);
  }

  visitStatement(visitor: StatementVisitor, context: any): any {
    return visitor.visitExpressionStmt(this, context);
  }
}

export class ReturnStatement extends Statement {
  constructor(public value: Expression, sourceSpan?: ParseSourceSpan|null) {
    super(null, sourceSpan);
  }
  visitStatement(visitor: StatementVisitor, context: any): any {
    return visitor.visitReturnStmt(this, context);
  }
}

/*
  Class statement
 */

export class AbstractClassPart {
  public type: Type|null;
  constructor(type: Type|null|undefined, public modifiers: StmtModifier[]|null) {
    if (!modifiers) {
      this.modifiers = [];
    }
    this.type = type || null;
  }
  hasModifier(modifier: StmtModifier): boolean { return this.modifiers !.indexOf(modifier) !== -1; }
}

export class ClassField extends AbstractClassPart {
  constructor(public name: string, type?: Type|null, modifiers: StmtModifier[]|null = null) {
    super(type, modifiers);
  }
}


export class ClassMethod extends AbstractClassPart {
  constructor(
    public name: string|null, public params: FnParam[], public body: Statement[],
    type?: Type|null, modifiers: StmtModifier[]|null = null) {
    super(type, modifiers);
  }
}


export class ClassGetter extends AbstractClassPart {
  constructor(
    public name: string, public body: Statement[], type?: Type|null,
    modifiers: StmtModifier[]|null = null) {
    super(type, modifiers);
  }
}


export class ClassStmt extends Statement {
  constructor(
    public name: string, public parent: Expression|null, public fields: ClassField[],
    public getters: ClassGetter[], public constructorMethod: ClassMethod,
    public methods: ClassMethod[], modifiers: StmtModifier[]|null = null,
    sourceSpan?: ParseSourceSpan|null) {
    super(modifiers, sourceSpan);
  }
  visitStatement(visitor: StatementVisitor, context: any): any {
    return visitor.visitDeclareClassStmt(this, context);
  }
}

/*
  End Class statement
 */


export class IfStmt extends Statement {
  constructor(
    public condition: Expression, public trueCase: Statement[],
    public falseCase: Statement[] = [], sourceSpan?: ParseSourceSpan|null) {
    super(null, sourceSpan);
  }
  visitStatement(visitor: StatementVisitor, context: any): any {
    return visitor.visitIfStmt(this, context);
  }
}


export class CommentStmt extends Statement {
  constructor(public comment: string, sourceSpan?: ParseSourceSpan|null) {
    super(null, sourceSpan);
  }
  visitStatement(visitor: StatementVisitor, context: any): any {
    return visitor.visitCommentStmt(this, context);
  }
}


export class TryCatchStmt extends Statement {
  constructor(
    public bodyStmts: Statement[], public catchStmts: Statement[],
    sourceSpan?: ParseSourceSpan|null) {
    super(null, sourceSpan);
  }
  visitStatement(visitor: StatementVisitor, context: any): any {
    return visitor.visitTryCatchStmt(this, context);
  }
}


export class ThrowStmt extends Statement {
  constructor(public error: Expression, sourceSpan?: ParseSourceSpan|null) {
    super(null, sourceSpan);
  }
  visitStatement(visitor: StatementVisitor, context: any): any {
    return visitor.visitThrowStmt(this, context);
  }
}

export interface StatementVisitor {
  visitDeclareVarStmt(stmt: DeclareVarStmt, context: any): any;
  visitDeclareFunctionStmt(stmt: DeclareFunctionStmt, context: any): any;
  visitExpressionStmt(stmt: ExpressionStatement, context: any): any;
  visitReturnStmt(stmt: ReturnStatement, context: any): any;
  visitDeclareClassStmt(stmt: ClassStmt, context: any): any;
  visitIfStmt(stmt: IfStmt, context: any): any;
  visitTryCatchStmt(stmt: TryCatchStmt, context: any): any;
  visitThrowStmt(stmt: ThrowStmt, context: any): any;
  visitCommentStmt(stmt: CommentStmt, context: any): any;
}