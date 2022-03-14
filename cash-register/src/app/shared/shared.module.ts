import {DialogService} from "./service/dialog";
import {ComponentFactoryResolver, ModuleWithProviders, NgModule} from "@angular/core";
import { CustomerDialogComponent } from './components/customer-dialog/customer-dialog.component';
import {CommonModule} from "@angular/common";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
  declarations: [
    CustomerDialogComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    TranslateModule
  ],
  exports: []
})

export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [DialogService]
    }
  }
  constructor(private componentFactoryResolver: ComponentFactoryResolver) {
  }
  public resolveComponent(component: any) {
    return this.componentFactoryResolver.resolveComponentFactory(component);
  }
}
