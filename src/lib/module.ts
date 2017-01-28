import { NgModule } from '@angular/core';
import { ShineButtonModule } from './button/button.module';

@NgModule({
  imports: [ShineButtonModule],
  exports: [ShineButtonModule]
})
export class ShineModule { }

