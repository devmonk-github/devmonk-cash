import { Component, OnInit } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
// import {FreshChatService} from "../../shared/service/fresh-chat.service";
// import {Employee} from "../../shared/models/employee.model";

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.sass']
})
export class TransactionsComponent implements OnInit {
  option: boolean = true;
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
  setPaginateSize: number = 1;
  widgetLog: string[] = [];
  paginationConfig: any = {
    itemsPerPage: '1', 
    currentPage: 1, 
    totalItems: 0
  };

  constructor(
    private apiService: ApiService
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
      }
    }, (error) => {})
  }

  openChat(): void {
    // this.chatService.openWidget();
  }

  closeChat(): void {
    // this.chatService.closeWidget();
  }

  pageChanged(page:any){
    this.requestParams.skip = (page -1) * this.requestParams.limit;
    this.loadTransaction();
    this.paginationConfig.currentPage = page;
  }
}
