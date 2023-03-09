import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ImportRepairOrderService {

  constructor(
    private translateService: TranslateService
  ) { }

  defaultImportRepairOrderAttribute() {
    const aDefaultAttribute = [
      {
        sColumnHeader: "CREATED_DATE",
        sDataBaseFieldName: "dCreatedDate",
        sName: "dCreatedDate",
        aOptions: []
      },
      {
        sColumnHeader: "MATCHING_CODE",
        sDataBaseFieldName: "nMatchingCode",
        sName: "nMatchingCode",
        aOptions: []
      },
      {
        sColumnHeader: "REMAINING_VALUE",
        sDataBaseFieldName: "nRemainingValue",
        sName: "nRemainingValue",
        aOptions: []
      },
      {
        sColumnHeader: "PRICE_INC_VAT",
        sDataBaseFieldName: "nPriceIncVat",
        sName: "nPriceIncVat",
        aOptions: []
      },
      {
        sColumnHeader: "TAX",
        sDataBaseFieldName: "nVatRate",
        sName: "nVatRate",
        aOptions: []
      },
      // {
      //   sColumnHeader: "BAG_NUMBER",
      //   sDataBaseFieldName: "sBagNumber",
      //   sName: "sBagNumber",
      //   aOptions: []
      // },
      // {
      //   sColumnHeader: "DESCRIPTION",
      //   sDataBaseFieldName: "sDescription",
      //   sName: "sDescription",
      //   aOptions: []
      // },

      // {
      //   sColumnHeader: "ESTIMATE_DATE",
      //   sDataBaseFieldName: "dEstimatedDate",
      //   sName: "dEstimatedDate",
      //   aOptions: []
      // },
      // {
      //   sColumnHeader: "ACTIVITY_ITEM_STATUS",
      //   sDataBaseFieldName: "eActivityItemStatus",
      //   sName: "eActivityItemStatus",
      //   aOptions: []
      // }
    ]

    return aDefaultAttribute;
  }

  processTransactionItem(oData: any): any {
    let { parsedRepairOrderData, referenceObj, iBusinessId, iLocationId, iWorkStationId, iEmployeeId } = oData;

    /* mapping the file's field with database name */
    parsedRepairOrderData = parsedRepairOrderData.map((oRepairOrder: any) => {
      if (Object.keys(oRepairOrder).length) {
        for (let [key, value] of Object.entries(oRepairOrder)) {
          oRepairOrder[referenceObj[key]] = value;
          delete oRepairOrder[key];
        }
      }
      return oRepairOrder;
    })

    if (!parsedRepairOrderData?.length) return [];

    const sProductName = this.translateService.instant('REPAIR');

    /* processing Transaction-Item */
    const aTransactionItem = [];
    for (const oData of parsedRepairOrderData) {
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
        iArticleGroupId: '', /* repair-order */
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
          sCategory: "Repair",
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
          eKind: "repair",
          bDiscount: false,
          bPrepayment: false
        },
        nDiscount: 0,
        sDescription: "",
        sServicePartnerRemark: "",
        eEstimatedDateAction: "call_on_ready",
        eActivityItemStatus: "delivered",
        bDiscountOnPercentage: false,
        bImported: true,
        bImportRepairOrder: true
      }
      aTransactionItem.push(oTransactionItem);
    }

    return aTransactionItem;
  }

  mapTheImportRepairOrderBody(oData: any) {
    const { parsedRepairOrderData, referenceObj, iBusinessId, iLocationId, iWorkStationId, iEmployeeId } = oData;
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

    console.log('importRepairOrder: ', oBody);
    console.log('referenceObj: ', referenceObj);
    return { parsedRepairOrderData, oBody };
  }

  /* Mapping the payment for the repair-order */
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
