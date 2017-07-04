

import { ParseLocation } from '../../angular/compiler/src/parse_util';

export function split(prevLocation: ParseLocation, curLocation: ParseLocation): string {
  let result = '';
  if(prevLocation.line === curLocation.line) {
    const count = curLocation.col - prevLocation.col + 1;
    result += Array(count).join(' ');
  } else {
    for(let k = prevLocation.line; k <= curLocation.line; k++) {
      if(k === curLocation.line) {
        result += Array(curLocation.col + 1).join(' ');
      } else {
        result += '\n';
      }
    }
  }

  return result;
}
