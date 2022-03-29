import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';

import { CustomersRoutingModule } from './customers-routing.module';

import { CustomersComponent } from './customers.component';
import { PaginatePipe } from 'ngx-pagination';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
    CustomersComponent
  ],
  imports: [
    CustomersRoutingModule,
    SharedModule,
    TranslateModule,
    NgxPaginationModule,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserModule,
    FontAwesomeModule
  ],
  providers: [
    PaginatePipe
  ]
})
export class CustomersModule { }
