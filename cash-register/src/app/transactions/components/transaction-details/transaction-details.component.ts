import { Component, OnInit, ViewContainerRef } from '@angular/core';
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
const moment = (_moment as any).default ? (_moment as any).default : _moment;
// import { faMagnifyingGlassPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.sass']
})
export class TransactionDetailsComponent implements OnInit {

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
  thermalPrintSettings !: any;
  // faMagnifyingGlassPlus = faMagnifyingGlassPlus;
  // SupplierStockProductSliderData = new BehaviorSubject<any>({});
  // @ViewChild('supplierSliderTemplate', { read: ViewContainerRef }) container!: ViewContainerRef;
  // componentRef: any;

  private pn2escposService = new Pn2escposService();
  printSettings: any;
  printActionSettings:any;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
    private dialogService: DialogService,
    private receiptService: ReceiptService,
    private printService: PrintService,
    private toastService: ToastService
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
    let dataObject = JSON.parse(JSON.stringify(this.transaction));
    dataObject.aPayments.forEach((obj: any) => {
      obj.dCreatedDate = moment(dataObject.dCreatedDate).format('DD-MM-yyyy hh:mm');
    });
    dataObject.aTransactionItems = [];
    const relatedItemsPromises: any = [];
    this.transaction.aTransactionItems.forEach((item: any, index: number) => {
      if (!(item.oType?.eKind == 'discount' || item?.oType?.eKind == 'loyalty-points-discount')) {
        dataObject.aTransactionItems.push(item);
      }
    })
    let language: any = localStorage.getItem('language')
    dataObject.total = 0;
    let total = 0, totalAfterDisc = 0, totalVat = 0, totalDiscount = 0, totalSavingPoints = 0;
    dataObject.aTransactionItems.forEach((item: any, index: number) => {
      let name = '';
      if (item && item.oArticleGroupMetaData && item.oArticleGroupMetaData.oName && item.oArticleGroupMetaData.oName[language]) {
        name = item?.oArticleGroupMetaData?.oName[language] + ' ';
      }
      item.description = name;
      if (item?.oBusinessProductMetaData?.sLabelDescription) item.description = item.description + item?.oBusinessProductMetaData?.sLabelDescription + ' ' + item?.sProductNumber;
      totalSavingPoints += item.nSavingsPoints;
      let disc = parseFloat(item.nDiscount);
      if (item.bPaymentDiscountPercent) {
        disc = (disc * parseFloat(item.nPriceIncVat) / (100 + parseFloat(item.nVatRate)));
        item.nDiscountToShow = parseFloat(disc.toFixed(2));
      } else { item.nDiscountToShow = disc; }
      item.priceAfterDiscount = (parseFloat(item.nPaymentAmount) - parseFloat(item.nDiscountToShow));
      item.nPriceIncVatAfterDiscount = (parseFloat(item.nPriceIncVat) - parseFloat(item.nDiscountToShow));
      item.totalPaymentAmount = parseFloat(item.nPaymentAmount) * parseFloat(item.nQuantity);
      item.totalPaymentAmountAfterDisc = parseFloat(item.priceAfterDiscount) * parseFloat(item.nQuantity);
      item.bPrepayment = item?.oType?.bPrepayment || false;
      const vat = (item.nVatRate * item.priceAfterDiscount / (100 + parseFloat(item.nVatRate)));
      item.vat = vat.toFixed(2);
      totalVat += vat;
      total = total + item.totalPaymentAmount;
      totalAfterDisc += item.totalPaymentAmountAfterDisc;
      totalDiscount += disc;
      relatedItemsPromises[index] = this.getRelatedTransactionItem(item?.iActivityItemId, item?._id, index);
    })
    await Promise.all(relatedItemsPromises).then(result => {
      result.forEach((item: any, index: number) => {
        this.transaction.aTransactionItems[index].related = item.data || [];
      })
    });

    dataObject.totalAfterDisc = parseFloat(totalAfterDisc.toFixed(2));
    dataObject.total = parseFloat(total.toFixed(2));
    dataObject.totalVat = parseFloat(totalVat.toFixed(2));
    dataObject.totalDiscount = parseFloat(totalDiscount.toFixed(2));
    dataObject.totalSavingPoints = totalSavingPoints;
    dataObject.totalQty = this.transaction.aTransactionItems?.length || 0;
    dataObject.dCreatedDate = moment(dataObject.dCreatedDate).format('DD-MM-yyyy hh:mm');
    this.getRelatedTransaction(dataObject?.iActivityId, dataObject?._id)

    this.transaction = dataObject;
    
    this.loading = false;
    this.fetchBusinessDetails();
    this.fetchCustomer(this.transaction.oCustomer._id);
    // this.fetchTransaction(this.transaction.sNumber)
    const [_thermalSettings, _printActionSettings, _printSettings]: any = await Promise.all([
      this.getThermalPrintSetting(),
      this.getPdfPrintSetting({ oFilterBy: { sMethod: 'actions' } }),
      this.getPdfPrintSetting(),
    ]);

    if (_thermalSettings?.data?._id) {
      this.thermalPrintSettings = _thermalSettings?.data;
    }

    this.printActionSettings = _printActionSettings?.data[0]?.result[0].aActions;
    this.printSettings = _printSettings?.data[0]?.result;

    // console.log(80, this.transaction);
  }

  fetchBusinessDetails() {
    this.apiService.getNew('core', '/api/v1/business/' + this.iBusinessId)
      .subscribe(
        (result: any) => {
          this.businessDetails = result.data;
          this.businessDetails.currentLocation = this.businessDetails?.aLocation?.filter((location: any) => location?._id.toString() == this.iLocationId.toString())[0];
          this.ableToDownload = true;
        })
  }

  getRelatedTransactionItem(iActivityItemId: string, iTransactionItemId: string, index: number) {
    return this.apiService.getNew('cashregistry', `/api/v1/transaction/item/activityItem/${iActivityItemId}?iBusinessId=${this.iBusinessId}&iTransactionItemId=${iTransactionItemId}`).toPromise();
  }


  // getRelatedTransactionItem(iActivityItemId: string, iTransactionItemId: string, index: number) {
  //   this.apiService.getNew('cashregistry', `/api/v1/transaction/item/activityItem/${iActivityItemId}?iBusinessId=${this.iBusinessId}&iTransactionItemId=${iTransactionItemId}`)
  //     .subscribe(
  //       (result: any) => {
  //         this.transaction.aTransactionItems[index].related = result.data || [];
  //       }, (error) => {
  //         console.log(error);
  //       })
  // }

  getRelatedTransaction(iActivityId: string, iTransactionId: string) {
    const body = {
      iBusinessId: this.iBusinessId,
      iTransactionId: iTransactionId
    }
    this.apiService.postNew('cashregistry', '/api/v1/transaction/activity/' + iActivityId, body)
      .subscribe(
        (result: any) => {
          this.transaction.related = result.data || [];
          this.transaction.related.forEach((obj: any) => {
            obj.aPayments.forEach((obj: any) => {
              obj.dCreatedDate = moment(obj.dCreatedDate).format('DD-MM-yyyy hh:mm');
            });
            this.transaction.aPayments = this.transaction.aPayments.concat(obj.aPayments);
          })
        }, (error) => {
          console.log(error);
        })
  }

  close(value: boolean) {
    this.dialogRef.close.emit(value);
  }

  downloadWithVAT(print: boolean = false) {
    this.generatePDF(print);
  }

  downloadWebOrder() {
    this.generatePDF(false);
  }

  getPdfPrintSetting(oFilterBy?: any) {
    const oBody = {
      iLocationId: this.iLocationId,
      ...oFilterBy
    }
    return this.apiService.postNew('cashregistry', `/api/v1/print-settings/list/${this.iBusinessId}`, oBody).toPromise();
  }

  async generatePDF(print: boolean) {
    const sName = 'Sample', eType = this.transaction.eType;
    this.downloadWithVATLoading = true;
    this.transaction.businessDetails = this.businessDetails;
    for (let i = 0; i < this.businessDetails?.aLocation.length; i++) {
      if (this.businessDetails.aLocation[i]?._id.toString() == this.iLocationId.toString()) {
        this.transaction.currentLocation = this.businessDetails.aLocation[i];
      }
    }

    const template = await this.getTemplate('regular').toPromise();
    // const template = await this.getTemplate('single-activity').toPromise();
    let nTotalOriginalAmount = 0;
    const oDataSource = JSON.parse(JSON.stringify(this.transaction));
    if (oDataSource.aTransactionItems?.length === 1 && oDataSource._id === oDataSource.aTransactionItems[0].iTransactionId) {
      nTotalOriginalAmount = oDataSource.total;
      oDataSource.bHasPrePayments = false;
    } else {
      oDataSource.aTransactionItems.forEach((item: any) => {
        nTotalOriginalAmount += item.nPriceIncVat;
        let description = `${item.description}\n`;
        if (item.nPriceIncVat !== item.nPaymentAmount) {
          description += `Original amount: ${item.nPriceIncVat}\n
                          Already paid: \n${item.sTransactionNumber} | ${item.nPaymentAmount} (this receipt)\n`;

          if (item?.related?.length) {
            item.related.forEach((related: any) => {
              description += `${related.sTransactionNumber}|${related.nPaymentAmount}\n`;
            });
          }
        }

        item.description = description;
      });
      oDataSource.bHasPrePayments = true;
    }
    oDataSource.sBarcodeURI = this.generateBarcodeURI(false, oDataSource.sNumber);
    oDataSource.sBusinessLogoUrl = (await this.getBase64FromUrl(oDataSource?.businessDetails?.sLogoLight).toPromise()).data;
    oDataSource.oCustomer = {
      sFirstName: this.transaction.oCustomer.sFirstName,
      sLastName: this.transaction.oCustomer.sLastName,
      sEmail: this.transaction.oCustomer.sEmail,
      sMobile: this.transaction.oCustomer.oPhone?.sCountryCode + this.transaction.oCustomer.oPhone?.sMobile,
      sLandLine: this.transaction.oCustomer.oPhone?.sLandLine,

    };

    oDataSource.nTotalOriginalAmount = nTotalOriginalAmount;
    this.receiptService.exportToPdf({
      oDataSource: oDataSource,
      pdfTitle: oDataSource.sNumber,
      templateData: template.data,
      printSettings: this.printSettings,
      printActionSettings: this.printActionSettings,
      eSituation: 'is_created'
    });

    return;
    this.apiService.getNew('cashregistry', '/api/v1/pdf/templates/' + this.iBusinessId + '?sName=' + sName + '&eType=' + eType).subscribe(
      (result: any) => {
        const filename = new Date().getTime().toString()
        let printData = null
        if (print) {
          printData = {
            computerId: this.thermalPrintSettings?.nComputerId,
            printerId: this.thermalPrintSettings?.nPrinterId,
            title: filename,
            quantity: 1
          }
        }

        // let dataObject = JSON.parse(JSON.stringify(this.transaction));
        // dataObject.aTransactionItems = [];
        // this.transaction.aTransactionItems.forEach((item: any)=>{
        //   if(!(item.oType?.eKind == 'discount' || item?.oType?.eKind == 'loyalty-points-discount')) {
        //     dataObject.aTransactionItems.push(item);
        //   }
        // })
        // let language: any = localStorage.getItem('language')
        // dataObject.total = 0;
        // let total = 0, totalAfterDisc = 0, totalVat = 0, totalDiscount = 0, totalSavingPoints = 0;
        // dataObject.aTransactionItems.forEach((item: any)=>{
        //   total = total + item.nPriceIncVat;
        //   let name = '';
        //   if(item && item.oArticleGroupMetaData && item.oArticleGroupMetaData.oName && item.oArticleGroupMetaData.oName[language]) name = item?.oArticleGroupMetaData?.oName[language] + ' ';
        //   item.description = name;
        //   if(item?.oBusinessProductMetaData?.sLabelDescription) item.description = item.description + item?.oBusinessProductMetaData?.sLabelDescription + ' ' + item?.sProductNumber;
        //   totalSavingPoints += item.nSavingsPoints;
        //   let disc = item.nDiscount;
        //   if(item.bPaymentDiscountPercent){ 
        //     disc = (item.nDiscount * item.nPriceIncVat/100)
        //     item.nDiscount = `${item.nDiscount}`
        //   } else {
        //     item.nDiscount = `€ ${item.nDiscount}`
        //   }
        //   item.priceAfterDiscount = (item.nPriceIncVat -  item.nDiscount);
        //   if(item.bPaymentDiscountPercent) item.nDiscount = `${item.nDiscount} %`
        //   const vat = (item.nVatRate * item.priceAfterDiscount/100);
        //   item.vat = `${item.nVatRate}% (${vat})`
        //   totalVat += vat;
        //   totalAfterDisc += (parseFloat(item.nPriceIncVat) -  parseFloat(item.nDiscount))
        //   totalDiscount += disc;
        // })
        // dataObject.totalAfterDisc = totalAfterDisc;
        // dataObject.total = total;
        // dataObject.totalVat = totalVat;
        // dataObject.totalDiscount = totalDiscount;
        // dataObject.totalSavingPoints = totalSavingPoints;
        // dataObject.dCreatedDate = moment(dataObject.dCreatedDate).format('DD-MM-yyyy hh:mm');
        delete this.transaction.related;

        // this.pdfService.createPdf(JSON.stringify(result.data), this.transaction, filename, print, printData, this.iBusinessId, this.transaction?._id)
        //   .then(() => {
        //     this.downloadWithVATLoading = false;
        //   })
        //   .catch((e: any) => {
        //     this.downloadWithVATLoading = false;
        //     console.error('err', e)
        //   })
      }, (error) => {
        this.downloadWithVATLoading = false;
        console.log('printing error', error);
      })
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
    return this.apiService.getNew('cashregistry', `/api/v1/pdf/templates/${this.iBusinessId}?eType=${type}`);
  }

  fetchCustomer(customerId: any) {
    this.apiService.getNew('customer', `/api/v1/customer/${customerId}?iBusinessId=${this.iBusinessId}`).subscribe(
      (result: any) => {
        this.transaction.oCustomer = result;
      },
      (error: any) => {
        console.error(error)
      }
    );
  }

  // fetchTransaction(sNumber: any) {
  //   if (!sNumber) return;
  //   this.loading = true;
  //   let body: any = {
  //     iBusinessId: this.iBusinessId
  //   }
  //   if (this.eType === 'webshop-reservation') body.eKind = 'reservation';
  //   this.apiService.postNew('cashregistry', '/api/v1/transaction/detail/' + sNumber, body).subscribe((result: any) => {
  //     if (!result?.data?.oCustomer) result.data.oCustomer = this.transaction.oCustomer;
  //     this.transaction = result.data;
  //     this.loading = false;
  //   }, (error) => {
  //     this.loading = false;
  //   });
  // }

  openTransaction(transaction: any, itemType: any) {
    this.dialogService.openModal(TransactionItemsDetailsComponent, { cssClass: "modal-xl", context: { transaction, itemType } })
      .instance.close.subscribe(result => {
        const transactionItems: any = [];
        if (result.transaction) {
          result.transactionItems.forEach((transactionItem: any) => {
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
                aImage: transactionItem.aImage,
                nonEditable: transactionItem.sGiftCardNumber ? true : false,
                sGiftCardNumber: transactionItem.sGiftCardNumber,
                quantity: transactionItem.nQuantity,
                price: transactionItem.nPriceIncVat,
                iRepairerId: transactionItem.iRepairerId,
                oArticleGroupMetaData: transactionItem.oArticleGroupMetaData,
                iEmployeeId: transactionItem.iEmployeeId,
                iBrandId: transactionItem.iBrandId,
                discount: 0,
                tax: transactionItem.nVatRate,
                iSupplierId: transactionItem.iSupplierId,
                paymentAmount,
                description: transactionItem.sDescription,
                oBusinessProductMetaData: transactionItem.oBusinessProductMetaData,
                sServicePartnerRemark: transactionItem.sServicePartnerRemark,
                eActivityItemStatus: transactionItem.eActivityItemStatus,
                eEstimatedDateAction: transactionItem.eEstimatedDateAction,
                bGiftcardTaxHandling: transactionItem.bGiftcardTaxHandling,
                open: true,
              });
            }
          });
          result.transactionItems = transactionItems;
          localStorage.setItem('fromTransactionPage', JSON.stringify(result));
          localStorage.setItem('recentUrl', '/business/transactions');
          setTimeout(() => {
            this.close(true);
          }, 100);
        }
      });
  }

  getThermalPrintSetting() {
    return this.apiService.getNew('cashregistry', `/api/v1/print-settings/${this.iBusinessId}/${this.iWorkstationId}/thermal/regular`).toPromise();
    // .subscribe(
    //   (result: any) => {
    //     if (result?.data?._id) {
    //       this.thermalPrintSettings = result?.data;
    //     }
    //   },
    //   (error: any) => {
    //     console.error(error)
    //   }
    // );
  }

  openCustomer(customer: any) {
    this.dialogService.openModal(CustomerDetailsComponent,
      { cssClass: "modal-xl position-fixed start-0 end-0", context: { customer: customer, mode: 'details', from: 'transactions' } }).instance.close.subscribe(result => { });
  }

  async showActivityItem(activityItem: any, event: any) {
    const oBody = {
      iBusinessId: this.iBusinessId,
    }
    activityItem.bFetchingActivityItem = true;
    event.target.disabled = true;
    const _oActivityitem: any = await this.apiService.postNew('cashregistry', `/api/v1/activities/items/${activityItem.iActivityItemId}`, oBody).toPromise();
    const oActivityItem = _oActivityitem?.data[0]?.result[0];
    activityItem.bFetchingActivityItem = false;
    event.target.disabled = false;
    this.dialogService.openModal(ActivityDetailsComponent, { cssClass: 'w-fullscreen', context: { activity: oActivityItem, items: true, from: 'transaction-details' } })
      .instance.close.subscribe((result: any) => {

      });
  }

  getThermalReceipt() {
    if (!this.thermalPrintSettings?.nPrinterId || !this.thermalPrintSettings?.nComputerId) {
      this.toastService.show({ type: 'danger', text: 'Check your business -> printer settings' });
    }
    this.apiService.getNew('cashregistry', `/api/v1/print-template/business-receipt/${this.iBusinessId}/${this.iLocationId}`).subscribe((result: any) => {
      if (result?.data?.aTemplate?.length > 0) {
        let transactionDetails = { business: this.businessDetails, ...this.transaction };
        let command;
        try {
          command = this.pn2escposService.generate(JSON.stringify(result.data.aTemplate), JSON.stringify(transactionDetails));
        } catch (e) {
          this.toastService.show({ type: 'danger', text: 'Template not defined properly. Check browser console for more details' });
          console.log(e);
          return;
        }

        this.printService.openDrawer(this.iBusinessId, command, this.thermalPrintSettings?.nPrinterId, this.thermalPrintSettings?.nComputerId).then((response: any) => {
          if (response.status == "PRINTJOB_NOT_CREATED") {
            let message = '';
            if (response.computerStatus != 'online') {
              message = 'Your computer status is : ' + response.computerStatus + '.';
            } else if (response.printerStatus != 'online') {
              message = 'Your printer status is : ' + response.printerStatus + '.';
            }
            this.toastService.show({ type: 'warning', title: 'PRINTJOB_NOT_CREATED', text: message });
          } else {
            this.toastService.show({ type: 'success', text: 'PRINTJOB_CREATED', apiUrl: '/api/v1/printnode/print-job/' + response.id });
          }
        })
      } else if (result?.data?.aTemplate?.length == 0) {
        this.toastService.show({ type: 'danger', text: 'TEMPLATE_NOT_FOUND' });
      } else {
        this.toastService.show({ type: 'danger', text: 'Error while fetching print template' });
      }
    });
  }

  // onOpenProductSlider(data: any) {
  //   // data.bCanRightSliderTurnOnSupplier = this.oSupplierDetail?.bCanRightSliderTurnOn;
  //   data.bCanRightSliderTurnOnRetailer = this.businessDetails?.bCanRightSliderTurnOn;
  //   this.SupplierStockProductSliderData.next(data);
  //   this.loadDynamicComponent();
  // }

  // loadDynamicComponent() {
  //   try {
  //     import('supplierSlider/SupplierProductSliderModule').then(({ SupplierProductSliderModule }) => {
  //       this.compiler.compileModuleAsync(SupplierProductSliderModule).then(moduleFactory => {
  //         const moduleRef: NgModuleRef<typeof SupplierProductSliderModule> = moduleFactory.create(this.injector);
  //         const componentFactory = moduleRef.instance.resolveComponent();
  //         this.componentRef = this.container.createComponent(componentFactory, undefined, moduleRef.injector);
  //         this.componentRef.instance.title = 'My application';
  //       });
  //     });
  //   } catch (error) {
  //   }
  // }

}
