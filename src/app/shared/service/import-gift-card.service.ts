import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})

export class ImportGiftCardService {

  constructor(
    private translateService: TranslateService
  ) { }

  defaultImportGiftCardAttribute() {
    const aDefaultAttribute = [
      {
        sColumnHeader: "CREATED_DATE",
        sDataBaseFieldName: "dCreatedDate",
        sName: "dCreatedDate",
      },
      {
        sColumnHeader: "MATCHING_CODE",
        sDataBaseFieldName: "nMatchingCode",
        sName: "nMatchingCode",
      },
      {
        sColumnHeader: "REMAINING_VALUE",
        sDataBaseFieldName: "nRemainingValue",
        sName: "nRemainingValue",
      },
      {
        sColumnHeader: "GIFT_CARD_NUMBER",
        sDataBaseFieldName: "sGiftCardNumber",
        sName: "sGiftCardNumber",
      },
      {
        sColumnHeader: "PRICE_INC_VAT",
        sDataBaseFieldName: "nPriceIncVat",
        sName: "nPriceIncVat",
      },
      {
        sColumnHeader: "TAX",
        sDataBaseFieldName: "nVatRate",
        sName: "nVatRate",
      },
    ]

    return aDefaultAttribute;
  }

  processTransactionItem(oData: any): any {
    let { parsedGiftCardData, referenceObj, iBusinessId, iLocationId, iWorkStationId, iEmployeeId } = oData;

    /* mapping the file's field with database name */
    parsedGiftCardData = parsedGiftCardData.map((oGiftCard: any) => {
      if (Object.keys(oGiftCard).length) {
        for (let [key, value] of Object.entries(oGiftCard)) {
          oGiftCard[referenceObj[key]] = value;
          delete oGiftCard[key];
        }
      }
      return oGiftCard;
    })

    if (!parsedGiftCardData?.length) return [];

    const sProductName = this.translateService.instant('GIFTCARD');

    /* processing Transaction-Item */
    const aTransactionItem = [];
    for (const oData of parsedGiftCardData) {
      if (!oData?.nPriceIncVat) throw ('something went wrong');
      const nPurchasePrice = oData?.nPriceIncVat / (1 + (100 / (oData?.nVatRate || 1)));
      const oTransactionItem = {
        iBusinessId: iBusinessId,
        iWorkStationId: iWorkStationId,
        iEmployeeId: iEmployeeId,
        iLocationId: iLocationId,
        /* File */
        nPriceIncVat: oData?.nPriceIncVat,
        nVatRate: oData?.nVatRate,
        nMatchingCode: oData?.nMatchingCode ? parseFloat(oData?.nMatchingCode) : undefined,
        sGiftCardNumber: oData?.sGiftCardNumber,
        dCreatedDate: oData?.dCreatedDate,
        nEstimatedTotal: oData?.nPriceIncVat,
        nPaymentAmount: oData?.nPriceIncVat,
        nRevenueAmount: oData?.nPriceIncVat,
        nPaidAmount: oData?.nRemainingValue,
        nRemainingValue: oData?.nRemainingValue,
        /* calculated */
        nPurchasePrice: nPurchasePrice,
        nProfit: oData?.nPriceIncVat - nPurchasePrice,
        /* Backend */
        iArticleGroupId: '', /* giftcard */
        iArticleGroupOriginalId: '',
        sUniqueIdentifier: '',
        iCustomerId: '',
        oCustomer: '',
        /* default */
        sProductName: sProductName,
        eStatus: "y",
        aImage: [],
        nMargin: 1,
        nQuantity: 1,
        oArticleGroupMetaData: {
          aProperty: [],
          sCategory: "Giftcard",
          sSubCategory: "Repair",
          oName: {},
          oNameOriginal: {}
        },
        nRefundAmount: 0,
        nPaidLaterAmount: 0,
        bPayLater: false,
        bDeposit: false,
        sProductCategory: "CATEGORY",
        bDiscount: false,
        oType: {
          eTransactionType: "cash-registry",
          bRefund: false,
          nStockCorrection: 1,
          eKind: "giftcard",
          bDiscount: false,
          bPrepayment: false
        },
        nDiscount: 0,
        sDescription: "",
        sServicePartnerRemark: "",
        eEstimatedDateAction: "call_on_ready",
        eActivityItemStatus: "delivered",
        bGiftcardTaxHandling: "true",
        bDiscountOnPercentage: false,
        bImported: true,
        bImportGiftCard: true
      }
      aTransactionItem.push(oTransactionItem);
    }

    return aTransactionItem;
  }

  mapTheImportGiftCardBody(oData: any) {
    const { parsedGiftCardData, referenceObj, iBusinessId, iLocationId, iWorkStationId, iEmployeeId } = oData;
    const aTransactionItem = this.processTransactionItem(oData);

    const oBody: any = {
      iBusinessId: iBusinessId,
      iLocationId: iLocationId,
      iWorkstationId: iWorkStationId,
      oTransaction: {
        eStatus: 'y',
        eType: 'cash-register-revenue',
        iBusinessId: iBusinessId,
        iLocationId: iLocationId,
        iWorkstationId: iWorkStationId,
        iEmployeeId: iEmployeeId,
        bImported: true
      },
      redeemedLoyaltyPoints: 0,
      transactionItems: aTransactionItem,
      sDefaultLanguage: localStorage.getItem('language') || 'nl',
      bImported: true,
    };

    console.log('importGiftCard: ', oBody);
    console.log('referenceObj: ', referenceObj);
    return { parsedGiftCardData, oBody };
  }

  /* Mapping the payment for the gift card */
  mapPayment(oData: any) {
    const aPayment = [
      {
        bIsDefaultPaymentMethod: true,
        _id: "6243ff1a0ab1c8da110423f4",
        sName: "Cash",
        bStockReduction: true,
        bInvoice: true,
        bAssignSavingPointsLastPayment: true,
        eIntegrationMethod: "other",
        isDisabled: true,
        amount: oData?.nPriceIncVat,
        bImported: true
      },
      {
        bIsDefaultPaymentMethod: true,
        _id: "6243ff1a0ab1c8da110423f4",
        sName: "Cash",
        bStockReduction: true,
        bInvoice: true,
        bAssignSavingPointsLastPayment: true,
        eIntegrationMethod: "other",
        isDisabled: true,
        amount: 0,
        remark: "CHANGE_MONEY",
        bImported: true
      }
    ]

    return aPayment;
  }

}
