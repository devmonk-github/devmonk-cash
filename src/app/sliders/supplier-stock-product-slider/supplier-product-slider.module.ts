import { CommonModule } from '@angular/common';
import { ComponentFactory, ComponentFactoryResolver, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core'; // translation loader module
import { ToastModule } from 'src/app/shared/components/toast';
import { SupplierProductSliderComponent } from './supplier-product-slider.component';
// import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    SupplierProductSliderComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule.forChild(),
    ToastModule.forRoot()
  ],
  exports:[
    SupplierProductSliderComponent
  ]
})

export class SupplierProductSliderModule {
  constructor(private componentFactoryResolver: ComponentFactoryResolver
  ) {}
  public resolveComponent(): ComponentFactory<SupplierProductSliderComponent> {
    return this.componentFactoryResolver.resolveComponentFactory(SupplierProductSliderComponent);
  }
}
