import { ComponentFactoryResolver, ModuleWithProviders, NgModule } from "@angular/core";
import { CommonModule, CurrencyPipe } from "@angular/common";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgSelectModule } from "@ng-select/ng-select";

import { DialogService } from "./service/dialog";
import { CustomerDialogComponent } from './components/customer-dialog/customer-dialog.component';
import { DialerComponent } from './components/dialer/dialer.component';
import { AlertComponent } from './components/alert/alert.component';
import { CustomerDetailsComponent } from "./components/customer-details/customer-details.component";
import { AccordionDirective } from "./directives/accordion.directive";
import { CustomPaymentMethodComponent } from './components/custom-payment-method/custom-payment-method.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { ImageUploadComponent } from './components/image-upload/image-upload.component';
import { WebcamModule } from 'ngx-webcam';
import { DeviceDetailsComponent } from './components/device-details/device-details.component';
import { PrintSettingsDetailsComponent } from './components/print-settings-details/print-settings-details.component';
import { ToastModule } from "./components/toast";
import { PdfComponent } from './components/pdf/pdf.component';
import { TransactionsSearchComponent } from "./components/transactions-search/transactions-search.component";
import { TransactionItemsDetailsComponent } from "./components/transaction-items-details/transaction-items-details.component";

// ---------------- Material -----------------------
import { MaterialModule } from './material.module';  // common material design module

// ---------------- Common components ------------------
import {
  CountryListComponent, TabsComponent, TabComponent
} from './components';
// import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgJsonEditorModule } from "ang-jsoneditor";
import { FileSaverModule } from "ngx-filesaver";
import { ActivityDetailsComponent } from "./components/activity-details-dialog/activity-details.component";
import { AddExpensesComponent } from "./components/add-expenses-dialog/add-expenses.component";
import { CardsComponent } from "./components/cards-dialog/cards-dialog.component";
import { MorePaymentsDialogComponent } from "./components/more-payments-dialog/more-payments-dialog.component";
import { TerminalDialogComponent } from "./components/terminal-dialog/terminal-dialog.component";
import { AddFavouritesComponent } from "./components/add-favourites/favourites.component";
import { NgApexchartsModule } from "ng-apexcharts";
@NgModule({
  declarations: [
    CustomerDialogComponent,
    TerminalDialogComponent,
    DialerComponent,
    AlertComponent,
    CustomerDetailsComponent,
    CountryListComponent,
    AccordionDirective,
    CustomPaymentMethodComponent,
    ConfirmationDialogComponent,
    AddFavouritesComponent,
    ImageUploadComponent,
    DeviceDetailsComponent,
    PrintSettingsDetailsComponent,
    PdfComponent,
    TransactionsSearchComponent,
    TransactionItemsDetailsComponent,
    ActivityDetailsComponent,
    AddExpensesComponent,
    CardsComponent,
    MorePaymentsDialogComponent,
    TabsComponent,
    TabComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    TranslateModule,
    FormsModule,
    NgSelectModule,
    WebcamModule,
    MaterialModule,
    // NgbModule,
    ReactiveFormsModule,
    ToastModule.forRoot(),
    NgJsonEditorModule,
    FileSaverModule,
    NgApexchartsModule
  ],
  exports: [
    DialerComponent,
    AlertComponent,
    CustomerDialogComponent,
    TerminalDialogComponent,
    CountryListComponent,
    AccordionDirective,
    ToastModule,
    NgSelectModule,
    MaterialModule,
    TransactionsSearchComponent,
    TransactionItemsDetailsComponent,
    ActivityDetailsComponent,
    AddExpensesComponent,
    CardsComponent,
    MorePaymentsDialogComponent,
    TabsComponent,
    TabComponent
  ],
  providers: [CurrencyPipe]
})

export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [DialogService, CurrencyPipe]
    }
  }
  constructor(private componentFactoryResolver: ComponentFactoryResolver) {
  }
  public resolveComponent(component: any) {
    return this.componentFactoryResolver.resolveComponentFactory(component);
  }
}
