import {DialogService} from "./service/dialog";
import {ComponentFactoryResolver, ModuleWithProviders, NgModule} from "@angular/core";
import {CustomerDialogComponent } from './components/customer-dialog/customer-dialog.component';
import {CommonModule, CurrencyPipe} from "@angular/common";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {TranslateModule} from "@ngx-translate/core";
import {FormsModule} from "@angular/forms";
import { DialerComponent } from './components/dialer/dialer.component';
import { AlertComponent } from './components/alert/alert.component';

@NgModule({
  declarations: [
    CustomerDialogComponent,
    DialerComponent,
    AlertComponent,
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    TranslateModule,
    FormsModule
  ],
  exports: [
    DialerComponent,
    AlertComponent
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
