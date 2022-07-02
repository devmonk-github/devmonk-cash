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
    return payMethods.filter((p: any) => p.amount !== 0 || p.nExpectedAmount !== 0) || 0
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
        result = _.sumBy(transactionItems, 'nDiscount') || 0
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

  getUniqueId(parts: number): string {
    const stringArr = [];
    for (let i = 0; i < parts; i++) {
      // tslint:disable-next-line:no-bitwise
      const S4 = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      stringArr.push(S4);
    }
    return stringArr.join('-');
  }

  createTransactionBody(transactionItems: any, payMethods: any, discountArticleGroup: any, redeemedLoyaltyPoints: number): any {
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
      redeemedLoyaltyPoints,
    };
    body.transactionItems = transactionItems.map((i: any) => {
      return new TransactionItem(
        i.name,
        i.comment,
        i.sProductNumber,
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
        i.sArticleNumber,
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
        i.nDiscount.value > 0,
        i.nDiscount.percent,
        i.nDiscount.value,
        i.nRefundAmount,

        null,
        null,

        i.dEstimatedDate, // estimated date
        null, // TODO
        i.iBusinessBrandId,
        i.iBusinessProductId,
        null,
        'y',
        this.getValueFromLocalStorage('currentWorkstation'),
        i.iEmployeeId || this.getValueFromLocalStorage('currentEmployee')._id,
        this.getValueFromLocalStorage('currentLocation'),
        i.sBagNumber,
        i.iSupplierId, // repairer id

        i.iLastTransactionItemId,
        null,
        {
          eTransactionType: i.eTransactionType || 'cash-registry', // TODO
          bRefund: i.oType?.bRefund || i.nDiscount.quantity < 0 || i.price < 0,
          nStockCorrection: i.eTransactionItemType === 'regular' ? i.quantity : i.quantity - i.nBrokenProduct,
          eKind: i.type, // TODO // repair
          bDiscount: i.nDiscount > 0,
          bPrepayment: (i.paymentAmount > 0 || this.getUsedPayMethods(true, payMethods) - this.getTotals('price', transactionItems) < 0) && (i.paymentAmount !== i.amountToBePaid),
        },
        i.iActivityItemId,
        i.goldFor,
        i.nDiscount,

        i.redeemedLoyaltyPoints,
        i.uniqueIdentifier || this.getUniqueId(4),
      )
    });
    const originalTItemsLength = length = body.transactionItems.filter((i: any) => i.oType.eKind !== 'loyalty-points').length;
    // console.log(originalTItemsLength);
    body.transactionItems.map((i: any) => {
      let discountRecords: any = localStorage.getItem('discountRecords');
      if (discountRecords) {
        discountRecords = JSON.parse(discountRecords);
      }
      if (i.oType.bRefund && (i.nPriceIncVat - i.nDiscount + i.nPaymentAmount) === 0) {
        const records = discountRecords.filter((o: any) => o.uniqueIdentifier === i.uniqueIdentifier);
        records.forEach((record: any) => {
          i.nPaymentAmount += record.nPaymentAmount;
          record.nPaymentAmount = -1 * record.nPaymentAmount;
          record.nPaidAmount = -1 * record.nPaidAmount;
          record.oType.bRefund = true;
          record.nRedeemedLoyaltyPoints = -1 * record.nRedeemedLoyaltyPoints;
          body.transactionItems.push(record);
          if (i.oType.eKind = 'loyalty-points-discount') {
            body.redeemedLoyaltyPoints += record.nRedeemedLoyaltyPoints;
          }
        });
      } else {
        if (i.nDiscount && i.nDiscount > 0 && !i.oType.bRefund) {
          i.nPaymentAmount += i.nDiscount;
          const tItem1 = JSON.parse(JSON.stringify(i));
          tItem1.iArticleGroupId = discountArticleGroup._id;
          tItem1.oArticleGroupMetaData.sCategory = discountArticleGroup.sCategory;
          tItem1.oArticleGroupMetaData.sSubCategory = discountArticleGroup.sSubCategory;
          tItem1.oType.eTransactionType = 'cash-registry';
          tItem1.oType.eKind = 'discount';
          tItem1.nPaymentAmount = -1 * tItem1.nDiscount;
          body.transactionItems.push(tItem1);
        }
      }
    });
    localStorage.removeItem('discountRecords');
    // console.log(originalTItemsLength);
    if (redeemedLoyaltyPoints && redeemedLoyaltyPoints > 0) {
      // redeemedLoyaltyPoints
      let nDiscount = Math.round(redeemedLoyaltyPoints / originalTItemsLength);
      const reedemedTItem = body.transactionItems.find((o: any) => o.oType.eTransactionType === "loyalty-points");
      console.log(reedemedTItem);
      body.transactionItems.map((i: any) => {
        if (i.oType.eKind !== 'discount' && i.oType.eKind !== 'loyalty-points' && nDiscount > 0) {
          if (nDiscount > redeemedLoyaltyPoints) {
            nDiscount = redeemedLoyaltyPoints;
            redeemedLoyaltyPoints = 0;
          } else {
            redeemedLoyaltyPoints = redeemedLoyaltyPoints - nDiscount;
          }
          const tItem1 = JSON.parse(JSON.stringify(i));
          tItem1.iArticleGroupId = reedemedTItem.iArticleGroupId;
          tItem1.oArticleGroupMetaData.sCategory = discountArticleGroup.sCategory;
          tItem1.oArticleGroupMetaData.sSubCategory = discountArticleGroup.sSubCategory;
          tItem1.oType.eTransactionType = 'cash-registry';
          tItem1.oType.eKind = 'loyalty-points-discount';
          tItem1.nPaymentAmount = -1 * nDiscount;
          tItem1.nRedeemedLoyaltyPoints = nDiscount;
          body.transactionItems.push(tItem1);
          i.nDiscount += nDiscount;
        }
      });
    }
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
    return throwError(() => {
      message;
    });
  }
}
