import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BarcodeComponent } from "../barcode/barcode.component";
import { PrintComponent } from "../print/print.component";
import { HomeComponent } from './home.component';

const routes: Routes = [
  {
    path: 'print',
    component: PrintComponent
  }, {
    path: 'barcode',
    component: BarcodeComponent
  },
  {
    path: '',
    component: HomeComponent,
    children:[
      {
        path: 'transactions',
        loadChildren: () => import('../transactions/transactions.module').then(module => module.TransactionsModule)
      },
      {
        path: '',
        loadChildren: () => import('../till/till.module').then(module => module.TillModule)
      },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
