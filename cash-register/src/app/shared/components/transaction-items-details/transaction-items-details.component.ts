import { Component, OnInit } from '@angular/core';
import { DialogComponent } from '../../service/dialog';
import { ViewContainerRef } from '@angular/core';
import { ApiService } from 'src/app/shared/service/api.service';
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';

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
  selectedId: any;
  status = true;
  bIsAnyGiftCardDiscount: boolean = false;
  aSelectedIds:any = [];
  isFor: any;
  oShowWarning = {
    bIsMoreTransaction: false,
    sMessage: ''
  }
  
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
    private route: ActivatedRoute,
    private router: Router,
    ) {
      const _injector = this.viewContainerRef.parentInjector;
      this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
      this.isFor = this.route?.snapshot?.queryParams?.isFor;
      console.log('TransactionItemsDetailsComponent');
    }
    
    ngOnInit(): void {
      console.log('TransactionItemsDetailsComponent 1');
      this.itemType = this.dialogRef.context.itemType;
      this.transaction = this.dialogRef.context.transaction;
      this.selectedId = this.dialogRef.context.selectedId;
    this.requestParams.iBusinessId = localStorage.getItem('currentBusiness');
    this.fetchTransactionItems();
  }

  getRelatedTransactionItem(iTransactionItemId: string) {  // ?iBusinessId=${this.iBusinessId}
    return this.apiService.getNew('cashregistry', `/api/v1/transaction/item/related/${iTransactionItemId}?iBusinessId=${this.requestParams.iBusinessId}`).toPromise();
  }

  async fetchTransactionItems() {
    console.log('TransactionItemsDetailsComponent 3');
    this.requestParams.iTransactionId = this.transaction._id;
    let url = `/api/v1/transaction/item/transaction-items`;
    console.log('fetchTransactionItems: ', url, this.transaction);
    if (this.itemType === 'activity') {
      delete this.requestParams.iTransactionId;
      let id;
      if (this.transaction?.iActivityId) id = this.transaction.iActivityId
      else id = this.transaction._id
      url = `/api/v1/activities/items/${id}`;
      
      /* If comes from the Activity-item then URL will change and it will fetch the AI */
      if (this.isFor !== 'activity' && this.transaction?.iActivityItemId) url = `/api/v1/activities/activity-item/${this.transaction.iActivityItemId}`;
    } else {
      /* fetching the related transaction-item detail if there is any mutiple pre-payment then need to change the payment-amount */
      const aRelatedTransactionItem: any = await this.getRelatedTransactionItem(this.transaction?._id);
      console.log('aRelatedTransactionItem: ', aRelatedTransactionItem);
      if (aRelatedTransactionItem?.data?.length > 1) {
        console.log('oShowWarning: ', this.oShowWarning);
        this.oShowWarning.bIsMoreTransaction = true;
        this.oShowWarning.sMessage = `THERE_IS_MORE_PREPAYMENT`;
      }
    }
    this.apiService.postNew('cashregistry', url, this.requestParams).subscribe((result: any) => {
      this.transactionItems = result.data[0].result;  
      const discountRecords = this.transactionItems.filter(o => o.oType.eKind === 'discount' || o.oType.eKind === 'loyalty-points-discount');
      this.bIsAnyGiftCardDiscount = this.transactionItems.find((el: any) => el?.oType?.eKind === 'giftcard-discount')
      this.transactionItems = this.transactionItems.filter(o => o.oType.eKind !== 'discount' && o.oType.eKind !== 'loyalty-points' && o.oType.eKind !== 'loyalty-points-discount' && o.oType.eKind !== 'giftcard-discount');
      this.transactionItems.forEach(element => {
        const elementDiscount = discountRecords.filter(o => o.sUniqueIdentifier === element.sUniqueIdentifier);
        let nRedeemedLoyaltyPoints = 0;
        let nDiscountnPaymentAmount  = 0;
        elementDiscount.forEach(dElement => {
          if (dElement.oType.eKind === 'loyalty-points-discount') nRedeemedLoyaltyPoints += dElement.nRedeemedLoyaltyPoints || 0;
          if (dElement.oType.eKind === "discount"){
            nDiscountnPaymentAmount += dElement.nPaymentAmount || 0;
            // element.nDiscount += dElement.nDiscount || 0;
          } 
        });
        
        element.nRedeemedLoyaltyPoints = nRedeemedLoyaltyPoints;
        element.nPaymentAmount += _.sumBy(elementDiscount, 'nPaymentAmount');
        element.nPaidAmount += _.sumBy(elementDiscount, 'nPaymentAmount');
        element.nPriceIncVat += nDiscountnPaymentAmount;// + element.nDiscount;
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
        if (this.aSelectedIds?.length && this.aSelectedIds.includes(transactionItem._id) || (this.selectedId && this.selectedId === transactionItem._id)) {
          transactionItem.isSelected = true;
        }
      });
      if (discountRecords?.length) localStorage.setItem('discountRecords', JSON.stringify(discountRecords));
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
