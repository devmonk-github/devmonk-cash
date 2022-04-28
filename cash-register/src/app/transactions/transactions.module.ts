import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TransactionsRoutingModule } from './transactions-routing.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
// import { SharedModule } from '../../shared/shared.module';
import { DialogService } from '../shared/service/dialog';

import { TransactionsComponent } from './transactions.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TransactionDetailsComponent } from './components/transaction-details/transaction-details.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    TransactionsComponent,
    TransactionDetailsComponent
  ],
  imports: [
    TransactionsRoutingModule,
    FontAwesomeModule,
    NgxPaginationModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    TranslateModule
    // SharedModule
  ],
  providers: [ DialogService ]
})
export class TransactionsModule { }
