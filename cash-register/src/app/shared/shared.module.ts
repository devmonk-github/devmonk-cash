import {DialogService} from "./service/dialog";
import {ComponentFactoryResolver, ModuleWithProviders, NgModule} from "@angular/core";
import {CustomerDialogComponent } from './components/customer-dialog/customer-dialog.component';
import {CommonModule, CurrencyPipe} from "@angular/common";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { DialerComponent } from './components/dialer/dialer.component';
import { AlertComponent } from './components/alert/alert.component';
import { CustomerDetailsComponent } from "./components/customer-details/customer-details.component";
import { NgSelectModule } from "@ng-select/ng-select";
import { CountryListComponent } from "./components/country-list/country-list.component";
import { AccordionDirective } from "./directives/accordion.directive";
import { CustomPaymentMethodComponent } from './components/custom-payment-method/custom-payment-method.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { ImageUploadComponent } from './components/image-upload/image-upload.component';
import {WebcamModule} from 'ngx-webcam';
import { DeviceDetailsComponent } from './components/device-details/device-details.component';
import { PrintSettingsDetailsComponent } from './components/print-settings-details/print-settings-details.component';
import {ToastModule} from "./components/toast";

@NgModule({
  declarations: [
    CustomerDialogComponent,
    DialerComponent,
    AlertComponent,
    CustomerDetailsComponent,
    CountryListComponent,
    AccordionDirective,
    CustomPaymentMethodComponent,
    ConfirmationDialogComponent,
    ImageUploadComponent,
    DeviceDetailsComponent,
    PrintSettingsDetailsComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    TranslateModule,
    FormsModule,
    NgSelectModule,
    WebcamModule,
    ReactiveFormsModule,
    ToastModule.forRoot()
  ],
  exports: [
    DialerComponent,
    AlertComponent,
    CustomerDialogComponent,
    CountryListComponent,
    AccordionDirective,
    ToastModule
  ],
  providers: [ CurrencyPipe]
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
