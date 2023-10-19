import { Component, EventEmitter, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as data from 'src/assets/json/country-list-lang.json'
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent {
  title = 'Cash register home page';
  localData : any;
  @Output() checkUpdate : EventEmitter<any> = new EventEmitter();

  selectedLanguage: string = 'en';
  languageList: Array<any> = (data as any).default;;


  aHeaderMenu = [
    {
      title: 'HOME',
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
      title: 'DEVICES',
      path: '/home/devices'
    },
    {
      title: 'STATISTICS_SETTINGS',
      path: '/home/statistics-settings'
    },
    {
      title: 'FISKALY_SETTINGS',
      path: '/home/fiskaly-settings'
    },
    {
      title: 'LOYALITY_POINTS',
      path: '/home/saving-points'
    },
    {
      title: 'Betalingsintegraties',
      path: '/home/payment-account-management'
    },
    {
      title: 'PRINT_SETTINGS',
      path: '/home/print-settings'
    },
    {
      title: 'Workstations',
      path: '/home/workstations'
    },
    {
      title: 'CASH_REGISTER',
      path: '/home/till-settings'
    },
  ]

  constructor(private translateService: TranslateService) {
    const aEnabledLanguages = JSON.parse(localStorage.org).aLanguage;
    this.languageList = this.languageList.filter((item: any) => aEnabledLanguages.includes(item.lang_code));
    console.log(this.languageList)
  }

  onChangeLanguage(event: any) {
    const lang_code = event.target.value;
    this.selectedLanguage = lang_code;
    localStorage.setItem('language', lang_code || 'en');
    this.translateService.use(lang_code);
  }
}
