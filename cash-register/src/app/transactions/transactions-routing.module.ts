import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {TransactionsComponent} from "./transactions.component";

const routes: Routes = [
  { path: '', component: TransactionsComponent, pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransactionsRoutingModule { }
