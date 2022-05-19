import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { faLongArrowAltDown, faLongArrowAltUp, faMinusCircle, faPlus, faPlusCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../shared/service/api.service';
import { DialogService } from '../shared/service/dialog';
import { MenuComponent } from '../shared/_layout/components/common';
// import {FreshChatService} from "../../shared/service/fresh-chat.service";
// import {Employee} from "../../shared/models/employee.model";
import { filter, map } from "rxjs/operators";

import { TransactionDetailsComponent } from './components/transaction-details/transaction-details.component';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.sass']
})
export class TransactionsComponent implements OnInit {
  option: boolean = true;
  faSearch= faSearch;
  faIncrease = faPlusCircle;
  faDecrease = faMinusCircle;
  faArrowUp = faLongArrowAltUp;
  faArrowDown = faLongArrowAltDown;
  cities = [
    {name: 'Amsterdam', code: 'AMS'},
    {name: 'Bruxelles', code: 'BRU'},
    {name: 'Paris', code: 'PAR'},
    {name: 'Instanbul', code: 'INS'}
  ];
  selectedCity: string = '';
  transactions: Array<any> = [];
  businessDetails: any = {};
  userType: any = {};
  requestParams: any = {
    searchValue: '',
    sortBy: { key: 'Date', selected: true, sort: 'desc' },
    sortOrder: 'desc'
  };
  showLoader: Boolean = false;
  widgetLog: string[] = [];
  pageCounts: Array<number> = [ 10, 25, 50, 100]
  pageNumber: number = 1;
  setPaginateSize: number = 12;
  paginationConfig: any = {
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  };
  showAdvanceSearch = false;
  transactionMenu = [
    {key : 'REST_PAYMENT'},
    {key : 'REFUND/REVERT'},
    {key : 'PREPAYMENT'},
    {key : 'MARK_CONFIRMED'},
  ];
  iBusinessId: any = '';

  // Advance search fields 

  filterDates: any = {
    endDate: new Date(new Date().setHours(23, 59, 59)),
    startDate: new Date('01-01-2015'),
  }
  paymentMethods: Array<any> = [ 'All', 'Cash', 'Credit', 'Card', 'Gift-Card'];
  transactionTypes: Array<any> = [ 'All', 'Refund', 'Repair', 'Gold-purchase', 'Gold-sale'];
  transactionStatuses: Array<any> = [ 'ALL', 'EXPECTED_PAYMENTS', 'NEW', 'CANCELLED', 'FAILED', 'EXPIRED', 'COMPLETED', 'REFUNDED' ];
  invoiceStatus: string = 'all';
  importStatus: string = 'all';
  methodValue: string = 'All';
  transactionValue: string = 'All';
  employee: any = { sFirstName: 'All' };
  employees: Array<any> =  [this.employee];
  workstations: Array<any> = [];
  selectedWorkstations: Array<any> = [];
  selectedTransactionStatuses: Array<any> = [];
  locations: Array<any> = [];
  selectedLocations: Array<any> = [];
  title: String = 'WEBORDERS'; // Need to change it. WIP.

  tableHeaders: Array<any> = [
    { key: 'Date', selected: true, sort: 'desc'},
    { key: 'Transaction no.', selected: false, sort: ''},
    { key: 'Receipt number', selected: false, sort: ''},
    { key: 'Customer', selected: false, sort: ''},
    { key: 'Method', disabled:true},
    { key: 'Total', disabled:true},
    { key: 'Type', disabled:true}
  ]


  constructor(
    private apiService: ApiService,
    private dialogService: DialogService,
    private router: Router
    // private chatService: FreshChatService
    ) { }

  ngOnInit(): void {
    this.router.events
    .pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => {
        let route: ActivatedRoute = this.router.routerState.root;
        let routeTitle = '';
        while (route!.firstChild) {
          route = route.firstChild;
        }
        if (route.snapshot.data.title) {
          routeTitle = route!.snapshot.data.title;
        }
        return routeTitle;
      })
    )
    .subscribe((title: string) => {
      if (title) {
        this.title = title;
        // title = this.translateService.instant(title);
        // this.titleService.setTitle(`PrismaNote |  ${title}`);
      } else {
        // this.titleService.setTitle(`PrismaNote`);
      }
    });

    this.businessDetails._id = localStorage.getItem("currentBusiness");
    this.userType = localStorage.getItem("type");
    this.loadTransaction();
    this.iBusinessId = localStorage.getItem('currentBusiness');
    this.listEmployee();
    this.getWorkstations();
    this.getLocations();
    // this.chatService.widgetClosed.subscribe( () => {
    //   this.widgetLog.push('closed');
    // });
    // this.chatService.widgetOpened.subscribe( () => {
    //   this.widgetLog.push('openend');
    // });
  }

  toolTipData(item: any){
    var itemList = [] 
    var returnArr = [];
    if(item.oCustomer && (item.oCustomer.sFirstName || item.oCustomer.sLastName)) {
      returnArr.push(item.oCustomer.sFirstName + ' ' + item.oCustomer.sLastName)
    }

    if(item.aTransactionItems && item.aTransactionItems.length > 0) {
      for (var i = 0; i < item.aTransactionItems.length; i++) {
        itemList.push(item.aTransactionItems[i].sProductName)
        returnArr.push('- '+item.aTransactionItems[i].sProductName +' | €'+ (item.aTransactionItems[i].nPriceIncVat || 0))
      }
    }
    // return returnArr;
    return returnArr.join("<br>")
  }

  goToCashRegister(){
    this.router.navigate(['/business/till']);
  }

  loadTransaction(){
    this.transactions = [];
    this.requestParams.iBusinessId = this.businessDetails._id;
    this.requestParams.type = 'transaction';
    this.requestParams.filterDates = this.filterDates;
    this.requestParams.transactionStatus = this.transactionStatuses;
    this.requestParams.invoiceStatus = this.invoiceStatus;
    this.requestParams.importStatus = this.importStatus;
    this.requestParams.methodValue = this.methodValue;
    this.requestParams.transactionValue = this.transactionValue;
    this.requestParams.iEmployeeId = this.employee && this.employee._id ? this.employee._id : '';
    this.requestParams.iDeviceId = undefined // we need to work on this once devides are available.
    this.requestParams.workstations = this.selectedWorkstations;
    this.requestParams.locations = this.selectedLocations;
    this.showLoader = true;
    if(this.title == "WEBORDERS"){
      this.requestParams.eTransactionType = 'webshop-revenue';
    } else {
      this.requestParams.eTransactionType = 'cash-register-revenue';
    }
    this.apiService.postNew('cashregistry', '/api/v1/transaction/cashRegister', this.requestParams).subscribe((result: any) => {
      if (result && result.data && result.data && result.data.result && result.data.result.length) {
        this.transactions = result.data.result;
        this.paginationConfig.totalItems = result.data.totalCount;
        setTimeout(()=>{
          MenuComponent.bootstrap();
        }, 1000);
      }
      this.showLoader = false;
    }, (error) => {
      this.showLoader = false;
    })
  }

  getLocations(){
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
  
  getWorkstations(){
    this.apiService.getNew('cashregistry', '/api/v1/workstations/list/' + this.businessDetails._id).subscribe(
      (result : any) => {
       if(result && result.data){
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
  clickMenuOpt(key: string, transactionId: string){

  }

  //  Function for set sort option on transaction table
  setSortOption(sortHeader : any){
    if(sortHeader.selected){
      sortHeader.sort = sortHeader.sort == 'asc' ? 'desc' : 'asc';
      this.sortAndLoadTransactions(sortHeader)
    } else {
      this.tableHeaders = this.tableHeaders.map( (th : any) =>{
        if(sortHeader.key == th.key){
          th.selected = true;
          th.sort = 'asc';
        }else{
          th.selected = false;
        }
        return th;
      })
      this.sortAndLoadTransactions(sortHeader)
    }
  }

  sortAndLoadTransactions(sortHeader: any){
    let sortBy = 'dCreatedDate';
    if(sortHeader.key == 'Date')  sortBy = 'dCreatedDate';
    if(sortHeader.key == 'Transaction no.')  sortBy = 'sNumber';
    if(sortHeader.key == 'Receipt number')  sortBy = 'oReceipt.sNumber';
    if(sortHeader.key == 'Customer')  sortBy = 'oCustomer.sFirstName';
    this.requestParams.sortBy = sortBy;
    this.requestParams.sortOrder = sortHeader.sort;
    this.loadTransaction();
  }

  // Function for update item's per page
  changeItemsPerPage(pageCount: any){
    this.paginationConfig.itemsPerPage = pageCount;
  }

  // Function for trigger event after page changes
  pageChanged(page:any){
    this.requestParams.skip = (page -1) * parseInt(this.paginationConfig.itemsPerPage);
    this.loadTransaction();
    this.paginationConfig.currentPage = page;
  }

  // Function for show transaction details
  showTransaction(transaction: any){
    this.dialogService.openModal(TransactionDetailsComponent, { cssClass:"modal-xl", context: { transaction : transaction, eType: this.title }}).instance.close.subscribe(
      partner =>{ });
  }
}
