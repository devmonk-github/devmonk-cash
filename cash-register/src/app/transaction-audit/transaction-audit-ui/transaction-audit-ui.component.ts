import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/shared/service/api.service';
import { PdfService } from 'src/app/shared/service/pdf2.service';
import * as _moment from 'moment';
const moment = (_moment as any).default ? (_moment as any).default : _moment;

@Component({
  selector: 'app-transaction-audit-ui',
  templateUrl: './transaction-audit-ui.component.html',
  styleUrls: ['./transaction-audit-ui.component.scss']
})
export class TransactionAuditUiComponent implements OnInit, OnDestroy {
  iBusinessId: any = '';
  iLocationId: any = '';
  aLocation: any = [];
  aStatistic: any = [];
  sDisplayMethod: string = 'revenuePerBusinessPartner';
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

  statisticsData$: any;
  businessDetails: any = {};
  statistics: any;
  optionMenu = 'cash-registry';
  filterDates = {
    endDate: new Date(new Date().setHours(23, 59, 59)),
    startDate: new Date(new Date().setHours(0, 0, 0))
  };

  creditAmount = 0;
  debitAmount = 0;
  paymentCreditAmount = 0;
  paymentDebitAmount = 0;
  bStatisticLoading: boolean = false;
  stastitics = { totalRevenue: 0, quantity: 0 };
  bookkeeping = { totalAmount: 0 };
  bookingRecords: any;
  paymentRecords: any;
  listBusinessSubscription !: Subscription;
  getStatisticSubscription !: Subscription;
  statisticAuditSubscription !: Subscription;
  greenRecordsSubscription !: Subscription;
  propertyListSubscription !: Subscription;
  workstationListSubscription !: Subscription;
  employeeListSubscription !: Subscription;
  constructor(private apiService: ApiService, private pdf: PdfService) {
    this.iBusinessId = localStorage.getItem('currentBusiness') || '';
    this.iLocationId = localStorage.getItem('currentLocation') || '';
    const _oUser = localStorage.getItem('currentUser');
    if (_oUser) this.oUser = JSON.parse(_oUser);
  }


  aDisplayMethod: any = [
    {
      sKey: 'revenuePerBusinessPartner',
      sValue: 'Supplier And Article-Group And Dynamic Property',
    },
    {
      sKey: 'revenuePerArticleGroupAndProperty',
      sValue: 'Article Group and Dynamic Property',
    },
    {
      sKey: 'revenuePerSupplierAndArticleGroup', // Use the revenuePerBusinessPartner and Remove the Dynamic Property
      sValue: 'Supplier And Article-Group',
    },
    {
      sKey: 'revenuePerProperty',
      sValue: 'Revenue Per Property',
    },
    {
      sKey: 'revenuePerArticleGroup', // Use the revenuePerArticleGroupAndProperty and remove the Dynamic Property
      sValue: 'Article Group',
    },
    {
      sKey: 'paymentMethods',
      sValue: 'Payment Method',
    },
  ]

  ngOnInit(): void {
    this.businessDetails._id = localStorage.getItem("currentBusiness");
    this.fetchBusinessDetails();
    this.printingDate();
    this.fetchBusinessLocation();
    this.getProperties();
    this.fetchStatisticDocument();
    this.getWorkstations();
    this.getEmployees();
  }

  fetchBusinessLocation() {
    if (!this.oUser?.userId) return;
    this.listBusinessSubscription = this.apiService.postNew('core', `/api/v1/business/${this.iBusinessId}/list-location`, { iBusinessId: this.iBusinessId }).subscribe((result: any) => {
      if (result?.data?.aLocation?.length) this.aLocation = result.data.aLocation;
    }, (error) => {
      console.log('error: ', error);
    })
  }

  printingDate() {
    this.fetchStatistics(this.sDisplayMethod);
  }

  /* STATIC  */
  fetchStatisticDocument(sDisplayMethod?: string) {
    this.aStatistic = [];
    this.bStatisticLoading = true;
    const oBody = {
      iBusinessId: this.iBusinessId,
      oFilter: {
        aLocationId: this?.aSelectedLocation?.length ? this.aSelectedLocation : [],
        iWorkstationId: this.selectedWorkStation?._id,
        sTransactionType: this.optionMenu,
        sDisplayMethod: sDisplayMethod || this.sDisplayMethod,
        dStartDate: this.filterDates.startDate,
        dEndDate: this.filterDates.endDate,
        aFilterProperty: this.aFilterProperty
      },
    }
    this.getStatisticSubscription = this.apiService.postNew('cashregistry', `/api/v1/statistics/get`, oBody).subscribe((result: any) => {
      this.aStatistic = result?.data;
      this.bStatisticLoading = false;
    }, (error) => {
      console.log('error: ', error);
      this.bStatisticLoading = false;
    })
  }

  fetchStatistics(sDisplayMethod?: string) {
    if (!this.IsDynamicState) return this.fetchStatisticDocument();
    this.aStatistic = [];
    const oBody = {
      iBusinessId: this.iBusinessId,
      oFilter: {
        aLocationId: this?.aSelectedLocation?.length ? this.aSelectedLocation : [],
        iWorkstationId: this.selectedWorkStation?._id,
        // iWorkstationId: this.selectedWorkStation?._id,
        iEmployeeId: this.selectedEmployee?._id,
        sTransactionType: this.optionMenu,
        sDisplayMethod: sDisplayMethod || this.sDisplayMethod,
        dStartDate: this.filterDates.startDate,
        dEndDate: this.filterDates.endDate,
        aFilterProperty: this.aFilterProperty
      }
    }
    this.bStatisticLoading = true;
    this.statisticAuditSubscription = this.apiService.postNew('cashregistry', `/api/v1/statistics/transaction/audit`, oBody).subscribe((result: any) => {
      this.aStatistic = result.data;
      this.bStatisticLoading = false;
    }, (error) => {
      this.aStatistic = [];
      this.bStatisticLoading = false;
    })
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
    }
    this.greenRecordsSubscription = this.apiService.postNew('bookkeeping', `/api/v1/bookkeeping/booking/records?iBusinessId=${this.iBusinessId}`, body).subscribe((result: any) => {
      this.bookingRecords = result.filter((o: any) => o.sBookName === tempBookName);
      this.paymentRecords = result.filter((o: any) => o.sBookName === 'payment-book');
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
    }, (error) => {
    });
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
        bRequiredForArticleGroup: true
      },
      iBusinessId: localStorage.getItem('currentBusiness'),
    };

    this.propertyListSubscription = this.apiService.postNew('core', '/api/v1/properties/list', data).subscribe(
      (result: any) => {
        if (result.data && result.data.length) {
          result.data.map((property: any) => {
            if (typeof (this.propertyOptions[property._id]) == 'undefined') {
              this.propertyOptions[property._id] = [];

              property.aOptions.map((option: any) => {
                if (option?.sCode?.trim() != '') {
                  const opt: any = {
                    iPropertyId: property._id,
                    sPropertyName: property.sName,
                    oProperty: {
                    },
                    sCode: option.sCode,
                    sName: option.sKey,
                    selected: false
                  };
                  opt.oProperty[option.sKey] = option.value;
                  this.propertyOptions[property._id].push(opt);
                  const propertyIndex = this.aProperty.findIndex((prop: any) => prop.iPropertyId == property._id);
                  if (propertyIndex === -1) {
                    this.aProperty.push(opt);
                  }
                }
              });
            }
          });
        }
      }
    );
  }

  onProperties(value?: any) {
    if (this.selectedProperties && this.selectedProperties[value]) {
      this.aFilterProperty = [];
      for (const oProperty of this.aProperty) {
        if (this.selectedProperties[oProperty?.iPropertyId]?.length) {
          const aOption = this.propertyOptions[oProperty?.iPropertyId].filter((opt: any) => {
            return this.selectedProperties[oProperty?.iPropertyId].includes(opt.sName);
          });
          for (const oOption of aOption) {
            this.aFilterProperty.push(oOption?.sName)
          }
        }
      }
    }
  }

  getWorkstations() {
    this.workstationListSubscription = this.apiService.getNew('cashregistry', '/api/v1/workstations/list/' + this.iBusinessId).subscribe(
      (result: any) => {
        if (result && result.data?.length) this.aWorkStation = result.data;
        console.log('getWorkstations called: ', this.aWorkStation);
      }),
      (error: any) => {
        console.error(error)
      }
  }
  getEmployees() {
    const oBody = { iBusinessId: this.iBusinessId }

    this.employeeListSubscription = this.apiService.postNew('auth', '/api/v1/employee/list', oBody).subscribe((result: any) => {
      if (result?.data?.length) {
        this.aEmployee = result.data[0].result;
      }
    }, (error) => {
    })
  }
  fetchBusinessDetails() {
    this.apiService.getNew('core', '/api/v1/business/' + this.businessDetails._id)
      .subscribe(
        (result: any) => {
          this.businessDetails = result.data;
        })
  }

  exportToPDF() {
    var header: Array<any> = [
      'SUPPLIER',
      'Quantity',
      'Price incl VAT',
      'Purchase price',
      'Gross profit',
      'Margin'
    ];

    const sName = this.businessDetails.sName;

    let date = Date.now();
    date = moment(date).format('DD-MM-yyyy');

    var headerList: Array<any> = [];
    header.forEach((singleHeader: any) => {
      headerList.push({ text: singleHeader, bold: true })
    })

    let bodyData: Array<any> = [];
    let subData: Array<any> = [];
    let arr: Array<any> = [];

    console.log('this.aStatistic', this.aStatistic);

    this.aStatistic[0].individual.forEach((el: any) => {
      var obj: any = {};
      obj['sBusinessPartnerName'] = el.sBusinessPartnerName;
      obj['nQuantity'] = el.nQuantity;
      obj['nTotalRevenue'] = el.nTotalRevenue;
      obj['nTotalPurchaseAmount'] = el.nTotalPurchaseAmount;
      obj['nProfit'] = el.nProfit;
      obj['nMargin'] = el.nMargin;
      obj['aArticleGroups'] = el.aArticleGroups.map((article: any) => {
        let data = {
          sName: article.sName,
          nQuantity: article.nQuantity,
          nTotalRevenue: article.nTotalRevenue,
          nTotalPurchaseAmount: article.nTotalPurchaseAmount,
          nProfit: article.nProfit,
          nMargin: article.nMargin
        };
        return data;
      }) || [];

      arr.push(obj);
    });

    arr.forEach((singleRecord: any) => {
      // console.log('singleRecord', singleRecord);
      bodyData.push([
        singleRecord.sBusinessPartnerName,
        singleRecord.nQuantity,
        singleRecord.nTotalRevenue,
        singleRecord.nTotalPurchaseAmount,
        singleRecord.nProfit,
        singleRecord.nMargin,
      ]);
      singleRecord.aArticleGroups.forEach((articleGroup: any) => {
        // console.log('articleGroup', articleGroup);
        bodyData.push(Object.values(articleGroup));
      });
      // bodyData.push({ 
      //   singleRecord.sBusinessPartnerName,
      //   singleRecord.nQuantity,
      //   singleRecord.sBusinessPartnerName,
      //   singleRecord.nTotalRevenue,
      //   singleRecord.sBusinessPartnerName,
      //   singleRecord.sBusinessPartnerName,
      // });
    })

    console.log('arr', arr);
    console.log('bodydata', bodyData);
    let columnWidths = [150, '*', '*', '*', '*', '*'];
    var content = [
      { text: date, style: 'dateStyle' },
      { text: 'Transaction Audit Report', style: 'header' },
      { text: sName, style: 'businessName' },
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 575, y2: 0, lineWidth: 1 }], margin: [0, 0, 20, 0], style: 'afterLine' },
      {
        style: 'tableExample',
        table: {
          headerRows: 1,
          widths: columnWidths,
          // widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: [headerList]
        },
        layout: {
          hLineStyle: function () {
            return { dash: { length: 0.001, space: 40 * 20 } };
          },
          vLineStyle: function () {
            return { dash: { length: 0.001, space: 40 * 20 } };
          },
        }
      },
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 575, y2: 0, lineWidth: 1 }], margin: [0, 0, 20, 0], style: 'afterLine' },
      {
        style: 'tableExample',
        table: {
          headerRows: 1,
          // widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
          widths: columnWidths,
          body: bodyData
        },
        layout: {
          hLineStyle: function () {
            return { dash: { length: 0.001, space: 40 * 20 } };
          },
          vLineStyle: function () {
            return { dash: { length: 0.001, space: 40 * 20 } };
          },
        }
      },
    ];

    var styles =
    {
      dateStyle: {
        alignment: 'right',
        fontSize: 9,
        margin: [0, 0, 0, 0]
      },
      tableExample: {
        border: 0,
        fontSize: 9,
      },
      tableExample2: {
        fontSize: 8,
      },
      supplierName: {
        alignment: 'right',
        fontSize: 12,
        margin: [0, -10, 0, 10]
      },
      header: {
        fontSize: 15,
        bold: false,
        margin: [0, 10, 20, 20]
      },
      businessName: {
        fontSize: 12
      },
      afterLine: {
        margin: [0, 0, 0, 10]
      },
      afterLastLine: {
        margin: [0, 20, 0, 20]
      },
    };
    this.pdf.getPdfData(styles, content, 'portrait', 'A4', sName + '-' + 'Audit')
    // console.log('after getPdfData');


  }

  ngOnDestroy(): void {
    this.listBusinessSubscription.unsubscribe();
    this.getStatisticSubscription.unsubscribe();
    this.statisticAuditSubscription.unsubscribe();
    this.greenRecordsSubscription.unsubscribe();
    this.propertyListSubscription.unsubscribe();
    this.workstationListSubscription.unsubscribe();
    this.employeeListSubscription.unsubscribe();
  }
}
