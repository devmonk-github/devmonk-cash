import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsSettingsComponent } from './statistics-settings.component';
import { StatisticsSettingsRoutingModule } from './statistics-settings-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ApiService } from '../shared/service/api.service';
import { ToastService } from '../shared/components/toast';
import { OverlayModule } from '@angular/cdk/overlay';
@NgModule({
  declarations: [
    StatisticsSettingsComponent
  ],
  imports: [
    OverlayModule,
    CommonModule,
    StatisticsSettingsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TranslateModule,
    FontAwesomeModule
  ],
  providers:[
    ApiService,
    ToastService
  ]
})
export class StatisticsSettingsModule { }
