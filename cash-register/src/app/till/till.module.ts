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
import { OrderComponent } from './order/order.component';
import { RepairComponent } from './repair/repair.component';
import { GiftComponent } from './gift/gift.component';
import { GoldPurchaseComponent } from './gold-purchase/gold-purchase.component';
import { GoldSellComponent } from './gold-sell/gold-sell.component';
import { OfferComponent } from './offer/offer.component';
import { ProductComponent } from './product/product.component';
import {AccordionDirective} from "../shared/directives/accordion.directive";

@NgModule({
  declarations: [
    TillComponent,
    OrderComponent,
    RepairComponent,
    GiftComponent,
    GoldPurchaseComponent,
    GoldSellComponent,
    OfferComponent,
    ProductComponent,
    AccordionDirective
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
