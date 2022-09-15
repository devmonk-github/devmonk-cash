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
    this.loadTransaction();
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
