import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShineButtonComponent } from './button.component';

@NgModule({
  imports: [CommonModule],
  declarations: [ShineButtonComponent],
  exports: [ShineButtonComponent]
})
export class ShineButtonModule { }
