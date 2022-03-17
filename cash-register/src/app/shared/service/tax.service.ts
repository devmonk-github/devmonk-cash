import { Injectable } from '@angular/core';

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
}
