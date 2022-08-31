import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ApiService } from 'src/app/shared/service/api.service';
import { PdfService } from 'src/app/shared/service/pdf2.service';
import * as _moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'src/app/shared/components/toast';
const moment = (_moment as any).default ? (_moment as any).default : _moment;

export interface View {
  sKey: string;
  sValue: string;
  children: ViewChild[];
}

export interface ViewChild {
  sKey?: string;
  sValue?: string;
  children: ChildChild[];
}

export interface ChildChild {
  sKey: string;
  sValue: string;
  data?: {
    displayMethod?: DisplayMethodKeys,
    modeFilter?: string,
    levelFilter?: string
  }
}

enum DisplayMethodKeys {
  revenuePerBusinessPartner = 'revenuePerBusinessPartner',
  revenuePerArticleGroupAndProperty = 'revenuePerArticleGroupAndProperty',
  revenuePerSupplierAndArticleGroup = 'revenuePerSupplierAndArticleGroup',
  revenuePerProperty = 'revenuePerProperty',
  revenuePerArticleGroup = 'revenuePerArticleGroup',
  aVatRates = 'aVatRates',

}
export interface DisplayMethod {
  sKey: DisplayMethodKeys;
  sValue: string;
}

@Component({
  selector: 'app-transaction-audit-ui',
  templateUrl: './transaction-audit-ui.component.html',
  styleUrls: ['./transaction-audit-ui.component.scss'],
})
export class TransactionAuditUiComponent implements OnInit, OnDestroy {
  iBusinessId: any = '';
  sUserType: any = '';
  iLocationId: any = '';
  iStatisticId: any = '';
  aLocation: any = [];
  aStatistic: any = [];
  oUser: any = {};
  aSelectedLocation: any;
  selectedWorkStation: any;
  selectedEmployee: any;
  propertyOptions: Array<any> = [];
  selectedProperties: any;
  aProperty: Array<any> = [];
  aFilterProperty: Array<any> = [];
  IsDynamicState: boolean = true;
  aWorkStation: any = [];
  aEmployee: any = [];
  aPaymentMethods: any = [];
  
  closingDayState: boolean = false;
  
  closeSubscription!: Subscription;

  statisticsData$: any;
  businessDetails: any = {};
  statistics: any;
  optionMenu = 'cash-registry';
  statisticFilter = {
    isArticleGroupLevel: true,
    isProductLevel: false,
  };
  filterDates = {
    endDate: new Date(new Date().setHours(23, 59, 59)),
    startDate: new Date(new Date().setHours(0, 0, 0)), //'2022-08-29T10:50'
    // startDate: '2022-08-29T10:50'
    // endDate: moment(new Date(new Date().setHours(23, 59, 59))).format('yyyy-MM-DDThh:mm'),
    // startDate: moment(new Date(new Date().setHours(0, 0, 0))).format('yyyy-MM-DDThh:mm'),
  };
  bIsArticleGroupLevel: boolean = true; // Could be Article-group level or product-level (if false then article-group mode)
  bIsSupplierMode: boolean = true; // could be Business-owner-mode or supplier-mode (if true then supplier-mode)

  creditAmount = 0;
  debitAmount = 0;
  paymentCreditAmount = 0;
  paymentDebitAmount = 0;
  bStatisticLoading: boolean = false;
  bIsCollapseItem: boolean = false;
  stastitics = { totalRevenue: 0, quantity: 0 };
  bookkeeping = { totalAmount: 0 };
  bookingRecords: any;
  paymentRecords: any;
  
  payMethods: any;
  allPaymentMethod: any;
  paymentEditMode: boolean = false;
  nPaymentMethodTotal: number = 0;
  nNewPaymentMethodTotal: number = 0;
  bInvalidNewTotal: boolean = false;

  aNewSelectedPaymentMethods: any = [];

  listBusinessSubscription!: Subscription;
  getStatisticSubscription!: Subscription;
  statisticAuditSubscription!: Subscription;
  greenRecordsSubscription!: Subscription;
  propertyListSubscription!: Subscription;
  workstationListSubscription!: Subscription;
  employeeListSubscription!: Subscription;
  transactionItemListSubscription!: Subscription;

  groupingHelper(item: any) {
    return item.child[0];
  }



  aOptionMenu: View[] = [];

  aVatRateMethod: any = [
    'oShopPurchase',
    'oWebShop',
    'oDeliverySupplier',
    'oDeliveryRetailer',
    'oSalesOrderSupplier',
  ];

  aDisplayMethod: DisplayMethod[] = [
    {
      sKey: DisplayMethodKeys.revenuePerBusinessPartner,
      sValue: 'Supplier And Article-Group And Dynamic Property',
    },
    {
      // sKey: 'revenuePerArticleGroupAndProperty',
      sKey: DisplayMethodKeys.revenuePerArticleGroupAndProperty,
      sValue: 'Article Group and Dynamic Property',
    },
    {
      sKey: DisplayMethodKeys.revenuePerSupplierAndArticleGroup, // Use the revenuePerBusinessPartner and Remove the Dynamic Property
      sValue: 'Supplier And Article-Group',
    },
    {
      sKey: DisplayMethodKeys.revenuePerProperty,
      sValue: 'Revenue Per Property',
    },
    {
      sKey: DisplayMethodKeys.revenuePerArticleGroup, // Use the revenuePerArticleGroupAndProperty and remove the Dynamic Property
      sValue: 'Article Group',
    },
    {
      sKey: DisplayMethodKeys.aVatRates,
      sValue: 'Vat Rates',
    },
  ];
  sDisplayMethod: DisplayMethodKeys = DisplayMethodKeys.revenuePerBusinessPartner

  aAmount: any = [
    { sLabel: '500.00', nValue: 500, nQuantity: 0, key: 'nType500' },
    { sLabel: '200.00', nValue: 200, nQuantity: 0, key: 'nType200' },
    { sLabel: '100.00', nValue: 100, nQuantity: 0, key: 'nType100' },
    { sLabel: '50.00', nValue: 50, nQuantity: 0, key: 'nType50' },
    { sLabel: '20.00', nValue: 20, nQuantity: 0, key: 'nType20' },
    { sLabel: '10.00', nValue: 10, nQuantity: 0, key: 'nType10' },
    { sLabel: '5.00', nValue: 5, nQuantity: 0, key: 'nType5' },
    { sLabel: '2.00', nValue: 2, nQuantity: 0, key: 'nType2' },
    { sLabel: '1.00', nValue: 1, nQuantity: 0, key: 'nType1' },
    { sLabel: '0.50', nValue: 0.5, nQuantity: 0, key: 'nType0_5' },
    { sLabel: '0.20', nValue: 0.2, nQuantity: 0, key: 'nType0_2' },
    { sLabel: '0.10', nValue: 0.1, nQuantity: 0, key: 'nType0_1' },
    { sLabel: '0.05', nValue: 0.05, nQuantity: 0, key: 'nType0_05' },
  ];

  oCountings: any = {
    nCashCounted: 0,
    nCashInTill: 0,
    nSkim: 0,
    oCountingsCashDetails: {},
  };
  aRefundItems: any;
  aDiscountItems: any;
  aRepairItems: any;
  iWorkstationId: string | null;
  aGoldPurchases: any;
  aGiftItems: any;
  public sSelectionListItem = '';

  constructor(
    private apiService: ApiService,
    private pdf: PdfService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
  ) {
    this.iBusinessId = localStorage.getItem('currentBusiness') || '';
    this.iLocationId = localStorage.getItem('currentLocation') || '';
    this.iWorkstationId = localStorage.getItem('currentWorkstation') || '';
    this.sUserType = localStorage.getItem('type') || '';
    const _oUser = localStorage.getItem('currentUser');
    if (_oUser) this.oUser = JSON.parse(_oUser);
  }

  ngOnInit(): void {
    this.iStatisticId = this.route.snapshot?.params?.iStatisticId;
    const oQueryParams = this.route.snapshot?.queryParams;
    // const _dOpenDate = this.route.snapshot?.queryParams?.get('dStartDate');
    if (oQueryParams?.dStartDate)
      this.filterDates.startDate = moment(
        new Date(oQueryParams?.dStartDate)
      ).format('yyyy-MM-DDThh:mm');

    this.businessDetails._id = localStorage.getItem('currentBusiness');
    console.log({ aDisplayMethod: this.aDisplayMethod });
    this.setOptionMenu()
    this.fetchBusinessDetails();
    this.printingDate();
    this.fetchBusinessLocation();
    this.getProperties();
    this.fetchStatisticDocument();
    this.getWorkstations();
    this.getEmployees();
    this.getPaymentMethods();
  }
  setOptionMenu() {
    this.aOptionMenu = [
      {
        sKey: 'Sales',
        sValue: this.translate.instant('SALES'),
        children: [
          // ArticleGroup
          {
            sKey: 'ArticleGroup',
            sValue: this.translate.instant('ARTICLE GROUP'),
            children: [
              {
                sKey: 'Compact',
                sValue: this.translate.instant('COMPACT'),
                data: {
                  displayMethod: DisplayMethodKeys.revenuePerArticleGroup,
                  modeFilter: 'supplier',
                  levelFilter: 'supplier'
                }
              },
              {
                sKey: 'Specific',
                sValue: this.translate.instant('SPECIFIC'),
              }
            ]
          },
          {
            sKey: 'Bookkeeping',
            sValue: this.translate.instant('BOOKKEEPING'),
            children: [
              {
                sKey: 'Vat rates',
                sValue: this.translate.instant('VAT_RATES'),
              },
              {
                sKey: 'Revenue per',
                sValue: this.translate.instant('REVENUE_PER'),
              },
              {
                sKey: 'Article group',
                sValue: this.translate.instant('ARTICLE_GROUP'),
              },
            ]
          },
          {
            sKey: 'Supplier',
            sValue: this.translate.instant('SUPPLIER'),
            children: [
              {
                sKey: 'Compact',
                sValue: this.translate.instant('COMPACT'),
              },
              {
                sKey: 'Specific',
                sValue: this.translate.instant('SPECIFIC'),
              }
            ]
          },
          {
            sKey: 'Manager',
            sValue: this.translate.instant('MANAGER'),
            children: [
              {
                sKey: 'Compact',
                sValue: this.translate.instant('COMPACT'),
              },
              {
                sKey: 'Specific',
                sValue: this.translate.instant('SPECIFIC'),
              }
            ]
          },
        ],
      },
      {
        sKey: 'Purchases',
        sValue: this.translate.instant('PURCHASES'),
        children: [
          // ArticleGroup
          {
            sKey: 'ArticleGroup',
            sValue: this.translate.instant('ARTICLE GROUP'),
            children: [
              {
                sKey: 'Compact',
                sValue: this.translate.instant('COMPACT'),
              },
              {
                sKey: 'Specific',
                sValue: this.translate.instant('SPECIFIC'),
              }
            ]
          },
          {
            sKey: 'Bookkeeping',
            sValue: this.translate.instant('BOOKKEEPING'),
            children: [
              {
                sKey: 'Vat rates',
                sValue: this.translate.instant('VAT_RATES'),
              },
              {
                sKey: 'Revenue per',
                sValue: this.translate.instant('REVENUE_PER'),
              },
              {
                sKey: 'Article group',
                sValue: this.translate.instant('ARTICLE_GROUP'),
              },
            ]
          },
          {
            sKey: 'Supplier',
            sValue: this.translate.instant('SUPPLIER'),
            children: [
              {
                sKey: 'Compact',
                sValue: this.translate.instant('COMPACT'),
              },
              {
                sKey: 'Specific',
                sValue: this.translate.instant('SPECIFIC'),
              }
            ]
          },
          {
            sKey: 'Manager',
            sValue: this.translate.instant('MANAGER'),
            children: [
              {
                sKey: 'Compact',
                sValue: this.translate.instant('COMPACT'),
              },
              {
                sKey: 'Specific',
                sValue: this.translate.instant('SPECIFIC'),
              }
            ]
          },
        ],
      },
      {
        sKey: 'Sales orders ',
        sValue: this.translate.instant('SALES_ORDERS'),
        children: [
          // ArticleGroup
          {
            sKey: 'ArticleGroup',
            sValue: this.translate.instant('ARTICLE GROUP'),
            children: [
              {
                sKey: 'Compact',
                sValue: this.translate.instant('COMPACT'),
              },
              {
                sKey: 'Specific',
                sValue: this.translate.instant('SPECIFIC'),
              }
            ]
          },
          {
            sKey: 'Bookkeeping',
            sValue: this.translate.instant('BOOKKEEPING'),
            children: [
              {
                sKey: 'Vat rates',
                sValue: this.translate.instant('VAT_RATES'),
              },
              {
                sKey: 'Revenue per',
                sValue: this.translate.instant('REVENUE_PER'),
              },
              {
                sKey: 'Article group',
                sValue: this.translate.instant('ARTICLE_GROUP'),
              },
            ]
          },
          {
            sKey: 'Supplier',
            sValue: this.translate.instant('SUPPLIER'),
            children: [
              {
                sKey: 'Compact',
                sValue: this.translate.instant('COMPACT'),
              },
              {
                sKey: 'Specific',
                sValue: this.translate.instant('SPECIFIC'),
              }
            ]
          },
          {
            sKey: 'Manager',
            sValue: this.translate.instant('MANAGER'),
            children: [
              {
                sKey: 'Compact',
                sValue: this.translate.instant('COMPACT'),
              },
              {
                sKey: 'Specific',
                sValue: this.translate.instant('SPECIFIC'),
              }
            ]
          },
        ],
      },
    ]
    const eUserType = localStorage.getItem('type') ?? ''
    if (eUserType && eUserType.toLowerCase() !== 'supplier') {
      let iPurchaseIndex = this.aOptionMenu.findIndex(i => i.sKey.toLowerCase() === 'sales orders')
      this.aOptionMenu.splice(iPurchaseIndex, 1)
    }

  }
  onDropdownItemSelected(parent: any, child1: any, child2: any) {

    this.sSelectionListItem = `${parent.sKey}->${child1.sKey}->${child2.sKey}`


  }

  fetchBusinessLocation() {
    if (!this.oUser?.userId) return;
    this.listBusinessSubscription = this.apiService
      .postNew('core', `/api/v1/business/${this.iBusinessId}/list-location`, {
        iBusinessId: this.iBusinessId,
      })
      .subscribe(
        (result: any) => {
          if (result?.data?.aLocation?.length)
            this.aLocation = result.data.aLocation;
        },
        (error) => {
          console.log('error: ', error);
        }
      );
  }

  displayMethodChange() {
    this.aStatistic = [];
  }

  printingDate() {
    this.fetchStatistics(this.sDisplayMethod.toString());
  }

  /* STATIC  */
  fetchStatisticDocument(sDisplayMethod?: string) {
    this.aStatistic = [];
    this.aPaymentMethods = [];
    this.bStatisticLoading = true;
    const oBody = {
      iBusinessId: this.iBusinessId,
      oFilter: {
        aLocationId: this?.aSelectedLocation?.length
          ? this.aSelectedLocation
          : [],
        iWorkstationId: this.selectedWorkStation?._id,
        sTransactionType: this.optionMenu,
        sDisplayMethod: sDisplayMethod || this.sDisplayMethod,
        dStartDate: this.filterDates.startDate,
        dEndDate: this.filterDates.endDate,
        aFilterProperty: this.aFilterProperty,
        bIsArticleGroupLevel: true,
        bIsSupplierMode: true
      },
    };

    if (this.IsDynamicState) {
      oBody.oFilter.bIsArticleGroupLevel = this.bIsArticleGroupLevel;
      oBody.oFilter.bIsSupplierMode = this.bIsSupplierMode;
    }

    this.getStatisticSubscription = this.apiService
      .postNew('cashregistry', `/api/v1/statistics/get`, oBody)
      .subscribe(
        (result: any) => {
          this.bStatisticLoading = false;
          if (result?.data) {
            if (result.data?.aStatistic?.length)
              this.aStatistic = result.data.aStatistic;
            if (this.aStatistic?.length)
              this.oCountings.nCashInTill =
                this.aStatistic[0].overall[0]?.nTotalRevenue || 0;
            if (result.data?.aPaymentMethods?.length)
              this.aPaymentMethods = result.data.aPaymentMethods;
          }
        },
        (error) => {
          this.bStatisticLoading = false;
          console.log('error: ', error);
        }
      );
  }

  fetchStatistics(sDisplayMethod?: string) {
    if (this.iStatisticId) this.IsDynamicState = true;
    if (!this.IsDynamicState) return this.fetchStatisticDocument();
    this.aStatistic = [];
    this.aPaymentMethods = [];
    const oBody = {
      iBusinessId: this.iBusinessId,
      oFilter: {
        aLocationId: this?.aSelectedLocation?.length
          ? this.aSelectedLocation
          : [],
        iWorkstationId: this.selectedWorkStation?._id,
        iEmployeeId: this.selectedEmployee?._id,
        sTransactionType: this.optionMenu,
        sDisplayMethod: sDisplayMethod || this.sDisplayMethod,
        dStartDate: this.filterDates.startDate,
        dEndDate: this.filterDates.endDate,
        aFilterProperty: this.aFilterProperty,
        bIsArticleGroupLevel: true,
        bIsSupplierMode: true
      },
    };

    if (this.IsDynamicState) {
      oBody.oFilter.bIsArticleGroupLevel = this.bIsArticleGroupLevel;
      oBody.oFilter.bIsSupplierMode = this.bIsSupplierMode;
    }
    this.bStatisticLoading = true;
    this.statisticAuditSubscription = this.apiService
      .postNew('cashregistry', `/api/v1/statistics/transaction/audit`, oBody)
      .subscribe(
        (result: any) => {
          this.bStatisticLoading = false;
          if (result?.data) {
            if (result.data?.oTransactionAudit?.length)
              this.aStatistic = result.data.oTransactionAudit;
            if (this.aStatistic?.length && this.aStatistic[0]?.overall?.length)
              this.oCountings.nCashInTill =
                this.aStatistic[0].overall[0].nTotalRevenue;
            if (result.data?.aPaymentMethods?.length){
              this.aPaymentMethods = result.data.aPaymentMethods;
              this.aPaymentMethods.map((item:any) => {
                item.nNewAmount = item.nAmount;
                this.nPaymentMethodTotal += parseFloat(item.nAmount);

                return item;
              });
              this.nNewPaymentMethodTotal = this.nPaymentMethodTotal;
              this.filterDuplicatePaymentMethods();
            }
          }
        },
        (error) => {
          this.bStatisticLoading = false;
          this.aStatistic = [];
          this.aPaymentMethods = [];
        }
      );
    this.getGreenRecords();
  }

  resetValues() {
    this.creditAmount = 0;
    this.debitAmount = 0;
    this.paymentCreditAmount = 0;
    this.paymentDebitAmount = 0;
    this.paymentRecords = [];
    this.bookingRecords = [];
  }

  getGreenRecords() {
    this.resetValues();
    const tempBookName = this.optionMenu;
    const body = {
      startDate: this.filterDates.startDate,
      endDate: this.filterDates.endDate,
      bookName: tempBookName,
    };
    this.greenRecordsSubscription = this.apiService
      .postNew(
        'bookkeeping',
        `/api/v1/bookkeeping/booking/records?iBusinessId=${this.iBusinessId}`,
        body
      )
      .subscribe(
        (result: any) => {
          this.bookingRecords = result.filter(
            (o: any) => o.sBookName === tempBookName
          );
          this.paymentRecords = result.filter(
            (o: any) => o.sBookName === 'payment-book'
          );
          this.bookingRecords.forEach((book: any) => {
            if (book.eType === 'credit') {
              this.creditAmount += book.nValue;
            } else {
              this.debitAmount += book.nValue;
            }
          });
          this.paymentRecords.forEach((book: any) => {
            if (book.eType === 'credit') {
              this.paymentCreditAmount += book.nValue;
            } else {
              this.paymentDebitAmount += book.nValue;
            }
          });
        },
        (error) => { }
      );
  }

  onChanges(changes: string) {
    this.getGreenRecords();
  }

  getProperties() {
    this.selectedProperties = [];
    let data = {
      skip: 0,
      limit: 100,
      sortBy: '',
      sortOrder: '',
      searchValue: '',
      oFilterBy: {
        bRequiredForArticleGroup: true,
      },
      iBusinessId: localStorage.getItem('currentBusiness'),
    };

    this.propertyListSubscription = this.apiService
      .postNew('core', '/api/v1/properties/list', data)
      .subscribe((result: any) => {
        if (result?.data && result?.data[0]?.result?.length) {
          result.data[0].result.map((property: any) => {
            if (typeof this.propertyOptions[property._id] == 'undefined') {
              this.propertyOptions[property._id] = [];

              property.aOptions.map((option: any) => {
                if (option?.sCode?.trim() != '') {
                  const opt: any = {
                    iPropertyId: property._id,
                    sPropertyName: property.sName,
                    oProperty: {},
                    sCode: option.sCode,
                    sName: option.sKey,
                    selected: false,
                  };
                  opt.oProperty[option.sKey] = option.value;
                  this.propertyOptions[property._id].push(opt);
                  const propertyIndex = this.aProperty.findIndex(
                    (prop: any) => prop.iPropertyId == property._id
                  );
                  if (propertyIndex === -1) {
                    this.aProperty.push(opt);
                  }
                }
              });
            }
          });
        }
      });
  }

  onProperties(value?: any) {
    console.log(
      'onProperties called: ',
      this.selectedProperties,
      this.propertyOptions,
      this.aProperty
    );
    if (this.selectedProperties && this.selectedProperties[value]) {
      this.aFilterProperty = [];
      for (const oProperty of this.aProperty) {
        if (this.selectedProperties[oProperty?.iPropertyId]?.length) {
          const aOption = this.propertyOptions[oProperty?.iPropertyId].filter(
            (opt: any) => {
              return this.selectedProperties[oProperty?.iPropertyId].includes(
                opt.sName
              );
            }
          );
          for (const oOption of aOption) {
            this.aFilterProperty.push(oOption?.sName);
          }
        }
      }
    }
  }

  getWorkstations() {
    (this.workstationListSubscription = this.apiService
      .getNew('cashregistry', '/api/v1/workstations/list/' + this.iBusinessId)
      .subscribe((result: any) => {
        if (result && result.data?.length) this.aWorkStation = result.data;
      })),
      (error: any) => {
        console.error(error);
      };
  }

  getEmployees() {
    const oBody = { iBusinessId: this.iBusinessId };

    this.employeeListSubscription = this.apiService
      .postNew('auth', '/api/v1/employee/list', oBody)
      .subscribe(
        (result: any) => {
          if (result?.data?.length) {
            this.aEmployee = result.data[0].result;
          }
        },
        (error) => { }
      );
  }
  fetchBusinessDetails() {
    this.apiService
      .getNew('core', '/api/v1/business/' + this.businessDetails._id)
      .subscribe((result: any) => {
        this.businessDetails = result.data;
      });
  }

  async exportToPDF() {
    const header: Array<any> = [
      'Supplier',
      'Quantity',
      'Price incl VAT',
      'Purchase price',
      'Gross profit',
      'Margin',
    ];

    const date = moment(Date.now()).format('DD-MM-yyyy');

    const headerList: Array<any> = [];
    header.forEach((singleHeader: any) => {
      headerList.push({ text: singleHeader, bold: true });
    });

    const columnWidths = [150, '*', '*', '*', '*', '*'];

    const tableLayout = {
      hLineWidth: function (i: number, node: any) {
        return i === 0 || i === node.table.body.length ? 0 : 0.5;
      },
      vLineWidth: function (i: number, node: any) {
        return i === 0 || i === node.table.widths.length ? 0 : 0;
      },
      hLineColor: function (i: number, node: any) {
        return i === 0 || i === node.table.body.length ? '#999' : '#999';
      },
      paddingLeft: function (i: number, node: any) {
        return i === 0 ? 0 : 20;
      },
      paddingRight: function (i: number, node: any) {
        return i === node.table.widths.length ? 20 : 0;
      },
    };
    let sDisplayMethod =
      this.aDisplayMethod[
        this.aDisplayMethod.findIndex(
          (el: DisplayMethod) => el.sKey == this.sDisplayMethod
        )
      ].sValue;
    let sType =
      this.aOptionMenu[
        this.aOptionMenu.findIndex((el: any) => el.sKey == this.optionMenu)
      ].sValue;
    let dataType = this.IsDynamicState ? 'Dynamic Data' : 'Static Data';

    // get selected locaions
    let sLocations = '';
    let aLocations: any = [];
    if (this.aSelectedLocation?.length > 0) {
      this.aSelectedLocation.forEach((el: any) => {
        aLocations.push(
          this.aLocation
            .filter((location: any) => location._id == el)
            .map((location: any) => location.sName)
        );
      });
      sLocations = aLocations.join(', ');
    } else {
      sLocations = this.aLocation
        .map((location: any) => location.sName)
        .join(', ');
    }

    //get selected workstations
    let sWorkstation = '';
    if (this.selectedWorkStation) {
      sWorkstation = this.aWorkStation.find(
        (el: any) => el._id == this.selectedWorkStation._id
      ).sName;
    } else {
      sWorkstation = this.aWorkStation.map((el: any) => el.sName).join(', ');
    }

    let dataFromTo =
      '(From : ' +
      moment(this.filterDates.startDate).format('DD-MM-yyyy hh:mm A') +
      ' TO ' +
      moment(this.filterDates.endDate).format('DD-MM-yyyy hh:mm A') +
      ')';

    let content: any = [
      { text: date, style: ['right', 'normal'] },
      { text: 'Transaction Audit Report', style: ['header', 'center'] },
      { text: dataFromTo, style: ['center', 'normal'] },
      { text: this.businessDetails.sName, style: 'businessName' },
      {
        columns: [
          { text: 'Location(s) : ', style: ['left', 'normal'], width: 100 },
          { text: sLocations, style: ['left', 'normal'], width: 150 },
          { width: '*', text: '' },
          { text: 'Display Method : ', style: ['right', 'normal'], width: 100 },
          { text: sDisplayMethod, style: ['right', 'normal'], width: 150 },
        ],
      },
      {
        columns: [
          { text: 'Workstation(s): ', style: ['left', 'normal'], width: 100 },
          { text: sWorkstation, style: ['left', 'normal'], width: 200 },
          { width: '*', text: '' },
          { text: 'Type of Data: ', style: ['right', 'normal'], width: 100 },
          { text: dataType, style: ['right', 'normal'], width: 150 },
        ],
      },
      {
        columns: [
          { width: '*', text: '' },
          { text: 'Type: ', style: ['right', 'normal'], width: 100 },
          { text: sType, style: ['right', 'normal'], width: 150 },
        ],
      },
      {
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 575, y2: 0, lineWidth: 1 }],
        margin: [0, 0, 20, 0],
        style: 'afterLine',
      },
      {
        style: 'headerStyle',
        table: {
          headerRows: 1,
          widths: columnWidths,
          body: [headerList],
        },
        layout: {
          hLineStyle: function () {
            return { dash: { length: 0.001, space: 40 * 20 } };
          },
          vLineStyle: function () {
            return { dash: { length: 0.001, space: 40 * 20 } };
          },
        },
      },
      {
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 575, y2: 0, lineWidth: 1 }],
        margin: [0, 0, 20, 0],
        style: 'afterLine',
      },
    ];

    const styles = {
      right: {
        alignment: 'right',
      },
      left: {
        alignment: 'left',
      },
      center: {
        alignment: 'center',
      },
      bold: {
        bold: true,
      },
      header: {
        fontSize: 15,
        bold: false,
        margin: 5, //[0, 5, 0, 10]
      },
      businessName: {
        fontSize: 12,
        margin: 5, //[0, 5, 0, 10]
      },
      normal: {
        fontSize: 10,
        margin: 5, //[0, 5, 0, 5]
      },
      tableExample: {
        // border: 0,
        fontSize: 9,
      },
      headerStyle: {
        fontSize: 10,
        bold: true,
        color: '#333',
        margin: 10, //[0, 10, 0, 10]
      },
      supplierName: {
        alignment: 'right',
        fontSize: 12,
        margin: [0, -10, 0, 10],
      },
      afterLine: {
        margin: [0, 0, 0, 10],
      },
      separatorLine: {
        color: '#ccc',
      },
      afterLastLine: {
        margin: [0, 20, 0, 20],
      },
      th: {
        fontSize: 10,
        bold: true,
        margin: [5, 10],
      },

      td: {
        fontSize: 9,
        margin: [5, 10],
      },
      articleGroup: {
        fillColor: '#F5F8FA',
      },
      property: {
        // color: "#ccc",
      },
    };

    const _aTransactionItems = await this.fetchTransactionItems().toPromise();

    const aTransactionItems = _aTransactionItems?.data[0]?.result;

    this.aRefundItems = aTransactionItems.filter(
      (item: any) => item.oType.bRefund
    );
    this.aDiscountItems = aTransactionItems.filter(
      (item: any) => item.oType.bDiscount
    );

    const _aActivityItems = await this.fetchActivityItems().toPromise();
    if (_aActivityItems?.data?.length) {
      this.aRepairItems = _aActivityItems?.data.filter(
        (item: any) => item.oType.eKind == 'repair'
      );
      this.aGiftItems = _aActivityItems?.data.filter(
        (item: any) => item.oType.eKind == 'giftcard'
      );
    }

    const _aGoldPurchases = await this.fetchGoldPurchaseItems().toPromise();
    this.aGoldPurchases = _aGoldPurchases?.data[0]?.result.filter(
      (item: any) => item.oType.eKind == 'gold-purchase'
    );

    switch (this.sDisplayMethod.toString()) {
      case 'revenuePerBusinessPartner':
        this.processPdfByRevenuePerBusinessPartner(
          content,
          columnWidths,
          tableLayout
        );
        break;
      case 'revenuePerSupplierAndArticleGroup':
        this.processPdfByRevenuePerSupplierAndArticleGroup(
          content,
          columnWidths,
          tableLayout
        );
        break;
      case 'revenuePerArticleGroupAndProperty':
        this.processPdfByRevenuePerArticleGroupAndProperty(
          content,
          columnWidths,
          tableLayout
        );
        break;
      case 'revenuePerProperty':
        this.processPdfByRevenuePerProperty(content, columnWidths, tableLayout);
        break;
      case 'revenuePerArticleGroup':
        this.processPdfByRevenuePerArticleGroup(
          content,
          columnWidths,
          tableLayout
        );
        break;
    }

    content.push({
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: 575, y2: 0, lineWidth: 1 }],
      margin: [0, 0, 20, 0],
      style: 'afterLine',
    });
    let texts: any = [
      { text: 'Total', style: 'th' },
      { text: this.aStatistic[0].overall[0].nQuantity, style: 'th' },
      { text: this.aStatistic[0].overall[0].nTotalRevenue, style: 'th' },
      { text: this.aStatistic[0].overall[0].nTotalPurchaseAmount, style: 'th' },
      { text: this.aStatistic[0].overall[0].nProfit, style: 'th' },
      { text: this.aStatistic[0].overall[0].nMargin, style: 'th' },
    ];

    const overallData = {
      table: {
        widths: columnWidths,
        body: [texts],
      },
      layout: tableLayout,
    };
    content.push(
      overallData,
      {
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 575, y2: 0, lineWidth: 1 }],
        margin: [0, 0, 20, 10],
        style: 'afterLine',
      },
      {
        text: 'Payment Methods',
        style: ['left', 'normal'],
        margin: [0, 30, 0, 10],
      }
    );

    const paymentHeaders = ['Method', 'Total Amount', 'Quantity'];

    const paymentHeaderList: Array<any> = [];
    paymentHeaders.forEach((singleHeader: any) => {
      paymentHeaderList.push({
        text: singleHeader,
        style: ['th', 'articleGroup'],
      });
    });

    const paymentHeaderData = {
      table: {
        widths: '*',
        body: [paymentHeaderList],
      },
    };
    content.push(paymentHeaderData);
    this.aPaymentMethods = [];
    if (this.aPaymentMethods.length) {
      this.aPaymentMethods.forEach((paymentMethod: any) => {
        let texts: any = [
          { text: paymentMethod.sMethod, style: ['td'] },
          { text: paymentMethod.nAmount, style: ['td'] },
          { text: paymentMethod.nQuantity, style: ['td'] },
        ];
        const data = {
          table: {
            widths: '*',
            body: [texts],
          },
        };
        content.push(data);
      });
    } else {
      const data = {
        table: {
          widths: '*',
          body: [
            [
              { text: 'No records found', colSpan: 3, alignment: 'center' },
              {},
              {},
            ],
          ],
        },
        layout: {
          hLineWidth: function (i: any) {
            return i === 0 ? 0 : 1;
          },
        },
      };
      content.push(data);
    }

    this.addRefundToPdf(content);
    this.addDiscountToPdf(content);
    this.addRepairsToPdf(content);
    this.addGiftcardsToPdf(content);
    this.addGoldPurchasesToPdf(content);

    this.pdf.getPdfData(
      styles,
      content,
      'portrait',
      'A4',
      this.businessDetails.sName + '-' + 'Transaction Audit Report'
    );
  }

  addRefundToPdf(content: any) {
    content.push({
      text: 'Refund',
      style: ['left', 'normal'],
      margin: [0, 30, 0, 10],
    });

    const refundHeaders = ['Description', 'Price', 'Tax', 'Total'];

    const refundHeaderList: Array<any> = [];
    refundHeaders.forEach((singleHeader: any) => {
      refundHeaderList.push({
        text: singleHeader,
        style: ['th', 'articleGroup', 'bold'],
      });
    });

    const refundHeaderData = {
      table: {
        widths: '*',
        body: [refundHeaderList],
      },
    };
    content.push(refundHeaderData);
    if (this.aRefundItems.length) {
      this.aRefundItems.forEach((item: any) => {
        let itemDescription = item.nQuantity;
        if (item.sComment) {
          itemDescription += 'x' + item.sComment;
        }
        let texts: any = [
          { text: itemDescription, style: 'td' },
          { text: item.nPriceIncVat, style: 'td' },
          { text: item.nVatRate, style: 'td' },
          { text: item.nTotal, style: 'td' },
        ];
        const data = {
          table: {
            widths: '*',
            body: [texts],
          },
          layout: {
            hLineWidth: function (i: any) {
              return i === 0 ? 0 : 1;
            },
          },
        };
        content.push(data);
      });
    } else {
      const data = {
        table: {
          widths: '*',
          body: [
            [
              { text: 'No records found', colSpan: 4, alignment: 'center' },
              {},
              {},
              {},
            ],
          ],
        },
        layout: {
          hLineWidth: function (i: any) {
            return i === 0 ? 0 : 1;
          },
        },
      };
      content.push(data);
    }
  }

  addDiscountToPdf(content: any) {
    content.push({
      text: 'Discount(s)',
      style: ['left', 'normal'],
      margin: [0, 30, 0, 10],
    });

    const aHeaders = ['Product Name', 'Quantity', 'Discount', 'Price', 'Tax'];

    const aHeaderList: Array<any> = [];
    aHeaders.forEach((singleHeader: any) => {
      aHeaderList.push({
        text: singleHeader,
        style: ['th', 'articleGroup', 'bold'],
      });
    });

    const oHeaderData = {
      table: {
        widths: '*',
        body: [aHeaderList],
      },
    };
    content.push(oHeaderData);
    if (this.aDiscountItems.length) {
      this.aDiscountItems.forEach((item: any) => {
        // let itemDescription = (item.sComment) ? item.sComment : ' (not available) ';

        let texts: any = [
          { text: item.sProductName, style: 'td' },
          { text: item.nQuantity, style: 'td' },
          { text: item.nDiscount, style: 'td' },
          { text: item.nPriceIncVat, style: 'td' },
          { text: item.nVatRate, style: 'td' },
        ];
        const data = {
          table: {
            widths: '*',
            body: [texts],
          },
          layout: {
            hLineWidth: function (i: any) {
              return i === 0 ? 0 : 1;
            },
          },
        };
        content.push(data);
      });
    } else {
      const data = {
        table: {
          widths: '*',
          body: [
            [
              { text: 'No records found', colSpan: 5, alignment: 'center' },
              {},
              {},
              {},
              {},
            ],
          ],
        },
        layout: {
          hLineWidth: function (i: any) {
            return i === 0 ? 0 : 1;
          },
        },
      };
      content.push(data);
    }
  }

  addRepairsToPdf(content: any) {
    content.push({
      text: 'Repair(s)',
      style: ['left', 'normal'],
      margin: [0, 30, 0, 10],
    });

    const aHeaders = [
      'Product Name',
      'Comment',
      'Quantity',
      'Employee',
      'Total',
    ];

    const aHeaderList: Array<any> = [];
    aHeaders.forEach((singleHeader: any) => {
      aHeaderList.push({ text: singleHeader, style: ['th', 'articleGroup'] });
    });

    const oHeaderData = {
      table: {
        widths: '*',
        body: [aHeaderList],
      },
    };
    content.push(oHeaderData);
    if (this.aRepairItems.length) {
      this.aRepairItems.forEach((item: any) => {
        let texts: any = [
          { text: item.sProductName, style: 'td' },
          { text: item.sCommentVisibleCustomer, style: 'td' },
          { text: item.nQuantity, style: 'td' },
          { text: item.sEmployeeName, style: 'td' },
          { text: item.nTotalAmount, style: 'td' },
        ];
        const data = {
          table: {
            widths: '*',
            body: [texts],
          },
          layout: {
            hLineWidth: function (i: any) {
              return i === 0 ? 0 : 1;
            },
          },
        };
        content.push(data);
      });
    } else {
      const data = {
        table: {
          widths: '*',
          body: [
            [
              { text: 'No records found', colSpan: 5, alignment: 'center' },
              {},
              {},
              {},
              {},
            ],
          ],
        },
        layout: {
          hLineWidth: function (i: any) {
            return i === 0 ? 0 : 1;
          },
        },
      };
      content.push(data);
    }
  }

  addGiftcardsToPdf(content: any) {
    content.push({
      text: 'Giftcard(s)',
      style: ['left', 'normal'],
      margin: [0, 30, 0, 10],
    });
    const aHeaders = [
      'Giftcard Number',
      'Comment',
      'Quantity',
      'Employee',
      'Total',
    ];

    const aHeaderList: Array<any> = [];
    aHeaders.forEach((singleHeader: any) => {
      aHeaderList.push({ text: singleHeader, style: ['th', 'articleGroup'] });
    });

    const oHeaderData = {
      table: {
        widths: '*',
        body: [aHeaderList],
      },
    };
    content.push(oHeaderData);
    if (this.aGiftItems.length) {
      this.aGiftItems.forEach((item: any) => {
        let texts: any = [
          { text: item.sGiftCardNumber, style: 'td' },
          { text: item.sCommentVisibleCustomer, style: 'td' },
          { text: item.nQuantity, style: 'td' },
          { text: item.sEmployeeName, style: 'td' },
          { text: item.nTotalAmount, style: 'td' },
        ];
        const data = {
          table: {
            widths: '*',
            body: [texts],
          },
          layout: {
            hLineWidth: function (i: any) {
              return i === 0 ? 0 : 1;
            },
          },
        };
        content.push(data);
      });
    } else {
      const data = {
        table: {
          widths: '*',
          body: [
            [
              { text: 'No records found', colSpan: 5, alignment: 'center' },
              {},
              {},
              {},
              {},
            ],
          ],
        },
        layout: {
          hLineWidth: function (i: any) {
            return i === 0 ? 0 : 1;
          },
        },
      };
      content.push(data);
    }
  }

  addGoldPurchasesToPdf(content: any) {
    content.push({
      text: 'Gold Purchase(s)',
      style: ['left', 'normal'],
      margin: [0, 30, 0, 10],
    });
    const widths = [100, 70, 50, 50, 50, '*', 80];
    const aHeaders = [
      'Number',
      'Date',
      'Quantity',
      'Price',
      'Total',
      'Payment Transaction No.',
      'Payment Type',
    ];

    const aHeaderList: any = [];
    aHeaders.forEach((singleHeader: any) => {
      aHeaderList.push({ text: singleHeader, style: ['th', 'articleGroup'] });
    });

    const oHeaderData = {
      table: {
        widths: widths,
        body: [aHeaderList],
      },
    };
    content.push(oHeaderData);
    if (this.aGoldPurchases?.length) {
      this.aGoldPurchases.forEach((item: any, index: number) => {
        const date = moment(item.dCreatedDate).format('DD-MM-yyyy');
        let fillColor = index % 2 === 0 ? '#ccc' : '#fff';
        let texts: any = [
          { text: item.sNumber, style: 'td', fillColor: fillColor },
          { text: date, style: 'td', fillColor: fillColor },
          { text: item.nQuantity, style: 'td', fillColor: fillColor },
          { text: item.nPriceIncVat, style: 'td', fillColor: fillColor },
          { text: item.nTotalAmount, style: 'td', fillColor: fillColor },
          { text: '', style: 'td', fillColor: fillColor },
          { text: '', style: 'td', fillColor: fillColor },
        ];
        const data = {
          table: {
            widths: widths,
            body: [texts],
          },
          layout: {
            hLineWidth: function (i: any) {
              return i === 0 ? 0 : 1;
            },
          },
        };
        content.push(data);
        item.aTransactionItems.forEach((transaction: any) => {
          const payments = transaction.aPayments
            .map((el: any) => el.sMethod)
            .join(', ');
          let texts: any = [
            { text: '', style: 'td', fillColor: fillColor },
            { text: '', style: 'td', fillColor: fillColor },
            { text: '', style: 'td', fillColor: fillColor },
            { text: '', style: 'td', fillColor: fillColor },
            { text: '', style: 'td', fillColor: fillColor },
            {
              text: transaction.sTransactionNumber,
              style: 'td',
              fillColor: fillColor,
            },
            { text: payments, style: 'td', fillColor: fillColor },
          ];
          const data = {
            table: {
              widths: widths,
              body: [texts],
            },
            layout: {
              hLineWidth: function (i: any, node: any) {
                return i === 0 ? 0 : 1;
              },
            },
          };
          content.push(data);
        });
      });
    } else {
      const data = {
        table: {
          widths: widths,
          body: [
            [
              { text: 'No records found', colSpan: 7, alignment: 'center' },
              {},
              {},
              {},
              {},
              {},
              {},
            ],
          ],
        },
        layout: {
          hLineWidth: function (i: any) {
            return i === 0 ? 0 : 1;
          },
        },
      };
      content.push(data);
    }
  }

  processPdfByRevenuePerBusinessPartner(
    content: any,
    columnWidths: any,
    tableLayout: any
  ) {
    let arr: Array<any> = [];

    this.aStatistic[0].individual.forEach((el: any) => {
      var obj: any = {};
      obj['sBusinessPartnerName'] = el.sBusinessPartnerName;
      obj['nQuantity'] = el.nQuantity;
      obj['nTotalRevenue'] = el.nTotalRevenue;
      obj['nTotalPurchaseAmount'] = el.nTotalPurchaseAmount;
      obj['nProfit'] = el.nProfit;
      obj['nMargin'] = el.nMargin;
      obj['aArticleGroups'] =
        el.aArticleGroups.map((article: any) => {
          let data = {
            sName: article.sName,
            nQuantity: article.nQuantity,
            nTotalRevenue: article.nTotalRevenue,
            nTotalPurchaseAmount: article.nTotalPurchaseAmount,
            nProfit: article.nProfit,
            nMargin: article.nMargin,
            aRevenueByProperty: article?.aRevenueByProperty.map(
              (property: any) => {
                let revenue = {
                  aCategory: property.aCategory.join(' | '),
                  nQuantity: property.nQuantity || 0,
                  nTotalRevenue: property.nTotalRevenue,
                  nTotalPurchaseAmount: property.nTotalPurchaseAmount,
                  nProfit: property.nProfit || 0,
                  nMargin: property.nMargin || 0,
                };
                return revenue;
              }
            ),
          };
          return data;
        }) || [];

      arr.push(obj);
    });
    arr.forEach((singleRecord: any) => {
      let texts: any = [
        { text: singleRecord.sBusinessPartnerName, style: 'th' },
        { text: singleRecord.nQuantity, style: 'th' },
        { text: singleRecord.nTotalRevenue, style: 'th' },
        { text: singleRecord.nTotalPurchaseAmount, style: 'th' },
        { text: singleRecord.nProfit, style: 'th' },
        { text: singleRecord.nMargin, style: 'th' },
      ];
      const data = {
        table: {
          headerRows: 1,
          widths: columnWidths,
          heights: [30],
          body: [texts],
        },
        layout: tableLayout,
      };
      content.push(data);
      singleRecord.aArticleGroups.forEach((articleGroup: any) => {
        let texts: any = [
          { text: articleGroup.sName, style: ['td', 'articleGroup'] },
          { text: articleGroup.nQuantity, style: ['td', 'articleGroup'] },
          { text: articleGroup.nTotalRevenue, style: ['td', 'articleGroup'] },
          {
            text: articleGroup.nTotalPurchaseAmount,
            style: ['td', 'articleGroup'],
          },
          { text: articleGroup.nProfit, style: ['td', 'articleGroup'] },
          { text: articleGroup.nMargin, style: ['td', 'articleGroup'] },
        ];
        const data = {
          table: {
            headerRows: 0,
            widths: columnWidths,
            body: [texts],
          },
          layout: tableLayout,
        };
        content.push(data);

        articleGroup.aRevenueByProperty.forEach((property: any) => {
          let texts: any = [
            { text: property.aCategory, style: ['td', 'property'] },
            { text: property.nQuantity, style: ['td', 'property'] },
            { text: property.nTotalRevenue, style: ['td', 'property'] },
            { text: property.nTotalPurchaseAmount, style: ['td', 'property'] },
            { text: property.nProfit, style: ['td', 'property'] },
            { text: property.nMargin, style: ['td', 'property'] },
          ];
          const data = {
            table: {
              widths: columnWidths,
              body: [texts],
            },
            layout: tableLayout,
          };
          content.push(data);
        });
      });
      content.push({
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 575, y2: 0, lineWidth: 1 }],
        margin: [0, 0, 20, 0],
        style: ['afterLine', 'separatorLine'],
      });
    });
  }

  processPdfByRevenuePerArticleGroupAndProperty(
    content: any,
    columnWidths: any,
    tableLayout: any
  ) {
    let arr: Array<any> = [];

    this.aStatistic[0].individual.forEach((el: any) => {
      var obj: any = {};
      obj['sName'] = el.sName;
      obj['nQuantity'] = el.nQuantity;
      obj['nTotalRevenue'] = el.nTotalRevenue;
      obj['nTotalPurchaseAmount'] = el.nTotalPurchaseAmount;
      obj['nProfit'] = el.nProfit;
      obj['nMargin'] = el.nMargin;
      obj['aRevenueByProperty'] =
        el.aRevenueByProperty.map((property: any) => {
          let revenue = {
            aCategory: property.aCategory.join(' | '),
            nQuantity: property.nQuantity || 0,
            nTotalRevenue: property.nTotalRevenue,
            nTotalPurchaseAmount: property.nTotalPurchaseAmount,
            nProfit: property.nProfit || 0,
            nMargin: property.nMargin || 0,
          };
          return revenue;
        }) || [];

      arr.push(obj);
    });
    arr.forEach((singleRecord: any) => {
      let texts: any = [
        { text: singleRecord.sName, style: ['td', 'articleGroup'] },
        { text: singleRecord.nQuantity, style: ['td', 'articleGroup'] },
        { text: singleRecord.nTotalRevenue, style: ['td', 'articleGroup'] },
        {
          text: singleRecord.nTotalPurchaseAmount,
          style: ['td', 'articleGroup'],
        },
        { text: singleRecord.nProfit, style: ['td', 'articleGroup'] },
        { text: singleRecord.nMargin, style: ['td', 'articleGroup'] },
      ];
      const data = {
        table: {
          headerRows: 1,
          widths: columnWidths,
          heights: [30],
          body: [texts],
        },
        layout: tableLayout,
      };
      content.push(data);
      singleRecord.aRevenueByProperty.forEach((property: any) => {
        let texts: any = [
          { text: property.aCategory, style: ['td', 'property'] },
          { text: property.nQuantity, style: ['td', 'property'] },
          { text: property.nTotalRevenue, style: ['td', 'property'] },
          { text: property.nTotalPurchaseAmount, style: ['td', 'property'] },
          { text: property.nProfit, style: ['td', 'property'] },
          { text: property.nMargin, style: ['td', 'property'] },
        ];
        const data = {
          table: {
            widths: columnWidths,
            body: [texts],
          },
          layout: tableLayout,
        };
        content.push(data);
      });
    });
  }

  processPdfByRevenuePerSupplierAndArticleGroup(
    content: any,
    columnWidths: any,
    tableLayout: any
  ) {
    let arr: Array<any> = [];

    this.aStatistic[0].individual.forEach((el: any) => {
      var obj: any = {};
      obj['sBusinessPartnerName'] = el.sBusinessPartnerName;
      obj['nQuantity'] = el.nQuantity;
      obj['nTotalRevenue'] = el.nTotalRevenue;
      obj['nTotalPurchaseAmount'] = el.nTotalPurchaseAmount;
      obj['nProfit'] = el.nProfit;
      obj['nMargin'] = el.nMargin;
      obj['aArticleGroups'] =
        el.aArticleGroups.map((article: any) => {
          let data = {
            sName: article.sName,
            nQuantity: article.nQuantity,
            nTotalRevenue: article.nTotalRevenue,
            nTotalPurchaseAmount: article.nTotalPurchaseAmount,
            nProfit: article.nProfit,
            nMargin: article.nMargin,
          };
          return data;
        }) || [];

      arr.push(obj);
    });
    arr.forEach((singleRecord: any) => {
      let texts: any = [
        { text: singleRecord.sBusinessPartnerName, style: 'th' },
        { text: singleRecord.nQuantity, style: 'th' },
        { text: singleRecord.nTotalRevenue, style: 'th' },
        { text: singleRecord.nTotalPurchaseAmount, style: 'th' },
        { text: singleRecord.nProfit, style: 'th' },
        { text: singleRecord.nMargin, style: 'th' },
      ];
      const data = {
        table: {
          headerRows: 1,
          widths: columnWidths,
          heights: [30],
          body: [texts],
        },
        layout: tableLayout,
      };
      content.push(data);
      singleRecord.aArticleGroups.forEach((articleGroup: any) => {
        let texts: any = [
          { text: articleGroup.sName, style: ['td', 'articleGroup'] },
          { text: articleGroup.nQuantity, style: ['td', 'articleGroup'] },
          { text: articleGroup.nTotalRevenue, style: ['td', 'articleGroup'] },
          {
            text: articleGroup.nTotalPurchaseAmount,
            style: ['td', 'articleGroup'],
          },
          { text: articleGroup.nProfit, style: ['td', 'articleGroup'] },
          { text: articleGroup.nMargin, style: ['td', 'articleGroup'] },
        ];
        const data = {
          table: {
            headerRows: 0,
            widths: columnWidths,
            body: [texts],
          },
          layout: tableLayout,
        };
        content.push(data);
      });
    });
  }

  processPdfByRevenuePerProperty(
    content: any,
    columnWidths: any,
    tableLayout: any
  ) {
    let arr: Array<any> = [];

    this.aStatistic[0].individual.forEach((property: any) => {
      let revenue = {
        aCategory: property.aCategory.join(' | '),
        nQuantity: property.nQuantity || 0,
        nTotalRevenue: property.nTotalRevenue,
        nTotalPurchaseAmount: property.nTotalPurchaseAmount,
        nProfit: property.nProfit || 0,
        nMargin: property.nMargin || 0,
      };

      arr.push(revenue);
    });
    arr.forEach((property: any) => {
      let texts: any = [
        {
          text: property.aCategory.length ? property.aCategory : '-',
          style: ['td', 'property'],
        },
        { text: property.nQuantity, style: ['td', 'property'] },
        { text: property.nTotalRevenue, style: ['td', 'property'] },
        { text: property.nTotalPurchaseAmount, style: ['td', 'property'] },
        { text: property.nProfit, style: ['td', 'property'] },
        { text: property.nMargin, style: ['td', 'property'] },
      ];
      const data = {
        table: {
          widths: columnWidths,
          body: [texts],
        },
        layout: tableLayout,
      };
      content.push(data);
    });
  }

  processPdfByRevenuePerArticleGroup(
    content: any,
    columnWidths: any,
    tableLayout: any
  ) {
    let arr: Array<any> = [];

    this.aStatistic[0].individual.forEach((el: any) => {
      var obj: any = {};
      obj['sName'] = el.sName;
      obj['nQuantity'] = el.nQuantity;
      obj['nTotalRevenue'] = el.nTotalRevenue;
      obj['nTotalPurchaseAmount'] = el.nTotalPurchaseAmount;
      obj['nProfit'] = el.nProfit;
      obj['nMargin'] = el.nMargin;

      arr.push(obj);
    });
    arr.forEach((singleRecord: any) => {
      let texts: any = [
        { text: singleRecord.sName, style: ['td', 'articleGroup'] },
        { text: singleRecord.nQuantity, style: ['td', 'articleGroup'] },
        { text: singleRecord.nTotalRevenue, style: ['td', 'articleGroup'] },
        {
          text: singleRecord.nTotalPurchaseAmount,
          style: ['td', 'articleGroup'],
        },
        { text: singleRecord.nProfit, style: ['td', 'articleGroup'] },
        { text: singleRecord.nMargin, style: ['td', 'articleGroup'] },
      ];
      const data = {
        table: {
          headerRows: 1,
          widths: columnWidths,
          heights: [30],
          body: [texts],
        },
        layout: tableLayout,
      };
      content.push(data);
    });
  }

  calculateTotalCounting() {
    this.oCountings.nCashCounted = 0;
    this.aAmount.forEach((amount: any) => {
      this.oCountings.nCashCounted += amount.nValue * amount.nQuantity;
    });
  }

  expandItem(item: any, iBusinessPartnerId: string = '') {
    item.bIsCollapseItem = !item.bIsCollapseItem;
    if (item.aTransactionItems) {
      return;
    }
    let data: any = {
      skip: 0,
      limit: 100,
      sortBy: '',
      sortOrder: '',
      searchValue: '',
      iTransactionId: 'all',
      oFilterBy: {
        dStartDate: this.filterDates.startDate,
        dEndDate: this.filterDates.endDate,
        bIsArticleGroupLevel: this.bIsArticleGroupLevel,
        bIsSupplierMode: this.bIsSupplierMode
      },
      iBusinessId: this.iBusinessId,
    };
    if (
      this.sDisplayMethod.toString() === 'revenuePerBusinessPartner' ||
      this.sDisplayMethod.toString() === 'revenuePerSupplierAndArticleGroup' ||
      this.sDisplayMethod.toString() === 'revenuePerArticleGroupAndProperty' ||
      this.sDisplayMethod.toString() === 'revenuePerArticleGroup'
    ) {
      data.oFilterBy.iArticleGroupId = item._id;
    }
    if (
      this.sDisplayMethod.toString() === 'revenuePerBusinessPartner' ||
      this.sDisplayMethod.toString() === 'revenuePerSupplierAndArticleGroup'
    ) {
      data.oFilterBy.iBusinessPartnerId = iBusinessPartnerId;
    }

    if (this.sDisplayMethod.toString() === 'revenuePerProperty') {
      data.oFilterBy.aPropertyOptionIds = item.aPropertyOptionIds;
    }

    item.isLoading = true;
    this.transactionItemListSubscription = this.apiService
      .postNew('cashregistry', '/api/v1/transaction/item/list', data)
      .subscribe((result: any) => {
        item.isLoading = false;
        if (result?.data[0]?.result?.length) {
          console.log('expandItem response: ', result?.data[0]?.result);
          item.aTransactionItems = result.data[0].result;
        }
      });
  }

  fetchTransactionItems(): Observable<any> {
    let data = {
      iTransactionId: 'all',
      oFilterBy: {
        dStartDate: this.filterDates.startDate,
        dEndDate: this.filterDates.endDate,
        bIsArticleGroupLevel: this.bIsArticleGroupLevel,
        bIsSupplierMode: this.bIsSupplierMode
      },
      iBusinessId: this.iBusinessId,
      iLocationId: this.iLocationId,
      iWorkstationId: this.iWorkstationId,
    };

    return this.apiService.postNew(
      'cashregistry',
      '/api/v1/transaction/item/list',
      data
    );
  }

  fetchActivityItems(): Observable<any> {
    let data = {
      startDate: this.filterDates.startDate,
      endDate: this.filterDates.endDate,
      iBusinessId: this.iBusinessId,
      selectedWorkstations: [this.iWorkstationId],
    };

    return this.apiService.postNew(
      'cashregistry',
      '/api/v1/activities/items',
      data
    );
  }

  fetchGoldPurchaseItems(): Observable<any> {
    let data = {
      oFilterBy: {
        startDate: this.filterDates.startDate,
        endDate: this.filterDates.endDate,
      },
      iBusinessId: this.iBusinessId,
    };

    return this.apiService.postNew(
      'cashregistry',
      '/api/v1/activities/gold-purchases-payments/list',
      data
    );
  }
  addExpenses(data: any): Observable<any> {
    console.log('adding expenses', data);
    
    const value = localStorage.getItem('currentEmployee');
    let currentEmployeeId;
    if (value) {
      currentEmployeeId = JSON.parse(value)._id;
    }
    const transactionItem = {
      sProductName: 'Expenses',
      sComment: data.comment,
      nPriceIncVat: data.amount,
      nPurchasePrice: data.amount,
      iBusinessId: this.iBusinessId,
      nTotal: data.amount,
      nPaymentAmount: data.amount,
      iWorkstationId: this.iWorkstationId,
      iEmployeeId: currentEmployeeId,
      iLocationId: this.iLocationId,
      oPayment: data?.oPayment,
      oType: {
        eTransactionType: 'expenses',
        bRefund: false,
        eKind: 'expenses',
        bDiscount: false,
      },
    };
    return this.apiService.postNew(
      'cashregistry',
      `/api/v1/till/add-expenses`,
      transactionItem
    );
  }

  async closeDayState() {
    this.closingDayState = true;
    this.aAmount
      .filter((item: any) => item.nQuantity > 0)
      .forEach(
        (item: any) =>
          (this.oCountings.oCountingsCashDetails[item.key] = item.nQuantity)
      );

    if (this.oCountings.nCashInTill - this.oCountings.nCashCounted > 0) {
      //we have difference in cash, so add that as and expense
      const _expense = await this.addExpenses(
        {
          amount: this.oCountings.nCashInTill - this.oCountings.nCashCounted,
          comment: 'Lost money'
        }
      ).toPromise();
    }

    const oBody = {
      iBusinessId: this.iBusinessId,
      iLocationId: this.iLocationId,
      iWorkstationId: this.iWorkstationId,
      iStatisticId: this.iStatisticId,
      oCountings: this.oCountings,
    }

    this.closeSubscription = this.apiService.postNew('cashregistry', `/api/v1/statistics/close/day-state`, oBody).subscribe((result: any) => {
      this.toastService.show({ type: 'success', text: `Day-state is close now` });
      this.closingDayState = false;
      this.router.navigate(['/business/day-closure/list'])
    }, (error) => {
      console.log('Error: ', error);
      this.toastService.show({ type: 'warning', text: 'Something went wrong or open the day-state first' });
      this.closingDayState = false;
    })
  }

  getPaymentMethods() {
    console.log('getPaymentMethods');
    // this.payMethodsLoading = true;
    this.payMethods = [];
    const methodsToDisplay = [
      'card',
      'cash',
      'bankpayment',
      'maestro',
      'mastercard',
      'visa',
    ];
    this.apiService
      .getNew('cashregistry', '/api/v1/payment-methods/' + this.iBusinessId)
      .subscribe(
        (result: any) => {
          if (result && result.data && result.data.length) {
            this.allPaymentMethod = result.data;
            result.data.forEach((element: any) => {
              if (methodsToDisplay.includes(element.sName.toLowerCase())) {
                this.payMethods.push(element);
              }
            });
            this.filterDuplicatePaymentMethods();
          }
          // console.log(this.payMethods);
          // this.payMethodsLoading = false;
        },
        (error) => {
          // this.payMethodsLoading = false;
        }
      );
  }

  filterDuplicatePaymentMethods(){
    const aPresent = [...this.aPaymentMethods.map((item: any) => item.iPaymentMethodId), ...this.aNewSelectedPaymentMethods.map((item: any) => item._id)];
    this.payMethods = this.payMethods.filter((item: any) => !aPresent.includes(item._id));
    // console.log(aPresent, this.payMethods);
  }

  toggleEditPaymentMode(){
    this.paymentEditMode = !this.paymentEditMode;
    // this.addRow();
    if(!this.paymentEditMode) this.aNewSelectedPaymentMethods = [];
  }

  addRow(){
    this.aNewSelectedPaymentMethods.push({})
    this.filterDuplicatePaymentMethods()
  }

  reCalculateTotal(){
    this.nNewPaymentMethodTotal = 0;
    this.aPaymentMethods.forEach((item: any) => {
      if (item.nNewAmount)
      this.nNewPaymentMethodTotal += parseFloat(item.nNewAmount);
      // console.log(parseFloat(item.nNewAmount), this.nNewPaymentMethodTotal);
    });
    if (this.aNewSelectedPaymentMethods?.length)
    this.aNewSelectedPaymentMethods.forEach((item: any) =>{
      if(item.nAmount)
      this.nNewPaymentMethodTotal += parseFloat(item.nAmount);
    }); 
  }

  async saveUpdatedPayments(){
    // console.log(this.aNewSelectedPaymentMethods);
    // return;
    await this.aPaymentMethods.forEach(async (item: any) => {
      if (item.nAmount != item.nNewAmount){
        await this.addExpenses({
          amount: item.nNewAmount - item.nAmount,
          comment: 'Payment method change',
          oPayment: {
            iPaymentMethodId: item.iPaymentMethodId,
            nAmount: item.nNewAmount - item.nAmount,
            sMethod: item.sMethod
          }
        }).toPromise();
      }
    });

     if (this.aNewSelectedPaymentMethods.length){
      await this.aNewSelectedPaymentMethods.forEach(async (item: any) => {
        if (item.nAmount) {
          await this.addExpenses({
            amount: item.nAmount,
            comment: 'Payment method change',
            oPaymentMethod: {
              iPaymentMethodId: item._id,
              nAmount: item.nAmount,
              sMethod: item.sMethod
            }
          }).toPromise();
        }
      });
    }

    this.fetchStatistics();
  }

  ngOnDestroy(): void {
    if (this.listBusinessSubscription)
      this.listBusinessSubscription.unsubscribe();
    if (this.getStatisticSubscription)
      this.getStatisticSubscription.unsubscribe();
    if (this.statisticAuditSubscription)
      this.statisticAuditSubscription.unsubscribe();
    if (this.greenRecordsSubscription)
      this.greenRecordsSubscription.unsubscribe();
    if (this.propertyListSubscription)
      this.propertyListSubscription.unsubscribe();
    if (this.workstationListSubscription)
      this.workstationListSubscription.unsubscribe();
    if (this.employeeListSubscription)
      this.employeeListSubscription.unsubscribe();
    if (this.transactionItemListSubscription)
      this.transactionItemListSubscription.unsubscribe();
  }
}
