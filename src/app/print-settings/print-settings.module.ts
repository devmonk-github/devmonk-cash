import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrintSettingsComponent } from './print-settings.component';
import { PrintSettingsRoutingModule } from './print-settings-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule as primengSharedModule } from 'primeng/api';
import { JsonEditorModule } from '../json-editor/json-editor.module';
import { SharedModule } from '../shared/shared.module';
import { PrintWorkstationComponent } from './print-workstation/print-workstation.component';

@NgModule({
  declarations: [
    PrintSettingsComponent,
    PrintWorkstationComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PrintSettingsRoutingModule,
    TranslateModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    primengSharedModule,
    SharedModule,
    JsonEditorModule
  ]
})
export class PrintSettingsModule { }
