import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path : 'home',
    loadChildren : () => import('./home/home.module').then(module => module.HomeModule)
  },
  {
    path : 'till',
    loadChildren : () => import('./till/till.module').then(module => module.TillModule)
  },
  {
    path : 'till-settings',
    loadChildren : () => import('./till-settings/till-settings.module').then(module => module.TillSettingsModule)
  },
  {
    path : 'print-settings',
    loadChildren : () => import('./print-settings/print-settings.module').then(module => module.PrintSettingsModule)
  },
  {
    path : 'workstations',
    loadChildren : () => import('./workstation/workstation.module').then(module => module.WorkstationModule)
  },
  {
    path : 'devices',
    loadChildren : () => import('./device/device.module').then(module => module.DeviceModule)
  },
  {
    path : 'transactions',
    loadChildren : () => import('./transactions/transactions.module').then(module => module.TransactionsModule)
  },
  {
    path: 'statistics',
    loadChildren: () => import(`./statistics/statistics.module`).then(module => module.StatisticsModule)
  },
  {
    path: 'services',
    loadChildren: () => import('./services/services.module').then(module => module.ServicesModule)
  },
  {
    path: 'customers',
    loadChildren: () => import('./customers/customers.module').then(module => module.CustomersModule)
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
