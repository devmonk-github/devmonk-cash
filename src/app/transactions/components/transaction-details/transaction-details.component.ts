import { AfterContentInit, ChangeDetectorRef, Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { faAt, faClipboard, faDownload, faEnvelope, faFileInvoice, faPrint, faReceipt, faSync, faTimes, faTrashAlt, faUndoAlt } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import * as _moment from 'moment';
import * as JsBarcode from 'jsbarcode';
import { Observable } from 'rxjs';
import { ActivityDetailsComponent } from 'src/app/shared/components/activity-details-dialog/activity-details.component';
import { CustomerDetailsComponent } from 'src/app/shared/components/customer-details/customer-details.component';
import { CustomerDialogComponent } from 'src/app/shared/components/customer-dialog/customer-dialog.component';
import { CustomerSyncDialogComponent } from 'src/app/shared/components/customer-sync-dialog/customer-sync-dialog.component';
import { ToastService } from 'src/app/shared/components/toast';
import { TransactionItemsDetailsComponent } from 'src/app/shared/components/transaction-items-details/transaction-items-details.component';
import { ApiService } from 'src/app/shared/service/api.service';
import { DialogComponent, DialogService } from 'src/app/shared/service/dialog';
import { ReceiptService } from 'src/app/shared/service/receipt.service';
import { TransactionsPdfService } from 'src/app/shared/service/transactions-pdf.service';
import { TaxService } from 'src/app/shared/service/tax.service';
import { TillService } from 'src/app/shared/service/till.service';
import { CreateArticleGroupService } from 'src/app/shared/service/create-article-groups.service';
const moment = (_moment as any).default ? (_moment as any).default : _moment;

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.sass']
})
export class TransactionDetailsComponent implements OnInit, AfterContentInit {
  componentRef: any;
  dialogRef: DialogComponent;
  faTimes = faTimes;
  faSync = faSync;
  faFileInvoice = faFileInvoice;
  faDownload = faDownload;
  faPrint = faPrint;
  faReceipt = faReceipt;
  faEnvelope = faEnvelope;
  faAt = faAt;
  faUndoAlt = faUndoAlt;
  faClipboard = faClipboard;
  faTrashAlt = faTrashAlt;
  transaction: any = {};
  aTemplates: any = [];
  aRepairItems: any = [];

  filterdata: any = [];

  iBusinessId: any = localStorage.getItem("currentBusiness");
  iLocationId: any = localStorage.getItem("currentLocation");
  iWorkstationId: any = localStorage.getItem("currentWorkstation");

 

  loading: boolean = true;
  customerLoading: boolean = true;
  customer: any = {};
  imagePlaceHolder: string = '../../../../assets/images/no-photo.svg';
  eType: string = '';
  transactionId: string;
  invoiceNumber: any;
  pdfGenerating: Boolean = false;
  downloadWithVATLoading: Boolean = false;
  businessDetails: any = {};
  businessLocationName: string;
  ableToDownload: Boolean = false;
  from !: string;
  // thermalPrintSettings !: any;
  employeesList: any = [];

  // private pn2escposService = new Pn2escposService(Object, this.translateService);
  printSettings: any;
  printActionSettings: any;
  printWithVATLoading: boolean = false;

  downloadInvoiceLoading: boolean = false;
  printInvoiceLoading: boolean = false;

  paymentEditMode = false;
  aNewSelectedPaymentMethods: any = [];
  payMethods: any;
  bDayStateChecking = false;
  bIsDayStateOpened = false;
  bIsOpeningDayState = false;
  aActivityItems: any = [];
  nTotalItemPayment: any = 0;
  nTotalItemPaidPayment: any = 0;
  translation: any = [];
  oCurrentCustomer: any;
  showSystemCustomer: boolean = false;
  changeAmount: number = 0;
  refundedAmount: number = 0;
  bGenerateInvoice: boolean = false;
  savingPointsSetting: boolean = false;
  employee: any;
  @ViewChild('slider', { read: ViewContainerRef }) container!: ViewContainerRef;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
    private dialogService: DialogService,
    private receiptService: ReceiptService,
    private toastService: ToastService,
    public tillService: TillService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private taxService: TaxService,
    private createArticleGroupService: CreateArticleGroupService,
  ) {
    const _injector = this.viewContainerRef.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  async ngOnInit() {
    this.getEmployee(this.transaction.iEmployeeId)
    let sIndex = this.transaction.aPayments.findIndex((value: any) => value.sRemarks == "CHANGE_MONEY");
    if (sIndex > -1) {
      this.changeAmount = this.transaction.aPayments[sIndex].nAmount;
    }
    this.filterdata = this.transaction.aTransactionItems.filter((data: any) => data?.oType?.bRefund === true);
    this.filterdata.forEach((items: any) => {
      this.refundedAmount += Number((items.nRefundAmount));
    })
    let translationKey = ['SUCCESSFULLY_UPDATED', 'NO_DATE_SELECTED'];
    this.translateService.get(translationKey).subscribe((res: any) => {
      this.translation = res;
    })
    this.oCurrentCustomer = JSON.parse(JSON.stringify(this.transaction?.oCustomer));
    if (this.from && this.from === 'transactions-action') {
      this.loading = false;
    } else {
      this.transaction.businessDetails = this.businessDetails;
      this.transaction.currentLocation = this.businessDetails.currentLocation;
      this.getPrintSetting();
      this.transaction = await this.tillService.processTransactionForPdfReceipt(this.transaction);
      this.loading = false;
    }
    // console.log(this.transaction)
    if(this.from != 'audit') this.fetchActivityItem();
    this.getPaymentMethods();
    this.mapEmployee();
    this.getSystemCustomer(this.transaction?.iCustomerId);
    this.fetchLocationName();
  }

  ngAfterContentInit(): void {
    this.cdr.detectChanges();
  }

  getEmployee(id: any) {
    if (id != '') {
      this.apiService.getNew('auth', `/api/v1/employee/${id}?iBusinessId=${this.iBusinessId}`).subscribe((result: any) => {
        this.employee = result?.data;
      });
    }
  }
  

  async sendEmail() {
    const template = await this.getTemplate('regular').toPromise();
    const oDataSource = JSON.parse(JSON.stringify(this.transaction));

    oDataSource.sBusinessLogoUrl = '';
    try {
      const _result: any = await this.getBase64FromUrl(oDataSource?.businessDetails?.sLogoLight).toPromise();
      if (_result?.data) {
        oDataSource.sBusinessLogoUrl = _result?.data;
      }
    } catch (e) { }
    if (oDataSource?.oCustomer?.bCounter === true) {
      oDataSource.oCustomer = {};
    }
    oDataSource?.aPayments?.forEach((payment: any) => {
      payment.dCreatedDate = moment(payment.dCreatedDate).format('DD-MM-yyyy HH:mm:ss');
    })
    const oSettings = this.printSettings.find((s: any) => s.sType === 'regular' && s.sMethod === 'pdf' && s.iWorkstationId === this.iWorkstationId)
    oDataSource.dCreatedDate = moment(oDataSource.dCreatedDate).format('DD-MM-yyyy HH:mm:ss');
    const response = await this.receiptService.exportToPdf({
      oDataSource: oDataSource,
      pdfTitle: oDataSource.sNumber,
      templateData: template.data,
      printSettings: oSettings,
      sAction: 'sentToCustomer'
    }).toPromise();
    if (this.transaction?.oCustomer?.sEmail) {
      const body = {
        pdfContent: response,
        iTransactionId: this.transaction._id,
        receiptType: 'purchase-receipt',
        sCustomerEmail: this.transaction?.oCustomer?.sEmail
      }
      this.apiService.postNew('cashregistry', '/api/v1/till/send-to-customer', body).subscribe(
        (result: any) => {
          if (result) {
            this.toastService.show({ type: 'success', text: 'Mail send to customer successfully.' });
          }
        }, (error: any) => {
          console.log("Error : ", error);
          this.toastService.show({ type: "warning", text: `Something went wrong` });
        }
      )
    }
  }

  syncCustomerData(currenCustomer: any, systemCustomer: any) {
    this.dialogService.openModal(CustomerSyncDialogComponent,
      {
        cssClass: "modal-md",
        context: {
          activityItems: this.aActivityItems,
          currenCustomer: currenCustomer,
          systemCustomer: systemCustomer
        }
      }).instance.close.subscribe(result => {
        if (result) {
          if (result?.currentCustomer) {
            this.transaction.oCustomer = result.currentCustomer;
          }
          if (result?.systemCustomer) {
            this.transaction.oSystemCustomer = result.systemCustomer;
          }
          this.matchSystemAndCurrentCustomer(this.transaction.oSystemCustomer, this.transaction.oCustomer);
        }
      }, (error) => {
        console.log("Error in customer: ", error);
        this.toastService.show({ type: "warning", text: `Something went wrong` });
      });
  }

  close(data: any) {
    this.dialogRef.close.emit(data);
  }

  fetchActivityItem() {
    this.apiService.postNew('cashregistry', `/api/v1/activities/items/${this.transaction?.iActivityId}`, { iBusinessId: this.iBusinessId }).subscribe((result: any) => {
      this.aActivityItems = result.data[0].result;
      if (this.aActivityItems?.length) {
        this.aActivityItems.forEach((items: any) => {
          const oTransactionItem = this.transaction.aTransactionItems.find((TI: any) => TI._id == items.iTransactionItemId);
          if (oTransactionItem && !items?.bIsRefunded) {
            this.nTotalItemPayment += Number((items.nPriceIncVat * items.nQuantity).toFixed(2));
            this.nTotalItemPaidPayment += Number((items.nPaidAmount).toFixed(2));
          }
        })
      }
    });
  }


  generateBarcodeURI(displayValue: boolean = true, data: any) {
    var canvas = document.createElement("canvas");
    JsBarcode(canvas, data, { format: "CODE128", displayValue: displayValue });
    return canvas.toDataURL("image/png");
  }

  downloadWithVAT(print: boolean = false) {
    this.generatePDF(print, 0);
  }

  openProductInfo(product: any) {
    this.dialogRef.triggerEvent.emit({ type: 'open-slider', data: product });
  }

  downloadWebOrder() {
    this.generatePDF(false, 0);
  }

  getPrintSetting() {
    const oBody = {
      iLocationId: this.iLocationId,
      iWorkstationId: this.iWorkstationId
    }
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

  mapEmployee() {
    const emp = this.employeesList.find((employee: any) => employee._id === this.transaction?.iEmployeeId)
    if (emp) {
      this.transaction.createrDetail = emp;
      this.transaction.sAdvisedEmpFirstName = this.transaction.createrDetail?.sFirstName || 'a';
    }
  }

  async generatePDF(print: boolean, type: any) {
    const template = await this.getTemplate('regular').toPromise();
    const oDataSource = JSON.parse(JSON.stringify(this.transaction));
    if (type == 1 && !this.transaction.sInvoiceNumber) {
      const result: any = await this.updateInvoiceNumber();
      /*THIS SHOULD BE sInvoiceNumber */
      oDataSource.sReceiptNumber = result?.data?.sInvoiceNumber;
      this.transaction.sInvoiceNumber = result?.data?.sInvoiceNumber;
    } else if (type == 1) {
      /*THIS SHOULD BE sInvoiceNumber */
      oDataSource.sReceiptNumber = this.transaction.sInvoiceNumber;
      if (print)
        this.printInvoiceLoading = true;
      else
        this.downloadInvoiceLoading = true;
    }
    if (type == 0) {
      if (print)
        this.printWithVATLoading = true;
      else
        this.downloadWithVATLoading = true;
    }

    oDataSource.sBusinessLogoUrl = '';
    try {
      const _result: any = await this.getBase64FromUrl(oDataSource?.businessDetails?.sLogoLight).toPromise();
      if (_result?.data) {
        oDataSource.sBusinessLogoUrl = _result?.data;
      }
    } catch (e) { }
    if (oDataSource?.oCustomer?.bCounter === true) {
      oDataSource.oCustomer = {};
    }
    oDataSource?.aPayments?.forEach((payment: any) => {
      payment.dCreatedDate = moment(payment.dCreatedDate).format('DD-MM-yyyy HH:mm:ss');
    })
    const oSettings = this.printSettings.find((s: any) => s.sType === 'regular' && s.sMethod === 'pdf' && s.iWorkstationId === this.iWorkstationId)

    oDataSource.dCreatedDate = moment(oDataSource.dCreatedDate).format('DD-MM-yyyy HH:mm:ss');
    await this.receiptService.exportToPdf({
      oDataSource: oDataSource,
      pdfTitle: oDataSource.sNumber,
      templateData: template.data,
      printSettings: oSettings,
      eSituation: 'is_created',
      sAction: (print) ? 'print' : 'download',
      sApiKey: this.businessDetails.oPrintNode.sApiKey,
    }).toPromise();
    if (print) {
      this.printWithVATLoading = false
      this.printInvoiceLoading = false
    } else {
      this.downloadWithVATLoading = false;
      this.downloadInvoiceLoading = false;
    }
  }


  getBase64FromUrl(url: any): Observable<any> {
    return this.apiService.getNew('cashregistry', `/api/v1/pdf/templates/getBase64/${this.iBusinessId}?url=${url}`);
  }

  getTemplate(type: string): Observable<any> {
    return this.apiService.getNew('cashregistry', `/api/v1/pdf/templates/${this.iBusinessId}?eType=${type}&iLocationId=${this.iLocationId}`);
  }

  openTransaction(transaction: any, itemType: any) {
    this.dialogService.openModal(TransactionItemsDetailsComponent, { cssClass: "modal-xl", context: { transaction, itemType }, hasBackdrop: true })
      .instance.close.subscribe(result => {
        if (result.transaction) {
          const data = this.tillService.processTransactionSearchResult(result);
          // console.log('response of processTransactionSearchResult',JSON.parse(JSON.stringify({data})))
          localStorage.setItem('fromTransactionPage', JSON.stringify(data));
          setTimeout(() => {
            this.close({ action: true });
          }, 100);
        }
      });
  }

  openCustomer(customer: any) {
    if (customer?._id) {
      this.apiService.getNew('customer', `/api/v1/customer/${this.iBusinessId}/${customer._id}`).subscribe((result: any) => {
        if (result?.data) {
          this.dialogService.openModal(CustomerDetailsComponent,
            { cssClass: "modal-xl position-fixed start-0 end-0", context: { customerData: result?.data, mode: 'details', from: 'transactions' } }).instance.close.subscribe(result => { });
        } else {
          this.toastService.show({ type: 'warning', text: 'No customer data available' })
        }
      })
    } else {
      this.toastService.show({ type: 'warning', text: 'No customer data available' })
    }
  }

  async showActivityItem(activityItem: any, event: any) {
    const oBody = {
      iBusinessId: this.iBusinessId,
    }
    activityItem.bFetchingActivityItem = true;
    event.target.disabled = true;
    const aActivityItem: any = [];
    if (this.aActivityItems?.length) {
      const items = this.aActivityItems.filter((AI: any) => AI._id == activityItem.iActivityItemId);
      aActivityItem.push(items[0]);
    } else {
      const items: any = await this.apiService.postNew('cashregistry', `/api/v1/activities/activity-item/${activityItem.iActivityItemId}`, oBody).toPromise();
      aActivityItem.push(items?.data[0].result[0])
    }
    activityItem.bFetchingActivityItem = false;
    event.target.disabled = false;
    this.dialogService.openModal(ActivityDetailsComponent, { cssClass: 'w-fullscreen', context: { activityItems: aActivityItem, items: true, from: 'transaction-details' } })
      .instance.close.subscribe((result: any) => { });
  }

  async getThermalReceipt(type: string) {
    this.transaction.nTotalSavedPoints = await this.apiService.getNew('cashregistry', `/api/v1/points-settings/points?iBusinessId=${this.iBusinessId}&iCustomerId=${this.transaction.iCustomerId}`).toPromise();
    this.transaction.currentLocation.currency = this.tillService.currency;
    await this.receiptService.printThermalReceipt({
      currency: this.tillService.currency,
      oDataSource: this.transaction,
      printSettings: this.printSettings,
      apikey: this.businessDetails.oPrintNode.sApiKey,
      title: this.transaction.sNumber,
      sType: 'regular',
      sTemplateType: type
    }).toPromise();
  }

  addRow() {
    this.aNewSelectedPaymentMethods.push({nAmount: 0})
    this.filterDuplicatePaymentMethods()
  }

  async toggleEditPaymentMode() {
    this.paymentEditMode = !this.paymentEditMode;
    if (!this.bIsDayStateOpened) {
      const oBody = {
        iBusinessId: this.iBusinessId,
        iLocationId: this.iLocationId,
        iWorkstationId: this.iWorkstationId
      }
      this.bDayStateChecking = true;
      const _result: any = await this.apiService.postNew('cashregistry', `/api/v1/statistics/day-closure/check`, oBody).toPromise();
      if (_result?.data) {
        this.bDayStateChecking = false;
        this.bIsDayStateOpened = _result?.data?.bIsDayStateOpened;
      }
    } else {
      if (!this.paymentEditMode) this.aNewSelectedPaymentMethods = [];
    }
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
        this.paymentEditMode = true;
        this.toastService.show({ type: 'success', text: `Day-state is open now` });
      }
    }, (error) => {
      this.bIsOpeningDayState = false;
      this.toastService.show({ type: 'warning', text: `Day-state is not open` });
    })
  }

  reCalculateTotal() {
    this.transaction.nNewPaymentMethodTotal = 0;
    this.transaction.nNewPaymentMethodTotal = _.sumBy(this.transaction.aPayments, 'nNewAmount') + _.sumBy(this.aNewSelectedPaymentMethods, 'nAmount');
    this.transaction.nNewPaymentMethodTotal = +(this.transaction.nNewPaymentMethodTotal.toFixed(2));
    // this.transaction.aPayments.forEach((item: any) => {
    //   if (item.nNewAmount) this.transaction.nNewPaymentMethodTotal += +(item.nNewAmount.toFixed(2));
    // });
    
    // this.aNewSelectedPaymentMethods.forEach((item: any) => {
    //   if (item.nAmount) this.transaction.nNewPaymentMethodTotal += +(item.nAmount.toFixed(2));
    // });
  }

  filterDuplicatePaymentMethods() {
    const aPresent: any = [
      ...this.transaction.aPayments.map((item: any) => item.iPaymentMethodId && item?.sRemarks != 'CHANGE_MONEY'), 
      ...this.aNewSelectedPaymentMethods.map((item: any) => item._id)
    ];
    this.payMethods = this.payMethods.filter((item: any) => !aPresent.includes(item._id));
  }

  getPaymentMethods() {
    this.payMethods = [];
    this.apiService.getNew('cashregistry', `/api/v1/payment-methods/${this.iBusinessId}`).subscribe((result: any) => {
      if (result?.data?.length) {
        this.payMethods = [...result.data];
        this.filterDuplicatePaymentMethods();
      }
    });
  }

  async saveUpdatedPayments(event: any) {
    event.target.disabled = true;
    const nVatRate = await this.taxService.fetchDefaultVatRate({ iLocationId: this.iLocationId });
    const _result = await this.createArticleGroupService.checkArticleGroups('payment-method-change').toPromise()
    const oArticleGroup = _result.data;
    const aPayments = this.transaction.aPayments.filter((payments: any) => !payments?.bIgnore);
    const aPromises:any = [];
    // console.log({ taPayments: this.transaction.aPayments, aPayments, aNewSelectedPaymentMethods: this.aNewSelectedPaymentMethods })
    // return;
    aPayments.forEach((item: any) => {
      if (item.nAmount != item.nNewAmount) {
        aPromises.push(this.addExpenses({
          amount: +((item.nNewAmount - item.nAmount).toFixed(2)),
          type: 'payment-method-change',
          comment: 'PAYMENT_METHOD_CHANGE',
          iActivityId: this.transaction.iActivityId,
          oArticleGroup,
          oPayment: {
            iPaymentMethodId: item.iPaymentMethodId,
            nAmount: +((item.nNewAmount - item.nAmount).toFixed(2)),
            sMethod: item.sMethod,
            sRemarks: 'PAYMENT_METHOD_CHANGE'
          },
          nVatRate: nVatRate
        }));
      }
    });
  

    this.aNewSelectedPaymentMethods.forEach((item:any) => {
      if (item.nAmount) {
        aPromises.push(this.addExpenses({
          amount: +(item.nAmount.toFixed(2)),
          type: 'payment-method-change',
          comment: 'PAYMENT_METHOD_CHANGE',
          iActivityId: this.transaction.iActivityId,
          oArticleGroup,
          oPayment: {
            iPaymentMethodId: item._id,
            nAmount: +(item.nAmount.toFixed(2)),
            sMethod: item.sName.toLowerCase(),
            sRemarks: 'PAYMENT_METHOD_CHANGE'
          },
          nVatRate: nVatRate
        }));
      }
    });
    
    await Promise.all(aPromises);

    this.paymentEditMode = false;
    event.target.disabled = false;

    this.toastService.show({ type: "success", text: this.translation['SUCCESSFULLY_UPDATED'] });
    this.close({ action: false });
  }

  addExpenses(data: any) {
    const value = localStorage.getItem('currentUser');
    const currentEmployeeId = (value) ? JSON.parse(value).userId : '';
    const transactionItem = {
      sProductName: data?.type,
      sComment: data.comment,
      nPriceIncVat: data.amount,
      nPurchasePrice: data.amount,
      iBusinessId: this.iBusinessId,
      nTotal: data.amount,
      nPaymentAmount: data.amount,
      nRevenueAmount: data.amount,
      iWorkstationId: this.iWorkstationId,
      iEmployeeId: currentEmployeeId,
      iLocationId: this.iLocationId,
      iActivityId: this.transaction.iActivityId,
      oPayment: data?.oPayment,
      iArticleGroupId: data?.oArticleGroup?._id,
      iArticleGroupOriginalId: data?.iArticleGroupOriginalId || data?.oArticleGroup?._id,
      oArticleGroupMetaData: {
        oNameOriginal: data.oArticleGroup.oName,
        oName: data.oArticleGroup.oName,
        sCategory: data.oArticleGroup.sCategory,
        sSubCategory: data.oArticleGroup.sSubCategory
      },
      oType: {
        eTransactionType: data?.type,
        bRefund: false,
        eKind: data?.type,
        bDiscount: false,
      },
      nVatRate: data?.nVatRate
    };
    return this.apiService.postNew('cashregistry', `/api/v1/till/add-expenses`, transactionItem).toPromise();
  }

  getSystemCustomer(iCustomerId: string) {
    this.apiService.getNew('customer', `/api/v1/customer/${this.iBusinessId}/${iCustomerId}`).subscribe((result: any) => {
      if (result?.data) {
        this.transaction.oSystemCustomer = result?.data;
        this.matchSystemAndCurrentCustomer(this.transaction.oSystemCustomer, this.oCurrentCustomer);
      }
    })
  }

  matchSystemAndCurrentCustomer(systemCustomer: any, currentCustomer: any) {
    this.showSystemCustomer = false;
    let currentCustomerData: any;
    const aCurrentCustomerKeys: any = ['oInvoiceAddress', 'oPhone', 'bCounter', '_id', 'sFirstName', 'sLastName', 'sPrefix', 'sGender', 'sEmail', 'sVatNumber', 'sCompanyName', 'sCocNumber', 'bIsCompany', 'oContactPerson', 'nClientId', 'sSalutation', 'oShippingAddress'];
    aCurrentCustomerKeys.forEach((keys: any) => {
      currentCustomerData = { ...currentCustomerData, [keys]: currentCustomer[keys] }
    })

    if(!systemCustomer?.bCounter){
      for (const [key, value] of Object.entries(currentCustomerData)) {
        if (currentCustomer[key] && !(_.isEqual(systemCustomer[key], currentCustomer[key]))) {
          console.log("not matched", key, systemCustomer[key], currentCustomer[key]);
          this.showSystemCustomer = true;
        }
      }
    }
  }

  async updateInvoiceNumber() {
    return await this.apiService.putNew('cashregistry', `/api/v1/transaction/${this.transaction._id}`, { iBusinessId: this.iBusinessId, bGenerateInvoice: true }).toPromise();
  }

  /* Update customer in [T, A, AI] */
  updateCurrentCustomer(oData: any) {
    const oBody = {
      oCustomer: oData.oCustomer,
      iBusinessId: this.iBusinessId,
      iTransactionId: this.transaction?._id
      // iActivityItemId: this.activityItems[0]._id
    }
    this.apiService.postNew('cashregistry', '/api/v1/transaction/update-customer', oBody).subscribe((result: any) => {
      this.transaction.oCustomer = oBody?.oCustomer;
      this.matchSystemAndCurrentCustomer(this.transaction.oSystemCustomer, this.transaction.oCustomer);
      this.toastService.show({ type: "success", text: this.translation['SUCCESSFULLY_UPDATED'] });
    }, (error) => {
      console.log('update customer error: ', error);
      this.toastService.show({ type: "warning", text: `Something went wrong` });
    });
  }

  selectCustomer() {
    this.dialogService.openModal(CustomerDialogComponent, { cssClass: 'modal-xl' })
      .instance.close.subscribe((data) => {
        if (!data?.customer?._id || !this.transaction?._id) return;
        this.updateCurrentCustomer({ oCustomer: data?.customer });
        this.transaction.oSystemCustomer = data?.customer;
      }, (error) => {
        console.log('selectCustomer error: ', error);
        this.toastService.show({ type: "warning", text: `Something went wrong` });
      })
  }

  /* Here the current customer means from the Transaction/Activity/Activity-Items */
  openCurrentCustomer(oCurrentCustomer: any) {
    const bIsCounterCustomer = (oCurrentCustomer?.sEmail === "balieklant@prismanote.com" || !oCurrentCustomer?._id) ? true : false /* If counter customer used then must needs to change */
    if (bIsCounterCustomer) {
      this.selectCustomer();
      return;
    }
    this.dialogService.openModal(CustomerDetailsComponent,
      {
        cssClass: "modal-xl position-fixed start-0 end-0",
        context: {
          customerData: oCurrentCustomer,
          mode: 'details',
          editProfile: true,
          bIsCurrentCustomer: true, /* We are only going to change in the A/T/AI */
        }
      }).instance.close.subscribe(result => {
        if (result?.bChangeCustomer) this.selectCustomer();
        else if (result?.bShouldUpdateCustomer) this.updateCurrentCustomer({ oCustomer: result?.oCustomer });
      }, (error) => {
        console.log("Error in customer: ", error);
        this.toastService.show({ type: "warning", text: `Something went wrong` });
      });
  }

  fetchLocationName() {
    this.apiService.postNew('core', `/api/v1/business/${this.iBusinessId}/list-location`, { iBusinessId: this.iBusinessId }).subscribe((result: any) => {
      if (result?.data?.aLocation?.length) {
        let aLocation = result.data.aLocation;
        aLocation.forEach((oLocation: any) => {
          if (oLocation._id == this.transaction.aTransactionItems[0].iLocationId) {
            this.businessLocationName = oLocation?.sName;
          }
        });
      }
    });
  }
}
