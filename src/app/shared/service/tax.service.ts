import { Injectable } from '@angular/core';
import { liveQuery } from 'dexie';
import { db } from '../../indexDB/db';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class TaxService {

  constructor(private apiService: ApiService) { }

  getTaxRates(): any[] {
    // TODO: Get real taxes based on shop country
    return [
      {
        rate: 21,
        name: 'BTW Hoog'
      },
      {
        rate: 9,
        name: 'BTW Laag'
      },
      {
        rate: 0,
        name: 'Geen BTW'
      }
    ]
  }

  // Function for get location specific tax 
  async getLocationTax(request?: any) {
      let requestDetails = { oFilterBy: { sCountry: request.countries || 'NL' } }
      const taxtsList:any = await this.fetchAndAssignTaxList({ iBusinessId: request.iBusinessId, request: requestDetails, locations: request.locations});
      const taxs = taxtsList.filter((f:any)=>f.iLocationId === request.iLocationId)
      return taxs.length ? taxs[0] : null;
  }

  fetchAndAssignTaxList(details: any) {
    return new Promise( (resolve: any, reject : any) =>{
      this.apiService.postNew('core', '/api/v1/tax/list?iBusinessId=' + details.iBusinessId, details.request).subscribe(
        async (response: any) => {
          let finalResult: any = [];
          if (response?.data[0]?.result?.length > 0) {
            let result = response?.data[0]?.result;
            await details.locations.map(async (location: any) => {
              let country = result.filter((taxRate: any) => (taxRate.sCountry == location?.oAddress?.countryCode) || (!location?.oAddress?.countryCode && taxRate.sCountry == 'NL'));
              if (location?.oAddress?.state != '' && country[0]?.aStates?.length > 0) {
                let state = country[0]?.aStates?.filter((taxRate: any) => taxRate.sName == location?.oAddress?.state || taxRate.sShort == location?.oAddress?.state);
                state = state.length > 0 ? state[0] : country[0];
                const details = await db.taxRates.get({ iLocationId: location._id });
                if (details?.indexDBId) {
                  db.taxRates.update(details?.indexDBId, {
                    iLocationId: location._id, ...state
                  }).then((updated) => { });
                } else {
                  await db.taxRates.add({ iLocationId: location._id, ...state });
                }
                finalResult.push({ iLocationId: location._id, ...state });
              } else {
                const details = await db.taxRates.get({ iLocationId: location._id });
                if (details?.indexDBId) {
                  db.taxRates.update(details.indexDBId, {
                    iLocationId: location._id, ...country[0]
                  }).then((updated) => { }); 
                } else {
                  await db.taxRates.add({ iLocationId: location._id, ...country[0] })
                }
                finalResult.push({ iLocationId: location._id, ...country[0] });
              }
              if(finalResult.length >= details.locations.length){
                resolve(finalResult);
              }
            });
          }else{
            resolve(finalResult);
          }
        }, (error : any) =>{
          reject();
        }
      )
    })
  }

  async fetchDefaultVatRate(oBody: any) {
    let nVatRate = 21;
    const oTax: any = await this.getLocationTax({ iLocationId: oBody.iLocationId });
    if (oTax?.aRates?.length === 1) {
      nVatRate = oTax.aRates[0].nRate;
    } else if (oTax?.aRates?.length) {
      const _aVatRate = oTax?.aRates.map((oVat: any) => oVat.nRate);
      let nLargestVat = 0;
      for (let i = 0; i < _aVatRate?.length; i++) {
        if (_aVatRate[i] > nLargestVat) nLargestVat = _aVatRate[i]
      }
      if (nLargestVat) nVatRate = nLargestVat;
    }
    return nVatRate;
  }
}
