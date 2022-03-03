import { ComponentFactory, ComponentFactoryResolver, ComponentRef, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { EditComponent } from './edit/edit.component';
import { DialogsComponent } from '../dialogs/dialogs.component';


@NgModule({
  declarations: [
    HomeComponent,
    EditComponent,
    DialogsComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
  ],
  exports:[
    HomeComponent,
    HomeRoutingModule
  ],
  providers: [
  ],
  bootstrap: [
    HomeComponent
  ]
})
export class HomeModule {

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {
  }

  public resolveComponent(): ComponentFactory<HomeComponent> {
    return this.componentFactoryResolver.resolveComponentFactory(HomeComponent);
  }

  public componentReference(){
    return HomeComponent;
  }
}
