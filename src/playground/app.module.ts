import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

import { ShineButtonModule } from 'angular-shine';

@NgModule({
  imports: [BrowserModule, ShineButtonModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
