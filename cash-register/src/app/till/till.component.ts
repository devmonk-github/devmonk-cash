import { Component, OnChanges, OnInit } from '@angular/core';
import {
  faScrewdriverWrench, faTruck, faBoxesStacked, faGifts,
  faUserPlus, faUser, faTimes, faTimesCircle, faTrashAlt, faRing,
  faCoins, faCalculator, faArrowRightFromBracket
} from "@fortawesome/free-solid-svg-icons";
import { TranslateService } from "@ngx-translate/core";
import { DialogService } from '../shared/service/dialog'
import { CustomerDialogComponent } from "../shared/components/customer-dialog/customer-dialog.component";
import { TaxService } from "../shared/service/tax.service";
import { ApiService } from '../shared/service/api.service';
import { ConfirmationDialogComponent } from "../shared/components/confirmation-dialog/confirmation-dialog.component";
import { ImageUploadComponent } from '../shared/components/image-upload/image-upload.component';
import { Transaction } from "./models/transaction.model";
import * as _ from 'lodash';

@Component({
  selector: 'app-till',
  templateUrl: './till.component.html',
  styleUrls: ['./till.component.sass']
})
export class TillComponent implements OnInit, OnChanges {
  faScrewdriverWrench = faScrewdriverWrench
  faTruck = faTruck
  faBoxesStacked = faBoxesStacked
  faGifts = faGifts
  faUser = faUser
  faUserPlus = faUserPlus
  faTimes = faTimes
  faTimesCircle = faTimesCircle
  faTrashAlt = faTrashAlt
  faRing = faRing
  faCoins = faCoins
  faCalculator = faCalculator
  faArrowRightFromBracket = faArrowRightFromBracket

  taxes: any[] = []
  transactionItems: any[] = []
  selectedTransaction = null;
  customer: any
  searchkeyword: any;
  shopProducts: any;
  businessId!: string;
  supplierId!: string;
  isStockSelected = true;
  // Dummy data
  parkedTransactions: Transaction[] = [
    new Transaction('1', '1', '1', '2022030301', 'shoppurchase', 'concept', '1', '1'),
    new Transaction('2', '1', '1', '2022030302', 'shoppurchase', 'concept', '1', '1'),
    new Transaction('3', '1', '1', '2022030303', 'shoppurchase', 'concept', '1', '1'),
    new Transaction('4', '1', '1', '2022030304', 'shoppurchase', 'concept', '1', '1'),
    new Transaction('5', '1', '1', '2022030305', 'shoppurchase', 'concept', '1', '1'),
  ]
  quickButtons: any[] = [
    { name: 'Waterdicht', price: this.randNumber(5, 30) },
    { name: 'Batterij', price: this.randNumber(5, 30) },
    { name: 'Band verstellen', price: this.randNumber(5, 20) },
    { name: 'Oude cadeaubon', price: this.randNumber(1, 50) },
    { name: 'Schiet oorbel', price: this.randNumber(1, 50) },
    { name: 'Reparatie', price: this.randNumber(1, 50) },
    { name: 'IXXI', price: this.randNumber(50, 100) },
    { name: 'KARMA', price: this.randNumber(50, 100) },
    { name: 'BUDDHA', price: this.randNumber(50, 100) },
    { name: 'P1500', price: this.randNumber(100, 150) },
    { name: 'Diversen', price: this.randNumber(30, 150) },
    { name: 'Stalen band', price: this.randNumber(25, 50) },
    { name: 'Leren band', price: this.randNumber(20, 45) },
    { name: 'Postzegels', price: this.randNumber(1, 10) },
    { name: 'Tassen', price: this.randNumber(50, 200) },
  ]
  payMethods: Array<any> = [];
  business: any = {}
  locationId: string = ''
  payMethodsLoading: boolean = false;
  requestParams: any = {
    iBusinessId: ''
  }

  // End dummy data


  /**
   * Temp function to generate random numbers for demo till
   * @param min - min number to generate
   * @param max - max number to generate
   */
  randNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  constructor(
    private translateService: TranslateService,
    private dialogService: DialogService,
    private taxService: TaxService,
    private apiService: ApiService
  ) {
  }

  ngOnChanges() {
  }

  ngOnInit(): void {
    this.business._id = localStorage.getItem("currentBusiness");
    this.locationId = localStorage.getItem("currentLocation") || '';
    this.requestParams.iBusinessId = this.business._id;
    this.taxes = this.taxService.getTaxRates()
    this.getPaymentMethods()
  }

  openImageModal() {
    console.log('--- openImageModal');
    this.dialogService.openModal(ImageUploadComponent, { cssClass: "modal-xl", context: { mode: 'create' } }).instance.close.subscribe(result => {

    });
  }

  getPaymentMethods() {
    this.payMethodsLoading = true;
    this.apiService.getNew('cashregistry', '/api/v1/payment-methods/' + this.requestParams.iBusinessId).subscribe((result: any) => {
      if (result && result.data && result.data.length) {
        this.payMethods = result.data;
      }
      this.payMethodsLoading = false;
    }, (error) => {
      this.payMethodsLoading = false;
    })
  }

  addItemToTransaction(item: any): void {
    let article = item
    article.quantity = this.randNumber(1, 10);
    article.discount = 0;
    article.tax = 21;
    article.type = 'product'
    article.description = ''
    this.transactionItems.push(article)
  }

  clearTransaction(): void {
    this.selectedTransaction = null
  }

  removeCustomer(): void {
    this.customer = null
  }

  getTotals(type: string): number {
    if (!type) {
      return 0
    }
    let result = 0
    this.transactionItems.forEach((i) => {
      result += type === 'price' ? i.quantity * i.price : i[type]
    })
    return result
  }

  addItem(type: string): void {
    if (type === 'gift-sell') {
      type = 'giftcard-sell'
    }
    this.transactionItems.push({
      name: this.translateService.instant(type.toUpperCase()),
      type: type,
      quantity: this.randNumber(1, 10),
      price: this.randNumber(5, 200),
      discount: 0,
      tax: 21,
      description: '',
      open: true,
      ...(type === 'giftcard-sell') && { giftcardNumber: Date.now() },
      ...(type === 'giftcard-sell') && { taxHandling: 'true' },
    })
  }

  cancelItems(): void {
    if (this.transactionItems.length > 0) {
      const buttons = [
        { text: "YES", value: true, status: 'success', class: 'btn-primary ml-auto mr-2' },
        { text: "NO", value: false, class: 'btn-warning' }
      ]
      this.dialogService.openModal(ConfirmationDialogComponent, {
        context: {
          header: 'CLEAR_TRANSACTION',
          bodyText: 'ARE_YOU_SURE_TO_CLEAR_THIS_TRANSACTION',
          buttonDetails: buttons
        }
      })
        .instance.close.subscribe(
          result => {
            if (result) {
              this.transactionItems = []
            }
          }
        )
    }
  }

  itemChanged(item: any, index: number): void {
    if (item === 'delete') {
      this.transactionItems.splice(index, 1);
    } else {
      this.transactionItems[index] = item
    }
  }

  openCustomerDialog(): void {
    this.dialogService.openModal(CustomerDialogComponent, { cssClass: "modal-xl", context: { customer: this.customer } })
      .instance.close.subscribe((data) => {
        if (data.customer) {
          this.customer = data.customer
        }
      })
  }


  getUsedPayMethods(total: boolean): any {
    if(!this.payMethods) {
      return 0
    }
    if (total) {
      return _.sumBy(this.payMethods, 'amount') || 0
    }
    return this.payMethods.filter(p => p.amount && p.amount > 0) || 0
  }


  createTransaction(): void {
    const body = {
      iBusinessId: this.business._id,
      iLocationId: this.locationId,
      aTransactionItems: this.transactionItems,
      nTotal: this.getTotals('price'),
      ...(this.customer) && { oCustomer: {
        _id: this.customer._id,
        sFirstName: this.customer.firstName,
        sLastName: this.customer.lastName
      }},
      oReceipt: {
        aPayments: this.getUsedPayMethods(false)
      }

    };

    console.log('body', body)

    this.apiService.postNew('cashregistry', '/api/v1/till/transaction', body)
      .subscribe(data => {
        console.log(data);
      }, err => {
        console.log(err);

      });
  }

  createPayment(payMethods: any) {

    console.log('I am creating payments');

    // WIP: creating booking on successful payment
    // const payments = {
    //   iTransactionId: '6245c31dbcf85b6ff4b2aad0',
    //   iBusinessId: this.business._id,
    //   payMethods
    // };

    // // create payaments
    // this.apiService.postNew('cashregistry', '/api/v1/payments', payments)
    // .subscribe( (data: any) => {
    //   console.log(data);
    //   this.createBookings(data.data);
    // }, err => {
    //   console.log(err);

    // });
  }

  // add bookings
  createBookings(payments: any) {
    const tPayment = [{
      _id: "6246a8ca55b10780a44a88fa", iTransactionId: "6243232f82aefdaba2e77f30",
      iBusinessId: "6182a52f1949ab0a59ff4e7b", nAmount: 100, iPaymentMethodId: "6243ff1a0ab1c8da110423f6",
      dCreatedDate: "2022-04-01T07:24:58.345Z", dUpdatedDate: "2022-04-01T07:24:58.345Z"
    }, {
      _id: "6246a8ca55b10780a44a88fb",
      iTransactionId: "6243232f82aefdaba2e77f30",
      iBusinessId: "6182a52f1949ab0a59ff4e7b",
      nAmount: 150,
      iPaymentMethodId: "6243ff1a0ab1c8da110423f4",
      dCreatedDate: "2022-04-01T07:24:58.347Z",
      dUpdatedDate: "2022-04-01T07:24:58.347Z"
    }]
    const body = {
      iBusinessId: this.business._id,
      iTransactionId: '6243232f82aefdaba2e77f30',
      sTransactionNumber: '20222-226',
      tPayment
    };

    // create payaments
    this.apiService.postNew('bookkeeping', '/api/v1/bookkeeping/booking-for-payments', body)
      .subscribe(data => {
        console.log(data);
      }, err => {
        console.log(err);

      });
  }

  // search() {
  //   console.log(this.searchkeyword);

  // }
  /* Search API for finding the  common-brands products */
  /* Search API for finding the  common-brands products */
  listShopProducts(searchValue: string | undefined, isFromEAN: boolean | false) {
    let data = {
      "iBusinessId": this.business._id,
      "skip": 0,
      "limit": 10,
      "sortBy": "",
      "sortOrder": "",
      "searchValue": searchValue,
      "aProjection": [
        'oName',
        'sEan',
        'nVatRate',
        'sProductNumber',
        'nPriceIncludesVat',
        'bDiscountOnPercentage',
        'nDiscount',
        'sLabelDescription',
        'aImage',
        'sArticleNumber'
      ],
      "oFilterBy": {
        "oStatic": {},
        "oDynamic": {}
      }
    }
    this.apiService.postNew('core', '/api/v1/business/products/list', data).subscribe((result: any) => {
      // this.isLoading = false;
      if (result && result.data && result.data.length) {
        const response = result.data[0];
        this.shopProducts = response.result;
      }
    }, (error) => {
      // this.isLoading = false;
    });
  }

  listCommonBrandProducts(searchValue: string | undefined, isFromEAN: boolean | false) {
    try {
      let data = {
        "iBusinessId": this.business._id,
        "skip": 0,
        "limit": 10,
        "sortBy": "",
        "sortOrder": "",
        "searchValue": searchValue,
        "aProjection": [
          'oName',
          'sEan',
          'nVatRate',
          'sProductNumber',
          'nPriceIncludesVat',
          'bDiscountOnPercentage',
          'nDiscount',
          'sLabelDescription',
          'aImage',
          'sArticleNumber'
        ],
        "oFilterBy": {
          "oStatic": {},
          "oDynamic": {}
        }
      };
      console.log(data);
      this.apiService.postNew('core', '/api/v1/products/commonbrand/list', data).subscribe((result: any) => {
        // this.isLoading = false;
        if (result && result.data && result.data.length) {
          const response = result.data[0];
          this.shopProducts = response.result;
        }
      }, (error) => {
        // this.isLoading = false;
      })
    } catch (e) {
      // this.isLoading = false;
    }
  }

  // Add selected product into purchase order
  onSelectProduct(product: any, isFrom: string, isFor: string) {

    console.log(product);
    this.transactionItems.push({
      name: product.oName ? product.oName['en'] : 'No name',
      type: this.isStockSelected ? 'product' : 'order',
      quantity: 1,
      price: product.nPriceIncludesVat,
      discount: product.nDiscount || 0,
      tax: product.nVatRate || 0,
      description: product.sLabelDescription,
      open: true,
    });
    // this.selectedProduct.emit({ product: product, isFrom: isFrom, isFor: isFor });
    // this.searchByProductNumber = "";
    // this.searchByProductEAN = "";
    // this.commonBrandProducts = [];
    // this.shopProducts = [];
    // this.toggleSearchResult.emit(false);
  }

  search() {
    // if (searchValue && searchValue.length > 2) {
    //   this.isLoading = true;
    if (this.isStockSelected) {
      this.listShopProducts(this.searchkeyword, false);
    } else {
      this.listCommonBrandProducts(this.searchkeyword, false); // Searching for the products of common brand
    }
  }
}
