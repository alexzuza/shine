

import { ParseLocation } from '../../angular/compiler/src/parse_util';

export function split(prevLocation: ParseLocation, curLocation: ParseLocation): string {
  return prevLocation.file.content.substring(prevLocation.offset, curLocation.offset);
}


