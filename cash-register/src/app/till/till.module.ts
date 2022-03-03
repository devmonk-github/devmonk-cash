import { ComponentFactory, ComponentFactoryResolver, ComponentRef, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TillRoutingModule } from './till-routing.module';
import { TillComponent } from './till.component';
import { NbLayoutModule, NbThemeModule } from '@nebular/theme';


@NgModule({
  declarations: [
    TillComponent
  ],
  imports: [
    CommonModule,
    TillRoutingModule,
    NbThemeModule.forRoot({name: 'default'}),
    NbLayoutModule
  ]
})
export class TillModule {
  constructor(private componentFactoryResolver: ComponentFactoryResolver) {
    
  }

  public resolveComponent(): ComponentFactory<TillComponent> {
    return this.componentFactoryResolver.resolveComponentFactory(TillComponent);
  }

  public componentReference(){
    return TillComponent;
  }
}
