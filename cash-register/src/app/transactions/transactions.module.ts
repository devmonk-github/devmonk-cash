import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TransactionsRoutingModule } from './transactions-routing.module';
import { NgxPaginationModule } from 'ngx-pagination';
// import { SharedModule } from '../../shared/shared.module';

import { TransactionsComponent } from './transactions.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
@NgModule({
  declarations: [
    TransactionsComponent
  ],
  imports: [
    TransactionsRoutingModule,
    FontAwesomeModule,
    NgxPaginationModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule
    // SharedModule
  ]
})
export class TransactionsModule { }
