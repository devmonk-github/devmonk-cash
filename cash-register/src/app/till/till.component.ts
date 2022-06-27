import { Component, OnInit } from '@angular/core';
import {
  faScrewdriverWrench, faTruck, faBoxesStacked, faGifts,
  faUserPlus, faUser, faTimes, faTimesCircle, faTrashAlt, faRing,
  faCoins, faCalculator, faArrowRightFromBracket, faSpinner, faSearch, faMoneyBill
} from '@fortawesome/free-solid-svg-icons';
import * as _ from 'lodash';

import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '../shared/service/dialog'
import { CustomerDialogComponent } from '../shared/components/customer-dialog/customer-dialog.component';
import { TaxService } from '../shared/service/tax.service';
import { ApiService } from '../shared/service/api.service';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ToastService } from '../shared/components/toast';
import { TransactionsSearchComponent } from '../shared/components/transactions-search/transactions-search.component';
import { PaymentDistributionService } from '../shared/service/payment-distribution.service';
import { TillService } from '../shared/service/till.service';
import { AddExpensesComponent } from '../shared/components/add-expenses-dialog/add-expenses.component';
import { CardsComponent } from '../shared/components/cards-dialog/cards-dialog.component';
import { MorePaymentsDialogComponent } from '../shared/components/more-payments-dialog/more-payments-dialog.component';
import { BarcodeService } from "../shared/service/barcode.service";
import { TerminalService } from '../shared/service/terminal.service';
import { TerminalDialogComponent } from '../shared/components/terminal-dialog/terminal-dialog.component';
import { CreateArticleGroupService } from '../shared/service/create-article-groups.service';

@Component({
  selector: 'app-till',
  templateUrl: './till.component.html',
  styleUrls: ['./till.component.scss']
})
export class TillComponent implements OnInit {
  // icons
  faScrewdriverWrench = faScrewdriverWrench;
  faTruck = faTruck;
  faBoxesStacked = faBoxesStacked;
  faGifts = faGifts;
  faUser = faUser;
  faTimes = faTimes;
  faTimesCircle = faTimesCircle;
  faTrashAlt = faTrashAlt;
  faRing = faRing;
  faCoins = faCoins;
  faCalculator = faCalculator;
  faMoneyBill = faMoneyBill;
  faArrowRightFromBracket = faArrowRightFromBracket;
  faSpinner = faSpinner;
  faSearch = faSearch;
  taxes: Array<any> = [];
  transactionItems: Array<any> = [];
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
  allPaymentMethod: Array<any> = [];
  appliedGiftCards: Array<any> = [];
  redeemedLoyaltyPoints: number = 0;
  business: any = {};
  locationId: string = '';
  payMethodsLoading: boolean = false;
  isGoldForPayments = false;
  requestParams: any = { iBusinessId: '' };
  parkedTransactionLoading = false;
  eKind: string = 'regular';
  parkedTransactions: Array<any> = [];
  terminals: Array<any> = [];
  quickButtons: Array<any> = [
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
  aProjection: Array<any> = [
    'oName',
    'sEan',
    'nVatRate',
    'sProductNumber',
    'nPriceIncludesVat',
    'bDiscountOnPercentage',
    'nDiscount',
    'sLabelDescription',
    'aImage',
    'aProperty',
    'sArticleNumber',
    'iArticleGroupId',
    'iBusinessPartnerId',
    'iBusinessBrandId',
  ];
  discountArticleGroup: any = {};
  saveInProgress = false;
  randNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  constructor(
    private translateService: TranslateService,
    private dialogService: DialogService,
    private taxService: TaxService,
    private paymentDistributeService: PaymentDistributionService,
    private apiService: ApiService,
    private toastrService: ToastService,
    private tillService: TillService,
    private barcodeService: BarcodeService,
    private terminalService: TerminalService,
    private createArticleGroupService: CreateArticleGroupService,
  ) {
  }

  ngOnInit(): void {
    this.business._id = localStorage.getItem('currentBusiness');
    this.locationId = localStorage.getItem('currentLocation') || '';
    this.requestParams.iBusinessId = this.business._id;
    this.taxes = this.taxService.getTaxRates()
    this.getPaymentMethods();
    this.getParkedTransactions();
    this.barcodeService.barcodeScanned.subscribe((barcode: string) => {
      this.toastrService.show({ type: 'success', text: 'Barcode detected: ' + barcode })
    });
    this.loadTransaction();

    this.checkArticleGroups();
  }

  loadTransaction() {
    let fromTransactionPage: any = localStorage.getItem('fromTransactionPage');
    if (fromTransactionPage) {
      fromTransactionPage = JSON.parse(fromTransactionPage);
      this.clearAll();
      const { transactionItems, transaction } = fromTransactionPage;
      this.transactionItems = transactionItems;
      this.iActivityId = transaction.iActivityId || transaction._id;
      this.changeInPayment();
      // localStorage.removeItem('fromTransactionPage')
    }
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
      return localStorage.getItem(key) || '';
    }
  }

  getPaymentMethods() {
    this.payMethodsLoading = true;
    this.payMethods = [];
    const methodsToDisplay = ['card', 'cash', 'bankpayment', 'maestro', 'mastercard', 'visa'];
    this.apiService.getNew('cashregistry', '/api/v1/payment-methods/' + this.requestParams.iBusinessId).subscribe((result: any) => {
      if (result && result.data && result.data.length) {
        this.allPaymentMethod = result.data;
        result.data.forEach((element: any) => {
          if (methodsToDisplay.includes(element.sName.toLowerCase())) {
            this.payMethods.push(_.clone(element));
          }
        });
      }
      this.payMethodsLoading = false;
    }, (error) => {
      this.payMethodsLoading = false;
    })
  }

  addItemToTransaction(item: any): void {
    let article = item
    article.quantity = 1;
    article.nDiscount = 0;
    article.tax = 21;
    article.type = 'product'
    article.description = ''
    this.transactionItems.push(article)
  }

  addOrder(): void {
    this.transactionItems.push({
      eTransactionItemType: 'regular',
      manualUpdate: false,
      index: this.transactionItems.length,
      name: this.searchKeyword,
      type: 'order',
      aImage: [],
      quantity: 1,
      nBrokenProduct: 0,
      price: 0,
      nDiscount: 0,
      tax: 21,
      paymentAmount: 0,
      oArticleGroupMetaData: { aProperty: [], sCategory: '', sSubCategory: '' },
      description: '',
      open: true,
    });
    this.searchKeyword = '';
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
              i.nTotal = i.quantity * i.price - i.nDiscount;
              i.nTotal = i.type === 'gold-purchase' ? -1 * i.nTotal : i.nTotal;
              result += i.nTotal - (i.prePaidAmount || 0);
              // result += type === 'price' ? i.quantity * i.price - i.prePaidAmount || 0 : i[type]
            }
          } else {
            i.paymentAmount = 0;
          }
        });
        break;
      case 'quantity':
        result = _.sumBy(this.transactionItems, 'quantity') || 0
        break;
      case 'discount':
        result = _.sumBy(this.transactionItems, 'nDiscount') || 0
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
    const price = this.randNumber(5, 200);
    this.transactionItems.push({
      isExclude: type === 'repair' ? true : false,
      eTransactionItemType: 'regular',
      manualUpdate: type === 'gold-purchase',
      index: this.transactionItems.length,
      name: this.translateService.instant(type.toUpperCase()),
      type,
      oArticleGroupMetaData: { aProperty: [], sCategory: '', sSubCategory: '' },
      aImage: [],
      quantity: 1,
      nBrokenProduct: 0,
      price,
      nTotal: type === 'gold-purchase' ? -1 * price : price,
      nDiscount: 0,
      tax: 21,
      paymentAmount: type === 'gold-purchase' ? -1 * price : 0,
      description: '',
      open: true,
      iBusinessId: this.getValueFromLocalStorage('currentBusiness'),
      ...(type === 'giftcard') && { sGiftCardNumber: Date.now() },
      ...(type === 'giftcard') && { taxHandling: 'true' },
      ...(type === 'giftcard') && { isGiftCardNumberValid: false },
      ...(type === 'gold-purchase') && { goldFor: { name: 'stock', type: 'goods' } }
    });
  }

  cancelItems(): void {
    if (this.transactionItems.length > 0) {
      const buttons = [
        { text: 'YES', value: true, status: 'success', class: 'btn-primary ml-auto mr-2' },
        { text: 'NO', value: false, class: 'btn-warning' }
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
        this.paymentDistributeService.distributeAmount(this.transactionItems, availableAmount);

        // this.paymentDistributeService.updateAmount(this.transactionItems, availableAmount, index);
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
    this.dialogService.openModal(TransactionsSearchComponent, { cssClass: 'modal-xl', context: { customer: this.customer } })
      .instance.close.subscribe((data) => {
        if (data.transaction) {
          this.clearAll();
          const { transactionItems, transaction } = data;
          this.transactionItems = transactionItems;
          this.iActivityId = transaction.iActivityId || transaction._id;
        }
        this.changeInPayment();
      });
  }

  openCustomerDialog(): void {
    this.dialogService.openModal(CustomerDialogComponent, { cssClass: 'modal-xl', context: { customer: this.customer } })
      .instance.close.subscribe((data) => {
        if (data.customer) {
          this.customer = data.customer;
        }
      })
  }

  getUsedPayMethods(total: boolean): any {
    if (!this.payMethods) {
      return 0
    }
    if (total) {
      return (_.sumBy(this.appliedGiftCards, 'nAmount') || 0) + (_.sumBy(this.payMethods, 'amount') || 0) + this.redeemedLoyaltyPoints;
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
    this.payMethods.map(o => o.amount = null);
    this.appliedGiftCards = [];
    this.redeemedLoyaltyPoints = 0;
  }

  startTerminalPayment() {
    this.dialogService.openModal(TerminalDialogComponent, { cssClass: 'modal-lg', context: { payments: this.payMethods } })
      .instance.close.subscribe((data) => {
        if (data) {
          data.forEach((pay: any) => {
            if (pay.sName === 'Card' && pay.status !== 'SUCCESS') {
              pay.nExpectedAmount = pay.amount;
              pay.amount = 0;
            }
          });
        }
      })
  }
  // nRefundAmount needs to be added
  checkUseForGold() {
    let isGoldForPayment = true;
    const goldTransactionPayments = this.transactionItems.filter(o => o.goldFor?.name === 'cash' || o.goldFor?.name === 'bankpayment');
    goldTransactionPayments.forEach(element => {
      const paymentMethod = this.payMethods.findIndex(o => o.sName.toLowerCase() === element.goldFor.name && o.amount === element.nTotal);
      if (paymentMethod < 0) {
        isGoldForPayment = false;
        this.toastrService.show({ type: 'danger', text: `The amount paid for '${element.goldFor.name}' does not match.` });
      }
    });
    return isGoldForPayment;
  }

  createTransaction(): void {
    const isGoldForCash = this.checkUseForGold();
    if (this.transactionItems.length < 1 || !isGoldForCash) {
      return;
    }

    const giftCardPayment = this.allPaymentMethod.find((o) => o.sName === 'Giftcards');
    this.saveInProgress = true;
    const changeAmount = this.getUsedPayMethods(true) - this.getTotals('price')
    this.dialogService.openModal(TerminalDialogComponent, { cssClass: 'modal-lg', context: { payments: this.payMethods, changeAmount } })
      .instance.close.subscribe((payMethods) => {
        if (!payMethods) {
          this.saveInProgress = false;
        } else {
          payMethods.forEach((pay: any) => {
            if (pay.sName === 'Card' && pay.status !== 'SUCCESS') {
              pay.nExpectedAmount = pay.amount;
              pay.amount = 0;
            }
          });
          // this.changeInPayment();
          const body = this.tillService.createTransactionBody(this.transactionItems, payMethods, this.discountArticleGroup, this.redeemedLoyaltyPoints);
          if (giftCardPayment && this.appliedGiftCards.length > 0) {
            this.appliedGiftCards.forEach(element => {
              const cardPaymethod = _.clone(giftCardPayment);
              cardPaymethod.amount = element.nAmount;
              cardPaymethod.sGiftCardNumber = element.sGiftCardNumber;
              cardPaymethod.type = element.type;
              body.payments.push(cardPaymethod);
            });
            // giftCardPayment.amount = _.sumBy(this.appliedGiftCards, 'nAmount');
            body.giftCards = this.appliedGiftCards;
          }
          body.oTransaction.iActivityId = this.iActivityId;
          if (this.customer && this.customer._id) {
            body.oTransaction.oCustomer = {
              _id: this.customer._id,
              sFirstName: this.customer.sFirstName,
              sLastName: this.customer.sLastName,
              sPrefix: this.customer.sPrefix
            }
          };
          body.redeemedLoyaltyPoints = this.redeemedLoyaltyPoints;
          console.log(body);
          this.apiService.postNew('cashregistry', '/api/v1/till/transaction', body)
            .subscribe((data: any) => {
              this.toastrService.show({ type: 'success', text: data.message });
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
      });
  }

  /* Search API for finding the  common-brands products */
  listShopProducts(searchValue: string | undefined, isFromEAN: boolean | false) {
    let data = {
      iBusinessId: this.business._id,
      skip: 0,
      limit: 10,
      sortBy: '',
      sortOrder: '',
      searchValue: searchValue,
      aProjection: this.aProjection,
      oFilterBy: {
        oStatic: {},
        oDynamic: {}
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
        iBusinessId: this.business._id,
        skip: 0,
        limit: 10,
        sortBy: '',
        sortOrder: '',
        searchValue: searchValue,
        aProjection: this.aProjection,
        oFilterBy: {
          oStatic: {},
          oDynamic: {}
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
    console.log(product);
    this.transactionItems.push({
      name: product.oName ? product.oName['en'] : 'No name',
      eTransactionItemType: 'regular',
      type: this.eKind,
      quantity: 1,
      price: product.nPriceIncludesVat || 0,
      paymentAmount: 0,
      nDiscount: product.nDiscount || 0,
      tax: product.nVatRate || 0,
      sProductNumber: product.sProductNumber,
      sArticleNumber: product.sArticleNumber,
      description: product.sLabelDescription,
      iArticleGroupId: product.iArticleGroupId,
      oArticleGroupMetaData: { aProperty: product.aProperty || [], sCategory: '', sSubCategory: '' },
      iBusinessBrandId: product.iBusinessBrandId,
      iBusinessProductId: product._id,
      iSupplierId: product.iBusinessPartnerId,
      aImage: product.aImage,
      isExclude: false,
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
      type: 'loyalty-points-discount',
      quantity: 1,
      price: 0,
      nDiscount: 0,
      tax: 0,
      description: '',
      open: true,
    });
    // this.transactionItems.push({
    //   name: '',
    //   type: 'empty-line',
    //   quantity: 1,
    //   price: 0,
    //   discount: 0,
    //   tax: 0,
    //   description: '',
    //   open: true,
    // });
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

  openExpenses() {
    this.dialogService.openModal(AddExpensesComponent, { cssClass: 'modal-m', context: {} })
      .instance.close.subscribe(result => {
        console.log(result);
      });
  }

  openCardsModal() {
    this.dialogService.openModal(CardsComponent, { cssClass: 'modal-lg', context: { customer: this.customer } })
      .instance.close.subscribe(result => {
        if (result) {
          if (result.giftCardInfo.nAmount > 0) {
            this.appliedGiftCards.push(result.giftCardInfo);
            this.changeInPayment();
          }
          if (result.redeemedLoyaltyPoints && result.redeemedLoyaltyPoints > 0) {
            this.addReedemedPoints(result.redeemedLoyaltyPoints);
          }
        }
      });
  }


  openMorePaymentMethodModal() {
    this.dialogService.openModal(MorePaymentsDialogComponent, { cssClass: 'modal-l', context: this.allPaymentMethod })
      .instance.close.subscribe(result => {
        if (result) {
          this.payMethods.push(_.clone(result));
        }
      });
  }

  removeGift(index: any) {
    this.appliedGiftCards.splice(index, 1);
  }

  fetchTerminals() {
    let cardPayments = ['card'];
    this.terminalService.getTerminals()
      .subscribe((res) => {
        this.terminals = res;
        if (1 > this.terminals.length) {
          cardPayments = ['maestro', 'mastercard', 'visa'];
        }
        this.allPaymentMethod.forEach((element: any) => {
          if (cardPayments.includes(element.sName.toLowerCase())) {
            this.payMethods.push(_.clone(element));
          }
        });
      }, err => {
        this.toastrService.show({ type: 'danger', text: err.message });
      });
  }

  addReedemedPoints(redeemedLoyaltyPoints: number) {
    this.transactionItems.push({
      name: 'Loyalty Points',
      type: 'loyalty-points',
      eTransactionType: 'loyalty-points',
      quantity: 1,
      redeemedLoyaltyPoints,
      price: 0,
      nDiscount: 0,
      tax: 0,
      description: '',
      oArticleGroupMetaData: { aProperty: [], sCategory: '', sSubCategory: '' },
      open: true,
    });
    this.redeemedLoyaltyPoints = redeemedLoyaltyPoints;
    // ../assets/images/no-photo-available.jpg
  }

  openDayState() {
    const oBody = {
      iBusinessId: this.business._id,
      iLocationId: this.locationId
    }
    this.apiService.postNew('cashregistry', `/api/v1/statistics/open/day-state`, oBody).subscribe((result: any) => {
      this.toastrService.show({ type: 'success', text: `Day-state is open now` });
    }, (error) => {
      this.toastrService.show({ type: 'warning', text: `Day-state is not open` });
    })
  }

  closeDayState() {
    const oBody = {
      iBusinessId: this.business._id,
      iLocationId: this.locationId
    }
    this.apiService.postNew('cashregistry', `/api/v1/statistics/close/day-state`, oBody).subscribe((result: any) => {
      this.toastrService.show({ type: 'success', text: `Day-state is close now` });
    }, (error) => {
      this.toastrService.show({ type: 'warning', text: `Day-state is not closed` });
    })
  }

  checkArticleGroups() {
    this.createArticleGroupService.checkArticleGroups('Discount')
      .subscribe((res: any) => {
        if (1 > res.data.length) {
          this.createArticleGroup();
        } else {
          this.discountArticleGroup = res.data[0].result[0];
        }
      }, err => {
        this.toastrService.show({ type: 'danger', text: err.message });
      });
  }

  createArticleGroup() {
    this.createArticleGroupService.createArticleGroup({ name: 'Discount', sCategory: 'Discount', sSubCategory: 'Discount' })
      .subscribe((res: any) => {
        this.discountArticleGroup = res.data[0].result[0];
      },
        err => {
          this.toastrService.show({ type: 'danger', text: err.message });
        });
  }
}
