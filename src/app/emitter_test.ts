



import { literal, literalArr, variable } from './output/expressions';




export function emit() {
  const foo = variable('test').set(literalArr([literal(3)]));
}