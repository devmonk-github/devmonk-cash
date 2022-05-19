import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebOrdersComponent } from './web-orders.component';
import { WebOrdersRoutingModule } from './web-orders-routing.module';

@NgModule({
  declarations: [
    WebOrdersComponent
  ],
  imports: [
    CommonModule,
    WebOrdersRoutingModule
  ]
})
export class WebOrdersModule { }
