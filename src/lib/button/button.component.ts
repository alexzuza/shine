import { Component } from '@angular/core';

@Component({
  selector: 'shine-button',
  template: `
    <button (click)="test()">Hi, i am new button</button>
  `,
  styles: [`
    button { 
      border: 3px solid;
      background: #369;
      color: #fff;
    }
  `]
})
export class ShineButtonComponent {
  test() {
    alert('Hhhhhhhhhhhhhhhhhhhhhiiiiiiiiii!');
  }
}
