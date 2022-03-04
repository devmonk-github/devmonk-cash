import { ComponentFactory, ComponentFactoryResolver, ComponentRef, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TillRoutingModule } from './till-routing.module';
import { TillComponent } from './till.component';
import {FaIconLibrary, FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {fas} from "@fortawesome/free-solid-svg-icons";
import {far} from "@fortawesome/free-regular-svg-icons";
import {TranslateModule} from "@ngx-translate/core";
import {DropdownModule} from "primeng/dropdown";
import {FormsModule} from "@angular/forms";
import {ButtonModule} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";

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
    InputTextModule
  ],
  exports: [
    TillComponent,
    TillRoutingModule,
    FontAwesomeModule,
    TranslateModule,
    //PrimeNG
    DropdownModule,
    ButtonModule,
    InputTextModule
  ],
  bootstrap: [
    TillComponent
  ]
})
export class TillModule {
  constructor(private componentFactoryResolver: ComponentFactoryResolver, library: FaIconLibrary) {
    library.addIconPacks(far, fas)
  }

  public resolveComponent(): ComponentFactory<TillComponent> {
    return this.componentFactoryResolver.resolveComponentFactory(TillComponent);
  }

  public componentReference(){
    return TillComponent;
  }
}
