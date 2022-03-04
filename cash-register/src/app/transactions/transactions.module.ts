import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransactionsRoutingModule } from './transactions-routing.module';
// import { SharedModule } from '../../shared/shared.module';

import { TransactionsComponent } from './transactions.component';
@NgModule({
  declarations: [
    TransactionsComponent
  ],
  imports: [
    TransactionsRoutingModule,
    // SharedModule
  ]
})
export class TransactionsModule { }
