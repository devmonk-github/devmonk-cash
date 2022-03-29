import { Injectable } from '@angular/core';
import {formatCurrency} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class PriceService {

  constructor( ) { }

  roundPrice(price: number): number {
    return Math.round((price + Number.EPSILON) * 100) / 100;
  }

  getDiscount(discount: {value: number, percent: boolean, itemPrice: number}): any {
    if(discount.percent) {
      return this.roundPrice(discount.value) + '%'
    } else {
      return formatCurrency(this.roundPrice(discount.value), 'en-GB', '€')
      //return '€' + this.roundPrice(discount.value)
    }
  }

  getArticlePrice(article: any, total: boolean = false): any {
    if(!article.discount || article.discount.value === 0) {
      if(total) {
        return formatCurrency(this.roundPrice(article.price * article.quantity), 'en-GB', '€')
      }
      return formatCurrency(this.roundPrice(article.price), 'en-GB', '€')
    } else {
      if( total ) {
        let price
        if(article.discount.percent) {
          price = (article.quantity * article.price) - (article.quantity * article.price * (article.discount.value / 100))
        } else {
          price = article.quantity * article.price - (article.quantity * article.discount.value)
        }
        return formatCurrency(this.roundPrice(price), 'en-GB', '€')
      } else {
        return formatCurrency(this.roundPrice(article.price - this.getDiscount(article.discount)), 'en-GB', '€')
      }
    }
  }
}
