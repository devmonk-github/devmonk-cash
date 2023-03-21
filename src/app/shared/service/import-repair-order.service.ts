import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ImportRepairOrderService {

  constructor(
    private translateService: TranslateService
  ) { }

  // convertToDate(dateString: any) {
  //   let _dDate;
  //   if (dateString) {
  //     const aDateArray = dateString.split('/');
  //     _dDate = new Date(`${aDateArray[2]}/${aDateArray[1] - 1}/${aDateArray[0]}`);
  //   }
  //   return _dDate;
  // }

  defaultImportRepairOrderAttribute() {
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
        sColumnHeader: "PRICE_INC_VAT",
        sDataBaseFieldName: "nPriceIncVat",
        sName: "nPriceIncVat",
      },
      {
        sColumnHeader: "TOTAL_PRICE",
        sDataBaseFieldName: "nTotalAmount",
        sName: "nTotalAmount",
      },
      {
        sColumnHeader: "TYPE",
        sDataBaseFieldName: "oType.eKind",
        sName: "eKind",
      },
      {
        sColumnHeader: "ACTIVITY_ITEM_STATUS",
        sDataBaseFieldName: "eActivityItemStatus",
        sName: "eActivityItemStatus",
      },
      {
        sColumnHeader: "BAG_NUMBER",
        sDataBaseFieldName: "sBagNumber",
        sName: "sBagNumber",
      },
      {
        sColumnHeader: "TAX",
        sDataBaseFieldName: "nVatRate",
        sName: "nVatRate",
      },
      {
        sColumnHeader: "Photos",
        sDataBaseFieldName: "aImage",
        sName: "aImage",
      },
      {
        sColumnHeader: "CUSTOMER_NAME",
        sDataBaseFieldName: "oCustomer.sFirstName",
        sName: "oCustomer.sFirstName",
      },
      {
        sColumnHeader: "customerId",
        sDataBaseFieldName: "iCustomerId",
        sName: "iCustomerId",
      },
      {
        sColumnHeader: "Note servicepartner",
        sDataBaseFieldName: "sServicePartnerRemark",
        sName: "sServicePartnerRemark",
      },
      {
        sColumnHeader: "contact_when_ready",
        sDataBaseFieldName: "contact_when_ready",
        sName: "contact_when_ready",
      },
      {
        sColumnHeader: "oShippingAddress_sStreet",
        sDataBaseFieldName: "oCustomer.oShippingAddress.sStreet",
        sName: "oCustomer.oShippingAddress.sStreet",
      },
      {
        sColumnHeader: "oShippingAddress_sHouseNumber",
        sDataBaseFieldName: "oCustomer.oShippingAddress.sHouseNumber",
        sName: "oCustomer.oShippingAddress.sHouseNumber",
      },
      {
        sColumnHeader: "oShippingAddress_sHouseNumberSuffix",
        sDataBaseFieldName: "oCustomer.oShippingAddress.sHouseNumberSuffix",
        sName: "oCustomer.oShippingAddress.sHouseNumberSuffix",
      },
      {
        sColumnHeader: "oShippingAddress_sCountryCode",
        sDataBaseFieldName: "oCustomer.oShippingAddress.sCountryCode",
        sName: "oCustomer.oShippingAddress.sCountryCode",
      },
      {
        sColumnHeader: "oShippingAddress_sPostalCode",
        sDataBaseFieldName: "oCustomer.oShippingAddress.sPostalCode",
        sName: "oCustomer.oShippingAddress.sPostalCode",
      },
      {
        sColumnHeader: "oShippingAddress_sCity",
        sDataBaseFieldName: "oCustomer.oShippingAddress.sCity",
        sName: "oCustomer.oShippingAddress.sCity",
      }
      
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


    /* processing Transaction-Item */
    const aTransactionItem = [];
    for (const oData of parsedRepairOrderData) {
      if (!oData?.nPriceIncVat) throw ('something went wrong');
      const eType = oData['oType.eKind'];
      const sCustomerName = oData['oCustomer.sFirstName'];
      console.log("sCustomerName :s" + sCustomerName);

      const street = oData['oCustomer.oShippingAddress.sStreet'];
      const HouseNumber = oData['oCustomer.oShippingAddress.sHouseNumber'];
      const HouseNumberSuffix = oData['oCustomer.oShippingAddress.sHouseNumberSuffix'];
      const PostalCode = oData['oCustomer.oShippingAddress.sPostalCode'];
      const City = oData['oCustomer.oShippingAddress.sCity'];
      const CountryCode = oData['oCustomer.oShippingAddress.sCountryCode'];
     


      console.log(street);



      if(oData.contact_when_ready =="Whatsapp"){
        oData.eEstimatedDateAction = "whatsapp_on_ready";
      }else if (oData.contact_when_ready =="Email"){
        oData.eEstimatedDateAction = "email_on_ready";
      }else {
        oData.eEstimatedDateAction = "call_on_ready";
      }

      
      const sProductName = this.translateService.instant(eType === 'order' ? 'ORDER' : 'REPAIR');
      const nPurchasePrice = oData?.nPriceIncVat / (1 + (100 / (oData?.nVatRate || 1)));
      const dDate = new Date(oData?.dCreatedDate);
      const dCreatedDate = new Date(dDate.getTime() + Math.abs(dDate.getTimezoneOffset() * 60000));
      // console.log('dCreatedDate: ', dCreatedDate, dDate?.getTime(), Math.abs(dDate.getTimezoneOffset() * 60000));
      const oTransactionItem = {
        iBusinessId: iBusinessId,
        iWorkStationId: iWorkStationId,
        iEmployeeId: iEmployeeId,
        iLocationId: iLocationId,
        /* File */
        sBagNumber: oData?.sBagNumber,
        nPriceIncVat: oData?.nPriceIncVat,
        nTotalAmount:oData?.nTotalAmount,
        nVatRate: oData?.nVatRate,
        nMatchingCode: oData?.nMatchingCode ? parseFloat(oData?.nMatchingCode) : undefined,
        dCreatedDate: dCreatedDate,
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
        iCustomerId: oData?.iCustomerId,
        oCustomer: {
          _id:oData?.iCustomerId,
          oShippingAddress: {
              sStreet: street,
              sHouseNumber: HouseNumber,
              sHouseNumberSuffix: HouseNumberSuffix,
              sPostalCode: PostalCode,
              sCity: City,
              sCountryCode: CountryCode,
              
          }
          ,oInvoiceAddress: {
            sStreet: street,
            sHouseNumber: HouseNumber,
            sHouseNumberSuffix: HouseNumberSuffix,
            sPostalCode: PostalCode,
            sCity: City,
            sCountryCode: CountryCode,
            
        }
      },
        /* default */
        sProductName: sProductName,
        eStatus: "y",
        aImage: oData?.aImage,
        nMargin: 1,
        nQuantity: 1,
        oArticleGroupMetaData: {
          aProperty: [],
          sCategory: eType,
          sSubCategory: eType,
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
          eKind: eType,
          bDiscount: false,
          bPrepayment: false
        },
        nDiscount: 0,
        sDescription: "",
        sServicePartnerRemark: oData?.sServicePartnerRemark,
        eEstimatedDateAction: oData.eEstimatedDateAction,
        eActivityItemStatus: oData.eActivityItemStatus,
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

    console.log("aTransactionItem" , aTransactionItem);
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
        bImported: true,
        //oCustomer:aTransactionItem[0]?.oCustomer,
        //iCustomerId:aTransactionItem[0]?.iCustomerId
      },
      
      redeemedLoyaltyPoints: 0,
      transactionItems: aTransactionItem,
      sDefaultLanguage: localStorage.getItem('language') || 'nl',
      bImported: true,
      bImportRepairOrder: true
    };

    console.log("oBody" , oBody);
    // console.log('importRepairOrder: ', oBody);
    // console.log('referenceObj: ', referenceObj);
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
