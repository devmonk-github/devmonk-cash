import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrintSettingsComponent } from './print-settings.component';
import { PrintSettingsRoutingModule } from './print-settings-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'primeng/api';
import { JsonEditorModule } from 'src/app/json-editor/json-editor.module';
import { LabelTemplateModelComponent } from "./label-template-model/label-template-model.component"

@NgModule({
  declarations: [
    PrintSettingsComponent,
    LabelTemplateModelComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PrintSettingsRoutingModule,
    TranslateModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    SharedModule,
    JsonEditorModule
  ]
})
export class PrintSettingsModule { }
