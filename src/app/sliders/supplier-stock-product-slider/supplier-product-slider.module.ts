import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupplierProductSliderComponent } from 'src/app/business/sliders/supplier-stock-product-slider/supplier-product-slider.component';
import { FormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'; // translation loader module
// import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    SupplierProductSliderComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule.forChild()
  ],
  exports: [SupplierProductSliderComponent],
})

export class SupplierProductSliderModule {
  // constructor(private componentFactoryResolver: ComponentFactoryResolver
  // ) {}
  // public resolveComponent(): ComponentFactory<SupplierProductSliderComponent> {
  //   return this.componentFactoryResolver.resolveComponentFactory(SupplierProductSliderComponent);
  // }
}
