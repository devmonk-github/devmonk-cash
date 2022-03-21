import { Component, OnInit } from '@angular/core';
import { faLongArrowAltDown, faLongArrowAltUp, faMinusCircle, faPlus, faPlusCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../shared/service/api.service';
import { DialogService } from '../shared/service/dialog';
import { MenuComponent } from '../shared/_layout/components/common';
// import {FreshChatService} from "../../shared/service/fresh-chat.service";
// import {Employee} from "../../shared/models/employee.model";

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
  requestParams: any = {};
  widgetLog: string[] = [];
  pageCounts: Array<number> = [ 10, 25, 50, 100]
  pageCount: number = 10;
  pageNumber: number = 1;
  setPaginateSize: number = 1;
  paginationConfig: any = {
    itemsPerPage: '10', 
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

  tableHeaders: Array<any> = [
    { key: 'Date', selected: false, sort: ''},
    { key: 'Transaction no.', selected: false, sort: ''},
    { key: 'Receipt number', selected: false, sort: ''},
    { key: 'Customer', disabled:true},
    { key: 'Method', disabled:true},
    { key: 'Total', disabled:true},
    { key: 'Type', disabled:true}
  ]


  constructor(
    private apiService: ApiService,
    private dialogService: DialogService
    // private chatService: FreshChatService
    ) { }

  ngOnInit(): void {
    this.businessDetails._id = localStorage.getItem("currentBusiness");
    this.userType = localStorage.getItem("type");
    this.loadTransaction();
    // this.chatService.widgetClosed.subscribe( () => {
    //   this.widgetLog.push('closed');
    // });
    // this.chatService.widgetOpened.subscribe( () => {
    //   this.widgetLog.push('openend');
    // });
  }

  loadTransaction(){
    this.transactions = [];
    this.requestParams.iBusinessId = this.businessDetails._id
    this.apiService.postNew('cashregistry', '/api/v1/transaction/list', this.requestParams).subscribe((result: any) => {
      if (result && result.data && result.data.length && result.data[0] && result.data[0].result && result.data[0].result.length) {
        this.transactions = result.data[0].result;
        setTimeout(()=>{
          MenuComponent.bootstrap();
        }, 1000);
      }
    }, (error) => {})
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
    }
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
  showTransaction(transactionId : string){
    this.dialogService.openModal(TransactionDetailsComponent, { context: { transactionId : transactionId }, cssClass: 'w-fullscreen'}).instance.close.subscribe(
      partner =>{ });
  }
}
