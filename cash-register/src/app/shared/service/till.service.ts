import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { TransactionItem } from 'src/app/till/models/transaction-item.model';
import { Transaction } from 'src/app/till/models/transaction.model';
import { ApiService } from './api.service';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import * as _moment from 'moment';
const moment = (_moment as any).default ? (_moment as any).default : _moment;
@Injectable({
  providedIn: 'root'
})
export class TillService {

  iBusinessId = localStorage.getItem('currentBusiness'); 
  constructor(
    private apiService: ApiService) { }


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
    console.log('result: ', result);
    switch (type) {
      case 'price':
        transactionItems.forEach((i: any) => {
          if (!i.isExclude) {
            if (i.tType === 'refund') {
              result -= i.prePaidAmount;
            } else {
              let _nDiscount = 0;
              if (i.nDiscount > 0 && !i.bDiscountOnPercentage) _nDiscount = i.nDiscount
              else if (i.nDiscount > 0 && i.bDiscountOnPercentage) _nDiscount = i.price * (i.nDiscount / 100)

              
              // console.log(46, i)
              result += i.quantity * (i.price - _nDiscount) - (i.prePaidAmount || 0);
              // console.log(48, result);
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

  createTransactionBody(transactionItems: any, payMethods: any, discountArticleGroup: any, redeemedLoyaltyPoints: number, customer: any): any {
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
      null,
      null,
    )

    const body = {
      iBusinessId: this.getValueFromLocalStorage('currentBusiness'),
      iLocationId: this.getValueFromLocalStorage('currentLocation'),
      iWorkstationId: this.getValueFromLocalStorage('currentWorkstation'),
      transactionItems: transactionItems,
      oTransaction: transaction,
      payments: this.getUsedPayMethods(false, payMethods),
      redeemedLoyaltyPoints,
    };
    if (customer && customer._id) {
      body.oTransaction.iCustomerId = customer._id;
      body.oTransaction.oCustomer = {
        _id: customer._id,
        sFirstName: customer.sFirstName,
        sLastName: customer.sLastName,
        sPrefix: customer.sPrefix,
        oInvoiceAddress: customer.oInvoiceAddress,
        nClientId: customer.nClientId,
        sGender: customer.sGender,
        bCounter: customer.bCounter,
        oPhone: customer.oPhone,
        sVatNumber: customer.sVatNumber,
        sCocNumber: customer.sCocNumber,
      }
    };
    console.log('length 115: ', transactionItems?.length);
    body.transactionItems = transactionItems.map((i: any) => {
      console.log('i.nDiscount: ', i.nDiscount, i.price, i.oType);
      const bRefund = 
         i.oType?.bRefund /* Indication from the User */
      || i.nDiscount.quantity < 0 /* Minus Discount (e.g. -10 discount) [TODO: Remove the quantity as its not exist at all] */
      || i.price < 0; /* PriceIncVat is minus; Should we not add the nQuantity as a required the positive number here */
      const bPrepayment =
      (bRefund && i.oType?.bPrepayment) /* User indicates it is refund or negative amount */
      // || (i.paymentAmount > 0 /* Whenever the prepayment-field is filled */
      || (this.getUsedPayMethods(true, payMethods) - this.getTotals('price', transactionItems) < 0)
      && (i.paymentAmount !== i.amountToBePaid)

      console.log('i.paymentAmount: ', i.paymentAmount);
      console.log('i.bRefund: ', bRefund, i.oType?.bPrepayment);
      console.log('i.bRefund: ', bRefund, i.oType?.bPrepayment);
      console.log('UsedPaymentMethod: ', this.getUsedPayMethods(true, payMethods));
      console.log('getTotal: ', this.getTotals('price', transactionItems));
      console.log('Last condition: ', i.paymentAmount, i.amountToBePaid);
      console.log('bPrepayment: ', bPrepayment, bRefund && i.oType?.bPrepayment, (this.getUsedPayMethods(true, payMethods) - this.getTotals('price', transactionItems) < 0), (i.paymentAmount !== i.amountToBePaid));
      return new TransactionItem(
        i.name,
        i.comment,
        i.sProductNumber,
        i.price,
        i.nPurchasePrice, // TODO
        i.price - i.nPurchasePrice, // TODO
        null,
        i.tax,
        i.quantity,
        null,
        // 10
        null,
        i._id,
        i.ean,
        i.sArticleNumber,
        i.aImage,
        i.nMargin, // TODO
        null,
        null,
        i.iBusinessPartnerId,
        i.sBusinessPartnerName,
        this.getValueFromLocalStorage('currentBusiness'),
        // 20
        i.iArticleGroupId,
        i.iArticleGroupOriginalId || i.iArticleGroupId,
        i.oArticleGroupMetaData || null, //oArticleGroupMetaData
        null,
        false, // TODO
        false, // TODO
        'CATEGORY', // TODO
        i.sGiftCardNumber, // TODO sGiftCardNumber
        null, // TODO
        null, //TODO
        // 30
        i.nTotal, // TODO?
        i.paymentAmount || 0,
        0, // TODO
        i.nDiscount.value > 0,
        i.nDiscount.percent,
        i.nDiscount.value,
        i.nRefundAmount,
        null,
        null,
        i.dEstimatedDate, // estimated date
        // 40
        null, // TODO
        i.iBusinessBrandId,
        i.iBusinessProductId,
        i.oBusinessProductMetaData,
        'y',
        this.getValueFromLocalStorage('currentWorkstation'),
        i.iEmployeeId || this.getValueFromLocalStorage('currentEmployee')._id,
        i.iAssigneeId,
        this.getValueFromLocalStorage('currentLocation'),
        i.sBagNumber,
        i.iSupplierId, // repairer id
        // 50
        i.iLastTransactionItemId,
        null,
        {
          eTransactionType: i.eTransactionType || 'cash-registry', // TODO
          bRefund,
          nStockCorrection: i.eTransactionItemType === 'regular' ? i.quantity : i.quantity - (i.nBrokenProduct || 0),
          eKind: i.type, // TODO // repair
          bDiscount: i.nDiscount > 0,
          bPrepayment: bPrepayment,
        },
        i.iActivityItemId,
        i.oGoldFor,
        i.nDiscount,
        i.redeemedLoyaltyPoints,
        i.sUniqueIdentifier || uuidv4(),
        i.paymentAmount / i.quantity,
        i.description,
        // 60
        i.sServicePartnerRemark,
        i.eEstimatedDateAction,
        i.eActivityItemStatus,
        i.bGiftcardTaxHandling,
        i.bDiscountOnPercentage || false
      )
    });
    console.log('iPayment 201: ', JSON.parse(JSON.stringify(body?.transactionItems)));
    const originalTItemsLength = length = body.transactionItems.filter((i: any) => i.oType.eKind !== 'loyalty-points').length;
    body.transactionItems.map((i: any) => {
      let discountRecords: any = localStorage.getItem('discountRecords');
      if (discountRecords) {
        discountRecords = JSON.parse(discountRecords);
      }
      let _nDiscount = i?.bDiscountOnPercentage ? (i.nPriceIncVat * (i.nDiscount / 100)) : i.nDiscount;
      console.log('-------------------_nDiscount-----------------------------------: ', _nDiscount);
      if (i.oType.bRefund && _nDiscount !== 0) {
        console.log('IN IF CONDITION: ');
        i.nPaymentAmount -= _nDiscount * i.nQuantity;
        i.nRevenueAmount = i.nPaymentAmount;
        const records = discountRecords.filter((o: any) => o.sUniqueIdentifier === i.sUniqueIdentifier);
        records.forEach((record: any) => {
          console.log('IN IF CONDITION record: ', record);
          i.nPaymentAmount += record.nPaymentAmount;
          record.nPaymentAmount = -1 * record.nPaymentAmount;
          record.nRevenueAmount = -1 * record.nRevenueAmount;
          record.nPaidAmount = -1 * record.nPaidAmount;
          record.oType.bRefund = true;
          record.nRedeemedLoyaltyPoints = -1 * record.nRedeemedLoyaltyPoints;
          body.transactionItems.push(record);
          if (i.oType.eKind === 'loyalty-points-discount') {
            body.redeemedLoyaltyPoints += record.nRedeemedLoyaltyPoints;
          }
        });
      } else {
        if (_nDiscount && _nDiscount > 0 && !i.oType.bRefund && !i.iActivityItemId) {
          console.log('IN ELSE: ', i, _nDiscount, i.nQuantity);
          i.nPaymentAmount += _nDiscount * i.nQuantity;
          i.nRevenueAmount += _nDiscount;
          const tItem1 = JSON.parse(JSON.stringify(i));
          tItem1.iArticleGroupId = discountArticleGroup._id;
          tItem1.iArticleGroupOriginalId = i.iArticleGroupId;
          tItem1.oArticleGroupMetaData.sCategory = discountArticleGroup.sCategory;
          tItem1.oArticleGroupMetaData.sSubCategory = discountArticleGroup.sSubCategory;
          tItem1.oType.eTransactionType = 'cash-registry';
          tItem1.oType.eKind = 'discount';
          tItem1.nPaymentAmount = -1 * _nDiscount * i.nQuantity;
          tItem1.nRevenueAmount = -1 * _nDiscount;
          tItem1.nPriceIncVat = tItem1.nPaymentAmount;
          tItem1.nPurchasePrice = tItem1.nPriceIncVat * i.nPurchasePrice / i.nPriceIncVat;
          body.transactionItems.push(tItem1);
        }
      }
    });
    localStorage.removeItem('discountRecords');
    if (redeemedLoyaltyPoints && redeemedLoyaltyPoints > 0) {
      let nDiscount = Math.round(redeemedLoyaltyPoints / originalTItemsLength);
      const reedemedTItem = body.transactionItems.find((o: any) => o.oType.eTransactionType === "loyalty-points");
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
          tItem1.nRevenueAmount = -1 * nDiscount;
          tItem1.nRedeemedLoyaltyPoints = nDiscount;
          body.transactionItems.push(tItem1);
          i.nDiscount += nDiscount;
        }
      });
    }
    console.log('finaly body: ', body);
    return body;
  }

  createGiftcardTransactionItem(body: any, discountArticleGroup: any) {
    const originalTItems = length = body.transactionItems.filter((i: any) => i.oType.eKind !== 'loyalty-points-discount' && i.oType.eKind !== 'discount' && i.oType.eKind !== 'loyalty-points' && i.oType.eKind !== 'giftcard-discount');
    const gCard = body.payments.find((payment: any) => payment.sName === 'Giftcards' && payment.type === 'custom');
    let nDiscount = 0;
    if (gCard?.amount) nDiscount = (Math.round((gCard?.amount || 0) / (originalTItems?.length || 1))) || 0;
    originalTItems.map((item: any) => {
      if (gCard) {
        if (nDiscount > gCard.amount) {
          nDiscount = gCard.amount;
          gCard.amount = 0;
        } else {
          gCard.amount = gCard.amount - nDiscount;
        }
      }
      const tItem1 = JSON.parse(JSON.stringify(item));
      tItem1.iArticleGroupId = discountArticleGroup._id;
      tItem1.oArticleGroupMetaData.sCategory = discountArticleGroup.sCategory;
      tItem1.oArticleGroupMetaData.sSubCategory = discountArticleGroup.sSubCategory;
      tItem1.oType.eTransactionType = 'cash-registry';
      tItem1.oType.eKind = 'giftcard-discount';
      tItem1.sProductName = 'Giftcard redeemed';
      tItem1.sDescription = '';
      tItem1.nPaymentAmount = -1 * nDiscount;
      tItem1.nRevenueAmount = -1 * nDiscount;
      tItem1.nPriceIncVat = -1 * nDiscount;
      tItem1.nPurchasePrice = -1 * nDiscount;
      tItem1.nDiscount = 0;
      body.transactionItems.push(tItem1);
    });
    console.log(329, body);
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

  createProductMetadata(product: any) {
    const metadata = {
      iSupplierId: product.iBusinessPartnerId, // from business collection with type supplier (Optional)
      iBusinessPartnerId: product.iBusinessPartnerId,
      iBusinessBrandId: product.iBusinessBrandId || product.iBrandId,
      sLabelDescription: product.sLabelDescription,
      bBestseller: product.bBestseller,
      bHasStock: product.bHasStock,
      bShowSuggestion: product.bShowSuggestion,
      aProperty: product.aProperty,
      aImage: product.aImage, // "url;alt"
      oName: product.oName,
      oShortDescription: product.oShortDescription,
      eGender: product.eGender,
      eOwnerShip: product.eOwnerShip,
      sProductNumber: product.sProductNumber,
    }
    return metadata
  }

  async processTransactionForPdfReceipt(transaction:any){
    const relatedItemsPromises: any = [];
    let language: any = localStorage.getItem('language')
    let dataObject = JSON.parse(JSON.stringify(transaction));

    dataObject.aPayments.forEach((obj: any) => {
      obj.dCreatedDate = moment(dataObject.dCreatedDate).format('DD-MM-yyyy hh:mm');
    });

    dataObject.aTransactionItems = [];
    transaction.aTransactionItems.forEach((item: any, index: number) => {
      if (!(item.oType?.eKind == 'discount' || item?.oType?.eKind == 'loyalty-points-discount')) {
        dataObject.aTransactionItems.push(item);
      }
    })


    dataObject.total = 0;
    let total = 0, totalAfterDisc = 0, totalVat = 0, totalDiscount = 0, totalSavingPoints = 0;
    dataObject.aTransactionItems.forEach((item: any, index: number) => {
      if (item?.oArticleGroupMetaData?.oName && Object.keys(item?.oArticleGroupMetaData?.oName)?.length){
        item.sArticleGroupName = (item?.oArticleGroupMetaData?.oName[language] || item?.oArticleGroupMetaData?.oName['en'] || item?.oArticleGroupMetaData?.oName['nl'] || '') + ' ';
      }
      // if (item?.oBusinessProductMetaData?.sLabelDescription){
      //   item.description = item.description + item?.oBusinessProductMetaData?.sLabelDescription + ' ' + item?.sProductNumber;
      // }
      totalSavingPoints += item.nSavingsPoints;
      let disc = parseFloat(item.nDiscount);
      if (item.bDiscountOnPercentage) {
        disc = (disc * parseFloat(item.nPriceIncVat) / 100);
        item.nDiscountToShow = disc;//.toFixed(2);
      } else { item.nDiscountToShow = disc; }
      // item.priceAfterDiscount = parseFloat(item.nRevenueAmount.toFixed(2)) - parseFloat(item.nDiscountToShow);
      item.nPriceIncVatAfterDiscount = parseFloat(item.nPriceIncVat) - parseFloat(item.nDiscountToShow);
      item.totalPaymentAmount = (parseFloat(item.nRevenueAmount.toFixed(2)) - parseFloat(item.nDiscountToShow)) * parseFloat(item.nQuantity);
      // item.totalPaymentAmountAfterDisc = parseFloat(item.priceAfterDiscount.toFixed(2)) * parseFloat(item.nQuantity);
      item.bPrepayment = item?.oType?.bPrepayment || false;
      const vat = (item.nVatRate * item.nRevenueAmount / (100 + parseFloat(item.nVatRate)));
      item.vat = (item.nVatRate > 0) ? parseFloat(vat.toFixed(2)) : 0;
      totalVat += vat;
      total = total + item.totalPaymentAmount;
      totalAfterDisc += item.nPriceIncVatAfterDiscount;
      totalDiscount += disc;
      relatedItemsPromises[index] = this.getRelatedTransactionItem(item?.iActivityItemId, item?._id, index);
    })
    await Promise.all(relatedItemsPromises).then(result => {
      result.forEach((item: any, index: number) => {
        transaction.aTransactionItems[index].related = item.data || [];
      })
    });
    dataObject.totalAfterDisc = parseFloat(totalAfterDisc.toFixed(2));
    dataObject.total = parseFloat(total.toFixed(2));
    dataObject.totalVat = parseFloat(totalVat.toFixed(2));
    dataObject.totalDiscount = parseFloat(totalDiscount.toFixed(2));
    dataObject.totalSavingPoints = totalSavingPoints;
    dataObject.dCreatedDate = moment(dataObject.dCreatedDate).format('DD-MM-yyyy hh:mm');
    const result: any = await this.getRelatedTransaction(dataObject?.iActivityId, dataObject?._id).toPromise();
    dataObject.related = result.data || [];
    dataObject.related.forEach((obj: any) => {
      obj.aPayments.forEach((obj: any) => {
        obj.dCreatedDate = moment(obj.dCreatedDate).format('DD-MM-yyyy hh:mm');
      });
      dataObject.aPayments = dataObject.aPayments.concat(obj.aPayments);
    })
    transaction = dataObject;
    return transaction;
  }

  getRelatedTransactionItem(iActivityItemId: string, iTransactionItemId: string, index: number) {
    return this.apiService.getNew('cashregistry', `/api/v1/transaction/item/activityItem/${iActivityItemId}?iBusinessId=${this.iBusinessId}&iTransactionItemId=${iTransactionItemId}`).toPromise();
  }

  getRelatedTransaction(iActivityId: string, iTransactionId: string) {
    const body = {
      iBusinessId: this.iBusinessId,
      iTransactionId: iTransactionId
    }
    return this.apiService.postNew('cashregistry', '/api/v1/transaction/activity/' + iActivityId, body);
  }
}
