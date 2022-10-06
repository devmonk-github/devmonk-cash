import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { faLongArrowAltDown, faLongArrowAltUp, faMinusCircle, faPlus, faPlusCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../shared/service/api.service';
import { DialogService } from '../shared/service/dialog';
import { MenuComponent } from '../shared/_layout/components/common';

import { TransactionDetailsComponent } from './components/transaction-details/transaction-details.component';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.sass']
})
export class TransactionsComponent implements OnInit {
  option: boolean = true;
  faSearch = faSearch;
  faIncrease = faPlusCircle;
  faDecrease = faMinusCircle;
  faArrowUp = faLongArrowAltUp;
  faArrowDown = faLongArrowAltDown;
  cities = [
    { name: 'Amsterdam', code: 'AMS' },
    { name: 'Bruxelles', code: 'BRU' },
    { name: 'Paris', code: 'PAR' },
    { name: 'Instanbul', code: 'INS' }
  ];
  selectedCity: string = '';
  transactions: Array<any> = [];
  TIEkinds: Array<any> = ['regular', 'giftcard', 'repair', 'order', 'gold-purchase', 'gold-sell', 'discount'];
  paymentMethods:  Array<any> =  [];
  businessDetails: any = {};
  userType: any = {};
  requestParams: any = {
    methods: [],
    TIEKinds: [],
    workstations: [],
    locations: [],
    invoiceStatus: 'all',
    importStatus: 'all',
    iBusinessId: "",
    skip: 0,
    limit: 10,
    searchValue: '',
    sortBy: 'dCreatedDate',
    sortOrder: 'desc'
  };
  showLoader: Boolean = false;
  widgetLog: string[] = [];
  pageCounts: Array<number> = [10, 25, 50, 100]
  pageNumber: number = 1;
  setPaginateSize: number = 10;
  paginationConfig: any = {
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  };
  showAdvanceSearch = false;
  transactionMenu = [
    { key: 'REST_PAYMENT' },
    { key: 'REFUND/REVERT' },
    { key: 'PREPAYMENT' },
    { key: 'MARK_CONFIRMED' },
  ];
  iBusinessId: any = '';
  iLocationId: any = '';

  // Advance search fields 

  filterDates: any = {
    endDate: new Date(new Date().setHours(23, 59, 59)),
    startDate: new Date('01-01-2015'),
  }

  transactionStatuses: Array<any> = ['ALL', 'EXPECTED_PAYMENTS', 'NEW', 'CANCELLED', 'FAILED', 'EXPIRED', 'COMPLETED', 'REFUNDED'];
  employee: any = { sFirstName: 'All' };
  employees: Array<any> = [this.employee];
  workstations: Array<any> = [];
  selectedTransactionStatuses: Array<any> = [];
  locations: Array<any> = [];
  eType: string = '';

  tableHeaders: Array<any> = [
    { key: 'Date', selected: true, sort: 'desc' },
    { key: 'Transaction no.', selected: false, sort: '' },
    { key: 'Receipt number', selected: false, sort: '' },
    { key: 'Customer', selected: false, sort: '' },
    { key: 'Methods', disabled: true },
    { key: 'Total', disabled: true },
    { key: 'Type', disabled: true }
  ]


  constructor(
    private apiService: ApiService,
    private dialogService: DialogService,
    private routes: Router
  ) { }

  async ngOnInit() {
    if (this.routes.url.includes('/business/web-orders')) this.eType = 'webshop-revenue';
    else if (this.routes.url.includes('/business/reservations')) this.eType = 'webshop-reservation';
    else this.eType = 'cash-register-revenue';

    this.businessDetails._id = localStorage.getItem("currentBusiness");
    this.userType = localStorage.getItem("type");
    // this.loadTransaction();
    this.showTransaction({
      "iBusinessId": "6182a52f1949ab0a59ff4e7b",
      "iBusinessPartnerId": null,
      "sNumber": "T3104-031022-1217",
      "sInvoiceNumber": "0002689",
      "eType": "cash-register-revenue",
      "oCustomer": {
        "oPhone": {
          "bWhatsApp": false
        },
        "oShippingAddress": {
          "attn": {
            "sSalutation": "",
            "sFirstName": "",
            "sLastName": "3772"
          },
          "sStreet": "Middlewerg",
          "sHouseNumber": "10",
          "sHouseNumberSuffix": "",
          "sPostalCode": "3772 TP",
          "sCity": "Asperen",
          "sCountry": "NL"
        },
        "oInvoiceAddress": {
          "attn": {
            "sSalutation": "",
            "sFirstName": "",
            "sLastName": "3772"
          },
          "sStreet": "Middlewerg",
          "sHouseNumber": "10",
          "sHouseNumberSuffix": "",
          "sPostalCode": "3772 TP",
          "sCity": "Asperen",
          "sCountry": "NL"
        },
        "oPoints": {
          "spendable": 0,
          "history": []
        },
        "bIsEmailVerified": false,
        "bCounter": true,
        "sEmail": "balieklant@prismanote.com",
        "sForgotPasswordString": "",
        "sEmailVerificationCode": "",
        "bNewsletter": false,
        "eStatus": "y",
        "aGroups": [],
        "_id": "628497022dc7085368db8db0",
        "sFirstName": "Balie",
        "sLastName": "Klant",
        "aMails": [],
        "aExtraFields": [],
        "dCreatedDate": "2022-05-18T06:49:38.776Z",
        "dUpdatedDate": "2022-05-18T06:49:38.776Z",
        "__v": 0
      },
      "sReceiptNumber": "0002689",
      "dCreatedDate": "03-10-2022 03:47",
      "eStatus": "y",
      "eTransactionStatus": "inspection",
      "iActivityId": "633ab6ca9b30a93264dca7bf",
      "aTransactionItems": [
        {
          "_id": "633ab6ca9b30a93264dca7c2",
          "oType": {
            "bPrepayment": false,
            "eTransactionType": "cash-registry",
            "bRefund": false,
            "eKind": "regular",
            "bDiscount": false
          },
          "oBusinessProductMetaData": {
            "bBestseller": false,
            "bHasStock": false,
            "bShowSuggestion": false,
            "aImage": [
              "https://prismanote.s3.amazonaws.com/A00301-05.jpg"
            ],
            "eOwnerShip": "possession",
            "iSupplierId": "6275661d5732a79bf0e3f449",
            "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
            "iBusinessBrandId": "62b426627ee2c637cc3879d5",
            "sLabelDescription": "asdfasdf",
            "aProperty": [
              {
                "iPropertyId": "61160712ae3cbb7453177f98",
                "sPropertyName": "Category",
                "iPropertyOptionId": "61f01aa45fc7504de957b258",
                "sPropertyOptionName": "WATCH"
              },
              {
                "iPropertyId": "6262fc7c25f45755f3d648bd",
                "sPropertyName": "WATCH_TYPE",
                "iPropertyOptionId": "62e8bd0ac2910b2073515c3c",
                "sPropertyOptionName": "WRIST"
              },
              {
                "iPropertyId": "6261a5f76d3ec230f0886eee",
                "sPropertyName": "Watch case material",
                "iPropertyOptionId": "62e8bd09c2910b2073515bb2",
                "sPropertyOptionName": "GOLD"
              },
              {
                "iPropertyId": "6262ff0d25f45755f3d648cf",
                "sPropertyName": "hasDateFunction",
                "iPropertyOptionId": "62e8bd0bc2910b2073515c5e",
                "sPropertyOptionName": "YES"
              },
              {
                "iPropertyId": "6262fba225f45755f3d648bb",
                "sPropertyName": "WATCH_STRAP_COLOR",
                "iPropertyOptionId": "62e8bd0ac2910b2073515c33",
                "sPropertyOptionName": "GREY"
              }
            ],
            "oName": {
              "en": "p8-151",
              "nl": "p8-151",
              "de": "p8-151",
              "fr": "p8-151"
            },
            "oShortDescription": {
              "nl": "dfsdfdfasasdf",
              "en": "asdfasdfasdf",
              "de": "",
              "fr": ""
            },
            "eGender": "female"
          },
          "eEstimatedDateAction": "call_on_ready",
          "aImage": [
            "https://prismanote.s3.amazonaws.com/A00301-05.jpg"
          ],
          "nRevenueAmount": 200,
          "nCostOfRevenue": 100,
          "nProfitOfRevenue": 65.28925619834712,
          "nQuantity": 1,
          "nAppliedStock": 0,
          "bPaymentDiscount": false,
          "bPaymentDiscountPercent": false,
          "bImported": false,
          "bIsInvoiced": false,
          "eStatus": "y",
          "sProductName": "p8-151",
          "sProductNumber": "P8-151",
          "nPriceIncVat": 200,
          "nPurchasePrice": 100,
          "bEntryMethodCustomerValue": null,
          "nVatRate": 21,
          "nReceivedQuantity": null,
          "sArticleNumber": "00017027964",
          "nMargin": 1,
          "nExtraLabel": null,
          "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
          "iBusinessId": "6182a52f1949ab0a59ff4e7b",
          "iArticleGroupId": "631f46857ac07d4fe8309278",
          "iArticleGroupOriginalId": "631f46857ac07d4fe8309278",
          "oArticleGroupMetaData": {
            "aProperty": [
              {
                "iPropertyId": "61160712ae3cbb7453177f98",
                "sPropertyName": "Category",
                "sPropertyOptionName": "WATCH",
                "iPropertyOptionId": "61f01aa45fc7504de957b258",
                "sCode": "WA"
              },
              {
                "iPropertyId": "6261a5f76d3ec230f0886eee",
                "sPropertyName": "Watch case material",
                "sPropertyOptionName": "TITANIUM",
                "iPropertyOptionId": "62e8bd09c2910b2073515bad",
                "sCode": "TI"
              }
            ],
            "oName": {
              "nl": "Prisma127",
              "en": "Prisma127",
              "de": "Prisma127",
              "fr": "Prisma127"
            },
            "oNameOriginal": {
              "nl": "Prisma127",
              "en": "Prisma127",
              "de": "Prisma127",
              "fr": "Prisma127"
            }
          },
          "aPayments": [
            {
              "iPaymentMethodId": "6243ff1a0ab1c8da110423f4",
              "sMethod": "cash",
              "nAmount": 200
            }
          ],
          "sProductCategory": "CATEGORY",
          "iParentTransactionDetailId": null,
          "nPaymentAmount": 200,
          "nProductSize": null,
          "nProductSizeFor": null,
          "iBusinessBrandId": "62b426627ee2c637cc3879d5",
          "iBusinessProductId": "632db32152f9d367781e0813",
          "iWorkstationId": "632ac16d10f3247770f75236",
          "iLocationId": "623b4f531d7d736c686b51f1",
          "iSupplierId": "6275661d5732a79bf0e3f449",
          "iTransactionId": "633ab6ca9b30a93264dca7be",
          "nDiscount": 0,
          "sUniqueIdentifier": "7112cf9c-6370-437c-bc89-9d88cee4b7bd",
          "sDescription": "asdfasdf",
          "nGrossProfitMarginExVat": 65.28925619834712,
          "iCustomerId": "628497022dc7085368db8db0",
          "sTransactionNumber": "T3104-031022-1217",
          "nSavingsPoints": 20,
          "aProductVariant": [],
          "iActivityItemId": "633ab6ca9b30a93264dca7c3",
          "dCreatedDate": "2022-10-03T10:17:46.176Z",
          "dUpdatedDate": "2022-10-03T10:17:46.176Z",
          "__v": 0,
          "description": "Prisma127 asdfasdf P8-151",
          "nDiscountToShow": 0,
          "priceAfterDiscount": 200,
          "nPriceIncVatAfterDiscount": 200,
          "totalPaymentAmount": 200,
          "totalPaymentAmountAfterDisc": 200,
          "bPrepayment": false,
          "vat": "34.71",
          "related": []
        }
      ],
      "count": {
        "totalData": 1856
      },
      "aPayments": [
        {
          "iPaymentMethodId": "6243ff1a0ab1c8da110423f4",
          "sMethod": "cash",
          "nAmount": 200,
          "dCreatedDate": "03-10-2022 03:47"
        }
      ],
      "_id": "633ab6ca9b30a93264dca7be",
      "total": 200,
      "totalAfterDisc": 200,
      "totalVat": 34.71,
      "totalDiscount": 0,
      "totalSavingPoints": 20,
      "related": [],
      "businessDetails": {
        "_id": "6182a52f1949ab0a59ff4e7b",
        "oPhone": {
          "bWhatsApp": false,
          "sLandLine": "0123 456 78",
          "sMobile": "06 100 001 01"
        },
        "aCoordinate": [],
        "eValuationProfitMethod": "average-purchase-price",
        "eType": "default",
        "sName": "Juwelier Bos - Test Shop",
        "sEmail": "neworg10@neworg.com",
        "sBusinessCode": "00017",
        "aBankDetail": [],
        "aCategory": [
          {
            "aSubCategory": [
              "Bracelet",
              "Brooch",
              "Charm",
              "Choker",
              "Ring",
              "Beauty jewels"
            ],
            "_id": "617127d855a9427f77118fbd",
            "sName": "JEWEL"
          },
          {
            "aSubCategory": [
              "Wrist watch",
              "Pocket watch",
              "Nurse watch",
              "Smartwatch",
              "Swekwatch"
            ],
            "_id": "628247c5951e1771e4569cbe",
            "sName": "WATCH"
          }
        ],
        "aLocation": [
          {
            "oAddress": {
              "attn": {
                "salution": "Hon",
                "firstName": "Jolmer2",
                "lastNamePrefix": "Van",
                "lastName": "Ekeren"
              },
              "street": "Middleweg3",
              "houseNumber": "8",
              "houseNumberSuffix": "b",
              "postalCode": "1456G",
              "city": "Asperen",
              "country": "India",
              "countryCode": "IN",
              "state": "Utrech"
            },
            "bIsWebshop": true,
            "_id": "623b4f531d7d736c686b51f1",
            "sName": "Webshop",
            "oPrintNode": {
              "bEnabled": true,
              "nAccountId": 5555
            }
          },
          {
            "oAddress": {
              "attn": {
                "firstName": "firstname",
                "lastName": "lastname",
                "lastNamePrefix": "f",
                "salution": ""
              },
              "street": "Street name",
              "houseNumber": "1",
              "houseNumberSuffix": "test",
              "postalCode": "",
              "city": "test city",
              "country": "India",
              "countryCode": "IN",
              "state": "state"
            },
            "bIsWebshop": false,
            "_id": "623b6d840ed1002890334456",
            "sName": "Mainstreet 8, Amsterdam"
          },
          {
            "bIsWebshop": false,
            "_id": "623c1f1b6c63de032cfde065",
            "sName": "Middleweg 8D New York"
          },
          {
            "bIsWebshop": false,
            "_id": "623c38f21bc6be308072b103",
            "sName": "Downtown - Sydney ",
            "oAddress": {
              "street": "Ireland Stret",
              "houseNumber": "B",
              "houseNumberSuffix": "2",
              "city": "Mexico",
              "countryCode": "JP",
              "country": "Japan"
            },
            "oPrintNode": {
              "nAccountId": 1111,
              "bEnabled": true
            }
          },
          {
            "oAddress": {
              "countryCode": "NL",
              "country": "Netherlands",
              "street": "Amsterdam Street",
              "houseNumber": "8",
              "houseNumberSuffix": "B",
              "city": "Amsterdam"
            },
            "bIsWebshop": false,
            "_id": "6331439302dfe9368b20a546",
            "sName": "Amsterdam store"
          }
        ],
        "oAddress": {
          "attn": {}
        },
        "oBusinessSetting": {
          "canEmployeeModalOpen": false
        },
        "sDudaEmail": "neworg11@neworg.com",
        "sWebsite": "www.juwelierbos.xyz",
        "sLogoLight": "https://prismanote.s3.amazonaws.com/logos/7l1jgk-t1nqli-juwelierbos-logo.jpg",
        "currentLocation": {
          "oAddress": {
            "attn": {
              "salution": "Hon",
              "firstName": "Jolmer2",
              "lastNamePrefix": "Van",
              "lastName": "Ekeren"
            },
            "street": "Middleweg3",
            "houseNumber": "8",
            "houseNumberSuffix": "b",
            "postalCode": "1456G",
            "city": "Asperen",
            "country": "India",
            "countryCode": "IN",
            "state": "Utrech"
          },
          "bIsWebshop": true,
          "_id": "623b4f531d7d736c686b51f1",
          "sName": "Webshop",
          "oPrintNode": {
            "bEnabled": true,
            "nAccountId": 5555
          }
        }
      },
      "currentLocation": {
        "oAddress": {
          "attn": {
            "salution": "Hon",
            "firstName": "Jolmer2",
            "lastNamePrefix": "Van",
            "lastName": "Ekeren"
          },
          "street": "Middleweg3",
          "houseNumber": "8",
          "houseNumberSuffix": "b",
          "postalCode": "1456G",
          "city": "Asperen",
          "country": "India",
          "countryCode": "IN",
          "state": "Utrech"
        },
        "bIsWebshop": true,
        "_id": "623b4f531d7d736c686b51f1",
        "sName": "Webshop",
        "oPrintNode": {
          "bEnabled": true,
          "nAccountId": 5555
        }
      },
      "bHasPrePayments": false,
      "nTotalOriginalAmount": 200
    });
    // this.showTransaction({
    //   "iBusinessId": "6182a52f1949ab0a59ff4e7b",
    //   "iBusinessPartnerId": null,
    //   "sNumber": "T2195-060922-1433",
    //   "sInvoiceNumber": "0001929",
    //   "eType": "cash-register-revenue",
    //   "oCustomer": {
    //     "oInvoiceAddress": {
    //       "sStreet": "middlewerg",
    //       "sHouseNumber": "9a",
    //       "sPostalCode": "442001",
    //       "sCity": "Asperen"
    //     },
    //     "oPhone": {
    //       "bWhatsApp": true,
    //       "sCountryCode": "+91",
    //       "sMobile": "9970149807",
    //       "sLandLine": "9970149807",
    //       "sFax": ""
    //     },
    //     "bCounter": false,
    //     "_id": "62420be55777d556346a9484",
    //     "sFirstName": "Jolmer",
    //     "sLastName": "Ekeren2",
    //     "sPrefix": "Van",
    //     "sGender": "male"
    //   },
    //   "sReceiptNumber": "0001929",
    //   "dCreatedDate": "2022-09-06T12:33:31.685Z",
    //   "eStatus": "y",
    //   "eTransactionStatus": "inspection",
    //   "iActivityId": "63173e1bb59f0f2c849b0443",
    //   "aTransactionItems": [
    //     {
    //       "_id": "63173e1bb59f0f2c849b0446",
    //       "oType": {
    //         "bPrepayment": true,
    //         "eTransactionType": "cash-registry",
    //         "bRefund": false,
    //         "eKind": "regular",
    //         "bDiscount": false
    //       },
    //       "oBusinessProductMetaData": {
    //         "bBestseller": false,
    //         "bHasStock": false,
    //         "bShowSuggestion": false,
    //         "aImage": [],
    //         "eOwnerShip": "possession",
    //         "iSupplierId": "6275661d5732a79bf0e3f449",
    //         "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
    //         "sLabelDescription": "p888888889 QQQ",
    //         "aProperty": [],
    //         "oName": {
    //           "en": "p8-89",
    //           "nl": "p8-89",
    //           "de": "p8-89",
    //           "fr": "p8-89"
    //         },
    //         "eGender": "female"
    //       },
    //       "aImage": [],
    //       "nQuantity": 1,
    //       "nAppliedStock": 0,
    //       "bPaymentDiscount": false,
    //       "bPaymentDiscountPercent": false,
    //       "bImported": false,
    //       "bIsInvoiced": false,
    //       "eStatus": "y",
    //       "sProductName": "p8-89",
    //       "sProductNumber": "P8-89",
    //       "nPriceIncVat": 80,
    //       "nPurchasePrice": 40,
    //       "bEntryMethodCustomerValue": null,
    //       "nVatRate": 21,
    //       "nReceivedQuantity": null,
    //       "sArticleNumber": "00017021128",
    //       "nMargin": 3,
    //       "nExtraLabel": null,
    //       "iBusinessId": "6182a52f1949ab0a59ff4e7b",
    //       "iArticleGroupId": "6317229263b0661dc4920031",
    //       "iArticleGroupOriginalId": "6317229263b0661dc4920031",
    //       "oArticleGroupMetaData": {
    //         "aProperty": [
    //           {
    //             "iPropertyId": "61160712ae3cbb7453177f98",
    //             "sPropertyName": "Category",
    //             "iPropertyOptionId": "61f01aa45fc7504de957b258",
    //             "sCode": "WA",
    //             "sPropertyOptionName": "WATCH"
    //           },
    //           {
    //             "iPropertyId": "6261a5f76d3ec230f0886eee",
    //             "sPropertyName": "Watch case material",
    //             "iPropertyOptionId": "62e8bd09c2910b2073515bac",
    //             "sCode": "ME",
    //             "sPropertyOptionName": "METAL"
    //           }
    //         ],
    //         "sCategory": "",
    //         "sSubCategory": "",
    //         "oName": {
    //           "nl": "Prisma124",
    //           "en": "Prisma124"
    //         },
    //         "oOriginalName": {
    //           "nl": "PrismaOr124",
    //           "en": "PrismaOr124"
    //         }
    //       },
    //       "aPayments": [
    //         {
    //           "iPaymentMethodId": "6243ff1a0ab1c8da110423f4",
    //           "sMethod": "cash",
    //           "nAmount": 80
    //         }
    //       ],
    //       "sProductCategory": "CATEGORY",
    //       "iParentTransactionDetailId": null,
    //       "nPaymentAmount": 60,
    //       "nProductSize": null,
    //       "nProductSizeFor": null,
    //       "iBusinessProductId": "631722ba63b0661dc492004c",
    //       "iWorkstationId": "624de4996f44035620df1f55",
    //       "iLocationId": "623b4f531d7d736c686b51f1",
    //       "iSupplierId": "6275661d5732a79bf0e3f449",
    //       "iTransactionId": "63173e1bb59f0f2c849b0442",
    //       "nDiscount": 0,
    //       "sUniqueIdentifier": "9b3087a9-1418-4553-93be-97ed95c65a42",
    //       "nRevenueAmount": 60,
    //       "sDescription": "",
    //       "nGrossProfitMarginExVat": 26.11570247933885,
    //       "iCustomerId": "62420be55777d556346a9484",
    //       "sTransactionNumber": "T2195-060922-1433",
    //       "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
    //       "nSavingsPoints": 6,
    //       "aProductVariant": [],
    //       "nCostOfRevenue": 49.586776859504134,
    //       "nProfitOfRevenue": 0,
    //       "iActivityItemId": "63173e1bb59f0f2c849b0447",
    //       "dCreatedDate": "2022-09-06T12:33:31.760Z",
    //       "dUpdatedDate": "2022-09-06T12:33:31.760Z",
    //       "__v": 0
    //     },
    //     {
    //       "_id": "63173e1bb59f0f2c849b0449",
    //       "oType": {
    //         "bPrepayment": true,
    //         "eTransactionType": "cash-registry",
    //         "bRefund": false,
    //         "eKind": "regular",
    //         "bDiscount": false
    //       },
    //       "oBusinessProductMetaData": {
    //         "bBestseller": false,
    //         "bHasStock": false,
    //         "bShowSuggestion": false,
    //         "aImage": [],
    //         "eOwnerShip": "possession",
    //         "iSupplierId": "6275661d5732a79bf0e3f449",
    //         "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
    //         "sLabelDescription": "asdfasdf",
    //         "aProperty": [],
    //         "oName": {
    //           "en": "p8-88b",
    //           "nl": "p8-88b",
    //           "de": "p8-88b",
    //           "fr": "p8-88b"
    //         },
    //         "eGender": "female"
    //       },
    //       "aImage": [],
    //       "nQuantity": 1,
    //       "nAppliedStock": 0,
    //       "bPaymentDiscount": false,
    //       "bPaymentDiscountPercent": false,
    //       "bImported": false,
    //       "bIsInvoiced": false,
    //       "eStatus": "y",
    //       "sProductName": "p8-88b",
    //       "sProductNumber": "P8-88B",
    //       "nPriceIncVat": 30,
    //       "nPurchasePrice": 15,
    //       "bEntryMethodCustomerValue": null,
    //       "nVatRate": 21,
    //       "nReceivedQuantity": null,
    //       "sArticleNumber": "00017021126",
    //       "nMargin": 4,
    //       "nExtraLabel": null,
    //       "iBusinessId": "6182a52f1949ab0a59ff4e7b",
    //       "iArticleGroupId": "6307c60f6349513a50fcc34a",
    //       "iArticleGroupOriginalId": "6307c60f6349513a50fcc34a",
    //       "oArticleGroupMetaData": {
    //         "aProperty": [
    //           {
    //             "iPropertyId": "61160712ae3cbb7453177f98",
    //             "sPropertyName": "Category",
    //             "iPropertyOptionId": "61f01aa45fc7504de957b258",
    //             "sCode": "WA"
    //           },
    //           {
    //             "iPropertyId": "6261a5f76d3ec230f0886eee",
    //             "sPropertyName": "Watch case material",
    //             "iPropertyOptionId": "61165be3ae3cbb7453178016",
    //             "sCode": "ST"
    //           }
    //         ],
    //         "sCategory": "",
    //         "sSubCategory": "",
    //         "oName": {
    //           "nl": "Prisma124",
    //           "en": "Prisma124"
    //         },
    //         "oOriginalName": {
    //           "nl": "PrismaOr124",
    //           "en": "PrismaOr124"
    //         }
    //       },
    //       "aPayments": [
    //         {
    //           "iPaymentMethodId": "6243ff1a0ab1c8da110423f4",
    //           "sMethod": "cash",
    //           "nAmount": 80
    //         }
    //       ],
    //       "sProductCategory": "CATEGORY",
    //       "iParentTransactionDetailId": null,
    //       "nPaymentAmount": 20,
    //       "nProductSize": null,
    //       "nProductSizeFor": null,
    //       "iBusinessProductId": "63170656fcabe64c1481fe33",
    //       "iWorkstationId": "624de4996f44035620df1f55",
    //       "iLocationId": "623b4f531d7d736c686b51f1",
    //       "iSupplierId": "6275661d5732a79bf0e3f449",
    //       "iTransactionId": "63173e1bb59f0f2c849b0442",
    //       "nDiscount": 0,
    //       "sUniqueIdentifier": "261a0df7-775a-4c16-a8c9-7f4e5f7dae2d",
    //       "nRevenueAmount": 20,
    //       "sDescription": "",
    //       "nGrossProfitMarginExVat": 9.793388429752067,
    //       "iCustomerId": "62420be55777d556346a9484",
    //       "sTransactionNumber": "T2195-060922-1433",
    //       "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
    //       "nSavingsPoints": 2,
    //       "aProductVariant": [],
    //       "nCostOfRevenue": 16.528925619834713,
    //       "nProfitOfRevenue": 0,
    //       "iActivityItemId": "63173e1bb59f0f2c849b044a",
    //       "dCreatedDate": "2022-09-06T12:33:31.760Z",
    //       "dUpdatedDate": "2022-09-06T12:33:31.760Z",
    //       "__v": 0
    //     }
    //   ],
    //   "count": {
    //     "totalData": 1
    //   },
    //   "aPayments": [
    //     {
    //       "iPaymentMethodId": "6243ff1a0ab1c8da110423f4",
    //       "sMethod": "cash",
    //       "nAmount": 80
    //     }
    //   ],
    //   "_id": "63173e1bb59f0f2c849b0442"
    // });
    this.iBusinessId = localStorage.getItem('currentBusiness');
    this.iLocationId = localStorage.getItem('currentLocation');
    this.listEmployee();
    this.getWorkstations();
    this.getLocations();
    this.getPaymentMethods();
  }

  getPaymentMethods() {
    this.apiService.getNew('cashregistry', '/api/v1/payment-methods/' + this.requestParams.iBusinessId).subscribe((result: any) => {
      if (result && result.data && result.data.length) {
        this.paymentMethods = [ ...result.data.map((v: any) => ({ ...v, isDisabled: false })) ]
        this.paymentMethods.forEach((element: any) => {
          element.sName = element.sName.toLowerCase();
        });
      }
    }, (error) => {
    })
  }

  getMethods(arr: any){
    let str = undefined;
    for(const obj of arr){
      if(!str) str = obj.sMethod;
      else str = str + ', ' + obj.sMethod;
    }
    return str;
  }

  toolTipData(item: any) {
    var itemList = []
    var returnArr = [];
    if (item.oCustomer && (item.oCustomer.sFirstName || item.oCustomer.sLastName)) {
      returnArr.push(item.oCustomer.sFirstName + ' ' + item.oCustomer.sLastName)
    }

    if (item.aTransactionItems && item.aTransactionItems.length > 0) {
      for (var i = 0; i < item.aTransactionItems.length; i++) {
        itemList.push(item.aTransactionItems[i].sProductName)
        returnArr.push('- ' + item.aTransactionItems[i].sProductName + ' | €' + (item.aTransactionItems[i].nPriceIncVat || 0))
      }
    }
    // return returnArr;
    return returnArr.join("<br>")
  }

  goToCashRegister() {
    this.routes.navigate(['/business/till']);
  }

  loadTransaction() {
    this.transactions = [];
    this.requestParams.iBusinessId = this.businessDetails._id;
    this.requestParams.type = 'transaction';
    this.requestParams.filterDates = this.filterDates;
    this.requestParams.transactionStatus = this.transactionStatuses;
    this.requestParams.iEmployeeId = this.employee && this.employee._id ? this.employee._id : '';
    this.requestParams.iWorkstationId = undefined // we need to work on this once devides are available.\
    this.showLoader = true;
    this.requestParams.eTransactionType = this.eType;
    this.apiService.postNew('cashregistry', '/api/v1/transaction/cashRegister', this.requestParams).subscribe((result: any) => {
      if (result && result.data && result.data && result.data.result && result.data.result.length) {
        this.transactions = result.data.result;
        this.paginationConfig.totalItems = result.data.totalCount;
        setTimeout(() => {
          MenuComponent.bootstrap();
        }, 1000);
      }
      this.showLoader = false;
    }, (error) => {
      this.showLoader = false;
    })
  }

  getLocations() {
    this.apiService.postNew('core', `/api/v1/business/${this.iBusinessId}/list-location`, {}).subscribe(
      (result: any) => {
        if (result.message == 'success') {
          this.locations = result.data.aLocation;
        }
      }),
      (error: any) => {
        console.error(error)
      }
  }

  getWorkstations() {
    this.apiService.getNew('cashregistry', `/api/v1/workstations/list/${this.iBusinessId}/${this.iLocationId}`).subscribe(
      (result: any) => {
        if (result && result.data) {
          this.workstations = result.data;
        }
      }),
      (error: any) => {
        console.error(error)
      }
  }

  listEmployee() {
    const oBody = { iBusinessId: this.iBusinessId }
    this.apiService.postNew('auth', '/api/v1/employee/list', oBody).subscribe((result: any) => {
      if (result?.data?.length) {
        this.employees = this.employees.concat(result.data[0].result);
      }
    }, (error) => {
    })
  }

  openChat(): void {
    // this.chatService.openWidget();
  }

  closeChat(): void {
    // this.chatService.closeWidget();
  }

  // Function for handle event of transaction menu
  clickMenuOpt(key: string, transactionId: string) {

  }

  //  Function for set sort option on transaction table
  setSortOption(sortHeader: any) {
    if (sortHeader.selected) {
      sortHeader.sort = sortHeader.sort == 'asc' ? 'desc' : 'asc';
      this.sortAndLoadTransactions(sortHeader)
    } else {
      this.tableHeaders = this.tableHeaders.map((th: any) => {
        if (sortHeader.key == th.key) {
          th.selected = true;
          th.sort = 'asc';
        } else {
          th.selected = false;
        }
        return th;
      })
      this.sortAndLoadTransactions(sortHeader)
    }
  }

  sortAndLoadTransactions(sortHeader: any) {
    let sortBy = 'dCreatedDate';
    if (sortHeader.key == 'Date') sortBy = 'dCreatedDate';
    if (sortHeader.key == 'Transaction no.') sortBy = 'sNumber';
    if (sortHeader.key == 'Receipt number') sortBy = 'oReceipt.sNumber';
    if (sortHeader.key == 'Customer') sortBy = 'oCustomer.sFirstName';
    this.requestParams.sortBy = sortBy;
    this.requestParams.sortOrder = sortHeader.sort;
    this.loadTransaction();
  }

  // Function for update item's per page
  changeItemsPerPage(pageCount: any) {
    this.paginationConfig.itemsPerPage = pageCount;
    this.loadTransaction();
  }

  // Function for trigger event after page changes
  pageChanged(page: any) {
    this.requestParams.skip = (page - 1) * parseInt(this.paginationConfig.itemsPerPage);
    this.loadTransaction();
    this.paginationConfig.currentPage = page;
  }

  // Function for show transaction details
  showTransaction(transaction: any) {
    this.dialogService.openModal(TransactionDetailsComponent, { cssClass: "modal-xl", context: { transaction: transaction, eType: this.eType, from:'transactions' } })
      .instance.close.subscribe(
        res => {
          if (res) this.routes.navigate(['business/till']);
        });
  }
}
