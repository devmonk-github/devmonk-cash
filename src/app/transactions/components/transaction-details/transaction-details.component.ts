import { AfterContentInit, ChangeDetectorRef, Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { faTimes, faSync, faFileInvoice, faDownload, faReceipt, faAt, faUndoAlt, faClipboard, faTrashAlt, faPrint, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { TransactionItemsDetailsComponent } from 'src/app/shared/components/transaction-items-details/transaction-items-details.component';
import { ApiService } from 'src/app/shared/service/api.service';
import { DialogComponent, DialogService } from 'src/app/shared/service/dialog';
import * as _moment from 'moment';
import { CustomerDetailsComponent } from 'src/app/shared/components/customer-details/customer-details.component';
import { ActivityDetailsComponent } from 'src/app/shared/components/activity-details-dialog/activity-details.component';
import { ReceiptService } from 'src/app/shared/service/receipt.service';
import { Observable } from 'rxjs';
import { ToastService } from 'src/app/shared/components/toast';
import * as JsBarcode from 'jsbarcode';
import { TillService } from 'src/app/shared/service/till.service';
import { TranslateService } from '@ngx-translate/core';
import { TaxService } from 'src/app/shared/service/tax.service';
import { CustomerDialogComponent } from 'src/app/shared/components/customer-dialog/customer-dialog.component';

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
  
  iBusinessId: any = localStorage.getItem("currentBusiness");
  iLocationId: any = localStorage.getItem("currentLocation");
  iWorkstationId: any = localStorage.getItem("currentWorkstation");

  /* Check if saving points are enabled */
  savingPointsSetting:boolean = JSON.parse(localStorage.getItem('savingPoints') || '');
  
  loading: boolean = true;
  customerLoading: boolean = true;
  customer: any = {};
  imagePlaceHolder: string = '../../../../assets/images/no-photo.svg';
  eType: string = '';
  transactionId: string;
  pdfGenerating: Boolean = false;
  downloadWithVATLoading: Boolean = false;
  businessDetails: any = {};
  ableToDownload: Boolean = false;
  from !: string;
  // thermalPrintSettings !: any;
  employeesList:any =[];

  // private pn2escposService = new Pn2escposService(Object, this.translateService);
  printSettings: any;
  printActionSettings:any;
  printWithVATLoading: boolean = false;

  paymentEditMode = false;
  aNewSelectedPaymentMethods: any = [];
  payMethods: any;
  bDayStateChecking = false;
  bIsDayStateOpened = false;
  bIsOpeningDayState = false;

  translation: any = [];
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
    private taxService: TaxService
  ) {
    const _injector = this.viewContainerRef.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  async ngOnInit() {
    let translationKey = ['SUCCESSFULLY_UPDATED', 'NO_DATE_SELECTED'];
    this.translateService.get(translationKey).subscribe((res: any) => {
      this.translation = res;
    })
    
    this.transaction.businessDetails = this.businessDetails;
    this.transaction.currentLocation = this.businessDetails.currentLocation;
    
    this.getPaymentMethods()
    
    this.transaction = await this.tillService.processTransactionForPdfReceipt(this.transaction);
    this.transaction.nTotalOriginalAmount = 0;
    this.transaction.nTotalQty = 0;

    this.transaction.aTransactionItems.forEach((item: any) => {
      
      this.transaction.nTotalQty += item.nQuantity;
      let description = (item?.totalPaymentAmount != item?.nPriceIncVatAfterDiscount) ? `${this.translateService.instant('ORIGINAL_AMOUNT_INC_DISC')}: ${item.nPriceIncVatAfterDiscount}\n` : '';
      if (item?.related?.length) {
        this.transaction.nTotalOriginalAmount += item.nPriceIncVatAfterDiscount;
        if (item.nPriceIncVatAfterDiscount !== item.nRevenueAmount) {
          description += `${this.translateService.instant('ALREADY_PAID')}: \n${item.sTransactionNumber} | ${item.totalPaymentAmount} (${this.translateService.instant('THIS_RECEIPT')})\n`;

          item.related.forEach((related: any) => {
            description += `${related.sTransactionNumber} | ${related.nRevenueAmount * related.nQuantity}\n`;
          });
        }
      }
      item.description = description;
    });
    this.loading = false;

    this.getPrintSetting()
    this.mapEmployee();
    this.getSystemCustomer(this.transaction?.iCustomerId);
  }

  ngAfterContentInit(): void {
    this.cdr.detectChanges();
  }

  close(data: any) {
    this.dialogRef.close.emit(data);
  }

  downloadWithVAT(print: boolean = false) {
    this.generatePDF(print);
  }
  openProductInfo(product: any) {
    this.dialogRef.triggerEvent.emit({type:'open-slider',data: product});
  }

  downloadWebOrder() {
    this.generatePDF(false);
  }

  getPrintSetting() {
    const oBody = {
      iLocationId: this.iLocationId,
    }
    this.apiService.postNew('cashregistry', `/api/v1/print-settings/list/${this.iBusinessId}`, oBody).subscribe((result:any) => {
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
    if(emp) {
      this.transaction.createrDetail = emp;
      this.transaction.sAdvisedEmpFirstName = this.transaction.createrDetail?.sFirstName || 'a';
    }
  }

  async generatePDF(print: boolean) {
    if(print)
      this.printWithVATLoading = true;
    else 
      this.downloadWithVATLoading = true;

    const template = await this.getTemplate('regular').toPromise();
    const oDataSource = JSON.parse(JSON.stringify(this.transaction));
    oDataSource.sBusinessLogoUrl = '';
    try {
      const _result: any = await this.getBase64FromUrl(oDataSource?.businessDetails?.sLogoLight).toPromise();
      if(_result?.data) {
        oDataSource.sBusinessLogoUrl = _result?.data;
      }
    } catch (e) {}

    console.log(oDataSource)

    if(oDataSource?.oCustomer?.bCounter === true) {
      oDataSource.oCustomer = {};
    }

    oDataSource?.aPayments?.forEach((payment: any) => {
      payment.dCreatedDate = moment(payment.dCreatedDate).format('DD-MM-yyyy hh:mm');
    })
    
    this.receiptService.exportToPdf({
      oDataSource: oDataSource,
      pdfTitle: oDataSource.sNumber,
      templateData: template.data,
      printSettings: this.printSettings,
      printActionSettings: this.printActionSettings,
      eSituation: 'is_created',
      sAction: (print) ? 'print': 'download',
      sApiKey: this.businessDetails.oPrintNode.sApiKey,
    });
    if(print)
      this.printWithVATLoading = false
    else 
      this.downloadWithVATLoading = false;
  }


  getBase64FromUrl(url: any): Observable<any> {
    return this.apiService.getNew('cashregistry', `/api/v1/pdf/templates/getBase64/${this.iBusinessId}?url=${url}`);
  }

  getTemplate(type: string): Observable<any> {
    return this.apiService.getNew('cashregistry', `/api/v1/pdf/templates/${this.iBusinessId}?eType=${type}&iLocationId=${this.iLocationId}`);
  }

  openTransaction(transaction: any, itemType: any) {
    this.dialogService.openModal(TransactionItemsDetailsComponent, { cssClass: "modal-xl", context: { transaction, itemType } })
      .instance.close.subscribe(result => {
        if (result.transaction) {
          const data = this.tillService.processTransactionSearchResult(result);
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
    const _oActivityitem: any = await this.apiService.postNew('cashregistry', `/api/v1/activities/activity-item/${activityItem.iActivityItemId}`, oBody).toPromise();
    const oActivityItem = _oActivityitem?.data[0]?.result[0];
    console.log(oActivityItem);
    activityItem.bFetchingActivityItem = false;
    event.target.disabled = false;
    this.dialogService.openModal(ActivityDetailsComponent, { cssClass: 'w-fullscreen', context: { activityItems:[oActivityItem], items: true, from: 'transaction-details' } })
      .instance.close.subscribe((result: any) => {});
  }

  getThermalReceipt(type:string) {
    this.receiptService.printThermalReceipt({
      oDataSource: this.transaction,
      printSettings: this.printSettings,
      apikey: this.businessDetails.oPrintNode.sApiKey,
      title: this.transaction.sNumber,
      sType: 'regular',
      sTemplateType: type
    });
  }

  addRow() {
    this.aNewSelectedPaymentMethods.push({})
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
    this.transaction.aPayments.forEach((item: any) => {
      if (item.nNewAmount)
        this.transaction.nNewPaymentMethodTotal += parseFloat(item.nNewAmount);
    });
    if (this.aNewSelectedPaymentMethods?.length)
      this.aNewSelectedPaymentMethods.forEach((item: any) => {
        if (item.nAmount)
          this.transaction.nNewPaymentMethodTotal += parseFloat(item.nAmount);
      });
  }

  filterDuplicatePaymentMethods() {
    const aPresent:any = [...this.transaction.aPayments.map((item: any) => item.iPaymentMethodId), ...this.aNewSelectedPaymentMethods.map((item: any) => item._id)];
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
    const aPayments = this.transaction.aPayments.filter((payments: any) => !payments?.bIgnore);
    for (const item of aPayments) {
      if (item.nAmount != item.nNewAmount) {
        this.addExpenses({
          amount: item.nNewAmount - item.nAmount,
          type: 'payment-method-change',
          comment: 'Payment method change',
          iActivityId: this.transaction.iActivityId,
          oPayment: {
            iPaymentMethodId: item.iPaymentMethodId,
            nAmount: item.nNewAmount - item.nAmount,
            sMethod: item.sMethod,
            sRemarks: 'PAYMENT_METHOD_CHANGE'
          },
          nVatRate: nVatRate
        });
      }
    }

      for (const item of this.aNewSelectedPaymentMethods) {
        if (item.nAmount) {
          this.addExpenses({
            amount: item.nAmount,
            type: 'payment-method-change',
            comment: 'Payment method change',
            iActivityId: this.transaction.iActivityId,
            oPayment: {
              iPaymentMethodId: item._id,
              nAmount: item.nAmount,
              sMethod: item.sName.toLowerCase(),
              sRemarks: 'PAYMENT_METHOD_CHANGE'
            },
            nVatRate: nVatRate
          });
        }
      }
    
    this.paymentEditMode = false;
    event.target.disabled = false;

    this.toastService.show({ type: "success", text: this.translation['SUCCESSFULLY_UPDATED']  });
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
      if (result?.data) this.transaction.oSystemCustomer = result?.data;
    })
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

}

