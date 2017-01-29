import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShineButtonComponent } from './button.component';

let t: any = 5;
@NgModule({
  imports: [CommonModule],
  declarations: [ShineButtonComponent],
  exports: [ShineButtonComponent]
})
export class ShineButtonModule { }
