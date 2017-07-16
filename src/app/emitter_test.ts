



import { literal, literalArr, variable } from './output/expressions';




export function emit() {
  debugger
  const foo = variable('test').set(literalArr([literal(3)]));
}