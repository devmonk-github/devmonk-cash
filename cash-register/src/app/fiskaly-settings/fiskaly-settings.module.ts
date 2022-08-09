import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FiskalySettingsComponent } from './fiskaly-settings.component';
import { FiskalySettingsRoutingModule } from './fiskaly-settings-routing.module';



@NgModule({
  declarations: [
    FiskalySettingsComponent
  ],
  imports: [
    CommonModule,
    FiskalySettingsRoutingModule
  ]
})
export class FiskalySettingsModule { }
