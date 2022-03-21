import { Injectable } from '@angular/core';
//import {CurrencyPipe} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class PriceService {

  constructor(
    //private currencyPipe: CurrencyPipe
  ) { }

  roundPrice(price: number): number {
    return Math.round((price + Number.EPSILON) * 100) / 100;
  }

  getDiscount(discount: {value: number, percent: boolean, itemPrice: number}): any {
    if(discount.percent) {
      return this.roundPrice(discount.value) + '%'
    } else {
      // return this.currencyPipe.transform(this.roundPrice(discount.value), '€')
      return '€' + this.roundPrice(discount.value)
    }
  }
}
