import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { DialogComponent } from '../../service/dialog';
import { ViewContainerRef } from '@angular/core';
import { ApiService } from 'src/app/shared/service/api.service';
import { faTimes } from "@fortawesome/free-solid-svg-icons";
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
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.sass']
})
export class CustomerDetailsComponent implements OnInit, AfterViewInit {

  dialogRef: DialogComponent;
  salutations: Array<any> = ['Mr', 'Mrs', 'Mr/Mrs', 'Family', 'Firm']
  gender: Array<any> = ['Male', 'Female', "Other"]
  documentTypes: Array<any> = ['Driving license', 'Passport', 'Identity card', 'Alien document'];
  mode: string = '';
  editProfile: boolean = false;
  showStatistics: boolean = false;
  faTimes = faTimes;

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
    note: '',
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
      sAddition: '',
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
      sAddition: '',
      sStreet: '',
      sCity: ''
    },
    sCompanyName: '',
    sVatNumber: '',
    sCocNumber: '',
    nPaymentTermDays: ''
  }

  requestParams: any = {
    iBusinessId: "",
    aProjection: ['sSalutation', 'sFirstName', 'sPrefix', 'sLastName', 'dDateOfBirth', 'dDateOfBirth', 'nClientId', 'sGender', 'bIsEmailVerified',
      'bCounter', 'sEmail', 'oPhone', 'oShippingAddress', 'oInvoiceAddress', 'iBusinessId', 'sComment', 'bNewsletter', 'sCompanyName', 'oPoints',
      'sCompanyName', 'oIdentity', 'sVatNumber', 'sCocNumber', 'nPaymentTermDays', 'nDiscount', 'bWhatsApp', 'nMatchingCode'],
  };
  paginationConfig: any = {
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
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
  aStatisticsChartDataLoading = true
  aActivityTitles: any = [
    { type: "Repairs", value: 0, color: ChartColors.REPAIR },//$primary-color
    { type: "Special orders", value: 0, color: ChartColors.SPECIAL_ORDERS },//$dark-primary-light-color
    { type: "Shop purchase", value: 0, color: ChartColors.SHOP_PURCHASE },//$dark-success-light-color
    { type: "Quotation", value: 0, color: ChartColors.QUOTATION },//$info-active-color
    { type: "Webshop", value: 0, color: ChartColors.WEBSHOP },//$gray-700
    // { type: "Refund", value: 0, color: ChartColors.REFUND },//$orange
    { type: "Giftcard", value: 0, color: ChartColors.GIFTCARD },//$green
    { type: "Gold purchase", value: 0, color: ChartColors.GOLD_PURCHASE },//$maroon
    { type: "Product reservation", value: 0, color: ChartColors.PRODUCT_RESERVATION }//$pink
  ];

  aStatisticsChartData: any = [];

  aPaymentMethodTitles: any = [
    { type: "Card", value: 7 },
    { type: "Cash", value: 10 },
    { type: "Paylater", value: 12 },
    { type: "Bankpayment", value: 42 },
    { type: "Expected Payment", value: 22 },
  ];
  totalActivities: number = 0;
  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService,
  ) {
    const _injector = this.viewContainerRef.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit(): void {
    this.requestParams.iBusinessId = localStorage.getItem('currentBusiness');
    this.requestParams.iLocationid = localStorage.getItem('currentLocation');
    this.requestParams.oFilterBy = {
      _id: this.customer._id
    }
    this.getCoreStatistics()

    this.activitiesChartOptions = {
      series: this.aActivityTitles.map((el: any) => el.value),
      colors: this.aActivityTitles.map((el: any) => el.color),
      chart: {
        width: '75%',
        type: "pie"
      },
      title: {
        text: "Number of Activities",
        style: {
          fontWeight: 'bold',
        },
      },
      legend: {
        position: 'left',
        itemMargin: {
          horizontal: 15,
          vertical: 5
        },
        fontWeight: 600,
      },
      labels: this.aActivityTitles.map((el: any) => el.type + " (" + el.value + ") "),
    };

    this.loadStatisticsTabData();
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  customerCountryChanged(type: string, event: any) {
    this.customer[type].countryCode = event.key;
    this.customer[type].country = event.value;
  }

  EditOrCreateCustomer() {
    this.customer.iBusinessId = this.requestParams.iBusinessId;
    if (this.mode == 'create') {
      this.apiService.postNew('customer', '/api/v1/customer/create', this.customer).subscribe(
        (result: any) => {
          this.close({ action: true, customer: this.customer });
        },
        (error: any) => {
          console.error(error)
        }
      );
    }
    if (this.mode == 'details') {
      this.apiService.putNew('customer', '/api/v1/customer/update/' + this.requestParams.iBusinessId + '/' + this.customer._id, this.customer).subscribe(
        (result: any) => {
          if (result?.message === 'success') {
            this.toastService.show({ type: 'success', text: `Successfully updated!` });
            this.fetchUpdatedDetails();
          }
          // this.close({ action: true });
        },
        (error: any) => {
          console.error(error)
        }
      );
    }
  }

  fetchUpdatedDetails() {
    this.apiService.postNew('customer', `/api/v1/customer/list`, this.requestParams)
      .subscribe((result: any) => {
        this.customer = result.data[0].result[0];

        this.bTransactionsLoader = false;
        this.bActivitiesLoader = false;
        this.bActivityItemsLoader = false;

        this.cdr.detectChanges();

        this.editProfile = false;
      },
        (error: any) => {
          console.error(error)
        }
      )
  }

  close(data: any) {
    this.dialogRef.close.emit(data);
  }

  getCoreStatistics() {
    const body = {
      iBusinessId: localStorage.getItem('currentBusiness'),
      oFilter: {
        iCustomerId: this.customer._id,
        sTransactionType: 'cash-registry',
        sDisplayMethod: 'revenuePerBusinessPartner',
        dStartDate: new Date(new Date().setHours(0, 0, 0)),
        dEndDate: new Date(new Date().setHours(23, 59, 59)),
        // dStartDate: "2022-09-10T13:59",
        // dEndDate: "2022-10-24T21:59:59.639Z",
      },
    };
    this.apiService
      .postNew('cashregistry', '/api/v1/statistics/transaction/audit', body)
      .subscribe(
        (result: any) => {
          if (result?.data?.oTransactionAudit?.[0]?.individual?.[0]?.aArticleGroups)
            this.setAStatisticsChartData(result?.data?.oTransactionAudit?.[0]?.individual?.[0]?.aArticleGroups)
          this.aStatisticsChartDataLoading = false;
        },
        (error: any) => {
          console.log(error);
          this.aStatisticsChartDataLoading = false;
        }
      );
  }
  setAStatisticsChartData(data: any[]) {
    const aStatisticsChartData: any[] = []
    data.map((item, index) => {
      console.log('item: ', item);
      let color: any = Object.entries(ChartColors)
      color = color[Math.floor(Math.random() * color.length)][1]
      let chartItem = {
        item: {
          element: {
            name: item.sName,
            data: [
              {
                x: item.sName,
                y: item.nTotalRevenue,
                info: [
                  { type: item.sName, value: item.nTotalRevenue }
                ]
              }
            ]
          },
          color: color
        }
      }
      aStatisticsChartData.push(chartItem)
    })
    this.aStatisticsChartData = aStatisticsChartData
    this.loadStatisticsTabData()
  }


  //  Function for set sort option on transaction table
  setSortOption(sortHeader: any) {
    if (sortHeader.selected) {
      sortHeader.sort = sortHeader.sort == 'asc' ? 'desc' : 'asc';
      this.sortAndLoadTransactions(sortHeader)
    } else {
      this.aTransctionTableHeaders = this.aTransctionTableHeaders.map((th: any) => {
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
    this.loadTransactions();
  }

  getTypes(arr: any) {
    let str = '';
    if (arr && arr.length) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i]?.oArticleGroupMetaData?.sCategory) {
          if (!str) { str += (arr[i]?.oArticleGroupMetaData?.sCategory) }
          else { str += (', ' + arr[i]?.oArticleGroupMetaData?.sCategory) }
        }
      }
    }
    return str;
  }

  loadTransactions() {
    this.bTransactionsLoader = true;
    const body = {
      iCustomerId: this.customer._id,
      iBusinessId: this.requestParams.iBusinessId
    }
    this.apiService.postNew('cashregistry', '/api/v1/transaction/cashRegister', body).subscribe((result: any) => {
      if (result?.data?.result) {
        this.aTransactions = result.data.result || [];
        this.aTransactions.forEach(transaction => {
          transaction.sTotal = 0;
          transaction.aTransactionItems.forEach((item: any) => {
            transaction.sTotal += parseFloat(item.nPaymentAmount); 
            const count = this.totalActivities;
            if (item?.oType?.eKind) this.totalActivities = count + item.nQuantity || 0;
            // if(item?.oType.bRefund){
            //   this.aActivityTitles[5].value += 1;
            // }else{
              switch (item?.oType?.eKind) {
                case "regular":
                  this.aActivityTitles[2].value += 1;
                  break;
                case "expenses":
                  break;
                case "reservation":
                  this.aActivityTitles[7].value += 1;
                  break;
                case "giftcard":
                  this.aActivityTitles[5].value += 1;
                  break;
                case "empty-line":
                  break;
                case "repair":
                  this.aActivityTitles[0].value += 1;
                  break;
                case "order":
                  break;
                case "gold-purchase":
                  this.aActivityTitles[6].value += 1;
                  break;
                case "gold-sell":
                  break;
                case "loyalty-points-discount":
                  break;
                case "loyalty-points":
                  break;
                case "discount":
                  break;
                case "payment-discount":
                  break;
              }
            // }
          })
        });
        // this.paginationConfig.totalItems = result.data.totalCount;
        this.activitiesChartOptions = {
          series: this.aActivityTitles.map((el: any) => el.value),
          colors: this.aActivityTitles.map((el: any) => el.color),
          chart: {
            width: '75%',
            type: "pie"
          },
          title: {
            text: `Number of Activities (${this.totalActivities})`,
            style: {
              fontWeight: 'bold',
            },
          },
          legend: {
            position: 'left',
            itemMargin: {
              horizontal: 15,
              vertical: 5
            },
            fontWeight: 600,
          },
          labels: this.aActivityTitles.map((el: any) => el.type + " (" + el.value + ") "),
        };
      }
      this.bTransactionsLoader = false;
    }, (error) => {
      this.bTransactionsLoader = false;
    })
  }

  loadActivities() {
    this.aActivities = [];
    this.bActivitiesLoader = true;
    this.apiService.postNew('cashregistry', '/api/v1/activities', this.requestParams).subscribe((result: any) => {
      this.aActivities = result.data || [];
      // this.paginationConfig.totalItems = result.count;

      this.bActivitiesLoader = false;
    }, (error) => {
      this.bActivitiesLoader = false;
    })

  }
  loadActivityItems() {
    this.bActivityItemsLoader = true;
    this.apiService.postNew('cashregistry', '/api/v1/activities/items', this.requestParams).subscribe(
      (result: any) => {
        this.aActivityItems = result.data || [];
        // this.paginationConfig.totalItems = result.count;
        this.bActivityItemsLoader = false;
      },
      (error: any) => {
        this.bActivityItemsLoader = false;
      })
  }

  activeTabsChanged(tab: any) {
    switch (tab) {
      case this.tabTitles[0]:
        if (!this.aTransactions) this.loadTransactions();
        break;
      case this.tabTitles[1]:
        if (!this.aActivities) this.loadActivities();
        break;
      case this.tabTitles[2]:
        if (!this.aActivityItems) this.loadActivityItems();
        break;
      case this.tabTitles[3]:
        this.loadStatisticsTabData();
        break;
    }
  }

  loadStatisticsTabData() {

    this.statisticsChartOptions = {
      series: this.aStatisticsChartData.map((el: any) => el.item.element),
      colors: this.aStatisticsChartData.map((el: any) => el.item.color),
      tooltip: {
        custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
          let data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];

          let html = `<div>
                        <div style="background:#E4E6EF;padding:10px">${data.x}</div>
                        <ul style='list-style-type:circle;padding:5px 15px;margin:5px;line-height:1.5'>`;
          data.info.forEach((el: any) => {
            html += `<li>
                        <span>${el.type}:<span>
                        <span style="margin:10px 5px;font-weight:bold"> € ${el.value}</span>
                    </li>`;
          });
          html += `</ul><div>`;

          return html;
        }
      },
      chart: {
        type: "bar",
        height: 350,

      },
      dataLabels: {
        enabled: true,
        style: {
          'fontSize': '15px'
        }
      },
      yaxis: {
        title: {
          text: "Revenue",
          style: {
            'fontSize': '15px'
          }
        },
        labels: {
          formatter: function (y: any) {
            return "\u20AC" + y.toFixed(0)
          }
          ,
          style: {
            'fontSize': '15px'
          }
        },
      },
      xaxis: {
        type: 'category',
        // categories: [
        //   "Till toady",
        // ],
        // labels: {
        //   rotate: -90
        // }
      }
    };

    this.paymentMethodsChartOptions = {
      series: this.aPaymentMethodTitles.map((el: any) => el.value),
      chart: {
        width: '100%',
        type: "pie"
      },
      title: {
        text: "Payment Methods",
        style: {
          fontWeight: 'bold',
        },
      },
      legend: {
        position: 'left',
        itemMargin: {
          horizontal: 15,
          vertical: 5
        },
        fontWeight: 600,
      },
      labels: this.aPaymentMethodTitles.map((el: any) => el.type),
      options: {
        dataLabels: {
          formatter: function (val: any) {
            return "\u20AC" + Number(val).toFixed(2);
          },
        }
      }
    };
  }

}
