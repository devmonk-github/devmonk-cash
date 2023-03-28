import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { faArrowRightFromBracket, faBoxesStacked, faCalculator, faCoins, faCopy, faGifts, faMoneyBill, faRing, faRotateLeft, faScrewdriverWrench, faSearch, faSpinner, faTimes, faTimesCircle, faTrashAlt, faTruck, faUser } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { Observable, Subscription } from 'rxjs';
import * as _moment from 'moment';
import { AddExpensesComponent } from '../shared/components/add-expenses-dialog/add-expenses.component';
import { CardsComponent } from '../shared/components/cards-dialog/cards-dialog.component';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { CustomerDialogComponent } from '../shared/components/customer-dialog/customer-dialog.component';
import { MorePaymentsDialogComponent } from '../shared/components/more-payments-dialog/more-payments-dialog.component';
import { TerminalDialogComponent } from '../shared/components/terminal-dialog/terminal-dialog.component';
import { ToastService } from '../shared/components/toast';
import { TransactionActionDialogComponent } from '../shared/components/transaction-action-dialog/transaction-action-dialog.component';
import { TransactionItemsDetailsComponent } from '../shared/components/transaction-items-details/transaction-items-details.component';
import { TransactionsSearchComponent } from '../shared/components/transactions-search/transactions-search.component';
import { ApiService } from '../shared/service/api.service';
import { BarcodeService } from "../shared/service/barcode.service";
import { CreateArticleGroupService } from '../shared/service/create-article-groups.service';
import { CustomerStructureService } from '../shared/service/customer-structure.service';
import { DialogComponent, DialogService } from '../shared/service/dialog';
import { FiskalyService } from '../shared/service/fiskaly.service';
import { PaymentDistributionService } from '../shared/service/payment-distribution.service';
import { ReceiptService } from '../shared/service/receipt.service';
import { TaxService } from '../shared/service/tax.service';
import { TerminalService } from '../shared/service/terminal.service';
import { TillService } from '../shared/service/till.service';
import { MenuComponent } from '../shared/_layout/components/common';
import { SupplierWarningDialogComponent } from './dialogs/supplier-warning-dialog/supplier-warning-dialog.component';
import { HttpClient } from '@angular/common/http';
import { trigger, transition, style, animate } from '@angular/animations';
import { CustomerActivitiesDialogComponent } from '../shared/components/customer-activities-dialog/customer-activities.component';

@Component({
  selector: 'app-till',
  templateUrl: './till.component.html',
  styleUrls: ['./till.component.scss'],
  providers: [BarcodeService],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('0ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class TillComponent implements OnInit, AfterViewInit, OnDestroy {

  faScrewdriverWrench = faScrewdriverWrench;
  faTruck = faTruck;
  faBoxesStacked = faBoxesStacked;
  faGifts = faGifts;
  faUser = faUser;
  faTimes = faTimes;
  faTimesCircle = faTimesCircle;
  faTrashAlt = faTrashAlt;
  faRing = faRing;
  faCoins = faCoins;
  faCalculator = faCalculator;
  faMoneyBill = faMoneyBill;
  faArrowRightFromBracket = faArrowRightFromBracket;
  faSpinner = faSpinner;
  faSearch = faSearch;
  faCopy = faCopy;
  faRotateLeft = faRotateLeft;
  taxes: any = [];
  transactionItems: Array<any> = [];
  selectedTransaction: any = null;
  customer: any = {
    "_id": "62420be55777d556346a9484",
    "oPhone": {
      "bWhatsApp": true,
      "sCountryCode": "+91",
      "sMobile": "9970149807",
      "sLandLine": "9970149807",
      "sFax": ""
    },
    "oShippingAddress": {
      "sCountry": "Netherlands",
      "sCountryCode": "NL"
    },
    "oInvoiceAddress": {
      "sStreet": "middlewerg",
      "sHouseNumber": "9a",
      "sPostalCode": "442001",
      "sCity": "Asperen",
      "sCountry": "Netherlands",
      "sCountryCode": "NL"
    },
    "oPoints": {
      "spendable": 0,
      "history": []
    },
    "bIsEmailVerified": false,
    "bCounter": false,
    "sEmail": "Jolmerekeren02@gmail.com",
    "bNewsletter": true,
    "eStatus": "y",
    "aGroups": [
      "63d36741625ee32a585fe3a7",
      "63d524734b800b5573ed4f31",
      "63d5248d4b800b5573ed4f35",
      "63d524b24b800b5573ed4f39",
      "63d3c5702a2e4e4855e7614f"
    ],
    "iBusinessId": "6182a52f1949ab0a59ff4e7b",
    "sSalutation": "Mr",
    "sFirstName": "Jolmer",
    "sPrefix": "Van",
    "sLastName": "Ekeren2",
    "dDateOfBirth": "1999-12-31T23:00:00.000Z",
    "oIdentity": {
      "documentName": "Passport",
      "documentNumber": "324788353"
    },
    "sGender": "male",
    "sCompanyName": "Prisma note",
    "dCreatedDate": "2022-03-28T19:26:29.523Z",
    "nMatchingCode": 1673860214156,
    "sNote": "Jolmer test22!!",
    "nPaymentTermDays": 10,
    "sCocNumber": "",
    "sVatNumber": "5896325",
    "NAME": "Mr Jolmer Van Ekeren2",
    "SHIPPING_ADDRESS": "",
    "INVOICE_ADDRESS": "middlewerg 9a 442001 Asperen",
    "EMAIL": "Jolmerekeren02@gmail.com",
    "PHONE": "9970149807 / 9970149807",
    "loading": false,
    "activityData": [
      {
        "_id": "6421413b6789431ecc4346fa",
        "oCustomer": {
          "oInvoiceAddress": {
            "sStreet": "middlewerg",
            "sHouseNumber": "9a",
            "sPostalCode": "442001",
            "sCity": "Asperen",
            "sCountry": "Netherlands",
            "sCountryCode": "NL"
          },
          "oPhone": {
            "bWhatsApp": true,
            "sCountryCode": "+91",
            "sMobile": "9970149807",
            "sLandLine": "9970149807",
            "sFax": ""
          },
          "bCounter": false,
          "_id": "62420be55777d556346a9484",
          "sFirstName": "Jolmer",
          "sLastName": "Ekeren2",
          "sPrefix": "Van",
          "sGender": "male",
          "sVatNumber": "5896325",
          "sCocNumber": "",
          "sEmail": "Jolmerekeren02@gmail.com"
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A5989-270323-1239",
        "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
        "bImported": false,
        "aActivityItemMetaData": [],
        "iTransactionId": "6421413b6789431ecc4346f9",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2023-03-27T07:09:47.792Z",
        "dUpdatedDate": "2023-03-27T07:09:47.792Z",
        "__v": 0,
        "activityItems": [
          {
            "_id": "6421413c6789431ecc4346ff",
            "oType": {
              "bPrepayment": true,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "regular",
              "bDiscount": false
            },
            "oCustomer": {
              "oInvoiceAddress": {
                "sStreet": "middlewerg",
                "sHouseNumber": "9a",
                "sPostalCode": "442001",
                "sCity": "Asperen",
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              },
              "oPhone": {
                "bWhatsApp": true,
                "sCountryCode": "+91",
                "sMobile": "9970149807",
                "sLandLine": "9970149807",
                "sFax": ""
              },
              "bCounter": false,
              "_id": "62420be55777d556346a9484",
              "sFirstName": "Jolmer",
              "sLastName": "Ekeren2",
              "sPrefix": "Van",
              "sGender": "male",
              "sVatNumber": "5896325",
              "sCocNumber": "",
              "sEmail": "Jolmerekeren02@gmail.com"
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [],
            "nSavingsPoints": 1,
            "bImported": false,
            "sProductName": "PRODUCT600  PRODUCT616",
            "nPriceIncVat": 100,
            "nVatRate": 21,
            "nQuantity": 1,
            "sArticleNumber": "000159553/00017057616",
            "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupId": "641b1de6e7b8a875b845baf3",
            "iArticleGroupOriginalId": "641b1de6e7b8a875b845baf3",
            "oArticleGroupMetaData": {
              "aProperty": [
                {
                  "iPropertyId": "61160712ae3cbb7453177f98",
                  "sPropertyName": "CATEGORY",
                  "sPropertyOptionName": "WATCH",
                  "iPropertyOptionId": "61f01aa45fc7504de957b258",
                  "sCode": "WA"
                },
                {
                  "iPropertyId": "6261a5f76d3ec230f0886eee",
                  "sPropertyName": "WATCH_CASE_MATERIAL",
                  "sPropertyOptionName": "TITANIUM",
                  "iPropertyOptionId": "62e8bd09c2910b2073515bad",
                  "sCode": "TI"
                }
              ],
              "sCategory": "",
              "sSubCategory": "",
              "oName": {
                "nl": "PRODUCT600",
                "fr": "PRODUCT600",
                "en": "PRODUCT600",
                "es": "PRODUCT600",
                "de": "PRODUCT600",
                "sv": "PRODUCT600",
                "da": "PRODUCT600",
                "ar": "PRODUCT600",
                "is": "PRODUCT600",
                "ms": "PRODUCT600"
              }
            },
            "nRefundAmount": 0,
            "iBusinessProductId": "63c7d879c4e5ad46a9f1e463",
            "iWorkstationId": "62bee335e169f86f44ad0591",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b6d840ed1002890334456",
            "iSupplierId": "6275661d5732a79bf0e3f449",
            "nRedeemedLoyaltyPoints": 5,
            "sUniqueIdentifier": "b49e926d-3142-4f8a-8e24-05daac59b50c",
            "nRevenueAmount": 15,
            "sDescription": "",
            "iTransactionId": "6421413b6789431ecc4346f9",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "6421413b6789431ecc4346fa",
            "aLog": [],
            "nTotalAmount": 100,
            "nPaidAmount": 15,
            "sNumber": "AI8133-270323-1239",
            "iTransactionItemId": "6421413c6789431ecc4346fe",
            "nCostOfRevenue": 12.396694214876034,
            "nProfitOfRevenue": 0,
            "dCreatedDate": "2023-03-27T07:09:48.337Z",
            "dUpdatedDate": "2023-03-27T07:09:48.337Z",
            "__v": 0
          },
          {
            "_id": "6421413c6789431ecc434702",
            "oType": {
              "bPrepayment": true,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "regular",
              "bDiscount": false
            },
            "oCustomer": {
              "oInvoiceAddress": {
                "sStreet": "middlewerg",
                "sHouseNumber": "9a",
                "sPostalCode": "442001",
                "sCity": "Asperen",
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              },
              "oPhone": {
                "bWhatsApp": true,
                "sCountryCode": "+91",
                "sMobile": "9970149807",
                "sLandLine": "9970149807",
                "sFax": ""
              },
              "bCounter": false,
              "_id": "62420be55777d556346a9484",
              "sFirstName": "Jolmer",
              "sLastName": "Ekeren2",
              "sPrefix": "Van",
              "sGender": "male",
              "sVatNumber": "5896325",
              "sCocNumber": "",
              "sEmail": "Jolmerekeren02@gmail.com"
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [],
            "nSavingsPoints": 1,
            "bImported": false,
            "sProductName": "PRODUCT600  PRODUCT616",
            "nPriceIncVat": 100,
            "nVatRate": 21,
            "nQuantity": 1,
            "sArticleNumber": "000159553/00017057616",
            "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupId": "641b1de6e7b8a875b845baf3",
            "iArticleGroupOriginalId": "641b1de6e7b8a875b845baf3",
            "oArticleGroupMetaData": {
              "aProperty": [
                {
                  "iPropertyId": "61160712ae3cbb7453177f98",
                  "sPropertyName": "CATEGORY",
                  "sPropertyOptionName": "WATCH",
                  "iPropertyOptionId": "61f01aa45fc7504de957b258",
                  "sCode": "WA"
                },
                {
                  "iPropertyId": "6261a5f76d3ec230f0886eee",
                  "sPropertyName": "WATCH_CASE_MATERIAL",
                  "sPropertyOptionName": "TITANIUM",
                  "iPropertyOptionId": "62e8bd09c2910b2073515bad",
                  "sCode": "TI"
                }
              ],
              "sCategory": "",
              "sSubCategory": "",
              "oName": {
                "nl": "PRODUCT600",
                "fr": "PRODUCT600",
                "en": "PRODUCT600",
                "es": "PRODUCT600",
                "de": "PRODUCT600",
                "sv": "PRODUCT600",
                "da": "PRODUCT600",
                "ar": "PRODUCT600",
                "is": "PRODUCT600",
                "ms": "PRODUCT600"
              }
            },
            "nRefundAmount": 0,
            "iBusinessProductId": "63c7d879c4e5ad46a9f1e463",
            "iWorkstationId": "62bee335e169f86f44ad0591",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b6d840ed1002890334456",
            "iSupplierId": "6275661d5732a79bf0e3f449",
            "nRedeemedLoyaltyPoints": 5,
            "sUniqueIdentifier": "808db8ac-0bd5-4937-b815-12ad8787abd1",
            "nRevenueAmount": 15,
            "sDescription": "",
            "iTransactionId": "6421413b6789431ecc4346f9",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "6421413b6789431ecc4346fa",
            "aLog": [],
            "nTotalAmount": 100,
            "nPaidAmount": 15,
            "sNumber": "AI8134-270323-1239",
            "iTransactionItemId": "6421413c6789431ecc434701",
            "nCostOfRevenue": 12.396694214876034,
            "nProfitOfRevenue": 0,
            "dCreatedDate": "2023-03-27T07:09:48.338Z",
            "dUpdatedDate": "2023-03-27T07:09:48.338Z",
            "__v": 0
          },
          {
            "_id": "6421413d6789431ecc43470e",
            "oType": {
              "bPrepayment": true,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "loyalty-points-discount",
              "bDiscount": false
            },
            "oCustomer": {
              "oInvoiceAddress": {
                "sStreet": "middlewerg",
                "sHouseNumber": "9a",
                "sPostalCode": "442001",
                "sCity": "Asperen",
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              },
              "oPhone": {
                "bWhatsApp": true,
                "sCountryCode": "+91",
                "sMobile": "9970149807",
                "sLandLine": "9970149807",
                "sFax": ""
              },
              "bCounter": false,
              "_id": "62420be55777d556346a9484",
              "sFirstName": "Jolmer",
              "sLastName": "Ekeren2",
              "sPrefix": "Van",
              "sGender": "male",
              "sVatNumber": "5896325",
              "sCocNumber": "",
              "sEmail": "Jolmerekeren02@gmail.com"
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [],
            "nSavingsPoints": 0,
            "bImported": false,
            "sProductName": "PRODUCT600  PRODUCT616",
            "nPriceIncVat": 100,
            "nVatRate": 21,
            "nQuantity": 1,
            "sArticleNumber": "000159553/00017057616",
            "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupOriginalId": "641b1de6e7b8a875b845baf3",
            "oArticleGroupMetaData": {
              "oName": {
                "nl": "ARTICKELGROUP1A",
                "fr": "ARTICKELGROUP1A",
                "en": "ARTICKELGROUP1A",
                "es": "ARTICKELGROUP1A",
                "de": "ARTICKELGROUP1A",
                "sv": "ARTICKELGROUP1A",
                "da": "ARTICKELGROUP1A",
                "ar": "ARTICKELGROUP1A",
                "is": "ARTICKELGROUP1A",
                "ms": "ARTICKELGROUP1A"
              },
              "aProperty": [
                {
                  "iPropertyId": "61160712ae3cbb7453177f98",
                  "sPropertyName": "CATEGORY",
                  "sPropertyOptionName": "WATCH",
                  "iPropertyOptionId": "61f01aa45fc7504de957b258",
                  "sCode": "WA"
                },
                {
                  "iPropertyId": "6261a5f76d3ec230f0886eee",
                  "sPropertyName": "WATCH_CASE_MATERIAL",
                  "sPropertyOptionName": "TITANIUM",
                  "iPropertyOptionId": "62e8bd09c2910b2073515bad",
                  "sCode": "TI"
                }
              ],
              "sCategory": "",
              "sSubCategory": ""
            },
            "nRefundAmount": 0,
            "iBusinessProductId": "63c7d879c4e5ad46a9f1e463",
            "iWorkstationId": "62bee335e169f86f44ad0591",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b6d840ed1002890334456",
            "iSupplierId": "6275661d5732a79bf0e3f449",
            "nRedeemedLoyaltyPoints": 5,
            "sUniqueIdentifier": "b49e926d-3142-4f8a-8e24-05daac59b50c",
            "nRevenueAmount": -5,
            "sDescription": "",
            "iTransactionId": "6421413b6789431ecc4346f9",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "6421413b6789431ecc4346fa",
            "aLog": [],
            "nTotalAmount": 100,
            "nPaidAmount": -5,
            "sNumber": "AI8136-270323-1239",
            "iTransactionItemId": "6421413d6789431ecc43470d",
            "nCostOfRevenue": 0,
            "nProfitOfRevenue": 0,
            "dCreatedDate": "2023-03-27T07:09:49.477Z",
            "dUpdatedDate": "2023-03-27T07:14:32.042Z",
            "__v": 0,
            "iArticleGroupId": null
          },
          {
            "_id": "6421413d6789431ecc434711",
            "oType": {
              "bPrepayment": true,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "loyalty-points-discount",
              "bDiscount": false
            },
            "oCustomer": {
              "oInvoiceAddress": {
                "sStreet": "middlewerg",
                "sHouseNumber": "9a",
                "sPostalCode": "442001",
                "sCity": "Asperen",
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              },
              "oPhone": {
                "bWhatsApp": true,
                "sCountryCode": "+91",
                "sMobile": "9970149807",
                "sLandLine": "9970149807",
                "sFax": ""
              },
              "bCounter": false,
              "_id": "62420be55777d556346a9484",
              "sFirstName": "Jolmer",
              "sLastName": "Ekeren2",
              "sPrefix": "Van",
              "sGender": "male",
              "sVatNumber": "5896325",
              "sCocNumber": "",
              "sEmail": "Jolmerekeren02@gmail.com"
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [],
            "nSavingsPoints": 0,
            "bImported": false,
            "sProductName": "PRODUCT600  PRODUCT616",
            "nPriceIncVat": 100,
            "nVatRate": 21,
            "nQuantity": 1,
            "sArticleNumber": "000159553/00017057616",
            "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupOriginalId": "641b1de6e7b8a875b845baf3",
            "oArticleGroupMetaData": {
              "oName": {
                "nl": "ARTICKELGROUP1A",
                "fr": "ARTICKELGROUP1A",
                "en": "ARTICKELGROUP1A",
                "es": "ARTICKELGROUP1A",
                "de": "ARTICKELGROUP1A",
                "sv": "ARTICKELGROUP1A",
                "da": "ARTICKELGROUP1A",
                "ar": "ARTICKELGROUP1A",
                "is": "ARTICKELGROUP1A",
                "ms": "ARTICKELGROUP1A"
              },
              "aProperty": [
                {
                  "iPropertyId": "61160712ae3cbb7453177f98",
                  "sPropertyName": "CATEGORY",
                  "sPropertyOptionName": "WATCH",
                  "iPropertyOptionId": "61f01aa45fc7504de957b258",
                  "sCode": "WA"
                },
                {
                  "iPropertyId": "6261a5f76d3ec230f0886eee",
                  "sPropertyName": "WATCH_CASE_MATERIAL",
                  "sPropertyOptionName": "TITANIUM",
                  "iPropertyOptionId": "62e8bd09c2910b2073515bad",
                  "sCode": "TI"
                }
              ],
              "sCategory": "",
              "sSubCategory": ""
            },
            "nRefundAmount": 0,
            "iBusinessProductId": "63c7d879c4e5ad46a9f1e463",
            "iWorkstationId": "62bee335e169f86f44ad0591",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b6d840ed1002890334456",
            "iSupplierId": "6275661d5732a79bf0e3f449",
            "nRedeemedLoyaltyPoints": 5,
            "sUniqueIdentifier": "808db8ac-0bd5-4937-b815-12ad8787abd1",
            "nRevenueAmount": -5,
            "sDescription": "",
            "iTransactionId": "6421413b6789431ecc4346f9",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "6421413b6789431ecc4346fa",
            "aLog": [],
            "nTotalAmount": 100,
            "nPaidAmount": -5,
            "sNumber": "AI8137-270323-1239",
            "iTransactionItemId": "6421413d6789431ecc434710",
            "nCostOfRevenue": 0,
            "nProfitOfRevenue": 0,
            "dCreatedDate": "2023-03-27T07:09:49.477Z",
            "dUpdatedDate": "2023-03-27T07:14:32.042Z",
            "__v": 0,
            "iArticleGroupId": null
          }
        ]
      },
      {
        "_id": "6421410caedfbf5e00fdb0af",
        "oCustomer": {
          "oInvoiceAddress": {
            "sStreet": "middlewerg",
            "sHouseNumber": "9a",
            "sPostalCode": "442001",
            "sCity": "Asperen",
            "sCountry": "Netherlands",
            "sCountryCode": "NL"
          },
          "oPhone": {
            "bWhatsApp": true,
            "sCountryCode": "+91",
            "sMobile": "9970149807",
            "sLandLine": "9970149807",
            "sFax": ""
          },
          "bCounter": false,
          "_id": "62420be55777d556346a9484",
          "sFirstName": "Jolmer",
          "sLastName": "Ekeren2",
          "sPrefix": "Van",
          "sGender": "male",
          "sVatNumber": "5896325",
          "sCocNumber": "",
          "sEmail": "Jolmerekeren02@gmail.com"
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A5988-270323-1238",
        "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
        "bImported": false,
        "aActivityItemMetaData": [],
        "iTransactionId": "6421410caedfbf5e00fdb0ae",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2023-03-27T07:09:00.385Z",
        "dUpdatedDate": "2023-03-27T07:09:00.385Z",
        "__v": 0,
        "activityItems": [
          {
            "_id": "6421410caedfbf5e00fdb0b4",
            "oType": {
              "bPrepayment": true,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "regular",
              "bDiscount": false
            },
            "oCustomer": {
              "oInvoiceAddress": {
                "sStreet": "middlewerg",
                "sHouseNumber": "9a",
                "sPostalCode": "442001",
                "sCity": "Asperen",
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              },
              "oPhone": {
                "bWhatsApp": true,
                "sCountryCode": "+91",
                "sMobile": "9970149807",
                "sLandLine": "9970149807",
                "sFax": ""
              },
              "bCounter": false,
              "_id": "62420be55777d556346a9484",
              "sFirstName": "Jolmer",
              "sLastName": "Ekeren2",
              "sPrefix": "Van",
              "sGender": "male",
              "sVatNumber": "5896325",
              "sCocNumber": "",
              "sEmail": "Jolmerekeren02@gmail.com"
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [],
            "nSavingsPoints": 1,
            "bImported": false,
            "sProductName": "PRODUCT600  PRODUCT616",
            "nPriceIncVat": 100,
            "nVatRate": 21,
            "nQuantity": 1,
            "sArticleNumber": "000159553/00017057616",
            "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupId": "641b1de6e7b8a875b845baf3",
            "iArticleGroupOriginalId": "641b1de6e7b8a875b845baf3",
            "oArticleGroupMetaData": {
              "aProperty": [
                {
                  "iPropertyId": "61160712ae3cbb7453177f98",
                  "sPropertyName": "CATEGORY",
                  "sPropertyOptionName": "WATCH",
                  "iPropertyOptionId": "61f01aa45fc7504de957b258",
                  "sCode": "WA"
                },
                {
                  "iPropertyId": "6261a5f76d3ec230f0886eee",
                  "sPropertyName": "WATCH_CASE_MATERIAL",
                  "sPropertyOptionName": "TITANIUM",
                  "iPropertyOptionId": "62e8bd09c2910b2073515bad",
                  "sCode": "TI"
                }
              ],
              "sCategory": "",
              "sSubCategory": "",
              "oName": {
                "nl": "PRODUCT600",
                "fr": "PRODUCT600",
                "en": "PRODUCT600",
                "es": "PRODUCT600",
                "de": "PRODUCT600",
                "sv": "PRODUCT600",
                "da": "PRODUCT600",
                "ar": "PRODUCT600",
                "is": "PRODUCT600",
                "ms": "PRODUCT600"
              }
            },
            "nRefundAmount": 0,
            "iBusinessProductId": "63c7d879c4e5ad46a9f1e463",
            "iWorkstationId": "62bee335e169f86f44ad0591",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b6d840ed1002890334456",
            "iSupplierId": "6275661d5732a79bf0e3f449",
            "nRedeemedLoyaltyPoints": 5,
            "sUniqueIdentifier": "b49e926d-3142-4f8a-8e24-05daac59b50c",
            "nRevenueAmount": 15,
            "sDescription": "",
            "iTransactionId": "6421410caedfbf5e00fdb0ae",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "6421410caedfbf5e00fdb0af",
            "aLog": [],
            "nTotalAmount": 100,
            "nPaidAmount": 15,
            "sNumber": "AI8128-270323-1238",
            "iTransactionItemId": "6421410caedfbf5e00fdb0b3",
            "nCostOfRevenue": 12.396694214876034,
            "nProfitOfRevenue": 0,
            "dCreatedDate": "2023-03-27T07:09:00.923Z",
            "dUpdatedDate": "2023-03-27T07:09:00.923Z",
            "__v": 0
          },
          {
            "_id": "6421410caedfbf5e00fdb0b7",
            "oType": {
              "bPrepayment": true,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "regular",
              "bDiscount": false
            },
            "oCustomer": {
              "oInvoiceAddress": {
                "sStreet": "middlewerg",
                "sHouseNumber": "9a",
                "sPostalCode": "442001",
                "sCity": "Asperen",
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              },
              "oPhone": {
                "bWhatsApp": true,
                "sCountryCode": "+91",
                "sMobile": "9970149807",
                "sLandLine": "9970149807",
                "sFax": ""
              },
              "bCounter": false,
              "_id": "62420be55777d556346a9484",
              "sFirstName": "Jolmer",
              "sLastName": "Ekeren2",
              "sPrefix": "Van",
              "sGender": "male",
              "sVatNumber": "5896325",
              "sCocNumber": "",
              "sEmail": "Jolmerekeren02@gmail.com"
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [],
            "nSavingsPoints": 1,
            "bImported": false,
            "sProductName": "PRODUCT600  PRODUCT616",
            "nPriceIncVat": 100,
            "nVatRate": 21,
            "nQuantity": 1,
            "sArticleNumber": "000159553/00017057616",
            "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupId": "641b1de6e7b8a875b845baf3",
            "iArticleGroupOriginalId": "641b1de6e7b8a875b845baf3",
            "oArticleGroupMetaData": {
              "aProperty": [
                {
                  "iPropertyId": "61160712ae3cbb7453177f98",
                  "sPropertyName": "CATEGORY",
                  "sPropertyOptionName": "WATCH",
                  "iPropertyOptionId": "61f01aa45fc7504de957b258",
                  "sCode": "WA"
                },
                {
                  "iPropertyId": "6261a5f76d3ec230f0886eee",
                  "sPropertyName": "WATCH_CASE_MATERIAL",
                  "sPropertyOptionName": "TITANIUM",
                  "iPropertyOptionId": "62e8bd09c2910b2073515bad",
                  "sCode": "TI"
                }
              ],
              "sCategory": "",
              "sSubCategory": "",
              "oName": {
                "nl": "PRODUCT600",
                "fr": "PRODUCT600",
                "en": "PRODUCT600",
                "es": "PRODUCT600",
                "de": "PRODUCT600",
                "sv": "PRODUCT600",
                "da": "PRODUCT600",
                "ar": "PRODUCT600",
                "is": "PRODUCT600",
                "ms": "PRODUCT600"
              }
            },
            "nRefundAmount": 0,
            "iBusinessProductId": "63c7d879c4e5ad46a9f1e463",
            "iWorkstationId": "62bee335e169f86f44ad0591",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b6d840ed1002890334456",
            "iSupplierId": "6275661d5732a79bf0e3f449",
            "nRedeemedLoyaltyPoints": 5,
            "sUniqueIdentifier": "808db8ac-0bd5-4937-b815-12ad8787abd1",
            "nRevenueAmount": 15,
            "sDescription": "",
            "iTransactionId": "6421410caedfbf5e00fdb0ae",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "6421410caedfbf5e00fdb0af",
            "aLog": [],
            "nTotalAmount": 100,
            "nPaidAmount": 15,
            "sNumber": "AI8129-270323-1238",
            "iTransactionItemId": "6421410caedfbf5e00fdb0b6",
            "nCostOfRevenue": 12.396694214876034,
            "nProfitOfRevenue": 0,
            "dCreatedDate": "2023-03-27T07:09:00.923Z",
            "dUpdatedDate": "2023-03-27T07:09:00.923Z",
            "__v": 0
          },
          {
            "_id": "6421410eaedfbf5e00fdb0c3",
            "oType": {
              "bPrepayment": true,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "loyalty-points-discount",
              "bDiscount": false
            },
            "oCustomer": {
              "oInvoiceAddress": {
                "sStreet": "middlewerg",
                "sHouseNumber": "9a",
                "sPostalCode": "442001",
                "sCity": "Asperen",
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              },
              "oPhone": {
                "bWhatsApp": true,
                "sCountryCode": "+91",
                "sMobile": "9970149807",
                "sLandLine": "9970149807",
                "sFax": ""
              },
              "bCounter": false,
              "_id": "62420be55777d556346a9484",
              "sFirstName": "Jolmer",
              "sLastName": "Ekeren2",
              "sPrefix": "Van",
              "sGender": "male",
              "sVatNumber": "5896325",
              "sCocNumber": "",
              "sEmail": "Jolmerekeren02@gmail.com"
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [],
            "nSavingsPoints": 0,
            "bImported": false,
            "sProductName": "PRODUCT600  PRODUCT616",
            "nPriceIncVat": 100,
            "nVatRate": 21,
            "nQuantity": 1,
            "sArticleNumber": "000159553/00017057616",
            "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupOriginalId": "641b1de6e7b8a875b845baf3",
            "oArticleGroupMetaData": {
              "oName": {
                "nl": "ARTICKELGROUP1A",
                "fr": "ARTICKELGROUP1A",
                "en": "ARTICKELGROUP1A",
                "es": "ARTICKELGROUP1A",
                "de": "ARTICKELGROUP1A",
                "sv": "ARTICKELGROUP1A",
                "da": "ARTICKELGROUP1A",
                "ar": "ARTICKELGROUP1A",
                "is": "ARTICKELGROUP1A",
                "ms": "ARTICKELGROUP1A"
              },
              "aProperty": [
                {
                  "iPropertyId": "61160712ae3cbb7453177f98",
                  "sPropertyName": "CATEGORY",
                  "sPropertyOptionName": "WATCH",
                  "iPropertyOptionId": "61f01aa45fc7504de957b258",
                  "sCode": "WA"
                },
                {
                  "iPropertyId": "6261a5f76d3ec230f0886eee",
                  "sPropertyName": "WATCH_CASE_MATERIAL",
                  "sPropertyOptionName": "TITANIUM",
                  "iPropertyOptionId": "62e8bd09c2910b2073515bad",
                  "sCode": "TI"
                }
              ],
              "sCategory": "",
              "sSubCategory": ""
            },
            "nRefundAmount": 0,
            "iBusinessProductId": "63c7d879c4e5ad46a9f1e463",
            "iWorkstationId": "62bee335e169f86f44ad0591",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b6d840ed1002890334456",
            "iSupplierId": "6275661d5732a79bf0e3f449",
            "nRedeemedLoyaltyPoints": 5,
            "sUniqueIdentifier": "b49e926d-3142-4f8a-8e24-05daac59b50c",
            "nRevenueAmount": -5,
            "sDescription": "",
            "iTransactionId": "6421410caedfbf5e00fdb0ae",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "6421410caedfbf5e00fdb0af",
            "aLog": [],
            "nTotalAmount": 100,
            "nPaidAmount": -5,
            "sNumber": "AI8131-270323-1238",
            "iTransactionItemId": "6421410eaedfbf5e00fdb0c2",
            "nCostOfRevenue": 0,
            "nProfitOfRevenue": 0,
            "dCreatedDate": "2023-03-27T07:09:02.269Z",
            "dUpdatedDate": "2023-03-27T07:14:32.042Z",
            "__v": 0,
            "iArticleGroupId": null
          },
          {
            "_id": "6421410eaedfbf5e00fdb0c6",
            "oType": {
              "bPrepayment": true,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "loyalty-points-discount",
              "bDiscount": false
            },
            "oCustomer": {
              "oInvoiceAddress": {
                "sStreet": "middlewerg",
                "sHouseNumber": "9a",
                "sPostalCode": "442001",
                "sCity": "Asperen",
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              },
              "oPhone": {
                "bWhatsApp": true,
                "sCountryCode": "+91",
                "sMobile": "9970149807",
                "sLandLine": "9970149807",
                "sFax": ""
              },
              "bCounter": false,
              "_id": "62420be55777d556346a9484",
              "sFirstName": "Jolmer",
              "sLastName": "Ekeren2",
              "sPrefix": "Van",
              "sGender": "male",
              "sVatNumber": "5896325",
              "sCocNumber": "",
              "sEmail": "Jolmerekeren02@gmail.com"
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [],
            "nSavingsPoints": 0,
            "bImported": false,
            "sProductName": "PRODUCT600  PRODUCT616",
            "nPriceIncVat": 100,
            "nVatRate": 21,
            "nQuantity": 1,
            "sArticleNumber": "000159553/00017057616",
            "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupOriginalId": "641b1de6e7b8a875b845baf3",
            "oArticleGroupMetaData": {
              "oName": {
                "nl": "ARTICKELGROUP1A",
                "fr": "ARTICKELGROUP1A",
                "en": "ARTICKELGROUP1A",
                "es": "ARTICKELGROUP1A",
                "de": "ARTICKELGROUP1A",
                "sv": "ARTICKELGROUP1A",
                "da": "ARTICKELGROUP1A",
                "ar": "ARTICKELGROUP1A",
                "is": "ARTICKELGROUP1A",
                "ms": "ARTICKELGROUP1A"
              },
              "aProperty": [
                {
                  "iPropertyId": "61160712ae3cbb7453177f98",
                  "sPropertyName": "CATEGORY",
                  "sPropertyOptionName": "WATCH",
                  "iPropertyOptionId": "61f01aa45fc7504de957b258",
                  "sCode": "WA"
                },
                {
                  "iPropertyId": "6261a5f76d3ec230f0886eee",
                  "sPropertyName": "WATCH_CASE_MATERIAL",
                  "sPropertyOptionName": "TITANIUM",
                  "iPropertyOptionId": "62e8bd09c2910b2073515bad",
                  "sCode": "TI"
                }
              ],
              "sCategory": "",
              "sSubCategory": ""
            },
            "nRefundAmount": 0,
            "iBusinessProductId": "63c7d879c4e5ad46a9f1e463",
            "iWorkstationId": "62bee335e169f86f44ad0591",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b6d840ed1002890334456",
            "iSupplierId": "6275661d5732a79bf0e3f449",
            "nRedeemedLoyaltyPoints": 5,
            "sUniqueIdentifier": "808db8ac-0bd5-4937-b815-12ad8787abd1",
            "nRevenueAmount": -5,
            "sDescription": "",
            "iTransactionId": "6421410caedfbf5e00fdb0ae",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "6421410caedfbf5e00fdb0af",
            "aLog": [],
            "nTotalAmount": 100,
            "nPaidAmount": -5,
            "sNumber": "AI8132-270323-1238",
            "iTransactionItemId": "6421410eaedfbf5e00fdb0c5",
            "nCostOfRevenue": 0,
            "nProfitOfRevenue": 0,
            "dCreatedDate": "2023-03-27T07:09:02.270Z",
            "dUpdatedDate": "2023-03-27T07:14:32.042Z",
            "__v": 0,
            "iArticleGroupId": null
          }
        ]
      },
      {
        "_id": "64213fed73249807484b4ab5",
        "oCustomer": {
          "oInvoiceAddress": {
            "sStreet": "middlewerg",
            "sHouseNumber": "9a",
            "sPostalCode": "442001",
            "sCity": "Asperen",
            "sCountry": "Netherlands",
            "sCountryCode": "NL"
          },
          "oPhone": {
            "bWhatsApp": true,
            "sCountryCode": "+91",
            "sMobile": "9970149807",
            "sLandLine": "9970149807",
            "sFax": ""
          },
          "bCounter": false,
          "_id": "62420be55777d556346a9484",
          "sFirstName": "Jolmer",
          "sLastName": "Ekeren2",
          "sPrefix": "Van",
          "sGender": "male",
          "sVatNumber": "5896325",
          "sCocNumber": "",
          "sEmail": "Jolmerekeren02@gmail.com"
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A5987-270323-1234",
        "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
        "bImported": false,
        "aActivityItemMetaData": [],
        "iTransactionId": "64213fed73249807484b4ab4",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2023-03-27T07:04:13.316Z",
        "dUpdatedDate": "2023-03-27T07:04:13.316Z",
        "__v": 0,
        "activityItems": [
          {
            "_id": "64213fed73249807484b4aba",
            "oType": {
              "bPrepayment": true,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "regular",
              "bDiscount": false
            },
            "oCustomer": {
              "oInvoiceAddress": {
                "sStreet": "middlewerg",
                "sHouseNumber": "9a",
                "sPostalCode": "442001",
                "sCity": "Asperen",
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              },
              "oPhone": {
                "bWhatsApp": true,
                "sCountryCode": "+91",
                "sMobile": "9970149807",
                "sLandLine": "9970149807",
                "sFax": ""
              },
              "bCounter": false,
              "_id": "62420be55777d556346a9484",
              "sFirstName": "Jolmer",
              "sLastName": "Ekeren2",
              "sPrefix": "Van",
              "sGender": "male",
              "sVatNumber": "5896325",
              "sCocNumber": "",
              "sEmail": "Jolmerekeren02@gmail.com"
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [],
            "nSavingsPoints": 1,
            "bImported": false,
            "sProductName": "PRODUCT600  PRODUCT616",
            "nPriceIncVat": 100,
            "nVatRate": 21,
            "nQuantity": 1,
            "sArticleNumber": "000159553/00017057616",
            "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupId": "641b1de6e7b8a875b845baf3",
            "iArticleGroupOriginalId": "641b1de6e7b8a875b845baf3",
            "oArticleGroupMetaData": {
              "aProperty": [
                {
                  "iPropertyId": "61160712ae3cbb7453177f98",
                  "sPropertyName": "CATEGORY",
                  "sPropertyOptionName": "WATCH",
                  "iPropertyOptionId": "61f01aa45fc7504de957b258",
                  "sCode": "WA"
                },
                {
                  "iPropertyId": "6261a5f76d3ec230f0886eee",
                  "sPropertyName": "WATCH_CASE_MATERIAL",
                  "sPropertyOptionName": "TITANIUM",
                  "iPropertyOptionId": "62e8bd09c2910b2073515bad",
                  "sCode": "TI"
                }
              ],
              "sCategory": "",
              "sSubCategory": "",
              "oName": {
                "nl": "PRODUCT600",
                "fr": "PRODUCT600",
                "en": "PRODUCT600",
                "es": "PRODUCT600",
                "de": "PRODUCT600",
                "sv": "PRODUCT600",
                "da": "PRODUCT600",
                "ar": "PRODUCT600",
                "is": "PRODUCT600",
                "ms": "PRODUCT600"
              }
            },
            "nRefundAmount": 0,
            "iBusinessProductId": "63c7d879c4e5ad46a9f1e463",
            "iWorkstationId": "62bee335e169f86f44ad0591",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b6d840ed1002890334456",
            "iSupplierId": "6275661d5732a79bf0e3f449",
            "nRedeemedLoyaltyPoints": 5,
            "sUniqueIdentifier": "b49e926d-3142-4f8a-8e24-05daac59b50c",
            "nRevenueAmount": 15,
            "sDescription": "",
            "iTransactionId": "64213fed73249807484b4ab4",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "64213fed73249807484b4ab5",
            "aLog": [],
            "nTotalAmount": 100,
            "nPaidAmount": 15,
            "sNumber": "AI8123-270323-1234",
            "iTransactionItemId": "64213fed73249807484b4ab9",
            "nCostOfRevenue": 12.396694214876034,
            "nProfitOfRevenue": 0,
            "dCreatedDate": "2023-03-27T07:04:13.842Z",
            "dUpdatedDate": "2023-03-27T07:04:13.842Z",
            "__v": 0
          },
          {
            "_id": "64213fed73249807484b4abd",
            "oType": {
              "bPrepayment": true,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "regular",
              "bDiscount": false
            },
            "oCustomer": {
              "oInvoiceAddress": {
                "sStreet": "middlewerg",
                "sHouseNumber": "9a",
                "sPostalCode": "442001",
                "sCity": "Asperen",
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              },
              "oPhone": {
                "bWhatsApp": true,
                "sCountryCode": "+91",
                "sMobile": "9970149807",
                "sLandLine": "9970149807",
                "sFax": ""
              },
              "bCounter": false,
              "_id": "62420be55777d556346a9484",
              "sFirstName": "Jolmer",
              "sLastName": "Ekeren2",
              "sPrefix": "Van",
              "sGender": "male",
              "sVatNumber": "5896325",
              "sCocNumber": "",
              "sEmail": "Jolmerekeren02@gmail.com"
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [],
            "nSavingsPoints": 1,
            "bImported": false,
            "sProductName": "PRODUCT600  PRODUCT616",
            "nPriceIncVat": 100,
            "nVatRate": 21,
            "nQuantity": 1,
            "sArticleNumber": "000159553/00017057616",
            "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupId": "641b1de6e7b8a875b845baf3",
            "iArticleGroupOriginalId": "641b1de6e7b8a875b845baf3",
            "oArticleGroupMetaData": {
              "aProperty": [
                {
                  "iPropertyId": "61160712ae3cbb7453177f98",
                  "sPropertyName": "CATEGORY",
                  "sPropertyOptionName": "WATCH",
                  "iPropertyOptionId": "61f01aa45fc7504de957b258",
                  "sCode": "WA"
                },
                {
                  "iPropertyId": "6261a5f76d3ec230f0886eee",
                  "sPropertyName": "WATCH_CASE_MATERIAL",
                  "sPropertyOptionName": "TITANIUM",
                  "iPropertyOptionId": "62e8bd09c2910b2073515bad",
                  "sCode": "TI"
                }
              ],
              "sCategory": "",
              "sSubCategory": "",
              "oName": {
                "nl": "PRODUCT600",
                "fr": "PRODUCT600",
                "en": "PRODUCT600",
                "es": "PRODUCT600",
                "de": "PRODUCT600",
                "sv": "PRODUCT600",
                "da": "PRODUCT600",
                "ar": "PRODUCT600",
                "is": "PRODUCT600",
                "ms": "PRODUCT600"
              }
            },
            "nRefundAmount": 0,
            "iBusinessProductId": "63c7d879c4e5ad46a9f1e463",
            "iWorkstationId": "62bee335e169f86f44ad0591",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b6d840ed1002890334456",
            "iSupplierId": "6275661d5732a79bf0e3f449",
            "nRedeemedLoyaltyPoints": 5,
            "sUniqueIdentifier": "808db8ac-0bd5-4937-b815-12ad8787abd1",
            "nRevenueAmount": 15,
            "sDescription": "",
            "iTransactionId": "64213fed73249807484b4ab4",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "64213fed73249807484b4ab5",
            "aLog": [],
            "nTotalAmount": 100,
            "nPaidAmount": 15,
            "sNumber": "AI8124-270323-1234",
            "iTransactionItemId": "64213fed73249807484b4abc",
            "nCostOfRevenue": 12.396694214876034,
            "nProfitOfRevenue": 0,
            "dCreatedDate": "2023-03-27T07:04:13.843Z",
            "dUpdatedDate": "2023-03-27T07:04:13.843Z",
            "__v": 0
          },
          {
            "_id": "64213fef73249807484b4ac9",
            "oType": {
              "bPrepayment": true,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "loyalty-points-discount",
              "bDiscount": false
            },
            "oCustomer": {
              "oInvoiceAddress": {
                "sStreet": "middlewerg",
                "sHouseNumber": "9a",
                "sPostalCode": "442001",
                "sCity": "Asperen",
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              },
              "oPhone": {
                "bWhatsApp": true,
                "sCountryCode": "+91",
                "sMobile": "9970149807",
                "sLandLine": "9970149807",
                "sFax": ""
              },
              "bCounter": false,
              "_id": "62420be55777d556346a9484",
              "sFirstName": "Jolmer",
              "sLastName": "Ekeren2",
              "sPrefix": "Van",
              "sGender": "male",
              "sVatNumber": "5896325",
              "sCocNumber": "",
              "sEmail": "Jolmerekeren02@gmail.com"
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [],
            "nSavingsPoints": 0,
            "bImported": false,
            "sProductName": "PRODUCT600  PRODUCT616",
            "nPriceIncVat": 100,
            "nVatRate": 21,
            "nQuantity": 1,
            "sArticleNumber": "000159553/00017057616",
            "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupOriginalId": "641b1de6e7b8a875b845baf3",
            "oArticleGroupMetaData": {
              "oName": {
                "nl": "ARTICKELGROUP1A",
                "fr": "ARTICKELGROUP1A",
                "en": "ARTICKELGROUP1A",
                "es": "ARTICKELGROUP1A",
                "de": "ARTICKELGROUP1A",
                "sv": "ARTICKELGROUP1A",
                "da": "ARTICKELGROUP1A",
                "ar": "ARTICKELGROUP1A",
                "is": "ARTICKELGROUP1A",
                "ms": "ARTICKELGROUP1A"
              },
              "aProperty": [
                {
                  "iPropertyId": "61160712ae3cbb7453177f98",
                  "sPropertyName": "CATEGORY",
                  "sPropertyOptionName": "WATCH",
                  "iPropertyOptionId": "61f01aa45fc7504de957b258",
                  "sCode": "WA"
                },
                {
                  "iPropertyId": "6261a5f76d3ec230f0886eee",
                  "sPropertyName": "WATCH_CASE_MATERIAL",
                  "sPropertyOptionName": "TITANIUM",
                  "iPropertyOptionId": "62e8bd09c2910b2073515bad",
                  "sCode": "TI"
                }
              ],
              "sCategory": "",
              "sSubCategory": ""
            },
            "nRefundAmount": 0,
            "iBusinessProductId": "63c7d879c4e5ad46a9f1e463",
            "iWorkstationId": "62bee335e169f86f44ad0591",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b6d840ed1002890334456",
            "iSupplierId": "6275661d5732a79bf0e3f449",
            "nRedeemedLoyaltyPoints": 5,
            "sUniqueIdentifier": "b49e926d-3142-4f8a-8e24-05daac59b50c",
            "nRevenueAmount": -5,
            "sDescription": "",
            "iTransactionId": "64213fed73249807484b4ab4",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "64213fed73249807484b4ab5",
            "aLog": [],
            "nTotalAmount": 100,
            "nPaidAmount": -5,
            "sNumber": "AI8126-270323-1234",
            "iTransactionItemId": "64213fef73249807484b4ac8",
            "nCostOfRevenue": 0,
            "nProfitOfRevenue": 0,
            "dCreatedDate": "2023-03-27T07:04:15.174Z",
            "dUpdatedDate": "2023-03-27T07:14:32.042Z",
            "__v": 0,
            "iArticleGroupId": null
          },
          {
            "_id": "64213fef73249807484b4acc",
            "oType": {
              "bPrepayment": true,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "loyalty-points-discount",
              "bDiscount": false
            },
            "oCustomer": {
              "oInvoiceAddress": {
                "sStreet": "middlewerg",
                "sHouseNumber": "9a",
                "sPostalCode": "442001",
                "sCity": "Asperen",
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              },
              "oPhone": {
                "bWhatsApp": true,
                "sCountryCode": "+91",
                "sMobile": "9970149807",
                "sLandLine": "9970149807",
                "sFax": ""
              },
              "bCounter": false,
              "_id": "62420be55777d556346a9484",
              "sFirstName": "Jolmer",
              "sLastName": "Ekeren2",
              "sPrefix": "Van",
              "sGender": "male",
              "sVatNumber": "5896325",
              "sCocNumber": "",
              "sEmail": "Jolmerekeren02@gmail.com"
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [],
            "nSavingsPoints": 0,
            "bImported": false,
            "sProductName": "PRODUCT600  PRODUCT616",
            "nPriceIncVat": 100,
            "nVatRate": 21,
            "nQuantity": 1,
            "sArticleNumber": "000159553/00017057616",
            "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupOriginalId": "641b1de6e7b8a875b845baf3",
            "oArticleGroupMetaData": {
              "oName": {
                "nl": "ARTICKELGROUP1A",
                "fr": "ARTICKELGROUP1A",
                "en": "ARTICKELGROUP1A",
                "es": "ARTICKELGROUP1A",
                "de": "ARTICKELGROUP1A",
                "sv": "ARTICKELGROUP1A",
                "da": "ARTICKELGROUP1A",
                "ar": "ARTICKELGROUP1A",
                "is": "ARTICKELGROUP1A",
                "ms": "ARTICKELGROUP1A"
              },
              "aProperty": [
                {
                  "iPropertyId": "61160712ae3cbb7453177f98",
                  "sPropertyName": "CATEGORY",
                  "sPropertyOptionName": "WATCH",
                  "iPropertyOptionId": "61f01aa45fc7504de957b258",
                  "sCode": "WA"
                },
                {
                  "iPropertyId": "6261a5f76d3ec230f0886eee",
                  "sPropertyName": "WATCH_CASE_MATERIAL",
                  "sPropertyOptionName": "TITANIUM",
                  "iPropertyOptionId": "62e8bd09c2910b2073515bad",
                  "sCode": "TI"
                }
              ],
              "sCategory": "",
              "sSubCategory": ""
            },
            "nRefundAmount": 0,
            "iBusinessProductId": "63c7d879c4e5ad46a9f1e463",
            "iWorkstationId": "62bee335e169f86f44ad0591",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b6d840ed1002890334456",
            "iSupplierId": "6275661d5732a79bf0e3f449",
            "nRedeemedLoyaltyPoints": 5,
            "sUniqueIdentifier": "808db8ac-0bd5-4937-b815-12ad8787abd1",
            "nRevenueAmount": -5,
            "sDescription": "",
            "iTransactionId": "64213fed73249807484b4ab4",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "64213fed73249807484b4ab5",
            "aLog": [],
            "nTotalAmount": 100,
            "nPaidAmount": -5,
            "sNumber": "AI8127-270323-1234",
            "iTransactionItemId": "64213fef73249807484b4acb",
            "nCostOfRevenue": 0,
            "nProfitOfRevenue": 0,
            "dCreatedDate": "2023-03-27T07:04:15.175Z",
            "dUpdatedDate": "2023-03-27T07:14:32.042Z",
            "__v": 0,
            "iArticleGroupId": null
          }
        ]
      },
      {
        "_id": "641ed709a163166edc15564b",
        "oCustomer": {
          "oInvoiceAddress": {
            "sStreet": "middlewerg",
            "sHouseNumber": "9a",
            "sPostalCode": "442001",
            "sCity": "Asperen",
            "sCountry": "Netherlands",
            "sCountryCode": "NL"
          },
          "oPhone": {
            "bWhatsApp": true,
            "sCountryCode": "+91",
            "sMobile": "9970149807",
            "sLandLine": "9970149807",
            "sFax": ""
          },
          "bCounter": false,
          "_id": "62420be55777d556346a9484",
          "sFirstName": "Jolmer",
          "sLastName": "Ekeren2",
          "sPrefix": "Van",
          "sGender": "male",
          "sVatNumber": "5896325",
          "sCocNumber": "",
          "sEmail": "Jolmerekeren02@gmail.com"
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A5971-250323-1212",
        "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
        "bImported": false,
        "aActivityItemMetaData": [],
        "iTransactionId": "641ed709a163166edc15564a",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2023-03-25T11:12:09.513Z",
        "dUpdatedDate": "2023-03-25T11:12:10.810Z",
        "__v": 0,
        "activityItems": [
          {
            "_id": "641ed709a163166edc155650",
            "oType": {
              "bPrepayment": false,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "regular",
              "bDiscount": false
            },
            "oCustomer": {
              "oInvoiceAddress": {
                "sStreet": "middlewerg",
                "sHouseNumber": "9a",
                "sPostalCode": "442001",
                "sCity": "Asperen",
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              },
              "oPhone": {
                "bWhatsApp": true,
                "sCountryCode": "+91",
                "sMobile": "9970149807",
                "sLandLine": "9970149807",
                "sFax": ""
              },
              "bCounter": false,
              "_id": "62420be55777d556346a9484",
              "sFirstName": "Jolmer",
              "sLastName": "Ekeren2",
              "sPrefix": "Van",
              "sGender": "male",
              "sVatNumber": "5896325",
              "sCocNumber": "",
              "sEmail": "Jolmerekeren02@gmail.com"
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [],
            "nSavingsPoints": 13,
            "bImported": false,
            "sProductName": "PrismaJewel gold  ICANDOIT",
            "nPriceIncVat": 155.33,
            "nVatRate": 21,
            "nQuantity": 1,
            "sArticleNumber": "00017057641",
            "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupId": "636452cb33a9344d347103ef",
            "iArticleGroupOriginalId": "636452cb33a9344d347103ef",
            "oArticleGroupMetaData": {
              "aProperty": [
                {
                  "iPropertyId": "61160712ae3cbb7453177f98",
                  "sPropertyName": "CATEGORY",
                  "iPropertyOptionId": "61f01aa45fc7504de957b25a",
                  "sPropertyOptionName": "JEWEL",
                  "sCode": "JW"
                },
                {
                  "iPropertyId": "61165be3ae3cbb7453178015",
                  "sPropertyName": "JEWEL_MATERIAL",
                  "iPropertyOptionId": "61165be3ae3cbb7453178016",
                  "sPropertyOptionName": "GOLD",
                  "sCode": "GO"
                }
              ],
              "sCategory": "",
              "sSubCategory": "",
              "oName": {
                "nl": "PrismaJewel gold",
                "en": "PrismaJewel gold",
                "de": "PrismaJewel gold",
                "fr": "PrismaJewel gold",
                "es": "PrismaJewel gold",
                "da": "PrismaJewel gold"
              }
            },
            "nRefundAmount": 0,
            "iBusinessProductId": "641ecef41b147c30e48d8f4c",
            "iWorkstationId": "62cfa01063953715a759acbd",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b6d840ed1002890334456",
            "iSupplierId": "6275661d5732a79bf0e3f449",
            "sUniqueIdentifier": "9eb6ca22-2366-433f-b844-8bb40980e250",
            "nRevenueAmount": 155.33,
            "sDescription": "",
            "iTransactionId": "641ed709a163166edc15564a",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "641ed709a163166edc15564b",
            "aLog": [],
            "nTotalAmount": 155.33,
            "nPaidAmount": 155.33,
            "sNumber": "AI8099-250323-1212",
            "iTransactionItemId": "641ed709a163166edc15564f",
            "nCostOfRevenue": 22.19,
            "nProfitOfRevenue": 106.18190082644631,
            "dCreatedDate": "2023-03-25T11:12:09.655Z",
            "dUpdatedDate": "2023-03-25T11:12:09.655Z",
            "__v": 0
          },
          {
            "_id": "641ed70aa163166edc155659",
            "oType": {
              "bPrepayment": false,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "loyalty-points-discount",
              "bDiscount": false
            },
            "oCustomer": {
              "oInvoiceAddress": {
                "sStreet": "middlewerg",
                "sHouseNumber": "9a",
                "sPostalCode": "442001",
                "sCity": "Asperen",
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              },
              "oPhone": {
                "bWhatsApp": true,
                "sCountryCode": "+91",
                "sMobile": "9970149807",
                "sLandLine": "9970149807",
                "sFax": ""
              },
              "bCounter": false,
              "_id": "62420be55777d556346a9484",
              "sFirstName": "Jolmer",
              "sLastName": "Ekeren2",
              "sPrefix": "Van",
              "sGender": "male",
              "sVatNumber": "5896325",
              "sCocNumber": "",
              "sEmail": "Jolmerekeren02@gmail.com"
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [],
            "nSavingsPoints": -2,
            "bImported": false,
            "sProductName": "PrismaJewel gold  ICANDOIT",
            "nPriceIncVat": 155.33,
            "nVatRate": 21,
            "nQuantity": 1,
            "sArticleNumber": "00017057641",
            "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupId": "6360c5c2fa076112bc18a1c3",
            "iArticleGroupOriginalId": "636452cb33a9344d347103ef",
            "oArticleGroupMetaData": {
              "aProperty": [
                {
                  "iPropertyId": "61160712ae3cbb7453177f98",
                  "sPropertyName": "CATEGORY",
                  "iPropertyOptionId": "61f01aa45fc7504de957b25a",
                  "sPropertyOptionName": "JEWEL",
                  "sCode": "JW"
                },
                {
                  "iPropertyId": "61165be3ae3cbb7453178015",
                  "sPropertyName": "JEWEL_MATERIAL",
                  "iPropertyOptionId": "61165be3ae3cbb7453178016",
                  "sPropertyOptionName": "GOLD",
                  "sCode": "GO"
                }
              ],
              "sCategory": "payment-discount",
              "sSubCategory": "payment-discount",
              "oName": {
                "nl": "PrismaJewel gold",
                "en": "PrismaJewel gold",
                "de": "PrismaJewel gold",
                "fr": "PrismaJewel gold",
                "es": "PrismaJewel gold",
                "da": "PrismaJewel gold"
              }
            },
            "nRefundAmount": 0,
            "iBusinessProductId": "641ecef41b147c30e48d8f4c",
            "iWorkstationId": "62cfa01063953715a759acbd",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b6d840ed1002890334456",
            "iSupplierId": "6275661d5732a79bf0e3f449",
            "sUniqueIdentifier": "9eb6ca22-2366-433f-b844-8bb40980e250",
            "nRevenueAmount": -20,
            "sDescription": "",
            "nRedeemedLoyaltyPoints": 20,
            "iTransactionId": "641ed709a163166edc15564a",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "641ed709a163166edc15564b",
            "aLog": [],
            "nTotalAmount": 155.33,
            "nPaidAmount": -20,
            "sNumber": "AI8101-250323-1212",
            "iTransactionItemId": "641ed70aa163166edc155658",
            "nCostOfRevenue": 0,
            "nProfitOfRevenue": 0,
            "dCreatedDate": "2023-03-25T11:12:10.770Z",
            "dUpdatedDate": "2023-03-25T11:12:10.770Z",
            "__v": 0
          }
        ]
      },
      {
        "_id": "641ec88ba163166edc1552a0",
        "oCustomer": {
          "oInvoiceAddress": {
            "sStreet": "middlewerg",
            "sHouseNumber": "9a",
            "sPostalCode": "442001",
            "sCity": "Asperen",
            "sCountry": "Netherlands",
            "sCountryCode": "NL"
          },
          "oPhone": {
            "bWhatsApp": true,
            "sCountryCode": "+91",
            "sMobile": "9970149807",
            "sLandLine": "9970149807",
            "sFax": ""
          },
          "bCounter": false,
          "_id": "62420be55777d556346a9484",
          "sFirstName": "Jolmer",
          "sLastName": "Ekeren2",
          "sPrefix": "Van",
          "sGender": "male",
          "sVatNumber": "5896325",
          "sCocNumber": "",
          "sEmail": "Jolmerekeren02@gmail.com"
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A5959-250323-1110",
        "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
        "bImported": false,
        "aActivityItemMetaData": [],
        "iTransactionId": "641ec88ba163166edc15529f",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2023-03-25T10:10:19.092Z",
        "dUpdatedDate": "2023-03-25T10:10:19.245Z",
        "__v": 0,
        "activityItems": [
          {
            "_id": "641ec88ba163166edc1552a5",
            "oType": {
              "bPrepayment": true,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "regular",
              "bDiscount": false
            },
            "oCustomer": {
              "oInvoiceAddress": {
                "sStreet": "middlewerg",
                "sHouseNumber": "9a",
                "sPostalCode": "442001",
                "sCity": "Asperen",
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              },
              "oPhone": {
                "bWhatsApp": true,
                "sCountryCode": "+91",
                "sMobile": "9970149807",
                "sLandLine": "9970149807",
                "sFax": ""
              },
              "bCounter": false,
              "_id": "62420be55777d556346a9484",
              "sFirstName": "Jolmer",
              "sLastName": "Ekeren2",
              "sPrefix": "Van",
              "sGender": "male",
              "sVatNumber": "5896325",
              "sCocNumber": "",
              "sEmail": "Jolmerekeren02@gmail.com"
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [],
            "nSavingsPoints": 2,
            "bImported": false,
            "sProductName": "PRODUCT600  PRODUCT616",
            "nPriceIncVat": 100,
            "nVatRate": 21,
            "nQuantity": 1,
            "sArticleNumber": "000159553/00017057616",
            "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupId": "641b1de6e7b8a875b845baf3",
            "iArticleGroupOriginalId": "641b1de6e7b8a875b845baf3",
            "oArticleGroupMetaData": {
              "aProperty": [
                {
                  "iPropertyId": "61160712ae3cbb7453177f98",
                  "sPropertyName": "CATEGORY",
                  "sPropertyOptionName": "WATCH",
                  "iPropertyOptionId": "61f01aa45fc7504de957b258",
                  "sCode": "WA"
                },
                {
                  "iPropertyId": "6261a5f76d3ec230f0886eee",
                  "sPropertyName": "WATCH_CASE_MATERIAL",
                  "sPropertyOptionName": "TITANIUM",
                  "iPropertyOptionId": "62e8bd09c2910b2073515bad",
                  "sCode": "TI"
                }
              ],
              "sCategory": "",
              "sSubCategory": "",
              "oName": {
                "nl": "PRODUCT600",
                "fr": "PRODUCT600",
                "en": "PRODUCT600",
                "es": "PRODUCT600",
                "de": "PRODUCT600",
                "sv": "PRODUCT600",
                "da": "PRODUCT600",
                "ar": "PRODUCT600",
                "is": "PRODUCT600",
                "ms": "PRODUCT600"
              }
            },
            "nRefundAmount": 0,
            "iBusinessProductId": "63c7d879c4e5ad46a9f1e463",
            "iWorkstationId": "62cfa01063953715a759acbd",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b6d840ed1002890334456",
            "iSupplierId": "6275661d5732a79bf0e3f449",
            "sUniqueIdentifier": "58478c94-5c68-41d2-a1cd-51a3064b0521",
            "nRevenueAmount": 26,
            "sDescription": "",
            "iTransactionId": "641ec88ba163166edc15529f",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "641ec88ba163166edc1552a0",
            "aLog": [],
            "nTotalAmount": 100,
            "nPaidAmount": 26,
            "sNumber": "AI8066-250323-1110",
            "iTransactionItemId": "641ec88ba163166edc1552a4",
            "nCostOfRevenue": 21.487603305785125,
            "nProfitOfRevenue": 0,
            "dCreatedDate": "2023-03-25T10:10:19.198Z",
            "dUpdatedDate": "2023-03-25T10:10:19.198Z",
            "__v": 0
          }
        ]
      },
      {
        "_id": "641d789e449d646f144ed87b",
        "oCustomer": {
          "oInvoiceAddress": {
            "sStreet": "middlewerg",
            "sHouseNumber": "9a",
            "sPostalCode": "442001",
            "sCity": "Asperen",
            "sCountry": "Netherlands",
            "sCountryCode": "NL"
          },
          "oPhone": {
            "bWhatsApp": true,
            "sCountryCode": "+91",
            "sMobile": "9970149807",
            "sLandLine": "9970149807",
            "sFax": ""
          },
          "bCounter": false,
          "_id": "62420be55777d556346a9484",
          "sFirstName": "Jolmer",
          "sLastName": "Ekeren2",
          "sPrefix": "Van",
          "sGender": "male",
          "sVatNumber": "5896325",
          "sCocNumber": "",
          "sEmail": "Jolmerekeren02@gmail.com"
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A5945-240323-1117",
        "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
        "bImported": false,
        "aActivityItemMetaData": [],
        "iTransactionId": "641d789e449d646f144ed87a",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2023-03-24T10:17:02.954Z",
        "dUpdatedDate": "2023-03-24T10:17:03.457Z",
        "__v": 0,
        "activityItems": [
          {
            "_id": "641d789f449d646f144ed880",
            "oType": {
              "bPrepayment": true,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "regular",
              "bDiscount": true
            },
            "oCustomer": {
              "oInvoiceAddress": {
                "sStreet": "middlewerg",
                "sHouseNumber": "9a",
                "sPostalCode": "442001",
                "sCity": "Asperen",
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              },
              "oPhone": {
                "bWhatsApp": true,
                "sCountryCode": "+91",
                "sMobile": "9970149807",
                "sLandLine": "9970149807",
                "sFax": ""
              },
              "bCounter": false,
              "_id": "62420be55777d556346a9484",
              "sFirstName": "Jolmer",
              "sLastName": "Ekeren2",
              "sPrefix": "Van",
              "sGender": "male",
              "sVatNumber": "5896325",
              "sCocNumber": "",
              "sEmail": "Jolmerekeren02@gmail.com"
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [],
            "nSavingsPoints": 1,
            "bImported": false,
            "sProductName": "PRODUCT600  PRODUCT616",
            "nPriceIncVat": 100,
            "nVatRate": 21,
            "nQuantity": 1,
            "sArticleNumber": "000159553/00017057616",
            "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupId": "641b1de6e7b8a875b845baf3",
            "iArticleGroupOriginalId": "641b1de6e7b8a875b845baf3",
            "oArticleGroupMetaData": {
              "aProperty": [
                {
                  "iPropertyId": "61160712ae3cbb7453177f98",
                  "sPropertyName": "CATEGORY",
                  "sPropertyOptionName": "WATCH",
                  "iPropertyOptionId": "61f01aa45fc7504de957b258",
                  "sCode": "WA"
                },
                {
                  "iPropertyId": "6261a5f76d3ec230f0886eee",
                  "sPropertyName": "WATCH_CASE_MATERIAL",
                  "sPropertyOptionName": "TITANIUM",
                  "iPropertyOptionId": "62e8bd09c2910b2073515bad",
                  "sCode": "TI"
                }
              ],
              "sCategory": "",
              "sSubCategory": "",
              "oName": {
                "nl": "PRODUCT600",
                "fr": "PRODUCT600",
                "en": "PRODUCT600",
                "es": "PRODUCT600",
                "de": "PRODUCT600",
                "sv": "PRODUCT600",
                "da": "PRODUCT600",
                "ar": "PRODUCT600",
                "is": "PRODUCT600",
                "ms": "PRODUCT600"
              }
            },
            "nRefundAmount": 0,
            "iBusinessProductId": "63c7d879c4e5ad46a9f1e463",
            "iWorkstationId": "62b47942503dcc27f84c6f7e",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b6d840ed1002890334456",
            "iSupplierId": "6275661d5732a79bf0e3f449",
            "sUniqueIdentifier": "ba4a80b9-b121-477c-98db-6b4d581b3b3c",
            "nRevenueAmount": 40,
            "sDescription": "",
            "iTransactionId": "641d789e449d646f144ed87a",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "641d789e449d646f144ed87b",
            "aLog": [],
            "nTotalAmount": 100,
            "nPaidAmount": 40,
            "sNumber": "AI8041-240323-1117",
            "iTransactionItemId": "641d789f449d646f144ed87f",
            "nCostOfRevenue": 33.057851239669425,
            "nProfitOfRevenue": 0,
            "dCreatedDate": "2023-03-24T10:17:03.051Z",
            "dUpdatedDate": "2023-03-24T10:17:03.051Z",
            "__v": 0
          },
          {
            "_id": "641d789f449d646f144ed889",
            "oType": {
              "bPrepayment": true,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "discount",
              "bDiscount": true
            },
            "oCustomer": {
              "oInvoiceAddress": {
                "sStreet": "middlewerg",
                "sHouseNumber": "9a",
                "sPostalCode": "442001",
                "sCity": "Asperen",
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              },
              "oPhone": {
                "bWhatsApp": true,
                "sCountryCode": "+91",
                "sMobile": "9970149807",
                "sLandLine": "9970149807",
                "sFax": ""
              },
              "bCounter": false,
              "_id": "62420be55777d556346a9484",
              "sFirstName": "Jolmer",
              "sLastName": "Ekeren2",
              "sPrefix": "Van",
              "sGender": "male",
              "sVatNumber": "5896325",
              "sCocNumber": "",
              "sEmail": "Jolmerekeren02@gmail.com"
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [],
            "nSavingsPoints": -2,
            "bImported": false,
            "sProductName": "PRODUCT600  PRODUCT616",
            "nPriceIncVat": -10,
            "nVatRate": 21,
            "nQuantity": 1,
            "sArticleNumber": "000159553/00017057616",
            "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupId": "6368f09a13e2670d7a90f148",
            "iArticleGroupOriginalId": "641b1de6e7b8a875b845baf3",
            "oArticleGroupMetaData": {
              "aProperty": [
                {
                  "iPropertyId": "61160712ae3cbb7453177f98",
                  "sPropertyName": "CATEGORY",
                  "sPropertyOptionName": "WATCH",
                  "iPropertyOptionId": "61f01aa45fc7504de957b258",
                  "sCode": "WA"
                },
                {
                  "iPropertyId": "6261a5f76d3ec230f0886eee",
                  "sPropertyName": "WATCH_CASE_MATERIAL",
                  "sPropertyOptionName": "TITANIUM",
                  "iPropertyOptionId": "62e8bd09c2910b2073515bad",
                  "sCode": "TI"
                }
              ],
              "sCategory": "payment-discount",
              "sSubCategory": "payment-discount",
              "oName": {
                "nl": "PRODUCT600",
                "fr": "PRODUCT600",
                "en": "PRODUCT600",
                "es": "PRODUCT600",
                "de": "PRODUCT600",
                "sv": "PRODUCT600",
                "da": "PRODUCT600",
                "ar": "PRODUCT600",
                "is": "PRODUCT600",
                "ms": "PRODUCT600"
              }
            },
            "nRefundAmount": 0,
            "iBusinessProductId": "63c7d879c4e5ad46a9f1e463",
            "iWorkstationId": "62b47942503dcc27f84c6f7e",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b6d840ed1002890334456",
            "iSupplierId": "6275661d5732a79bf0e3f449",
            "sUniqueIdentifier": "ba4a80b9-b121-477c-98db-6b4d581b3b3c",
            "nRevenueAmount": -10,
            "sDescription": "",
            "iTransactionId": "641d789e449d646f144ed87a",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "641d789e449d646f144ed87b",
            "aLog": [],
            "nTotalAmount": -20,
            "nPaidAmount": -10,
            "sNumber": "AI8043-240323-1117",
            "iTransactionItemId": "641d789f449d646f144ed888",
            "nCostOfRevenue": 0,
            "nProfitOfRevenue": 0,
            "dCreatedDate": "2023-03-24T10:17:03.367Z",
            "dUpdatedDate": "2023-03-24T10:17:03.367Z",
            "__v": 0
          },
          {
            "_id": "641d789f449d646f144ed88c",
            "oType": {
              "bPrepayment": true,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "loyalty-points-discount",
              "bDiscount": true
            },
            "oCustomer": {
              "oInvoiceAddress": {
                "sStreet": "middlewerg",
                "sHouseNumber": "9a",
                "sPostalCode": "442001",
                "sCity": "Asperen",
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              },
              "oPhone": {
                "bWhatsApp": true,
                "sCountryCode": "+91",
                "sMobile": "9970149807",
                "sLandLine": "9970149807",
                "sFax": ""
              },
              "bCounter": false,
              "_id": "62420be55777d556346a9484",
              "sFirstName": "Jolmer",
              "sLastName": "Ekeren2",
              "sPrefix": "Van",
              "sGender": "male",
              "sVatNumber": "5896325",
              "sCocNumber": "",
              "sEmail": "Jolmerekeren02@gmail.com"
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [],
            "nSavingsPoints": -3,
            "bImported": false,
            "sProductName": "PRODUCT600  PRODUCT616",
            "nPriceIncVat": 100,
            "nVatRate": 21,
            "nQuantity": 1,
            "sArticleNumber": "000159553/00017057616",
            "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupId": "6360c5c2fa076112bc18a1c3",
            "iArticleGroupOriginalId": "641b1de6e7b8a875b845baf3",
            "oArticleGroupMetaData": {
              "aProperty": [
                {
                  "iPropertyId": "61160712ae3cbb7453177f98",
                  "sPropertyName": "CATEGORY",
                  "sPropertyOptionName": "WATCH",
                  "iPropertyOptionId": "61f01aa45fc7504de957b258",
                  "sCode": "WA"
                },
                {
                  "iPropertyId": "6261a5f76d3ec230f0886eee",
                  "sPropertyName": "WATCH_CASE_MATERIAL",
                  "sPropertyOptionName": "TITANIUM",
                  "iPropertyOptionId": "62e8bd09c2910b2073515bad",
                  "sCode": "TI"
                }
              ],
              "sCategory": "payment-discount",
              "sSubCategory": "payment-discount",
              "oName": {
                "nl": "PRODUCT600",
                "fr": "PRODUCT600",
                "en": "PRODUCT600",
                "es": "PRODUCT600",
                "de": "PRODUCT600",
                "sv": "PRODUCT600",
                "da": "PRODUCT600",
                "ar": "PRODUCT600",
                "is": "PRODUCT600",
                "ms": "PRODUCT600"
              }
            },
            "nRefundAmount": 0,
            "iBusinessProductId": "63c7d879c4e5ad46a9f1e463",
            "iWorkstationId": "62b47942503dcc27f84c6f7e",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b6d840ed1002890334456",
            "iSupplierId": "6275661d5732a79bf0e3f449",
            "sUniqueIdentifier": "ba4a80b9-b121-477c-98db-6b4d581b3b3c",
            "nRevenueAmount": -20,
            "sDescription": "",
            "nRedeemedLoyaltyPoints": 20,
            "iTransactionId": "641d789e449d646f144ed87a",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "641d789e449d646f144ed87b",
            "aLog": [],
            "nTotalAmount": 90,
            "nPaidAmount": -20,
            "sNumber": "AI8044-240323-1117",
            "iTransactionItemId": "641d789f449d646f144ed88b",
            "nCostOfRevenue": 0,
            "nProfitOfRevenue": 0,
            "dCreatedDate": "2023-03-24T10:17:03.367Z",
            "dUpdatedDate": "2023-03-24T10:17:03.367Z",
            "__v": 0
          }
        ]
      },
      {
        "_id": "64184b00b615902114b402aa",
        "oCustomer": {
          "oInvoiceAddress": {
            "sStreet": "middlewerg",
            "sHouseNumber": "9a",
            "sPostalCode": "442001",
            "sCity": "Asperen",
            "sCountry": "Netherlands",
            "sCountryCode": "NL"
          },
          "oPhone": {
            "bWhatsApp": true,
            "sCountryCode": "+91",
            "sMobile": "9970149807",
            "sLandLine": "9970149807",
            "sFax": ""
          },
          "bCounter": false,
          "_id": "62420be55777d556346a9484",
          "sFirstName": "Jolmer",
          "sLastName": "Ekeren2",
          "sPrefix": "Van",
          "sGender": "male",
          "sVatNumber": "5896325",
          "sCocNumber": "",
          "sEmail": "Jolmerekeren02@gmail.com"
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A4709-200323-1731",
        "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
        "bImported": false,
        "aActivityItemMetaData": [],
        "iTransactionId": "64184b00b615902114b402a9",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2023-03-20T12:01:04.594Z",
        "dUpdatedDate": "2023-03-20T12:01:14.119Z",
        "__v": 0,
        "activityItems": [
          {
            "_id": "64184b01b615902114b402af",
            "oType": {
              "bPrepayment": false,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "regular",
              "bDiscount": false
            },
            "oCustomer": {
              "oInvoiceAddress": {
                "sStreet": "middlewerg",
                "sHouseNumber": "9a",
                "sPostalCode": "442001",
                "sCity": "Asperen",
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              },
              "oPhone": {
                "bWhatsApp": true,
                "sCountryCode": "+91",
                "sMobile": "9970149807",
                "sLandLine": "9970149807",
                "sFax": ""
              },
              "bCounter": false,
              "_id": "62420be55777d556346a9484",
              "sFirstName": "Jolmer",
              "sLastName": "Ekeren2",
              "sPrefix": "Van",
              "sGender": "male",
              "sVatNumber": "5896325",
              "sCocNumber": "",
              "sEmail": "Jolmerekeren02@gmail.com"
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [
              "https://prismanote.s3.amazonaws.com/products/prisma-p1593-heren-horloge-edelstaal-licht-blauw.jpg",
              "https://prismanote.s3.amazonaws.com/products/prisma-p1593-heren-horloge-edelstaal-licht-blauw-schuin.jpg",
              "https://prismanote.s3.amazonaws.com/products/prisma-p1593-heren-horloge-edelstaal-licht-blauw-achterkant.jpg"
            ],
            "nSavingsPoints": 8,
            "bImported": false,
            "sProductName": "Prisma  P1593",
            "nPriceIncVat": 100,
            "nVatRate": 21,
            "nQuantity": 1,
            "sArticleNumber": "000159553",
            "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupId": "63971eb03bae4169a7f9d8be",
            "iArticleGroupOriginalId": "63971eb03bae4169a7f9d8be",
            "oArticleGroupMetaData": {
              "aProperty": [],
              "oName": {
                "nl": "Prisma",
                "en": "Prisma",
                "fr": "Prisma",
                "de": "Prisma",
                "es": "Prisma",
                "da": "Prisma"
              }
            },
            "nRefundAmount": 0,
            "iBusinessBrandId": "62b426627ee2c637cc3879d5",
            "iBusinessProductId": "63c7d879c4e5ad46a9f1e463",
            "iWorkstationId": "62cfa01063953715a759acbd",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b6d840ed1002890334456",
            "iSupplierId": "6275661d5732a79bf0e3f449",
            "sUniqueIdentifier": "2a3c2564-e23f-4db7-8d15-ac9878f55fbd",
            "nRevenueAmount": 100,
            "sDescription": "",
            "iTransactionId": "64184b00b615902114b402a9",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "64184b00b615902114b402aa",
            "aLog": [],
            "nTotalAmount": 100,
            "nPaidAmount": 100,
            "sNumber": "AI7346-200323-1731",
            "iTransactionItemId": "64184b01b615902114b402ae",
            "nCostOfRevenue": 100,
            "nProfitOfRevenue": -17.35537190082644,
            "dCreatedDate": "2023-03-20T12:01:05.105Z",
            "dUpdatedDate": "2023-03-20T12:01:05.105Z",
            "__v": 0
          },
          {
            "_id": "64184b04b615902114b402b5",
            "oType": {
              "bPrepayment": false,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "regular",
              "bDiscount": false
            },
            "oCustomer": {
              "oInvoiceAddress": {
                "sStreet": "middlewerg",
                "sHouseNumber": "9a",
                "sPostalCode": "442001",
                "sCity": "Asperen",
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              },
              "oPhone": {
                "bWhatsApp": true,
                "sCountryCode": "+91",
                "sMobile": "9970149807",
                "sLandLine": "9970149807",
                "sFax": ""
              },
              "bCounter": false,
              "_id": "62420be55777d556346a9484",
              "sFirstName": "Jolmer",
              "sLastName": "Ekeren2",
              "sPrefix": "Van",
              "sGender": "male",
              "sVatNumber": "5896325",
              "sCocNumber": "",
              "sEmail": "Jolmerekeren02@gmail.com"
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [
              "https://prismanote.s3.amazonaws.com/product/20545jpg1602312868151.jpg"
            ],
            "nSavingsPoints": 3,
            "bImported": false,
            "sProductName": "2.CO.XX.00 Zv coll labradoriet JEH20545",
            "nPriceIncVat": 50,
            "nVatRate": 0,
            "nQuantity": 1,
            "sArticleNumber": "000016760",
            "iBusinessPartnerId": "63983d8ffbc8e8b367de01d8",
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupId": "639b0dd048a0876deae8696f",
            "iArticleGroupOriginalId": "639b0dd048a0876deae8696f",
            "oArticleGroupMetaData": {
              "aProperty": [],
              "oName": {
                "nl": "2.CO.XX.00",
                "en": "2.CO.XX.00",
                "fr": "2.CO.XX.00",
                "de": "2.CO.XX.00",
                "es": "2.CO.XX.00",
                "da": "2.CO.XX.00"
              }
            },
            "nRefundAmount": 0,
            "iBusinessProductId": "63c7d928c4e5ad46a9f1e894",
            "iWorkstationId": "62cfa01063953715a759acbd",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b6d840ed1002890334456",
            "iSupplierId": "63983d8ffbc8e8b367de01d8",
            "sUniqueIdentifier": "60a63d6e-6ed7-488b-b088-6caee79bae01",
            "nRevenueAmount": 50,
            "sDescription": "",
            "iTransactionId": "64184b00b615902114b402a9",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "64184b00b615902114b402aa",
            "aLog": [],
            "nTotalAmount": 50,
            "nPaidAmount": 50,
            "sNumber": "AI7347-200323-1731",
            "iTransactionItemId": "64184b04b615902114b402b4",
            "nCostOfRevenue": 100,
            "nProfitOfRevenue": -50,
            "dCreatedDate": "2023-03-20T12:01:08.619Z",
            "dUpdatedDate": "2023-03-20T12:01:08.619Z",
            "__v": 0
          },
          {
            "_id": "64184b09b615902114b402be",
            "oType": {
              "bPrepayment": false,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "loyalty-points-discount",
              "bDiscount": false
            },
            "oCustomer": {
              "oInvoiceAddress": {
                "sStreet": "middlewerg",
                "sHouseNumber": "9a",
                "sPostalCode": "442001",
                "sCity": "Asperen",
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              },
              "oPhone": {
                "bWhatsApp": true,
                "sCountryCode": "+91",
                "sMobile": "9970149807",
                "sLandLine": "9970149807",
                "sFax": ""
              },
              "bCounter": false,
              "_id": "62420be55777d556346a9484",
              "sFirstName": "Jolmer",
              "sLastName": "Ekeren2",
              "sPrefix": "Van",
              "sGender": "male",
              "sVatNumber": "5896325",
              "sCocNumber": "",
              "sEmail": "Jolmerekeren02@gmail.com"
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [
              "https://prismanote.s3.amazonaws.com/products/prisma-p1593-heren-horloge-edelstaal-licht-blauw.jpg",
              "https://prismanote.s3.amazonaws.com/products/prisma-p1593-heren-horloge-edelstaal-licht-blauw-schuin.jpg",
              "https://prismanote.s3.amazonaws.com/products/prisma-p1593-heren-horloge-edelstaal-licht-blauw-achterkant.jpg"
            ],
            "nSavingsPoints": -1,
            "bImported": false,
            "sProductName": "Prisma  P1593",
            "nPriceIncVat": 100,
            "nVatRate": 21,
            "nQuantity": 1,
            "sArticleNumber": "000159553",
            "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupId": "6360c5c2fa076112bc18a1c3",
            "iArticleGroupOriginalId": "63971eb03bae4169a7f9d8be",
            "oArticleGroupMetaData": {
              "aProperty": [],
              "oName": {
                "nl": "Prisma",
                "en": "Prisma",
                "fr": "Prisma",
                "de": "Prisma",
                "es": "Prisma",
                "da": "Prisma"
              },
              "sCategory": "payment-discount",
              "sSubCategory": "payment-discount"
            },
            "nRefundAmount": 0,
            "iBusinessBrandId": "62b426627ee2c637cc3879d5",
            "iBusinessProductId": "63c7d879c4e5ad46a9f1e463",
            "iWorkstationId": "62cfa01063953715a759acbd",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b6d840ed1002890334456",
            "iSupplierId": "6275661d5732a79bf0e3f449",
            "sUniqueIdentifier": "2a3c2564-e23f-4db7-8d15-ac9878f55fbd",
            "nRevenueAmount": -13,
            "sDescription": "",
            "nRedeemedLoyaltyPoints": 13,
            "iTransactionId": "64184b00b615902114b402a9",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "64184b00b615902114b402aa",
            "aLog": [],
            "nTotalAmount": 100,
            "nPaidAmount": -13,
            "sNumber": "AI7349-200323-1731",
            "iTransactionItemId": "64184b09b615902114b402bd",
            "nCostOfRevenue": 0,
            "nProfitOfRevenue": 0,
            "dCreatedDate": "2023-03-20T12:01:13.461Z",
            "dUpdatedDate": "2023-03-20T12:01:13.461Z",
            "__v": 0
          },
          {
            "_id": "64184b09b615902114b402c1",
            "oType": {
              "bPrepayment": false,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "loyalty-points-discount",
              "bDiscount": false
            },
            "oCustomer": {
              "oInvoiceAddress": {
                "sStreet": "middlewerg",
                "sHouseNumber": "9a",
                "sPostalCode": "442001",
                "sCity": "Asperen",
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              },
              "oPhone": {
                "bWhatsApp": true,
                "sCountryCode": "+91",
                "sMobile": "9970149807",
                "sLandLine": "9970149807",
                "sFax": ""
              },
              "bCounter": false,
              "_id": "62420be55777d556346a9484",
              "sFirstName": "Jolmer",
              "sLastName": "Ekeren2",
              "sPrefix": "Van",
              "sGender": "male",
              "sVatNumber": "5896325",
              "sCocNumber": "",
              "sEmail": "Jolmerekeren02@gmail.com"
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [
              "https://prismanote.s3.amazonaws.com/product/20545jpg1602312868151.jpg"
            ],
            "nSavingsPoints": -1,
            "bImported": false,
            "sProductName": "2.CO.XX.00 Zv coll labradoriet JEH20545",
            "nPriceIncVat": 50,
            "nVatRate": 0,
            "nQuantity": 1,
            "sArticleNumber": "000016760",
            "iBusinessPartnerId": "63983d8ffbc8e8b367de01d8",
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupId": "6360c5c2fa076112bc18a1c3",
            "iArticleGroupOriginalId": "639b0dd048a0876deae8696f",
            "oArticleGroupMetaData": {
              "aProperty": [],
              "oName": {
                "nl": "2.CO.XX.00",
                "en": "2.CO.XX.00",
                "fr": "2.CO.XX.00",
                "de": "2.CO.XX.00",
                "es": "2.CO.XX.00",
                "da": "2.CO.XX.00"
              },
              "sCategory": "payment-discount",
              "sSubCategory": "payment-discount"
            },
            "nRefundAmount": 0,
            "iBusinessProductId": "63c7d928c4e5ad46a9f1e894",
            "iWorkstationId": "62cfa01063953715a759acbd",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b6d840ed1002890334456",
            "iSupplierId": "63983d8ffbc8e8b367de01d8",
            "sUniqueIdentifier": "60a63d6e-6ed7-488b-b088-6caee79bae01",
            "nRevenueAmount": -12,
            "sDescription": "",
            "nRedeemedLoyaltyPoints": 12,
            "iTransactionId": "64184b00b615902114b402a9",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "64184b00b615902114b402aa",
            "aLog": [],
            "nTotalAmount": 50,
            "nPaidAmount": -12,
            "sNumber": "AI7350-200323-1731",
            "iTransactionItemId": "64184b09b615902114b402c0",
            "nCostOfRevenue": 0,
            "nProfitOfRevenue": 0,
            "dCreatedDate": "2023-03-20T12:01:13.462Z",
            "dUpdatedDate": "2023-03-20T12:01:13.462Z",
            "__v": 0
          }
        ]
      },
      {
        "_id": "64115b369d443a1ac98487ab",
        "oCustomer": {
          "_id": "62420be55777d556346a9484",
          "sSalutation": "Mr",
          "sFirstName": "Jolmer 1",
          "sLastName": "Ekeren2",
          "sPrefix": "Van",
          "sEmail": "Jolmerekeren02@gmail.com",
          "sGender": "male",
          "sVatNumber": "5896325",
          "bCounter": false,
          "oPhone": {
            "bWhatsApp": true,
            "sCountryCode": "+91",
            "sMobile": "9970149807",
            "sLandLine": "9970149807",
            "sFax": ""
          },
          "oInvoiceAddress": {
            "sStreet": "middlewerg",
            "sHouseNumber": "9a",
            "sPostalCode": "442001",
            "sCity": "Asperen",
            "sCountry": "Netherlands",
            "sCountryCode": "NL"
          },
          "oShippingAddress": {
            "sCountry": "Netherlands",
            "sCountryCode": "NL"
          }
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A4525-150323-1114",
        "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
        "bImported": false,
        "aActivityItemMetaData": [],
        "iTransactionId": "64115b369d443a1ac98487aa",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2023-03-15T05:44:22.848Z",
        "dUpdatedDate": "2023-03-15T05:59:49.433Z",
        "__v": 0,
        "activityItems": [
          {
            "_id": "64115b379d443a1ac98487b0",
            "oType": {
              "bPrepayment": false,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "regular",
              "bDiscount": false
            },
            "oCustomer": {
              "_id": "62420be55777d556346a9484",
              "sSalutation": "Mr",
              "sFirstName": "Jolmer 1",
              "sLastName": "Ekeren2",
              "sPrefix": "Van",
              "sEmail": "Jolmerekeren02@gmail.com",
              "sGender": "male",
              "sVatNumber": "5896325",
              "bCounter": false,
              "oPhone": {
                "bWhatsApp": true,
                "sCountryCode": "+91",
                "sMobile": "9970149807",
                "sLandLine": "9970149807",
                "sFax": ""
              },
              "oInvoiceAddress": {
                "sStreet": "middlewerg",
                "sHouseNumber": "9a",
                "sPostalCode": "442001",
                "sCity": "Asperen",
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              },
              "oShippingAddress": {
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              }
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [
              "https://prismanote.s3.amazonaws.com/product/20545jpg1602312868151.jpg"
            ],
            "nSavingsPoints": 5,
            "bImported": false,
            "sProductName": "2.CO.XX.00 Zv coll labradoriet JEH20545",
            "nPriceIncVat": 50,
            "nVatRate": 0,
            "nQuantity": 1,
            "sArticleNumber": "000016760",
            "iBusinessPartnerId": "63983d8ffbc8e8b367de01d8",
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupId": "639b0dd048a0876deae8696f",
            "iArticleGroupOriginalId": "639b0dd048a0876deae8696f",
            "oArticleGroupMetaData": {
              "aProperty": [],
              "oName": {
                "nl": "2.CO.XX.00",
                "en": "2.CO.XX.00",
                "fr": "2.CO.XX.00",
                "de": "2.CO.XX.00",
                "es": "2.CO.XX.00",
                "da": "2.CO.XX.00"
              }
            },
            "nRefundAmount": 0,
            "iBusinessProductId": "63c7d928c4e5ad46a9f1e894",
            "iWorkstationId": "62cfa01063953715a759acbd",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b6d840ed1002890334456",
            "iSupplierId": "63983d8ffbc8e8b367de01d8",
            "sUniqueIdentifier": "7ab7e111-0d1b-4ed9-8caa-501d4033d2eb",
            "nRevenueAmount": 50,
            "sDescription": "",
            "iTransactionId": "64115b369d443a1ac98487aa",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "64115b369d443a1ac98487ab",
            "aLog": [],
            "nTotalAmount": 50,
            "nPaidAmount": 50,
            "sNumber": "AI7076-150323-1114",
            "iTransactionItemId": "64115b379d443a1ac98487af",
            "nCostOfRevenue": 100,
            "nProfitOfRevenue": -50,
            "dCreatedDate": "2023-03-15T05:44:23.555Z",
            "dUpdatedDate": "2023-03-15T05:59:49.433Z",
            "__v": 0
          }
        ]
      },
      {
        "_id": "64100b8ebf4e8e456c432501",
        "oCustomer": {
          "oInvoiceAddress": {
            "sStreet": "middlewerg",
            "sHouseNumber": "9a",
            "sPostalCode": "442001",
            "sCity": "Asperen",
            "sCountry": "Netherlands",
            "sCountryCode": "NL"
          },
          "oPhone": {
            "bWhatsApp": true,
            "sCountryCode": "+91",
            "sMobile": "9970149807",
            "sLandLine": "9970149807",
            "sFax": ""
          },
          "bCounter": false,
          "_id": "62420be55777d556346a9484",
          "sFirstName": "Jolmer",
          "sLastName": "Ekeren2",
          "sPrefix": "Van",
          "sGender": "male",
          "sVatNumber": "5896325",
          "sCocNumber": "",
          "sEmail": "Jolmerekeren02@gmail.com"
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A4508-140323-1122",
        "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
        "bImported": false,
        "aActivityItemMetaData": [],
        "iTransactionId": "64100b8ebf4e8e456c432500",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2023-03-14T05:52:14.248Z",
        "dUpdatedDate": "2023-03-14T06:12:57.487Z",
        "__v": 0,
        "activityItems": [
          {
            "_id": "64100b8ebf4e8e456c432506",
            "oType": {
              "bPrepayment": true,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "regular",
              "bDiscount": false
            },
            "oCustomer": {
              "oInvoiceAddress": {
                "sStreet": "middlewerg",
                "sHouseNumber": "9a",
                "sPostalCode": "442001",
                "sCity": "Asperen",
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              },
              "oPhone": {
                "bWhatsApp": true,
                "sCountryCode": "+91",
                "sMobile": "9970149807",
                "sLandLine": "9970149807",
                "sFax": ""
              },
              "bCounter": false,
              "_id": "62420be55777d556346a9484",
              "sFirstName": "Jolmer",
              "sLastName": "Ekeren2",
              "sPrefix": "Van",
              "sGender": "male",
              "sVatNumber": "5896325",
              "sCocNumber": "",
              "sEmail": "Jolmerekeren02@gmail.com"
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [
              "https://prismanote.s3.amazonaws.com/products/prisma-p1593-heren-horloge-edelstaal-licht-blauw.jpg",
              "https://prismanote.s3.amazonaws.com/products/prisma-p1593-heren-horloge-edelstaal-licht-blauw-schuin.jpg",
              "https://prismanote.s3.amazonaws.com/products/prisma-p1593-heren-horloge-edelstaal-licht-blauw-achterkant.jpg"
            ],
            "nSavingsPoints": 2,
            "bImported": false,
            "sProductName": "Prisma  P1593",
            "nPriceIncVat": 100,
            "nVatRate": 0,
            "nQuantity": 1,
            "sArticleNumber": "000159553",
            "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupId": "63971eb03bae4169a7f9d8be",
            "iArticleGroupOriginalId": "63971eb03bae4169a7f9d8be",
            "oArticleGroupMetaData": {
              "aProperty": [],
              "oName": {
                "nl": "Prisma",
                "en": "Prisma",
                "fr": "Prisma",
                "de": "Prisma",
                "es": "Prisma",
                "da": "Prisma"
              }
            },
            "nRefundAmount": 0,
            "iBusinessBrandId": "62b426627ee2c637cc3879d5",
            "iBusinessProductId": "63c7d879c4e5ad46a9f1e463",
            "iWorkstationId": "62cfa01063953715a759acbd",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b6d840ed1002890334456",
            "iSupplierId": "6275661d5732a79bf0e3f449",
            "sUniqueIdentifier": "19ad60d7-0423-4249-889c-067f210befb2",
            "nRevenueAmount": 10,
            "sDescription": "",
            "iTransactionId": "64100b8ebf4e8e456c432500",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "64100b8ebf4e8e456c432501",
            "aLog": [],
            "nTotalAmount": 100,
            "nPaidAmount": 25,
            "sNumber": "AI7054-140323-1122",
            "iTransactionItemId": "64101069bf4e8e456c432526",
            "nCostOfRevenue": 100,
            "nProfitOfRevenue": 0,
            "dCreatedDate": "2023-03-14T05:52:14.703Z",
            "dUpdatedDate": "2023-03-14T06:12:57.192Z",
            "__v": 0
          }
        ]
      },
      {
        "_id": "640b117ec97b8f2112605fc0",
        "oCustomer": {
          "_id": "62420be55777d556346a9484",
          "sSalutation": "Mr",
          "sFirstName": "Jolmer Edited",
          "sLastName": "Ekeren2",
          "sPrefix": "Van",
          "sEmail": "Jolmerekeren02@gmail.com",
          "sGender": "male",
          "sVatNumber": "5896325",
          "bCounter": false,
          "oPhone": {
            "bWhatsApp": true,
            "sCountryCode": "+91",
            "sMobile": "9970149807",
            "sLandLine": "9970149807",
            "sFax": ""
          },
          "oInvoiceAddress": {
            "sStreet": "middlewerg",
            "sHouseNumber": "9a",
            "sPostalCode": "442001",
            "sCity": "Asperen",
            "sCountry": "Netherlands",
            "sCountryCode": "NL"
          },
          "oShippingAddress": {
            "sCountry": "Netherlands",
            "sCountryCode": "NL"
          }
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A4446-100323-1646",
        "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
        "bImported": false,
        "aActivityItemMetaData": [],
        "iTransactionId": "640b117ec97b8f2112605fbf",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2023-03-10T11:16:14.205Z",
        "dUpdatedDate": "2023-03-10T11:48:04.762Z",
        "__v": 0,
        "activityItems": [
          {
            "_id": "640b1180c97b8f2112605fc5",
            "oType": {
              "bPrepayment": false,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "giftcard",
              "bDiscount": false
            },
            "oCustomer": {
              "_id": "62420be55777d556346a9484",
              "sSalutation": "Mr",
              "sFirstName": "Jolmer Edited",
              "sLastName": "Ekeren2",
              "sPrefix": "Van",
              "sEmail": "Jolmerekeren02@gmail.com",
              "sGender": "male",
              "sVatNumber": "5896325",
              "bCounter": false,
              "oPhone": {
                "bWhatsApp": true,
                "sCountryCode": "+91",
                "sMobile": "9970149807",
                "sLandLine": "9970149807",
                "sFax": ""
              },
              "oInvoiceAddress": {
                "sStreet": "middlewerg",
                "sHouseNumber": "9a",
                "sPostalCode": "442001",
                "sCity": "Asperen",
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              },
              "oShippingAddress": {
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              }
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [],
            "nSavingsPoints": 5,
            "bImported": false,
            "sProductName": "Voucher",
            "nPriceIncVat": 50,
            "nVatRate": 21,
            "nQuantity": 1,
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupId": "6409b8a91c8a5d3eafc3bcfc",
            "iArticleGroupOriginalId": "6409b8a91c8a5d3eafc3bcfc",
            "oArticleGroupMetaData": {
              "aProperty": [],
              "sCategory": "giftcard",
              "sSubCategory": "giftcard"
            },
            "sGiftCardNumber": "1678446955566",
            "nRefundAmount": 0,
            "iWorkstationId": "632ac16d10f3247770f75236",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b4f531d7d736c686b51f1",
            "sUniqueIdentifier": "0155e4f2-4de9-489f-9bf1-839d2cb7c3a1",
            "nRevenueAmount": 50,
            "sDescription": "",
            "sServicePartnerRemark": "",
            "sCommentVisibleServicePartner": "",
            "bGiftcardTaxHandling": true,
            "iTransactionId": "640b117ec97b8f2112605fbf",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "640b117ec97b8f2112605fc0",
            "iBusinessPartnerId": "6282aaabc3165b444f14dac9",
            "aLog": [],
            "nTotalAmount": 50,
            "nPaidAmount": 50,
            "sNumber": "AI6968-100323-1646",
            "iTransactionItemId": "640b1180c97b8f2112605fc4",
            "nCostOfRevenue": 41.32,
            "nProfitOfRevenue": 0.0023140495867792765,
            "dCreatedDate": "2023-03-10T11:16:16.390Z",
            "dUpdatedDate": "2023-03-10T11:48:04.765Z",
            "__v": 0
          },
          {
            "_id": "640b1180c97b8f2112605fc8",
            "oType": {
              "bPrepayment": false,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "giftcard",
              "bDiscount": false
            },
            "oCustomer": {
              "_id": "62420be55777d556346a9484",
              "sSalutation": "Mr",
              "sFirstName": "Jolmer Edited",
              "sLastName": "Ekeren2",
              "sPrefix": "Van",
              "sEmail": "Jolmerekeren02@gmail.com",
              "sGender": "male",
              "sVatNumber": "5896325",
              "bCounter": false,
              "oPhone": {
                "bWhatsApp": true,
                "sCountryCode": "+91",
                "sMobile": "9970149807",
                "sLandLine": "9970149807",
                "sFax": ""
              },
              "oInvoiceAddress": {
                "sStreet": "middlewerg",
                "sHouseNumber": "9a",
                "sPostalCode": "442001",
                "sCity": "Asperen",
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              },
              "oShippingAddress": {
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              }
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [],
            "nSavingsPoints": 2,
            "bImported": false,
            "sProductName": "Voucher",
            "nPriceIncVat": 20,
            "nVatRate": 21,
            "nQuantity": 1,
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupId": "6409b8a91c8a5d3eafc3bcfc",
            "iArticleGroupOriginalId": "6409b8a91c8a5d3eafc3bcfc",
            "oArticleGroupMetaData": {
              "aProperty": [],
              "sCategory": "giftcard",
              "sSubCategory": "giftcard"
            },
            "sGiftCardNumber": "1678446959887",
            "nRefundAmount": 0,
            "iWorkstationId": "632ac16d10f3247770f75236",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b4f531d7d736c686b51f1",
            "sUniqueIdentifier": "1d168384-5582-4179-a8a4-983fcfc0bfa2",
            "nRevenueAmount": 20,
            "sDescription": "",
            "sServicePartnerRemark": "",
            "sCommentVisibleServicePartner": "",
            "bGiftcardTaxHandling": true,
            "iTransactionId": "640b117ec97b8f2112605fbf",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "640b117ec97b8f2112605fc0",
            "iBusinessPartnerId": "6282aaabc3165b444f14dac9",
            "aLog": [],
            "nTotalAmount": 20,
            "nPaidAmount": 20,
            "sNumber": "AI6969-100323-1646",
            "iTransactionItemId": "640b1180c97b8f2112605fc7",
            "nCostOfRevenue": 16.53,
            "nProfitOfRevenue": -0.001074380165288602,
            "dCreatedDate": "2023-03-10T11:16:16.390Z",
            "dUpdatedDate": "2023-03-10T11:48:04.765Z",
            "__v": 0
          }
        ]
      },
      {
        "_id": "6409fe48a599351bdc22f06d",
        "oCustomer": {
          "_id": "62420be55777d556346a9484",
          "sSalutation": "Mr",
          "sFirstName": "Jolmer Edit",
          "sLastName": "Ekeren2",
          "sPrefix": "Van",
          "sEmail": "Jolmerekeren02@gmail.com",
          "sGender": "male",
          "sVatNumber": "5896325",
          "bCounter": false,
          "oPhone": {
            "bWhatsApp": true,
            "sCountryCode": "+91",
            "sMobile": "9970149807",
            "sLandLine": "9970149807",
            "sFax": ""
          },
          "oInvoiceAddress": {
            "sStreet": "middlewerg",
            "sHouseNumber": "9a",
            "sPostalCode": "442001",
            "sCity": "Asperen",
            "sCountry": "Netherlands",
            "sCountryCode": "NL"
          },
          "oShippingAddress": {
            "sCountry": "Netherlands",
            "sCountryCode": "NL"
          }
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A4385-090323-1642",
        "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
        "bImported": false,
        "aActivityItemMetaData": [],
        "iTransactionId": "6409fe48a599351bdc22f06c",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2023-03-09T15:42:00.944Z",
        "dUpdatedDate": "2023-03-09T16:00:13.293Z",
        "__v": 0,
        "activityItems": [
          {
            "_id": "6409fe49a599351bdc22f072",
            "oType": {
              "bPrepayment": true,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "regular",
              "bDiscount": false
            },
            "oCustomer": {
              "_id": "62420be55777d556346a9484",
              "sSalutation": "Mr",
              "sFirstName": "Jolmer Edit",
              "sLastName": "Ekeren2",
              "sPrefix": "Van",
              "sEmail": "Jolmerekeren02@gmail.com",
              "sGender": "male",
              "sVatNumber": "5896325",
              "bCounter": false,
              "oPhone": {
                "bWhatsApp": true,
                "sCountryCode": "+91",
                "sMobile": "9970149807",
                "sLandLine": "9970149807",
                "sFax": ""
              },
              "oInvoiceAddress": {
                "sStreet": "middlewerg",
                "sHouseNumber": "9a",
                "sPostalCode": "442001",
                "sCity": "Asperen",
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              },
              "oShippingAddress": {
                "sCountry": "Netherlands",
                "sCountryCode": "NL"
              }
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [
              "https://prismanote.s3.amazonaws.com/products/prisma-p1593-heren-horloge-edelstaal-licht-blauw.jpg",
              "https://prismanote.s3.amazonaws.com/products/prisma-p1593-heren-horloge-edelstaal-licht-blauw-schuin.jpg",
              "https://prismanote.s3.amazonaws.com/products/prisma-p1593-heren-horloge-edelstaal-licht-blauw-achterkant.jpg"
            ],
            "nSavingsPoints": 5,
            "bImported": false,
            "sProductName": "Prisma  P1593",
            "nPriceIncVat": 100,
            "nVatRate": 0,
            "nQuantity": 1,
            "sArticleNumber": "000159553",
            "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupId": "63971eb03bae4169a7f9d8be",
            "iArticleGroupOriginalId": "63971eb03bae4169a7f9d8be",
            "oArticleGroupMetaData": {
              "aProperty": [],
              "oName": {
                "nl": "Prisma",
                "en": "Prisma",
                "fr": "Prisma",
                "de": "Prisma",
                "es": "Prisma",
                "da": "Prisma"
              }
            },
            "nRefundAmount": 0,
            "iBusinessBrandId": "62b426627ee2c637cc3879d5",
            "iBusinessProductId": "63c7d879c4e5ad46a9f1e463",
            "iWorkstationId": "62cfa01063953715a759acbd",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b6d840ed1002890334456",
            "iSupplierId": "6275661d5732a79bf0e3f449",
            "sUniqueIdentifier": "17fda6c2-be36-43a3-bb43-2026252e8d13",
            "nRevenueAmount": 50,
            "sDescription": "",
            "iTransactionId": "6409fe48a599351bdc22f06c",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "6409fe48a599351bdc22f06d",
            "aLog": [],
            "nTotalAmount": 100,
            "nPaidAmount": 50,
            "sNumber": "AI6943-090323-1642",
            "iTransactionItemId": "6409fe48a599351bdc22f071",
            "nCostOfRevenue": 50,
            "nProfitOfRevenue": 0,
            "dCreatedDate": "2023-03-09T15:42:01.013Z",
            "dUpdatedDate": "2023-03-09T16:00:13.294Z",
            "__v": 0
          }
        ]
      },
      {
        "_id": "6401973f90268c23d8adf3b0",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A4176-030323-1214",
        "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
        "aActivityItemMetaData": [],
        "iTransactionId": "6401973f90268c23d8adf3af",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2023-03-03T06:44:15.100Z",
        "dUpdatedDate": "2023-03-03T06:45:53.343Z",
        "__v": 0,
        "activityItems": [
          {
            "_id": "6401973f90268c23d8adf3b5",
            "oType": {
              "bPrepayment": true,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "regular",
              "bDiscount": true
            },
            "oCustomer": {
              "oPhone": {
                "bWhatsApp": false
              },
              "bCounter": false
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [
              "https://prismanote.s3.amazonaws.com/products/prisma-p1593-heren-horloge-edelstaal-licht-blauw.jpg",
              "https://prismanote.s3.amazonaws.com/products/prisma-p1593-heren-horloge-edelstaal-licht-blauw-schuin.jpg",
              "https://prismanote.s3.amazonaws.com/products/prisma-p1593-heren-horloge-edelstaal-licht-blauw-achterkant.jpg"
            ],
            "nSavingsPoints": 1,
            "bImported": false,
            "sProductName": "Prisma  P1593",
            "nPriceIncVat": 100,
            "nVatRate": 21,
            "nQuantity": 2,
            "sArticleNumber": "000159553",
            "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupId": "63971eb03bae4169a7f9d8be",
            "iArticleGroupOriginalId": "63971eb03bae4169a7f9d8be",
            "oArticleGroupMetaData": {
              "aProperty": [],
              "oName": {
                "nl": "Prisma",
                "en": "Prisma",
                "fr": "Prisma",
                "de": "Prisma",
                "es": "Prisma",
                "da": "Prisma"
              }
            },
            "nRefundAmount": 0,
            "iBusinessBrandId": "62b426627ee2c637cc3879d5",
            "iBusinessProductId": "63c7d879c4e5ad46a9f1e463",
            "iWorkstationId": "62b47942503dcc27f84c6f7e",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b6d840ed1002890334456",
            "iSupplierId": "6275661d5732a79bf0e3f449",
            "sUniqueIdentifier": "88207605-ca7f-411b-a3fd-56f8e8837b27",
            "nRevenueAmount": 30,
            "sDescription": "",
            "iTransactionId": "6401973f90268c23d8adf3af",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "6401973f90268c23d8adf3b0",
            "aLog": [],
            "nTotalAmount": 200,
            "nPaidAmount": 30,
            "sNumber": "AI6662-030323-1214",
            "iTransactionItemId": "640197a090268c23d8adf3e6",
            "nCostOfRevenue": 12.396694214876034,
            "nProfitOfRevenue": 0,
            "dCreatedDate": "2023-03-03T06:44:15.786Z",
            "dUpdatedDate": "2023-03-03T06:45:53.015Z",
            "__v": 0
          },
          {
            "_id": "6401973f90268c23d8adf3b8",
            "oType": {
              "bPrepayment": true,
              "eTransactionType": "cash-registry",
              "bRefund": false,
              "eKind": "discount",
              "bDiscount": true
            },
            "oCustomer": {
              "oPhone": {
                "bWhatsApp": false
              },
              "bCounter": false
            },
            "eStatus": "y",
            "bIsRefunded": false,
            "eActivityItemStatus": "delivered",
            "eEstimatedDateAction": "call_on_ready",
            "aImage": [
              "https://prismanote.s3.amazonaws.com/products/prisma-p1593-heren-horloge-edelstaal-licht-blauw.jpg",
              "https://prismanote.s3.amazonaws.com/products/prisma-p1593-heren-horloge-edelstaal-licht-blauw-schuin.jpg",
              "https://prismanote.s3.amazonaws.com/products/prisma-p1593-heren-horloge-edelstaal-licht-blauw-achterkant.jpg"
            ],
            "nSavingsPoints": -4,
            "bImported": false,
            "sProductName": "Prisma  P1593",
            "nPriceIncVat": -30,
            "nVatRate": 21,
            "nQuantity": 2,
            "sArticleNumber": "000159553",
            "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
            "iBusinessId": "6182a52f1949ab0a59ff4e7b",
            "iArticleGroupId": "635bef4f420b7d0810f222c3",
            "iArticleGroupOriginalId": "63971eb03bae4169a7f9d8be",
            "oArticleGroupMetaData": {
              "aProperty": [],
              "oName": {
                "nl": "Prisma",
                "en": "Prisma",
                "fr": "Prisma",
                "de": "Prisma",
                "es": "Prisma",
                "da": "Prisma"
              },
              "sCategory": "Discount",
              "sSubCategory": "Discount"
            },
            "nRefundAmount": 0,
            "iBusinessBrandId": "62b426627ee2c637cc3879d5",
            "iBusinessProductId": "63c7d879c4e5ad46a9f1e463",
            "iWorkstationId": "62b47942503dcc27f84c6f7e",
            "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
            "iLocationId": "623b6d840ed1002890334456",
            "iSupplierId": "6275661d5732a79bf0e3f449",
            "sUniqueIdentifier": "88207605-ca7f-411b-a3fd-56f8e8837b27",
            "nRevenueAmount": -15,
            "sDescription": "",
            "iTransactionId": "6401973f90268c23d8adf3af",
            "iCustomerId": "62420be55777d556346a9484",
            "iActivityId": "6401973f90268c23d8adf3b0",
            "aLog": [],
            "nTotalAmount": -90,
            "nPaidAmount": -30,
            "sNumber": "AI6663-030323-1214",
            "iTransactionItemId": "6401973f90268c23d8adf3b7",
            "nCostOfRevenue": 0,
            "nProfitOfRevenue": 0,
            "dCreatedDate": "2023-03-03T06:44:15.788Z",
            "dUpdatedDate": "2023-03-03T06:44:15.788Z",
            "__v": 0
          }
        ]
      },
      {
        "_id": "63edf0125c0309a0511a7b3f",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A3620-160223-1427",
        "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
        "iTransactionId": "63edf0125c0309a0511a7b3e",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2023-02-16T08:57:54.640Z",
        "dUpdatedDate": "2023-02-16T08:57:54.640Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63e519caf8d35332dc0c024d",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A3467-090223-1705",
        "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
        "iTransactionId": "63e519caf8d35332dc0c024c",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2023-02-09T16:05:30.702Z",
        "dUpdatedDate": "2023-02-09T16:05:30.702Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63ca3dbb39581127588d2c5e",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A3299-200123-1237",
        "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
        "iTransactionId": "63ca3dbb39581127588d2c5d",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2023-01-20T07:07:39.675Z",
        "dUpdatedDate": "2023-01-20T07:07:39.675Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63c7ca473c5f72146df74eed",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A3285-180123-1600",
        "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
        "iTransactionId": "63c7ca473c5f72146df74eec",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2023-01-18T10:30:31.579Z",
        "dUpdatedDate": "2023-01-18T10:30:31.579Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63c5c660144f1955505796fe",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A3249-160123-2249",
        "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
        "iTransactionId": "63c5c660144f1955505796fd",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2023-01-16T21:49:20.065Z",
        "dUpdatedDate": "2023-01-16T21:49:20.065Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63c15d44b4ac6a0a44ef5d4a",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A3220-130123-1901",
        "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
        "iTransactionId": "63c15d44b4ac6a0a44ef5d49",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2023-01-13T13:31:48.149Z",
        "dUpdatedDate": "2023-01-13T13:31:48.149Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63b8017653080f03a0413304",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A3151-060123-1209",
        "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
        "iTransactionId": "63b8017653080f03a0413303",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2023-01-06T11:09:42.263Z",
        "dUpdatedDate": "2023-01-06T11:09:42.263Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63b454ab47deb7b7f8147968",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A3068-030123-1715",
        "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
        "iTransactionId": "63b454ab47deb7b7f8147967",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2023-01-03T16:15:39.634Z",
        "dUpdatedDate": "2023-01-03T16:15:39.634Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63b44be947deb7b7f8147786",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A3063-030123-1638",
        "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
        "iTransactionId": "63b44be947deb7b7f8147785",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2023-01-03T15:38:17.954Z",
        "dUpdatedDate": "2023-01-03T15:38:17.954Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63b4496347deb7b7f81476bc",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A3062-030123-1627",
        "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
        "iTransactionId": "63b4496347deb7b7f81476bb",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2023-01-03T15:27:31.866Z",
        "dUpdatedDate": "2023-01-03T15:27:31.866Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63b443e447deb7b7f8147595",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A3058-030123-1604",
        "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
        "iTransactionId": "63b443e447deb7b7f8147594",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2023-01-03T15:04:04.133Z",
        "dUpdatedDate": "2023-01-03T15:04:04.133Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63aa3178ee21da96bc3ca7ce",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2882-271222-0042",
        "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
        "iTransactionId": "63aa3178ee21da96bc3ca7cd",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-12-26T23:42:48.041Z",
        "dUpdatedDate": "2022-12-26T23:42:48.041Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6399b6e2bc9569c600d9c624",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2787-141222-1713",
        "iEmployeeId": "622b2dc336dfb8f45048adb2",
        "iTransactionId": "6399b6e2bc9569c600d9c623",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-12-14T11:43:30.826Z",
        "dUpdatedDate": "2022-12-14T11:43:30.826Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "639884c2996ae15c8116e3f6",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2772-131222-1927",
        "iEmployeeId": "622b2dc336dfb8f45048adb2",
        "iTransactionId": "639884c2996ae15c8116e3f5",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-12-13T13:57:22.785Z",
        "dUpdatedDate": "2022-12-13T13:57:22.785Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63988489d85a4859dff804ab",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2771-131222-1926",
        "iEmployeeId": "622b2dc336dfb8f45048adb2",
        "iTransactionId": "63988489d85a4859dff804aa",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-12-13T13:56:25.404Z",
        "dUpdatedDate": "2022-12-13T13:56:25.404Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "639882e633140bb25bc39855",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2770-131222-1919",
        "iEmployeeId": "622b2dc336dfb8f45048adb2",
        "iTransactionId": "639882e633140bb25bc39854",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-12-13T13:49:26.662Z",
        "dUpdatedDate": "2022-12-13T13:49:26.662Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "639881b733140bb25bc39824",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2769-131222-1914",
        "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
        "iTransactionId": "639881b733140bb25bc39823",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-12-13T13:44:23.852Z",
        "dUpdatedDate": "2022-12-13T13:44:23.852Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "639302ff77b4f847acbbc8ee",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2720-091222-1512",
        "iEmployeeId": "6331bad04e92918fc07f9a1b",
        "iTransactionId": "639302ff77b4f847acbbc8ed",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-12-09T09:42:23.177Z",
        "dUpdatedDate": "2022-12-09T09:42:23.177Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6391bafe77b4f847acbbc429",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2686-081222-1552",
        "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
        "iTransactionId": "6391bafe77b4f847acbbc428",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-12-08T10:22:54.975Z",
        "dUpdatedDate": "2022-12-08T10:22:54.975Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6377596f772a450a6048d08c",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2446-181122-1537",
        "iTransactionId": "6377596f772a450a6048d08b",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-18T10:07:43.317Z",
        "dUpdatedDate": "2022-11-18T10:07:43.317Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63769d40b106922f90790609",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2425-171122-2144",
        "iTransactionId": "63769d40b106922f90790608",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-17T20:44:48.412Z",
        "dUpdatedDate": "2022-11-17T20:44:48.412Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6374eca43a4f2a25c0b84cf7",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2383-161122-1459",
        "iTransactionId": "6374eca43a4f2a25c0b84cf6",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T13:59:00.346Z",
        "dUpdatedDate": "2022-11-16T13:59:00.346Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6374ec0a3a4f2a25c0b84ccb",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2382-161122-1456",
        "iTransactionId": "6374ec0a3a4f2a25c0b84cca",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T13:56:26.437Z",
        "dUpdatedDate": "2022-11-16T13:56:26.437Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6374ebe33a4f2a25c0b84c9f",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2381-161122-1455",
        "iTransactionId": "6374ebe33a4f2a25c0b84c9e",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T13:55:47.722Z",
        "dUpdatedDate": "2022-11-16T13:55:47.722Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6374ea8b3a4f2a25c0b84bc3",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2377-161122-1450",
        "iTransactionId": "6374ea8b3a4f2a25c0b84bc2",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T13:50:03.054Z",
        "dUpdatedDate": "2022-11-16T13:50:03.054Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6374ea5e3a4f2a25c0b84ba3",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2376-161122-1449",
        "iTransactionId": "6374ea5e3a4f2a25c0b84ba2",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T13:49:18.191Z",
        "dUpdatedDate": "2022-11-16T13:49:18.191Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6374ea283a4f2a25c0b84b6c",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2375-161122-1448",
        "iTransactionId": "6374ea283a4f2a25c0b84b6b",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T13:48:24.260Z",
        "dUpdatedDate": "2022-11-16T13:48:24.260Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6374e9b83a4f2a25c0b84b33",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2374-161122-1446",
        "iTransactionId": "6374e9b83a4f2a25c0b84b32",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T13:46:32.540Z",
        "dUpdatedDate": "2022-11-16T13:46:32.540Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6374ccb93a4f2a25c0b84944",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2360-161122-1242",
        "iTransactionId": "6374ccb93a4f2a25c0b84943",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T11:42:49.924Z",
        "dUpdatedDate": "2022-11-16T11:42:49.924Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6374cc5f3a4f2a25c0b84916",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2359-161122-1241",
        "iTransactionId": "6374cc5f3a4f2a25c0b84915",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T11:41:19.378Z",
        "dUpdatedDate": "2022-11-16T11:41:19.378Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6374cbb93a4f2a25c0b848d2",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2358-161122-1238",
        "iTransactionId": "6374cbb93a4f2a25c0b848d1",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T11:38:33.034Z",
        "dUpdatedDate": "2022-11-16T11:38:33.034Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "637482f64a7210361cbfadcf",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2350-161122-1158",
        "iTransactionId": "637482f64a7210361cbfadce",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T06:28:06.829Z",
        "dUpdatedDate": "2022-11-16T06:28:06.829Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6374812f4a7210361cbfadaa",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2349-161122-1150",
        "iTransactionId": "6374812f4a7210361cbfada9",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T06:20:31.287Z",
        "dUpdatedDate": "2022-11-16T06:20:31.287Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6374806b4a7210361cbfad7c",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2348-161122-1147",
        "iTransactionId": "6374806b4a7210361cbfad7b",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T06:17:15.404Z",
        "dUpdatedDate": "2022-11-16T06:17:15.404Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63747ef74a7210361cbfad4e",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2347-161122-1141",
        "iTransactionId": "63747ef74a7210361cbfad4d",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T06:11:03.985Z",
        "dUpdatedDate": "2022-11-16T06:11:03.985Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63747e304a7210361cbfad09",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2345-161122-1137",
        "iTransactionId": "63747e304a7210361cbfad08",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T06:07:44.913Z",
        "dUpdatedDate": "2022-11-16T06:07:44.913Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63747d7d4a7210361cbfacd8",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2344-161122-1134",
        "iTransactionId": "63747d7d4a7210361cbfacd7",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T06:04:45.820Z",
        "dUpdatedDate": "2022-11-16T06:04:45.820Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63747d254a7210361cbfac9e",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2343-161122-1133",
        "iTransactionId": "63747d254a7210361cbfac9d",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T06:03:17.754Z",
        "dUpdatedDate": "2022-11-16T06:03:17.754Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63747cb94a7210361cbfac64",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2342-161122-1131",
        "iTransactionId": "63747cb94a7210361cbfac63",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T06:01:29.712Z",
        "dUpdatedDate": "2022-11-16T06:01:29.712Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "637478724a7210361cbfac20",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2341-161122-1113",
        "iTransactionId": "637478724a7210361cbfac1f",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T05:43:14.461Z",
        "dUpdatedDate": "2022-11-16T05:43:14.461Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "637475ef4a7210361cbfabe6",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2340-161122-1102",
        "iTransactionId": "637475ef4a7210361cbfabe5",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T05:32:31.291Z",
        "dUpdatedDate": "2022-11-16T05:32:31.291Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "637473744a7210361cbfabac",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2339-161122-1051",
        "iTransactionId": "637473744a7210361cbfabab",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T05:21:56.060Z",
        "dUpdatedDate": "2022-11-16T05:21:56.060Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "637472984a7210361cbfab76",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2338-161122-1048",
        "iTransactionId": "637472984a7210361cbfab75",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T05:18:16.107Z",
        "dUpdatedDate": "2022-11-16T05:18:16.107Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6374704e4a7210361cbfab3a",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2337-161122-1038",
        "iTransactionId": "6374704e4a7210361cbfab39",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T05:08:30.269Z",
        "dUpdatedDate": "2022-11-16T05:08:30.269Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "637470354a7210361cbfab13",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2336-161122-1038",
        "iTransactionId": "637470354a7210361cbfab12",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T05:08:05.748Z",
        "dUpdatedDate": "2022-11-16T05:08:05.748Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63746ed54a7210361cbfaaa8",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2333-161122-1032",
        "iTransactionId": "63746ed54a7210361cbfaaa7",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T05:02:13.427Z",
        "dUpdatedDate": "2022-11-16T05:02:13.427Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63746d6a4a7210361cbfaa67",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2332-161122-1026",
        "iTransactionId": "63746d6a4a7210361cbfaa66",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T04:56:10.581Z",
        "dUpdatedDate": "2022-11-16T04:56:10.581Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63746cb64a7210361cbfaa2f",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2331-161122-1023",
        "iTransactionId": "63746cb64a7210361cbfaa2e",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T04:53:10.772Z",
        "dUpdatedDate": "2022-11-16T04:53:10.772Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63746bc24a7210361cbfa9f9",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2330-161122-1019",
        "iTransactionId": "63746bc24a7210361cbfa9f8",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T04:49:06.281Z",
        "dUpdatedDate": "2022-11-16T04:49:06.281Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6374684d4a7210361cbfa9bf",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2329-161122-1004",
        "iTransactionId": "6374684d4a7210361cbfa9be",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T04:34:21.646Z",
        "dUpdatedDate": "2022-11-16T04:34:21.646Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "637466434a7210361cbfa99a",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2328-161122-0955",
        "iTransactionId": "637466434a7210361cbfa999",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-16T04:25:39.909Z",
        "dUpdatedDate": "2022-11-16T04:25:39.909Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63736ee925716404aca5e270",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2296-151122-1620",
        "iTransactionId": "63736ee925716404aca5e26f",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-15T10:50:17.064Z",
        "dUpdatedDate": "2022-11-15T10:50:17.064Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63736aa025716404aca5e215",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2289-151122-1602",
        "iTransactionId": "63736aa025716404aca5e214",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-15T10:32:00.802Z",
        "dUpdatedDate": "2022-11-15T10:32:00.802Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6372cd3f5e2a751670191fee",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2247-151122-0020",
        "iTransactionId": "6372cd3f5e2a751670191fed",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-14T23:20:31.581Z",
        "dUpdatedDate": "2022-11-14T23:20:31.581Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "636fb6a6f87823603873237a",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2220-121122-1607",
        "iTransactionId": "636fb6a6f878236038732379",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-12T15:07:18.240Z",
        "dUpdatedDate": "2022-11-12T15:07:18.240Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "636fb67af87823603873233c",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2219-121122-1606",
        "iTransactionId": "636fb67af87823603873233b",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-12T15:06:34.736Z",
        "dUpdatedDate": "2022-11-12T15:06:34.736Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "636fb455f8782360387322bf",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2218-121122-1557",
        "iTransactionId": "636fb455f8782360387322be",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-12T14:57:25.203Z",
        "dUpdatedDate": "2022-11-12T14:57:25.203Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "636fb395f87823603873229a",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2217-121122-1554",
        "iTransactionId": "636fb395f878236038732299",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-12T14:54:13.178Z",
        "dUpdatedDate": "2022-11-12T14:54:13.178Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "636fb342f878236038732275",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2216-121122-1552",
        "iTransactionId": "636fb342f878236038732274",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-12T14:52:50.848Z",
        "dUpdatedDate": "2022-11-12T14:52:50.848Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "636fb2eff87823603873224a",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2215-121122-1551",
        "iTransactionId": "636fb2eff878236038732249",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-12T14:51:27.618Z",
        "dUpdatedDate": "2022-11-12T14:51:27.618Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "636fac17f8782360387321c6",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2214-121122-1522",
        "iTransactionId": "636fac17f8782360387321c5",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-12T14:22:15.354Z",
        "dUpdatedDate": "2022-11-12T14:22:15.354Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "636e09f313e8ab7c0c858f0f",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2194-111122-0938",
        "iTransactionId": "636e09f313e8ab7c0c858f0e",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-11T08:38:11.210Z",
        "dUpdatedDate": "2022-11-11T08:38:11.210Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "636e06b413e8ab7c0c858e5d",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2192-111122-0924",
        "iTransactionId": "636e06b413e8ab7c0c858e5c",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-11T08:24:20.497Z",
        "dUpdatedDate": "2022-11-11T08:24:20.497Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "636b81a092ddbaf382d57db9",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A2124-091122-1601",
        "iTransactionId": "636b81a092ddbaf382d57db8",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-09T10:32:00.556Z",
        "dUpdatedDate": "2022-11-09T10:32:00.556Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63611cae0dc83774a0e9375b",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1889-011122-1418",
        "iTransactionId": "63611cae0dc83774a0e9375a",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-01T13:18:38.942Z",
        "dUpdatedDate": "2022-11-01T13:18:38.942Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6360c75c6790e81223c40873",
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1880-011122-1244",
        "iTransactionId": "6360c75c6790e81223c40872",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-01T07:14:36.729Z",
        "dUpdatedDate": "2022-11-01T07:14:36.729Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6360c6666790e81223c40835",
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1879-011122-1240",
        "iTransactionId": "6360c6666790e81223c40834",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-11-01T07:10:30.232Z",
        "dUpdatedDate": "2022-11-01T07:10:30.232Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63602dd00dc83774a0e934f3",
        "oCustomer": {
          "oPhone": {
            "bWhatsApp": false
          },
          "bCounter": false
        },
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623c1f1b6c63de032cfde065",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1873-311022-2119",
        "iTransactionId": "63602dd00dc83774a0e934f2",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-10-31T20:19:28.604Z",
        "dUpdatedDate": "2022-10-31T20:19:28.604Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "635faa1ec6d8810958f03118",
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1859-311022-1627",
        "iTransactionId": "635faa1ec6d8810958f03117",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-10-31T10:57:34.318Z",
        "dUpdatedDate": "2022-10-31T10:57:34.318Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "635fa917c6d8810958f030dc",
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1857-311022-1623",
        "iTransactionId": "635fa917c6d8810958f030db",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-10-31T10:53:11.521Z",
        "dUpdatedDate": "2022-10-31T10:53:11.521Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "635c2527d04891620cbdbf62",
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1833-281022-2053",
        "iTransactionId": "635c2527d04891620cbdbf61",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-10-28T18:53:27.770Z",
        "dUpdatedDate": "2022-10-28T18:53:27.770Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "635c2287d04891620cbdbf38",
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1832-281022-2042",
        "iTransactionId": "635c2287d04891620cbdbf37",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-10-28T18:42:15.435Z",
        "dUpdatedDate": "2022-10-28T18:42:15.435Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "635c2203d04891620cbdbf08",
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1831-281022-2040",
        "iTransactionId": "635c2203d04891620cbdbf07",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-10-28T18:40:03.154Z",
        "dUpdatedDate": "2022-10-28T18:40:03.154Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "635ba45709b925411899870c",
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1802-281022-1513",
        "iTransactionId": "635ba45709b925411899870b",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-10-28T09:43:51.389Z",
        "dUpdatedDate": "2022-10-28T09:43:51.389Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "635b9a4e09b9254118998679",
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1798-281022-1431",
        "iTransactionId": "635b9a4e09b9254118998678",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-10-28T09:01:02.849Z",
        "dUpdatedDate": "2022-10-28T09:01:02.849Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6357ed085344499178b1d0fc",
        "aActivityItemType": [],
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1791-251022-1604",
        "iTransactionId": "6357ed085344499178b1d0fb",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-10-25T14:04:56.516Z",
        "dUpdatedDate": "2022-10-25T14:04:56.516Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "634ff5d510919dbbbe92e621",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1724-191022-1834",
        "iTransactionId": "634ff5d510919dbbbe92e620",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-10-19T13:04:21.017Z",
        "dUpdatedDate": "2022-10-19T13:04:21.017Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "634954dc8250045984edeb63",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1678-141022-1423",
        "iTransactionId": "634954dc8250045984edeb62",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-10-14T12:23:56.834Z",
        "dUpdatedDate": "2022-10-14T12:23:56.834Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6343be37d2cd7b772cc6fbed",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1631-101022-0839",
        "iTransactionId": "6343be37d2cd7b772cc6fbec",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-10-10T06:39:51.851Z",
        "dUpdatedDate": "2022-10-10T06:39:51.851Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63401a5b5a265131006dda7b",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1627-071022-1753",
        "iTransactionId": "63401a5b5a265131006dda7a",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-10-07T12:23:55.723Z",
        "dUpdatedDate": "2022-10-07T12:23:55.723Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6332bd040286494d78999e4d",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1557-270922-1436",
        "iTransactionId": "6332bd040286494d78999e4c",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-27T09:06:12.262Z",
        "dUpdatedDate": "2022-09-27T09:06:12.262Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63317645bebdac7b50ff4fed",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1516-260922-1522",
        "iTransactionId": "63317645bebdac7b50ff4fec",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-26T09:52:05.722Z",
        "dUpdatedDate": "2022-09-26T09:52:05.722Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6331674bbebdac7b50ff4fc6",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1515-260922-1418",
        "iTransactionId": "6331674bbebdac7b50ff4fc5",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-26T08:48:11.390Z",
        "dUpdatedDate": "2022-09-26T08:48:11.390Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6329aef89e6ab162449f30b8",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1476-200922-1415",
        "iTransactionId": "6329aef89e6ab162449f30b7",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-20T12:15:52.144Z",
        "dUpdatedDate": "2022-09-20T12:15:52.144Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63247109c1cf31eb98b8c755",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1452-160922-1820",
        "iTransactionId": "63247109c1cf31eb98b8c754",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-16T12:50:17.080Z",
        "dUpdatedDate": "2022-09-16T12:50:17.080Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63246e96bcb209e86c7cbcd2",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1451-160922-1809",
        "iTransactionId": "63246e96bcb209e86c7cbcd1",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-16T12:39:50.484Z",
        "dUpdatedDate": "2022-09-16T12:39:50.484Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63246d8abcb209e86c7cbc8f",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1450-160922-1805",
        "iTransactionId": "63246d8abcb209e86c7cbc8e",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-16T12:35:22.111Z",
        "dUpdatedDate": "2022-09-16T12:35:22.111Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63246be4bcb209e86c7cbc38",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1449-160922-1758",
        "iTransactionId": "63246be4bcb209e86c7cbc37",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-16T12:28:20.957Z",
        "dUpdatedDate": "2022-09-16T12:28:20.957Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6324491230e1bbd3ec07cd9f",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1447-160922-1529",
        "iTransactionId": "6324491230e1bbd3ec07cd9e",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-16T09:59:46.186Z",
        "dUpdatedDate": "2022-09-16T09:59:46.186Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "632446db82aa5cd1bed97c90",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1446-160922-1520",
        "iTransactionId": "632446db82aa5cd1bed97c8f",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-16T09:50:19.164Z",
        "dUpdatedDate": "2022-09-16T09:50:19.164Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "632441a106d56fc9e3bb4fb4",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1445-160922-1458",
        "iTransactionId": "632441a106d56fc9e3bb4fb3",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-16T09:28:01.897Z",
        "dUpdatedDate": "2022-09-16T09:28:01.897Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63242ff4f3df27444825e587",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1441-160922-1012",
        "iTransactionId": "63242ff4f3df27444825e586",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-16T08:12:36.902Z",
        "dUpdatedDate": "2022-09-16T08:12:36.902Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63242ed6f3df27444825e569",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1440-160922-1007",
        "iTransactionId": "63242ed6f3df27444825e568",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-16T08:07:50.785Z",
        "dUpdatedDate": "2022-09-16T08:07:50.785Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "632411594c2098bc52aa31db",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1438-160922-1132",
        "iTransactionId": "632411594c2098bc52aa31da",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-16T06:02:01.713Z",
        "dUpdatedDate": "2022-09-16T06:02:01.713Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6324069d4e32f6b93bf6b938",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1437-160922-1046",
        "iTransactionId": "6324069d4e32f6b93bf6b937",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-16T05:16:13.372Z",
        "dUpdatedDate": "2022-09-16T05:16:13.372Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "632402acddc642b333b7ddb8",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1436-160922-1029",
        "iTransactionId": "632402acddc642b333b7ddb7",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-16T04:59:24.512Z",
        "dUpdatedDate": "2022-09-16T04:59:24.512Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "632395f233949d5db0f9664b",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1435-150922-2315",
        "iTransactionId": "632395f233949d5db0f9664a",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-15T21:15:30.800Z",
        "dUpdatedDate": "2022-09-15T21:15:30.800Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6323942ff6fd7e4ad82acd0c",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1434-150922-2307",
        "iTransactionId": "6323942ff6fd7e4ad82acd0b",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-15T21:07:59.621Z",
        "dUpdatedDate": "2022-09-15T21:07:59.621Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "632393b2f6fd7e4ad82accec",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1433-150922-2305",
        "iTransactionId": "632393b2f6fd7e4ad82acceb",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-15T21:05:54.536Z",
        "dUpdatedDate": "2022-09-15T21:05:54.536Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63239251f6fd7e4ad82accb1",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1432-150922-2300",
        "iTransactionId": "63239251f6fd7e4ad82accb0",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-15T21:00:01.551Z",
        "dUpdatedDate": "2022-09-15T21:00:01.551Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6323914c2358a952f8553ed0",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1431-150922-2255",
        "iTransactionId": "6323914c2358a952f8553ecf",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-15T20:55:40.992Z",
        "dUpdatedDate": "2022-09-15T20:55:40.992Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "632325392358a952f8553dad",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1428-150922-1514",
        "iTransactionId": "632325392358a952f8553dac",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-15T13:14:33.849Z",
        "dUpdatedDate": "2022-09-15T13:14:33.849Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "632324e32358a952f8553d87",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1427-150922-1513",
        "iTransactionId": "632324e32358a952f8553d86",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-15T13:13:07.418Z",
        "dUpdatedDate": "2022-09-15T13:13:07.418Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "632247e33489994760ca453a",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1417-140922-2330",
        "iTransactionId": "632247e33489994760ca4539",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-14T21:30:11.014Z",
        "dUpdatedDate": "2022-09-14T21:30:11.014Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6322391c3489994760ca44e0",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1416-140922-2227",
        "iTransactionId": "6322391c3489994760ca44df",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-14T20:27:08.424Z",
        "dUpdatedDate": "2022-09-14T20:27:08.424Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "631f0167ecd22518ec0cbd41",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1280-120922-1522",
        "iTransactionId": "631f0167ecd22518ec0cbd40",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-12T09:52:39.521Z",
        "dUpdatedDate": "2022-09-12T09:52:39.521Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "631ed7bbaa630214f082b47e",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1262-120922-1224",
        "iTransactionId": "631ed7bbaa630214f082b47d",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-12T06:54:51.142Z",
        "dUpdatedDate": "2022-09-12T06:54:51.142Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "631ed75faa630214f082b464",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1261-120922-1223",
        "iTransactionId": "631ed75faa630214f082b463",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-12T06:53:19.057Z",
        "dUpdatedDate": "2022-09-12T06:53:19.057Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "631ed0e2aa630214f082b440",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1260-120922-1155",
        "iTransactionId": "631ed0e2aa630214f082b43f",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-12T06:25:38.831Z",
        "dUpdatedDate": "2022-09-12T06:25:38.831Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "631b3d338605d10960f9a0cb",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1258-090922-1848",
        "iTransactionId": "631b3d338605d10960f9a0ca",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-09T13:18:43.846Z",
        "dUpdatedDate": "2022-09-09T13:18:43.846Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "631b396d8605d10960f9a0a9",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1254-090922-1832",
        "iTransactionId": "631b396d8605d10960f9a0a8",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-09T13:02:37.635Z",
        "dUpdatedDate": "2022-09-09T13:02:37.635Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "631ad9d12854bf4e6615e9eb",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1229-090922-1144",
        "iTransactionId": "631ad9d12854bf4e6615e9ea",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-09T06:14:41.022Z",
        "dUpdatedDate": "2022-09-09T06:14:41.022Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "631ad87aed1a65214a56b5c6",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1228-090922-1138",
        "iTransactionId": "631ad87aed1a65214a56b5c5",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-09T06:08:58.761Z",
        "dUpdatedDate": "2022-09-09T06:08:58.761Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "631a6ec502af2c057816aee8",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1227-090922-0037",
        "iTransactionId": "631a6ec502af2c057816aee7",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-08T22:37:57.827Z",
        "dUpdatedDate": "2022-09-08T22:37:57.827Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "631919f6dd58bb552c3408db",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1118-080922-0023",
        "iTransactionId": "631919f6dd58bb552c3408da",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-07T22:23:50.358Z",
        "dUpdatedDate": "2022-09-07T22:23:50.358Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "631916d3dd58bb552c340814",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1113-080922-0010",
        "iTransactionId": "631916d3dd58bb552c340813",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-07T22:10:27.333Z",
        "dUpdatedDate": "2022-09-07T22:10:27.333Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6318ade456d3ca5a4c091900",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1112-070922-1642",
        "iTransactionId": "6318ade456d3ca5a4c0918ff",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-07T14:42:44.627Z",
        "dUpdatedDate": "2022-09-07T14:42:44.627Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6318a56e56d3ca5a4c09188a",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1110-070922-1606",
        "iTransactionId": "6318a56e56d3ca5a4c091889",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-07T14:06:38.745Z",
        "dUpdatedDate": "2022-09-07T14:06:38.745Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63173e1bb59f0f2c849b0443",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1085-060922-1433",
        "iTransactionId": "63173e1bb59f0f2c849b0442",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-06T12:33:31.625Z",
        "dUpdatedDate": "2022-09-06T12:33:31.625Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63173892b59f0f2c849b041e",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1084-060922-1409",
        "iTransactionId": "63173892b59f0f2c849b041d",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-06T12:09:54.559Z",
        "dUpdatedDate": "2022-09-06T12:09:54.559Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "631722db199e2b4d88bfb344",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1083-060922-1237",
        "iTransactionId": "631722db199e2b4d88bfb343",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-06T10:37:15.224Z",
        "dUpdatedDate": "2022-09-06T10:37:15.224Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6317199c199e2b4d88bfb2c4",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1081-060922-1157",
        "iTransactionId": "6317199c199e2b4d88bfb2c3",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-06T09:57:48.234Z",
        "dUpdatedDate": "2022-09-06T09:57:48.234Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6316120cd4c51373a4c56f90",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1068-050922-1713",
        "iTransactionId": "6316120cd4c51373a4c56f8f",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-05T15:13:16.179Z",
        "dUpdatedDate": "2022-09-05T15:13:16.179Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63160ca9d4c51373a4c56f47",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1066-050922-1650",
        "iTransactionId": "63160ca9d4c51373a4c56f46",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-05T14:50:17.057Z",
        "dUpdatedDate": "2022-09-05T14:50:17.057Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63160c76d4c51373a4c56f27",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1065-050922-1649",
        "iTransactionId": "63160c76d4c51373a4c56f26",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-05T14:49:26.180Z",
        "dUpdatedDate": "2022-09-05T14:49:26.180Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6315e8d756cf235aa42f17c4",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1060-050922-1417",
        "iTransactionId": "6315e8d756cf235aa42f17c3",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-05T12:17:27.810Z",
        "dUpdatedDate": "2022-09-05T12:17:27.810Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "631220741ca4b24868a784ad",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1054-020922-1725",
        "iTransactionId": "631220741ca4b24868a784ac",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-02T15:25:40.766Z",
        "dUpdatedDate": "2022-09-02T15:25:40.766Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6311e806b08411773ea0176a",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1053-020922-1654",
        "iTransactionId": "6311e806b08411773ea01769",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-02T11:24:54.104Z",
        "dUpdatedDate": "2022-09-02T11:24:54.104Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6311ca6cb26eac669282b62f",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1051-020922-1448",
        "iTransactionId": "6311ca6cb26eac669282b62e",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-02T09:18:36.995Z",
        "dUpdatedDate": "2022-09-02T09:18:36.995Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63110bb965b44d44603bc9a9",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1026-010922-2144",
        "iTransactionId": "63110bb965b44d44603bc9a8",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-01T19:44:57.187Z",
        "dUpdatedDate": "2022-09-01T19:44:57.187Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6311090f65b44d44603bc96e",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1024-010922-2133",
        "iTransactionId": "6311090f65b44d44603bc96d",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-01T19:33:35.374Z",
        "dUpdatedDate": "2022-09-01T19:33:35.374Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6311084765b44d44603bc90c",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1021-010922-2130",
        "iTransactionId": "6311084765b44d44603bc90b",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-01T19:30:15.060Z",
        "dUpdatedDate": "2022-09-01T19:30:15.060Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6310bb6a9288ed55cc36babc",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1018-010922-1602",
        "iTransactionId": "6310bb6a9288ed55cc36babb",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-01T14:02:18.575Z",
        "dUpdatedDate": "2022-09-01T14:02:18.575Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6310baf49288ed55cc36ba97",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A1017-010922-1600",
        "iTransactionId": "6310baf49288ed55cc36ba96",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-09-01T14:00:20.735Z",
        "dUpdatedDate": "2022-09-01T14:00:20.735Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "630e80656c9cc35e1cc25c59",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0998-300822-2325",
        "iTransactionId": "630e80656c9cc35e1cc25c58",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-30T21:25:57.878Z",
        "dUpdatedDate": "2022-08-30T21:25:57.878Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "630c962615340807ef9db5e5",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0986-290822-1604",
        "iTransactionId": "630c962615340807ef9db5e4",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-29T10:34:14.481Z",
        "dUpdatedDate": "2022-08-29T10:34:14.481Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "630c9430308c535ee8fdefb7",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0984-290822-1225",
        "iTransactionId": "630c9430308c535ee8fdefb6",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-29T10:25:52.906Z",
        "dUpdatedDate": "2022-08-29T10:25:52.906Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "630c92125a15e7ff90877c13",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0983-290822-1546",
        "iTransactionId": "630c92125a15e7ff90877c12",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-29T10:16:50.041Z",
        "dUpdatedDate": "2022-08-29T10:16:50.041Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63052474f64cec0a04893913",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0933-230822-2103",
        "iTransactionId": "63052474f64cec0a04893912",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-23T19:03:16.214Z",
        "dUpdatedDate": "2022-08-23T19:03:16.214Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63052423f64cec0a048938f0",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0932-230822-2101",
        "iTransactionId": "63052423f64cec0a048938ef",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-23T19:01:55.368Z",
        "dUpdatedDate": "2022-08-23T19:01:55.368Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "63052397f64cec0a048938aa",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0930-230822-2059",
        "iTransactionId": "63052397f64cec0a048938a9",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-23T18:59:35.412Z",
        "dUpdatedDate": "2022-08-23T18:59:35.412Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6304bcb08dc6b1ca830b9220",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0929-230822-1710",
        "iTransactionId": "6304bcb08dc6b1ca830b921f",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-23T11:40:32.680Z",
        "dUpdatedDate": "2022-08-23T11:40:32.680Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6304baf68dc6b1ca830b91fa",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0927-230822-1703",
        "iTransactionId": "6304baf68dc6b1ca830b91f9",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-23T11:33:10.548Z",
        "dUpdatedDate": "2022-08-23T11:33:10.548Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "6303948d67bd339ad0d1b76f",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0912-220822-1637",
        "iTransactionId": "6303948d67bd339ad0d1b76e",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-22T14:37:01.534Z",
        "dUpdatedDate": "2022-08-22T14:37:01.534Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "630357d6e56f4b67401872e2",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "sNumber": "A0905-220822-1547",
        "iTransactionId": "630357d6e56f4b67401872e1",
        "eType": "webshop-reservation",
        "dCreatedDate": "2022-08-22T10:17:58.437Z",
        "dUpdatedDate": "2022-08-22T10:17:58.437Z",
        "__v": 0,
        "iCustomerId": "62420be55777d556346a9484",
        "activityItems": []
      },
      {
        "_id": "62ff7791a5db7127a0daaa07",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0899-190822-1344",
        "iTransactionId": "62ff7791a5db7127a0daaa06",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-19T11:44:17.407Z",
        "dUpdatedDate": "2022-08-19T11:44:17.407Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62ff4e99d965aa8e98645f9b",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0898-190822-1049",
        "iTransactionId": "62ff4e99d965aa8e98645f9a",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-19T08:49:29.165Z",
        "dUpdatedDate": "2022-08-19T08:49:29.165Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62f4fffc89c28c1ac856caa8",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0862-110822-1511",
        "iTransactionId": "62f4fffc89c28c1ac856caa7",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-11T13:11:24.658Z",
        "dUpdatedDate": "2022-08-11T13:11:24.658Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62f4ffd589c28c1ac856ca86",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0861-110822-1510",
        "iTransactionId": "62f4ffd589c28c1ac856ca85",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-11T13:10:45.093Z",
        "dUpdatedDate": "2022-08-11T13:10:45.093Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62f4ff3d89c28c1ac856ca35",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0858-110822-1508",
        "iTransactionId": "62f4ff3d89c28c1ac856ca34",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-11T13:08:13.777Z",
        "dUpdatedDate": "2022-08-11T13:08:13.777Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62f4c40f11b57069ec69132e",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0844-110822-1425",
        "iTransactionId": "62f4c40f11b57069ec69132d",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-11T08:55:43.597Z",
        "dUpdatedDate": "2022-08-11T08:55:43.597Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62f4c26a6f53132e1455734d",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0843-110822-1048",
        "iTransactionId": "62f4c26a6f53132e1455734c",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-11T08:48:42.319Z",
        "dUpdatedDate": "2022-08-11T08:48:42.319Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62f48cf981fd3a59af59f7f0",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0842-110822-1030",
        "iTransactionId": "62f48cf981fd3a59af59f7ef",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-11T05:00:41.264Z",
        "dUpdatedDate": "2022-08-11T05:00:41.264Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62f266a89bcb76b7e8c4122e",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0837-090822-1552",
        "iTransactionId": "62f266a89bcb76b7e8c4122d",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-09T13:52:40.456Z",
        "dUpdatedDate": "2022-08-09T13:52:40.456Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62f265369bcb76b7e8c411e9",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0836-090822-1546",
        "iTransactionId": "62f265369bcb76b7e8c411e8",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-09T13:46:30.480Z",
        "dUpdatedDate": "2022-08-09T13:46:30.480Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62f264859bcb76b7e8c411b7",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0835-090822-1543",
        "iTransactionId": "62f264859bcb76b7e8c411b6",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-09T13:43:33.615Z",
        "dUpdatedDate": "2022-08-09T13:43:33.615Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62f0aa33364743b39ce680b7",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0824-080822-0816",
        "iTransactionId": "62f0aa33364743b39ce680b6",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-08T06:16:19.112Z",
        "dUpdatedDate": "2022-08-08T06:16:19.112Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62f0a287364743b39ce68036",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0821-080822-0743",
        "iTransactionId": "62f0a287364743b39ce68035",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-08T05:43:35.440Z",
        "dUpdatedDate": "2022-08-08T05:43:35.440Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62f09c6e1765baada4567636",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0820-080822-0717",
        "iTransactionId": "62f09c6e1765baada4567635",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-08T05:17:34.385Z",
        "dUpdatedDate": "2022-08-08T05:17:34.385Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62f09bff1765baada4567622",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0819-080822-0715",
        "iTransactionId": "62f09bff1765baada4567621",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-08T05:15:43.514Z",
        "dUpdatedDate": "2022-08-08T05:15:43.514Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62ebe93ebe565f497054ab0d",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0814-040822-1743",
        "iTransactionId": "62ebe93ebe565f497054ab0c",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-04T15:43:58.968Z",
        "dUpdatedDate": "2022-08-04T15:43:58.968Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62eb740a54393773368ee8b4",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0805-040822-1253",
        "iTransactionId": "62eb740a54393773368ee8b3",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-04T07:23:54.216Z",
        "dUpdatedDate": "2022-08-04T07:23:54.216Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62eb724bc8c2337263d31158",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0804-040822-1246",
        "iTransactionId": "62eb724bc8c2337263d31157",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-04T07:16:27.293Z",
        "dUpdatedDate": "2022-08-04T07:16:27.293Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62ea1159f4b6ac0f65281d2f",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0785-030822-1140",
        "iTransactionId": "62ea1159f4b6ac0f65281d2e",
        "eType": "cash-register-revenue",
        "dCreatedDate": "2022-08-03T06:10:33.288Z",
        "dUpdatedDate": "2022-08-03T06:10:33.288Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62e28cadce24c990a8731e3a",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0720-280722-1518",
        "iTransactionId": "62e28cadce24c990a8731e39",
        "dCreatedDate": "2022-07-28T13:18:37.699Z",
        "dUpdatedDate": "2022-07-28T13:18:37.699Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62e287a2ce24c990a8731e25",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0719-280722-1457",
        "iTransactionId": "62e287a2ce24c990a8731e24",
        "dCreatedDate": "2022-07-28T12:57:06.176Z",
        "dUpdatedDate": "2022-07-28T12:57:06.176Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62e286aece24c990a8731de1",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0718-280722-1453",
        "iTransactionId": "62e286aece24c990a8731de0",
        "dCreatedDate": "2022-07-28T12:53:02.862Z",
        "dUpdatedDate": "2022-07-28T12:53:02.862Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62e28388ce24c990a8731d9f",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0717-280722-1439",
        "iTransactionId": "62e28388ce24c990a8731d9e",
        "dCreatedDate": "2022-07-28T12:39:36.950Z",
        "dUpdatedDate": "2022-07-28T12:39:36.950Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62e282412385c0aa1492909e",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0716-280722-1804",
        "iTransactionId": "62e282412385c0aa1492909d",
        "dCreatedDate": "2022-07-28T12:34:09.899Z",
        "dUpdatedDate": "2022-07-28T12:34:09.899Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62e281182385c0aa14929058",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0715-280722-1759",
        "iTransactionId": "62e281182385c0aa14929057",
        "dCreatedDate": "2022-07-28T12:29:12.302Z",
        "dUpdatedDate": "2022-07-28T12:29:12.302Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62e28103ce24c990a8731d51",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0714-280722-1428",
        "iTransactionId": "62e28103ce24c990a8731d50",
        "dCreatedDate": "2022-07-28T12:28:51.915Z",
        "dUpdatedDate": "2022-07-28T12:28:51.915Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62e27e8fce24c990a8731d17",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0713-280722-1418",
        "iTransactionId": "62e27e8fce24c990a8731d16",
        "dCreatedDate": "2022-07-28T12:18:23.818Z",
        "dUpdatedDate": "2022-07-28T12:18:23.818Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62e27e2fce24c990a8731cee",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0712-280722-1416",
        "iTransactionId": "62e27e2fce24c990a8731ced",
        "dCreatedDate": "2022-07-28T12:16:47.316Z",
        "dUpdatedDate": "2022-07-28T12:16:47.316Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62e21d3b52c733763c486bc9",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0692-280722-1053",
        "iTransactionId": "62e21d3b52c733763c486bc8",
        "dCreatedDate": "2022-07-28T05:23:07.664Z",
        "dUpdatedDate": "2022-07-28T05:23:07.664Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62e1385c01fbe34ab841c55d",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0685-270722-1836",
        "iTransactionId": "62e1385c01fbe34ab841c55c",
        "dCreatedDate": "2022-07-27T13:06:36.720Z",
        "dUpdatedDate": "2022-07-27T13:06:36.720Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62e1345501fbe34ab841c4f2",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0684-270722-1819",
        "iTransactionId": "62e1345501fbe34ab841c4f1",
        "dCreatedDate": "2022-07-27T12:49:25.090Z",
        "dUpdatedDate": "2022-07-27T12:49:25.090Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62e1331701fbe34ab841c4b8",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0683-270722-1814",
        "iTransactionId": "62e1331701fbe34ab841c4b7",
        "dCreatedDate": "2022-07-27T12:44:07.916Z",
        "dUpdatedDate": "2022-07-27T12:44:07.916Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62e12cac01fbe34ab841c47e",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0682-270722-1746",
        "iTransactionId": "62e12cac01fbe34ab841c47d",
        "dCreatedDate": "2022-07-27T12:16:44.649Z",
        "dUpdatedDate": "2022-07-27T12:16:44.649Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62e11a5401fbe34ab841c40d",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0679-270722-1628",
        "iTransactionId": "62e11a5401fbe34ab841c40c",
        "dCreatedDate": "2022-07-27T10:58:28.784Z",
        "dUpdatedDate": "2022-07-27T10:58:28.784Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62e10d6a01fbe34ab841c3af",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b4f531d7d736c686b51f1",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0678-270722-1533",
        "iTransactionId": "62e10d6a01fbe34ab841c3ae",
        "dCreatedDate": "2022-07-27T10:03:22.781Z",
        "dUpdatedDate": "2022-07-27T10:03:22.781Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62e0578758337c871033311a",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0674-260722-2307",
        "iTransactionId": "62e0578758337c8710333119",
        "dCreatedDate": "2022-07-26T21:07:19.638Z",
        "dUpdatedDate": "2022-07-26T21:07:19.638Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62e0550b58337c87103330e3",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0673-260722-2256",
        "iTransactionId": "62e0550b58337c87103330e2",
        "dCreatedDate": "2022-07-26T20:56:43.302Z",
        "dUpdatedDate": "2022-07-26T20:56:43.302Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62e0549958337c87103330be",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0672-260722-2254",
        "iTransactionId": "62e0549958337c87103330bd",
        "dCreatedDate": "2022-07-26T20:54:49.055Z",
        "dUpdatedDate": "2022-07-26T20:54:49.055Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62e0520c58337c8710333037",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0671-260722-2243",
        "iTransactionId": "62e0520c58337c8710333036",
        "dCreatedDate": "2022-07-26T20:43:56.363Z",
        "dUpdatedDate": "2022-07-26T20:43:56.363Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62e04fa358337c8710332fdb",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0670-260722-2233",
        "iTransactionId": "62e04fa358337c8710332fda",
        "dCreatedDate": "2022-07-26T20:33:39.714Z",
        "dUpdatedDate": "2022-07-26T20:33:39.714Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62e04f2058337c8710332fb6",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0669-260722-2231",
        "iTransactionId": "62e04f2058337c8710332fb5",
        "dCreatedDate": "2022-07-26T20:31:28.513Z",
        "dUpdatedDate": "2022-07-26T20:31:28.513Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62e04d8b58337c8710332f81",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0668-260722-2224",
        "iTransactionId": "62e04d8b58337c8710332f80",
        "dCreatedDate": "2022-07-26T20:24:43.259Z",
        "dUpdatedDate": "2022-07-26T20:24:43.259Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62dffbad58337c8710332d6d",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0664-260722-1635",
        "iTransactionId": "62dffbad58337c8710332d6c",
        "dCreatedDate": "2022-07-26T14:35:25.116Z",
        "dUpdatedDate": "2022-07-26T14:35:25.116Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62dfca072dfa541910508a04",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0662-260722-1633",
        "iTransactionId": "62dfca072dfa541910508a03",
        "dCreatedDate": "2022-07-26T11:03:35.312Z",
        "dUpdatedDate": "2022-07-26T11:03:35.312Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62dfc3492dfa5419105089f2",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0660-260722-1604",
        "iTransactionId": "62dfc3482dfa5419105089f1",
        "dCreatedDate": "2022-07-26T10:34:49.001Z",
        "dUpdatedDate": "2022-07-26T10:34:49.001Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62dfa78f7840a280f837d67b",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0658-260722-1036",
        "iTransactionId": "62dfa78f7840a280f837d67a",
        "dCreatedDate": "2022-07-26T08:36:31.476Z",
        "dUpdatedDate": "2022-07-26T08:36:31.476Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62dfa7687840a280f837d665",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0657-260722-1035",
        "iTransactionId": "62dfa7687840a280f837d664",
        "dCreatedDate": "2022-07-26T08:35:52.344Z",
        "dUpdatedDate": "2022-07-26T08:35:52.344Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62dfa741084cc70e97bea018",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0656-260722-1405",
        "iTransactionId": "62dfa741084cc70e97bea017",
        "dCreatedDate": "2022-07-26T08:35:13.325Z",
        "dUpdatedDate": "2022-07-26T08:35:13.325Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62df03ea44a3d02ac8d5a260",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0652-250722-2258",
        "iTransactionId": "62df03ea44a3d02ac8d5a25f",
        "dCreatedDate": "2022-07-25T20:58:18.518Z",
        "dUpdatedDate": "2022-07-25T20:58:18.518Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62d7a31d6122cc1832f72cdf",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0592-200722-1209",
        "iTransactionId": "62d7a31d6122cc1832f72cde",
        "dCreatedDate": "2022-07-20T06:39:25.766Z",
        "dUpdatedDate": "2022-07-20T06:39:25.766Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62d6dbed438bde5710095c0a",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0574-190722-1829",
        "iTransactionId": "62d6dbed438bde5710095c09",
        "dCreatedDate": "2022-07-19T16:29:33.647Z",
        "dUpdatedDate": "2022-07-19T16:29:33.647Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62d6beb1438bde5710095b52",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0566-190722-1624",
        "iTransactionId": "62d6beb1438bde5710095b51",
        "dCreatedDate": "2022-07-19T14:24:49.460Z",
        "dUpdatedDate": "2022-07-19T14:24:49.460Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62d6bc25438bde5710095b09",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0565-190722-1613",
        "iTransactionId": "62d6bc25438bde5710095b08",
        "dCreatedDate": "2022-07-19T14:13:57.915Z",
        "dUpdatedDate": "2022-07-19T14:13:57.915Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62d5244a2d0cd830ba80efe9",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0544-180722-1443",
        "iTransactionId": "62d5244a2d0cd830ba80efe8",
        "dCreatedDate": "2022-07-18T09:13:46.699Z",
        "dUpdatedDate": "2022-07-18T09:13:46.699Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62d521359021012dd7b13f53",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0543-180722-1430",
        "iTransactionId": "62d521359021012dd7b13f52",
        "dCreatedDate": "2022-07-18T09:00:37.017Z",
        "dUpdatedDate": "2022-07-18T09:00:37.017Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62d502a1f009b62281e52873",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0540-180722-1220",
        "iTransactionId": "62d502a1f009b62281e52872",
        "dCreatedDate": "2022-07-18T06:50:09.200Z",
        "dUpdatedDate": "2022-07-18T06:50:09.200Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62ce945b361f18df8d04ed4f",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0521-130722-1516",
        "iTransactionId": "62ce945b361f18df8d04ed4e",
        "dCreatedDate": "2022-07-13T09:46:03.335Z",
        "dUpdatedDate": "2022-07-13T09:46:03.335Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62ce920a361f18df8d04ecf7",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0520-130722-1506",
        "iTransactionId": "62ce920a361f18df8d04ecf6",
        "dCreatedDate": "2022-07-13T09:36:10.261Z",
        "dUpdatedDate": "2022-07-13T09:36:10.261Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62ce8d22406f33d9b60268dc",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0519-130722-1445",
        "iTransactionId": "62ce8d22406f33d9b60268db",
        "dCreatedDate": "2022-07-13T09:15:14.916Z",
        "dUpdatedDate": "2022-07-13T09:15:14.916Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62cdea893ff0b151d09efc3c",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0512-120722-2341",
        "iTransactionId": "62cdea893ff0b151d09efc3b",
        "dCreatedDate": "2022-07-12T21:41:29.395Z",
        "dUpdatedDate": "2022-07-12T21:41:29.395Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62cc9a5246fbf55594e2e1cc",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0487-110722-2346",
        "iTransactionId": "62cc9a5246fbf55594e2e1cb",
        "dCreatedDate": "2022-07-11T21:46:58.452Z",
        "dUpdatedDate": "2022-07-11T21:46:58.452Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62cc81be889490930c9eb879",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0479-110722-2202",
        "iTransactionId": "62cc81be889490930c9eb878",
        "dCreatedDate": "2022-07-11T20:02:06.654Z",
        "dUpdatedDate": "2022-07-11T20:02:06.654Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62cc7ceb889490930c9eb844",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0478-110722-2141",
        "iTransactionId": "62cc7ceb889490930c9eb843",
        "dCreatedDate": "2022-07-11T19:41:31.786Z",
        "dUpdatedDate": "2022-07-11T19:41:31.786Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62cc7584889490930c9eb80a",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0477-110722-2109",
        "iTransactionId": "62cc7584889490930c9eb809",
        "dCreatedDate": "2022-07-11T19:09:56.654Z",
        "dUpdatedDate": "2022-07-11T19:09:56.654Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62cc7541889490930c9eb7e0",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0476-110722-2108",
        "iTransactionId": "62cc7541889490930c9eb7df",
        "dCreatedDate": "2022-07-11T19:08:49.983Z",
        "dUpdatedDate": "2022-07-11T19:08:49.983Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62cc7094889490930c9eb73b",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0474-110722-2048",
        "iTransactionId": "62cc7094889490930c9eb73a",
        "dCreatedDate": "2022-07-11T18:48:52.335Z",
        "dUpdatedDate": "2022-07-11T18:48:52.335Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62cc6fd8889490930c9eb705",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0473-110722-2045",
        "iTransactionId": "62cc6fd8889490930c9eb704",
        "dCreatedDate": "2022-07-11T18:45:44.705Z",
        "dUpdatedDate": "2022-07-11T18:45:44.705Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62cc6ef7889490930c9eb6d8",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0472-110722-2041",
        "iTransactionId": "62cc6ef7889490930c9eb6d7",
        "dCreatedDate": "2022-07-11T18:41:59.350Z",
        "dUpdatedDate": "2022-07-11T18:41:59.350Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62cc6e7f889490930c9eb6aa",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0471-110722-2039",
        "iTransactionId": "62cc6e7f889490930c9eb6a9",
        "dCreatedDate": "2022-07-11T18:39:59.450Z",
        "dUpdatedDate": "2022-07-11T18:39:59.450Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62cc6dbf889490930c9eb678",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0470-110722-2036",
        "iTransactionId": "62cc6dbf889490930c9eb677",
        "dCreatedDate": "2022-07-11T18:36:47.917Z",
        "dUpdatedDate": "2022-07-11T18:36:47.917Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62cc6cdd889490930c9eb63a",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0469-110722-2033",
        "iTransactionId": "62cc6cdd889490930c9eb639",
        "dCreatedDate": "2022-07-11T18:33:01.735Z",
        "dUpdatedDate": "2022-07-11T18:33:01.735Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62cc6cbe889490930c9eb627",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0468-110722-2032",
        "iTransactionId": "62cc6cbe889490930c9eb626",
        "dCreatedDate": "2022-07-11T18:32:30.852Z",
        "dUpdatedDate": "2022-07-11T18:32:30.852Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62cc6b96889490930c9eb5ef",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0467-110722-2027",
        "iTransactionId": "62cc6b96889490930c9eb5ee",
        "dCreatedDate": "2022-07-11T18:27:34.264Z",
        "dUpdatedDate": "2022-07-11T18:27:34.264Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c7fddf5679a64320421a52",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0444-080722-1520",
        "iTransactionId": "62c7fddf5679a64320421a51",
        "dCreatedDate": "2022-07-08T09:50:23.819Z",
        "dUpdatedDate": "2022-07-08T09:50:23.819Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c7b06ad7fa162b04b47fdd",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0440-080722-0949",
        "iTransactionId": "62c7b06ad7fa162b04b47fdc",
        "dCreatedDate": "2022-07-08T04:19:54.053Z",
        "dUpdatedDate": "2022-07-08T04:19:54.053Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c6d5b4348f3822049b60cc",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623c1f1b6c63de032cfde065",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0438-070722-1446",
        "iTransactionId": "62c6d5b4348f3822049b60cb",
        "dCreatedDate": "2022-07-07T12:46:44.618Z",
        "dUpdatedDate": "2022-07-07T12:46:44.618Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c6d44d348f3822049b6083",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623c1f1b6c63de032cfde065",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0437-070722-1440",
        "iTransactionId": "62c6d44d348f3822049b6082",
        "dCreatedDate": "2022-07-07T12:40:45.858Z",
        "dUpdatedDate": "2022-07-07T12:40:45.858Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c6d31e348f3822049b603e",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623c1f1b6c63de032cfde065",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0436-070722-1435",
        "iTransactionId": "62c6d31e348f3822049b603d",
        "dCreatedDate": "2022-07-07T12:35:42.242Z",
        "dUpdatedDate": "2022-07-07T12:35:42.242Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c6d2b0348f3822049b601f",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623c1f1b6c63de032cfde065",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0435-070722-1433",
        "iTransactionId": "62c6d2b0348f3822049b601e",
        "dCreatedDate": "2022-07-07T12:33:52.374Z",
        "dUpdatedDate": "2022-07-07T12:33:52.374Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c69c065e38c4fc570ad182",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0421-070722-1410",
        "iTransactionId": "62c69c065e38c4fc570ad181",
        "dCreatedDate": "2022-07-07T08:40:38.480Z",
        "dUpdatedDate": "2022-07-07T08:40:38.480Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c5662cf4e73498ef0ad74c",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0414-060722-1608",
        "iTransactionId": "62c5662cf4e73498ef0ad74b",
        "dCreatedDate": "2022-07-06T10:38:36.322Z",
        "dUpdatedDate": "2022-07-06T10:38:36.322Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c56584f4e73498ef0ad724",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0413-060722-1605",
        "iTransactionId": "62c56584f4e73498ef0ad723",
        "dCreatedDate": "2022-07-06T10:35:48.527Z",
        "dUpdatedDate": "2022-07-06T10:35:48.527Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c5642df4e73498ef0ad6f3",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0412-060722-1600",
        "iTransactionId": "62c5642df4e73498ef0ad6f2",
        "dCreatedDate": "2022-07-06T10:30:05.258Z",
        "dUpdatedDate": "2022-07-06T10:30:05.258Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c56355f4e73498ef0ad6c8",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0411-060722-1556",
        "iTransactionId": "62c56355f4e73498ef0ad6c7",
        "dCreatedDate": "2022-07-06T10:26:29.185Z",
        "dUpdatedDate": "2022-07-06T10:26:29.185Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c553baf4e73498ef0ad675",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0410-060722-1449",
        "iTransactionId": "62c553baf4e73498ef0ad674",
        "dCreatedDate": "2022-07-06T09:19:54.725Z",
        "dUpdatedDate": "2022-07-06T09:19:54.725Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c51458f4e73498ef0ad61f",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0409-060722-1019",
        "iTransactionId": "62c51458f4e73498ef0ad61e",
        "dCreatedDate": "2022-07-06T04:49:28.040Z",
        "dUpdatedDate": "2022-07-06T04:49:28.040Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c49a6d00b7df80b45c8242",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0405-050722-2209",
        "iTransactionId": "62c49a6d00b7df80b45c8241",
        "dCreatedDate": "2022-07-05T20:09:17.109Z",
        "dUpdatedDate": "2022-07-05T20:09:17.109Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c493d300b7df80b45c81d2",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0404-050722-2141",
        "iTransactionId": "62c493d300b7df80b45c81d1",
        "dCreatedDate": "2022-07-05T19:41:07.541Z",
        "dUpdatedDate": "2022-07-05T19:41:07.541Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c491c700b7df80b45c814d",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0403-050722-2132",
        "iTransactionId": "62c491c700b7df80b45c814c",
        "dCreatedDate": "2022-07-05T19:32:23.859Z",
        "dUpdatedDate": "2022-07-05T19:32:23.859Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c4525a10c0047750e47269",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0399-050722-1701",
        "iTransactionId": "62c4525a10c0047750e47268",
        "dCreatedDate": "2022-07-05T15:01:46.642Z",
        "dUpdatedDate": "2022-07-05T15:01:46.642Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c44f60ec8afb7d0e4a9698",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0398-050722-2019",
        "iTransactionId": "62c44f60ec8afb7d0e4a9697",
        "dCreatedDate": "2022-07-05T14:49:04.623Z",
        "dUpdatedDate": "2022-07-05T14:49:04.623Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c42650c665678fac21939b",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0392-050722-1353",
        "iTransactionId": "62c42650c665678fac21939a",
        "dCreatedDate": "2022-07-05T11:53:52.128Z",
        "dUpdatedDate": "2022-07-05T11:53:52.128Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c4215fc665678fac2192e9",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0391-050722-1332",
        "iTransactionId": "62c4215fc665678fac2192e8",
        "dCreatedDate": "2022-07-05T11:32:47.241Z",
        "dUpdatedDate": "2022-07-05T11:32:47.241Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c41d8332bfb9727ac7f28f",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0390-050722-1646",
        "iTransactionId": "62c41d8332bfb9727ac7f28e",
        "dCreatedDate": "2022-07-05T11:16:19.064Z",
        "dUpdatedDate": "2022-07-05T11:16:19.064Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c32bdd5985568904b7eb40",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0383-040722-2005",
        "iTransactionId": "62c32bdd5985568904b7eb3f",
        "dCreatedDate": "2022-07-04T18:05:17.857Z",
        "dUpdatedDate": "2022-07-04T18:05:17.857Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c32b6d5985568904b7eb2e",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0382-040722-2003",
        "iTransactionId": "62c32b6d5985568904b7eb2d",
        "dCreatedDate": "2022-07-04T18:03:25.943Z",
        "dUpdatedDate": "2022-07-04T18:03:25.943Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c329c65985568904b7eaef",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0381-040722-1956",
        "iTransactionId": "62c329c65985568904b7eaee",
        "dCreatedDate": "2022-07-04T17:56:22.957Z",
        "dUpdatedDate": "2022-07-04T17:56:22.957Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c30b49d05f8237fdd22643",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0380-040722-2116",
        "iTransactionId": "62c30b49d05f8237fdd22642",
        "dCreatedDate": "2022-07-04T15:46:17.953Z",
        "dUpdatedDate": "2022-07-04T15:46:17.953Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c30157d05f8237fdd225fa",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0379-040722-2033",
        "iTransactionId": "62c30157d05f8237fdd225f9",
        "dCreatedDate": "2022-07-04T15:03:51.354Z",
        "dUpdatedDate": "2022-07-04T15:03:51.354Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c2f2fac964aa25f8b60026",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0374-040722-1932",
        "iTransactionId": "62c2f2fac964aa25f8b60025",
        "dCreatedDate": "2022-07-04T14:02:34.560Z",
        "dUpdatedDate": "2022-07-04T14:02:34.560Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c2f1ecc964aa25f8b5ffe0",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0373-040722-1928",
        "iTransactionId": "62c2f1ecc964aa25f8b5ffdf",
        "dCreatedDate": "2022-07-04T13:58:04.622Z",
        "dUpdatedDate": "2022-07-04T13:58:04.622Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c2c5e4c964aa25f8b5ff94",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0371-040722-1620",
        "iTransactionId": "62c2c5e4c964aa25f8b5ff93",
        "dCreatedDate": "2022-07-04T10:50:12.168Z",
        "dUpdatedDate": "2022-07-04T10:50:12.168Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c2c12ec964aa25f8b5ff4d",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0370-040722-1600",
        "iTransactionId": "62c2c12ec964aa25f8b5ff4c",
        "dCreatedDate": "2022-07-04T10:30:06.887Z",
        "dUpdatedDate": "2022-07-04T10:30:06.887Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c01b6e1e9eb6c2a7dccc60",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0369-020722-1548",
        "iTransactionId": "62c01b6e1e9eb6c2a7dccc5f",
        "dCreatedDate": "2022-07-02T10:18:22.302Z",
        "dUpdatedDate": "2022-07-02T10:18:22.302Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c013d1952681b834964fdf",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0368-020722-1515",
        "iTransactionId": "62c013d1952681b834964fde",
        "dCreatedDate": "2022-07-02T09:45:53.096Z",
        "dUpdatedDate": "2022-07-02T09:45:53.096Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c01371952681b834964fbc",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0367-020722-1514",
        "iTransactionId": "62c01371952681b834964fbb",
        "dCreatedDate": "2022-07-02T09:44:17.592Z",
        "dUpdatedDate": "2022-07-02T09:44:17.592Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c011114035445748e392a2",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0366-020722-1134",
        "iTransactionId": "62c011114035445748e392a1",
        "dCreatedDate": "2022-07-02T09:34:09.768Z",
        "dUpdatedDate": "2022-07-02T09:34:09.768Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c01031952681b834964f73",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0365-020722-1500",
        "iTransactionId": "62c01031952681b834964f72",
        "dCreatedDate": "2022-07-02T09:30:25.272Z",
        "dUpdatedDate": "2022-07-02T09:30:25.272Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62c0070c952681b834964ed4",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0363-020722-1421",
        "iTransactionId": "62c0070c952681b834964ed3",
        "dCreatedDate": "2022-07-02T08:51:24.078Z",
        "dUpdatedDate": "2022-07-02T08:51:24.078Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62bff59fcd801d4b88f48e4a",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0362-020722-0937",
        "iTransactionId": "62bff59fcd801d4b88f48e49",
        "dCreatedDate": "2022-07-02T07:37:03.540Z",
        "dUpdatedDate": "2022-07-02T07:37:03.540Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62bff53b4d771b7e4cf52ad8",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0361-020722-0935",
        "iTransactionId": "62bff53b4d771b7e4cf52ad7",
        "dCreatedDate": "2022-07-02T07:35:23.642Z",
        "dUpdatedDate": "2022-07-02T07:35:23.642Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62bfdeef952681b834964e96",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0358-020722-1130",
        "iTransactionId": "62bfdeef952681b834964e95",
        "dCreatedDate": "2022-07-02T06:00:15.394Z",
        "dUpdatedDate": "2022-07-02T06:00:15.394Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62bfc232952681b834964e24",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0357-020722-0927",
        "iTransactionId": "62bfc232952681b834964e23",
        "dCreatedDate": "2022-07-02T03:57:38.723Z",
        "dUpdatedDate": "2022-07-02T03:57:38.723Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62bfbdc9194cd9b4d3e9645e",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0356-020722-0908",
        "iTransactionId": "62bfbdc9194cd9b4d3e9645d",
        "dCreatedDate": "2022-07-02T03:38:49.034Z",
        "dUpdatedDate": "2022-07-02T03:38:49.034Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62bf094ae169f86f44ad05e4",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0355-010722-1648",
        "iTransactionId": "62bf094ae169f86f44ad05e3",
        "dCreatedDate": "2022-07-01T14:48:42.566Z",
        "dUpdatedDate": "2022-07-01T14:48:42.566Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62bf0204a33fb0a61b87a012",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0354-010722-1947",
        "iTransactionId": "62bf0204a33fb0a61b87a011",
        "dCreatedDate": "2022-07-01T14:17:40.746Z",
        "dUpdatedDate": "2022-07-01T14:17:40.746Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62bee69aa33fb0a61b879fbd",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0352-010722-1750",
        "iTransactionId": "62bee69aa33fb0a61b879fbc",
        "dCreatedDate": "2022-07-01T12:20:42.545Z",
        "dUpdatedDate": "2022-07-01T12:20:42.545Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62bedc2ba33fb0a61b879f68",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0350-010722-1706",
        "iTransactionId": "62bedc2ba33fb0a61b879f67",
        "dCreatedDate": "2022-07-01T11:36:11.217Z",
        "dUpdatedDate": "2022-07-01T11:36:11.217Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62beac896d95782a988f9d0d",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0344-010722-1012",
        "iTransactionId": "62beac896d95782a988f9d0c",
        "dCreatedDate": "2022-07-01T08:12:57.604Z",
        "dUpdatedDate": "2022-07-01T08:12:57.604Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62be9e526d95782a988f9c82",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0342-010722-0912",
        "iTransactionId": "62be9e526d95782a988f9c81",
        "dCreatedDate": "2022-07-01T07:12:18.488Z",
        "dUpdatedDate": "2022-07-01T07:12:18.488Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62be920cac5e2f9a65114e10",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0337-010722-1149",
        "iTransactionId": "62be920cac5e2f9a65114e0f",
        "dCreatedDate": "2022-07-01T06:19:56.290Z",
        "dUpdatedDate": "2022-07-01T06:19:56.290Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62be9138109e429871851262",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0336-010722-1146",
        "iTransactionId": "62be9138109e429871851261",
        "dCreatedDate": "2022-07-01T06:16:24.546Z",
        "dUpdatedDate": "2022-07-01T06:16:24.546Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62be85ac8926b4928ca2dfec",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0335-010722-1057",
        "iTransactionId": "62be85ac8926b4928ca2dfeb",
        "dCreatedDate": "2022-07-01T05:27:08.929Z",
        "dUpdatedDate": "2022-07-01T05:27:08.929Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62bdc81ce07a4d86eed9637f",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0334-300622-2128",
        "iTransactionId": "62bdc81ce07a4d86eed9637e",
        "dCreatedDate": "2022-06-30T15:58:20.864Z",
        "dUpdatedDate": "2022-06-30T15:58:20.864Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62bdc604e07a4d86eed9633d",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0333-300622-2119",
        "iTransactionId": "62bdc604e07a4d86eed9633c",
        "dCreatedDate": "2022-06-30T15:49:24.051Z",
        "dUpdatedDate": "2022-06-30T15:49:24.051Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62bdbef8a5ce7877d8e1b968",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0332-300622-1719",
        "iTransactionId": "62bdbef8a5ce7877d8e1b967",
        "dCreatedDate": "2022-06-30T15:19:20.635Z",
        "dUpdatedDate": "2022-06-30T15:19:20.635Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62bd9d7ba4159c83d527b3d6",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0328-300622-1826",
        "iTransactionId": "62bd9d7ba4159c83d527b3d5",
        "dCreatedDate": "2022-06-30T12:56:27.290Z",
        "dUpdatedDate": "2022-06-30T12:56:27.290Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62bd9caba4159c83d527b3a6",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0326-300622-1822",
        "iTransactionId": "62bd9caba4159c83d527b3a5",
        "dCreatedDate": "2022-06-30T12:52:59.753Z",
        "dUpdatedDate": "2022-06-30T12:52:59.753Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62bd9bd79750b782d716d28a",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0325-300622-1819",
        "iTransactionId": "62bd9bd79750b782d716d289",
        "dCreatedDate": "2022-06-30T12:49:27.159Z",
        "dUpdatedDate": "2022-06-30T12:49:27.159Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62bd8fc01ba02a8131bf8383",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0323-300622-1727",
        "iTransactionId": "62bd8fc01ba02a8131bf8382",
        "dCreatedDate": "2022-06-30T11:57:52.565Z",
        "dUpdatedDate": "2022-06-30T11:57:52.565Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62bd8e196031a668ccc5bb30",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0322-300622-1720",
        "iTransactionId": "62bd8e196031a668ccc5bb2f",
        "dCreatedDate": "2022-06-30T11:50:49.244Z",
        "dUpdatedDate": "2022-06-30T11:50:49.244Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62bd4692954bd367ec2dfe1b",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0307-300622-0845",
        "iTransactionId": "62bd4692954bd367ec2dfe1a",
        "dCreatedDate": "2022-06-30T06:45:38.274Z",
        "dUpdatedDate": "2022-06-30T06:45:38.274Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b9b760c645a813407445a0",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0262-270622-1557",
        "iTransactionId": "62b9b760c645a8134074459f",
        "dCreatedDate": "2022-06-27T13:57:52.081Z",
        "dUpdatedDate": "2022-06-27T13:57:52.081Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b98711ed100c45ecfe78ff",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0257-270622-1231",
        "iTransactionId": "62b98711ed100c45ecfe78fe",
        "dCreatedDate": "2022-06-27T10:31:45.433Z",
        "dUpdatedDate": "2022-06-27T10:31:45.433Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b94d60fb903a1babf137b2",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0252-270622-1155",
        "iTransactionId": "62b94d60fb903a1babf137b1",
        "dCreatedDate": "2022-06-27T06:25:36.454Z",
        "dUpdatedDate": "2022-06-27T06:25:36.454Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b9409bfb903a1babf13772",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0251-270622-1101",
        "iTransactionId": "62b9409bfb903a1babf13771",
        "dCreatedDate": "2022-06-27T05:31:07.733Z",
        "dUpdatedDate": "2022-06-27T05:31:07.733Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b93c307064131a595ff865",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0250-270622-1042",
        "iTransactionId": "62b93c307064131a595ff864",
        "dCreatedDate": "2022-06-27T05:12:16.066Z",
        "dUpdatedDate": "2022-06-27T05:12:16.066Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b442884f8b5e819b5c7088",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0229-230622-1607",
        "iTransactionId": "62b442884f8b5e819b5c7087",
        "dCreatedDate": "2022-06-23T10:38:00.726Z",
        "dUpdatedDate": "2022-06-23T10:38:00.726Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b43ee24f8b5e819b5c706b",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0228-230622-1552",
        "iTransactionId": "62b43ee24f8b5e819b5c706a",
        "dCreatedDate": "2022-06-23T10:22:26.649Z",
        "dUpdatedDate": "2022-06-23T10:22:26.649Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b439414f8b5e819b5c704a",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0226-230622-1528",
        "iTransactionId": "62b439414f8b5e819b5c7049",
        "dCreatedDate": "2022-06-23T09:58:25.534Z",
        "dUpdatedDate": "2022-06-23T09:58:25.534Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b42edb2c6c5b55782874f3",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0222-230622-1114",
        "iTransactionId": "62b42edb2c6c5b55782874f2",
        "dCreatedDate": "2022-06-23T09:14:03.072Z",
        "dUpdatedDate": "2022-06-23T09:14:03.072Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b419f79288f55158c27fd6",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0213-230622-0944",
        "iTransactionId": "62b419f79288f55158c27fd5",
        "dCreatedDate": "2022-06-23T07:44:55.477Z",
        "dUpdatedDate": "2022-06-23T07:44:55.477Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b4130e4f8b5e819b5c7029",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0212-230622-1245",
        "iTransactionId": "62b4130e4f8b5e819b5c7028",
        "dCreatedDate": "2022-06-23T07:15:26.912Z",
        "dUpdatedDate": "2022-06-23T07:15:26.912Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b40f8867d6be801db72d6a",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0211-230622-1230",
        "iTransactionId": "62b40f8867d6be801db72d69",
        "dCreatedDate": "2022-06-23T07:00:24.768Z",
        "dUpdatedDate": "2022-06-23T07:00:24.768Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b40f236555737f752dfda8",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0210-230622-1228",
        "iTransactionId": "62b40f236555737f752dfda7",
        "dCreatedDate": "2022-06-23T06:58:43.130Z",
        "dUpdatedDate": "2022-06-23T06:58:43.130Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b30e7f1dab260474ccd2a2",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0194-220622-1443",
        "iTransactionId": "62b30e7f1dab260474ccd2a1",
        "dCreatedDate": "2022-06-22T12:43:43.737Z",
        "dUpdatedDate": "2022-06-22T12:43:43.737Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b30e1de31f8964859a0806",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0193-220622-1812",
        "iTransactionId": "62b30e1de31f8964859a0805",
        "dCreatedDate": "2022-06-22T12:42:05.158Z",
        "dUpdatedDate": "2022-06-22T12:42:05.158Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b30da8e3662404e49fa014",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0192-220622-1440",
        "iTransactionId": "62b30da8e3662404e49fa013",
        "dCreatedDate": "2022-06-22T12:40:08.814Z",
        "dUpdatedDate": "2022-06-22T12:40:08.814Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b30d7de3662404e49f9fff",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0191-220622-1439",
        "iTransactionId": "62b30d7de3662404e49f9ffe",
        "dCreatedDate": "2022-06-22T12:39:25.824Z",
        "dUpdatedDate": "2022-06-22T12:39:25.824Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b2d2c5e34143642b00562b",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0187-220622-1358",
        "iTransactionId": "62b2d2c5e34143642b00562a",
        "dCreatedDate": "2022-06-22T08:28:53.825Z",
        "dUpdatedDate": "2022-06-22T08:28:53.825Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b2d1983564fa63dab5a80d",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0186-220622-1353",
        "iTransactionId": "62b2d1983564fa63dab5a80c",
        "dCreatedDate": "2022-06-22T08:23:52.197Z",
        "dUpdatedDate": "2022-06-22T08:23:52.197Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b2d1564222ce63b5d20134",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0185-220622-1352",
        "iTransactionId": "62b2d1564222ce63b5d20133",
        "dCreatedDate": "2022-06-22T08:22:46.119Z",
        "dUpdatedDate": "2022-06-22T08:22:46.119Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b2d10cadbcdf637aaa3e26",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0184-220622-1351",
        "iTransactionId": "62b2d10cadbcdf637aaa3e25",
        "dCreatedDate": "2022-06-22T08:21:32.889Z",
        "dUpdatedDate": "2022-06-22T08:21:32.889Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b2cf87e56d8f629209c2c1",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0183-220622-1345",
        "iTransactionId": "62b2cf87e56d8f629209c2c0",
        "dCreatedDate": "2022-06-22T08:15:03.213Z",
        "dUpdatedDate": "2022-06-22T08:15:03.213Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b2bdf92ef56f5d4322f2b4",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0182-220622-1230",
        "iTransactionId": "62b2bdf92ef56f5d4322f2b3",
        "dCreatedDate": "2022-06-22T07:00:09.865Z",
        "dUpdatedDate": "2022-06-22T07:00:09.865Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b2b44d1d6282542bbce556",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0180-220622-1148",
        "iTransactionId": "62b2b44d1d6282542bbce555",
        "dCreatedDate": "2022-06-22T06:18:53.622Z",
        "dUpdatedDate": "2022-06-22T06:18:53.622Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b1aa2308b3ca3e8131a217",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0177-210622-1653",
        "iTransactionId": "62b1aa2308b3ca3e8131a216",
        "dCreatedDate": "2022-06-21T11:23:15.976Z",
        "dUpdatedDate": "2022-06-21T11:23:15.976Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b1a80b08b3ca3e8131a1fe",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0176-210622-1644",
        "iTransactionId": "62b1a80b08b3ca3e8131a1fd",
        "dCreatedDate": "2022-06-21T11:14:19.973Z",
        "dUpdatedDate": "2022-06-21T11:14:19.973Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b1a5aa08b3ca3e8131a1e1",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0175-210622-1634",
        "iTransactionId": "62b1a5aa08b3ca3e8131a1e0",
        "dCreatedDate": "2022-06-21T11:04:10.334Z",
        "dUpdatedDate": "2022-06-21T11:04:10.334Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b1762e08b3ca3e8131a1b9",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0174-210622-1311",
        "iTransactionId": "62b1762e08b3ca3e8131a1b8",
        "dCreatedDate": "2022-06-21T07:41:34.524Z",
        "dUpdatedDate": "2022-06-21T07:41:34.524Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b08d8a0e531c5d746cda3f",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0170-200622-1708",
        "iTransactionId": "62b08d8a0e531c5d746cda3e",
        "dCreatedDate": "2022-06-20T15:08:58.197Z",
        "dUpdatedDate": "2022-06-20T15:08:58.197Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b0301d706f9526d8222ea6",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0163-200622-1400",
        "iTransactionId": "62b0301d706f9526d8222ea5",
        "dCreatedDate": "2022-06-20T08:30:21.816Z",
        "dUpdatedDate": "2022-06-20T08:30:21.816Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62b02f7d62eb2526a1721029",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0162-200622-1357",
        "iTransactionId": "62b02f7d62eb2526a1721028",
        "dCreatedDate": "2022-06-20T08:27:41.980Z",
        "dUpdatedDate": "2022-06-20T08:27:41.980Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62aaed8ce99caf224468f24c",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0152-160622-1045",
        "iTransactionId": "62aaed8ce99caf224468f24b",
        "dCreatedDate": "2022-06-16T08:45:00.774Z",
        "dUpdatedDate": "2022-06-16T08:45:00.774Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62aab24f9722d263868d4d14",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iLocationId": "623b6d840ed1002890334456",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0151-160622-1002",
        "iTransactionId": "62aab24f9722d263868d4d13",
        "dCreatedDate": "2022-06-16T04:32:15.670Z",
        "dUpdatedDate": "2022-06-16T04:32:15.670Z",
        "__v": 0,
        "activityItems": []
      },
      {
        "_id": "62a1f98405adcc35b88ed714",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0121-090622-1545",
        "iTransactionId": "62a1f98405adcc35b88ed713",
        "dCreatedDate": "2022-06-09T13:45:40.735Z",
        "dUpdatedDate": "2022-06-09T13:45:40.735Z",
        "__v": 0,
        "dPickedUp": "2022-06-25T12:10:27.221Z",
        "eRepairStatus": "completed",
        "activityItems": []
      },
      {
        "_id": "62a1f90def775a241c904b5f",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0120-090622-1543",
        "iTransactionId": "62a1f90def775a241c904b5e",
        "dCreatedDate": "2022-06-09T13:43:41.962Z",
        "dUpdatedDate": "2022-06-09T13:43:41.962Z",
        "__v": 0,
        "dPickedUp": "2022-06-25T12:10:27.221Z",
        "eRepairStatus": "completed",
        "activityItems": []
      },
      {
        "_id": "6299bde1cc722d2cfc890341",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0101-030622-0953",
        "iTransactionId": "6299bde1cc722d2cfc890340",
        "dCreatedDate": "2022-06-03T07:53:05.809Z",
        "dUpdatedDate": "2022-06-03T07:53:05.809Z",
        "__v": 0,
        "dPickedUp": "2022-06-25T12:10:27.221Z",
        "eRepairStatus": "completed",
        "activityItems": []
      },
      {
        "_id": "629917d014c2d20d18baef08",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0096-020622-2204",
        "iTransactionId": "629917d014c2d20d18baef07",
        "dCreatedDate": "2022-06-02T20:04:32.591Z",
        "dUpdatedDate": "2022-06-02T20:04:32.591Z",
        "__v": 0,
        "dPickedUp": "2022-06-25T12:10:27.221Z",
        "eRepairStatus": "completed",
        "activityItems": []
      },
      {
        "_id": "6296506eb0d34e5c34adc8c3",
        "eStatus": "y",
        "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        "iCustomerId": "62420be55777d556346a9484",
        "sNumber": "A0079-310522-1929",
        "iTransactionId": "6296506eb0d34e5c34adc8c2",
        "dCreatedDate": "2022-05-31T17:29:18.686Z",
        "dUpdatedDate": "2022-05-31T17:29:18.686Z",
        "__v": 0,
        "dPickedUp": "2022-06-25T12:10:27.221Z",
        "eRepairStatus": "completed",
        "activityItems": []
      }
    ]
  };
  searchKeyword: any;
  shopProducts: any;
  commonProducts: any;
  supplierId!: string;
  iActivityId!: string;
  sNumber !: string;
  isStockSelected = true;
  payMethods: Array<any> = [];
  allPaymentMethod: Array<any> = [];
  appliedGiftCards: Array<any> = [];
  redeemedLoyaltyPoints: number = 0;
  business: any = {};
  payMethodsLoading: boolean = false;
  isGoldForPayments = false;
  requestParams: any = { iBusinessId: '' };
  parkedTransactionLoading = false;
  eKind: string = 'regular';
  parkedTransactions: Array<any> = [];
  terminals: Array<any> = [];
  quickButtons: Array<any> = [];
  fetchingProductDetails: boolean = false;
  bSearchingProduct: boolean = false;
  bIsPreviousDayStateClosed: boolean = true;
  bIsDayStateOpened: boolean = false; // Not opened then require to open it first
  bDayStateChecking: boolean = false;
  dOpenDate: any = '';
  aBusinessLocation: any = [];

  transaction: any = {};
  activityItems: any = {};
  amountDefined: any;
  aProjection: Array<any> = [
    'oName',
    'sEan',
    'nVatRate',
    'sProductNumber',
    'nPriceIncludesVat',
    'bDiscountOnPercentage',
    'nDiscount',
    'sLabelDescription',
    'aImage',
    'aProperty',
    'aLocation',
    'sArticleNumber',
    'iArticleGroupId',
    'iBusinessPartnerId',
    'sBusinessPartnerName',
    'iBusinessBrandId',
    'nPurchasePrice',
    'iBrandId',
  ];
  discountArticleGroup: any = {};
  saveInProgress = false;
  @ViewChild('searchField') searchField!: ElementRef;
  selectedQuickButton: any;
  getSettingsSubscription !: Subscription;
  dayClosureCheckSubscription !: Subscription;
  businessDetails: any;
  printActionSettings: any;
  printSettings: any;
  activity: any;
  bIsOpeningDayState: boolean = false;
  selectedLanguage: any = localStorage.getItem('language') ? localStorage.getItem('language') : 'en';
  bHasIActivityItemId: boolean = false;
  bSerialSearchMode = false;
  employee: any;
  bIsFiscallyEnabled: boolean = false;
  bDisablePrepayment: boolean = true;
  bAllGiftcardPaid: boolean = true;

  // paymentChanged: Subject<any> = new Subject<any>();
  availableAmount: any;
  nFinalAmount = 0;
  nItemsTotalToBePaid = 0;
  nItemsTotalDiscount = 0;
  nItemsTotalQuantity = 0;
  nTotalPayment = 0;

  oStaticData: any;

  iBusinessId = localStorage.getItem('currentBusiness') || '';
  iLocationId = localStorage.getItem('currentLocation') || '';
  iWorkstationId = localStorage.getItem('currentWorkstation') || '';

  /* Check if saving points are enabled */
  savingPointsSetting: boolean = JSON.parse(localStorage.getItem('savingPoints') || '');

  bIsTransactionLoading = false;
  nGiftcardAmount = 0;

  randNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  constructor(
    private translateService: TranslateService,
    private dialogService: DialogService,
    private taxService: TaxService,
    private paymentDistributeService: PaymentDistributionService,
    private apiService: ApiService,
    private toastrService: ToastService,
    public tillService: TillService,
    private barcodeService: BarcodeService,
    private terminalService: TerminalService,
    private createArticleGroupService: CreateArticleGroupService,
    private customerStructureService: CustomerStructureService,
    private fiskalyService: FiskalyService,
    private receiptService: ReceiptService,
    private http: HttpClient
  ) {

    // import(
    //   `@angular/common/locales/${this.selectedLanguage}.js`
    // ).then(module => registerLocaleData(module.default))

    // this.translateService.onLangChange
    //   .subscribe((langChangeEvent: LangChangeEvent) => {
    //     import(
    //       `@angular/common/locales/${langChangeEvent.lang}.js`
    //     ).then(module => registerLocaleData(module.default))
    //   })

  }
  async ngOnInit() {
    this.apiService.setToastService(this.toastrService)
    this.paymentDistributeService.setToastService(this.toastrService)
    this.tillService.updateVariables();
    this.checkDayState();

    this.requestParams.iBusinessId = this.iBusinessId;
    let taxDetails: any = await this.taxService.getLocationTax({ iLocationId: this.iLocationId });
    if (taxDetails) {
      this.taxes = taxDetails?.aRates || [];
    } else {
      setTimeout(async () => {
        taxDetails = await this.taxService.getLocationTax({ iLocationId: this.iLocationId });
        this.taxes = taxDetails?.aRates || [];
      }, 1000);
    }
    this.getPaymentMethods();
    this.getParkedTransactions();

    this.barcodeService.barcodeScanned.subscribe((barcode: string) => {
      this.openModal(barcode);
    });

    this.checkArticleGroups();

    if (this.bIsDayStateOpened) this.fetchQuickButtons();

    const currentEmployeeId = JSON.parse(localStorage.getItem('currentUser') || '')['userId'];

    const _businessData: any = await this.getBusinessDetails().toPromise();
    this.businessDetails = _businessData.data;
    this.aBusinessLocation = this.businessDetails?.aLocation || [];
    this.businessDetails.currentLocation = this.businessDetails?.aLocation?.find((location: any) => location?._id === this.iLocationId);
    this.tillService.selectCurrency(this.businessDetails.currentLocation);
    // this.getPrintSettings(true)
    this.getPrintSettings()
    this.getEmployee(currentEmployeeId)

    this.mapFiscallyData()

    setTimeout(() => {
      MenuComponent.bootstrap();
    });

  }

  async mapFiscallyData() {
    let _fiscallyData: any;
    try {
      _fiscallyData = await this.fiskalyService.getTSSList();
    } catch (err) {
      // console.log('error while executing fiskaly service', err)
    }
    if (_fiscallyData) {

      this.businessDetails.aLocation.forEach((location: any) => {
        const oMatch = _fiscallyData.find((tss: any) => tss.iLocationId === location._id)
        if (oMatch) {
          location.tssInfo = oMatch.tssInfo;
          location.bIsFiskalyEnabled = oMatch.bEnabled;
        }
      });
      if (this.businessDetails.currentLocation?.tssInfo && this.businessDetails.currentLocation?.bIsFiskalyEnabled) {
        this.bIsFiscallyEnabled = true;
        this.cancelFiskalyTransaction();
        this.fiskalyService.setTss(this.businessDetails.currentLocation?.tssInfo._id)
      }
    }

    this.loadTransaction();
  }

  ngAfterViewInit() {
    if (this.searchField)
      this.searchField.nativeElement.focus();
  }
  // async getfiskalyInfo() {
  //   const tssId = await this.fiskalyService.fetchTSS();
  // }

  onSelectRegular() {
    this.shopProducts = []; this.commonProducts = []; this.eKind = 'regular'; this.isStockSelected = true
  }
  onSelectOrder() {
    this.shopProducts = []; this.commonProducts = []; this.eKind = 'order'; this.isStockSelected = false
    if (this.searchField)
      this.searchField.nativeElement.focus();
  }

  loadTransaction() {
    const fromTransactionPage: any = localStorage.getItem('fromTransactionPage');
    if (fromTransactionPage) {
      this.handleTransactionResponse(JSON.parse(fromTransactionPage));
    } else {
      this.bIsTransactionLoading = false;
    }
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

  getPaymentMethods() {
    this.payMethodsLoading = true;
    this.payMethods = [];
    const methodsToDisplay = ['card', 'cash', 'bankpayment', 'maestro', 'mastercard', 'visa', 'pin', 'creditcard'];
    this.apiService.getNew('cashregistry', '/api/v1/payment-methods/' + this.requestParams.iBusinessId).subscribe((result: any) => {
      if (result && result.data && result.data.length) {
        this.allPaymentMethod = result.data.map((v: any) => ({ ...v, isDisabled: false }));
        this.allPaymentMethod.forEach((element: any) => {
          if (methodsToDisplay.includes(element.sName.toLowerCase())) {
            this.payMethods.push(_.clone(element));
          }
        });
      }
      this.payMethodsLoading = false;
    }, (error) => {
      this.payMethodsLoading = false;
    })
  }

  async addOrder(product: any) {
    let tax = Math.max(...this.taxes.map((tax: any) => tax.nRate), 0);
    this.transactionItems.push({
      eTransactionItemType: 'regular',
      // manualUpdate: false,
      isExclude: false,
      index: this.transactionItems.length,
      name: this.searchKeyword,
      oType: { bRefund: false, bDiscount: false, bPrepayment: false },
      type: 'order',
      aImage: [],
      quantity: 1,
      nBrokenProduct: 0,
      price: 0,
      nPurchasePrice: 0,
      nMargin: 2,
      nDiscount: 0,
      tax: tax,
      paymentAmount: 0,
      oArticleGroupMetaData: { aProperty: [], sCategory: '', sSubCategory: '', oName: {}, oNameOriginal: {} },
      description: '',
      sServicePartnerRemark: '',
      sCommentVisibleServicePartner: '',
      eEstimatedDateAction: 'call_on_ready',
      open: true,
      new: true,
      isFor: 'create',
      eActivityItemStatus: 'new'
    });
    this.searchKeyword = '';
    this.clearPaymentAmounts();
    await this.updateFiskalyTransaction('ACTIVE', []);
  }

  updateAmountVariables() {
    // console.log('updateAmountVariables');
    this.nItemsTotalToBePaid = this.getTotals('price');
    this.nItemsTotalDiscount = this.getTotals('discount');
    this.nItemsTotalQuantity = this.getTotals('quantity');
    this.nTotalPayment = this.totalPrepayment();
    this.nFinalAmount = Math.abs(this.availableAmount - this.nItemsTotalToBePaid);

    // console.log({ 
    //   nItemsTotalToBePaid: this.nItemsTotalToBePaid, 
    //   nTotalPayment: this.nTotalPayment,
    //   nFinalAmount: this.nFinalAmount,
    //   availableAmount: this.availableAmount 
    // })
  }

  getTotals(type: string): number {
    this.amountDefined = this.payMethods.find((pay) => pay.amount || pay.amount?.toString() === '0');
    if (!type) {
      return 0
    }
    let result = 0
    switch (type) {
      case 'price':
        this.transactionItems.forEach((i) => {
          if (!i.isExclude) {
            if (i.tType === 'refund') {
              i.nTotal = i.quantity * i.price;
              result -= (i?.new) ? i.nTotal : i.nRefundAmount;
            } else {
              const price = (typeof i.price === 'string') ? i.price.replace(',', '.') : i.price;
              let discountPrice = i.bDiscountOnPercentage ? (price - (price * ((i.nDiscount || 0) / 100))) : (price - i.nDiscount);
              i.nTotal = i.quantity * discountPrice;
              i.nTotal -= i.nGiftcardDiscount || 0;
              i.nTotal -= i.nRedeemedLoyaltyPoints || 0;
              i.nTotal = i.type === 'gold-purchase' ? -1 * i.nTotal : i.nTotal;
              result += i.nTotal - (i.prePaidAmount || 0);
            }
          } else {
            i.paymentAmount = 0;
          }
        });
        break;
      case 'quantity':
        result = _.sumBy(this.transactionItems, 'quantity') || 0
        break;
      case 'discount':
        let sum = 0;
        this.transactionItems.forEach(element => {
          let discountPrice = element.bDiscountOnPercentage ? (element.price * ((element.nDiscount || 0) / 100)) : element.nDiscount;
          sum += element.quantity * discountPrice;
        });
        result = sum;
        break;
      default:
        result = 0;
        break;
    }
    return result
  }

  totalPrepayment() {
    // console.log('totalPrepayment', this.transactionItems)
    let result = 0
    this.transactionItems.forEach((i) => {
      // console.log(i.paymentAmount);
      if (!i.isExclude) {
        result += i.paymentAmount;
      }
    });
    return result;
  }

  checkout(): any {
    if (this.transactionItems?.length) {
      const items = this.transactionItems.filter((item: any) => {
        if (item?.isExclude) return item;
      })
      if (items?.length == this.transactionItems?.length) return false
      else if (this.amountDefined && this.bAllGiftcardPaid) return false;
      else return true
    } else {
      return true;
    }
  }
  async addItem(type: string) {
    // console.log('add item,', type, type==='repair')

    const price = (type === 'giftcard') ? 5 : 0;
    const tax = Math.max(...this.taxes.map((tax: any) => tax.nRate), 0);

    this.transactionItems.push({
      isExclude: type === 'repair',
      manualUpdate: type === 'gold-purchase',
      eTransactionItemType: 'regular',
      index: this.transactionItems.length,
      name: this.translateService.instant(type.toUpperCase()),
      type,
      oType: { bRefund: false, bDiscount: false, bPrepayment: false },
      oArticleGroupMetaData: { aProperty: [], sCategory: '', sSubCategory: '', oName: {}, oNameOriginal: {} },
      aImage: [],
      quantity: 1,
      nBrokenProduct: 0,
      price,
      nMargin: 2,
      nPurchasePrice: 0,
      nTotal: type === 'gold-purchase' ? -1 * price : price,
      nDiscount: 0,
      tax: tax,
      paymentAmount: type === 'gold-purchase' ? -1 * price : 0,
      description: '',
      sServicePartnerRemark: '',
      sCommentVisibleServicePartner: '',
      eActivityItemStatus: 'new',
      eEstimatedDateAction: 'call_on_ready',
      open: true,
      new: true,
      iBusinessId: this.iBusinessId,
      ...(type === 'giftcard') && { sGiftCardNumber: Date.now() },
      ...(type === 'giftcard') && { bGiftcardTaxHandling: 'true' },
      ...(type === 'giftcard') && { isGiftCardNumberValid: false },
      ...(type === 'gold-purchase') && { oGoldFor: { name: 'stock', type: 'goods' } }
    });
    this.clearPaymentAmounts();
    // console.log('added item', this.transactionItems[0].isExclude, this.transactionItems[0])
    await this.updateFiskalyTransaction('ACTIVE', []);
  }

  cancelItems(): void {
    if (this.transactionItems.length > 0) {
      const buttons = [
        { text: 'YES', value: true, status: 'success', class: 'btn-primary ml-auto mr-2' },
        { text: 'NO', value: false, class: 'btn-warning' }
      ]
      this.dialogService.openModal(ConfirmationDialogComponent, {
        context: {
          header: 'CLEAR_TRANSACTION',
          bodyText: 'ARE_YOU_SURE_TO_CLEAR_THIS_TRANSACTION',
          buttonDetails: buttons
        }
      }).instance.close.subscribe(result => {
        if (result) {
          this.transactionItems = []
          this.clearAll();
        }
      }
      )
    }
    this.resetSearch();
  }

  itemChanged(event: any, index: number): void {
    // console.log('itemChanged: ', event);
    switch (event.type) {
      case 'delete':
        // console.log('itemChanged delete')
        this.transactionItems.splice(index, 1);
        this.clearPaymentAmounts();
        break;
      case 'update':
        // console.log('itemChanged update')
        this.clearPaymentAmounts();
        // this.paymentDistributeService.distributeAmount(this.transactionItems, this.getUsedPayMethods(true));
        break;
      case 'prepaymentChange':
        this.availableAmount = this.getUsedPayMethods(true);
        this.nGiftcardAmount = _.sumBy(this.appliedGiftCards, 'nAmount') || 0;
        this.paymentDistributeService.distributeAmount(this.transactionItems, this.availableAmount, this.nGiftcardAmount, this.redeemedLoyaltyPoints);
        this.updateAmountVariables();
        break;
      case 'duplicate':
        const tItem = Object.create(this.transactionItems[index]);
        tItem.sGiftCardNumber = Date.now();
        this.transactionItems.push(tItem);
        this.clearPaymentAmounts();
        break;
      case 'settingsChanged':
        this.tillService.settings.currentLocation.nLastBagNumber = Number(event.data);
        break;
      default:
        this.transactionItems[index] = event.data;
        this.clearPaymentAmounts();
        break;
    }
    this.updateFiskalyTransaction('ACTIVE', []);
  }

  createGiftCard(item: any, index: number): void {
    const body = {
      iBusinessId: this.iBusinessId,
      iLocationId: this.iLocationId,

      // Do we still need to keep this hard code value here?
      iCustomerId: this.customer?._id,

      sGiftCardNumber: this.transactionItems[index].sGiftCardNumber,
      eType: '',
      nPriceIncVat: this.transactionItems[index].price,
      nPurchasePrice: this.transactionItems[index].price / 1.21,
      nVatRate: this.transactionItems[index].tax,
      nQuantity: this.transactionItems[index].quantity,
      nPaidAmount: 0,
      sProductName: this.transactionItems[index].name,
      iActivityId: this.iActivityId,
    };
    this.apiService.postNew('cashregistry', '/api/v1/till/gift-card', body)
      .subscribe((data: any) => {
        this.iActivityId = data.iActivityId;
        this.transactionItems[index].iActivityItemId = data._id;
        this.toastrService.show({ type: 'success', text: 'Giftcard created!' });
      }, err => {
        this.toastrService.show({ type: 'danger', text: err.message });
      });
  }

  openTransactionSearchDialog() {
    // console.log('open transaction search dialog')
    this.dialogService.openModal(TransactionsSearchComponent, { cssClass: 'modal-xl', context: { customer: this.customer } })
      .instance.close.subscribe(async (data) => {
        // console.log('response of transaction search component', data)
        if (data?.transaction) {
          this.bIsTransactionLoading = true;
          // / Finding BusinessProduct and their location and stock. Need to show in the dropdown of location choosing /
          if (data?.transactionItems?.length) {
            let aBusinessProduct: any = [];
            const _aBusinessProduct: any = await this.getBusinessProductList(data?.transactionItems.map((el: any) => el.iBusinessProductId)).toPromise();
            if (_aBusinessProduct?.data?.length && _aBusinessProduct.data[0]?.result?.length) aBusinessProduct = _aBusinessProduct.data[0]?.result;
            data.transactionItems = data.transactionItems?.map((oTI: any) => {
              // / assigning the BusinessProduct location to transction-item /
              const oFoundProdLoc = aBusinessProduct?.find((oBusinessProd: any) => oBusinessProd?._id?.toString() === oTI?.iBusinessProductId?.toString());
              if (oFoundProdLoc?.aLocation?.length) {
                oTI.aLocation = oFoundProdLoc.aLocation?.map((oProdLoc: any) => {
                  const oFound: any = this.aBusinessLocation?.find((oBusLoc: any) => oBusLoc?._id?.toString() === oProdLoc?._id?.toString());
                  oProdLoc.sName = oFound?.sName;
                  return oProdLoc;
                });
              }
              oTI.oCurrentLocation = oTI.aLocation?.find((o: any) => o._id === oTI.iLocationId);
              oTI.bProductLoaded = true;
              return oTI;
            })
          }

          this.handleTransactionResponse(data);
        }
        // this.changeInPayment();
      });
  }

  async openCustomerDialog() {
    this.dialogService.openModal(CustomerDialogComponent, { cssClass: 'modal-xl', context: { customer: this.customer, from: 'cash-register' } }).instance.close.subscribe((data) => {
      if (data.customer) {
        this.customer = data.customer;
        console.log(this.customer);
        if (this.customer?.activityData?.length) {
          this.findOpenActivitiesForCustomer();
        }
      }
    })
  }

  findOpenActivitiesForCustomer() {
    this.dialogService.openModal(CustomerActivitiesDialogComponent, { cssClass: 'modal-xl', context: { customer: this.customer } }).instance.close.subscribe(async (data) => {
      if (data?.transaction) {
        this.bIsTransactionLoading = true;
        // / Finding BusinessProduct and their location and stock. Need to show in the dropdown of location choosing /
        if (data?.transactionItems?.length) {
          let aBusinessProduct: any = [];
          const _aBusinessProduct: any = await this.getBusinessProductList(data?.transactionItems.map((el: any) => el.iBusinessProductId)).toPromise();
          if (_aBusinessProduct?.data?.length && _aBusinessProduct.data[0]?.result?.length) aBusinessProduct = _aBusinessProduct.data[0]?.result;
          data.transactionItems = data.transactionItems?.map((oTI: any) => {
            // / assigning the BusinessProduct location to transction-item /
            const oFoundProdLoc = aBusinessProduct?.find((oBusinessProd: any) => oBusinessProd?._id?.toString() === oTI?.iBusinessProductId?.toString());
            if (oFoundProdLoc?.aLocation?.length) {
              oTI.aLocation = oFoundProdLoc.aLocation?.map((oProdLoc: any) => {
                const oFound: any = this.aBusinessLocation?.find((oBusLoc: any) => oBusLoc?._id?.toString() === oProdLoc?._id?.toString());
                oProdLoc.sName = oFound?.sName;
                return oProdLoc;
              });
            }
            oTI.oCurrentLocation = oTI.aLocation?.find((o: any) => o._id === oTI.iLocationId);
            return oTI;
          })
        }

        this.handleTransactionResponse(data);
      }
    })
  }

  fetchCustomer(customerId: any) {
    this.apiService.getNew('customer', `/api/v1/customer/${customerId}?iBusinessId=${this.iBusinessId}`).subscribe(
      (result: any) => {
        const customer = result;
        customer['NAME'] = this.customerStructureService.makeCustomerName(customer);
        customer['SHIPPING_ADDRESS'] = this.customerStructureService.makeCustomerAddress(customer.oShippingAddress, false);
        customer['INVOICE_ADDRESS'] = this.customerStructureService.makeCustomerAddress(customer.oInvoiceAddress, false);
        customer['EMAIL'] = customer.sEmail;
        customer['PHONE'] = (customer.oPhone && customer.oPhone.sLandLine ? customer.oPhone.sLandLine : '') + (customer.oPhone && customer.oPhone.sLandLine && customer.oPhone.sMobile ? ' / ' : '') + (customer.oPhone && customer.oPhone.sMobile ? customer.oPhone.sMobile : '');
        this.customer = customer;
        // this.close({ action: true });
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  /* A payment which made */
  getUsedPayMethods(total: boolean): any {

    if (!this.payMethods) {
      return 0
    }
    if (total) {
      return (_.sumBy(this.payMethods, 'amount') || 0);
      
      // not to consider giftcard and loyalty points as a payment
      // + this.redeemedLoyaltyPoints; //(_.sumBy(this.appliedGiftCards, 'nAmount') || 0) + 
    }
    return this.payMethods.filter(p => p.amount && p.amount !== 0) || 0
  }

  changeInPayment() {
    this.availableAmount = this.getUsedPayMethods(true);
    this.nGiftcardAmount = _.sumBy(this.appliedGiftCards, 'nAmount') || 0;
    this.paymentDistributeService.distributeAmount(this.transactionItems, this.availableAmount, this.nGiftcardAmount, this.redeemedLoyaltyPoints);
    this.allPaymentMethod = this.allPaymentMethod.map((v: any) => ({ ...v, isDisabled: true }));
    this.payMethods.map(o => o.isDisabled = true);
    const paidAmount = _.sumBy(this.payMethods, 'amount') || 0;

    const aGiftcard = this.transactionItems.filter((v: any) => v.type == 'giftcard');
    this.bAllGiftcardPaid = aGiftcard.every((el: any) => el.paymentAmount == el.amountToBePaid)

    if (paidAmount === 0) {
      this.payMethods.map(o => o.isDisabled = false);
    }
    // console.log('change in payment in cash ', this.transactionItems)
    this.transactionItems = [...this.transactionItems]
    this.updateAmountVariables();
  }

  clearAll() {
    this.transactionItems = [];
    this.shopProducts = [];
    this.commonProducts = [];
    this.searchKeyword = '';
    this.selectedTransaction = null;
    this.payMethods.map(o => { o.amount = null, o.isDisabled = false });
    this.appliedGiftCards = [];
    this.redeemedLoyaltyPoints = 0;
    this.iActivityId = '';
    this.sNumber = '';
    this.customer = null;
    this.saveInProgress = false;
    this.clearPaymentAmounts();
    localStorage.removeItem('fromTransactionPage');
  }

  clearPaymentAmounts() {
    // console.log('this.transactionItems: ', this.transactionItems);

    this.transactionItems.forEach((item: any) => {
      item.paymentAmount = 0;

      if (item.type === 'repair' || item.type === 'order') {
        if (item?.prepaymentTouched) {
          item.manualUpdate = false;
          item.prepaymentTouched = false;
        }
      } else {
        item.isExclude = false;
        item.manualUpdate = (item.type === 'gold-purchase') ? true : false;
      }
    })

    this.payMethods.map(o => { o.amount = null, o.isDisabled = false });
    this.availableAmount = this.getUsedPayMethods(true);
    this.nGiftcardAmount = _.sumBy(this.appliedGiftCards, 'nAmount') || 0;
    this.paymentDistributeService.distributeAmount(this.transactionItems, this.availableAmount, this.nGiftcardAmount, this.redeemedLoyaltyPoints);
    this.updateAmountVariables();
  }


  startTerminalPayment() {
    this.dialogService.openModal(TerminalDialogComponent, { cssClass: 'modal-lg', context: { payments: this.payMethods } })
      .instance.close.subscribe((data) => {
        if (data) {
          data.forEach((pay: any) => {
            if (pay.sName === 'Card' && pay.status !== 'SUCCESS') {
              pay.nExpectedAmount = pay.amount;
              pay.amount = 0;
            }
          });
        }
      })
  }

  // nRefundAmount needs to be added
  checkUseForGold() {
    let isGoldForPayment = true;
    const goldTransactionPayments = this.transactionItems.filter(o => o.oGoldFor?.name === 'cash' || o.oGoldFor?.name === 'bankpayment');
    goldTransactionPayments.forEach(element => {
      const paymentMethod = this.payMethods.findIndex(o => o.sName.toLowerCase() === element.oGoldFor.name && o.amount === element.amountToBePaid);
      if (paymentMethod < 0) {
        isGoldForPayment = false;
        // this.toastrService.show({ type: 'danger', text: `The amount paid for '${element.oGoldFor.name}' does not match.` });
        this.toastrService.show({
          type: 'danger',
          text: `You selected '${element.oGoldFor.name}' as a administrative procedure for this gold purchase. 
        If your administration supports special rules for 'VAT' processing on gold purchases please remove all the other products/items on this purchase. 
        In case you're following the 'regular' procedure like most retailers (95%): Change the option 'Cash/Bank' to 'Stock/Repair/Giftcard/Order' on the gold purchase item's dropdown. 
        You can still give cash to your customer or select bank (transfer) as a method. 
        In that case on paper the governement handles this 'gold purchase' as an exchange to goods (which may be done on a different transaction.`,
          noAutoClose: true
        });
      }
    });
    return isGoldForPayment;
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

  createTransaction() {
    const isGoldForCash = this.checkUseForGold();
    if (this.transactionItems.length < 1 || !isGoldForCash) {
      return;
    }
    const giftCardPayment = this.allPaymentMethod.find((o) => o.sName === 'Giftcards');
    this.saveInProgress = true;
    const nTotalToPay = this.getTotals('price');
    const nEnteredAmountTotal = this.getUsedPayMethods(true);

    if (nTotalToPay < 0) {
      let nDiff = parseFloat((nTotalToPay - nEnteredAmountTotal).toFixed(2));
      if (nDiff < -0.02 || nDiff > 0.02) {
        this.toastrService.show({ type: 'warning', text: `We do not allow prepayment on negative transactions and also we do not support negative change money.` });
        this.saveInProgress = false;
        return;
      }
    }
    const changeAmount = nEnteredAmountTotal - nTotalToPay
    this.dialogService.openModal(TerminalDialogComponent, { cssClass: 'modal-lg', context: { payments: this.payMethods, changeAmount, nTotalTransactionAmount: nTotalToPay } })
      .instance.close.subscribe(async (payMethods: any) => {
        // console.log(payMethods)
        if (!payMethods) {
          this.saveInProgress = false;
          this.clearPaymentAmounts();
        } else {
          payMethods.forEach((pay: any) => {
            if (pay.sName === 'Card' && pay.status !== 'SUCCESS') {
              pay.nExpectedAmount = pay.amount;
              pay.amount = 0;
            }
          });
          // payMethods = payMethods.filter((o: any) => o.amount !== 0);
          this.availableAmount = this.getUsedPayMethods(true);
          this.nGiftcardAmount = _.sumBy(this.appliedGiftCards, 'nAmount') || 0;
          this.paymentDistributeService.distributeAmount(this.transactionItems, this.availableAmount, this.nGiftcardAmount, this.redeemedLoyaltyPoints);
          this.transactionItems = [...this.transactionItems.filter((item: any) => item.type !== 'empty-line')]
          const body = this.tillService.createTransactionBody(this.transactionItems, payMethods, this.discountArticleGroup, this.redeemedLoyaltyPoints, this.customer);
          console.log('body: ', body);
          // return;
          if (body.transactionItems.filter((item: any) => item.oType.eKind === 'repair')[0]?.iActivityItemId) {
            this.bHasIActivityItemId = true
          }
          if (giftCardPayment && this.appliedGiftCards.length > 0) {
            // this.appliedGiftCards.forEach(element => {
            //   const cardPaymethod = _.clone(giftCardPayment);
            //   cardPaymethod.amount = element.nAmount;
            //   cardPaymethod.sGiftCardNumber = element.sGiftCardNumber;
            //   cardPaymethod.iArticleGroupId = element.iArticleGroupId;
            //   cardPaymethod.iArticleGroupOriginalId = element.iArticleGroupOriginalId;
            //   cardPaymethod.type = element.type;
            //   body.payments.push(cardPaymethod);
            // });
            body.giftCards = this.appliedGiftCards;
          }
          body.oTransaction.iActivityId = this.iActivityId;
          let result = body.transactionItems.map((a: any) => a.iBusinessPartnerId);
          const uniq = [...new Set(_.compact(result))];
          if (this.appliedGiftCards?.length) this.tillService.createGiftcardTransactionItem(body, this.discountArticleGroup);

          const oDialogComponent: DialogComponent = this.dialogService.openModal(TransactionActionDialogComponent, {
            cssClass: 'modal-lg', hasBackdrop: true, closeOnBackdropClick: true, closeOnEsc: true,
          }).instance;

          if (this.bIsFiscallyEnabled) {
            const result: any = await this.fiskalyService.updateFiskalyTransaction(this.transactionItems, _.clone(body.payments), 'FINISHED');
            if (result) {
              localStorage.removeItem('fiskalyTransaction');
              body.oTransaction.sFiskalyTxId = result._id;
            }
          }

          this.apiService.postNew('cashregistry', '/api/v1/till/transaction', body).subscribe(async (data: any) => {

            // this.toastrService.show({ type: 'success', text: 'Transaction created.' });
            this.saveInProgress = false;
            const { transaction, aTransactionItems, activityItems, activity } = data;
            transaction.aTransactionItems = aTransactionItems;
            transaction.activity = activity;
            this.transaction = transaction;
            this.activityItems = activityItems;
            this.activity = activity;

            if (this.tillService.settings?.currentLocation?.bAutoIncrementBagNumbers) {
              this.tillService.updateSettings();
            }


            this.transaction.aTransactionItems.map((tItem: any) => {
              for (const aItem of this.activityItems) {
                if (aItem.iTransactionItemId === tItem._id) {
                  tItem.sActivityItemNumber = aItem.sNumber;
                  break;
                }
              }
            });

            const bOpenCashDrawer = payMethods.some((m: any) => m.sName === 'Cash' && m.remark != 'CHANGE_MONEY');
            if (bOpenCashDrawer && this.tillService?.settings?.bOpenCashDrawer) this.openDrawer();

            this.handleReceiptPrinting(oDialogComponent);


            setTimeout(() => {
              this.saveInProgress = false;
              this.fetchBusinessPartnersProductCount(uniq);
            }, 100);
            if (this.selectedTransaction) {
              this.deleteParkedTransaction();
            };

          }, err => {
            this.toastrService.show({ type: 'danger', text: err.message });
            this.saveInProgress = false;
          });
        }
      });
  }

  getEmployee(id: any) {
    if (id != '') {
      this.apiService.getNew('auth', `/api/v1/employee/${id}?iBusinessId=${this.iBusinessId}`).subscribe((result: any) => {
        this.employee = result?.data;
      });
    }
  }


  async handleReceiptPrinting(oDialogComponent: DialogComponent) {
    this.transaction.businessDetails = this.businessDetails;
    this.transaction.currentLocation = this.businessDetails.currentLocation;
    this.transaction = await this.tillService.processTransactionForPdfReceipt(this.transaction);

    let oDataSource = JSON.parse(JSON.stringify(this.transaction));
    // let nTotalOriginalAmount = 0;
    // oDataSource.aTransactionItems.forEach((item: any) => {
    //   nTotalOriginalAmount += item.nPriceIncVatAfterDiscount;
    //   let description = (item?.totalPaymentAmount != item?.nPriceIncVatAfterDiscount) ? `${this.translateService.instant('ORIGINAL_AMOUNT_INC_DISC')}: ${item.nPriceIncVatAfterDiscount}\n` : '';
    //   if (item?.related?.length) {
    //     description += `${this.translateService.instant('ALREADY_PAID')}: \n${item.sTransactionNumber} | ${item.nRevenueAmount} (${this.translateService.instant('THIS_RECEIPT')})\n`;

    //     item.related.forEach((related: any) => {
    //       description += `${related.sTransactionNumber} | ${related.nRevenueAmount}\n`;
    //     });
    //   }

    //   item.description = description;
    // });
    // oDataSource.bHasPrePayments = true;
    oDataSource.sActivityNumber = oDataSource.activity.sNumber;
    // oDataSource.nTotalOriginalAmount = nTotalOriginalAmount;

    const aUniqueItemTypes = [];

    const nRepairCount = oDataSource.aTransactionItemType.filter((e: any) => e === 'repair')?.length;
    const nOrderCount = oDataSource.aTransactionItemType.filter((e: any) => e === 'order')?.length;

    const bRegularCondition = oDataSource.total >= 0.02 || oDataSource.total <= -0.02;
    const bOrderCondition = nOrderCount === 1 && nRepairCount === 1 || nRepairCount > 1 || nOrderCount >= 1;
    const bRepairCondition = nRepairCount === 1 && nOrderCount === 0;
    const bRepairAlternativeCondition = nRepairCount >= 1 && nOrderCount >= 1;

    if (bRegularCondition) aUniqueItemTypes.push('regular')

    if (bOrderCondition) aUniqueItemTypes.push('order');

    aUniqueItemTypes.push(...['repair', 'repair_alternative', 'giftcard']);

    // oDataSource.businessDetails = this.businessDetails;
    // oDataSource.currentLocation = this.businessDetails.currentLocation;

    const [_template, _oLogoData]: any = await Promise.all([
      this.getTemplate(aUniqueItemTypes),
      // if no logo is there, use a default logo. or show a message: please upload your shop logo
      this.getBase64FromUrl(oDataSource?.businessDetails?.sLogoLight),
    ]);

    oDataSource.sAdvisedEmpFirstName = this.employee?.sFirstName || 'a';
    oDataSource.sBusinessLogoUrl = _oLogoData.data;
    if (oDataSource.oCustomer && oDataSource.oCustomer.bCounter === true) {
      oDataSource.oCustomer = {};
    } else {
      oDataSource.oCustomer = {
        sFirstName: oDataSource.oCustomer.sFirstName,
        sLastName: oDataSource.oCustomer.sLastName,
        sEmail: oDataSource.oCustomer.sEmail,
        sMobile: oDataSource.oCustomer.oPhone?.sCountryCode + oDataSource.oCustomer.oPhone?.sMobile,
        sLandLine: oDataSource.oCustomer.oPhone?.sLandLine,
        oInvoiceAddress: oDataSource.oCustomer?.oInvoiceAddress
      };
    }
    const aTemplates = _template.data;

    oDialogComponent.contextChanged.next({
      transaction: oDataSource,
      transactionDetail: this.transaction,
      printActionSettings: this.printActionSettings,
      printSettings: this.printSettings,
      aUniqueItemTypes: aUniqueItemTypes,
      nRepairCount: nRepairCount,
      nOrderCount: nOrderCount,
      activityItems: this.activityItems,
      activity: this.activity,
      aTemplates: aTemplates,
      businessDetails: this.businessDetails
    });

    oDialogComponent.close.subscribe(() => { this.clearAll(); });
    oDialogComponent.triggerEvent.subscribe(() => { this.clearAll(); });

    if (bOrderCondition) {
      // print order receipt
      const orderTemplate = aTemplates.filter((template: any) => template.eType === 'order')[0];
      oDataSource.sActivityNumber = oDataSource.activity.sNumber;
      this.sendForReceipt(oDataSource, orderTemplate, oDataSource.activity.sNumber);
    }
    if (bRegularCondition) {
      //print proof of payments receipt
      const template = aTemplates.filter((template: any) => template.eType === 'regular')[0];
      this.sendForReceipt(oDataSource, template, oDataSource.sNumber, 'regular');
    }

    if (bRepairCondition) {
      if (this.bHasIActivityItemId) {
        this.bHasIActivityItemId = false;
        return;
      }
      //use two column layout
      const template = aTemplates.filter((template: any) => template.eType === 'repair')[0];
      oDataSource = this.activityItems.filter((item: any) => item.oType.eKind === 'repair')[0];
      oDataSource.sAdvisedEmpFirstName = this.employee?.sFirstName || 'a';
      const aTemp = oDataSource.sNumber.split("-");
      oDataSource.sPartRepairNumber = aTemp[aTemp.length - 1];
      this.sendForReceipt(oDataSource, template, oDataSource.sNumber);

    }

    if (bRepairAlternativeCondition) {
      // use repair_alternative laYout
      const template = aTemplates.filter((template: any) => template.eType === 'repair_alternative')[0];
      oDataSource = this.activityItems.filter((item: any) => item.oType.eKind === 'repair');
      oDataSource.sAdvisedEmpFirstName = this.employee?.sFirstName || 'a';
      oDataSource.forEach((data: any) => {
        data.sBusinessLogoUrl = _oLogoData.data;
        data.businessDetails = this.businessDetails;
        this.sendForReceipt(data, template, data.sNumber);
      })
    }
  }

  sendForReceipt(oDataSource: any, template: any, title: any, type?: any) {
    const printActionSettings = this.printActionSettings?.filter((pas: any) => pas.eType === type);
    if (printActionSettings?.length) {
      const aActionToPerform = printActionSettings[0].aActionToPerform;
      if (aActionToPerform.includes('PRINT_THERMAL')) {
        // console.log({ oDataSource , b: oDataSource.businessDetails})
        this.receiptService.printThermalReceipt({
          oDataSource: oDataSource,
          printSettings: this.printSettings,
          sAction: 'thermal',
          apikey: this.businessDetails.oPrintNode.sApiKey,
          title: oDataSource.sNumber,
          sType: type,
          sTemplateType: 'business-receipt'
        });
      }
      if (aActionToPerform.includes('DOWNLOAD') || aActionToPerform.includes('PRINT_PDF')) {
        const settings = this.printSettings.filter((s: any) => s.sMethod === 'pdf' && s.sType === type && s.iWorkstationId === this.iWorkstationId);

        this.receiptService.exportToPdf({
          oDataSource: oDataSource,
          pdfTitle: title,
          templateData: template,
          printSettings: settings,
          printActionSettings: this.printActionSettings,
          eSituation: 'is_created',
          sApiKey: this.businessDetails.oPrintNode.sApiKey
        });
      }
    }
  }

  getPrintSettings() {
    // console.log('gitprintsettings called')
    let oBody = {
      iLocationId: this.iLocationId,
      // oFilterBy: {}
    }
    // if (action) {
    //   oBody.oFilterBy = { sMethod: 'actions' };
    // }
    this.apiService.postNew('cashregistry', `/api/v1/print-settings/list/${this.iBusinessId}`, oBody).subscribe((result: any) => {
      if (result?.data?.length && result?.data[0]?.result?.length) {
        this.printSettings = [];
        result?.data[0]?.result.forEach((settings: any) => {
          if (settings?.sMethod === 'actions') {
            this.printActionSettings = settings?.aActions || [];
          } else {
            this.printSettings.push(settings);
          }
        })
      }
    });
  }

  getBase64FromUrl(url: any) {
    return this.apiService.getNew('cashregistry', `/api/v1/pdf/templates/getBase64/${this.iBusinessId}?url=${url}`).toPromise();
  }

  getTemplate(types: any) {
    const body = {
      iBusinessId: this.iBusinessId,
      iLocationId: this.iLocationId,
      oFilterBy: {
        eType: types
      }
    }
    return this.apiService.postNew('cashregistry', `/api/v1/pdf/templates`, body).toPromise();
  }

  getBusinessDetails() {
    return this.apiService.getNew('core', '/api/v1/business/' + this.iBusinessId);
    // this.businessDetails = result.data;
    // this.businessDetails.currentLocation = this.businessDetails?.aLocation?.filter((location: any) => location?._id.toString() == this.iLocationId.toString())[0];
    // this.tillService.selectCurrency(this.businessDetails.currentLocation);

    // this.http.get<any>(this.businessDetails.sLogoLight).subscribe((data: any) => {
    //   // console.log(data)
    // }, (error: any) => {
    //   this.businessDetails.sLogoLight = "local";
    // })
    // });
  }


  fetchBusinessPartnersProductCount(aBusinessPartnerId: any) {
    if (!aBusinessPartnerId.length || 1 > aBusinessPartnerId.length) {
      return;
    }
    var body = {
      iBusinessId: this.iBusinessId,
      aBusinessPartnerId
    };
    this.apiService.postNew('core', '/api/v1/business/partners/product-count', body).subscribe(
      (result: any) => {
        if (result && result.data) {
          const urls: any = [];
          result.data.forEach((element: any) => {
            if (element.businessproducts > 10) {
              urls.push({ name: element.sName, iBusinessPartnerId: element._id });
            }
          });
          if (urls.length > 0) {
            this.openWarningPopup(urls);
          }
        }
      },
      (error: any) => {
        // this.partnersList = [];
        console.log(error);
      }
    );
  }

  /* Search API for finding the  common-brands products */
  listShopProducts(searchValue: string | undefined, isFromEAN: boolean | false) {
    let data = {
      iBusinessId: this.iBusinessId,
      skip: 0,
      limit: 10,
      sortBy: '',
      sortOrder: '',
      searchValue: searchValue,
      aProjection: this.aProjection,
      oFilterBy: {
        oStatic: {},
        oDynamic: {}
      }
    }
    this.bSearchingProduct = true;
    this.apiService.postNew('core', '/api/v1/business/products/list', data).subscribe((result: any) => {
      if (result && result.data && result.data.length) {
        const response = result.data[0];
        this.shopProducts = response.result;
        this.shopProducts.map((el: any) => el.oCurrentLocation = el?.aLocation?.find((oLoc: any) => oLoc?._id?.toString() === this.iLocationId));
      }
      this.bSearchingProduct = false;
    }, (error) => {
      this.bSearchingProduct = false;
    });
  }

  listCommonBrandProducts(searchValue: string | undefined, isFromEAN: boolean | false) {
    let data = {
      iBusinessId: this.iBusinessId,
      skip: 0,
      limit: 10,
      sortBy: '',
      sortOrder: '',
      searchValue: searchValue,
      aProjection: this.aProjection,
      oFilterBy: {
        oStatic: {},
        oDynamic: {}
      }
    };
    this.bSearchingProduct = true;
    this.apiService.postNew('core', '/api/v1/products/commonbrand/list', data).subscribe((result: any) => {
      this.bSearchingProduct = false;
      if (result && result.data && result.data.length) {
        const response = result.data[0];
        this.commonProducts = response.result;
      }
    }, (error) => {
      this.bSearchingProduct = false;
    });
  }

  getBusinessProduct(iBusinessProductId: string): Observable<any> {
    return this.apiService.getNew('core', `/api/v1/business/products/${iBusinessProductId}?iBusinessId=${this.iBusinessId}`)
  }

  getBusinessProductList(aBusinessProductId: any): Observable<any> {
    const oBody = { iBusinessId: this.iBusinessId, aBusinessProductId: aBusinessProductId };
    return this.apiService.postNew('core', `/api/v1/business/products/list`, oBody);
  }

  getBaseProduct(iProductId: string): Observable<any> {
    return this.apiService.getNew('core', `/api/v1/products/${iProductId}?iBusinessId=${this.iBusinessId}`)
  }

  // Add selected product into purchase order
  async onSelectProduct(product: any, isFrom: string = '', isFor: string = '', source?: any) {
    // console.log('onSelectProduct', {product, isFrom, isFor, source})
    let nPriceIncludesVat = 0, nVatRate = 0;
    if (isFrom === 'quick-button') {
      source.loading = true;
      this.onSelectRegular();
      let selectedQuickButton = product;
      this.bSearchingProduct = true;
      this.bSearchingProduct = false;
      nPriceIncludesVat = selectedQuickButton.nPrice;
    }
    let currentLocation;
    if (isFor == 'commonProducts') {
      const _oBaseProductDetail = await this.getBaseProduct(product?._id).toPromise();
      product = _oBaseProductDetail.data;
    } else {
      const _oBusinessProductDetail = await this.getBusinessProduct(product?.iBusinessProductId || product?._id).toPromise();
      product = _oBusinessProductDetail.data;
      if (product?.aLocation?.length) {
        product.aLocation = product.aLocation.filter((oProdLoc: any) => {
          // console.log('oProdLoc: ', oProdLoc, this.aBusinessLocation);
          const oFound: any = this.aBusinessLocation.find((oBusLoc: any) => oBusLoc?._id?.toString() === oProdLoc?._id?.toString());
          if (oFound) {
            oProdLoc.sName = oFound?.sName;
            return oProdLoc;
          }

        })
        // console.log('Product location: ', product?.aLocation);
        currentLocation = product.aLocation.find((o: any) => o._id === this.iLocationId);
        if (currentLocation) {
          if (isFrom !== 'quick-button') nPriceIncludesVat = currentLocation?.nPriceIncludesVat || 0;
          nVatRate = currentLocation?.nVatRate || 0;
        }
      }
    }
    let name = (product?.oArticleGroup?.oName) ? ((product.oArticleGroup?.oName[this.selectedLanguage]) ? product.oArticleGroup?.oName[this.selectedLanguage] : product.oArticleGroup.oName['en']) : '';
    name += ' ' + (product?.sLabelDescription || '');
    name += ' ' + (product?.sProductNumber || '');
    this.transactionItems.push({
      name: name,
      eTransactionItemType: 'regular',
      type: this.eKind,
      quantity: 1,
      price: (isFor == 'commonProducts') ? product.nSuggestedRetailPrice : nPriceIncludesVat,
      nMargin: 1,
      nPurchasePrice: product.nPurchasePrice,
      paymentAmount: 0,
      oType: { bRefund: false, bDiscount: false, bPrepayment: false },
      nDiscount: product.nDiscount || 0,
      bDiscountOnPercentage: product.bDiscountOnPercentage || false,
      tax: nVatRate,
      sProductNumber: product.sProductNumber,
      sArticleNumber: product.sArticleNumber,
      description: '',//product.sLabelDescription,
      iArticleGroupId: product.iArticleGroupId,
      oArticleGroupMetaData: { aProperty: product.aProperty || [], sCategory: '', sSubCategory: '', oName: {}, oNameOriginal: {} },
      iBusinessBrandId: product.iBusinessBrandId || product.iBrandId,
      iBusinessProductId: isFor == 'commonProducts' ? undefined : product._id,
      iProductId: isFor == 'commonProducts' ? product._id : undefined,
      iBusinessPartnerId: product.iBusinessPartnerId, //'6274d2fd8f38164d68186410',
      sBusinessPartnerName: product.sBusinessPartnerName, //'6274d2fd8f38164d68186410',
      iSupplierId: product.iBusinessPartnerId,
      aImage: product.aImage,
      isExclude: false,
      // manualUpdate: false,
      open: true,
      new: true,
      isFor,
      oBusinessProductMetaData: this.tillService.createProductMetadata(product),
      eActivityItemStatus: (this.eKind === 'order') ? 'new' : 'delivered',
      oCurrentLocation: currentLocation,
      aLocation: product?.aLocation,
      bProductLoaded: true
    });
    if (isFrom === 'quick-button') { source.loading = false }
    this.resetSearch();
    this.clearPaymentAmounts();
    await this.updateFiskalyTransaction('ACTIVE', []);
  }

  resetSearch() {
    this.searchKeyword = '';
    this.shopProducts = [];
    this.commonProducts = [];
  }

  search() {
    this.shopProducts = [];
    this.commonProducts = [];
    if (this.bSerialSearchMode) {
      this.listShopProductsBySerial(this.searchKeyword, false);
    } else {
      this.listShopProducts(this.searchKeyword, false);
      if (!this.isStockSelected) {
        this.listCommonBrandProducts(this.searchKeyword, false); // Searching for the products of common brand
      }
    }
  }

  listShopProductsBySerial(searchValue: string | undefined, isFromEAN: boolean | false) {
    let data = {
      iBusinessId: this.iBusinessId,
      sSerialNumber: searchValue,
    }
    this.bSearchingProduct = true;
    this.shopProducts = [];
    this.apiService.postNew('core', '/api/v1/business/products/list-by-serial-number', data).subscribe((result: any) => {
      this.bSearchingProduct = false;
      if (result?.data?.length) {
        this.shopProducts = result.data;
      }
    }, (error) => {
      this.bSearchingProduct = false;
    });
  }

  addNewLine() {
    this.transactionItems.push({
      name: '',
      type: 'empty-line',
      quantity: 1,
      price: 0,
      nDiscount: 0,
      bDiscountOnPercentage: false,
      tax: 0,
      description: '',
      open: true,
    });
  }

  getParkedTransactionBody(): Object {
    const body = {
      aTaxes: this.taxes,
      aTransactionItems: this.transactionItems,
      oCustomer: this.customer,
      // searchKeyword: this.searchKeyword,
      // shopProducts: this.shopProducts,
      iBusinessId: this.iBusinessId,
      iSupplierId: this.supplierId,
      iActivityId: this.iActivityId,
      bIsStockSelected: this.isStockSelected,
      aPayMethods: this.payMethods,
      oBusiness: this.business,
      iLocationId: this.iLocationId,
      oRequestParams: this.requestParams,
    };
    return body;
  }
  park() {
    this.apiService.postNew('cashregistry', `/api/v1/park?iBusinessId=${this.iBusinessId}`, this.getParkedTransactionBody())
      .subscribe((data: any) => {
        this.parkedTransactions.unshift({
          _id: data?._id.toString(),
          dUpdatedDate: data?.dUpdatedDate.toString(),
          sNumber: data?.sNumber.toString()
        })
        this.toastrService.show({ type: 'success', text: this.translateService.instant('TRANSACTION_PARKED') })

      }, err => {
        this.toastrService.show({ type: 'danger', text: err.message });
      });
    this.clearAll();
  }

  getParkedTransactions() {
    this.apiService.getNew('cashregistry', `/api/v1/park?iBusinessId=${this.iBusinessId}`).subscribe((data: any) => {
      this.parkedTransactions = data;

    }, err => {
      this.toastrService.show({ type: 'danger', text: err.message });
    });
  }

  fetchParkedTransactionInfo() {
    this.parkedTransactionLoading = true;
    this.apiService.getNew('cashregistry', `/api/v1/park/${this.selectedTransaction._id}?iBusinessId=${this.iBusinessId}`)
      .subscribe((transactionInfo: any) => {
        this.taxes = transactionInfo.aTaxes;
        this.transactionItems = transactionInfo.aTransactionItems;
        this.customer = transactionInfo.oCustomer;
        this.iBusinessId = transactionInfo.iBusinessId;
        this.supplierId = transactionInfo.iSupplierId;
        this.iActivityId = transactionInfo.iActivityId;
        this.isStockSelected = transactionInfo.bIsStockSelected;
        this.payMethods = transactionInfo.aPayMethods;
        this.business = transactionInfo.oBusiness;
        this.iLocationId = transactionInfo.iLocationId;
        this.requestParams = transactionInfo.oRequestParams;
        this.parkedTransactionLoading = false;
      }, err => {
        this.toastrService.show({ type: 'danger', text: err.message });
        this.parkedTransactionLoading = false;
      });
  }

  updateParkedTransaction() {
    this.apiService.putNew('cashregistry', `/api/v1/park/${this.selectedTransaction._id}?iBusinessId=${this.iBusinessId}`, this.getParkedTransactionBody())
      .subscribe((data: any) => {
        this.toastrService.show({ type: 'success', text: data.message });
      }, err => {
        this.toastrService.show({ type: 'danger', text: err.message });
      });
  }

  deleteParkedTransaction() {
    let vm = this;
    this.apiService.deleteNew('cashregistry', `/api/v1/park/${this.selectedTransaction._id}?iBusinessId=${this.iBusinessId}`)
      .subscribe((data: any) => {
        this.toastrService.show({ type: 'success', text: data.message });
        this.parkedTransactions = this.parkedTransactions.filter(function (item) {
          return item._id !== vm.selectedTransaction._id;
        });

        vm.clearAll();
      }, err => {
        this.toastrService.show({ type: 'danger', text: err.message });
      });
  }

  openExpenses() {
    const paymentMethod = this.payMethods.find((o: any) => o.sName.toLowerCase() === 'cash');
    this.dialogService.openModal(AddExpensesComponent, { cssClass: 'modal-m', context: { paymentMethod, taxes: this.taxes } })
      .instance.close.subscribe(result => {
      });
  }

  openCardsModal(oGiftcard?: any) {
    this.dialogService.openModal(CardsComponent, { cssClass: 'modal-lg', context: { customer: this.customer, oGiftcard } })
      .instance.close.subscribe(result => {
        if (result) {
          if (result.giftCardInfo.nAmount > 0) {
            this.appliedGiftCards.push(result.giftCardInfo);
            this.changeInPayment();
          }
          if (result.redeemedLoyaltyPoints && result.redeemedLoyaltyPoints > 0) {
            this.addReedemedPoints(result.redeemedLoyaltyPoints);
          }
        }
      });
  }


  openMorePaymentMethodModal() {
    this.dialogService.openModal(MorePaymentsDialogComponent, { cssClass: 'modal-l', context: this.allPaymentMethod })
      .instance.close.subscribe(result => {
        if (result) {
          this.payMethods.push(_.clone(result));
        }
      });
  }

  removeGift(index: any) {
    this.appliedGiftCards.splice(index, 1);
    this.changeInPayment();
  }

  fetchTerminals() {
    let cardPayments = ['card'];
    this.terminalService.getTerminals()
      .subscribe((res) => {
        this.terminals = res;
        if (1 > this.terminals.length) {
          cardPayments = ['maestro', 'mastercard', 'visa'];
        }
        this.allPaymentMethod.forEach((element: any) => {
          if (cardPayments.includes(element.sName.toLowerCase())) {
            this.payMethods.push(_.clone(element));
          }
        });
      }, err => {
        this.toastrService.show({ type: 'danger', text: err.message });
      });
  }

  async addReedemedPoints(redeemedLoyaltyPoints: number) {
    let result:any;
    result = await this.createArticleGroupService.checkArticleGroups('Loyalty Points').toPromise();
    let iArticleGroupId = '';
    if(result?.data?.length && result?.data[0]?.result?.length) {
      iArticleGroupId = result?.data[0]?.result[0]?._id;
    } else {
      const articleBody = { name: 'Loyalty Points', sCategory: 'Loyalty Points', sSubCategory: 'Loyalty Points' };
      result = await this.createArticleGroupService.createArticleGroup(articleBody);
      if(result?.data) {
        iArticleGroupId = result?.data?._id;
      }
    }
    this.transactionItems.push({
      name: 'Loyalty Points',
      type: 'loyalty-points',
      eTransactionType: 'loyalty-points',
      quantity: 1,
      iArticleGroupId: iArticleGroupId,
      nRedeemedLoyaltyPoints: redeemedLoyaltyPoints,
      redeemedLoyaltyPoints,
      price: 0,
      nDiscount: 0,
      bDiscountOnPercentage: false,
      oType: { bRefund: false, bDiscount: false, bPrepayment: false },
      tax: 0,
      description: '',
      oArticleGroupMetaData: { aProperty: [], sCategory: '', sSubCategory: '', oName: {}, oNameOriginal: {} },
      open: false,
    });
    this.redeemedLoyaltyPoints = redeemedLoyaltyPoints;
    this.clearPaymentAmounts();
  }

  openDayState() {
    const oBody = {
      iBusinessId: this.iBusinessId,
      iLocationId: this.iLocationId,
      iWorkstationId: this.iWorkstationId
    }
    this.bIsOpeningDayState = true;
    this.apiService.postNew('cashregistry', `/api/v1/statistics/open/day-state`, oBody).subscribe((result: any) => {
      this.bIsOpeningDayState = false;
      if (result?.message === 'success') {
        this.bIsDayStateOpened = true;
        if (this.bIsDayStateOpened) this.fetchQuickButtons();
        this.toastrService.show({ type: 'success', text: `Day-state is open now` });
      }
    }, (error) => {
      this.bIsOpeningDayState = false;
      this.toastrService.show({ type: 'warning', text: `Day-state is not open` });
    })
  }

  checkArticleGroups() {
    this.createArticleGroupService.checkArticleGroups('Discount')
      .subscribe((res: any) => {
        if (1 > res.data.length) {
          this.createArticleGroup();
        } else {
          this.discountArticleGroup = res.data[0].result[0];
        }
      }, err => {
        this.toastrService.show({ type: 'danger', text: err.message });
      });
  }

  async createArticleGroup() {
    const articleBody = { name: 'Discount', sCategory: 'Discount', sSubCategory: 'Discount' };
    const result: any = await this.createArticleGroupService.createArticleGroup(articleBody);
    this.discountArticleGroup = result.data;
  }

  fetchQuickButtons() {
    this.bSearchingProduct = true;
    try {
      this.apiService.getNew('cashregistry', `/api/v1/quick-buttons/${this.requestParams.iBusinessId}?iLocationId=${this.iLocationId}`).subscribe((result: any) => {

        this.bSearchingProduct = false;
        if (result?.length) {
          this.quickButtons = result;
        }
      }, (error) => {
        this.bSearchingProduct = false;
      })
    } catch (e) {
      this.bSearchingProduct = false;
    }
  }

  checkDayState() {
    const oBody = {
      iBusinessId: this.iBusinessId,
      iLocationId: this.iLocationId,
      iWorkstationId: this.iWorkstationId
    }
    this.bDayStateChecking = true;
    this.dayClosureCheckSubscription = this.apiService.postNew('cashregistry', `/api/v1/statistics/day-closure/check`, oBody).subscribe(async (result: any) => {
      if (result?.data) {
        this.bDayStateChecking = false;
        this.bIsDayStateOpened = result?.data?.bIsDayStateOpened;
        if (this.bIsDayStateOpened) {
          this.bIsTransactionLoading = true;
          this.fetchQuickButtons();
        }
        if (result?.data?.oStatisticDetail?.dOpenDate) {
          this.dOpenDate = result?.data?.oStatisticDetail?.dOpenDate;
          await this.tillService.fetchSettings();
          let nDayClosurePeriodAllowed = 0;
          if (this.tillService.settings?.sDayClosurePeriod && this.tillService.settings.sDayClosurePeriod === 'week') {
            nDayClosurePeriodAllowed = 3600 * 24 * 7;
          } else {
            nDayClosurePeriodAllowed = 3600 * 24;
          }

          /* Show Close day state warning when Day-state is close according to settings day/week */
          const nOpenTimeSecond = new Date(this.dOpenDate).getTime();
          const nCurrentTimeSecond = new Date().getTime();

          const nDifference = (nCurrentTimeSecond - nOpenTimeSecond) / 1000;
          if (nDifference > nDayClosurePeriodAllowed) this.bIsPreviousDayStateClosed = false;
        }
      }
    }, (error) => {
      console.error('Error here: ', error);
      this.toastrService.show({ type: 'warning', text: `Day-state is not closed` });
    })
  }

  assignAllAmount(index: number) {
    this.payMethods[index].amount = -(this.getUsedPayMethods(true) - this.getTotals('price'));
    this.changeInPayment();
    this.createTransaction();
  }

  switchMode() {
    if (this.eKind === 'giftcard' || this.eKind === 'gold-purchase' || this.eKind === 'repair')
      this.eKind = 'regular';
  }

  async startFiskalyTransaction() {
    if (!this.bIsFiscallyEnabled) return;
    try {
      const res = await this.fiskalyService.startTransaction();
      localStorage.setItem('fiskalyTransaction', JSON.stringify(res));
    } catch (error: any) {
      if (error.error.code === 'E_UNAUTHORIZED') {
        localStorage.removeItem('fiskalyAuth');
        await this.startFiskalyTransaction();
      }
    }
  }

  async updateFiskalyTransaction(state: string, payments: []) {
    if (!this.bIsFiscallyEnabled) return;
    const pay = _.clone(payments);
    try {
      if (!localStorage.getItem('fiskalyTransaction')) {
        await this.startFiskalyTransaction();
      }
      const result = await this.fiskalyService.updateFiskalyTransaction(this.transactionItems, pay, state);
      if (state === 'FINISHED') {
        localStorage.removeItem('fiskalyTransaction');
      } else {
        localStorage.setItem('fiskalyTransaction', JSON.stringify(result));
      }
    } catch (error: any) {
      if (error?.error?.code === 'E_UNAUTHORIZED') {
        await this.updateFiskalyTransaction(state, payments);
      }
    }
  }

  async cancelFiskalyTransaction() {
    if (!this.bIsFiscallyEnabled) return;
    try {
      if (localStorage.getItem('fiskalyTransaction')) {
        await this.fiskalyService.updateFiskalyTransaction(this.transactionItems, [], 'CANCELLED');
        localStorage.removeItem('fiskalyTransaction');
      }
      // this.fiskalyService.clearAll();
    } catch (error) {
      localStorage.removeItem('fiskalyTransaction');
      this.fiskalyService.clearAll();
    }
  }

  openWarningPopup(urls: any): void {
    this.dialogService.openModal(SupplierWarningDialogComponent, { cssClass: 'modal-lg', context: { urls } })
      .instance.close.subscribe((data) => {
      })
  }

  async openModal(barcode: any) {
    if (barcode.startsWith('0002'))
      barcode = barcode.substring(4)
    this.toastrService.show({ type: 'success', text: 'Barcode detected: ' + barcode })
    if (barcode.startsWith("AI")) {
      let oBody: any = {
        iBusinessId: this.iBusinessId,
        oFilterBy: {
          sNumber: barcode
        }
      }
      const activityItemResult: any = await this.apiService.postNew('cashregistry', `/api/v1/activities/activity-item`, oBody).toPromise();
      if (activityItemResult?.data[0]?.result?.length) {

        oBody = {
          iBusinessId: this.iBusinessId,
        }
        const iActivityId = activityItemResult?.data[0].result[0].iActivityId;
        const iActivityItemId = activityItemResult?.data[0].result[0]._id;
        this.openTransaction({ _id: iActivityId }, 'activity', [iActivityItemId]);
      }
    } else if (barcode.startsWith("T")) {

      const oBody = {
        iBusinessId: this.iBusinessId,
        searchValue: barcode
      }
      const result: any = await this.apiService.postNew('cashregistry', '/api/v1/transaction/search', oBody).toPromise();
      if (result?.transactions?.records?.length) {
        this.openTransaction(result?.transactions?.records[0], 'transaction');
      }
      //transactions.find({sNumber: barcode})
    } else if (barcode.startsWith("A")) {

      const oBody = {
        iBusinessId: this.iBusinessId,
        searchValue: barcode
      }
      const result: any = await this.apiService.postNew('cashregistry', '/api/v1/transaction/search', oBody).toPromise();
      if (result?.activities?.records?.length) {
        this.openTransaction(result?.activities?.records[0], 'activity');
      }
      //activity.find({sNumber: barcode})
    } else if (barcode.startsWith("G")) {
      let oBody: any = {
        iBusinessId: this.iBusinessId,
        oFilterBy: {
          sGiftCardNumber: barcode.substring(2)
        }
      }
      let result: any = await this.apiService.postNew('cashregistry', `/api/v1/activities/activity-item`, oBody).toPromise();
      if (result?.data[0]?.result?.length) {
        const oGiftcard = result?.data[0]?.result[0];
        this.openCardsModal(oGiftcard)
      }
      // activityitem.find({sGiftcardNumber: barcode},{eTransactionItem.eKind : 1})
    } else if (barcode.startsWith("R")) {
      // activityitem.find({sRepairNumber: barcode},{eTransactionItem.eKind : 1})
    }

  }

  openTransaction(transaction: any, itemType: any, aSelectedIds?: any) {
    this.dialogService.openModal(TransactionItemsDetailsComponent, { cssClass: "modal-xl", context: { transaction, itemType, aSelectedIds } })
      .instance.close.subscribe(result => {
        const transactionItems: any = [];
        if (result?.transaction) {
          result.transactionItems.forEach((transactionItem: any) => {
            if (transactionItem.isSelected) {
              const { tType } = transactionItem;
              let paymentAmount = transactionItem.nQuantity * transactionItem.nPriceIncVat - transactionItem.nPaidAmount;
              if (tType === 'refund') {
                paymentAmount = 0;
                transactionItem.oType.bRefund = true;
              } else if (tType === 'revert') {
                paymentAmount = transactionItem.nPaidAmount;
                transactionItem.oType.bRefund = false;
              };
              transactionItems.push({
                name: transactionItem.sProductName || transactionItem.sProductNumber,
                iActivityItemId: transactionItem.iActivityItemId,
                nRefundAmount: transactionItem.nPaidAmount,
                iLastTransactionItemId: transactionItem.iTransactionItemId,
                prePaidAmount: tType === 'refund' ? transactionItem.nPaidAmount : transactionItem.nPaymentAmount,
                type: transactionItem.sGiftCardNumber ? 'giftcard' : transactionItem.oType.eKind,
                eTransactionItemType: 'regular',
                nBrokenProduct: 0,
                tType,
                oType: transactionItem.oType,
                sUniqueIdentifier: transactionItem.sUniqueIdentifier,
                aImage: transactionItem.aImage,
                nonEditable: transactionItem.sGiftCardNumber ? true : false,
                sGiftCardNumber: transactionItem.sGiftCardNumber,
                quantity: transactionItem.nQuantity,
                iBusinessProductId: transactionItem.iBusinessProductId,
                price: transactionItem.nPriceIncVat,
                iRepairerId: transactionItem.iRepairerId,
                oArticleGroupMetaData: transactionItem.oArticleGroupMetaData,
                nRedeemedLoyaltyPoints: transactionItem.nRedeemedLoyaltyPoints,
                iArticleGroupId: transactionItem.iArticleGroupId,
                iEmployeeId: transactionItem.iEmployeeId,
                iAssigneeId: transactionItem.iAssigneeId,
                iBusinessBrandId: transactionItem.iBusinessBrandId,
                nDiscount: transactionItem.nDiscount || 0,
                bDiscountOnPercentage: transactionItem.nDiscount || 0,
                tax: transactionItem.nVatRate,
                oGoldFor: transactionItem.oGoldFor,
                iSupplierId: transactionItem.iSupplierId,
                paymentAmount,
                description: transactionItem.sDescription,
                open: true,
                nMargin: transactionItem.nMargin,
                nPurchasePrice: transactionItem.nPurchasePrice,
                oBusinessProductMetaData: transactionItem.oBusinessProductMetaData,
                sServicePartnerRemark: transactionItem.sServicePartnerRemark,

                sCommentVisibleServicePartner: transactionItem.sCommentVisibleServicePartner,
                eActivityItemStatus: transactionItem.eActivityItemStatus,
                eEstimatedDateAction: transactionItem.eEstimatedDateAction,
                bGiftcardTaxHandling: transactionItem.bGiftcardTaxHandling,
              });
            }
          });
          result.transactionItems = transactionItems;
          this.handleTransactionResponse(result);
        }
      });
  }

  async handleTransactionResponse(data: any) {
    // console.log('handleTransactionResponse', data)
    this.clearAll();
    const { transactionItems, transaction } = data;
    this.transactionItems = transactionItems;
    this.iActivityId = transaction.iActivityId || transaction._id;
    this.sNumber = transaction?.sNumber;

    for (const item of this.transactionItems) {
      if (item?.iBusinessProductId && !item?.oCurrentLocation) {
        // console.log('fetching business product again');
        const _oBusinessProductDetail: any = await this.getBusinessProduct(item?.iBusinessProductId).toPromise();
        const product = _oBusinessProductDetail.data;
        if (product?.aLocation?.length) {
          item.aLocation = product.aLocation.filter((oProdLoc: any) => {
            // console.log('oProdLoc: ', oProdLoc, this.aBusinessLocation);
            const oFound: any = this.aBusinessLocation.find((oBusLoc: any) => oBusLoc?._id?.toString() === oProdLoc?._id?.toString());
            if (oFound) {
              oProdLoc.sName = oFound?.sName;
              return oProdLoc;
            }
          })
          item.oCurrentLocation = product.aLocation.find((o: any) => o._id === this.iLocationId);
          item.bProductLoaded = true;
        }
      }
    }

    if (transaction.iCustomerId && !this.customer) {
      this.fetchCustomer(transaction.iCustomerId);
    }
    this.changeInPayment();
    this.bIsTransactionLoading = false;
    await this.updateFiskalyTransaction('ACTIVE', []);
  }


  ngOnDestroy() {
    localStorage.removeItem('fromTransactionPage');
    localStorage.removeItem('recentUrl');
    this.cancelFiskalyTransaction();
    if (this.getSettingsSubscription) this.getSettingsSubscription.unsubscribe();
    if (this.dayClosureCheckSubscription) this.dayClosureCheckSubscription.unsubscribe();
    // console.log('cashregister destroy')
    MenuComponent.clearEverything();

  }

  openDrawer() {
    const aThermalSettings = this.printSettings?.filter((settings: any) => settings.sMethod === 'thermal' && settings.iWorkstationId === this.iWorkstationId)
    const oSettings = aThermalSettings?.find((s: any) => s.sType === 'regular' && s.nComputerId && s.nPrinterId);
    if (oSettings) {
      this.receiptService.openDrawer(this.businessDetails.oPrintNode.sApiKey, oSettings.nPrinterId, oSettings.nComputerId,)
    } else {
      this.toastrService.show({ type: 'warning', text: 'Error while opening cash drawer. Please check your print settings!' })
    }

  }

  articleGroupDataChange(oStaticData: any) {
    // console.log('articleGroupDataChange', oStaticData)
    this.oStaticData = oStaticData;
  }
}
