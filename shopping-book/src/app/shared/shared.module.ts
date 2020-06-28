import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';

import { DropdownDirective } from './dropdown.directive';
import { LoadingSprinnerComponent } from './loading-sprinner/loading-sprinner.component';

@NgModule({
  declarations: [
    DropdownDirective,
    LoadingSprinnerComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CommonModule,
    DropdownDirective,
    LoadingSprinnerComponent
  ]
})
export class SharedModule { }
