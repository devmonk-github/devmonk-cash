import { Component, OnInit } from '@angular/core';
import { DialogComponent } from '../../service/dialog';
import { ViewContainerRef } from '@angular/core';
import { ApiService } from 'src/app/shared/service/api.service';
import { faTimes } from "@fortawesome/free-solid-svg-icons";
@Component({
  selector: 'app-transaction-items-details',
  templateUrl: './transaction-items-details.component.html',
  styleUrls: ['./transaction-items-details.component.scss']
})
export class TransactionItemsDetailsComponent implements OnInit {

  $element = HTMLInputElement
  dialogRef: DialogComponent;
  transaction: any;
  mode: string = '';
  showLoader = false;
  transactionColumns = ['Product Name', 'Price', 'Quantity', 'Payment Amount', 'Is Prepayment', 'Created On', 'Actions'];
  activityColumns = ['Activity item number', 'Total amount', 'Paid amount', 'Is Prepayment', 'Created On', 'Actions'];
  transactionItems: Array<any> = [];
  faTimes = faTimes;
  itemType = 'transaction';

  status = true;

  requestParams: any = {
    iBusinessId: "",
    aProjection: ['_id',
      'iBusinessId',
      'iProductId',
      'iSupplierId',
      'nQuantity',
      'sProductName',
      'nPriceIncVat',
      'nPurchasePrice',
      'nVatRate',
      'nPaymentAmount',
      'nRefundAmount',
      'oType',
      'sArticleNumber',
      'dCreatedDate',
      'dUpdatedDate',
      'iActivityItemId']
  };
  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
  ) {
    const _injector = this.viewContainerRef.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit(): void {
    this.itemType = this.dialogRef.context.itemType;
    this.transaction = this.dialogRef.context.transaction;
    this.requestParams.iBusinessId = localStorage.getItem('currentBusiness');
    this.fetchTransactionItems();


  }

  fetchTransactionItems() {
    this.requestParams.iTransactionId = this.transaction._id;
    let url = `/api/v1/transaction/item/transaction-items`;

    if (this.itemType === 'activity') {
      delete this.requestParams.iTransactionId;
      url = `/api/v1/activities/items/${this.transaction._id}`;
    };
    this.apiService.postNew('cashregistry', url, this.requestParams).subscribe((result: any) => {
      this.transactionItems = result.data[0].result;
      this.transactionItems = this.transactionItems.map(v => ({ ...v, isSelected: false }));
      this.transactionItems.forEach(transactionItem => {
        if (transactionItem.nPaidAmount < transactionItem.nTotalAmount) {
          transactionItem.tType = 'pay';
        } else {
          transactionItem.tType = 'refund';
        }
      });

    }, (error) => {
      alert(error.error.message);
      this.dialogRef.close.emit(false);
    });
  }

  selectAll($event: any) {
    this.transactionItems = this.transactionItems.map(v => ({ ...v, isSelected: $event.checked }));
  }

  close(data: any) {
    this.dialogRef.close.emit(data);
  }
}
