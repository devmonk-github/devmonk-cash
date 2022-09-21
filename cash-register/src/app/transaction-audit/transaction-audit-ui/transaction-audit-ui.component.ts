import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ApiService } from 'src/app/shared/service/api.service';
import { PdfService } from 'src/app/shared/service/pdf2.service';
import * as _moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'src/app/shared/components/toast';
import { defaultMenuOptions, MenuComponent } from 'src/app/shared/_layout/components/common';
import { Location } from '@angular/common';
import { ChildChild, DisplayMethod, eDisplayMethodKeysEnum, View, ViewMenuChild } from '../transaction-audit-ui.model';
import { TransactionAuditUiPdfService } from 'src/app/services/transaction-audit-pdf.service';
const moment = (_moment as any).default ? (_moment as any).default : _moment;


@Component({
  selector: 'app-transaction-audit-ui',
  templateUrl: './transaction-audit-ui.component.html',
  styleUrls: ['./transaction-audit-ui.component.scss'],
  providers: [TransactionAuditUiPdfService]
})

export class TransactionAuditUiComponent implements OnInit, AfterViewInit, OnDestroy {
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
  aDayClosure: any = [];

  closingDayState: boolean = false;

  closeSubscription!: Subscription;
  dayClosureListSubscription !: Subscription;

  statisticsData$: any;
  businessDetails: any = {};
  statistics: any;
  optionMenu = 'sales-order';
  statisticFilter = {
    isArticleGroupLevel: true,
    isProductLevel: false,
    dFromState: new Date(new Date().setHours(0, 0, 0)),
    dToState: new Date(new Date().setHours(23, 59, 59))
  };
  filterDates = {
    startDate: new Date(new Date().setHours(0, 0, 0)),
    endDate: new Date(new Date().setHours(23, 59, 59)),
  };
  bIsArticleGroupLevel: boolean = true; // Could be Article-group level or product-level (if false then article-group mode)
  bIsSupplierMode: boolean = true; // could be Business-owner-mode or supplier-mode (if true then supplier-mode)
  edisplayMethodKeysEnum = eDisplayMethodKeysEnum
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

  oStatisticsData: any = {};
  oStatisticsDocument: any;

  listBusinessSubscription!: Subscription;
  getStatisticSubscription!: Subscription;
  statisticAuditSubscription!: Subscription;
  greenRecordsSubscription!: Subscription;
  propertyListSubscription!: Subscription;
  workstationListSubscription!: Subscription;
  employeeListSubscription!: Subscription;
  transactionItemListSubscription!: Subscription;
  sCurrentLocation: any;
  sCurrentWorkstation: any;
  pdfGenerationInProgress: boolean = false;
  bShowProperty: boolean = false;

  groupingHelper(item: any) {
    return item.child[0];
  }

  // aOptionMenu: any = [
  //   { sKey: 'purchase-order', sValue: this.translate.instant('PURCHASE_ORDER') },
  //   { sKey: 'sales-order', sValue: this.translate.instant('SALES_ORDER') },
  //   { sKey: 'cash-registry', sValue: this.translate.instant('CASH_REGISTER') },
  // ];
  aOptionMenu: View[] = [];
  public sOptionMenu: {
    parent: View,
    child1: ViewMenuChild,
    child2: ChildChild,
  } = {} as {
    parent: View,
    child1: ViewMenuChild,
    child2: ChildChild,
  };
  public sSelectedOptionMenu = '';

  aVatRateMethod: any = [
    'oShopPurchase',
    'oWebShop',
    'oDeliverySupplier',
    'oDeliveryRetailer',
    'oSalesOrderSupplier',
  ];

  aDisplayMethod: DisplayMethod[] = [
    {
      sKey: eDisplayMethodKeysEnum.revenuePerBusinessPartner,
      sValue: 'Supplier And Article-Group And Dynamic Property',
    },
    {
      // sKey: 'revenuePerArticleGroupAndProperty',
      sKey: eDisplayMethodKeysEnum.revenuePerArticleGroupAndProperty,
      sValue: 'Article Group and Dynamic Property',
    },
    {
      sKey: eDisplayMethodKeysEnum.revenuePerSupplierAndArticleGroup, // Use the revenuePerBusinessPartner and Remove the Dynamic Property
      sValue: 'Supplier And Article-Group',
    },
    {
      sKey: eDisplayMethodKeysEnum.revenuePerProperty,
      sValue: 'Revenue Per Property',
    },
    {
      sKey: eDisplayMethodKeysEnum.revenuePerArticleGroup, // Use the revenuePerArticleGroupAndProperty and remove the Dynamic Property
      sValue: 'Article Group',
    },
    {
      sKey: eDisplayMethodKeysEnum.aVatRates,
      sValue: 'Vat Rates',
    },
  ];
  sDisplayMethod: eDisplayMethodKeysEnum = eDisplayMethodKeysEnum.revenuePerBusinessPartner

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
    nCashRemain: 0,
    nCashAtStart: 0,
    oCountingsCashDetails: {},
  };
  aRefundItems: any;
  aDiscountItems: any;
  aRepairItems: any;
  iWorkstationId: string | null;
  aGoldPurchases: any;
  aGiftItems: any;
  previousPage = 0

  constructor(
    private apiService: ApiService,
    private pdf: PdfService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private location: Location,
    private transactionAuditPdfService: TransactionAuditUiPdfService,

  ) {
    MenuComponent.reinitialization()
    this.iBusinessId = localStorage.getItem('currentBusiness') || '';
    this.iLocationId = localStorage.getItem('currentLocation') || '';
    this.iWorkstationId = localStorage.getItem('currentWorkstation') || '';
    this.sUserType = localStorage.getItem('type') || '';
    const _oUser = localStorage.getItem('currentUser');
    if (_oUser) this.oUser = JSON.parse(_oUser);
    this.previousPage = this.route?.snapshot?.queryParams?.page || 0

    this.iStatisticId = this.route.snapshot?.params?.iStatisticId;
    if(this.iStatisticId){
      this.oStatisticsData.dStartDate = this.router.getCurrentNavigation()?.extras?.state?.dStartDate ?? null;
      this.oStatisticsData.dEndDate = this.router.getCurrentNavigation()?.extras?.state?.dEndDate ?? null;
      if (this.oStatisticsData.dStartDate){
        this.filterDates.startDate = this.oStatisticsData.dStartDate;
        const endDate = (this.oStatisticsData.dEndDate) ? this.oStatisticsData.dEndDate : new Date();
        this.filterDates.endDate = endDate;
        this.oStatisticsData.dEndDate = endDate;
      } else {
        this.router.navigate(['/business/day-closure'])
      }
    }
  }

  ngOnInit(): void {
    this.businessDetails._id = localStorage.getItem('currentBusiness');
    this.setOptionMenu()
    this.fetchBusinessDetails();
    this.fetchStatistics(this.sDisplayMethod.toString());
    this.fetchBusinessLocation();
    this.getProperties();
    this.getWorkstations();
    this.getEmployees();
    this.getPaymentMethods();
    if (this.iStatisticId) this.fetchCurrentStatisticDocument();
    // this.fetchStatisticDocument();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      MenuComponent.reinitialization();
    }, 200);
  }

  setOptionMenu() {
    this.aOptionMenu = [
      {
        sKey: 'Sales',
        sValue: 'cash-registry',
        children: [
          {
            sKey: 'ArticleGroup',
            sValue: this.translate.instant('ARTICLE GROUP'),
            children: [
              {
                sKey: 'Compact',
                sValue: this.translate.instant('COMPACT'),
                data: {
                  displayMethod: eDisplayMethodKeysEnum.revenuePerArticleGroup,
                  modeFilter: 'supplier',
                }
              },
              {
                sKey: 'Specific',
                sValue: this.translate.instant('SPECIFIC'),
                data: {
                  displayMethod: eDisplayMethodKeysEnum.revenuePerArticleGroupAndProperty,
                  modeFilter: 'supplier',
                  levelFilter: 'articleGroup'
                }
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
                data: {
                  displayMethod: eDisplayMethodKeysEnum.aVatRates,
                }
              },
              {
                sKey: 'Revenue per',
                sValue: this.translate.instant('REVENUE_PER'),
                data: {
                  displayMethod: eDisplayMethodKeysEnum.revenuePerProperty
                }
              },
              {
                sKey: 'Article group',
                sValue: this.translate.instant('ARTICLE_GROUP'),
                data: {
                  displayMethod: eDisplayMethodKeysEnum.aVatRates
                }
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
                data: {
                  displayMethod: eDisplayMethodKeysEnum.revenuePerSupplierAndArticleGroup,
                  modeFilter: 'supplier',
                }
              },
              {
                sKey: 'Specific',
                sValue: this.translate.instant('SPECIFIC'),
                data: {
                  displayMethod: eDisplayMethodKeysEnum.revenuePerBusinessPartner,
                  modeFilter: 'supplier',
                  levelFilter: 'articleGroup'
                }
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
                data: {
                  displayMethod: eDisplayMethodKeysEnum.revenuePerArticleGroup,
                  modeFilter: 'businessOwner',
                }
              },
              {
                sKey: 'Specific',
                sValue: this.translate.instant('SPECIFIC'),
                data: {
                  displayMethod: eDisplayMethodKeysEnum.revenuePerArticleGroupAndProperty,
                  modeFilter: 'businessOwner',
                  levelFilter: 'articleGroup'
                }
              }
            ]
          },
        ],
      },
      {
        sKey: 'Purchases',
        sValue: 'purchase-order',
        children: [
          {
            sKey: 'ArticleGroup',
            sValue: this.translate.instant('ARTICLE GROUP'),
            children: [
              {
                sKey: 'Compact',
                sValue: this.translate.instant('COMPACT'),
                data: {
                  displayMethod: eDisplayMethodKeysEnum.revenuePerArticleGroup,
                  modeFilter: 'supplier',
                }
              },
              {
                sKey: 'Specific',
                sValue: this.translate.instant('SPECIFIC'),
                data: {
                  displayMethod: eDisplayMethodKeysEnum.revenuePerArticleGroupAndProperty,
                  modeFilter: 'supplier',
                  levelFilter: 'articleGroup'
                }
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
                data: {
                  displayMethod: eDisplayMethodKeysEnum.aVatRates,
                }
              },
              {
                sKey: 'Revenue per',
                sValue: this.translate.instant('REVENUE_PER'),
                data: {
                  displayMethod: eDisplayMethodKeysEnum.revenuePerProperty
                }
              },
              {
                sKey: 'Article group',
                sValue: this.translate.instant('ARTICLE_GROUP'),
                data: {
                  displayMethod: eDisplayMethodKeysEnum.aVatRates
                }
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
                data: {
                  displayMethod: eDisplayMethodKeysEnum.revenuePerSupplierAndArticleGroup,
                  modeFilter: 'supplier',
                }
              },
              {
                sKey: 'Specific',
                sValue: this.translate.instant('SPECIFIC'),
                data: {
                  displayMethod: eDisplayMethodKeysEnum.revenuePerBusinessPartner,
                  modeFilter: 'supplier',
                  levelFilter: 'articleGroup'
                }
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
                data: {
                  displayMethod: eDisplayMethodKeysEnum.revenuePerArticleGroup,
                  modeFilter: 'businessOwner',
                }
              },
              {
                sKey: 'Specific',
                sValue: this.translate.instant('SPECIFIC'),
                data: {
                  displayMethod: eDisplayMethodKeysEnum.revenuePerArticleGroupAndProperty,
                  modeFilter: 'businessOwner',
                  levelFilter: 'articleGroup'
                }
              }
            ]
          },
        ],
      },
      {
        sKey: 'Sales orders',
        sValue: 'sales-order',
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
                  displayMethod: eDisplayMethodKeysEnum.revenuePerArticleGroup,
                  modeFilter: 'supplier',
                }
              },
              {
                sKey: 'Specific',
                sValue: this.translate.instant('SPECIFIC'),
                data: {
                  displayMethod: eDisplayMethodKeysEnum.revenuePerArticleGroupAndProperty,
                  modeFilter: 'supplier',
                  levelFilter: 'articleGroup'
                }
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
                data: {
                  displayMethod: eDisplayMethodKeysEnum.aVatRates,
                }
              },
              {
                sKey: 'Revenue per',
                sValue: this.translate.instant('REVENUE_PER'),
                data: {
                  displayMethod: eDisplayMethodKeysEnum.revenuePerProperty
                }
              },
              {
                sKey: 'Article group',
                sValue: this.translate.instant('ARTICLE_GROUP'),
                data: {
                  displayMethod: eDisplayMethodKeysEnum.aVatRates
                }
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
                data: {
                  displayMethod: eDisplayMethodKeysEnum.revenuePerSupplierAndArticleGroup,
                  modeFilter: 'supplier',
                }
              },
              {
                sKey: 'Specific',
                sValue: this.translate.instant('SPECIFIC'),
                data: {
                  displayMethod: eDisplayMethodKeysEnum.revenuePerBusinessPartner,
                  modeFilter: 'supplier',
                  levelFilter: 'articleGroup'
                }
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
                data: {
                  displayMethod: eDisplayMethodKeysEnum.revenuePerArticleGroup,
                  modeFilter: 'businessOwner',
                }
              },
              {
                sKey: 'Specific',
                sValue: this.translate.instant('SPECIFIC'),
                data: {
                  displayMethod: eDisplayMethodKeysEnum.revenuePerArticleGroupAndProperty,
                  modeFilter: 'businessOwner',
                  levelFilter: 'articleGroup'
                }
              }
            ]
          },
        ],
      },
    ]

    const eUserType = localStorage.getItem('type') ?? ''
    if (eUserType && eUserType.toLowerCase() !== 'supplier') {
      let iPurchaseIndex = this.aOptionMenu.findIndex(i => i.sValue.toLowerCase() === 'sales-order')
      this.aOptionMenu.splice(iPurchaseIndex, 1)
    }
    this.onDropdownItemSelected(this.aOptionMenu[0], this.aOptionMenu[0].children[0], this.aOptionMenu[0].children[0].children[0])
  }

  goBack() {
    if (this.previousPage) {
      this.router.navigateByUrl('/business/day-closure/list?page=' + this.previousPage, {
        replaceUrl: true,
      })
      return
    }
    this.location.back()
  }
  onDropdownItemSelected(parent: View, child1: ViewMenuChild, child2: ChildChild) {
    this.bShowProperty = false;
    this.sOptionMenu = {
      parent,
      child1,
      child2,
    }
    this.optionMenu = parent.sValue.toLowerCase().trim();
    this.sSelectedOptionMenu = `${parent.sKey}->${child1.sKey}->${child2.sKey}`;
    if (child2?.sValue == 'REVENUE_PER' || child2?.sValue == "SPECIFIC") this.bShowProperty = true;
    const eDisplayMethod = child2.data?.displayMethod || null
    const sModeFilter = child2.data?.modeFilter || null
    const sLevelFilter = child2.data?.levelFilter || null

    if (eDisplayMethod) {
      this.sDisplayMethod = eDisplayMethod
    }
    if (sModeFilter) {
      this.bIsSupplierMode = sModeFilter === "supplier"
    }
    if (sLevelFilter) {
      this.bIsArticleGroupLevel = sLevelFilter === "articleGroup"
    }


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
            this.sCurrentLocation = result?.data?.sName;
            this.aLocation.forEach((oLocation: any) =>{
              if (oLocation._id === this.iLocationId){
                this.sCurrentLocation += " ("+ oLocation?.sName + ")";
              }
            });
        },
        (error) => {
          console.log('error: ', error);
        }
      );
  }

  displayMethodChange() {
    this.aStatistic = [];
  }

  fetchCurrentStatisticDocument(){
    const oBody = {
      iStatisticId: this.iStatisticId,
      iBusinessId: this.iBusinessId,
    }
    this.apiService.postNew('cashregistry', `/api/v1/statistics/get`, oBody).subscribe((result: any) => {
      if(result?.message === 'success'){
        this.oStatisticsDocument = result?.data?.aStatistic[0];
        this.oCountings.nCashAtStart = this.oStatisticsDocument?.oCountings?.nCashAtStart || 0;
      }
    });
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
        sDisplayMethod: sDisplayMethod || this.sDisplayMethod.toString(),
        // dStartDate: this.filterDates.startDate,
        // dEndDate: this.filterDates.endDate,
        dStartDate: this.statisticFilter.dFromState,
        dEndDate: this.statisticFilter.dToState,
        aFilterProperty: this.aFilterProperty,
        bIsArticleGroupLevel: true,
        bIsSupplierMode: true,
      },
    };

    if (this.IsDynamicState) {
      oBody.oFilter.bIsArticleGroupLevel = this.bIsArticleGroupLevel;
      oBody.oFilter.bIsSupplierMode = this.bIsSupplierMode;
    }

    this.fetchDayClosureList();
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
        aLocationId: this?.aSelectedLocation?.length ? this.aSelectedLocation: [],
        iWorkstationId: this.selectedWorkStation?._id,
        iEmployeeId: this.selectedEmployee?._id,
        sTransactionType: this.optionMenu,
        sDisplayMethod: sDisplayMethod || this.sDisplayMethod.toString(),
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
          
          this.nPaymentMethodTotal = 0;
          this.nNewPaymentMethodTotal = 0;
          this.bStatisticLoading = false;
          if (result?.data) {

            if (result.data?.oTransactionAudit?.length)
              this.aStatistic = result.data.oTransactionAudit;

            if (this.aStatistic?.length && this.aStatistic[0]?.overall?.length){
              this.oCountings.nCashInTill = this.aStatistic[0].overall[0].nTotalRevenue;
            }

            if (result.data?.aPaymentMethods?.length) {
              this.aPaymentMethods = result.data.aPaymentMethods;
              this.aPaymentMethods.map((item: any) => {
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
      oFilterBy: {},
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
                    iPropertyOptionId: option?._id,
                    sPropertyOptionName: option?.value,
                    // oProperty: {},
                    sCode: option.sCode,
                    sName: option.sKey,
                    selected: false,
                  };
                  // opt.oProperty[option.sKey] = option.value;
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
            this.aFilterProperty.push(oOption?.iPropertyOptionId);
          }
        }
      }
    }
  }

  getWorkstations() {
    (this.workstationListSubscription = this.apiService.getNew('cashregistry', `/api/v1/workstations/list/${this.iBusinessId}/${this.iLocationId}`).subscribe((result: any) => {
        if (result && result.data?.length) {
          this.aWorkStation = result.data;
          this.sCurrentWorkstation = this.aWorkStation.filter((el: any) => el._id === this.iWorkstationId)[0]?.sName;
        }
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

  async exportToPDF(event:any) {
    this.pdfGenerationInProgress = true;
    event.target.disabled = true;
    await this.transactionAuditPdfService.exportToPDF({
      // aDisplayMethod: this.aDisplayMethod,
      aSelectedLocation: this.aSelectedLocation,
      sOptionMenu: this.sOptionMenu,
      bIsDynamicState: this.IsDynamicState,
      aLocation: this.aLocation,
      oSelectedWorkStation: this.selectedWorkStation,
      aWorkStation: this.aWorkStation,
      oFilterDates: this.filterDates,
      oBusinessDetails: this.businessDetails,
      sDisplayMethod: this.sDisplayMethod,
      sDisplayMethodString: this.sSelectedOptionMenu,
      aStatistic: this.aStatistic,
      aPaymentMethods: this.aPaymentMethods,
      bIsArticleGroupLevel: this.bIsArticleGroupLevel,
      bIsSupplierMode: this.bIsSupplierMode
    });
    event.target.disabled = false;
    this.pdfGenerationInProgress = false;
  }

  calculateTotalCounting() {
    this.oCountings.nCashCounted = 0;
    this.aAmount.forEach((amount: any) => {
      this.oCountings.nCashCounted += amount.nValue * amount.nQuantity;
    });
  }

  expandItem(item: any, iBusinessPartnerId: string = '') {
    item.bIsCollapseItem = !item.bIsCollapseItem;
    if (item.aTransactionItems) return;
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
      data.oFilterBy.iArticleGroupOriginalId = item._id;
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
    this.aAmount.filter((item: any) => item.nQuantity > 0).forEach((item: any) =>(this.oCountings.oCountingsCashDetails[item.key] = item.nQuantity));
    const nDifferenceAmount = this.oCountings.nCashInTill - this.oCountings.nCashCounted;
    
    const oCashPaymentMethod = this.allPaymentMethod.filter((el: any) => el.sName.toLowerCase() === 'cash')[0];
    const oBankPaymentMethod = this.allPaymentMethod.filter((el: any) => el.sName.toLowerCase() === 'bankpayment')[0];

    if (nDifferenceAmount > 0) {
      //we have difference in cash, so add that as and expense

     await this.addExpenses(
        {
         amount: nDifferenceAmount,
          comment: 'Lost money',
          oPayment: {
            iPaymentMethodId: oCashPaymentMethod._id,
            nAmount: nDifferenceAmount,
            sMethod: oCashPaymentMethod.sName.toLowerCase()
          }
        }
      ).toPromise();
    }

    if(this.oCountings.nSkim > 0){  
      //amount to put in bank - so add create new expense with positive amount to add it as bank payment, and negative amount as cash
      // so increase bank payment amount and equally decrease cash payment amount
      
      
      await this.addExpenses({
        amount: this.oCountings.nSkim,
          comment: 'Transfer to the bank (increase bank amount)',
          oPayment: {
            iPaymentMethodId: oBankPaymentMethod._id,
            nAmount: this.oCountings.nSkim,
            sMethod: oBankPaymentMethod.sName.toLowerCase()
          }
        }).toPromise();

      await this.addExpenses({
        amount: -this.oCountings.nSkim,
          comment: 'Transfered to the bank (decrease cash amount)',
          oPayment: {
            iPaymentMethodId: oCashPaymentMethod._id,
            nAmount: -this.oCountings.nSkim,
            sMethod: oCashPaymentMethod.sName.toLowerCase()
          }
        }).toPromise();

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
    this.payMethods = [];
    this.apiService
      .getNew('cashregistry', '/api/v1/payment-methods/' + this.iBusinessId)
      .subscribe(
        (result: any) => {
          if (result && result.data && result.data.length) {
            this.allPaymentMethod = result.data;
            result.data.forEach((element: any) => {
              this.payMethods.push(element);
            });
            this.filterDuplicatePaymentMethods();
          }
        },
        (error) => {
        }
      );
  }

  filterDuplicatePaymentMethods() {
    const aPresent = [...this.aPaymentMethods.map((item: any) => item.iPaymentMethodId), ...this.aNewSelectedPaymentMethods.map((item: any) => item._id)];
    this.payMethods = this.payMethods.filter((item: any) => !aPresent.includes(item._id));
  }

  toggleEditPaymentMode() {
    this.paymentEditMode = !this.paymentEditMode;
    // this.addRow();
    if (!this.paymentEditMode) this.aNewSelectedPaymentMethods = [];
  }

  addRow() {
    this.aNewSelectedPaymentMethods.push({})
    this.filterDuplicatePaymentMethods()
  }

  reCalculateTotal() {
    this.nNewPaymentMethodTotal = 0;
    this.aPaymentMethods.forEach((item: any) => {
      if (item.nNewAmount)
        this.nNewPaymentMethodTotal += parseFloat(item.nNewAmount);
    });
    if (this.aNewSelectedPaymentMethods?.length)
      this.aNewSelectedPaymentMethods.forEach((item: any) => {
        if (item.nAmount)
          this.nNewPaymentMethodTotal += parseFloat(item.nAmount);
      });
  }

  async saveUpdatedPayments(event:any) {
    event.target.disabled = true;
    for (const item of this.aPaymentMethods) {
      if (item.nAmount != item.nNewAmount) {
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
    }

    if (this.aNewSelectedPaymentMethods.length) {
      for (const item of this.aNewSelectedPaymentMethods) {
        if (item.nAmount) {
          await this.addExpenses({
            amount: item.nAmount,
            comment: 'Payment method change',
            oPayment: {
              iPaymentMethodId: item._id,
              nAmount: item.nAmount,
              sMethod: item.sName.toLowerCase()
            }
          }).toPromise();
        }
      }
    }

    const endDate = new Date();
    this.filterDates.endDate = endDate;
    this.oStatisticsData.dEndDate = endDate;

    this.paymentEditMode = false;
    event.target.disabled = false;

    this.fetchStatistics();
  }

  /* For FROM State and TO State */
  fetchDayClosureList() {
    try {
      this.aDayClosure = [];

      const oBody = {
        iBusinessId: this.iBusinessId,
        oFilter: {
          iLocationId: this.iLocationId,
          aLocationId: this?.aSelectedLocation?.length ? this.aSelectedLocation : [],
          iWorkstationId: this.selectedWorkStation?._id,
        },
      }
      this.dayClosureListSubscription = this.apiService.postNew('cashregistry', `/api/v1/statistics/day-closure/list`, oBody).subscribe((result: any) => {
        if (result?.data?.length && result.data[0]?.result?.length) {
          const _aDayClosure = result.data[0]?.result.map((oDayClosure: any) => {
            const oData = { _id: oDayClosure?._id, dOpenDate: oDayClosure?.dOpenDate, dCloseDate: oDayClosure?.dCloseDate, isDisable: true, sWorkStationName: oDayClosure?.sWorkStationName }
            return oData;
          });
          this.aDayClosure = _aDayClosure;
        }
        // this.showLoader = false;
      }, (error) => {
        console.log('error: ', error);
        // this.showLoader = false;
      })
    } catch (error) {
      console.log('error: ', error);
    }
  }

  onStateChange(dDate: any, isOpenDate: boolean, aDayClosure: any) {
    const dFromStateTime = new Date(this.statisticFilter.dFromState).getTime();
    const dToStateTime = new Date(this.statisticFilter.dToState).getTime();
    /* Disabling the date which is smaller than the dFromState in dToState */
    for (let i = 0; i < aDayClosure?.length; i++) {
      aDayClosure[i].isDisable = false;
      const dDayClosureDateTime = new Date(aDayClosure[i].dCloseDate).getTime();
      if (dFromStateTime > dDayClosureDateTime) aDayClosure[i].isDisable = true;
    }    
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
    if (this.dayClosureListSubscription) this.dayClosureListSubscription.unsubscribe();
  }
}

