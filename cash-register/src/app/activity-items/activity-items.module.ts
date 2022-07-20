import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityItemsComponent } from './activity-items.component';
import { ActivityItemsRoutingModule } from './activity-items-routing.module';

@NgModule({
  declarations: [
    ActivityItemsComponent
  ],
  imports: [
    CommonModule,
    ActivityItemsRoutingModule
  ]
})
export class ActivityItemsModule { }
