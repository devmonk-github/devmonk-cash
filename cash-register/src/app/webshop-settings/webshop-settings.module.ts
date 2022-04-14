import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebshopSettingsComponent } from './webshop-settings.component';
import { WebshopSettingsRoutingModule } from './webshop-settings-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedModule } from 'primeng/api';



@NgModule({
  declarations: [
    WebshopSettingsComponent
  ],
  imports: [
    CommonModule,
    WebshopSettingsRoutingModule,
    TranslateModule,
    FormsModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class WebshopSettingsModule { }
