import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { TransactionItem } from 'src/app/till/models/transaction-item.model';
import { Transaction } from 'src/app/till/models/transaction.model';
import { ApiService } from './api.service';
import * as _ from 'lodash';
@Injectable({
  providedIn: 'root'
})
export class TillService {

  constructor(private apiService: ApiService) { }


  getUsedPayMethods(total: boolean, payMethods: any): any {
    if (!payMethods) {
      return 0
    }
    if (total) {
      return _.sumBy(payMethods, 'amount') || 0;
    }
    return payMethods.filter((p: any) => p.amount && p.amount !== 0) || 0
  }

  getTotals(type: string, transactionItems: any): number {
    if (!type) {
      return 0
    }
    let result = 0
    switch (type) {
      case 'price':
        transactionItems.forEach((i: any) => {
          if (!i.isExclude) {
            if (i.tType === 'refund') {
              result -= i.prePaidAmount;
            } else {
              result += i.quantity * i.price - (i.prePaidAmount || 0);
              // result += type === 'price' ? i.quantity * i.price - i.prePaidAmount || 0 : i[type]
            }
          } else {
            i.paymentAmount = 0;
          }
        });
        break;
      case 'quantity':
        result = _.sumBy(transactionItems, 'quantity') || 0
        break;
      case 'discount':
        result = _.sumBy(transactionItems, 'discount') || 0
        break;
      default:
        result = 0;
        break;
    }
    return result
  }

  getValueFromLocalStorage(key: string): any {
    if (key === 'currentEmployee') {
      const value = localStorage.getItem('currentEmployee');
      if (value) {
        return JSON.parse(value)
      } else {
        return ''
      }
    } else {
      return localStorage.getItem(key) || '';
    }
  }

  createTransactionBody(transactionItems: any, payMethods: any): any {
    const transaction = new Transaction(
      null,
      null,
      null,
      this.getValueFromLocalStorage('currentBusiness'),
      null,
      'cash-register-revenue',
      'y',
      this.getValueFromLocalStorage('currentWorkstation'),
      this.getValueFromLocalStorage('currentEmployee')._id,
      this.getValueFromLocalStorage('currentLocation'),
      null ,
    )

    const body = {
      iBusinessId: this.getValueFromLocalStorage('currentBusiness'),
      iLocationId: this.getValueFromLocalStorage('currentLocation'),
      iDeviceId: this.getValueFromLocalStorage('currentLocation'),
      transactionItems: transactionItems,
      oTransaction: transaction,
      payments: this.getUsedPayMethods(false, payMethods),
    };
    body.transactionItems = transactionItems.map((i: any) => {
      return new TransactionItem(
        i.name,
        i.comment,
        i.productNumber,
        i.price,
        0, // TODO
        0, // TODO
        null,
        i.tax,
        i.quantity,
        null,

        null,
        i._id,
        i.ean,
        i.articleNumber,
        i.aImage,
        0, // TODO
        null,
        null,
        i.iBusinessPartnerId, // TODO: Needed in till??
        this.getValueFromLocalStorage('currentBusiness'),

        i.iArticleGroupId, // TODO
        i.oArticleGroupMetaData || null, //oArticleGroupMetaData
        null,
        false, // TODO
        false, // TODO
        'CATEGORY', // TODO
        i.sGiftCardNumber, // TODO sGiftCardNumber
        null, // TODO
        null, //TODO

        i.total, // TODO?
        i.total,
        i.paymentAmount || i.total,
        0, // TODO
        i.discount.value > 0,
        i.discount.percent,
        i.discount.value,
        i.nRefundAmount,

        null,
        null,

        i.dEstimatedDate, // estimated date
        null, // TODO
        i.iBrandId,
        i.iBusinessProductId,
        null,
        'y',
        this.getValueFromLocalStorage('currentWorkstation'),
        i.iEmployeeId || this.getValueFromLocalStorage('currentEmployee')._id,
        this.getValueFromLocalStorage('currentLocation'),
        i.sBagNumber,
        i.iSupplierId, // repairer id

        null,
        {
          eTransactionType: 'cash-registry', // TODO
          bRefund: i.oType?.bRefund || i.discount.quantity < 0 || i.price < 0,
          nStockCorrection: i.eTransactionItemType === 'regular' ? i.quantity : i.quantity - i.nBrokenProduct,
          eKind: i.type, // TODO // repair
          bDiscount: i.discount.value > 0,
          bPrepayment: (i.paymentAmount > 0 || this.getUsedPayMethods(true, payMethods) - this.getTotals('price', transactionItems) < 0) && (i.paymentAmount !== i.amountToBePaid),
        },
        i.iActivityItemId
      )
    });
    return body;
  }

  checkArticleGroups(): Observable<any> {
    let data = {
      skip: 0,
      limit: 1,
      searchValue: 'Ordered products',
      oFilterBy: {
      },
      iBusinessId: localStorage.getItem('currentBusiness'),
    };
    return this.apiService.postNew('core', '/api/v1/business/article-group/list', data).pipe(retry(1), catchError(this.processError));
  }

  processError(err: any) {
    let message = '';
    if (err.error instanceof ErrorEvent) {
      message = err.error.message;
    } else {
      message = `Error Code: ${err.status}\nMessage: ${err.message}`;
    }
    console.log(message);
    return throwError(() => {
      message;
    });
  }
}
