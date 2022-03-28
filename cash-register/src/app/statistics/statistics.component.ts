import { Component, OnInit } from '@angular/core';
import { ApiService } from '../shared/service/api.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.sass']
})

export class StatisticsComponent implements OnInit {
  iBusinessId: any = '';
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
    this.iBusinessId = localStorage.getItem('currentBusiness');
    this.fetchStatistics(this.sDisplayMethod);
  }

  fetchStatistics(sDisplayMethod: string) {
    console.log('fetchStatistics: ', sDisplayMethod);
    this.apiService.getNew('cashregistry', `/api/v1/statistics/get/?iBusinessId=${this.iBusinessId}&displayMethod=${sDisplayMethod}`).subscribe((result: any) => {
      console.log('fetchStatistics response: ', result);
      if (result?.data) {
        this.aStatistic = result.data;
      }
    }, (error) => {
      console.log('error: ', error);
    })
  }

  setSupplier() {

  }

  manipulateTheData() {
    const oStatistic = this.aStatistic[0];
    const aSupplier = [];
    // for (let indIndex = 0; indIndex < oStatistic.individual.length; indIndex++) {
    // const individual = oStatistic.individual[indIndex];
    // console.log('Individual', indIndex, individual);
    let flags: any = [];
    let output = [];
    for (let i = 0; i < oStatistic.individual.length; i++) {
      if (flags[oStatistic.individual[i]._id]) {
        const articleGroupIndex = aSupplier.findIndex((doc: any) => {
          // console.log('doc: ', doc, doc?._id?.toString(), oStatistic.individual[i]._id);
          return doc?._id?.toString() === oStatistic.individual[i]._id.toString();
          // doc?._id?.toString() === flags[oStatistic.individual[i]._id]?.toString()
        });
        console.log('here: ', articleGroupIndex, aSupplier[articleGroupIndex]);

      } else {
        aSupplier.push(oStatistic.individual[i]);
      };
      flags[oStatistic.individual[i]._id] = true;
      output.push(oStatistic.individual[i]._id);
    }

    // const arrayUniqueByKey = [...new Map(oStatistic.individual.map((item: any) => [item['_id'], item])).values()];
    console.log('arrayUniqueByKey: ', aSupplier);
    // for (let articleGroupIndex = 0; articleGroupIndex < individual.articleGroups.length; articleGroupIndex++) {
    //   const articleGroup = individual.articleGroups[articleGroupIndex];
    //   console.log('articleGroup', articleGroupIndex, articleGroup);
    //   for (let propertyIndex = 0; propertyIndex < articleGroup.revenueByProperty.length; propertyIndex++) {
    //     console.log('property', propertyIndex, articleGroup.revenueByProperty[propertyIndex]);
    //   }
    // }
    // }
  }

  changeDisplayMethod(event: any) {
    const sDisplayMethod = event?.target?.value;
    console.log('sDisplayMethod: ', sDisplayMethod, this.sDisplayMethod);
    if (sDisplayMethod == 'revenuePerBusinessPartner') this.fetchStatistics('revenuePerBusinessPartner');
    else if (sDisplayMethod == 'revenuePerArticleGroupAndProperty') this.fetchStatistics('revenuePerArticleGroupAndProperty');
    else if (sDisplayMethod == 'revenuePerSupplierAndArticleGroup') this.fetchStatistics('revenuePerBusinessPartner');
    else if (sDisplayMethod == 'revenuePerProperty') this.fetchStatistics('revenuePerProperty');
    else if (sDisplayMethod == 'revenuePerArticleGroup') this.fetchStatistics('revenuePerArticleGroupAndProperty');
  }
}
