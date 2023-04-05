import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { TransactionItem } from 'src/app/till/models/transaction-item.model';
import { Transaction } from 'src/app/till/models/transaction.model';
import { ApiService } from './api.service';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
// import * as _moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { TaxService } from './tax.service';
// const moment = (_moment as any).default ? (_moment as any).default : _moment;
@Injectable({
  providedIn: 'root'
})
export class TillService {

  currency: string = "€";
  separator: string = ",";

  iBusinessId = localStorage.getItem('currentBusiness') || '';
  iLocationId = localStorage.getItem('currentLocation') || '';
  iWorkstationId = localStorage.getItem('currentWorkstation') || '';

  settings:any;
  taxes:any;

  constructor(
    private apiService: ApiService,
    private translateService: TranslateService,
    private taxService: TaxService) {
    this.fetchTaxes();
    }
  
  async fetchTaxes() {
    if(this.taxes?.length) return;
    let taxDetails: any = await this.taxService.getLocationTax({ iLocationId: this.iLocationId });
    if (taxDetails) {
      this.taxes = taxDetails?.aRates || [];
    } else {
      setTimeout(async () => {
        taxDetails = await this.taxService.getLocationTax({ iLocationId: this.iLocationId });
        this.taxes = taxDetails?.aRates || [];
      }, 1000);
    }
  }
  selectCurrency(oLocation: any) {
    // console.log('oLocation? currency selection', oLocation?.eCurrency)
    if (oLocation?.eCurrency) {
      switch (oLocation?.eCurrency) {
        case 'pound':
          this.currency = "£";
          break;
        case 'swiss':
          this.currency = "₣";
          break;
        case 'euro':
          this.currency = "€";
          break;
      }
    }
    // console.log('this.currency succesfully selected', this.currency)
  }


  getUsedPayMethods(total: boolean, payMethods: any): any {
    // console.log(45, 'getUsedPayMethods', payMethods)
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
    if (key === 'currentUser') {
      const value = localStorage.getItem('currentUser');
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
    // console.log('createTransactionBody transactionItems: ', transactionItems);
    this.updateVariables();

    const iLocationId = transactionItems?.length && transactionItems[0].iLocationId ? transactionItems[0].iLocationId : this.iLocationId; /* If we changed the location from the drop-down then it would change */
    const transaction = new Transaction(
      null,
      null,
      null,
      this.iBusinessId,
      null,
      'cash-register-revenue',
      'y',
      this.iWorkstationId,
      this.getValueFromLocalStorage('currentUser').userId,
      iLocationId,
      null,
      null,
    )

    const body = {
      iBusinessId: this.iBusinessId,
      iLocationId: iLocationId,
      iWorkstationId: this.iWorkstationId,
      transactionItems: transactionItems,
      oTransaction: transaction,
      payments: payMethods,//this.getUsedPayMethods(false, payMethods),
      redeemedLoyaltyPoints,
    };

    body.payments.forEach((payment: any) => payment.amount = parseFloat(payment.amount.toFixed(2)))

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
        sCompanyName: customer.sCompanyName,
        sCocNumber: customer.sCocNumber,
        sEmail: customer.sEmail
      }
    };
    // console.log('length 115: ', transactionItems?.length);
    body.transactionItems = transactionItems.map((i: any) => {
      // console.log(i)
      // console.log('i.sSerialNumber: ', i.sSerialNumber);
      const bRefund =
        i.oType?.bRefund /* Indication from the User */
        || i.nDiscount.quantity < 0 /* Minus Discount (e.g. -10 discount) [TODO: Remove the quantity as its not exist at all] */
        || i.price < 0; /* PriceIncVat is minus; Should we not add the nQuantity as a required the positive number here */
      const bPrepayment =
        (bRefund && i.oType?.bPrepayment) /* User indicates it is refund or negative amount */
        // || (i.paymentAmount > 0 /* Whenever the prepayment-field is filled */
        || (this.getUsedPayMethods(true, payMethods) - this.getTotals('price', transactionItems) < 0)
        || (i.paymentAmount !== i.amountToBePaid)

      // console.log('i.paymentAmount: ', i.paymentAmount);
      // console.log('i.bRefund: ', bRefund);
      // console.log('UsedPaymentMethod: ', this.getUsedPayMethods(true, payMethods));//0.02
      // console.log('getTotal: ', this.getTotals('price', transactionItems));//0.03
      // console.log('Last condition: ', i.paymentAmount, i.amountToBePaid);
      // console.log('bPrepayment: ', bPrepayment, bRefund && i.oType?.bPrepayment, (this.getUsedPayMethods(true, payMethods) - this.getTotals('price', transactionItems) < 0), (i.paymentAmount !== i.amountToBePaid));
      i.price = +(Number(String(i.price).replace(',','.')).toFixed(2));
      i.nPurchasePrice = +(i.nPurchasePrice?.toFixed(2) || 0);
      const oItem = new TransactionItem();
      oItem.sProductName = i.name;
      oItem.sComment = i.comment;
      oItem.sProductNumber = i.sProductNumber;
      oItem.nPriceIncVat = (i.type === 'gold-purchase') ? - (i.price) : i.price;
      oItem.nPurchasePrice = i.nPurchasePrice;
      if (i.type === 'repair' || i.type === 'order') {
        oItem.nActualCost = oItem.nPurchasePrice;
      }
      oItem.nProfit = i.price - i.nPurchasePrice;
      oItem.nVatRate = i.tax;
      oItem.nQuantity = i.quantity;
      oItem.iProductId = i._id;
      oItem.sEan = i.ean;
      oItem.sArticleNumber = i.sArticleNumber;
      oItem.aImage = i.aImage;
      oItem.nMargin = i.nMargin;
      oItem.iBusinessPartnerId = i.iBusinessPartnerId;
      oItem.sBusinessPartnerName = i.sBusinessPartnerName;
      oItem.iBusinessId = this.iBusinessId;
      oItem.iArticleGroupId = i.iArticleGroupId;
      oItem.iArticleGroupOriginalId = i.iArticleGroupOriginalId || i.iArticleGroupId;
      oItem.oArticleGroupMetaData = i?.oArticleGroupMetaData;
      oItem.bPayLater = i?.isExclude;
      oItem.bDeposit = false;
      oItem.sProductCategory = 'CATEGORY';
      oItem.sGiftCardNumber = i?.sGiftCardNumber;
      oItem.nEstimatedTotal = +(i?.nTotal?.toFixed(2)) || 0;
      
      const nTotal = +(i.price.toFixed(2) * i.quantity);
      if ((nTotal - i.paymentAmount) > 0.05) {
        oItem.nPaymentAmount = +(i.paymentAmount.toFixed(2));
      } else {
        oItem.nPaymentAmount = nTotal;
      }
      oItem.nPaidLaterAmount = 0;
      oItem.bDiscount = i.nDiscount.value > 0;
      oItem.bDiscountPercent = i.nDiscount.percent;
      oItem.nDiscountValue = i.nDiscount.value;
      oItem.nRefundAmount = +((i?.nRefundAmount || 0).toFixed(2));
      oItem.dEstimatedDate = i.dEstimatedDate;
      oItem.iBusinessBrandId = i.iBusinessBrandId;
      oItem.iBusinessProductId = i.iBusinessProductId;
      oItem.oBusinessProductMetaData = i.oBusinessProductMetaData;
      oItem.eStatus = 'y';
      oItem.iWorkstationId = this.iWorkstationId;
      oItem.iEmployeeId = i.iEmployeeId || this.getValueFromLocalStorage('currentUser').userId;
      oItem.iAssigneeId = i.iAssigneeId;
      oItem.iLocationId = iLocationId;
      oItem.sBagNumber = i.sBagNumber;
      oItem.iSupplierId = i.iSupplierId; // repairer id
      // 50
      oItem.iLastTransactionItemId = i.iLastTransactionItemId;
      oItem.oType = {
        eTransactionType: i.eTransactionType || 'cash-registry', // TODO
        bRefund,
        nStockCorrection: i.eTransactionItemType === 'regular' ? i.quantity : i.quantity - (i.nBrokenProduct || 0),
        eKind: i.type, // TODO // repai
        bDiscount: i.nDiscount > 0,
        bPrepayment: bPrepayment
      };
      // console.log(oItem.oType);
      oItem.iActivityItemId = i.iActivityItemId;
      oItem.oGoldFor = i.oGoldFor;
      oItem.nDiscount = i.nDiscount;
      oItem.nGiftcardDiscount = i?.nGiftcardDiscount;
      oItem.nRedeemedLoyaltyPoints = i.nRedeemedLoyaltyPoints;
      oItem.sUniqueIdentifier = i.sUniqueIdentifier || uuidv4();
      oItem.nRevenueAmount = +((oItem.nPaymentAmount / i.quantity).toFixed(2));
      oItem.sDescription = i.description;

      oItem.sServicePartnerRemark = i.sServicePartnerRemark;
      oItem.sCommentVisibleServicePartner = i.sCommentVisibleServicePartner;
      oItem.eEstimatedDateAction = i.eEstimatedDateAction;
      if (i.type === 'giftcard') { //|| (bPrepayment === false && (i.type === 'repair' || i.type === 'order'))
        oItem.eActivityItemStatus = 'delivered';
        oItem.nGiftcardRemainingAmount = oItem.nPriceIncVat;
      } else if (i.type === 'repair' && i.amountToBePaid === 0 && i.paymentAmount === 0 && !i?.isExclude) {
          oItem.eActivityItemStatus = 'delivered';
      } else {
        oItem.eActivityItemStatus = i.eActivityItemStatus;
      }
      oItem.bGiftcardTaxHandling = i.bGiftcardTaxHandling;
      oItem.bDiscountOnPercentage = i.bDiscountOnPercentage || false
      if (i?.sSerialNumber) oItem.sSerialNumber = i.sSerialNumber;
      return oItem;
    });
    // const originalTItemsLength = length = body.transactionItems.filter((i: any) => i.oType.eKind !== 'loyalty-points').length;
    body.transactionItems.map((i: any) => {
      let discountRecords: any = localStorage.getItem('discountRecords');
      if (discountRecords) {
        discountRecords = JSON.parse(discountRecords);
      }
      let _nDiscount = +((i?.bDiscountOnPercentage ? (i.nPriceIncVat * (i.nDiscount / 100)) : i.nDiscount).toFixed(2));
      if (i.oType.bRefund && _nDiscount !== 0) {
        i.nPaymentAmount -= _nDiscount * i.nQuantity;
        i.nRevenueAmount = i.nPaymentAmount;
        const records = discountRecords.filter((o: any) => o.sUniqueIdentifier === i.sUniqueIdentifier);
        records.forEach((record: any) => {
          // console.log('IN IF CONDITION record: ', record);
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
          // console.log('IN ELSE: ', i, _nDiscount, i.nQuantity);
          i.nPaymentAmount += (_nDiscount * i.nQuantity);
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
      i.nPaymentAmount += (i?.nGiftcardDiscount || 0 + i?.nRedeemedLoyaltyPoints || 0);
      i.nRevenueAmount += (i?.nGiftcardDiscount || 0 + i?.nRedeemedLoyaltyPoints || 0);
    });
    localStorage.removeItem('discountRecords');
    if (redeemedLoyaltyPoints && redeemedLoyaltyPoints > 0) {
      // let nDiscount = Math.round(redeemedLoyaltyPoints / originalTItemsLength);
      const reedemedTItem = body.transactionItems.find((o: any) => o.oType.eTransactionType === "loyalty-points");
      // console.log({reedemedTItem})
      body.transactionItems.map((i: any) => {
        let nDiscount = i.nRedeemedLoyaltyPoints;
        if (i.oType.eKind !== 'discount' && i.oType.eKind !== 'loyalty-points') {
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
          // i.nDiscount += nDiscount;
        }
      });
    }
    console.log('finaly body: ', body);
    return body;
  }

  createGiftcardTransactionItem(body: any, discountArticleGroup: any) {
    const originalTItems = body.transactionItems.filter((i: any) => i.oType.eKind !== 'loyalty-points-discount' && i.oType.eKind !== 'discount' && i.oType.eKind !== 'loyalty-points' && i.oType.eKind !== 'giftcard-discount');
    const gCard = body.giftCards[0];//.find((payment: any) => payment.sName === 'Giftcards' && payment.type === 'custom');
    let nDiscount = 0;
    if (gCard?.nAmount) nDiscount = (Math.round((gCard?.nAmount || 0) / (originalTItems?.length || 1))) || 0;
    originalTItems.map((item: any) => {
      // if (gCard) {
      //   if (nDiscount > gCard.amount) {
      //     nDiscount = gCard.amount;
      //     gCard.amount = 0;
      //   } else {
      //     gCard.amount = gCard.amount - nDiscount;
      //   }
      // }
      const tItem1 = JSON.parse(JSON.stringify(item));
      tItem1.iArticleGroupId = discountArticleGroup._id;
      tItem1.oArticleGroupMetaData.sCategory = discountArticleGroup.sCategory;
      tItem1.oArticleGroupMetaData.sSubCategory = discountArticleGroup.sSubCategory;
      tItem1.oType.eTransactionType = 'cash-registry';
      tItem1.oType.eKind = 'giftcard-discount';
      tItem1.sProductName = 'Giftcard redeemed';
      tItem1.sDescription = '';
      tItem1.nPaymentAmount = -1 * item.nGiftcardDiscount;
      tItem1.nRevenueAmount = -1 * item.nGiftcardDiscount;
      tItem1.nPriceIncVat = -1 * item.nGiftcardDiscount;
      tItem1.nPurchasePrice = -1 * item.nGiftcardDiscount;
      tItem1.nDiscount = 0;
      body.transactionItems.push(tItem1);
    });
    // console.log(329, body);
  }

  checkArticleGroups(): Observable<any> {
    let data = {
      skip: 0,
      limit: 1,
      searchValue: 'Ordered products',
      oFilterBy: {
      },
      iBusinessId: this.iBusinessId,
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

  processTransactionSearchResult(result: any) {
    // console.log('processTransactionSearchResult', JSON.parse(JSON.stringify(result)));
    const transactionItems: any = [];
    if (result.transaction) {
      result.transactionItems.forEach((item: any) => {
        if (item.isSelected) {
          const { tType } = item;
          // const nTotalDiscount = (item?.nRedeemedLoyaltyPoints || 0) - (item?.nGiftcardDiscount || 0);

          let paymentAmount = (item.nQuantity * item.nPriceIncVat) - item.nPaymentAmount;
          
            // - nTotalDiscount;
          // console.log(436, {paymentAmount})
          if (tType === 'refund') {
            // paymentAmount = -1 * item.nPaidAmount;
            paymentAmount = 0;
            // console.log(404, 'paymentAmount', paymentAmount)
            item.oType.bRefund = true;
            item.bShowGiftcardDiscountField = false;
            item.bShowLoyaltyPointsDiscountField = false;
          } else if (tType === 'revert') {
            paymentAmount = item.nPaidAmount;
            // console.log(408, 'paymentAmount', paymentAmount)
            item.oType.bRefund = false;
          } else {
            item.bShowGiftcardDiscountField = item.nGiftcardDiscount > 0;
            item.bShowLoyaltyPointsDiscountField = item.nRedeemedLoyaltyPoints > 0;
          }
          transactionItems.push({
            name: item.sProductName || item.sProductNumber,
            iActivityItemId: item.iActivityItemId,
            nRefundAmount: item.nPaidAmount,
            iLastTransactionItemId: item.iTransactionItemId,
            prePaidAmount: tType === 'refund' ? item.nPaidAmount : item.nPaymentAmount,
            type: item.sGiftCardNumber ? 'giftcard' : item.oType.eKind,
            eTransactionItemType: 'regular',
            nBrokenProduct: 0,
            tType,
            oType: item.oType,
            sUniqueIdentifier: item.sUniqueIdentifier,
            aImage: item.aImage,
            nonEditable: item.sGiftCardNumber ? true : false,
            sGiftCardNumber: item.sGiftCardNumber,
            quantity: item.nQuantity,
            iBusinessProductId: item.iBusinessProductId,
            price: (item.nPriceIncVat), //- nTotalDiscount
            iRepairerId: item.iRepairerId,
            oArticleGroupMetaData: item.oArticleGroupMetaData,
            nRedeemedLoyaltyPoints: item.nRedeemedLoyaltyPoints,
            iArticleGroupId: item.iArticleGroupId,
            iEmployeeId: item.iEmployeeId,
            iBusinessBrandId: item.iBusinessBrandId,
            nDiscount: 0, //item.nDiscount ||
            tax: item.nVatRate,
            oGoldFor: item.oGoldFor,
            iSupplierId: item.iSupplierId,
            paymentAmount,
            description: item.sDescription,
            open: false,
            nMargin: item.nMargin,
            nPurchasePrice: item.nPurchasePrice,
            oBusinessProductMetaData: item.oBusinessProductMetaData,
            sServicePartnerRemark: item.sServicePartnerRemark,
            sCommentVisibleServicePartner:item.sCommentVisibleServicePartner,
            eActivityItemStatus: item.eActivityItemStatus,
            eEstimatedDateAction: item.eEstimatedDateAction,
            bGiftcardTaxHandling: item.bGiftcardTaxHandling,
            sArticleNumber: item?.sArticleNumber,
            iLocationId: item?.iLocationId,
            sBagNumber: item?.sBagNumber,
            bShowGiftcardDiscountField: item?.bShowGiftcardDiscountField,
            bShowLoyaltyPointsDiscountField:  item?.bShowLoyaltyPointsDiscountField,
          });
        }
      });
      result.transactionItems = transactionItems;
      return result;
    }
  }

  async processTransactionForPdfReceipt(transaction: any) {
    // console.log('processTransactionForPdfReceipt original', JSON.parse(JSON.stringify(transaction)));
    const relatedItemsPromises: any = [];
    let language: any = localStorage.getItem('language')
    let dataObject = JSON.parse(JSON.stringify(transaction));

    dataObject.businessDetails.sMobile = dataObject.businessDetails?.oPhone?.sMobile || '';
    dataObject.businessDetails.sLandLine = dataObject.businessDetails?.oPhone?.sLandLine;
    dataObject.businessDetails.sAddressline1 = (dataObject.businessDetails?.currentLocation?.oAddress?.street + " " +
      dataObject.businessDetails?.currentLocation?.oAddress?.houseNumber + " " +
      dataObject.businessDetails?.currentLocation?.oAddress?.houseNumberSuffix + " ,  " +
      dataObject.businessDetails?.currentLocation?.oAddress?.postalCode + " " +
      dataObject.businessDetails?.currentLocation?.oAddress?.city) || '';
    dataObject.businessDetails.sAddressline2 = dataObject.businessDetails?.currentLocation?.oAddress?.country || '';


    dataObject.oCustomer = this.processCustomerDetails(dataObject.oCustomer);
    
    dataObject.nPaymentMethodTotal = 0;
    
    dataObject.aPayments.forEach((obj: any) => {
      obj.bIgnore = false;
      dataObject.nPaymentMethodTotal += obj.nAmount;
      if(!obj?.sRemarks) obj.sRemarks = "";
      
      // obj.dCreatedDate = moment(obj.dCreatedDate);//.format('DD-MM-yyyy hh:mm');
    });
    dataObject.nNewPaymentMethodTotal = dataObject.nPaymentMethodTotal;
    
    // const aLoyaltyPointsItems = transaction.aTransactionItems.filter((item: any) => item?.oType?.eKind == 'loyalty-points-discount');

    // dataObject.aTransactionItems = [];
    // transaction.aTransactionItems.map((item: any) => {
    //   if (item.oType?.eKind != 'discount' || item?.oType?.eKind != 'loyalty-points-discount') {
    //     item.nRedeemedLoyaltyPoints = 0;
    //     for (let i = 0; i < aLoyaltyPointsItems.length; i++) {
    //       if (aLoyaltyPointsItems[i].iBusinessProductId === item.iBusinessProductId) {
    //         // item.nRedeemedLoyaltyPoints = aLoyaltyPointsItems[i].nRedeemedLoyaltyPoints;
    //         // item.nDiscount += aLoyaltyPointsItems[i].nDiscount;
    //         break;
    //       }
    //     }
    //   }
    // })

    dataObject.aTransactionItems = transaction.aTransactionItems.filter((item: any) =>
      !(item.oType?.eKind == 'discount' || item?.oType?.eKind == 'loyalty-points-discount' || item.oType.eKind == 'loyalty-points' || item.oType?.eKind == 'giftcard-discount'));
    let total = 0, 
      totalAfterDisc = 0, 
      totalVat = 0, 
      totalDiscount = 0, 
      totalSavingPoints = 0, 
      totalRedeemedLoyaltyPoints = 0, 
      totalGiftcardDiscount = 0,
      nTotalQty = 0;
    const aToFetchPayments:any = [];
    dataObject.aTransactionItems.forEach((item: any, index: number) => {
      
      nTotalQty += item?.nQuantity;
      if (item?.aPayments?.some((payment: any) => payment.sMethod === 'card')) {
        aToFetchPayments.push(item.iTransactionId);
      }

      if (item.oType.eKind === 'giftcard') {
        item.sDescription = this.translateService.instant('VOUCHER_SALE');
      }
      item.bRegular = !item.oType.bRefund;
      if (item?.oArticleGroupMetaData?.oName && Object.keys(item?.oArticleGroupMetaData?.oName)?.length) {
        item.sArticleGroupName = (item?.oArticleGroupMetaData?.oName[language] || item?.oArticleGroupMetaData?.oName['en'] || item?.oArticleGroupMetaData?.oName['nl'] || '') + ' ';
      }
      // if (item?.oBusinessProductMetaData?.sLabelDescription){
      //   item.description = item.description + item?.oBusinessProductMetaData?.sLabelDescription + ' ' + item?.sProductNumber;
      // }
      totalSavingPoints += ( item?.nSavingsPoints || 0);
      totalRedeemedLoyaltyPoints += item?.nRedeemedLoyaltyPoints || 0;
      let disc = parseFloat(item?.nDiscount) || 0;
      // console.log(545, 'bDiscountOnPercentage', item.bDiscountOnPercentage)
      if (item.bDiscountOnPercentage) {
        disc = this.getPercentOf(disc, item.nPriceIncVat)
        item.nDiscountToShow = +(disc.toFixed(2));
      } else { item.nDiscountToShow = disc }
      // console.log('item.nDiscountToShow', item.nDiscountToShow, 'item.nPriceIncVat', 'nPriceIncVat', item.nPriceIncVat, 'nQuantity', item.nQuantity, 'nRedeemedLoyaltyPoints', item.nRedeemedLoyaltyPoints, 'nGiftcardDiscount',item.nGiftcardDiscount);
      
      item.nPriceIncVatAfterDiscount = (+(item.nPriceIncVat.toFixed(2)) - +(item.nDiscountToShow.toFixed(2))) * item.nQuantity - (item?.nRedeemedLoyaltyPoints || 0) - (item?.nGiftcardDiscount || 0);
      item.nTotalPriceIncVat = item.nPriceIncVat * item.nQuantity;
      // item.nPriceIncVatAfterDiscount = parseFloat(item.nPriceIncVatAfterDiscount.toFixed(2));
      // console.log('nPriceIncVatAfterDiscount', item.nPriceIncVatAfterDiscount);
      if (item.oType.bRefund === true && item.oType.eKind != 'gold-purchase') item.nPriceIncVatAfterDiscount = -(item.nPriceIncVatAfterDiscount)
      // console.log('item.nPriceIncVatAfterDiscount', item.nPriceIncVatAfterDiscount)
      // item.nRevenueAmount = (+(item.nRevenueAmount.toFixed(2)) - item.nDiscount) * item.nQuantity;
      // console.log(566, item?.totalPaymentAmount, item.nRevenueAmount, item.nDiscountToShow, item.nRedeemedLoyaltyPoints, item.nGiftcardDiscount);
      item.totalPaymentAmount = (parseFloat(item.nRevenueAmount) - parseFloat(item.nDiscountToShow)) * item.nQuantity - (item?.nRedeemedLoyaltyPoints || 0) - (item?.nGiftcardDiscount || 0);
      item.totalPaymentAmount = +(item.totalPaymentAmount.toFixed(2));
      // console.log('item.totalPaymentAmount', item.totalPaymentAmount)
      // item.totalPaymentAmountAfterDisc = parseFloat(item.priceAfterDiscount.toFixed(2)) * parseFloat(item.nQuantity);
      item.bPrepayment = item?.oType?.bPrepayment || false;
      const vat = (item.nVatRate * item.totalPaymentAmount / (100 + parseFloat(item.nVatRate)));
      item.vat = (item.nVatRate > 0) ? parseFloat(vat.toFixed(2)) : 0;
      totalVat += vat * item.nQuantity;
      total = total + item.totalPaymentAmount;
      // console.log('total', total)
      if (item.oType.bRefund) {
        totalAfterDisc += item.totalPaymentAmount;
        item.ntotalDiscountPerItem = 0;
      } else {
        totalAfterDisc += (item.nPriceIncVatAfterDiscount * item.nQuantity);
        item.ntotalDiscountPerItem = item.nDiscountToShow * item.nQuantity
      }
      // console.log('totalAfterDisc', totalAfterDisc)
      totalDiscount += item.ntotalDiscountPerItem;
      totalGiftcardDiscount += item?.nGiftcardDiscount || 0;
      // console.log('totalDiscount', totalDiscount)
      if(!item?.bMigrate){
        relatedItemsPromises[index] = this.getRelatedTransactionItem(item?.iActivityItemId, item?._id, index);

      }
    })
    await Promise.all(relatedItemsPromises).then(result => {
      // console.log(result);
      result.forEach((item: any, index: number) => {
        transaction.aTransactionItems[index].related = item.data || [];
      })
    });
    
    transaction.aTransactionItems.forEach((item: any) => {
      if (item?.oType?.bRefund) {
        item.bShowGiftcardDiscountField = false;  
        item.bShowLoyaltyPointsDiscountField = false;
      } else {
        item.bShowGiftcardDiscountField = item?.nGiftcardDiscount && totalGiftcardDiscount > 0;
        item.bShowLoyaltyPointsDiscountField = item?.nRedeemedLoyaltyPoints && totalRedeemedLoyaltyPoints > 0;
      }
      let description = (item?.nDiscountToShow || item.bShowGiftcardDiscountField || item.bShowLoyaltyPointsDiscountField) ? `${this.translateService.instant('ORIGINAL_AMOUNT_INC_DISC')}: ${item.nTotalPriceIncVat}\n` : '';
      item.eKind = item.oType.eKind;
      if (item?.related?.length) {
        
        if (item.nPriceIncVatAfterDiscount !== item.nRevenueAmount) {
          description += `${this.translateService.instant('ALREADY_PAID')}: \n${item.sTransactionNumber} | ${item.totalPaymentAmount} (${this.translateService.instant('THIS_RECEIPT')})\n`;
        }

        item.related.forEach((relatedItem: any) => {
          
          if(relatedItem?.aPayments?.some((payment: any) => payment.sMethod === 'card')){
            aToFetchPayments.push(relatedItem.iTransactionId);
          }
          // relatedItem.aPayments = relatedItem?.aPayments.filter((payment: any) => payment?.sRemarks !== 'CHANGE_MONEY');
          // if (relatedItem.nPriceIncVat > item.nPriceIncVat) item.nPriceIncVat = relatedItem.nPriceIncVat;
          // item.nDiscount = relatedItem.nDiscount || 0;
          // item.bDiscountOnPercentage = relatedItem?.bDiscountOnPercentage || false;

          if(!relatedItem.oType?.bRefund) {
            if (relatedItem?.bDiscountOnPercentage) {
              item.nDiscountToShow = (item.oType.bRefund === true) ? 0 : this.getPercentOf(relatedItem.nPriceIncVat, relatedItem.nDiscount);
              totalDiscount += (item.oType.bRefund === true) ? 0 : item.nDiscountToShow;
              relatedItem.totalPaymentAmount = (+(relatedItem.nRevenueAmount.toFixed(2)) - this.getPercentOf(relatedItem.nPriceIncVat, relatedItem.nDiscount)) * relatedItem.nQuantity;
              // console.log(600, item.nDiscountToShow, relatedItem.totalPaymentAmount);
            } else {
              item.nDiscountToShow = (item.oType.bRefund === true) ? 0 : relatedItem.nDiscount;
              totalDiscount += (item.oType.bRefund === true) ? 0 : item.nDiscountToShow;
              relatedItem.totalPaymentAmount = (relatedItem.nRevenueAmount > 0) ? (+(relatedItem.nRevenueAmount.toFixed(2)) - relatedItem.nDiscount) * relatedItem.nQuantity : 0;
              // console.log(605, item.nDiscountToShow, relatedItem.totalPaymentAmount);
            }
            relatedItem.totalPaymentAmount -= (relatedItem?.nRedeemedLoyaltyPoints || 0);
          } else {
            if (relatedItem?.bDiscountOnPercentage) {
              relatedItem.totalPaymentAmount = +(relatedItem.nRevenueAmount.toFixed(2)) - this.getPercentOf(relatedItem.nPriceIncVat, relatedItem.nDiscount);
              // console.log(610, relatedItem.totalPaymentAmount)
            } else {
              relatedItem.totalPaymentAmount = (relatedItem.nRevenueAmount > 0) ? (+(relatedItem.nRevenueAmount.toFixed(2)) - relatedItem.nDiscount) * relatedItem.nQuantity : 0;
              // console.log(613, relatedItem.totalPaymentAmount)
            }
          }
          relatedItem.totalPaymentAmount = +(relatedItem.totalPaymentAmount.toFixed(2));
          if (relatedItem.totalPaymentAmount > 0) {
            description += `${relatedItem.sTransactionNumber} | ${relatedItem.totalPaymentAmount}\n`;
          }
        })
      }
      item.description = description;
    })
    if (aToFetchPayments?.length) {
      const oBody = {
        iBusinessId: this.iBusinessId,
        oFilterBy: {
          iTransactionId: [...aToFetchPayments]
        }
      }
      const _payments: any = await this.apiService.postNew('cashregistry', `/api/v1/payments/list`, oBody).toPromise()
      if (_payments?.data?.length && _payments?.data[0]?.result?.length) {
        dataObject.aCardPayments = _payments?.data[0]?.result;
      }
    }

    dataObject.totalAfterDisc = +(totalAfterDisc.toFixed(2));
    dataObject.total = +(total.toFixed(2));
    dataObject.totalVat = +(totalVat.toFixed(2));
    dataObject.totalDiscount = +(totalDiscount.toFixed(2));
    dataObject.totalGiftcardDiscount = +(totalGiftcardDiscount.toFixed(2));
    dataObject.totalSavingPoints = totalSavingPoints;
    dataObject.totalRedeemedLoyaltyPoints = totalRedeemedLoyaltyPoints;
    dataObject.nTotalExcVat = +((dataObject.totalAfterDisc - dataObject.totalVat).toFixed(2));
    dataObject.nTotalQty = nTotalQty;
    // dataObject.dCreatedDate = moment(dataObject.dCreatedDate).format('DD-MM-yyyy hh:mm');
    let _relatedResult:any , _loyaltyPointSettings:any;
    
    if(!dataObject?.bMigrate){
      const [_relatedResultTemp, _loyaltyPointSettingsTemp]: any = await Promise.all([
        this.getRelatedTransaction(dataObject?.iActivityId, dataObject?._id).toPromise(),
        this.apiService.getNew('cashregistry', `/api/v1/points-settings?iBusinessId=${this.iBusinessId}`).toPromise()
      ])
      _relatedResult = _relatedResultTemp;
      _loyaltyPointSettings = _loyaltyPointSettingsTemp;

    }else{             
      _loyaltyPointSettings = await this.apiService.getNew('cashregistry', `/api/v1/points-settings?iBusinessId=${this.iBusinessId}`).toPromise()
    }
    dataObject.bSavingPointsSettings = _loyaltyPointSettings?.bEnabled;
    dataObject.aTransactionItems.forEach((item: any) => item.bSavingPointsSettings = _loyaltyPointSettings?.bEnabled)
    dataObject.related = _relatedResult?.data || [];
    if(dataObject.related.length){
      dataObject.related.forEach((relatedobj: any) => {
        // relatedobj.aPayments = relatedobj.aPayments.filter((payment: any) => payment?.sRemarks !== 'CHANGE_MONEY');
        relatedobj.aPayments.forEach((obj: any) => {
          if (!obj?.sRemarks) obj.sRemarks = "";
          obj.bIgnore = true;
          // obj.dCreatedDate = moment(obj.dCreatedDate).format('DD-MM-yyyy hh:mm');
        });
        dataObject.aPayments = dataObject.aPayments.concat(relatedobj.aPayments);
      })
    }
    transaction = dataObject;
    transaction.bCompletedProcessing = true;
    // console.log('processTransactionForPdfReceipt after processing', transaction);
    return transaction;
  }

  processCustomerDetails(customer:any) {
    // console.log('processCustomerDetails',customer);
    return {
      ...customer,
      ...customer?.oPhone,
      ...customer?.oInvoiceAddress,
    };
  }

  getPercentOf(nNumber: any, nPercent: any) {
    return parseFloat(nNumber) * parseFloat(nPercent) / 100;
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

  async fetchSettings() {
    if(this.settings) return this.settings;
    this.settings = await this.apiService.getNew('cashregistry', `/api/v1/settings/${this.iBusinessId}`).toPromise();
    const oBagNumberSettings = {
      iLocationId: this.iLocationId,
      bAutoIncrementBagNumbers: true,
      nLastBagNumber: 0,
    };

    const oPrefillSettings = {
      iLocationId: this.iLocationId,
      bArticleGroup: true,
      bProductNumber: true,
      bLabelDescription: true
    }
    let oMergedSettings: any = {};
    if (!this.settings?.aBagNumbers?.length) {
      oMergedSettings = { ...oBagNumberSettings };
    } else {
      oMergedSettings = { ...(this.settings.aBagNumbers.find((el: any) => el.iLocationId === this.iLocationId) || oBagNumberSettings) };
    }

    if (!this.settings?.aCashRegisterPrefill?.length) {
      oMergedSettings = { ...oMergedSettings, ...oPrefillSettings };
      this.settings.aCashRegisterPrefill = [{ ...oPrefillSettings }];
    } else {
      oMergedSettings = { ...oMergedSettings, ...(this.settings.aCashRegisterPrefill.find((el: any) => el.iLocationId === this.iLocationId) || oPrefillSettings) };
    }
    // console.log(this.settings);

    this.settings.currentLocation = oMergedSettings;
    // console.log(this.settings);
    return this.settings;
  }

  async updateSettings() {
    if (this.settings?.aBagNumbers?.length) {
    this.settings.aBagNumbers = [...this.settings?.aBagNumbers.filter((el: any) => el.iLocationId !== this.iLocationId), this.settings.currentLocation];
    }
    const body = {
      aBagNumbers: this.settings.aBagNumbers
    };
    
    this.apiService.putNew('cashregistry', `/api/v1/settings/update/${this.iBusinessId}`, body).subscribe((result:any)=> {
      // console.log('settings result', result);
    });
  }

  updateVariables() {
    this.iBusinessId = localStorage.getItem('currentBusiness') || '';
    this.iLocationId = localStorage.getItem('currentLocation') || '';
    this.iWorkstationId = localStorage.getItem('currentWorkstation') || '';
  }
}
