import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WebOrdersComponent } from './web-orders.component';

const routes: Routes = [
  { path: '', component: WebOrdersComponent, pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WebOrdersRoutingModule { }
