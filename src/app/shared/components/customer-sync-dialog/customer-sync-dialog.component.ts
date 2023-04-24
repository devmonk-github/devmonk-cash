import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, SimpleChanges } from '@angular/core';
import { DialogComponent, DialogService } from '../../service/dialog';
import { ViewContainerRef } from '@angular/core';
import { ApiService } from 'src/app/shared/service/api.service';
import { CustomerDetailsComponent } from '../customer-details/customer-details.component';

import { faL, faTimes } from "@fortawesome/free-solid-svg-icons";
import { TranslateService } from '@ngx-translate/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexXAxis,
  ChartComponent,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexLegend
} from "ng-apexcharts";
import { ToastService } from '../toast';
import { TransactionDetailsComponent } from '../../../transactions/components/transaction-details/transaction-details.component';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { CustomerDialogComponent } from 'src/app/shared/components/customer-dialog/customer-dialog.component';
export interface BarChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  colors: any;
  tooltip: any
};

export interface PieChartOptions {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  legend: ApexLegend;
  title: any;
  options: any
};

export const ChartColors = {
  REPAIR: '#4ab69c',
  SPECIAL_ORDERS: '#212E48',
  SHOP_PURCHASE: '#1C3238',
  QUOTATION: '#7337EE',
  WEBSHOP: '#92929F',
  REFUND: '#fd7e14',
  GIFTCARD: '#198754',
  GOLD_PURCHASE: '#800000',
  PRODUCT_RESERVATION: '#d63384',
  DISCOUNTS: '#dc3545',
  JEWELLERY: '#20c997',
  WATCHES: '#6f42c1'
}

@Component({
  selector: 'app-customer-sync-dialog',
  templateUrl: './customer-sync-dialog.component.html',
  styleUrls: ['./customer-sync-dialog.component.sass']
})

export class CustomerSyncDialogComponent implements OnInit, AfterViewInit {

  dialogRef: DialogComponent;
  salutations: Array<any> = ['Mr', 'Mrs', 'Mr/Mrs', 'Family', 'Firm']
  gender: Array<any> = ['Male', 'Female', "Other"]
  documentTypes: Array<any> = ['Driving license', 'Passport', 'Identity card', 'Alien document'];
  mode: string = '';
  editProfile: boolean = true;
  bIsCurrentCustomer: boolean = false;
  bIsCounterCustomer: boolean = false;
  showStatistics: boolean = false;
  faTimes = faTimes;
  aPaymentChartData: any = [];
  aEmployeeStatistic: any = [];
  translations: any;
  pageCounts: Array<number> = [10, 25, 50, 100]
  pageNumber: number = 1;
  setPaginateSize: number = 10;
  iEmployeeId: any;
  employeesList: any;
  mergeCustomerIdList: any;
  customerLoyalityPoints: Number;
  pointsAdded: Boolean = false;
  oPointsSettingsResult: any;

  purchasePaginationConfig: any = {
    id: 'purchases_paginate',
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  };
  activitiesPaginationConfig: any = {
    id: 'activities_paginate',
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  };
  itemsPaginationConfig: any = {
    id: 'items_paginate',
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  };
  purchaseRequestParams: any = {
    skip: 0,
    limit: 10
  }
  activitiesRequestParams: any = {
    skip: 0,
    limit: 10
  }
  itemsRequestParams: any = {
    skip: 0,
    limit: 10
  }
  customer: any = {
    _id: '',
    bNewsletter: true,
    sSalutation: 'Mr',
    sEmail: '',
    sFirstName: '',
    sPrefix: '',
    sLastName: '',
    oPhone: {
      sCountryCode: '',
      sMobile: '',
      sLandLine: '',
      sFax: '',
      bWhatsApp: true
    },
    sNote: '',
    dDateOfBirth: '',
    oIdentity: {
      documentName: '',
      documentNumber: '',
    },
    sGender: 'male',
    oInvoiceAddress: {
      sCountry: 'Netherlands',
      sCountryCode: 'NL',
      sState: '',
      sPostalCode: '',
      sHouseNumber: '',
      sHouseNumberSuffix: '',
      //sAddition: '',
      sStreet: '',
      sCity: ''
    },
    oShippingAddress: {
      sCountry: 'Netherlands',
      sCountryCode: 'NL',
      sState: '',
      sPostalCode: '',
      sHouseNumber: '',
      sHouseNumberSuffix: '',
      //sAddition: '',
      sStreet: '',
      sCity: ''
    },
    sCompanyName: '',
    sVatNumber: '',
    sCocNumber: '',
    nPaymentTermDays: '',
    nLoyaltyPoints: 0,
    nLoyaltyPointsValue: 0,
    createrDetail: {},
    iEmployeeId: '',
    aGroups: [],
    bIsCompany: false
  }
  iChosenCustomerId: any;
  iSearchedCustomerId: any;
  CustomerId: any;
  customers: Array<any> = [];

  paginationConfig: any = {
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  };

  requestParams: any = {
    searchValue: '',
    skip: 0,
    limit: 10,
    oFilterBy: {},
    iBusinessId: "",
    aProjection: ['sSalutation', 'sFirstName', 'sPrefix', 'sLastName', 'dDateOfBirth', 'dDateOfBirth', 'nClientId', 'sGender', 'bIsEmailVerified',
      'bCounter', 'sEmail', 'oPhone', 'oShippingAddress', 'oInvoiceAddress', 'iBusinessId', 'sComment', 'bNewsletter', 'sCompanyName', 'oPoints',
      'sCompanyName', 'oIdentity', 'sVatNumber', 'sCocNumber', 'nPaymentTermDays', 'nDiscount', 'bWhatsApp', 'nMatchingCode', 'sNote', 'sBagNumber', 'dEstimatedDate', 'eActivityItemStatus', 'sBusinessPartnerName',
      'bIsMerged', 'eStatus', 'bIsImported'],

  };

  bTransactionsLoader: boolean = false;
  bActivitiesLoader: boolean = false;
  bActivityItemsLoader: boolean = false;

  aTransactions !: Array<any>;
  aTransctionTableHeaders: Array<any> = [
    { key: 'Date', selected: true, sort: 'desc' },
    { key: 'Transaction no.', selected: false, sort: '' },
    { key: 'Receipt number', selected: false, sort: '' },
    { key: 'Method', disabled: true },
    { key: 'Total', disabled: true },
  ];

  aActivities!: Array<any>;
  aActivityTableHeaders: Array<any> = [
    { key: 'Activity No.', selected: false, sort: '' },
    { key: 'Repair number', disabled: true },
    { key: 'Type', disabled: true },
    { key: 'Intake date', selected: true, sort: 'asc' },
    { key: 'End date', selected: false, sort: 'asc' },
    { key: 'Status', disabled: true },
    { key: 'Supplier/Repairer', disabled: true },
  ]

  aActivityItems!: Array<any>;
  aActivityItemsTableHeaders: Array<any> = [
    { key: 'Activity No.', selected: false, sort: '' },
    { key: 'Repair number', disabled: true },
    { key: 'Type', disabled: true },
    { key: 'Intake date', selected: true, sort: 'asc' },
    { key: 'End date', selected: false, sort: 'asc' },
    { key: 'Status', disabled: true },
    { key: 'Supplier/Repairer', disabled: true },
  ];

  tabTitles: any = [
    'Purchases',
    'Activities',
    'Items per visit',
    'Statistics',
    'General'
  ];

  @ViewChild("statistics-chart") statisticsChart !: ChartComponent;
  public statisticsChartOptions !: Partial<BarChartOptions> | any;

  @ViewChild("activities-chart") activitiesChart !: ChartComponent;
  public activitiesChartOptions !: Partial<PieChartOptions> | any;

  @ViewChild("paymentMethodsChart") paymentMethodsChart !: ChartComponent;
  public paymentMethodsChartOptions !: Partial<PieChartOptions> | any;

  @ViewChild('customerNote') customerNote: ElementRef;

  aStatisticsChartDataLoading = false
  aActivityTitles: any = [
    { type: "Repairs", value: 0, color: ChartColors.REPAIR },//$primary-color
    { type: "Special orders", value: 0, color: ChartColors.SPECIAL_ORDERS },//$dark-primary-light-color
    { type: "Shop purchase", value: 0, color: ChartColors.SHOP_PURCHASE },//$dark-success-light-color
    { type: "Quotation", value: 0, color: ChartColors.QUOTATION },//$info-active-color
    { type: "Webshop", value: 0, color: ChartColors.WEBSHOP },//$gray-700
    { type: "Giftcard", value: 0, color: ChartColors.GIFTCARD },//$green
    { type: "Gold purchase", value: 0, color: ChartColors.GOLD_PURCHASE },//$maroon
    { type: "Product reservation", value: 0, color: ChartColors.PRODUCT_RESERVATION }//$pink
  ];
  activityTitlesEkind = ['regular', 'reservation', 'giftcard', 'gold-purchase', 'repair', 'order'];
  aStatisticsChartData: any = [];

  totalActivities: number = 0;
  from !: string;

  customerNotesChangedSubject: Subject<string> = new Subject<string>();
  nTotalTurnOver: any;
  nAvgOrderValueIncVat: number;
  customerGroupList: any = [];
  aSelectedGroups: any = [];
  businessDetails: any = {};
  customerList: any = [];
  bMUpdated: boolean = true;
  systemCustomer: any;
  activityItems: any;

  /* Check if saving points are enabled */
  savingPointsSetting: boolean = JSON.parse(localStorage.getItem('savingPoints') || '');

  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService,
    private dialogService: DialogService,
    private translateService: TranslateService,

    private router: Router
  ) {
    const _injector = this.viewContainerRef.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit(): void {
    this.apiService.setToastService(this.toastService);
    this.activityItems = this.dialogRef?.context?.activityItems;
    this.customer = { ... this.customer, ... this.dialogRef?.context?.currenCustomer };
    this.systemCustomer = this.dialogRef?.context?.systemCustomer;
    this.iSearchedCustomerId = this.customer._id;
    const translations = ['SUCCESSFULLY_ADDED', 'SUCCESSFULLY_UPDATED', 'LOYALITY_POINTS_ADDED']
    this.translateService.get(translations).subscribe(
      result => this.translations = result
    )
    this.requestParams.iBusinessId = localStorage.getItem('currentBusiness');
    this.requestParams.iLocationid = localStorage.getItem('currentLocation');
    this.iEmployeeId = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser') || '') : "";



  }

  async getChosenCustomerdetail(iBusinessId: any, iChosenCustomerId: any) {
    const Result: any = await this.apiService.getNew('customer', `/api/v1/customer/${iBusinessId}/${iChosenCustomerId}`).toPromise();
    console.log(Result);
    if (Result?.data) {
      this.customerList.push(Result?.data);
    }

  }
  /* Update customer in [T, A, AI] */
  updateCurrentCustomer(oData: any) {
    const oBody = {
      oCustomer: this.systemCustomer,
      iBusinessId: this.requestParams.iBusinessId,
      iActivityItemId: this.activityItems[0]._id
    }
    console.log("oBody", oBody);
    this.apiService.postNew('cashregistry', '/api/v1/transaction/update-customer', oBody).subscribe((result: any) => {
      this.close({ action: true });
      this.toastService.show({ type: "success", text: 'SUCCESSFULLY_UPDATED' });
    }, (error) => {
      console.log('update customer error: ', error);
      this.toastService.show({ type: "warning", text: `Something went wrong` });
    });
  }
  openCustomer(customer: any) {
    this.dialogService.openModal(CustomerDetailsComponent,
      { cssClass: "modal-xl position-fixed start-0 end-0", context: { customerData: customer, mode: 'details', editProfile: false } }).instance.close.subscribe(result => { this.close({ action: true }); });
  }

  UpdateCustomerData() {
    if (this.CustomerId == 0) {
      this.updateCurrentCustomer(this.CustomerId);
    } else {
      this.openCustomer(this.customer);
    }
  }

  ngAfterViewInit() {

  }


  close(data: any) {
    this.dialogRef.close.emit(data);
  }



}
