import { Component, NgModule } from '@angular/core';

declare var module: any;
@Component({
  moduleId: module.id,
  selector: 'shine-button',
  templateUrl: 'button.component.html',
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
