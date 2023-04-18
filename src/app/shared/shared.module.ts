import { ComponentFactoryResolver, ModuleWithProviders, NgModule } from "@angular/core";
import { CommonModule, CurrencyPipe } from "@angular/common";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgSelectModule } from "@ng-select/ng-select";
import { PaginatePipe } from 'ngx-pagination';
import { DialogService } from "./service/dialog";
import { CustomerDialogComponent } from './components/customer-dialog/customer-dialog.component';
import { DialerComponent } from './components/dialer/dialer.component';
import { AlertComponent } from './components/alert/alert.component';
import { CustomerDetailsComponent } from "./components/customer-details/customer-details.component";
import { CustomerAddressDialogComponent } from "./components/customer-address-dialog/customer-address-dialog.component";
import { AccordionDirective } from "./directives/accordion.directive";
import { CustomPaymentMethodComponent } from './components/custom-payment-method/custom-payment-method.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { ImageUploadComponent } from './components/image-upload/image-upload.component';
import { WebcamModule } from 'ngx-webcam';
import { DeviceDetailsComponent } from './components/device-details/device-details.component';
import { PrintSettingsDetailsComponent } from './components/print-settings-details/print-settings-details.component';
import { ToastModule } from "./components/toast";
import { PdfComponent } from './components/pdf/pdf.component';
import { ExportsComponent } from './components/exports/exports.component';
import { TransactionsSearchComponent } from "./components/transactions-search/transactions-search.component";
import { TransactionItemsDetailsComponent } from "./components/transaction-items-details/transaction-items-details.component";

// ---------------- Material -----------------------
import { MaterialModule } from './material.module';  // common material design module

// ---------------- Common components ------------------
import {
  CountryListComponent, TabsComponent, TabComponent
} from './components';
import { NgJsonEditorModule } from "ang-jsoneditor";
import { FileSaverModule } from "ngx-filesaver";
import { ActivityDetailsComponent } from "./components/activity-details-dialog/activity-details.component";
import { AddExpensesComponent } from "./components/add-expenses-dialog/add-expenses.component";
import { CardsComponent } from "./components/cards-dialog/cards-dialog.component";
import { MorePaymentsDialogComponent } from "./components/more-payments-dialog/more-payments-dialog.component";
import { TerminalDialogComponent } from "./components/terminal-dialog/terminal-dialog.component";
import { AddFavouritesComponent } from "./components/add-favourites/favourites.component";
import { NgApexchartsModule } from "ng-apexcharts";
import { WebOrderDetailsComponent } from "./components/web-order-details/web-order-details.component";
import { SelectArticleDialogComponent } from "./components/select-articlegroup-dialog/select-articlegroup-dialog.component";
import { NgxPaginationModule } from "ngx-pagination";
import { PrintSettingsEditorComponent } from "./components/print-settings-editor/print-settings-editor.component";
import { JsonEditorModule } from "../json-editor/json-editor.module";
import { CommonPrintSettingsService } from "./service/common-print-settings.service";
import { AddEditWorkstationComponent } from './components/add-edit-workstation/add-edit-workstation.component';
import { SortPipe } from "./directives/sort.pipe";
import { ActionSettingsComponent } from "./components/actions-settings/action-settings.component";
import { FilterPipe } from "./pipes/filter.pipe";
import { PdfService } from "./service/pdf2.service";
import { ReceiptService } from "./service/receipt.service";
import { TransactionActionDialogComponent } from "./components/transaction-action-dialog/transaction-action-dialog.component";
import { CustomerGroupDetailComponent } from './components/customer-group-detail/customer-group-detail.component';
import { CurrencyFormatPipe } from "./pipes/currency-format.pipe";
import { ActivityItemExportComponent } from './components/activity-item-export/activity-item-export.component';
import { TransactionsPdfService } from "./service/transactions-pdf.service";
//import { DateTranslatePipe } from './pipes/date-translate.pipe';
import { SelectPrintPaperDialogComponent } from "./components/select-print-paper-dialog/select-print-paper-dialog.component";
import { SupplierProductSliderModule } from "../sliders/supplier-stock-product-slider/supplier-product-slider.module";
import { CustomerActivitiesDialogComponent } from "./components/customer-activities-dialog/customer-activities.component";
import { BankConfirmationDialogComponent } from './components/bank-confirmation-dialog/bank-confirmation-dialog.component';
import { ClosingDaystateDialogComponent } from "./components/closing-daystate-dialog/closing-daystate-dialog.component";

@NgModule({
  declarations: [
    CustomerDialogComponent,
    TerminalDialogComponent,
    DialerComponent,
    AlertComponent,
    CustomerDetailsComponent,
    CustomerAddressDialogComponent,
    CountryListComponent,
    AccordionDirective,
    CustomPaymentMethodComponent,
    ConfirmationDialogComponent,
    AddFavouritesComponent,
    ImageUploadComponent,
    DeviceDetailsComponent,
    PrintSettingsDetailsComponent,
    PdfComponent,
    ExportsComponent,
    TransactionsSearchComponent,
    TransactionItemsDetailsComponent,
    ActivityDetailsComponent,
    WebOrderDetailsComponent,
    AddExpensesComponent,
    CardsComponent,
    MorePaymentsDialogComponent,
    TabsComponent,
    TabComponent,
    SelectArticleDialogComponent,
    PrintSettingsEditorComponent,
    AddEditWorkstationComponent,
    SortPipe,
    ActionSettingsComponent,
    FilterPipe,
    TransactionActionDialogComponent,
    CustomerGroupDetailComponent,
    CurrencyFormatPipe,
    ActivityItemExportComponent,
    //DateTranslatePipe,
    SelectPrintPaperDialogComponent,
    CustomerActivitiesDialogComponent,
    BankConfirmationDialogComponent,
    ClosingDaystateDialogComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    TranslateModule,
    FormsModule,
    NgSelectModule,
    WebcamModule,
    MaterialModule,
    ReactiveFormsModule,
    ToastModule.forRoot(),
    NgJsonEditorModule,
    FileSaverModule,
    NgApexchartsModule,
    NgxPaginationModule,
    JsonEditorModule,
    SupplierProductSliderModule
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
    WebOrderDetailsComponent,
    AddExpensesComponent,
    CardsComponent,
    MorePaymentsDialogComponent,
    TabsComponent,
    TabComponent,
    SelectArticleDialogComponent,
    NgxPaginationModule,
    AddEditWorkstationComponent,
    SortPipe,
    CurrencyFormatPipe,
    //DateTranslatePipe,
    SelectPrintPaperDialogComponent,
    SupplierProductSliderModule,
    ClosingDaystateDialogComponent
  ],
  providers: [CurrencyPipe, CommonPrintSettingsService, PdfService, ReceiptService, TransactionsPdfService , PaginatePipe]
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
