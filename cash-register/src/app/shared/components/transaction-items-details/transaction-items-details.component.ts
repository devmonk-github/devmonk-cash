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

  dialogRef: DialogComponent;
  transaction: any;
  salutations: Array<any> = ['Mr', 'Mrs', 'Mr/Mrs', 'Family', 'Firm']
  gender: Array<any> = ['Male', 'Female', "Other"]
  documentTypes: Array<any> = ['Driving license', 'Passport', 'Identity card', 'Alien document'];
  mode: string = '';
  showLoader = false;
  allColumns = ['Product Name', 'Price', 'Quantity', 'Payment Amount', 'Is Prepayment', 'Created On'];
  transactionItems: Array<any> = [];
  editProfile: boolean = false;
  faTimes = faTimes;
  customer: any = {
    bNewsletter: true,
    sSalutation: 'Mr',
    sEmail: '',
    sFirstName: '',
    sPrefix: '',
    sLastName: '',
    oPhone: {
      sCountryCode: '',
      sMobile: '',
      sLandLine: '',
      sFax: '',
      bWhatsApp: true
    },
    note: '',
    dDateOfBirth: '',
    oIdentity: {
      documentName: '',
      documentNumber: '',
    },
    sGender: 'male',
    oInvoiceAddress: {
      country: 'Netherlands',
      countryCode: 'NL',
      state: '',
      postalCode: '',
      houseNumber: '',
      houseNumberSuffix: '',
      addition: '',
      street: '',
      city: ''
    },
    oShippingAddress: {
      country: 'Netherlands',
      countryCode: 'NL',
      state: '',
      postalCode: '',
      houseNumber: '',
      houseNumberSuffix: '',
      addition: '',
      street: '',
      city: ''
    },
    sCompanyName: '',
    sVatNumber: '',
    sCocNumber: '',
    nPaymentTermDays: ''
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
    this.transaction = this.dialogRef.context.transaction;
    this.requestParams.iBusinessId = localStorage.getItem('currentBusiness');
    this.fetchTransactionItems();
  }

  customerCountryChanged(type: string, event: any) {
    this.customer[type].countryCode = event.key;
    this.customer[type].country = event.value;
  }

  fetchTransactionItems() {
    this.requestParams.iTransactionId = this.transaction._id;
    this.apiService.postNew('cashregistry', '/api/v1/transaction/item/list', this.requestParams).subscribe((result: any) => {
      console.log(result);
      this.transactionItems = result.data[0].result;
    }, (error) => {
      alert(error.error.message);
      this.dialogRef.close.emit('data');
    });
  }
  // refundOrPay(transaction: any, type: string) {
  //   'refund'
  // }
  close(data: any) {
    this.dialogRef.close.emit(data);
  }
}
