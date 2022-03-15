import { Component, OnInit } from '@angular/core';
import { ApiService } from '../shared/service/api.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.sass']
})

export class StatisticsComponent implements OnInit {
  iBusinessId: string = '';
  aStatistic: any = [];
  sDisplayMethod: string = 'revenuePerBusinessPartner';
  aDisplayMethod: any = [
    {
      sKey: 'revenuePerBusinessPartner',
      sValue: 'Supplier And Article-Group And Dynamic Property',
    },
    {
      sKey: 'revenuePerArticleGroupAndProperty',
      sValue: 'Article Group and Dynamic Property',
    },
    {
      sKey: 'revenuePerSupplierAndArticleGroup', // Use the revenuePerBusinessPartner and Remove the Dynamic Property
      sValue: 'Supplier And Article-Group',
    },
    {
      sKey: 'revenuePerProperty',
      sValue: 'Revenue Per Property',
    },
    {
      sKey: 'revenuePerArticleGroup', // Use the revenuePerArticleGroupAndProperty and remove the Dynamic Property
      sValue: 'Article Group',
    },
  ]

  // Always show the Overall data, Payment method and VatRate (Shop-purchase and web)

  constructor(
    private apiService: ApiService,
  ) { }

  ngOnInit(): void {
    this.iBusinessId = localStorage.getItem('currentBusiness') || '6182a52f1949ab0a59ff4e7b';
    this.fetchStatistics();
  }

  fetchStatistics() {
    // this.sDisplayMethod = `paymentMethods`; // revenuePerBusinessPartner, revenuePerArticleGroupAndProperty revenuePerProperty
    this.apiService.getNew('cashregistry', `/api/v1/statistics/get/?iBusinessId=${this.iBusinessId}&displayMethod=${this.sDisplayMethod}`).subscribe((result: any) => {
      if (result?.data) {
        console.log('result: ', result.data);
        this.aStatistic = result.data;
      }
    }, (error) => {
      console.log('error: ', error);
    })
  }

  changeDisplayMethod(sDisplayMethod: any) {
    console.log('sDisplayMethod: ', sDisplayMethod.target?.value, this.sDisplayMethod);
  }
}
