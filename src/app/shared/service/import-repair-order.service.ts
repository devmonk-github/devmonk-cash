import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/shared/service/api.service';

@Injectable({
  providedIn: 'root'
})
export class ImportRepairOrderService {
  EmployeeId :any;
  AssigneeId:any;
  constructor(
    private translateService: TranslateService,
    private apiService: ApiService,
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
        sColumnHeader: "eActivityItemStatus",
        sDataBaseFieldName: "eActivityItemStatus",
        sName: "eActivityItemStatus",
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
      },
      {
        sColumnHeader: "Title",
        sDataBaseFieldName: "sProductName",
        sName: "sProductName",
      },
      {
        sColumnHeader: "extraComment",
        sDataBaseFieldName: "sDescription",
        sName: "sDescription",
      },
      {
        sColumnHeader: "Creator",
        sDataBaseFieldName: "iEmployeeId",
        sName: "iEmployeeId",
      },
      {
        sColumnHeader: "Repairer",
        sDataBaseFieldName: "iAssigneeId",
        sName: "iAssigneeId",
      }
      // ,
      // {
      //   sColumnHeader: "Estimated price",
      //   sDataBaseFieldName: "nRevenueAmount",
      //   sName: "nRevenueAmount",
      // }
      
    ]

    return aDefaultAttribute;
  }

  processTransactionItem(oData: any): any {
    try {
      let { parsedRepairOrderData, referenceObj, iBusinessId, iLocationId, iWorkStationId, iEmployeeId } = oData;
      /* mapping the file's field with database name */
      parsedRepairOrderData = parsedRepairOrderData.map((oRepairOrder: any) => {
        if (Object.keys(oRepairOrder).length) {
          for (let [key, value] of Object.entries(oRepairOrder)) {
            oRepairOrder[referenceObj[key]] = value;
           // delete oRepairOrder[key];
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
        const street = oData['oCustomer.oShippingAddress.sStreet'];
        const HouseNumber = oData['oCustomer.oShippingAddress.sHouseNumber'];
        const HouseNumberSuffix = oData['oCustomer.oShippingAddress.sHouseNumberSuffix'];
        const PostalCode = oData['oCustomer.oShippingAddress.sPostalCode'];
        const City = oData['oCustomer.oShippingAddress.sCity'];
        const CountryCode = oData['oCustomer.oShippingAddress.sCountryCode'];
       
        const imageArray = oData?.aImage.split(";");
  
        const em = oData?.iEmployeeId.split("-");
        const fname = em[0];
        const lname = em[1];
        
  
        const am = oData?.iAssigneeId.split("-");
        const afname = am[0];
        const alname = am[1];
        
  
        const oBody = {
          iBusinessId:iBusinessId,
          sFirstName:fname ,
          sLastName:lname
        }
        let url = '/api/v1/employee/get_detail';
        this.apiService.postNew('auth', url, oBody).subscribe((result: any) => {
          if (result?.data) {
            this.EmployeeId = result?.data?._id;
          }
         // console.log("this.EmployeeId" + this.EmployeeId);
          
        }, (error) => {
          console.log('error : ', error);
        });
  
        const oBody2 = {
          iBusinessId:iBusinessId,
          sFirstName:afname ,
          sLastName:alname
        }
        let url2 = '/api/v1/employee/get_detail';
        this.apiService.postNew('auth', url2, oBody2).subscribe((resultdata: any) => {
          if (resultdata?.data) {
            this.AssigneeId = resultdata?.data?._id;
          }
         // console.log("this.AssigneeId" + this.AssigneeId);
          
        }, (error) => {
          console.log('error : ', error);
        });
        
  
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
          iEmployeeId: this.EmployeeId,
          iAssigneeId:this.AssigneeId,
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
          
          sProductName: oData?.sProductName,
          eStatus: "y",
          aImage:imageArray,
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
          sDescription: oData?.sDescription,
          sServicePartnerRemark: oData?.sServicePartnerRemark,
          eEstimatedDateAction: oData?.eEstimatedDateAction,
          eActivityItemStatus: oData?.eActivityItemStatus,
          bDiscountOnPercentage: false,
          bImported: true,
          bImportRepairOrder: true
        }
        aTransactionItem.push(oTransactionItem);
      }
  
      return aTransactionItem;
    } catch (error) {
      console.log('error : ', error, error?.toString());
    }
  }

  mapTheImportRepairOrderBody(oData: any) {
    try {
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
        bImportRepairOrder: true
      };
      return { parsedRepairOrderData, oBody };
    } catch (error: any) {
      console.log('error 394: ', error, error?.toString());
      throw ('something went wrong 401');
    }
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