import { Component, OnInit } from '@angular/core';
import { DialogComponent } from '../../service/dialog';
import { ViewContainerRef } from '@angular/core';
import { ApiService } from 'src/app/shared/service/api.service';
import { faTimes, faMessage, faEnvelope, faEnvelopeSquare, faUser, faReceipt, faEuro } from "@fortawesome/free-solid-svg-icons";
import { PdfService } from '../../service/pdf.service';
@Component({
  selector: 'app-activity-details',
  templateUrl: './activity-details.component.html',
  styleUrls: ['./activity-details.component.scss']
})
export class ActivityDetailsComponent implements OnInit {

  $element = HTMLInputElement
  dialogRef: DialogComponent;
  customer: any;
  activity: any;
  mode: string = '';
  showLoader = false;
  activityItems: Array<any> = [];
  faTimes = faTimes;
  faMessage = faMessage;
  faEnvelope = faEnvelope;
  faEnvelopeSquare = faEnvelopeSquare;
  faUser = faUser;
  faReceipt = faReceipt;
  faEuro = faEuro;
  repairStatus = ['info', 'processing', 'cancelled', 'inspection', 'completed'];
  printOptions = ['Portrait', 'Landscape'];
  itemType = 'transaction';
  status = true;
  customerReceiptDownloading: Boolean = false;
  iBusinessId = localStorage.getItem('currentBusiness');
  requestParams: any = {
    iBusinessId: this.iBusinessId,
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
    private pdfService: PdfService
  ) {
    const _injector = this.viewContainerRef.injector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit(): void {
    this.activity = this.dialogRef.context.activity;
    this.fetchCustomer(this.activity.iCustomerId);
    this.fetchTransactionItems();
    // this.itemType = this.dialogRef.context.itemType;
    // this.transaction = this.dialogRef.context.transaction;
  }

  downloadCustomerReceipt(index: number) {
    const data = this.activity.activityitems[index];
    const sName = 'Sample', eType = 'completed';
    this.customerReceiptDownloading = true;
    this.apiService.getNew('cashregistry', '/api/v1/pdf/templates/' + this.iBusinessId + '?sName=' + sName + '&eType=' + eType).subscribe(
      (result: any) => {
        const template = result.data;
        const filename = new Date().getTime().toString()
        let printData = null
        let print = false;
        // if (print) {
        //   printData = {
        //     computerId: this.computerId,
        //     printerId: this.printerId,
        //     title: filename,
        //     quantity: 1
        //   }
        // }

        this.pdfService.createPdf(JSON.stringify(template), data, filename, print, printData, this.iBusinessId, this.activity?._id)
          .then(() => {
            this.customerReceiptDownloading = false;
          })
          .catch((e: any) => {
            this.customerReceiptDownloading = false;
            console.error('err', e)
          })
      }, (error) => {
        this.customerReceiptDownloading = false;
      })
  }

  fetchCustomer(customerId: any) {
    this.apiService.getNew('customer', `/api/v1/customer/${customerId}?iBusinessId=${this.iBusinessId}`).subscribe(
      (result: any) => {
        this.customer = result;
        // this.close({ action: true });
      },
      (error: any) => {
        console.error(error)
      }
    );
  }

  fetchTransactionItems() {
    let url = `/api/v1/activities/items/${this.activity._id}`;
    this.apiService.postNew('cashregistry', url, this.requestParams).subscribe((result: any) => {
      this.activityItems = result.data[0].result;;
    }, (error) => {
      alert(error.error.message);
      this.dialogRef.close.emit('data');
    });
  }

  close(data: any) {
    this.dialogRef.close.emit(data);
  }

  submit() {
    console.log('Submit');
  }
}
