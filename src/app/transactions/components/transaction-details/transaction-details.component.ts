import { AfterContentInit, ChangeDetectorRef, Component, OnInit, ViewContainerRef } from '@angular/core';
import { faTimes, faSync, faFileInvoice, faDownload, faReceipt, faAt, faUndoAlt, faClipboard, faTrashAlt, faPrint } from '@fortawesome/free-solid-svg-icons';
import { TransactionItemsDetailsComponent } from 'src/app/shared/components/transaction-items-details/transaction-items-details.component';
import { ApiService } from 'src/app/shared/service/api.service';
import { DialogComponent, DialogService } from 'src/app/shared/service/dialog';
// import { PdfService } from 'src/app/shared/service/pdf.service';
import * as _moment from 'moment';
import { CustomerDetailsComponent } from 'src/app/shared/components/customer-details/customer-details.component';
import { ActivityDetailsComponent } from 'src/app/shared/components/activity-details-dialog/activity-details.component';
import { ReceiptService } from 'src/app/shared/service/receipt.service';
import { Pn2escposService } from 'src/app/shared/service/pn2escpos.service';
import { PrintService } from 'src/app/shared/service/print.service';
import { Observable } from 'rxjs';
import { ToastService } from 'src/app/shared/components/toast';
import * as JsBarcode from 'jsbarcode';
import { TillService } from 'src/app/shared/service/till.service';
import { TranslateService } from '@ngx-translate/core';
const moment = (_moment as any).default ? (_moment as any).default : _moment;
// import { faMagnifyingGlassPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.sass']
})
export class TransactionDetailsComponent implements OnInit, AfterContentInit {

  dialogRef: DialogComponent;
  faTimes = faTimes;
  faSync = faSync;
  faFileInvoice = faFileInvoice;
  faDownload = faDownload;
  faPrint = faPrint;
  faReceipt = faReceipt;
  faAt = faAt;
  faUndoAlt = faUndoAlt;
  faClipboard = faClipboard;
  faTrashAlt = faTrashAlt;
  transaction: any = {};
  iBusinessId: string = '';
  iLocationId: string = '';
  iWorkstationId: string = '';
  loading: boolean = true;
  customerLoading: boolean = true;
  customer: any = {};
  imagePlaceHolder: string = '../../../../assets/images/no-photo.svg';
  eType: string = '';
  transactionId: string = '5c2f276e86a7527e67a45e9d'
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

  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
    private dialogService: DialogService,
    private receiptService: ReceiptService,
    private printService: PrintService,
    private toastService: ToastService,
    public tillService: TillService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private pn2escposService: Pn2escposService
    // private compiler: Compiler,
    // private injector: Injector,
  ) {
    const _injector = this.viewContainerRef.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  async ngOnInit() {
    this.iBusinessId = localStorage.getItem("currentBusiness") || '';
    this.iLocationId = localStorage.getItem("currentLocation") || '';
    this.iWorkstationId = localStorage.getItem("currentWorkstation") || '';
    // let language: any = localStorage.getItem('language')
    this.transaction.businessDetails = this.businessDetails;
    this.transaction.currentLocation = this.businessDetails.currentLocation;
    
    this.transaction = await this.tillService.processTransactionForPdfReceipt(this.transaction);
    this.transaction.nTotalOriginalAmount = 0;
    this.transaction.nTotalQty = 0;

    this.transaction.aTransactionItems.forEach((item: any) => {
      // let description = (item?.nDiscountToShow > 0) nTotalQty? `Original amount: ${item.nPriceIncVat}\n` : '';
      this.transaction.nTotalQty += item.nQuantity;
      let description = (item?.totalPaymentAmount != item?.nPriceIncVatAfterDiscount) ? `${this.translateService.instant('ORIGINAL_AMOUNT_INC_DISC')}: ${item.nPriceIncVatAfterDiscount}\n` : '';
      if (item?.related?.length) {
        this.transaction.nTotalOriginalAmount += item.nPriceIncVatAfterDiscount;
        if (item.nPriceIncVatAfterDiscount !== item.nRevenueAmount) {
          description += `${this.translateService.instant('ALREADY_PAID')}: \n${item.sTransactionNumber} | ${item.nRevenueAmount} (${this.translateService.instant('THIS_RECEIPT')})\n`;

          item.related.forEach((related: any) => {
            description += `${related.sTransactionNumber} | ${related.nRevenueAmount}\n`;
          });
        }
      }
      item.description = description;
    });
    // console.log(this.transaction);
    
    this.loading = false;

    this.getPrintSetting()
    // this.getThermalPrintSetting()
    // this.getPdfPrintSetting({ oFilterBy: { sMethod: 'actions' } })
    this.mapEmployee();

    // console.log(this.transaction)

  }

  ngAfterContentInit(): void {
    this.cdr.detectChanges();
  }
  // fetchBusinessDetails() {
  //   this.apiService.getNew('core', '/api/v1/business/' + this.iBusinessId)
  //     .subscribe(
  //       (result: any) => {
  //         this.businessDetails = result.data;
  //         this.businessDetails.currentLocation = this.businessDetails?.aLocation?.filter((location: any) => location?._id.toString() == this.iLocationId.toString())[0];
  //         this.tillService.selectCurrency(this.businessDetails.currentLocation);
  //         this.ableToDownload = true;
  //       })
  // }

  // getRelatedTransactionItem(iActivityItemId: string, iTransactionItemId: string, index: number) {
  //   return this.apiService.getNew('cashregistry', `/api/v1/transaction/item/activityItem/${iActivityItemId}?iBusinessId=${this.iBusinessId}&iTransactionItemId=${iTransactionItemId}`).toPromise();
  // }

  // getRelatedTransaction(iActivityId: string, iTransactionId: string) {
  //   const body = {
  //     iBusinessId: this.iBusinessId,
  //     iTransactionId: iTransactionId
  //   }
  //   this.apiService.postNew('cashregistry', '/api/v1/transaction/activity/' + iActivityId, body)
  //     .subscribe(
  //       (result: any) => {
  //         this.transaction.related = result.data || [];
  //         this.transaction.related.forEach((obj: any) => {
  //           obj.aPayments.forEach((obj: any) => {
  //             obj.dCreatedDate = moment(obj.dCreatedDate).format('DD-MM-yyyy hh:mm');
  //           });
  //           this.transaction.aPayments = this.transaction.aPayments.concat(obj.aPayments);
  //         })
  //       }, (error) => {
  //         console.log(error);
  //       })
  // }

  close(value: boolean) {
    this.dialogRef.close.emit(value);
  }

  downloadWithVAT(print: boolean = false) {
    this.generatePDF(print);
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

    
    // for (let i = 0; i < this.businessDetails?.aLocation.length; i++) {
    //   if (this.businessDetails.aLocation[i]?._id.toString() == this.iLocationId.toString()) {
    //   }
    // }

    const template = await this.getTemplate('regular').toPromise();
    // const template = await this.getTemplate('single-activity').toPromise();
    const oDataSource = JSON.parse(JSON.stringify(this.transaction));
      
    oDataSource.sBarcodeURI = this.generateBarcodeURI(false, oDataSource.sNumber);
    oDataSource.sActivityBarcodeURI = this.generateBarcodeURI(false, oDataSource.sActivityNumber);
    oDataSource.sBusinessLogoUrl = (await this.getBase64FromUrl(oDataSource?.businessDetails?.sLogoLight).toPromise()).data;
    // oDataSource.oCustomer = {
    //   sFirstName: this.transaction.oCustomer.sFirstName,
    //   sLastName: this.transaction.oCustomer.sLastName,
    //   sEmail: this.transaction.oCustomer.sEmail,
    //   sMobile: this.transaction.oCustomer.oPhone?.sCountryCode + this.transaction.oCustomer.oPhone?.sMobile,
    //   sLandLine: this.transaction.oCustomer.oPhone?.sLandLine,

    // };
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

  generateBarcodeURI(displayValue: boolean = true, data: any) {
    var canvas = document.createElement("canvas");
    JsBarcode(canvas, data, { format: "CODE128", displayValue: displayValue });
    return canvas.toDataURL("image/png");
  }

  getBase64FromUrl(url: any): Observable<any> {
    return this.apiService.getNew('cashregistry', `/api/v1/pdf/templates/getBase64/${this.iBusinessId}?url=${url}`);
  }

  getTemplate(type: string): Observable<any> {
    return this.apiService.getNew('cashregistry', `/api/v1/pdf/templates/${this.iBusinessId}?eType=${type}&iLocationId=${this.iLocationId}`);
  }

  // fetchCustomer(customerId: any) {
  //   this.apiService.getNew('customer', `/api/v1/customer/${customerId}?iBusinessId=${this.iBusinessId}`).subscribe(
  //     (result: any) => {

  //       // console.log('fetch customer result', result)
  //       // this.transaction.oCustomer = result;
  //       this.transaction.oCustomer = {
  //         sFirstName: result?.sFirstName,
  //         sPrefix: result?.sPrefix,
  //         sLastName: result?.sLastName,
  //         sEmail: result?.sEmail,
  //         sMobile: result?.oPhone?.sCountryCode + result?.oPhone?.sMobile,
  //         sLandLine: result?.oPhone?.sLandLine,
  //         oInvoiceAddress: result?.oInvoiceAddress,
  //         oShippingAddress: result?.oShippingAddress
  //       };

  //     },
  //     (error: any) => {
  //       console.error(error)
  //     }
  //   );
  // }

  openTransaction(transaction: any, itemType: any) {
    this.dialogService.openModal(TransactionItemsDetailsComponent, { cssClass: "modal-xl", context: { transaction, itemType } })
      .instance.close.subscribe(result => {
        // console.log({result});
        // const transactionItems: any = [];
        if (result.transaction) {
          const data = this.tillService.processTransactionSearchResult(result);
          // console.log(data);
          // result.transactionItems.forEach((transactionItem: any) => {
          //   if (transactionItem.isSelected) {
          //     const { tType } = transactionItem;
          //     let paymentAmount = transactionItem.nQuantity * transactionItem.nPriceIncVat - transactionItem.nPaidAmount;
          //     if (tType === 'refund') {
          //       paymentAmount = -1 * transactionItem.nPaidAmount;
          //       transactionItem.oType.bRefund = true;
          //     } else if (tType === 'revert') {
          //       paymentAmount = transactionItem.nPaidAmount;
          //       transactionItem.oType.bRefund = false;
          //     };
          //     transactionItems.push({
          //       name: transactionItem.sProductName || transactionItem.sProductNumber,
          //       iActivityItemId: transactionItem.iActivityItemId,
          //       nRefundAmount: transactionItem.nPaidAmount,
          //       iLastTransactionItemId: transactionItem.iTransactionItemId,
          //       prePaidAmount: tType === 'refund' ? transactionItem.nPaidAmount : transactionItem.nPaymentAmount,
          //       type: transactionItem.sGiftCardNumber ? 'giftcard' : transactionItem.oType.eKind,
          //       eTransactionItemType: 'regular',
          //       nBrokenProduct: 0,
          //       tType,
          //       oType: transactionItem.oType,
          //       aImage: transactionItem.aImage,
          //       nonEditable: transactionItem.sGiftCardNumber ? true : false,
          //       sGiftCardNumber: transactionItem.sGiftCardNumber,
          //       quantity: transactionItem.nQuantity,
          //       price: transactionItem.nPriceIncVat,
          //       iRepairerId: transactionItem.iRepairerId,
          //       oArticleGroupMetaData: transactionItem.oArticleGroupMetaData,
          //       iEmployeeId: transactionItem.iEmployeeId,
          //       iBrandId: transactionItem.iBrandId,
          //       discount: 0,
          //       tax: transactionItem.nVatRate,
          //       iSupplierId: transactionItem.iSupplierId,
          //       paymentAmount,
          //       description: transactionItem.sDescription,
          //       oBusinessProductMetaData: transactionItem.oBusinessProductMetaData,
          //       sServicePartnerRemark: transactionItem.sServicePartnerRemark,
          //       eActivityItemStatus: transactionItem.eActivityItemStatus,
          //       eEstimatedDateAction: transactionItem.eEstimatedDateAction,
          //       bGiftcardTaxHandling: transactionItem.bGiftcardTaxHandling,
          //       open: true,
          //     });
          //   }
          // });

          // result.transactionItems = transactionItems;
          localStorage.setItem('fromTransactionPage', JSON.stringify(data));
          // localStorage.setItem('recentUrl', '/business/transactions');
          setTimeout(() => {
            this.close(true);
          }, 100);
        }
      });
  }

  // getThermalPrintSetting() {
  //   this.apiService.getNew('cashregistry', `/api/v1/print-settings/${this.iBusinessId}/${this.iWorkstationId}/thermal/regular`).subscribe((result:any) => {
  //     if (result?.data?._id) {
  //       this.thermalPrintSettings = result?.data;
  //     }
  //   });
  // }

  openCustomer(customer: any) {
    if(customer?._id){
      this.apiService.getNew('customer' , `/api/v1/customer/${this.iBusinessId}/${customer._id}`).subscribe((result:any)=>{
        if(result?.data){
          this.dialogService.openModal(CustomerDetailsComponent,
            { cssClass: "modal-xl position-fixed start-0 end-0", context: { customerData: result?.data, mode: 'details', from: 'transactions' } }).instance.close.subscribe(result => { });
        }else{
           this.toastService.show({type:'warning' , text:'No customer data available'})
        }
      }) 
    }else{
      this.toastService.show({type:'warning' , text:'No customer data available'})
    }

 
  }

  async showActivityItem(activityItem: any, event: any) {
    const oBody = {
      iBusinessId: this.iBusinessId,
    }
    activityItem.bFetchingActivityItem = true;
    event.target.disabled = true;
    // const _oActivityitem: any = await this.apiService.postNew('cashregistry', `/api/v1/activities/items/${activityItem.iActivityItemId}`, oBody).toPromise();
    // const oActivityItem = _oActivityitem?.data[0]?.result[0];
    activityItem.bFetchingActivityItem = false;
    event.target.disabled = false;
    this.dialogService.openModal(ActivityDetailsComponent, { cssClass: 'w-fullscreen', context: { activity:{_id:activityItem.iActivityItemId}, items: true, from: 'transaction-details' } })
      .instance.close.subscribe((result: any) => {

      });
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
    // return;

    // if (!this.thermalPrintSettings?.nPrinterId || !this.thermalPrintSettings?.nComputerId) {
    //   this.toastService.show({ type: 'danger', text: 'Check your business -> printer settings' });
    // }
    

    // this.apiService.getNew('cashregistry', `/api/v1/print-template/${type}/${this.iBusinessId}/${this.iLocationId}`).subscribe((result: any) => {
    //   if (result?.data?.aTemplate?.length > 0) {
    //     let transactionDetails = { businessDetails: this.businessDetails, ...this.transaction };
    //     transactionDetails.oCustomer = {
    //       ...transactionDetails.oCustomer,
    //       ...transactionDetails.oCustomer.oPhone,
    //       ...transactionDetails.oCustomer.oInvoiceAddress
    //     };
    //     let command;
    //     try {
    //       command = this.pn2escposService.generate(JSON.stringify(result.data.aTemplate), JSON.stringify(transactionDetails));
    //       console.log(command);
    //       return;
    //     } catch (e) {
    //       this.toastService.show({ type: 'danger', text: 'Template not defined properly. Check browser console for more details' });
    //       console.log(e);
    //       return;
    //     }
    //     // return;
    //     this.printService.createPrintJob(this.iBusinessId, command, this.thermalPrintSettings?.nPrinterId, this.thermalPrintSettings?.nComputerId, this.businessDetails.oPrintNode.sApiKey, this.transaction.sNumber).then((response: any) => {
    //       if (response.status == "PRINTJOB_NOT_CREATED") {
    //         let message = '';
    //         if (response.computerStatus != 'online') {
    //           message = 'Your computer status is : ' + response.computerStatus + '.';
    //         } else if (response.printerStatus != 'online') {
    //           message = 'Your printer status is : ' + response.printerStatus + '.';
    //         }
    //         this.toastService.show({ type: 'warning', title: 'PRINTJOB_NOT_CREATED', text: message });
    //       } else {
    //         this.toastService.show({ type: 'success', text: 'PRINTJOB_CREATED', apiUrl: '/api/v1/printnode/print-job', templateContext: { apiKey: this.businessDetails.oPrintNode.sApiKey, id: response.id } });
    //       }
    //     })
    //   } else if (result?.data?.aTemplate?.length == 0) {
    //     this.toastService.show({ type: 'danger', text: 'TEMPLATE_NOT_FOUND' });
    //   } else {
    //     this.toastService.show({ type: 'danger', text: 'Error while fetching print template' });
    //   }
    // });
  }

}
