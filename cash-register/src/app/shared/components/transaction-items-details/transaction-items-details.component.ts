import { Component, OnInit } from '@angular/core';
import { DialogComponent } from '../../service/dialog';
import { ViewContainerRef } from '@angular/core';
import { ApiService } from 'src/app/shared/service/api.service';
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import * as _ from 'lodash';
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
      'iActivityItemId',
      'oArticleGroupMetaData',
      'sDescription']
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
      let id;
      if (this.transaction?.iActivityId) id = this.transaction.iActivityId
      else id = this.transaction._id
      url = `/api/v1/activities/items/${id}`;
    };
    this.apiService.postNew('cashregistry', url, this.requestParams).subscribe((result: any) => {
      this.transactionItems = result.data[0].result;
      const discountRecords = this.transactionItems.filter(o => o.oType.eKind === 'discount' || o.oType.eKind === 'loyalty-points-discount');
      const loyaltyPoints = this.transactionItems.filter(o => o.oType.eKind === 'loyalty-points' || o.oType.eKind === 'loyalty-points');
      this.transactionItems = this.transactionItems.filter(o => o.oType.eKind !== 'discount' && o.oType.eKind !== 'loyalty-points' && o.oType.eKind !== 'loyalty-points-discount');
      this.transactionItems.forEach(element => {
        const elementDiscount = discountRecords.filter(o => o.sUniqueIdentifier === element.sUniqueIdentifier);
        let nRedeemedLoyaltyPoints = 0;
        elementDiscount.forEach(dElement => {
          if (dElement.oType.eKind === 'loyalty-points-discount') {
            nRedeemedLoyaltyPoints += dElement.nRedeemedLoyaltyPoints || 0;
          }
        });
        element.nRedeemedLoyaltyPoints = nRedeemedLoyaltyPoints;
        element.nPaymentAmount += _.sumBy(elementDiscount, 'nPaymentAmount');
        element.nPaidAmount += _.sumBy(elementDiscount, 'nPaymentAmount');
      });
      this.transactionItems = this.transactionItems.map(v => ({ ...v, isSelected: false }));
      this.transactionItems.forEach(transactionItem => {
        if (transactionItem.nPaidAmount < transactionItem.nTotalAmount) {
          transactionItem.tType = 'pay';
        } else {
          transactionItem.tType = 'refund';
        }
        if (transactionItem.oType.bRefund) {
          // to do partial refund
          transactionItem.tType = 'refunded';
        }
      });
      if (discountRecords.length > 0) {
        localStorage.setItem('discountRecords', JSON.stringify(discountRecords));
      }
      // if (loyaltyPoints.length > 0) {
      //   localStorage.setItem('loyaltyPointsRecords', JSON.stringify(loyaltyPoints));
      // }

    }, (error) => {
      alert(error.error.message);
      this.dialogRef.close.emit(false);
    });
  }

  selectAll($event: any) {
    this.transactionItems = this.transactionItems.map(v => ({ ...v, isSelected: $event.checked }));
    this.transactionItems.forEach(element => {
      if (element.bIsRefunded) {
        element.isSelected = false;
      }
    });
  }

  close(data: any) {
    this.dialogRef.close.emit(data);
  }
}
