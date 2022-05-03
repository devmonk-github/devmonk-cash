import { Component, OnInit } from '@angular/core';
import {
  faScrewdriverWrench, faTruck, faBoxesStacked, faGifts,
  faUserPlus, faUser, faTimes, faTimesCircle, faTrashAlt, faRing,
  faCoins, faCalculator, faArrowRightFromBracket, faSpinner
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
import { TransactionItem } from "./models/transaction-item.model";
import { ToastService } from "../shared/components/toast";
import { TransactionsSearchComponent } from '../shared/components/transactions-search/transactions-search.component';
import { PaymentDistributionService } from '../shared/service/payment-distribution.service';

@Component({
  selector: 'app-till',
  templateUrl: './till.component.html',
  styleUrls: ['./till.component.scss']
})
export class TillComponent implements OnInit {
  // icons
  faScrewdriverWrench = faScrewdriverWrench
  faTruck = faTruck
  faBoxesStacked = faBoxesStacked
  faGifts = faGifts
  faUser = faUser
  faTimes = faTimes
  faTimesCircle = faTimesCircle
  faTrashAlt = faTrashAlt
  faRing = faRing
  faCoins = faCoins
  faCalculator = faCalculator
  faArrowRightFromBracket = faArrowRightFromBracket
  faSpinner = faSpinner;
  taxes: any[] = []
  transactionItems: any[] = []
  selectedTransaction: any = null;
  customer: any = null;
  searchKeyword: any;
  shopProducts: any;
  commonProducts: any;
  businessId!: string;
  supplierId!: string;
  iActivityId!: string;
  isStockSelected = true;
  payMethods: Array<any> = [];
  business: any = {}
  locationId: string = ''
  payMethodsLoading: boolean = false;
  requestParams: any = {
    iBusinessId: ''
  }
  parkedTransactionLoading = false;
  eKind: string = 'regular';
  // Dummy data
  parkedTransactions: any[] = [
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
  ];

  saveInProgress = false;
  // End dummy data
  // type: ['Visa']
  // cards = [{ sName: 'Card', type: ['Visa', 'Meastro', 'Master Card'], amount: 0 }];
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
    private paymentDistributeService: PaymentDistributionService,
    private apiService: ApiService,
    private toastrService: ToastService
  ) {
  }

  ngOnInit(): void {
    this.business._id = localStorage.getItem("currentBusiness");
    this.locationId = localStorage.getItem("currentLocation") || '';
    this.requestParams.iBusinessId = this.business._id;
    this.taxes = this.taxService.getTaxRates()
    this.getPaymentMethods();
    this.getParkedTransactions();
  }

  getValueFromLocalStorage(key: string): any {
    if (key === 'currentEmployee') {
      const value = localStorage.getItem('currentEmployee');
      if (value) {
        return JSON.parse(value)
      } else {
        return ''
      }
    } else {
      return localStorage.getItem(key) || "";
    }
  }

  openImageModal() {
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
    article.quantity = 1;
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
    switch (type) {
      case 'price':
        this.transactionItems.forEach((i) => {
          if (!i.isExclude) {
            if (i.tType === 'refund') {
              result -= i.prePaidAmount;
            } else {
              result += i.quantity * i.price - (i.prePaidAmount || 0);
              // result += type === 'price' ? i.quantity * i.price - i.prePaidAmount || 0 : i[type]
            }
          } else {
            i.paymentAmount = 0;
          }
        });
        break;
      case 'quantity':
        this.transactionItems.forEach((i) => {
          result += i.quantity;
        });
        break;
      case 'discount':
        this.transactionItems.forEach((i) => {
          result += i.discount;
        });
        break;
      default:
        result = 0;
        break;
    }
    return result
  }

  totalPrepayment() {
    let result = 0
    this.transactionItems.forEach((i) => {
      if (!i.isExclude) {
        result += i.paymentAmount;
      }
    });
    return result;
  }
  addItem(type: string): void {
    if (type === 'giftcard') {
      type = 'giftcard'
    }
    // 'regular',
    // 'giftcard',
    // 'giftcard-redeem-single-purpose',
    // 'empty-line',
    // 'repair',
    // 'order',
    // 'gold-purchase',
    // 'gold-sell'
    this.transactionItems.push({
      isExclude: type === 'repair' ? true : false,
      eTransactionItemType: 'regular',
      manualUpdate: false,
      index: this.transactionItems.length,
      name: this.translateService.instant(type.toUpperCase()),
      type,
      quantity: 1,
      nBrokenProduct: 0,
      price: this.randNumber(5, 200),
      discount: 0,
      tax: 21,
      paymentAmount: 0,
      description: '',
      open: true,
      iBusinessId: this.getValueFromLocalStorage('currentBusiness'),
      ...(type === 'giftcard') && { sGiftCardNumber: Date.now() },
      ...(type === 'giftcard') && { taxHandling: 'true' },
      ...(type === 'giftcard') && { isGiftCardNumberValid: false },
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
    switch (item) {
      case 'delete':
        this.transactionItems.splice(index, 1);
        break;
      case 'update':
        let availableAmount = this.getUsedPayMethods(true);
        this.paymentDistributeService.updateAmount(this.transactionItems, availableAmount, index);
        break;
      case 'duplicate':
        const tItem = Object.create(this.transactionItems[index]);
        tItem.sGiftCardNumber = Date.now();
        this.transactionItems.push(tItem);
        break;
      default:
        this.transactionItems[index] = item
        break;
    }
  }

  createGiftCard(item: any, index: number): void {
    const body = {
      iBusinessId: this.getValueFromLocalStorage('currentBusiness'),
      iLocationId: this.getValueFromLocalStorage('currentLocation'),
      iCustomerId: '6182a52f1949ab0a59ff4e7b',
      sGiftCardNumber: this.transactionItems[index].sGiftCardNumber,
      eType: '',
      nPriceIncVat: this.transactionItems[index].price,
      nVatRate: this.transactionItems[index].tax,
      nQuantity: this.transactionItems[index].quantity,
      nPaidAmount: 0,
      sProductName: this.transactionItems[index].name,
      iActivityId: this.iActivityId,
    };
    this.apiService.postNew('cashregistry', '/api/v1/till/gift-card', body)
      .subscribe((data: any) => {
        this.iActivityId = data.iActivityId;
        this.transactionItems[index].iActivityItemId = data._id;
        this.toastrService.show({ type: 'success', text: 'Giftcard created!' });
      }, err => {
        this.toastrService.show({ type: 'danger', text: err.message });
      });
  }

  openTransactionSearchDialog(): void {
    this.dialogService.openModal(TransactionsSearchComponent, { cssClass: "modal-xl", context: { customer: this.customer } })
      .instance.close.subscribe((data) => {
        if (data.transaction) {
          this.clearAll();
          const { transactionItems, transaction } = data;
          // render all transaction items
          transactionItems.forEach((transactionItem: any) => {
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
              this.transactionItems.push({
                name: transactionItem.sProductName,
                iActivityItemId: transactionItem.iActivityItemId,
                nRefundAmount: transactionItem.nPaidAmount,
                prePaidAmount: tType === 'refund' ? transactionItem.nPaidAmount : transactionItem.nPaymentAmount,
                type: transactionItem.sGiftCardNumber ? 'giftcard' : transactionItem.oType.eKind,
                eTransactionItemType: 'regular',
                nBrokenProduct: 0,
                tType,
                oType: transactionItem.oType,
                nonEditable: transactionItem.sGiftCardNumber ? true : false,
                sGiftCardNumber: transactionItem.sGiftCardNumber,
                quantity: transactionItem.nQuantity,
                price: transactionItem.nPriceIncVat,
                discount: 0,
                tax: transactionItem.nVatRate,
                paymentAmount,
                description: '',
                open: true,
              });
            }
          });
          this.iActivityId = transaction.iActivityId || transaction._id;
        }
        this.changeInPayment();
      });
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
    if (!this.payMethods) {
      return 0
    }
    if (total) {
      return _.sumBy(this.payMethods, 'amount') || 0
    }
    return this.payMethods.filter(p => p.amount && p.amount !== 0) || 0
  }

  changeInPayment() {
    let availableAmount = this.getUsedPayMethods(true);
    this.paymentDistributeService.distributeAmount(this.transactionItems, availableAmount);
  }

  clearAll() {
    this.transactionItems = [];
    this.shopProducts = [];
    this.commonProducts = [];
    this.searchKeyword = '';
    this.selectedTransaction = null;
  }

  // nRefundAmount needs to be added
  createTransaction(): void {
    if (this.transactionItems.length < 1) {
      return;
    }
    this.saveInProgress = true;
    const transactionItems = this.transactionItems.map((i) => {
      return new TransactionItem(
        i.name,
        i.comment,
        i.productNumber,
        i.price,
        0, // TODO
        0, // TODO
        null,
        i.tax,
        i.quantity,
        null,

        null,
        i._id,
        i.ean,
        i.articleNumber,
        i.images,
        0, // TODO
        null,
        null,
        null, // TODO: Needed in till??
        this.getValueFromLocalStorage('currentBusiness'),

        i.iArticleGroupId, // TODO
        null,
        null,
        false, // TODO
        false, // TODO
        "CATEGORY", // TODO
        i.sGiftCardNumber, // TODO sGiftCardNumber
        null, // TODO
        null, //TODO

        i.total, // TODO?
        i.total,
        i.paymentAmount || i.total,
        0, // TODO
        i.discount.value > 0,
        i.discount.percent,
        i.discount.value,
        i.nRefundAmount,

        null,
        null,

        null, // TODO
        null, // TODO
        null, //TODO
        i.iBusinessProductId, //TODO business productId
        null,
        'y',
        this.getValueFromLocalStorage('currentWorkstation'),
        this.getValueFromLocalStorage('currentEmployee')._id,
        this.getValueFromLocalStorage('currentLocation'),

        null,
        {
          eTransactionType: 'cash-registry', // TODO
          bRefund: i.oType?.bRefund || i.discount.quantity < 0 || i.price < 0,
          nStockCorrection: i.eTransactionItemType === 'regular' ? i.quantity : i.quantity - i.nBrokenProduct,
          eKind: i.type, // TODO // repair
          bDiscount: i.discount.value > 0,
          bPrepayment: (i.paymentAmount > 0 || this.getUsedPayMethods(true) - this.getTotals('price') < 0) && (i.paymentAmount !== i.amountToBePaid)
        },
        i.iActivityItemId
      )
    });
    const transaction = new Transaction(
      null,
      null,
      this.iActivityId,
      this.getValueFromLocalStorage('currentBusiness'),
      null,
      'cash-register-revenue',
      'y',
      this.getValueFromLocalStorage('currentWorkstation'),
      this.getValueFromLocalStorage('currentEmployee')._id,
      this.getValueFromLocalStorage('currentLocation'),
      null ,
    )

    if (this.customer && this.customer._id) {
      transaction.oCustomer = {
        _id: this.customer._id,
        sFirstName: this.customer.sFirstName,
        sLastName: this.customer.sLastName,
        sPrefix: this.customer.sPrefix
      }
    }

    const body = {
      iBusinessId: this.getValueFromLocalStorage('currentBusiness'),
      iLocationId: this.getValueFromLocalStorage('currentLocation'),
      iDeviceId: '623b6d840ed1002890334456',
      transactionItems: transactionItems,
      oTransaction: transaction,
      payments: this.getUsedPayMethods(false),
    };

    this.apiService.postNew('cashregistry', '/api/v1/till/transaction', body)
      .subscribe(data => {
        this.toastrService.show({ type: 'success', text: 'Transactie gemaakt!' });
        if (this.selectedTransaction) {
          this.deleteParkedTransaction();
        };
        this.saveInProgress = false;
        this.clearAll();
      }, err => {
        this.toastrService.show({ type: 'danger', text: err.message });
        this.saveInProgress = false;
      });
  }

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
        'sArticleNumber',
        'iArticleGroupId',
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
      this.apiService.postNew('core', '/api/v1/products/commonbrand/list', data).subscribe((result: any) => {
        // this.isLoading = false;
        if (result && result.data && result.data.length) {
          const response = result.data[0];
          this.commonProducts = response.result;
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
    this.transactionItems.push({
      name: product.oName ? product.oName['en'] : 'No name',
      eTransactionItemType: 'regular',
      type: this.eKind,
      quantity: 1,
      price: product.nPriceIncludesVat || 0,
      paymentAmount: 0,
      discount: product.nDiscount || 0,
      tax: product.nVatRate || 0,
      description: product.sLabelDescription,
      iArticleGroupId: product.iArticleGroupId,
      iBusinessProductId: product.iBusinessProductId,
      open: true,
    });
  }

  search() {
    this.shopProducts = [];
    this.commonProducts = [];
    // if (searchValue && searchValue.length > 2) {
    //   this.isLoading = true;
    this.listShopProducts(this.searchKeyword, false);
    if (!this.isStockSelected) {
      this.listCommonBrandProducts(this.searchKeyword, false); // Searching for the products of common brand
    }
  }

  addNewLine() {
    this.transactionItems.push({
      name: '',
      type: 'empty-line',
      quantity: 1,
      price: 0,
      discount: 0,
      tax: 0,
      description: '',
      open: true,
    });
  }

  getParkedTransactionBody(): Object {
    const body = {
      aTaxes: this.taxes,
      aTransactionItems: this.transactionItems,
      oCustomer: this.customer,
      // searchKeyword: this.searchKeyword,
      // shopProducts: this.shopProducts,
      iBusinessId: this.businessId,
      iSupplierId: this.supplierId,
      iActivityId: this.iActivityId,
      bIsStockSelected: this.isStockSelected,
      aPayMethods: this.payMethods,
      oBusiness: this.business,
      iLocationId: this.locationId,
      oRequestParams: this.requestParams,
    };
    return body;
  }
  park(): void {
    this.apiService.postNew('cashregistry', `/api/v1/park?iBusinessId=${this.getValueFromLocalStorage('currentBusiness')}`, this.getParkedTransactionBody())
      .subscribe(data => {
        this.toastrService.show({ type: 'success', text: 'Transaction parked!' })
      }, err => {
        this.toastrService.show({ type: 'danger', text: err.message });
      });
    this.clearAll();
  }

  getParkedTransactions() {
    this.apiService.getNew('cashregistry', `/api/v1/park?iBusinessId=${this.getValueFromLocalStorage('currentBusiness')}`)
      .subscribe((data: any) => {
        this.parkedTransactions = data;
      }, err => {
        this.toastrService.show({ type: 'danger', text: err.message });
      });
  }

  fetchParkedTransactionInfo() {
    this.parkedTransactionLoading = true;
    this.apiService.getNew('cashregistry', `/api/v1/park/${this.selectedTransaction._id}?iBusinessId=${this.getValueFromLocalStorage('currentBusiness')}`)
      .subscribe((transactionInfo: any) => {
        this.taxes = transactionInfo.aTaxes;
        this.transactionItems = transactionInfo.aTransactionItems;
        this.customer = transactionInfo.oCustomer;
        // this.searchKeyword = transactionInfo.searchKeyword;
        // this.shopProducts = transactionInfo.shopProducts;
        this.businessId = transactionInfo.iBusinessId;
        this.supplierId = transactionInfo.iSupplierId;
        this.iActivityId = transactionInfo.iActivityId;
        this.isStockSelected = transactionInfo.bIsStockSelected;
        this.payMethods = transactionInfo.aPayMethods;
        this.business = transactionInfo.oBusiness;
        this.locationId = transactionInfo.iLocationId;
        this.requestParams = transactionInfo.oRequestParams;
        this.parkedTransactionLoading = false;
      }, err => {
        this.toastrService.show({ type: 'danger', text: err.message });
        this.parkedTransactionLoading = false;
      });
  }

  updateParkedTransaction() {
    this.apiService.putNew('cashregistry', `/api/v1/park/${this.selectedTransaction._id}?iBusinessId=${this.getValueFromLocalStorage('currentBusiness')}`, this.getParkedTransactionBody())
      .subscribe((data: any) => {
        this.toastrService.show({ type: 'success', text: data.message });
      }, err => {
        this.toastrService.show({ type: 'danger', text: err.message });
      });
  }

  deleteParkedTransaction() {
    let vm = this;
    this.apiService.deleteNew('cashregistry', `/api/v1/park/${this.selectedTransaction._id}?iBusinessId=${this.getValueFromLocalStorage('currentBusiness')}`)
      .subscribe((data: any) => {
        this.toastrService.show({ type: 'success', text: data.message });
        this.parkedTransactions = this.parkedTransactions.filter(function (item) {
          return item._id !== vm.selectedTransaction._id;
        });

        vm.clearAll();
      }, err => {
        this.toastrService.show({ type: 'danger', text: err.message });
      });
  }
}
