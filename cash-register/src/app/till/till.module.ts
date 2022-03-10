import { ComponentFactory, ComponentFactoryResolver, ComponentRef, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TillRoutingModule } from './till-routing.module';
import { TillComponent } from './till.component';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {TranslateModule} from "@ngx-translate/core";
import {DropdownModule} from "primeng/dropdown";
import {FormsModule} from "@angular/forms";
import {ButtonModule} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {ToolbarModule} from "primeng/toolbar";

@NgModule({
  declarations: [
    TillComponent
  ],
  imports: [
    CommonModule,
    TillRoutingModule,
    FontAwesomeModule,
    TranslateModule,
    FormsModule,
    //PrimeNG
    DropdownModule,
    ButtonModule,
    InputTextModule,
    ToolbarModule
  ],
  exports: [
    TillComponent,
    TillRoutingModule,
    FontAwesomeModule,
    TranslateModule,
    //PrimeNG
    DropdownModule,
    ButtonModule,
    InputTextModule,
    ToolbarModule
  ],
  bootstrap: [
    TillComponent
  ]
})
export class TillModule {
  constructor(private componentFactoryResolver: ComponentFactoryResolver) {

  }

  public resolveComponent(): ComponentFactory<TillComponent> {
    return this.componentFactoryResolver.resolveComponentFactory(TillComponent);
  }

  public componentReference(){
    return TillComponent;
  }
}
