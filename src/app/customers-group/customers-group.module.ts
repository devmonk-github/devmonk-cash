import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CustomersGroupRoutingModule } from './customers-group-routing.module';
import { CustomersGroupComponent } from './customers-group.component';
import { NgxPaginationModule ,PaginatePipe } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
// import { BrowserModule } from '@angular/platform-browser'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


@NgModule({
  declarations: [
    CustomersGroupComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    // PaginatePipe,
    NgxPaginationModule,
    NgSelectModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    CustomersGroupRoutingModule
  ],
  providers:[
    PaginatePipe
  ]
})
export class CustomersGroupModule { }
