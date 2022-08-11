import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { faDownload, faEnvelope, faLongArrowAltDown, faLongArrowAltUp, faReceipt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../../service/api.service';
import { DialogComponent, DialogService } from '../../service/dialog';
import { PdfService } from '../../service/pdf.service';
import { MenuComponent } from '../../_layout/components/common';
import { TransactionItemsDetailsComponent } from '../transaction-items-details/transaction-items-details.component';
@Component({
  selector: 'app-web-order-details',
  templateUrl: './web-order-details.component.html',
  styleUrls: ['./web-order-details.component.scss']
})
export class WebOrderDetailsComponent implements OnInit {

  $element = HTMLInputElement
  dialogRef: DialogComponent;
  activityItems: Array<any> = [];
  business: any;
  repairStatus = ['info', 'processing', 'cancelled', 'inspection', 'completed', 'refund', 'refundInCashRegister'];
  carriers = ['PostNL', 'DHL', 'DPD', 'bpost', 'other'];
  faTimes = faTimes;
  faDownload = faDownload;
  faReceipt = faReceipt;
  faEnvelope = faEnvelope;
  faArrowUp = faLongArrowAltUp;
  faArrowDown = faLongArrowAltDown;
  customer: any;
  activity: any;
  loading: Boolean = false;
  iBusinessId = localStorage.getItem('currentBusiness');
  transactions: Array<any> = [];
  totalPrice: Number = 0;
  quantity: Number = 0;
  userDetail: any;
  showDetails: Boolean = true;
  showMore: Boolean = false;
  imagePlaceHolder: string = '../../../../assets/images/no-photo.svg';
  requestParams: any = {
    iBusinessId: this.iBusinessId,
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
      'iActivityItemId']
  };


  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
    private pdfService: PdfService,
    private dialogService: DialogService,
  ) {
    const _injector = this.viewContainerRef.injector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit(): void {
    this.activity = this.dialogRef.context.activity;
    if(this.activity?.iCustomerId) this.fetchCustomer(this.activity.iCustomerId, -1);
    this.getBusinessLocations()
    this.fetchTransactionItems();
  }

  openTransaction(transaction: any, itemType: any) {
    transaction.iActivityId = this.activity._id;
    this.dialogService.openModal(TransactionItemsDetailsComponent, { cssClass: "modal-xl", context: { transaction, itemType } })
      .instance.close.subscribe((result: any) => {
        const transactionItems: any = [];
        if (result.transaction) {
          result.transactionItems.forEach((transactionItem: any) => {
            if (transactionItem.isSelected) {
              const { tType } = transactionItem;
              let paymentAmount = transactionItem.nQuantity * transactionItem.nPriceIncVat - transactionItem.nPaidAmount;
              if (tType === 'refund') {
                paymentAmount = -1 * transactionItem.nPaidAmount;
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
          localStorage.setItem('fromTransactionPage', JSON.stringify(result));
          localStorage.setItem('recentUrl', '/business/transactions');
          setTimeout(() => {
            this.close(true);
          }, 100);
        }
      });
  }

  getBusinessLocations() {
    this.apiService.getNew('core', '/api/v1/business/user-business-and-location/list')
      .subscribe((result: any) => {
        if (result.message == "success" && result?.data) {
          this.userDetail = result.data;
          if (this.userDetail.aBusiness) {
            this.userDetail.aBusiness.map(
              (business: any) => {
                if (business._id == this.iBusinessId) {
                  this.business = business;
                }
              })
            }
        }
        setTimeout(() => {
          MenuComponent.reinitialization();
        }, 200);
      }, (error) => {
        console.log('error: ', error);
      });
  }

  downloadOrder(){ }

  fetchTransactionItems() {
    let url = `/api/v1/activities/items/${this.activity._id}`;
    this.loading = true;
    this.apiService.postNew('cashregistry', url, this.requestParams).subscribe((result: any) => {
      this.activityItems = result.data[0].result;
      this.loading = false;
      // this.transactions = [];
      for(let i = 0; i < this.activityItems.length; i++){
        // for(const item of obj.receipts){
        const obj = this.activityItems[i];
        this.fetchCustomer(obj.iCustomerId, i);
        for(let j = 0; j < obj.receipts.length; j++){
          // this.transactions.push({ ...item, ...obj });
            const item = obj.receipts[j];
            this.totalPrice += item.nPaymentAmount;
            this.quantity += item.bRefund ? (- item.nQuantity) : item.nQuantity
            if(item.iStockLocationId) this.setSelectedBusinessLocation(item.iStockLocationId, i, j)
        }
      }
      // for(let i = 0; i < this.transactions.length; i++){
      //   const obj = this.transactions[i];
      //   this.totalPrice += obj.nPaymentAmount;
      //   this.quantity += obj.bRefund ? (- obj.nQuantity) : obj.nQuantity
      //   if(obj.iStockLocationId) this.setSelectedBusinessLocation(obj.iStockLocationId, i)
      //   this.fetchCustomer(obj.iCustomerId, i);
      // }
      this.loading = false;
      setTimeout(() => {
        MenuComponent.reinitialization();
      }, 200);
    }, (error) => {
      this.loading = false;
      alert(error.error.message);
      this.dialogRef.close.emit('data');
    });
  }

  setSelectedBusinessLocation(locationId: string, parentIndex: number, index: number) {
    this.business.aInLocation.map(
      (location: any) => {
        if (location._id == locationId)
          this.activityItems[parentIndex].receipts[index].locationName = location.sName;
      })
  }

  selectBusiness(index: number, location?: any) {
    if (location?._id) {
      this.activityItems[index].receipts[0].locationName = location.sName;
      this.activityItems[index].receipts[0].iStockLocationId = location._id;
    }
    this.updateTransaction(this.activityItems[index].receipts[0]);
  }

  updateTransaction(transaction: any) {
    transaction.iBusinessId = this.iBusinessId;
    this.apiService.putNew('cashregistry', '/api/v1/transaction/item/StockLocation/' + transaction?._id , transaction)
    .subscribe((result: any) => {
    }, 
    (error) => {

    })
  }
    

  fetchCustomer(customerId: any, parentIndex: number) {
    this.apiService.getNew('customer', `/api/v1/customer/${customerId}?iBusinessId=${this.iBusinessId}`).subscribe(
      (result: any) => {
        console.log(result);
        if(parentIndex > -1) this.activityItems[parentIndex].customer = result;
        else this.customer = result;
        // this.close({ action: true });
      },
      (error: any) => {
        console.error(error)
      }
    );
  }

  
  changeStatusForAll(status: string){
    this.activityItems.forEach((obj: any)=>{
      obj.eActivityItemStatus = status;
    })
    this.updateActivity()
    if(status == 'refundInCashRegister') this.openTransaction(this.activity, 'activity');
  }

  changeTrackingNumberForAll(sTrackingNumber: string){
    this.activityItems.forEach((obj: any)=>{
      obj.sTrackingNumber = sTrackingNumber;
      this.updateActivityItem(obj)
    })
  }

  changeCarrierForAll(eCarrier: string){
    this.activityItems.forEach((obj: any)=>{
      obj.eCarrier = eCarrier;
      this.updateActivityItem(obj)
    })
  }

  updateActivityItem(item: any) {
    item.iBusinessId = this.iBusinessId;
    this.apiService.putNew('cashregistry', '/api/v1/activities/items/' + item?.iActivityItemId , item)
    .subscribe((result: any) => {
    }, 
    (error) => {
    })
  }

  updateActivity() {
    this.apiService.putNew('cashregistry', '/api/v1/activities/' + this.activity?._id , this.activity)
    .subscribe(
      (result: any) => { }, 
      (error) => { }
    )
  }

  close(data: any) {
    this.dialogRef.close.emit(data);
  }

  submit() {
    console.log('Submit');
  }

}
