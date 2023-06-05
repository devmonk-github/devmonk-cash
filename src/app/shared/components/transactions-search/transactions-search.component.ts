import { Component, Input, OnInit, ViewContainerRef, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { DialogComponent } from "../../service/dialog";
import { faTimes, faSearch } from "@fortawesome/free-solid-svg-icons";
import { DialogService } from '../../service/dialog';
import { ApiService } from '../../service/api.service';
import { TransactionItemsDetailsComponent } from '../transaction-items-details/transaction-items-details.component';
import { TillService } from '../../service/till.service';
import { ToastService } from '../toast';

@Component({
  selector: 'app-transactions-search',
  templateUrl: './transactions-search.component.html',
  styleUrls: ['./transactions-search.component.scss']
})
export class TransactionsSearchComponent implements OnInit, AfterViewInit {
  @Input() customer: any;
  dialogRef: DialogComponent

  faTimes = faTimes
  faSearch = faSearch
  loading = false
  showLoader = false;
  totalTransactions = 0;
  totalActivities = 0;
  business: any = {}
  transactions: Array<any> = [];
  activities: Array<any> = [];
  selectedWorkstations: Array<any> = [];
  selectedLocations: Array<any> = [];
  requestParams: any = {
    searchValue: '',
    limit: 5,
    skip: 0,
  }
  setPaginateSize: number = 10;
  paginationConfig: any = {
    itemsPerPage: '10',
    currentPage: 1,
    totalItems: 0
  };
  pageCounts: Array<number> = [10, 25, 50, 100]
  pageCount:any = 10;
  page = 1;

  @ViewChildren('inputElement') inputElement!: QueryList<ElementRef>;

  constructor(
    private viewContainer: ViewContainerRef,
    private dialogService: DialogService,
    private apiService: ApiService,
    private toastService: ToastService,
    private tillService: TillService) {
    const _injector = this.viewContainer.injector
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngAfterViewInit(): void {
    this.inputElement.first.nativeElement.focus();
  }

  ngOnInit(): void {
    this.apiService.setToastService(this.toastService);
    this.business._id = localStorage.getItem("currentBusiness");
    this.requestParams.iBusinessId = this.business._id;
    this.findTransactions()
  }


  changeItemsPerPage(pageCount: any) {
    this.paginationConfig.itemsPerPage = pageCount;
    this.findTransactions();
  }

  // Function for trigger event after page changes
  pageChanged(page: any) {
    this.requestParams.skip = (page - 1) * parseInt(this.paginationConfig.itemsPerPage);
    this.findTransactions();
    this.paginationConfig.currentPage = page;
  }


  findTransactions() {
    // console.log('transaction search - findTransactions');
    this.transactions = [];
    this.totalTransactions = 0;
    this.activities = [];
    this.totalActivities = 0;
    this.requestParams.type = 'transaction';
    this.requestParams.limit = this.paginationConfig.itemsPerPage || 50;
    this.requestParams.iWorkstationId = undefined // we need to work on this once devides are available.
    this.requestParams.workstations = this.selectedWorkstations;
    this.requestParams.locations = this.selectedLocations;
    this.showLoader = true;
    this.apiService.postNew('cashregistry', '/api/v1/transaction/search', this.requestParams).subscribe((result: any) => {
      // console.log('transaction search - findTransactions search result', result);
      this.transactions = result.transactions.records;
      this.totalTransactions = result.transactions.count;
      this.paginationConfig.totalItems = result.activities.count;
      this.activities = result.activities.records;
      this.activities.forEach((item: any) =>{
        item.sBagNumbers = (item?.aActivityItemMetaData?.length) ? [... new Set(item.aActivityItemMetaData.map((el:any) => el?.sBagNumber))].join(',') : '';
        //console.log("item.sBagNumbers", item.sBagNumbers,item.sBagNumbers.length);
      });
      this.totalActivities = result.activities.count;
      this.showLoader = false;
    }, (error) => {
      this.showLoader = false;
    })
  }

  counter(i: number) {
    i = Math.round(i / this.requestParams.limit);
    return new Array(i);
  }

  openTransaction(transaction: any, itemType: any) {
    // console.log('transaction search openTransaction: ', transaction, itemType);
    this.dialogService.openModal(TransactionItemsDetailsComponent, 
    { 
      cssClass: "modal-xl", 
      context: { transaction, itemType },
      hasBackdrop: true,
      closeOnBackdropClick: false,
      closeOnEsc: false 
    }).instance.close.subscribe(result => {
      // console.log('transaction search response of transaction item details component: ', JSON.parse(JSON.stringify(result)));
      if(result?.transaction) {
        // console.log('now sending to tillservice processTransactionSearchResult: ', result);
        const temp = this.tillService.processTransactionSearchResult(result);
        // console.log('response of tillservice processTransactionSearchResult closing search dialog', JSON.parse(JSON.stringify(temp)))
        this.close(temp);
      }
    });
  }

  close(data: any): void {
    this.dialogRef.close.emit(data)
  }

  randNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  setCustomer(customer: any): void {
    this.loading = true
    this.customer = customer;
    this.dialogRef.close.emit({ action: false, customer: this.customer })
  }
}
