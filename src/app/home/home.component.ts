import { Component, EventEmitter, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent {
  title = 'Cash register home page';
  localData : any;
  @Output() checkUpdate : EventEmitter<any> = new EventEmitter();


  aHeaderMenu = [
    {
      title: 'CASH_REGISTER',
      path: '/home'
    },
    {
      title: 'TRANSACTIONS',
      path: '/home/transactions'
    },
    {
      title: 'ACTIVITY_ITEMS_BACKOFFICE',
      path: '/home/activity-items'
    },
    {
      title: 'STATISTICS',
      path: '/home/transactions-audit'
    },
    {
      title: 'TEXT_HEAD_CUSTOMERS_RETAILER_HOME',
      path: '/home/customers'
    },
    {
      title: 'Devices',
      path: '/home/devices'
    },
    {
      title: 'Statistics Settings',
      path: '/home/statistics-settings'
    },
    {
      title: 'Fiskaly Settings',
      path: '/home/fiskaly-settings'
    },
    {
      title: 'Saving Points',
      path: '/home/saving-points'
    },
    {
      title: 'Betalingsintegraties',
      path: '/home/payment-account-management'
    },
    {
      title: 'Print Settings',
      path: '/home/print-settings'
    },
    {
      title: 'Workstations',
      path: '/home/workstations'
    },
    {
      title: 'till-settings',
      path: '/home/till-settings'
    },
  ]

  constructor() { }

}
