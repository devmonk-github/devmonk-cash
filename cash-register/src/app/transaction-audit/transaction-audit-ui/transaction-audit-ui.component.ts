import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/shared/service/api.service';

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
  aPaymentMethods: any = [];

  statisticsData$: any;
  businessDetails = {};
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
  constructor(private apiService: ApiService,) {
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
    }
  ]

  ngOnInit(): void {
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
    this.aPaymentMethods = [];
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
      if (result?.data) {
        if (result.data?.aStatistic?.length) this.aStatistic = result.data.aStatistic;
        if (result.data?.aPaymentMethods?.length) this.aPaymentMethods = result.data.aPaymentMethods;
      }
      this.bStatisticLoading = false;
    }, (error) => {
      console.log('error: ', error);
      this.bStatisticLoading = false;
    })
  }

  fetchStatistics(sDisplayMethod?: string) {
    if (!this.IsDynamicState) return this.fetchStatisticDocument();
    this.aStatistic = [];
    this.aPaymentMethods = [];
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
      if (result?.data) {
        if (result.data?.oTransactionAudit?.length) this.aStatistic = result.data.oTransactionAudit;
        if (result.data?.aPaymentMethods?.length) this.aPaymentMethods = result.data.aPaymentMethods;
      }
      this.bStatisticLoading = false;
    }, (error) => {
      this.aStatistic = [];
      this.aPaymentMethods = [];
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
