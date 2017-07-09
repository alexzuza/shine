

import { ParseLocation } from '../../angular/compiler/src/parse_util';

export function split(prevLocation: ParseLocation, curLocation: ParseLocation): string {
  return prevLocation.file.content.substring(prevLocation.offset, curLocation.offset);
}



export function consumeLi(text: string, highlight: string, context, className = null) {
  const li = document.createElement('li');

  const div = document.createElement('div');
  div.innerHTML = text;
  div.dataset.highlight = highlight;
  if(className) {
    div.className = className;
  }
  li.appendChild(div);

  context.appendChild(li);

  return li;
}


