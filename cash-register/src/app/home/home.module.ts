import { ComponentFactory, ComponentFactoryResolver, ComponentRef, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { EditComponent } from './edit/edit.component';
import { NbButtonModule, NbDialogService, NbStatusService, NbDialogModule, NbThemeModule, NbLayoutModule, NbCardModule } from '@nebular/theme';
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
    NbButtonModule,
    NbThemeModule.forRoot({name: 'default'}),
    NbLayoutModule,
    NbDialogModule.forChild({
      hasBackdrop: true, closeOnEsc: false, closeOnBackdropClick: false
    }),
    NbCardModule
  ],
  exports:[
    HomeComponent,
    HomeRoutingModule,
    NbButtonModule,
    NbThemeModule,
    NbLayoutModule,
    NbDialogModule,
    NbCardModule
  ],
  providers: [
  ],
  bootstrap: [
    HomeComponent
  ]
})
export class HomeModule {

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {
    console.log('lazy home loaded: 🔥');
  }

  public resolveComponent(): ComponentFactory<HomeComponent> {
    return this.componentFactoryResolver.resolveComponentFactory(HomeComponent);
  }

  public componentReference(){
    return HomeComponent;
  }
}
