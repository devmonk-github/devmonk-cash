import { Injectable } from '@angular/core';
import { liveQuery } from 'dexie';
import { db } from '../../indexDB/db';

@Injectable({
  providedIn: 'root'
})
export class TaxService {

  constructor() { }

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
    if (request) {
      return await db.taxRates.get({ iLocationId: request.iLocationId });
    } else {
      return liveQuery(() => db.taxRates.toArray());
    }
  }
}
