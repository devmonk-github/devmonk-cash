import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { faDownload, faEnvelope, faReceipt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../../service/api.service';
import { DialogComponent, DialogService } from '../../service/dialog';
import { PdfService } from '../../service/pdf.service';
import { MenuComponent } from '../../_layout/components/common';
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
  repairStatus = ['info', 'processing', 'cancelled', 'inspection', 'completed'];
  carriers = ['PostNL', 'DHL', 'DPD', 'bpost', 'other'];
  faTimes = faTimes;
  faDownload = faDownload;
  faReceipt = faReceipt;
  faEnvelope = faEnvelope;
  customer: any;
  activity: any;
  loading: Boolean = false;
  iBusinessId = localStorage.getItem('currentBusiness');
  transactions: Array<any> = [];
  totalPrice: Number = 0;
  quantity: Number = 0;
  userDetail: any;
  showDetails: Boolean = true;
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
      // for(const obj of this.activityItems){
      //   for(const item of obj.receipts){
      //     this.transactions.push({ ...item, ...obj });
      //   }
      // }
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

  setSelectedBusinessLocation(locationId: string, index: number) {
    this.business.aInLocation.map(
      (location: any) => {
        if (location._id == locationId)
          this.transactions[index].locationName = location.sName;
      })
  }

  selectBusiness(index: number, location?: any) {
    if (location?._id) {
      this.transactions[index].locationName = location.sName;
      this.transactions[index].iStockLocationId = location._id;
    }
    this.updateTransaction(this.transactions[index]);
  }

  updateTransaction(transaction: any) {
    transaction.iBusinessId = this.iBusinessId;
    this.apiService.putNew('cashregistry', '/api/v1/transaction/item/StockLocation/' + transaction?._id , transaction)
    .subscribe((result: any) => {
    }, 
    (error) => {

    })
  }
    

  fetchCustomer(customerId: any, index: number) {
    this.apiService.getNew('customer', `/api/v1/customer/${customerId}?iBusinessId=${this.iBusinessId}`).subscribe(
      (result: any) => {
        console.log(result);
        if(index > -1) this.transactions[index].customer = result;
        else this.customer = result;
        // this.close({ action: true });
      },
      (error: any) => {
        console.error(error)
      }
    );
  }

  
  changeStatusForAll(type: string){
    this.activityItems.forEach((obj: any)=>{
      obj.eRepairStatus = type;
      this.updateActivityItem(obj)
    })
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

  close(data: any) {
    this.dialogRef.close.emit(data);
  }

  submit() {
    console.log('Submit');
  }

}
