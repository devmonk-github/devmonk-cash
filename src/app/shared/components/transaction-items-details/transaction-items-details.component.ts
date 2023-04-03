import { Component, OnInit } from '@angular/core';
import { DialogComponent } from '../../service/dialog';
import { ViewContainerRef } from '@angular/core';
import { ApiService } from 'src/app/shared/service/api.service';
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../toast';
import { TranslateService } from '@ngx-translate/core';

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
  translation :any =[];
  transactionColumns :any= []
  activityColumns : any= []
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
    aProjection: [
      '_id',
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
      'sDescription',
      'sArticleNumber',
      'iLocationId'
    ]
  };
  bPriceEditMode = false;
  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private toastrService: ToastService,
    private transaltionService:TranslateService
    ) {
      const _injector = this.viewContainerRef.parentInjector;
      this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
      this.isFor = this.route?.snapshot?.queryParams?.isFor;
    }
    
    ngOnInit(): void {
      // console.log('this.transactionItems 1', this.transactionItems);
      const translation =['ACTIVITY_ITEM_NUMBER', 'BAG_NUMBER', 'TOTAL_AMOUNT' , 'PAID_AMOUNT' , 'IS_PREPAYMENT' , 'CREATED_ON' , 'ACTIONS' , 'PRODUCT_NAME' , 'PRICE' , 'QUANTITY' , 'PAYMENT_AMOUNT'];
      this.transaltionService.get(translation).subscribe((res:any)=>{
        this.translation = res
      })
      this.transactionColumns =  [this.translation['PRODUCT_NAME'] , this.translation['PRICE'], this.translation['QUANTITY'], this.translation['PAYMENT_AMOUNT'], this.translation['IS_PREPAYMENT'], this.translation['CREATED_ON'], this.translation['ACTIONS']];
      this.activityColumns = [this.translation['ACTIVITY_ITEM_NUMBER'], this.translation['PRODUCT_NAME'], this.translation['BAG_NUMBER'], this.translation['TOTAL_AMOUNT'], this.translation['PAID_AMOUNT'], this.translation['IS_PREPAYMENT'], this.translation['CREATED_ON'], this.translation['ACTIONS']];
      this.apiService.setToastService(this.toastrService);
      // this.itemType = this.dialogRef.context.itemType;
      // this.transaction = this.dialogRef.context.transaction;
      // this.selectedId = this.dialogRef.context.selectedId;
    this.requestParams.iBusinessId = localStorage.getItem('currentBusiness');
    this.fetchTransactionItems();
  }

  getRelatedTransactionItem(iTransactionItemId: string) {  // ?iBusinessId=${this.iBusinessId}
    return this.apiService.getNew('cashregistry', `/api/v1/transaction/item/related/${iTransactionItemId}?iBusinessId=${this.requestParams.iBusinessId}`).toPromise();
  }

  async fetchTransactionItems() {
    // console.log('TransactionItemsDetailsComponent fetchTransactionItems', this.transaction);
    this.requestParams.iTransactionId = this.transaction._id;
    let url = `/api/v1/transaction/item/transaction-items`;
    // console.log('fetchTransactionItems: ', url, this.transaction);
    let aRelatedTransactionItem:any;
    if (this.itemType === 'activity') {
      // console.log('item type activity if')
      delete this.requestParams.iTransactionId;
      let id;
      if (this.transaction?.iActivityId) id = this.transaction.iActivityId
      else id = this.transaction._id
      url = `/api/v1/activities/items/${id}`;
      
      /* If comes from the Activity-item then URL will change and it will fetch the AI */
      if (this.isFor !== 'activity' && this.transaction?.iActivityItemId) url = `/api/v1/activities/activity-item/${this.transaction.iActivityItemId}`;
    } else {
      /* fetching the related transaction-item detail if there is any mutiple pre-payment then need to change the payment-amount */
      aRelatedTransactionItem = await this.getRelatedTransactionItem(this.transaction?._id);
      
      if (aRelatedTransactionItem?.data?.length > 1) {
        // console.log('oShowWarning: ', this.oShowWarning);
        this.oShowWarning.bIsMoreTransaction = true;
        this.oShowWarning.sMessage = `THERE_IS_MORE_PREPAYMENT`;
      }
    }
    this.apiService.postNew('cashregistry', url, this.requestParams).subscribe((result: any) => {
      // console.log('120 api result assiging to transaction items', result)
      this.transactionItems = result.data[0].result;
      // console.log('this.transactionItems 2', JSON.parse(JSON.stringify(this.transactionItems)));

      const discountRecords = this.transactionItems.filter(o => o.oType.eKind === 'discount' || o.oType.eKind === 'loyalty-points-discount' || o.oType.eKind === 'giftcard-discount');
      this.bIsAnyGiftCardDiscount = this.transactionItems.find((el: any) => el?.oType?.eKind === 'giftcard-discount')
      this.transactionItems = this.transactionItems.filter(o => o.oType.eKind !== 'discount' && o.oType.eKind !== 'loyalty-points' && o.oType.eKind !== 'loyalty-points-discount' && o.oType.eKind !== 'giftcard-discount');
      // console.log('this.transactionItems 3', this.transactionItems);
      this.transactionItems.forEach(element => {
        // element.nDiscount = 0;
        // if (aRelatedTransactionItem?.data?.length && element.oType.eKind==='regular') element.nRevenueAmount = 0;
        const elementDiscount = discountRecords.filter(o => o.sUniqueIdentifier === element.sUniqueIdentifier);
        // let nRedeemedLoyaltyPoints = 0;
        let nDiscountnPaymentAmount  = 0;
        
        elementDiscount.forEach(dElement => {
          // nRedeemedLoyaltyPoints += dElement.nRedeemedLoyaltyPoints || 0;
          if (dElement.oType.eKind === 'loyalty-points-discount' || dElement.oType.eKind === "discount" || dElement.oType.eKind === 'giftcard-discount'){
            nDiscountnPaymentAmount += dElement.nPaymentAmount || 0;
          } 
        });
        // element.nDiscountnPaymentAmount = nDiscountnPaymentAmount;

        if(!elementDiscount?.length) {
          //in original transaction, we have some with discounts so need to adjust them
          const relatedItem = aRelatedTransactionItem?.data?.find((relatedItem:any)=> 
            relatedItem.oType.eKind === 'regular' && 
            relatedItem.nDiscount > 0 && 
            relatedItem._id !== element._id &&
            relatedItem.sUniqueIdentifier === element.sUniqueIdentifier);
          if(relatedItem) {
            element.nDiscount = -(relatedItem.nDiscount);
            element.nPaidAmount += element.nDiscount;
          }

        }

        // element.nRedeemedLoyaltyPoints = nRedeemedLoyaltyPoints;
        element.nPaymentAmount += _.sumBy(elementDiscount, 'nPaymentAmount');
        element.nPaidAmount += _.sumBy(elementDiscount, 'nPaymentAmount');
        element.nPriceIncVat += (nDiscountnPaymentAmount / element.nQuantity)
        
        element.nPaidAmount = parseFloat(element.nPaidAmount.toFixed(2));
        element.nPaymentAmount = parseFloat(element.nPaymentAmount.toFixed(2));
      });
    
      this.transactionItems = this.transactionItems.map(v => ({ ...v, isSelected: false }));
      // console.log('this.transactionItems 4: ', JSON.parse(JSON.stringify(this.transactionItems)));
      this.transactionItems.forEach(item => {
        if (item.nPaidAmount < (item.nTotalAmount - item.nDiscount * item.nQuantity)) {
          item.tType = 'pay';
        } else {
          item.tType = 'refund';
        }
        if (item.oType.bRefund) {
          // to do partial refund
          item.tType = 'refunded';
        }
        if (this.aSelectedIds?.length && this.aSelectedIds.includes(item._id) || (this.selectedId && this.selectedId === item._id) &&  !item?.bIsRefunded) {
          item.isSelected = true;
        }

        if (this.itemType === 'transaction') { item.tType = 'refund'; }
      });
      if (discountRecords?.length) localStorage.setItem('discountRecords', JSON.stringify(discountRecords));
    }, (error) => {
      alert(error.error.message);
      this.dialogRef.close.emit(false);
    });
  }

  selectAll(event: any) {
    // this.transactionItems = this.transactionItems.map(v => ({ ...v, isSelected: $event.checked }));
    // console.log('this.transactionItems 6:', this.transactionItems);
    this.transactionItems.forEach(element => {
      if (element.bIsRefunded) element.isSelected = false;
      else element.isSelected = event.checked;
    });
  }

  close(data: any, sFrom:string = '') {
    // console.log(201, 'closing from transaction item details', data);
    if(sFrom === 'close') {
      this.dialogRef.close.emit(data);
    } else {
      if(!data?.transactionItems?.filter((item:any)=> item.isSelected)?.length) {
        this.toastrService.show({ type: 'warning', text: 'Please select at least one item!' });
      } else {
        this.dialogRef.close.emit(data);
      }
    }
  }

  saveEditedPrice(item:any){
    this.bPriceEditMode = false;
    item.bUpdating = true;

    const oBody = {
      iBusinessId: this.requestParams.iBusinessId,
      nPriceIncVat: parseFloat(item.nPriceIncVat),
      nTotalAmount: parseFloat(item.nPriceIncVat),
    }
    this.apiService.putNew('cashregistry', `/api/v1/activities/items/${item._id}`, oBody).subscribe((result:any) => {
      if(result?.data){
        item.bUpdating = false;
        this.toastrService.show({ type: 'success', text: 'Updated price successfully!' });
        if (item.nPaidAmount < ((item.nPriceIncVat - item.nDiscount) * item.nQuantity)) {
          item.tType = 'pay';
        }
      }
    });
  }
}
