import { Component, Input, OnInit, ViewContainerRef, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { DialogComponent } from "../../service/dialog";
import { faTimes, faSearch } from "@fortawesome/free-solid-svg-icons";
import { DialogService } from '../../service/dialog';
import { ApiService } from '../../service/api.service';
import { TranslateService } from '@ngx-translate/core';
import { TransactionItemsDetailsComponent } from '../transaction-items-details/transaction-items-details.component';

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

  page = 1;

  @ViewChildren('inputElement') inputElement!: QueryList<ElementRef>;

  constructor(
    private viewContainer: ViewContainerRef,
    private dialogService: DialogService,
    private apiService: ApiService,
    private translateService: TranslateService) {
    const _injector = this.viewContainer.injector
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngAfterViewInit(): void {
    this.inputElement.first.nativeElement.focus();
  }

  ngOnInit(): void {
    this.business._id = localStorage.getItem("currentBusiness");
    this.requestParams.iBusinessId = this.business._id;
  }

  findTransactions() {
    this.transactions = [];
    this.totalTransactions = 0;
    this.activities = [];
    this.totalActivities = 0;
    this.requestParams.type = 'transaction';
    // this.requestParams.searchValue = '202',
    // this.requestParams.filterDates = this.filterDates;
    // this.requestParams.transactionStatus = this.transactionStatuses;
    // this.requestParams.invoiceStatus = this.invoiceStatus;
    // this.requestParams.importStatus = this.importStatus;
    // this.requestParams.methodValue = this.methodValue;
    // this.requestParams.transactionValue = this.transactionValue;
    // this.requestParams.iEmployeeId = this.employee && this.employee._id ? this.employee._id : '';
    this.requestParams.iDeviceId = undefined // we need to work on this once devides are available.
    this.requestParams.workstations = this.selectedWorkstations;
    this.requestParams.locations = this.selectedLocations;
    this.showLoader = true;
    this.apiService.postNew('cashregistry', '/api/v1/transaction/search', this.requestParams).subscribe((result: any) => {
      this.transactions = result.transactions.records;
      this.totalTransactions = result.transactions.count;
      this.activities = result.activities.records;
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
    this.dialogService.openModal(TransactionItemsDetailsComponent, { cssClass: "modal-xl", context: { transaction, itemType } })
      .instance.close.subscribe(result => {
        const transactionItems: any = [];
        if (result.transaction) {
          result.transactionItems.forEach((transactionItem: any) => {
            if (transactionItem.isSelected) {
              const { tType } = transactionItem;
              let paymentAmount = transactionItem.nQuantity * transactionItem.nPriceIncVat - transactionItem.nPaidAmount;
              if (tType === 'refund') {
                // paymentAmount = -1 * transactionItem.nPaidAmount;
                paymentAmount = 0;
                transactionItem.oType.bRefund = true;
              } else if (tType === 'revert') {
                paymentAmount = transactionItem.nPaidAmount;
                transactionItem.oType.bRefund = false;
              };
              transactionItems.push({
                name: transactionItem.sProductName,
                iActivityItemId: transactionItem.iActivityItemId,
                nRefundAmount: transactionItem.nPaidAmount,
                iLastTransactionItemId: transactionItem.iTransactionItemId,
                prePaidAmount: tType === 'refund' ? transactionItem.nPaidAmount : transactionItem.nPaymentAmount,
                type: transactionItem.sGiftCardNumber ? 'giftcard' : transactionItem.oType.eKind,
                eTransactionItemType: 'regular',
                nBrokenProduct: 0,
                tType,
                oType: transactionItem.oType,
                aImage: transactionItem.aImage,
                nonEditable: transactionItem.sGiftCardNumber ? true : false,
                sGiftCardNumber: transactionItem.sGiftCardNumber,
                quantity: transactionItem.nQuantity,
                price: transactionItem.nPriceIncVat,
                iRepairerId: transactionItem.iRepairerId,
                oArticleGroupMetaData: transactionItem.oArticleGroupMetaData,
                iEmployeeId: transactionItem.iEmployeeId,
                iBrandId: transactionItem.iBrandId,
                discount: 0,
                tax: transactionItem.nVatRate,
                paymentAmount,
                description: '',
                open: true,
              });
            }
          });
          result.transactionItems = transactionItems;
          this.close(result);
        }
      });
  }

  close(data: any): void {
    console.log(data);
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
