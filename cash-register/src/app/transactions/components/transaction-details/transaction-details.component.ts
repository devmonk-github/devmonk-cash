import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { faTimes, faSync, faFileInvoice, faDownload, faReceipt, faAt, faUndoAlt, faClipboard, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { TransactionItemsDetailsComponent } from 'src/app/shared/components/transaction-items-details/transaction-items-details.component';
import { ApiService } from 'src/app/shared/service/api.service';
import { DialogComponent, DialogService } from 'src/app/shared/service/dialog';
import { PdfService } from 'src/app/shared/service/pdf.service';
import * as _moment from 'moment';
import { CustomerDetailsComponent } from 'src/app/shared/components/customer-details/customer-details.component';
const moment = (_moment as any).default ? (_moment as any).default : _moment;

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
  faReceipt = faReceipt;
  faAt = faAt;
  faUndoAlt = faUndoAlt;
  faClipboard = faClipboard;
  faTrashAlt = faTrashAlt;
  transaction: any = {};
  iBusinessId: string = '';
  iLocationId: string = '';
  loading: boolean = true;
  customerLoading: boolean = true;
  customer: any = {};
  imagePlaceHolder: string = '../../../../assets/images/no-photo.svg';
  eType: string = '';
  computerId: number | undefined;
  printerId: number | undefined;
  transactionId: string = '5c2f276e86a7527e67a45e9d'
  pdfGenerating: Boolean = false;
  downloadWithVATLoading: Boolean = false;
  businessDetails: any = {};
  ableToDownload: Boolean = false;
  from !: string;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
    private dialogService: DialogService,
    private pdfService: PdfService
  ) {
    const _injector = this.viewContainerRef.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit(): void {
    this.iBusinessId = localStorage.getItem("currentBusiness") || '';
    this.iLocationId = localStorage.getItem("currentLocation") || '';
    let dataObject = JSON.parse(JSON.stringify(this.transaction));
    dataObject.aPayments.forEach((obj: any) => {
      obj.dCreatedDate = moment(dataObject.dCreatedDate).format('DD-MM-yyyy hh:mm');
    });
    dataObject.aTransactionItems = [];
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
      if (item && item.oArticleGroupMetaData && item.oArticleGroupMetaData.oName && item.oArticleGroupMetaData.oName[language]) name = item?.oArticleGroupMetaData?.oName[language] + ' ';
      item.description = name;
      if (item?.oBusinessProductMetaData?.sLabelDescription) item.description = item.description + item?.oBusinessProductMetaData?.sLabelDescription + ' ' + item?.sProductNumber;
      totalSavingPoints += item.nSavingsPoints;
      let disc = parseFloat(item.nDiscount);
      if(item.bPaymentDiscountPercent){ 
        disc = (disc * parseFloat(item.nPriceIncVat)/(100 + parseFloat(item.nVatRate)));
        item.nDiscountToShow = disc;
      } else { item.nDiscountToShow = disc; }
      item.priceAfterDiscount = (parseFloat(item.nPaymentAmount) - parseFloat(item.nDiscountToShow));
      item.totalPaymentAmount = parseFloat(item.nPaymentAmount) * parseFloat(item.nQuantity);
      item.totalPaymentAmountAfterDisc = parseFloat(item.priceAfterDiscount) * parseFloat(item.nQuantity);
      item.bPrepayment = item?.oType?.bPrepayment || false;
      const vat = (item.nVatRate * item.priceAfterDiscount/(100 + parseFloat(item.nVatRate)));
      item.vat = vat.toFixed(2);
      totalVat += vat;
      total = total + item.totalPaymentAmount;
      totalAfterDisc += item.totalPaymentAmountAfterDisc;
      totalDiscount += disc;
      this.getRelatedTransactionItem(item?.iActivityItemId, item?._id, index)
    })
    dataObject.totalAfterDisc = parseFloat(totalAfterDisc.toFixed(2));
    dataObject.total = parseFloat(total.toFixed(2));
    dataObject.totalVat = parseFloat(totalVat.toFixed(2));
    dataObject.totalDiscount = parseFloat(totalDiscount.toFixed(2));
    dataObject.totalSavingPoints = totalSavingPoints;
    dataObject.dCreatedDate = moment(dataObject.dCreatedDate).format('DD-MM-yyyy hh:mm');
    this.getRelatedTransaction(dataObject?.iActivityId, dataObject?._id)

    this.transaction = dataObject;

    this.fetchBusinessDetails();
    this.fetchCustomer(this.transaction.oCustomer._id);
    this.fetchTransaction(this.transaction.sNumber)
    this.getPrintSetting();
  }

  fetchBusinessDetails() {
    this.apiService.getNew('core', '/api/v1/business/' + this.iBusinessId)
      .subscribe(
        (result: any) => {
          this.businessDetails = result.data;
          this.ableToDownload = true;
        })
  }

  getRelatedTransactionItem(iActivityItemId: string, iTransactionItemId: string, index: number) {
    this.apiService.getNew('cashregistry', `/api/v1/transaction/item/activityItem/${iActivityItemId}?iBusinessId=${this.iBusinessId}&iTransactionItemId=${iTransactionItemId}`)
      .subscribe(
        (result: any) => {
          this.transaction.aTransactionItems[index].related = result.data || [];
        }, (error) => {
          console.log(error);
        })
  }

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

  downloadWithVAT() {
    this.generatePDF(false);
  }

  downloadWebOrder() {
    this.generatePDF(false);
  }

  generatePDF(print: boolean): void {
    const sName = 'Sample', eType = this.transaction.eType;
    this.downloadWithVATLoading = true;
    this.transaction.businessDetails = this.businessDetails;
    for (let i = 0; i < this.businessDetails?.aLocation.length; i++) {
      if (this.businessDetails.aLocation[i]?._id.toString() == this.iLocationId.toString()) {
        this.transaction.currentLocation = this.businessDetails.aLocation[i];
      }
    }
    this.apiService.getNew('cashregistry', '/api/v1/pdf/templates/' + this.iBusinessId + '?sName=' + sName + '&eType=' + eType).subscribe(
      (result: any) => {
        const filename = new Date().getTime().toString()
        let printData = null
        if (print) {
          printData = {
            computerId: this.computerId,
            printerId: this.printerId,
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

        this.pdfService.createPdf(JSON.stringify(result.data), this.transaction, filename, print, printData, this.iBusinessId, this.transaction?._id)
          .then(() => {
            this.downloadWithVATLoading = false;
          })
          .catch((e: any) => {
            this.downloadWithVATLoading = false;
            console.error('err', e)
          })
      }, (error) => {
        this.downloadWithVATLoading = false;
        console.log('printing error', error);
      })
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

  fetchTransaction(sNumber: any) {
    if (!sNumber) return;
    this.loading = true;
    let body: any = {
      iBusinessId: this.iBusinessId
    }
    if (this.eType === 'webshop-reservation') body.eKind = 'reservation';
    this.apiService.postNew('cashregistry', '/api/v1/transaction/detail/' + sNumber, body).subscribe((result: any) => {
      if (!result?.data?.oCustomer) result.data.oCustomer = this.transaction.oCustomer;
      this.transaction = result.data;
      this.loading = false;
    }, (error) => {
      this.loading = false;
    });
  }

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

  getPrintSetting() {
    this.apiService.getNew('cashregistry', '/api/v1/print-settings/' + '6182a52f1949ab0a59ff4e7b' + '/' + '624c98415e537564184e5614').subscribe(
      (result: any) => {
        this.computerId = result?.data?.nComputerId;
        this.printerId = result?.data?.nPrinterId;
      },
      (error: any) => {
        console.error(error)
      }
    );
  }

  openCustomer(customer: any) {
    this.dialogService.openModal(CustomerDetailsComponent, 
      { cssClass: "modal-xl position-fixed start-0 end-0", context: { customer: customer, mode: 'details', from:'transactions' } }).instance.close.subscribe(result => {  });
  }
}
