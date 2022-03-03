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
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
