import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrintSettingsComponent } from './print-settings.component';
import { PrintSettingsRoutingModule } from './print-settings-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'primeng/api';


@NgModule({
  declarations: [
    PrintSettingsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PrintSettingsRoutingModule,
    TranslateModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class PrintSettingsModule { }
