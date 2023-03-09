import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { faArrowRightFromBracket, faBoxesStacked, faCalculator, faCoins, faCopy, faGifts, faMoneyBill, faRing, faRotateLeft, faScrewdriverWrench, faSearch, faSpinner, faTimes, faTimesCircle, faTrashAlt, faTruck, faUser } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { Observable, Subject, Subscription } from 'rxjs';

import * as JsBarcode from 'jsbarcode';
import * as _moment from 'moment';
import { AddExpensesComponent } from '../shared/components/add-expenses-dialog/add-expenses.component';
import { CardsComponent } from '../shared/components/cards-dialog/cards-dialog.component';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { CustomerDialogComponent } from '../shared/components/customer-dialog/customer-dialog.component';
import { MorePaymentsDialogComponent } from '../shared/components/more-payments-dialog/more-payments-dialog.component';
import { TerminalDialogComponent } from '../shared/components/terminal-dialog/terminal-dialog.component';
import { ToastService } from '../shared/components/toast';
import { TransactionActionDialogComponent } from '../shared/components/transaction-action-dialog/transaction-action-dialog.component';
import { TransactionItemsDetailsComponent } from '../shared/components/transaction-items-details/transaction-items-details.component';
import { TransactionsSearchComponent } from '../shared/components/transactions-search/transactions-search.component';
import { ApiService } from '../shared/service/api.service';
import { BarcodeService } from "../shared/service/barcode.service";
import { CreateArticleGroupService } from '../shared/service/create-article-groups.service';
import { CustomerStructureService } from '../shared/service/customer-structure.service';
import { DialogComponent, DialogService } from '../shared/service/dialog';
import { FiskalyService } from '../shared/service/fiskaly.service';
import { PaymentDistributionService } from '../shared/service/payment-distribution.service';
import { ReceiptService } from '../shared/service/receipt.service';
import { TaxService } from '../shared/service/tax.service';
import { TerminalService } from '../shared/service/terminal.service';
import { TillService } from '../shared/service/till.service';
import { MenuComponent } from '../shared/_layout/components/common';
import { SupplierWarningDialogComponent } from './dialogs/supplier-warning-dialog/supplier-warning-dialog.component';
import { HttpClient } from '@angular/common/http';
const moment = (_moment as any).default ? (_moment as any).default : _moment;
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs/operators';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-till',
  templateUrl: './till.component.html',
  styleUrls: ['./till.component.scss'],
  providers: [BarcodeService],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('0ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class TillComponent implements OnInit, AfterViewInit, OnDestroy {

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
  faCopy = faCopy;
  faRotateLeft = faRotateLeft;
  taxes: any = [];
  transactionItems: Array<any> = [];
  selectedTransaction: any = null;
  customer: any = null;
  searchKeyword: any;
  shopProducts: any;
  commonProducts: any;
  supplierId!: string;
  iActivityId!: string;
  sNumber !: string;
  isStockSelected = true;
  payMethods: Array<any> = [];
  allPaymentMethod: Array<any> = [];
  appliedGiftCards: Array<any> = [];
  redeemedLoyaltyPoints: number = 0;
  business: any = {};
  payMethodsLoading: boolean = false;
  isGoldForPayments = false;
  requestParams: any = { iBusinessId: '' };
  parkedTransactionLoading = false;
  eKind: string = 'regular';
  parkedTransactions: Array<any> = [];
  terminals: Array<any> = [];
  quickButtons: Array<any> = [];
  fetchingProductDetails: boolean = false;
  bSearchingProduct: boolean = false;
  bIsPreviousDayStateClosed: boolean = true;
  bIsDayStateOpened: boolean = false; // Not opened then require to open it first
  bDayStateChecking: boolean = false;
  dOpenDate: any = '';
  aBusinessLocation: any = [];

  transaction: any = {};
  activityItems: any = {};
  amountDefined: any;
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
    'aLocation',
    'sArticleNumber',
    'iArticleGroupId',
    'iBusinessPartnerId',
    'sBusinessPartnerName',
    'iBusinessBrandId',
    'nPurchasePrice',
    'iBrandId',
  ];
  discountArticleGroup: any = {};
  saveInProgress = false;
  @ViewChild('searchField') searchField!: ElementRef;
  selectedQuickButton: any;
  getSettingsSubscription !: Subscription;
  dayClosureCheckSubscription !: Subscription;
  businessDetails: any;
  printActionSettings: any;
  printSettings: any;
  activity: any;
  bIsOpeningDayState: boolean = false;
  selectedLanguage: any = localStorage.getItem('language') ? localStorage.getItem('language') : 'en';
  bHasIActivityItemId: boolean = false;
  bSerialSearchMode = false;
  employee: any;
  bIsFiscallyEnabled: boolean = false;
  bDisablePrepayment: boolean = true;
  bAllGiftcardPaid: boolean = true;

  // paymentChanged: Subject<any> = new Subject<any>();
  availableAmount: any;
  nFinalAmount: number = 0;
  nItemsTotalToBePaid: number = 0;
  nTotalPayment: number = 0;
  oStaticData: any;

  iBusinessId = localStorage.getItem('currentBusiness') || '';
  iLocationId = localStorage.getItem('currentLocation') || '';
  iWorkstationId = localStorage.getItem('currentWorkstation') || '';

  /* Check if saving points are enabled */
  savingPointsSetting: boolean = JSON.parse(localStorage.getItem('savingPoints') || '');

  bIsTransactionLoading = false;

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
    public tillService: TillService,
    private barcodeService: BarcodeService,
    private terminalService: TerminalService,
    private createArticleGroupService: CreateArticleGroupService,
    private customerStructureService: CustomerStructureService,
    private fiskalyService: FiskalyService,
    private receiptService: ReceiptService,
    private http: HttpClient
  ) {

    // import(
    //   `@angular/common/locales/${this.selectedLanguage}.js`
    // ).then(module => registerLocaleData(module.default))

    // this.translateService.onLangChange
    //   .subscribe((langChangeEvent: LangChangeEvent) => {
    //     import(
    //       `@angular/common/locales/${langChangeEvent.lang}.js`
    //     ).then(module => registerLocaleData(module.default))
    //   })

  }
  async ngOnInit() {
    this.apiService.setToastService(this.toastrService)
    this.paymentDistributeService.setToastService(this.toastrService)
    this.tillService.updateVariables();
    this.checkDayState();

    this.requestParams.iBusinessId = this.iBusinessId;
    let taxDetails: any = await this.taxService.getLocationTax({ iLocationId: this.iLocationId });
    if (taxDetails) {
      this.taxes = taxDetails?.aRates || [];
    } else {
      setTimeout(async () => {
        taxDetails = await this.taxService.getLocationTax({ iLocationId: this.iLocationId });
        this.taxes = taxDetails?.aRates || [];
      }, 1000);
    }
    this.getPaymentMethods();
    this.getParkedTransactions();

    this.barcodeService.barcodeScanned.subscribe((barcode: string) => {
      this.openModal(barcode);
    });

    this.checkArticleGroups();

    if (this.bIsDayStateOpened) this.fetchQuickButtons();

    const currentEmployeeId = JSON.parse(localStorage.getItem('currentUser') || '')['userId'];

    const _businessData: any = await this.getBusinessDetails().toPromise();
    this.businessDetails = _businessData.data;
    this.aBusinessLocation = this.businessDetails?.aLocation || [];
    this.businessDetails.currentLocation = this.businessDetails?.aLocation?.find((location: any) => location?._id === this.iLocationId);
    this.tillService.selectCurrency(this.businessDetails.currentLocation);
    // this.getPrintSettings(true)
    this.getPrintSettings()
    this.getEmployee(currentEmployeeId)

    this.mapFiscallyData()

    setTimeout(() => {
      MenuComponent.bootstrap();
    });

  }

  async mapFiscallyData() {
    let _fiscallyData: any;
    try {
      _fiscallyData = await this.fiskalyService.getTSSList();
    } catch (err) {
      // console.log('error while executing fiskaly service', err)
    }
    if (_fiscallyData) {

      this.businessDetails.aLocation.forEach((location: any) => {
        const oMatch = _fiscallyData.find((tss: any) => tss.iLocationId === location._id)
        if (oMatch) {
          location.tssInfo = oMatch.tssInfo;
          location.bIsFiskalyEnabled = oMatch.bEnabled;
        }
      });
      if (this.businessDetails.currentLocation?.tssInfo && this.businessDetails.currentLocation?.bIsFiskalyEnabled) {
        this.bIsFiscallyEnabled = true;
        this.cancelFiskalyTransaction();
        this.fiskalyService.setTss(this.businessDetails.currentLocation?.tssInfo._id)
      }
    }

    this.loadTransaction();
  }

  ngAfterViewInit() {
    if (this.searchField)
      this.searchField.nativeElement.focus();
  }
  // async getfiskalyInfo() {
  //   const tssId = await this.fiskalyService.fetchTSS();
  // }

  onSelectRegular() {
    this.shopProducts = []; this.commonProducts = []; this.eKind = 'regular'; this.isStockSelected = true
  }
  onSelectOrder() {
    this.shopProducts = []; this.commonProducts = []; this.eKind = 'order'; this.isStockSelected = false
    if (this.searchField)
      this.searchField.nativeElement.focus();
  }

  loadTransaction() {
    const fromTransactionPage: any = localStorage.getItem('fromTransactionPage');
    if (fromTransactionPage) {
      this.handleTransactionResponse(JSON.parse(fromTransactionPage));
    } else {
      this.bIsTransactionLoading = false;
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
    const methodsToDisplay = ['card', 'cash', 'bankpayment', 'maestro', 'mastercard', 'visa', 'pin', 'creditcard'];
    this.apiService.getNew('cashregistry', '/api/v1/payment-methods/' + this.requestParams.iBusinessId).subscribe((result: any) => {
      if (result && result.data && result.data.length) {
        this.allPaymentMethod = result.data.map((v: any) => ({ ...v, isDisabled: false }));
        this.allPaymentMethod.forEach((element: any) => {
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

  async addOrder(product: any) {
    let tax = Math.max(...this.taxes.map((tax: any) => tax.nRate), 0);
    this.transactionItems.push({
      eTransactionItemType: 'regular',
      // manualUpdate: false,
      isExclude: false,
      index: this.transactionItems.length,
      name: this.searchKeyword,
      oType: { bRefund: false, bDiscount: false, bPrepayment: false },
      type: 'order',
      aImage: [],
      quantity: 1,
      nBrokenProduct: 0,
      price: 0,
      nPurchasePrice: 0,
      nMargin: 1,
      nDiscount: 0,
      tax: tax,
      paymentAmount: 0,
      oArticleGroupMetaData: { aProperty: [], sCategory: '', sSubCategory: '', oName: {}, oNameOriginal: {} },
      description: '',
      sServicePartnerRemark: '',
      sCommentVisibleServicePartner: '',
      eEstimatedDateAction: 'call_on_ready',
      open: true,
      new: true,
      isFor: 'create',
      eActivityItemStatus: 'new'
    });
    this.searchKeyword = '';
    this.clearPaymentAmounts();
    await this.updateFiskalyTransaction('ACTIVE', []);
  }

  updateAmountVariables() {
    this.nItemsTotalToBePaid = this.getTotals('price');
    this.nTotalPayment = this.totalPrepayment();
    this.nFinalAmount = Math.abs(this.availableAmount - this.nItemsTotalToBePaid);

    // console.log({ nItemsTotalToBePaid: this.nItemsTotalToBePaid })
    // console.log({ nTotalPayment: this.nTotalPayment })
    // console.log({ nFinalAmount: this.nFinalAmount })
    // console.log({ availableAmount: this.availableAmount })
  }

  getTotals(type: string): number {
    this.amountDefined = this.payMethods.find((pay) => pay.amount || pay.amount?.toString() === '0');
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
              const price = (typeof i.price === 'string') ? i.price.replace(',', '.') : i.price;
              let discountPrice = i.bDiscountOnPercentage ? (price - (price * ((i.nDiscount || 0) / 100))) : (price - i.nDiscount);
              i.nTotal = i.quantity * discountPrice;
              i.nTotal = i.type === 'gold-purchase' ? -1 * i.nTotal : i.nTotal;
              result += i.nTotal - (i.prePaidAmount || 0);
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
        let sum = 0;
        this.transactionItems.forEach(element => {
          let discountPrice = element.bDiscountOnPercentage ? (element.price * ((element.nDiscount || 0) / 100)) : element.nDiscount;
          sum += element.quantity * discountPrice;
        });
        result = sum;
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

  checkout(): any {
    if (this.transactionItems?.length) {
      const items = this.transactionItems.filter((item: any) => {
        if (item?.isExclude) return item;
      })
      if (items?.length == this.transactionItems?.length) return false
      else if (this.amountDefined && this.bAllGiftcardPaid) return false;
      else return true
    } else {
      return true;
    }
  }
  async addItem(type: string) {
    // console.log('add item,', type, type==='repair')

    const price = (type === 'giftcard') ? 5 : 0;
    const tax = Math.max(...this.taxes.map((tax: any) => tax.nRate), 0);

    this.transactionItems.push({
      isExclude: type === 'repair',
      manualUpdate: type === 'gold-purchase',
      eTransactionItemType: 'regular',
      index: this.transactionItems.length,
      name: this.translateService.instant(type.toUpperCase()),
      type,
      oType: { bRefund: false, bDiscount: false, bPrepayment: false },
      oArticleGroupMetaData: { aProperty: [], sCategory: '', sSubCategory: '', oName: {}, oNameOriginal: {} },
      aImage: [],
      quantity: 1,
      nBrokenProduct: 0,
      price,
      nMargin: 1,
      nPurchasePrice: 0,
      nTotal: type === 'gold-purchase' ? -1 * price : price,
      nDiscount: 0,
      tax: tax,
      paymentAmount: type === 'gold-purchase' ? -1 * price : 0,
      description: '',
      sServicePartnerRemark: '',
      sCommentVisibleServicePartner: '',
      eActivityItemStatus: 'new',
      eEstimatedDateAction: 'call_on_ready',
      open: true,
      new: true,
      iBusinessId: this.iBusinessId,
      ...(type === 'giftcard') && { sGiftCardNumber: Date.now() },
      ...(type === 'giftcard') && { bGiftcardTaxHandling: 'true' },
      ...(type === 'giftcard') && { isGiftCardNumberValid: false },
      ...(type === 'gold-purchase') && { oGoldFor: { name: 'stock', type: 'goods' } }
    });
    this.clearPaymentAmounts();
    // console.log('added item', this.transactionItems[0].isExclude, this.transactionItems[0])
    await this.updateFiskalyTransaction('ACTIVE', []);
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
      }).instance.close.subscribe(result => {
        if (result) {
          this.transactionItems = []
          this.clearAll();
        }
      }
      )
    }
    this.resetSearch();
  }

  itemChanged(event: any, index: number): void {
    // console.log('itemChanged: ', event);
    switch (event.type) {
      case 'delete':
        // console.log('itemChanged delete')
        this.transactionItems.splice(index, 1);
        this.clearPaymentAmounts();
        break;
      case 'update':
        // console.log('itemChanged update')
        this.clearPaymentAmounts();
        // this.paymentDistributeService.distributeAmount(this.transactionItems, this.getUsedPayMethods(true));
        break;
      case 'prepaymentChange':
        this.paymentDistributeService.distributeAmount(this.transactionItems, this.getUsedPayMethods(true));
        this.updateAmountVariables();
        break;
      case 'duplicate':
        const tItem = Object.create(this.transactionItems[index]);
        tItem.sGiftCardNumber = Date.now();
        this.transactionItems.push(tItem);
        this.clearPaymentAmounts();
        break;
      case 'settingsChanged':
        this.tillService.settings.currentLocation.nLastBagNumber = Number(event.data);
        break;
      default:
        this.transactionItems[index] = event.data;
        this.clearPaymentAmounts();
        break;
    }
    this.updateFiskalyTransaction('ACTIVE', []);
  }

  createGiftCard(item: any, index: number): void {
    const body = {
      iBusinessId: this.iBusinessId,
      iLocationId: this.iLocationId,

      // Do we still need to keep this hard code value here?
      iCustomerId: this.customer?._id,

      sGiftCardNumber: this.transactionItems[index].sGiftCardNumber,
      eType: '',
      nPriceIncVat: this.transactionItems[index].price,
      nPurchasePrice: this.transactionItems[index].price / 1.21,
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

  openTransactionSearchDialog() {
    // console.log('open transaction search dialog')
    this.dialogService.openModal(TransactionsSearchComponent, { cssClass: 'modal-xl', context: { customer: this.customer } })
      .instance.close.subscribe(async (data) => {
        // console.log('response of transaction search component', data)
        if (data?.transaction) {
          this.bIsTransactionLoading = true;
          // / Finding BusinessProduct and their location and stock. Need to show in the dropdown of location choosing /
          if (data?.transactionItems?.length) {
            let aBusinessProduct: any = [];
            const _aBusinessProduct: any = await this.getBusinessProductList(data?.transactionItems.map((el: any) => el.iBusinessProductId)).toPromise();
            if (_aBusinessProduct?.data?.length && _aBusinessProduct.data[0]?.result?.length) aBusinessProduct = _aBusinessProduct.data[0]?.result;
            data.transactionItems = data.transactionItems?.map((oTI: any) => {
              // / assigning the BusinessProduct location to transction-item /
              const oFoundProdLoc = aBusinessProduct?.find((oBusinessProd: any) => oBusinessProd?._id?.toString() === oTI?.iBusinessProductId?.toString());
              if (oFoundProdLoc?.aLocation?.length) {
                oTI.aLocation = oFoundProdLoc.aLocation?.map((oProdLoc: any) => {
                  const oFound: any = this.aBusinessLocation?.find((oBusLoc: any) => oBusLoc?._id?.toString() === oProdLoc?._id?.toString());
                  oProdLoc.sName = oFound?.sName;
                  return oProdLoc;
                });
              }
              oTI.oCurrentLocation = oTI.aLocation?.find((o: any) => o._id === oTI.iLocationId);
              return oTI;
            })
          }

          this.handleTransactionResponse(data);
        }
        // this.changeInPayment();
      });
  }

  openCustomerDialog(): void {
    this.dialogService.openModal(CustomerDialogComponent, { cssClass: 'modal-xl', context: { customer: this.customer } })
      .instance.close.subscribe((data) => {
        if (data.customer) {
          this.customer = data.customer;
          console.log(this.customer)
        }
      })
  }

  fetchCustomer(customerId: any) {
    this.apiService.getNew('customer', `/api/v1/customer/${customerId}?iBusinessId=${this.iBusinessId}`).subscribe(
      (result: any) => {
        const customer = result;
        customer['NAME'] = this.customerStructureService.makeCustomerName(customer);
        customer['SHIPPING_ADDRESS'] = this.customerStructureService.makeCustomerAddress(customer.oShippingAddress, false);
        customer['INVOICE_ADDRESS'] = this.customerStructureService.makeCustomerAddress(customer.oInvoiceAddress, false);
        customer['EMAIL'] = customer.sEmail;
        customer['PHONE'] = (customer.oPhone && customer.oPhone.sLandLine ? customer.oPhone.sLandLine : '') + (customer.oPhone && customer.oPhone.sLandLine && customer.oPhone.sMobile ? ' / ' : '') + (customer.oPhone && customer.oPhone.sMobile ? customer.oPhone.sMobile : '');
        this.customer = customer;
        // this.close({ action: true });
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  /* A payment which made */
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
    this.availableAmount = this.getUsedPayMethods(true);
    this.paymentDistributeService.distributeAmount(this.transactionItems, this.availableAmount);
    this.allPaymentMethod = this.allPaymentMethod.map((v: any) => ({ ...v, isDisabled: true }));
    this.payMethods.map(o => o.isDisabled = true);
    const paidAmount = _.sumBy(this.payMethods, 'amount') || 0;

    const aGiftcard = this.transactionItems.filter((v: any) => v.type == 'giftcard');
    this.bAllGiftcardPaid = aGiftcard.every((el: any) => el.paymentAmount == el.amountToBePaid)

    if (paidAmount === 0) {
      this.payMethods.map(o => o.isDisabled = false);
    }
    // console.log('change in payment in cash ', this.transactionItems)
    this.transactionItems = [...this.transactionItems]
    this.updateAmountVariables();
  }

  clearAll() {
    this.transactionItems = [];
    this.shopProducts = [];
    this.commonProducts = [];
    this.searchKeyword = '';
    this.selectedTransaction = null;
    this.payMethods.map(o => { o.amount = null, o.isDisabled = false });
    this.appliedGiftCards = [];
    this.redeemedLoyaltyPoints = 0;
    this.iActivityId = '';
    this.sNumber = '';
    this.customer = null;
    this.saveInProgress = false;
    this.clearPaymentAmounts();
    localStorage.removeItem('fromTransactionPage');
  }

  clearPaymentAmounts() {
    // console.log('this.transactionItems: ', this.transactionItems);

    this.transactionItems.forEach((item: any) => {
      item.paymentAmount = 0;

      if (item.type === 'repair' || item.type === 'order') {
        if (item?.prepaymentTouched) {
          item.manualUpdate = false;
          item.prepaymentTouched = false;
        }
      } else {
        item.isExclude = false;
        item.manualUpdate = (item.type === 'gold-purchase') ? true : false;
      }
    })

    this.payMethods.map(o => { o.amount = null, o.isDisabled = false });
    this.availableAmount = this.getUsedPayMethods(true);
    this.paymentDistributeService.distributeAmount(this.transactionItems, this.availableAmount);
    this.updateAmountVariables();
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
    const goldTransactionPayments = this.transactionItems.filter(o => o.oGoldFor?.name === 'cash' || o.oGoldFor?.name === 'bankpayment');
    goldTransactionPayments.forEach(element => {
      const paymentMethod = this.payMethods.findIndex(o => o.sName.toLowerCase() === element.oGoldFor.name && o.amount === element.amountToBePaid);
      if (paymentMethod < 0) {
        isGoldForPayment = false;
        // this.toastrService.show({ type: 'danger', text: `The amount paid for '${element.oGoldFor.name}' does not match.` });
        this.toastrService.show({
          type: 'danger',
          text: `You selected '${element.oGoldFor.name}' as a administrative procedure for this gold purchase. 
        If your administration supports special rules for 'VAT' processing on gold purchases please remove all the other products/items on this purchase. 
        In case you're following the 'regular' procedure like most retailers (95%): Change the option 'Cash/Bank' to 'Stock/Repair/Giftcard/Order' on the gold purchase item's dropdown. 
        You can still give cash to your customer or select bank (transfer) as a method. 
        In that case on paper the governement handles this 'gold purchase' as an exchange to goods (which may be done on a different transaction.`,
          noAutoClose: true
        });
      }
    });
    return isGoldForPayment;
  }

  getRelatedTransactionItem(iActivityItemId: string, iTransactionItemId: string, index: number) {
    return this.apiService.getNew('cashregistry', `/api/v1/transaction/item/activityItem/${iActivityItemId}?iBusinessId=${this.iBusinessId}&iTransactionItemId=${iTransactionItemId}`).toPromise();
  }

  getRelatedTransaction(iActivityId: string, iTransactionId: string) {
    const body = {
      iBusinessId: this.iBusinessId,
      iTransactionId: iTransactionId
    }
    return this.apiService.postNew('cashregistry', '/api/v1/transaction/activity/' + iActivityId, body);
  }

  createTransaction() {
    const isGoldForCash = this.checkUseForGold();
    if (this.transactionItems.length < 1 || !isGoldForCash) {
      return;
    }
    const giftCardPayment = this.allPaymentMethod.find((o) => o.sName === 'Giftcards');
    this.saveInProgress = true;
    const nTotalToPay = this.getTotals('price');
    const nEnteredAmountTotal = this.getUsedPayMethods(true);

    if (nTotalToPay < 0) {
      let nDiff = parseFloat((nTotalToPay - nEnteredAmountTotal).toFixed(2));
      if (nDiff < -0.02 || nDiff > 0.02) {
        this.toastrService.show({ type: 'warning', text: `We do not allow prepayment on negative transactions and also we do not support negative change money.` });
        this.saveInProgress = false;
        return;
      }
    }
    const changeAmount = nEnteredAmountTotal - nTotalToPay
    this.dialogService.openModal(TerminalDialogComponent, { cssClass: 'modal-lg', context: { payments: this.payMethods, changeAmount } })
      .instance.close.subscribe(async (payMethods: any) => {
        if (!payMethods) {
          this.saveInProgress = false;
          this.clearPaymentAmounts();
        } else {
          payMethods.forEach((pay: any) => {
            if (pay.sName === 'Card' && pay.status !== 'SUCCESS') {
              pay.nExpectedAmount = pay.amount;
              pay.amount = 0;
            }
          });
          // payMethods = payMethods.filter((o: any) => o.amount !== 0);
          let availableAmount = _.sumBy(payMethods, 'amount') || 0;
          this.paymentDistributeService.distributeAmount(this.transactionItems, availableAmount);
          this.transactionItems = [...this.transactionItems.filter((item: any) => item.type !== 'empty-line')]
          const body = this.tillService.createTransactionBody(this.transactionItems, payMethods, this.discountArticleGroup, this.redeemedLoyaltyPoints, this.customer);
          console.log('body: ', body);
          if (body.transactionItems.filter((item: any) => item.oType.eKind === 'repair')[0]?.iActivityItemId) {
            this.bHasIActivityItemId = true
          }
          if (giftCardPayment && this.appliedGiftCards.length > 0) {
            this.appliedGiftCards.forEach(element => {
              const cardPaymethod = _.clone(giftCardPayment);
              cardPaymethod.amount = element.nAmount;
              cardPaymethod.sGiftCardNumber = element.sGiftCardNumber;
              cardPaymethod.iArticleGroupId = element.iArticleGroupId;
              cardPaymethod.iArticleGroupOriginalId = element.iArticleGroupOriginalId;
              cardPaymethod.type = element.type;
              body.payments.push(cardPaymethod);
            });
            body.giftCards = this.appliedGiftCards;
          }
          body.oTransaction.iActivityId = this.iActivityId;
          let result = body.transactionItems.map((a: any) => a.iBusinessPartnerId);
          const uniq = [...new Set(_.compact(result))];
          if (this.appliedGiftCards?.length) this.tillService.createGiftcardTransactionItem(body, this.discountArticleGroup);

          const oDialogComponent: DialogComponent = this.dialogService.openModal(TransactionActionDialogComponent, {
            cssClass: 'modal-lg', hasBackdrop: true, closeOnBackdropClick: true, closeOnEsc: true,
          }).instance;

          if (this.bIsFiscallyEnabled) {
            const result: any = await this.fiskalyService.updateFiskalyTransaction(this.transactionItems, _.clone(body.payments), 'FINISHED');
            if (result) {
              localStorage.removeItem('fiskalyTransaction');
              body.oTransaction.sFiskalyTxId = result._id;
            }
          }

          this.apiService.postNew('cashregistry', '/api/v1/till/transaction', body).subscribe(async (data: any) => {

            // this.toastrService.show({ type: 'success', text: 'Transaction created.' });
            this.saveInProgress = false;
            const { transaction, aTransactionItems, activityItems, activity } = data;
            transaction.aTransactionItems = aTransactionItems;
            transaction.activity = activity;
            this.transaction = transaction;
            this.activityItems = activityItems;
            this.activity = activity;

            if (this.tillService.settings.currentLocation?.bAutoIncrementBagNumbers) {
              this.tillService.updateSettings();
            }


            this.transaction.aTransactionItems.map((tItem: any) => {
              for (const aItem of this.activityItems) {
                if (aItem.iTransactionItemId === tItem._id) {
                  tItem.sActivityItemNumber = aItem.sNumber;
                  break;
                }
              }
            });

            const bOpenCashDrawer = payMethods.some((m: any) => m.sName === 'Cash' && m.remark != 'CHANGE_MONEY');
            if (bOpenCashDrawer && this.tillService.settings.bOpenCashDrawer) this.openDrawer();

            this.handleReceiptPrinting(oDialogComponent);


            setTimeout(() => {
              this.saveInProgress = false;
              this.fetchBusinessPartnersProductCount(uniq);
            }, 100);
            if (this.selectedTransaction) {
              this.deleteParkedTransaction();
            };

          }, err => {
            this.toastrService.show({ type: 'danger', text: err.message });
            this.saveInProgress = false;
          });
        }
      });
  }

  getEmployee(id: any) {
    if (id != '') {
      this.apiService.getNew('auth', `/api/v1/employee/${id}?iBusinessId=${this.iBusinessId}`).subscribe((result: any) => {
        this.employee = result?.data;
      });
    }
  }


  async handleReceiptPrinting(oDialogComponent: DialogComponent) {
    this.transaction.businessDetails = this.businessDetails;
    this.transaction.currentLocation = this.businessDetails.currentLocation;
    this.transaction = await this.tillService.processTransactionForPdfReceipt(this.transaction);

    let oDataSource = JSON.parse(JSON.stringify(this.transaction));
    let nTotalOriginalAmount = 0;
    oDataSource.aTransactionItems.forEach((item: any) => {
      nTotalOriginalAmount += item.nPriceIncVatAfterDiscount;
      let description = (item?.totalPaymentAmount != item?.nPriceIncVatAfterDiscount) ? `${this.translateService.instant('ORIGINAL_AMOUNT_INC_DISC')}: ${item.nPriceIncVatAfterDiscount}\n` : '';
      if (item?.related?.length) {
        description += `${this.translateService.instant('ALREADY_PAID')}: \n${item.sTransactionNumber} | ${item.nRevenueAmount} (${this.translateService.instant('THIS_RECEIPT')})\n`;

        item.related.forEach((related: any) => {
          description += `${related.sTransactionNumber} | ${related.nRevenueAmount}\n`;
        });
      }

      item.description = description;
    });
    // oDataSource.bHasPrePayments = true;
    oDataSource.sActivityNumber = oDataSource.activity.sNumber;
    oDataSource.nTotalOriginalAmount = nTotalOriginalAmount;
    oDataSource.sBarcodeURI = this.generateBarcodeURI(false, oDataSource.sNumber);
    oDataSource.sActivityBarcodeURI = this.generateBarcodeURI(false, oDataSource.sActivityNumber);

    const aUniqueItemTypes = [];

    const nRepairCount = oDataSource.aTransactionItemType.filter((e: any) => e === 'repair')?.length;
    const nOrderCount = oDataSource.aTransactionItemType.filter((e: any) => e === 'order')?.length;

    const bRegularCondition = oDataSource.total >= 0.02 || oDataSource.total <= -0.02;
    const bOrderCondition = nOrderCount === 1 && nRepairCount === 1 || nRepairCount > 1 || nOrderCount >= 1;
    const bRepairCondition = nRepairCount === 1 && nOrderCount === 0;
    const bRepairAlternativeCondition = nRepairCount >= 1 && nOrderCount >= 1;

    if (bRegularCondition) aUniqueItemTypes.push('regular')

    if (bOrderCondition) aUniqueItemTypes.push('order');

    aUniqueItemTypes.push(...['repair', 'repair_alternative', 'giftcard']);

    // oDataSource.businessDetails = this.businessDetails;
    // oDataSource.currentLocation = this.businessDetails.currentLocation;

    const [_template, _oLogoData]: any = await Promise.all([
      this.getTemplate(aUniqueItemTypes),
      // if no logo is there, use a default logo. or show a message: please upload your shop logo
      this.getBase64FromUrl(oDataSource?.businessDetails?.sLogoLight),
    ]);

    oDataSource.sAdvisedEmpFirstName = this.employee?.sFirstName || 'a';
    oDataSource.sBusinessLogoUrl = _oLogoData.data;
    if (oDataSource.oCustomer && oDataSource.oCustomer.bCounter === true) {
      oDataSource.oCustomer = {};
    } else {
      oDataSource.oCustomer = {
        sFirstName: oDataSource.oCustomer.sFirstName,
        sLastName: oDataSource.oCustomer.sLastName,
        sEmail: oDataSource.oCustomer.sEmail,
        sMobile: oDataSource.oCustomer.oPhone?.sCountryCode + oDataSource.oCustomer.oPhone?.sMobile,
        sLandLine: oDataSource.oCustomer.oPhone?.sLandLine,
        oInvoiceAddress: oDataSource.oCustomer?.oInvoiceAddress
      };
    }
    const aTemplates = _template.data;

    oDialogComponent.contextChanged.next({
      transaction: oDataSource,
      transactionDetail: this.transaction,
      printActionSettings: this.printActionSettings,
      printSettings: this.printSettings,
      aUniqueItemTypes: aUniqueItemTypes,
      nRepairCount: nRepairCount,
      nOrderCount: nOrderCount,
      activityItems: this.activityItems,
      activity: this.activity,
      aTemplates: aTemplates,
      businessDetails: this.businessDetails
    });

    oDialogComponent.close.subscribe(() => { this.clearAll(); });
    oDialogComponent.triggerEvent.subscribe(() => { this.clearAll(); });

    if (bOrderCondition) {
      // print order receipt
      const orderTemplate = aTemplates.filter((template: any) => template.eType === 'order')[0];
      oDataSource.sActivityNumber = oDataSource.activity.sNumber;
      this.sendForReceipt(oDataSource, orderTemplate, oDataSource.activity.sNumber);
    }
    if (bRegularCondition) {
      //print proof of payments receipt
      const template = aTemplates.filter((template: any) => template.eType === 'regular')[0];
      this.sendForReceipt(oDataSource, template, oDataSource.sNumber, 'regular');
    }

    if (bRepairCondition) {
      if (this.bHasIActivityItemId) {
        this.bHasIActivityItemId = false;
        return;
      }
      //use two column layout
      const template = aTemplates.filter((template: any) => template.eType === 'repair')[0];
      oDataSource = this.activityItems.filter((item: any) => item.oType.eKind === 'repair')[0];
      oDataSource.sAdvisedEmpFirstName = this.employee?.sFirstName || 'a';
      const aTemp = oDataSource.sNumber.split("-");
      oDataSource.sPartRepairNumber = aTemp[aTemp.length - 1];
      oDataSource.sBarcodeURI = this.generateBarcodeURI(false, oDataSource.sNumber);
      this.sendForReceipt(oDataSource, template, oDataSource.sNumber);

    }

    if (bRepairAlternativeCondition) {
      // use repair_alternative laYout
      const template = aTemplates.filter((template: any) => template.eType === 'repair_alternative')[0];
      oDataSource = this.activityItems.filter((item: any) => item.oType.eKind === 'repair');
      oDataSource.sAdvisedEmpFirstName = this.employee?.sFirstName || 'a';
      oDataSource.forEach((data: any) => {
        data.sBarcodeURI = this.generateBarcodeURI(false, data.sNumber);
        data.sBusinessLogoUrl = _oLogoData.data;
        data.businessDetails = this.businessDetails;
        this.sendForReceipt(data, template, data.sNumber);
      })
    }
  }

  sendForReceipt(oDataSource: any, template: any, title: any, type?: any) {
    const printActionSettings = this.printActionSettings?.filter((pas: any) => pas.eType === type);
    if (printActionSettings?.length) {
      const aActionToPerform = printActionSettings[0].aActionToPerform;
      if (aActionToPerform.includes('PRINT_THERMAL')) {
        // console.log({ oDataSource , b: oDataSource.businessDetails})
        this.receiptService.printThermalReceipt({
          oDataSource: oDataSource,
          printSettings: this.printSettings,
          sAction: 'thermal',
          apikey: this.businessDetails.oPrintNode.sApiKey,
          title: oDataSource.sNumber,
          sType: type,
          sTemplateType: 'business-receipt'
        });
      }
      if (aActionToPerform.includes('DOWNLOAD') || aActionToPerform.includes('PRINT_PDF')) {
        const settings = this.printSettings.filter((s: any) => s.sMethod === 'pdf' && s.sType === type && s.iWorkstationId === this.iWorkstationId);

        this.receiptService.exportToPdf({
          oDataSource: oDataSource,
          pdfTitle: title,
          templateData: template,
          printSettings: settings,
          printActionSettings: this.printActionSettings,
          eSituation: 'is_created',
          sApiKey: this.businessDetails.oPrintNode.sApiKey
        });
      }
    }
  }

  getPrintSettings() {
    // console.log('gitprintsettings called')
    let oBody = {
      iLocationId: this.iLocationId,
      // oFilterBy: {}
    }
    // if (action) {
    //   oBody.oFilterBy = { sMethod: 'actions' };
    // }
    this.apiService.postNew('cashregistry', `/api/v1/print-settings/list/${this.iBusinessId}`, oBody).subscribe((result: any) => {
      if (result?.data?.length && result?.data[0]?.result?.length) {
        this.printSettings = [];
        result?.data[0]?.result.forEach((settings: any) => {
          if (settings?.sMethod === 'actions') {
            this.printActionSettings = settings?.aActions || [];
          } else {
            this.printSettings.push(settings);
          }
        })
      }
    });
  }

  getBase64FromUrl(url: any) {
    return this.apiService.getNew('cashregistry', `/api/v1/pdf/templates/getBase64/${this.iBusinessId}?url=${url}`).toPromise();
  }

  getTemplate(types: any) {
    const body = {
      iBusinessId: this.iBusinessId,
      iLocationId: this.iLocationId,
      oFilterBy: {
        eType: types
      }
    }
    return this.apiService.postNew('cashregistry', `/api/v1/pdf/templates`, body).toPromise();
  }

  getBusinessDetails() {
    return this.apiService.getNew('core', '/api/v1/business/' + this.iBusinessId);
    // this.businessDetails = result.data;
    // this.businessDetails.currentLocation = this.businessDetails?.aLocation?.filter((location: any) => location?._id.toString() == this.iLocationId.toString())[0];
    // this.tillService.selectCurrency(this.businessDetails.currentLocation);

    // this.http.get<any>(this.businessDetails.sLogoLight).subscribe((data: any) => {
    //   // console.log(data)
    // }, (error: any) => {
    //   this.businessDetails.sLogoLight = "local";
    // })
    // });
  }


  fetchBusinessPartnersProductCount(aBusinessPartnerId: any) {
    if (!aBusinessPartnerId.length || 1 > aBusinessPartnerId.length) {
      return;
    }
    var body = {
      iBusinessId: this.iBusinessId,
      aBusinessPartnerId
    };
    this.apiService.postNew('core', '/api/v1/business/partners/product-count', body).subscribe(
      (result: any) => {
        if (result && result.data) {
          const urls: any = [];
          result.data.forEach((element: any) => {
            if (element.businessproducts > 10) {
              urls.push({ name: element.sName, iBusinessPartnerId: element._id });
            }
          });
          if (urls.length > 0) {
            this.openWarningPopup(urls);
          }
        }
      },
      (error: any) => {
        // this.partnersList = [];
        console.log(error);
      }
    );
  }

  /* Search API for finding the  common-brands products */
  listShopProducts(searchValue: string | undefined, isFromEAN: boolean | false) {
    let data = {
      iBusinessId: this.iBusinessId,
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
    this.bSearchingProduct = true;
    this.apiService.postNew('core', '/api/v1/business/products/list', data).subscribe((result: any) => {
      if (result && result.data && result.data.length) {
        const response = result.data[0];
        this.shopProducts = response.result;
        this.shopProducts.map((el: any) => el.oCurrentLocation = el?.aLocation?.find((oLoc: any) => oLoc?._id?.toString() === this.iLocationId));
      }
      this.bSearchingProduct = false;
    }, (error) => {
      this.bSearchingProduct = false;
    });
  }

  listCommonBrandProducts(searchValue: string | undefined, isFromEAN: boolean | false) {
    let data = {
      iBusinessId: this.iBusinessId,
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
    this.bSearchingProduct = true;
    this.apiService.postNew('core', '/api/v1/products/commonbrand/list', data).subscribe((result: any) => {
      this.bSearchingProduct = false;
      if (result && result.data && result.data.length) {
        const response = result.data[0];
        this.commonProducts = response.result;
      }
    }, (error) => {
      this.bSearchingProduct = false;
    });
  }

  getBusinessProduct(iBusinessProductId: string): Observable<any> {
    return this.apiService.getNew('core', `/api/v1/business/products/${iBusinessProductId}?iBusinessId=${this.iBusinessId}`)
  }

  getBusinessProductList(aBusinessProductId: any): Observable<any> {
    const oBody = { iBusinessId: this.iBusinessId, aBusinessProductId: aBusinessProductId };
    return this.apiService.postNew('core', `/api/v1/business/products/list`, oBody);
  }

  getBaseProduct(iProductId: string): Observable<any> {
    return this.apiService.getNew('core', `/api/v1/products/${iProductId}?iBusinessId=${this.iBusinessId}`)
  }

  // Add selected product into purchase order
  async onSelectProduct(product: any, isFrom: string = '', isFor: string = '', source?: any) {
    // console.log('onSelectProduct', {product, isFrom, isFor, source})
    let nPriceIncludesVat = 0, nVatRate = 0;
    if (isFrom === 'quick-button') {
      source.loading = true;
      this.onSelectRegular();
      let selectedQuickButton = product;
      this.bSearchingProduct = true;
      this.bSearchingProduct = false;
      nPriceIncludesVat = selectedQuickButton.nPrice;
    }
    let currentLocation;
    if (isFor == 'commonProducts') {
      const _oBaseProductDetail = await this.getBaseProduct(product?._id).toPromise();
      product = _oBaseProductDetail.data;
    } else {
      const _oBusinessProductDetail = await this.getBusinessProduct(product?.iBusinessProductId || product?._id).toPromise();
      product = _oBusinessProductDetail.data;
      if (product?.aLocation?.length) {
        product.aLocation = product.aLocation.filter((oProdLoc: any) => {
          // console.log('oProdLoc: ', oProdLoc, this.aBusinessLocation);
          const oFound: any = this.aBusinessLocation.find((oBusLoc: any) => oBusLoc?._id?.toString() === oProdLoc?._id?.toString());
          if (oFound) {
            oProdLoc.sName = oFound?.sName;
            return oProdLoc;
          }

        })
        // console.log('Product location: ', product?.aLocation);
        currentLocation = product.aLocation.find((o: any) => o._id === this.iLocationId);
        if (currentLocation) {
          if (isFrom !== 'quick-button') nPriceIncludesVat = currentLocation?.nPriceIncludesVat || 0;
          nVatRate = currentLocation?.nVatRate || 0;
        }
      }
    }
    let name = (product?.oArticleGroup?.oName) ? ((product.oArticleGroup?.oName[this.selectedLanguage]) ? product.oArticleGroup?.oName[this.selectedLanguage] : product.oArticleGroup.oName['en']) : '';
    name += ' ' + (product?.sLabelDescription || '');
    name += ' ' + (product?.sProductNumber || '');
    this.transactionItems.push({
      name: name,
      eTransactionItemType: 'regular',
      type: this.eKind,
      quantity: 1,
      price: (isFor == 'commonProducts') ? product.nSuggestedRetailPrice : nPriceIncludesVat,
      nMargin: 1,
      nPurchasePrice: product.nPurchasePrice,
      paymentAmount: 0,
      oType: { bRefund: false, bDiscount: false, bPrepayment: false },
      nDiscount: product.nDiscount || 0,
      bDiscountOnPercentage: product.bDiscountOnPercentage || false,
      tax: nVatRate,
      sProductNumber: product.sProductNumber,
      sArticleNumber: product.sArticleNumber,
      description: '',//product.sLabelDescription,
      iArticleGroupId: product.iArticleGroupId,
      oArticleGroupMetaData: { aProperty: product.aProperty || [], sCategory: '', sSubCategory: '', oName: {}, oNameOriginal: {} },
      iBusinessBrandId: product.iBusinessBrandId || product.iBrandId,
      iBusinessProductId: isFor == 'commonProducts' ? undefined : product._id,
      iProductId: isFor == 'commonProducts' ? product._id : undefined,
      iBusinessPartnerId: product.iBusinessPartnerId, //'6274d2fd8f38164d68186410',
      sBusinessPartnerName: product.sBusinessPartnerName, //'6274d2fd8f38164d68186410',
      iSupplierId: product.iBusinessPartnerId,
      aImage: product.aImage,
      isExclude: false,
      // manualUpdate: false,
      open: true,
      new: true,
      isFor,
      oBusinessProductMetaData: this.tillService.createProductMetadata(product),
      eActivityItemStatus: (this.eKind === 'order') ? 'new' : 'delivered',
      oCurrentLocation: currentLocation,
      aLocation: product?.aLocation,
      bProductLoaded: true
    });
    if (isFrom === 'quick-button') { source.loading = false }
    this.resetSearch();
    this.clearPaymentAmounts();
    await this.updateFiskalyTransaction('ACTIVE', []);
  }

  resetSearch() {
    this.searchKeyword = '';
    this.shopProducts = [];
    this.commonProducts = [];
  }

  search() {
    this.shopProducts = [];
    this.commonProducts = [];
    if (this.bSerialSearchMode) {
      this.listShopProductsBySerial(this.searchKeyword, false);
    } else {
      this.listShopProducts(this.searchKeyword, false);
      if (!this.isStockSelected) {
        this.listCommonBrandProducts(this.searchKeyword, false); // Searching for the products of common brand
      }
    }
  }

  listShopProductsBySerial(searchValue: string | undefined, isFromEAN: boolean | false) {
    let data = {
      iBusinessId: this.iBusinessId,
      sSerialNumber: searchValue,
    }
    this.bSearchingProduct = true;
    this.shopProducts = [];
    this.apiService.postNew('core', '/api/v1/business/products/list-by-serial-number', data).subscribe((result: any) => {
      this.bSearchingProduct = false;
      if (result?.data?.length) {
        this.shopProducts = result.data;
      }
    }, (error) => {
      this.bSearchingProduct = false;
    });
  }

  addNewLine() {
    this.transactionItems.push({
      name: '',
      type: 'empty-line',
      quantity: 1,
      price: 0,
      nDiscount: 0,
      bDiscountOnPercentage: false,
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
      iBusinessId: this.iBusinessId,
      iSupplierId: this.supplierId,
      iActivityId: this.iActivityId,
      bIsStockSelected: this.isStockSelected,
      aPayMethods: this.payMethods,
      oBusiness: this.business,
      iLocationId: this.iLocationId,
      oRequestParams: this.requestParams,
    };
    return body;
  }
  park() {
    this.apiService.postNew('cashregistry', `/api/v1/park?iBusinessId=${this.iBusinessId}`, this.getParkedTransactionBody())
      .subscribe((data: any) => {
        this.parkedTransactions.unshift({
          _id: data?._id.toString(),
          dUpdatedDate: data?.dUpdatedDate.toString(),
          sNumber: data?.sNumber.toString()
        })
        this.toastrService.show({ type: 'success', text: this.translateService.instant('TRANSACTION_PARKED') })

      }, err => {
        this.toastrService.show({ type: 'danger', text: err.message });
      });
    this.clearAll();
  }

  getParkedTransactions() {
    this.apiService.getNew('cashregistry', `/api/v1/park?iBusinessId=${this.iBusinessId}`).subscribe((data: any) => {
      this.parkedTransactions = data;

    }, err => {
      this.toastrService.show({ type: 'danger', text: err.message });
    });
  }

  fetchParkedTransactionInfo() {
    this.parkedTransactionLoading = true;
    this.apiService.getNew('cashregistry', `/api/v1/park/${this.selectedTransaction._id}?iBusinessId=${this.iBusinessId}`)
      .subscribe((transactionInfo: any) => {
        this.taxes = transactionInfo.aTaxes;
        this.transactionItems = transactionInfo.aTransactionItems;
        this.customer = transactionInfo.oCustomer;
        this.iBusinessId = transactionInfo.iBusinessId;
        this.supplierId = transactionInfo.iSupplierId;
        this.iActivityId = transactionInfo.iActivityId;
        this.isStockSelected = transactionInfo.bIsStockSelected;
        this.payMethods = transactionInfo.aPayMethods;
        this.business = transactionInfo.oBusiness;
        this.iLocationId = transactionInfo.iLocationId;
        this.requestParams = transactionInfo.oRequestParams;
        this.parkedTransactionLoading = false;
      }, err => {
        this.toastrService.show({ type: 'danger', text: err.message });
        this.parkedTransactionLoading = false;
      });
  }

  updateParkedTransaction() {
    this.apiService.putNew('cashregistry', `/api/v1/park/${this.selectedTransaction._id}?iBusinessId=${this.iBusinessId}`, this.getParkedTransactionBody())
      .subscribe((data: any) => {
        this.toastrService.show({ type: 'success', text: data.message });
      }, err => {
        this.toastrService.show({ type: 'danger', text: err.message });
      });
  }

  deleteParkedTransaction() {
    let vm = this;
    this.apiService.deleteNew('cashregistry', `/api/v1/park/${this.selectedTransaction._id}?iBusinessId=${this.iBusinessId}`)
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
    const paymentMethod = this.payMethods.find((o: any) => o.sName.toLowerCase() === 'cash');
    this.dialogService.openModal(AddExpensesComponent, { cssClass: 'modal-m', context: { paymentMethod, taxes: this.taxes } })
      .instance.close.subscribe(result => {
      });
  }

  openCardsModal(oGiftcard?: any) {
    this.dialogService.openModal(CardsComponent, { cssClass: 'modal-lg', context: { customer: this.customer, oGiftcard } })
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
      bDiscountOnPercentage: false,
      oType: { bRefund: false, bDiscount: false, bPrepayment: false },
      tax: 0,
      description: '',
      oArticleGroupMetaData: { aProperty: [], sCategory: '', sSubCategory: '', oName: {}, oNameOriginal: {} },
      open: true,
    });
    this.redeemedLoyaltyPoints = redeemedLoyaltyPoints;
    this.clearPaymentAmounts();
  }

  openDayState() {
    const oBody = {
      iBusinessId: this.iBusinessId,
      iLocationId: this.iLocationId,
      iWorkstationId: this.iWorkstationId
    }
    this.bIsOpeningDayState = true;
    this.apiService.postNew('cashregistry', `/api/v1/statistics/open/day-state`, oBody).subscribe((result: any) => {
      this.bIsOpeningDayState = false;
      if (result?.message === 'success') {
        this.bIsDayStateOpened = true;
        if (this.bIsDayStateOpened) this.fetchQuickButtons();
        this.toastrService.show({ type: 'success', text: `Day-state is open now` });
      }
    }, (error) => {
      this.bIsOpeningDayState = false;
      this.toastrService.show({ type: 'warning', text: `Day-state is not open` });
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

  async createArticleGroup() {
    const articleBody = { name: 'Discount', sCategory: 'Discount', sSubCategory: 'Discount' };
    const result: any = await this.createArticleGroupService.createArticleGroup(articleBody);
    this.discountArticleGroup = result.data;
  }

  fetchQuickButtons() {
    this.bSearchingProduct = true;
    try {
      this.apiService.getNew('cashregistry', `/api/v1/quick-buttons/${this.requestParams.iBusinessId}?iLocationId=${this.iLocationId}`).subscribe((result: any) => {

        this.bSearchingProduct = false;
        if (result?.length) {
          this.quickButtons = result;
        }
      }, (error) => {
        this.bSearchingProduct = false;
      })
    } catch (e) {
      this.bSearchingProduct = false;
    }
  }

  checkDayState() {
    const oBody = {
      iBusinessId: this.iBusinessId,
      iLocationId: this.iLocationId,
      iWorkstationId: this.iWorkstationId
    }
    this.bDayStateChecking = true;
    this.dayClosureCheckSubscription = this.apiService.postNew('cashregistry', `/api/v1/statistics/day-closure/check`, oBody).subscribe(async (result: any) => {
      if (result?.data) {
        this.bDayStateChecking = false;
        this.bIsDayStateOpened = result?.data?.bIsDayStateOpened;
        if (this.bIsDayStateOpened) {
          this.bIsTransactionLoading = true;
          this.fetchQuickButtons();
        }
        if (result?.data?.oStatisticDetail?.dOpenDate) {
          this.dOpenDate = result?.data?.oStatisticDetail?.dOpenDate;
          await this.tillService.fetchSettings();
          let nDayClosurePeriodAllowed = 0;
          if (this.tillService.settings?.sDayClosurePeriod && this.tillService.settings.sDayClosurePeriod === 'week') {
            nDayClosurePeriodAllowed = 3600 * 24 * 7;
          } else {
            nDayClosurePeriodAllowed = 3600 * 24;
          }

          /* Show Close day state warning when Day-state is close according to settings day/week */
          const nOpenTimeSecond = new Date(this.dOpenDate).getTime();
          const nCurrentTimeSecond = new Date().getTime();

          const nDifference = (nCurrentTimeSecond - nOpenTimeSecond) / 1000;
          if (nDifference > nDayClosurePeriodAllowed) this.bIsPreviousDayStateClosed = false;


          // /* Show Close day state warning when Day-state is close from last 24hrs */
          // const nOpenTimeSecond = (new Date(this.dOpenDate).getTime());
          // const nCurrentTimeSecond = (new Date().getTime());
          // const nDifferenceInHrs = (nCurrentTimeSecond - nOpenTimeSecond) / 3600000;
          // if (nDifferenceInHrs > 24) this.bIsPreviousDayStateClosed = false;
        }
      }
    }, (error) => {
      console.error('Error here: ', error);
      this.toastrService.show({ type: 'warning', text: `Day-state is not closed` });
    })
  }

  assignAllAmount(index: number) {
    this.payMethods[index].amount = -(this.getUsedPayMethods(true) - this.getTotals('price'));
    this.changeInPayment();
    this.createTransaction();
  }

  switchMode() {
    if (this.eKind === 'giftcard' || this.eKind === 'gold-purchase' || this.eKind === 'repair')
      this.eKind = 'regular';
  }

  async startFiskalyTransaction() {
    if (!this.bIsFiscallyEnabled) return;
    try {
      const res = await this.fiskalyService.startTransaction();
      localStorage.setItem('fiskalyTransaction', JSON.stringify(res));
    } catch (error: any) {
      if (error.error.code === 'E_UNAUTHORIZED') {
        localStorage.removeItem('fiskalyAuth');
        await this.startFiskalyTransaction();
      }
    }
  }

  async updateFiskalyTransaction(state: string, payments: []) {
    if (!this.bIsFiscallyEnabled) return;
    const pay = _.clone(payments);
    try {
      if (!localStorage.getItem('fiskalyTransaction')) {
        await this.startFiskalyTransaction();
      }
      const result = await this.fiskalyService.updateFiskalyTransaction(this.transactionItems, pay, state);
      if (state === 'FINISHED') {
        localStorage.removeItem('fiskalyTransaction');
      } else {
        localStorage.setItem('fiskalyTransaction', JSON.stringify(result));
      }
    } catch (error: any) {
      if (error?.error?.code === 'E_UNAUTHORIZED') {
        await this.updateFiskalyTransaction(state, payments);
      }
    }
  }

  async cancelFiskalyTransaction() {
    if (!this.bIsFiscallyEnabled) return;
    try {
      if (localStorage.getItem('fiskalyTransaction')) {
        await this.fiskalyService.updateFiskalyTransaction(this.transactionItems, [], 'CANCELLED');
        localStorage.removeItem('fiskalyTransaction');
      }
      // this.fiskalyService.clearAll();
    } catch (error) {
      localStorage.removeItem('fiskalyTransaction');
      this.fiskalyService.clearAll();
    }
  }

  openWarningPopup(urls: any): void {
    this.dialogService.openModal(SupplierWarningDialogComponent, { cssClass: 'modal-lg', context: { urls } })
      .instance.close.subscribe((data) => {
      })
  }

  async openModal(barcode: any) {
    if (barcode.startsWith('0002'))
      barcode = barcode.substring(4)
    this.toastrService.show({ type: 'success', text: 'Barcode detected: ' + barcode })
    if (barcode.startsWith("AI")) {
      let oBody: any = {
        iBusinessId: this.iBusinessId,
        oFilterBy: {
          sNumber: barcode
        }
      }
      const activityItemResult: any = await this.apiService.postNew('cashregistry', `/api/v1/activities/activity-item`, oBody).toPromise();
      if (activityItemResult?.data[0]?.result?.length) {

        oBody = {
          iBusinessId: this.iBusinessId,
        }
        const iActivityId = activityItemResult?.data[0].result[0].iActivityId;
        const iActivityItemId = activityItemResult?.data[0].result[0]._id;
        this.openTransaction({ _id: iActivityId }, 'activity', [iActivityItemId]);
      }
    } else if (barcode.startsWith("T")) {

      const oBody = {
        iBusinessId: this.iBusinessId,
        searchValue: barcode
      }
      const result: any = await this.apiService.postNew('cashregistry', '/api/v1/transaction/search', oBody).toPromise();
      if (result?.transactions?.records?.length) {
        this.openTransaction(result?.transactions?.records[0], 'transaction');
      }
      //transactions.find({sNumber: barcode})
    } else if (barcode.startsWith("A")) {

      const oBody = {
        iBusinessId: this.iBusinessId,
        searchValue: barcode
      }
      const result: any = await this.apiService.postNew('cashregistry', '/api/v1/transaction/search', oBody).toPromise();
      if (result?.activities?.records?.length) {
        this.openTransaction(result?.activities?.records[0], 'activity');
      }
      //activity.find({sNumber: barcode})
    } else if (barcode.startsWith("G")) {
      let oBody: any = {
        iBusinessId: this.iBusinessId,
        oFilterBy: {
          sGiftCardNumber: barcode.substring(2)
        }
      }
      let result: any = await this.apiService.postNew('cashregistry', `/api/v1/activities/activity-item`, oBody).toPromise();
      if (result?.data[0]?.result?.length) {
        const oGiftcard = result?.data[0]?.result[0];
        this.openCardsModal(oGiftcard)
      }
      // activityitem.find({sGiftcardNumber: barcode},{eTransactionItem.eKind : 1})
    } else if (barcode.startsWith("R")) {
      // activityitem.find({sRepairNumber: barcode},{eTransactionItem.eKind : 1})
    }

  }

  openTransaction(transaction: any, itemType: any, aSelectedIds?: any) {
    this.dialogService.openModal(TransactionItemsDetailsComponent, { cssClass: "modal-xl", context: { transaction, itemType, aSelectedIds } })
      .instance.close.subscribe(result => {
        const transactionItems: any = [];
        if (result?.transaction) {
          result.transactionItems.forEach((transactionItem: any) => {
            if (transactionItem.isSelected) {
              const { tType } = transactionItem;
              let paymentAmount = transactionItem.nQuantity * transactionItem.nPriceIncVat - transactionItem.nPaidAmount;
              if (tType === 'refund') {
                paymentAmount = 0;
                transactionItem.oType.bRefund = true;
              } else if (tType === 'revert') {
                paymentAmount = transactionItem.nPaidAmount;
                transactionItem.oType.bRefund = false;
              };
              transactionItems.push({
                name: transactionItem.sProductName || transactionItem.sProductNumber,
                iActivityItemId: transactionItem.iActivityItemId,
                nRefundAmount: transactionItem.nPaidAmount,
                iLastTransactionItemId: transactionItem.iTransactionItemId,
                prePaidAmount: tType === 'refund' ? transactionItem.nPaidAmount : transactionItem.nPaymentAmount,
                type: transactionItem.sGiftCardNumber ? 'giftcard' : transactionItem.oType.eKind,
                eTransactionItemType: 'regular',
                nBrokenProduct: 0,
                tType,
                oType: transactionItem.oType,
                sUniqueIdentifier: transactionItem.sUniqueIdentifier,
                aImage: transactionItem.aImage,
                nonEditable: transactionItem.sGiftCardNumber ? true : false,
                sGiftCardNumber: transactionItem.sGiftCardNumber,
                quantity: transactionItem.nQuantity,
                iBusinessProductId: transactionItem.iBusinessProductId,
                price: transactionItem.nPriceIncVat,
                iRepairerId: transactionItem.iRepairerId,
                oArticleGroupMetaData: transactionItem.oArticleGroupMetaData,
                nRedeemedLoyaltyPoints: transactionItem.nRedeemedLoyaltyPoints,
                iArticleGroupId: transactionItem.iArticleGroupId,
                iEmployeeId: transactionItem.iEmployeeId,
                iAssigneeId: transactionItem.iAssigneeId,
                iBusinessBrandId: transactionItem.iBusinessBrandId,
                nDiscount: transactionItem.nDiscount || 0,
                bDiscountOnPercentage: transactionItem.nDiscount || 0,
                tax: transactionItem.nVatRate,
                oGoldFor: transactionItem.oGoldFor,
                iSupplierId: transactionItem.iSupplierId,
                paymentAmount,
                description: transactionItem.sDescription,
                open: true,
                nMargin: transactionItem.nMargin,
                nPurchasePrice: transactionItem.nPurchasePrice,
                oBusinessProductMetaData: transactionItem.oBusinessProductMetaData,
                sServicePartnerRemark: transactionItem.sServicePartnerRemark,

                sCommentVisibleServicePartner: transactionItem.sCommentVisibleServicePartner,
                eActivityItemStatus: transactionItem.eActivityItemStatus,
                eEstimatedDateAction: transactionItem.eEstimatedDateAction,
                bGiftcardTaxHandling: transactionItem.bGiftcardTaxHandling,
              });
            }
          });
          result.transactionItems = transactionItems;
          this.handleTransactionResponse(result);
        }
      });
  }

  async handleTransactionResponse(data: any) {
    // console.log('handleTransactionResponse', data)
    this.clearAll();
    const { transactionItems, transaction } = data;
    this.transactionItems = transactionItems;
    this.iActivityId = transaction.iActivityId || transaction._id;
    this.sNumber = transaction?.sNumber;

    for (const item of this.transactionItems) {
      if (item?.iBusinessProductId) {
        const _oBusinessProductDetail: any = await this.getBusinessProduct(item?.iBusinessProductId).toPromise();
        const product = _oBusinessProductDetail.data;
        if (product?.aLocation?.length) {
          item.aLocation = product.aLocation.filter((oProdLoc: any) => {
            // console.log('oProdLoc: ', oProdLoc, this.aBusinessLocation);
            const oFound: any = this.aBusinessLocation.find((oBusLoc: any) => oBusLoc?._id?.toString() === oProdLoc?._id?.toString());
            if (oFound) {
              oProdLoc.sName = oFound?.sName;
              return oProdLoc;
            }
          })
          item.oCurrentLocation = product.aLocation.find((o: any) => o._id === this.iLocationId);
          item.bProductLoaded = true;
        }
      }
    }

    if (transaction.iCustomerId) {
      this.fetchCustomer(transaction.iCustomerId);
    }
    this.changeInPayment();
    this.bIsTransactionLoading = false;
    await this.updateFiskalyTransaction('ACTIVE', []);
  }

  generateBarcodeURI(displayValue: boolean = true, data: any) {
    var canvas = document.createElement("canvas");
    JsBarcode(canvas, data, { format: "CODE128", displayValue: displayValue });
    return canvas.toDataURL("image/png");
  }

  ngOnDestroy() {
    localStorage.removeItem('fromTransactionPage');
    localStorage.removeItem('recentUrl');
    this.cancelFiskalyTransaction();
    if (this.getSettingsSubscription) this.getSettingsSubscription.unsubscribe();
    if (this.dayClosureCheckSubscription) this.dayClosureCheckSubscription.unsubscribe();
    // console.log('cashregister destroy')
    MenuComponent.clearEverything();

  }

  openDrawer() {
    const aThermalSettings = this.printSettings?.filter((settings: any) => settings.sMethod === 'thermal' && settings.iWorkstationId === this.iWorkstationId)
    const oSettings = aThermalSettings?.find((s: any) => s.sType === 'regular' && s.nComputerId && s.nPrinterId);
    if (oSettings) {
      this.receiptService.openDrawer(this.businessDetails.oPrintNode.sApiKey, oSettings.nPrinterId, oSettings.nComputerId,)
    } else {
      this.toastrService.show({ type: 'warning', text: 'Error while opening cash drawer. Please check your print settings!' })
    }

  }

  articleGroupDataChange(oStaticData: any) {
    // console.log('articleGroupDataChange', oStaticData)
    this.oStaticData = oStaticData;
  }
}
