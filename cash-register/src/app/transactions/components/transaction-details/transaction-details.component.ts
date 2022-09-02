import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { faTimes, faSync, faFileInvoice, faDownload, faReceipt, faAt, faUndoAlt, faClipboard, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { TransactionItemsDetailsComponent } from 'src/app/shared/components/transaction-items-details/transaction-items-details.component';
import { ApiService } from 'src/app/shared/service/api.service';
import { DialogComponent, DialogService } from 'src/app/shared/service/dialog';
import { PdfService } from 'src/app/shared/service/pdf.service';
import * as _moment from 'moment';
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
  templateString = {
    "barcodeheight": "10",
    "barcodetext": false,
    "barcodewidth": "auto",
    "currency": "€",
    "debug": false,
    "defaultElement": "span",
    "fontSize": "10px",
    "margins": [5, 5],
    "momentjs_dateformat": "",
    "name": "Transaction with VAT",
    "orientation": "landscape",
    "paperSize": "A5",
    "pixelsPerMm": "3.76",
    "rotation": "0",
    "layout": [
      {
        "row": [
          {
            "size": "4",
            "html": "<img src=\"https://lirp.cdn-website.com/2568326e/dms3rep/multi/opt/Juwelier-Bos-208w.png\" />"
          },
          {
            "size": 4,
            "html": [
              { "element": "span", "content": "[[oBusiness.sName]]" },
              { "element": "span", "content": "[[oBusiness.sEmail]]" },
              { "element": "span", "content": "[[oBusiness.oPhone.sMobile]]" },
              { "element": "span", "content": "[[oBusiness.oPhone.sLandline]]" },
              { "element": "span", "content": "<make function to combine address into single variable!!>" }

            ],
            "css": {
              "text-align": "right"
            }
          },
          {
            "size": "4",
            "html": [
              { "element": "span", "content": "(iban)" }, { "element": "br", "content": "" },
              { "element": "span", "content": "[[sInvoiceNumber]]" }, { "element": "br" },
              { "element": "span", "content": "(coc number)" }
            ],
            "css": {
              "text-align": "right"
            }
          }
        ],
        "css": {
          "padding": [0, 0, 5, 0]
        },
        "section": "meta"
      },
      {
        "row": [
          {
            "size": "12",
            "float": "left",
            "html": "Datum: [[dCreatedDate]]<br/>Bonnummer: [[sReceiptNumber]]"
          }
        ],
        "css": {
          "padding": [0, 0, 5, 0]
        },
        "section": "meta"
      },
      {
        "row": [
          {
            "size": "12",
            "float": "left",
            "html": "[[__CREATED_BY]] [[oEmployee.sName]]"
          }
        ],
        "css": {
          "padding": [0, 0, 5, 0]
        },
        "section": "meta"
      },
      {
        "row": [
          { "size": 2, "html": "[[__ART_NUMBER]]" },
          { "size": 1, "html": "[[__QUANTITY]]" },
          { "size": 3, "html": "[[__DESCRIPTION]]" },
          { "size": 2, "html": "[[__DISCOUNT]]" },
          { "size": 2, "html": "[[__AMOUNT]]", "css": { "text-align": "right" } }
        ],
        "css": {
          "font-weight": "bold",
          "margin-bottom": "2mm"
        }
      },
      {
        "row": [
          {
            "size": "6",
            "element": "table",
            "htmlBefore": "<tr><th>Betalingen:</th><th></th></tr>",
            "forEach": "aTransactionItems",
            "html": "<tr><td>[[sMethod]]</td><td>(amount)</td></tr>"
          },
          {
            "size": "6"
          }
        ],
        "css": {
          "padding": [3, 0, 0, 0]
        },
        "section": "payment"
      },
      {
        "row": [
          {
            "size": 2,
            "html": [
              {
                "element": "span",
                "content": "[[sProductNumber]]"
              }
            ]
          },
          {
            "size": 1,
            "html": [
              {
                "element": "span",
                "content": "[[nQuantity]]"
              }
            ]
          },
          {
            "size": "5",
            "html": [
              {
                "element": "span",
                "content": "[[sProductName]]",
                "css": {
                  "margin": [0, 0, 1, 0]
                }
              }
            ]
          },
          {
            "size": 2,
            "html": [
              {
                "element": "p",
                "content": "€ [[nPriceIncVat|money]]"
              }
            ]
          },
          {
            "size": 2,
            "html": [
              {
                "element": "p",
                "content": "€ [[nPriceIncVat|money]]"
              }
            ],
            "css": {
              "text-align": "right"
            }
          }
        ],
        "htmlBefore": "",
        "htmlAfter": "",
        "forEach": "aTransactionItems",
        "section": "products",
        "css": {
          "margin-bottom": "2mm"
        }
      },
      {
        "row": [
          {
            "size": "12",
            "html": "<hr/>"
          }
        ],
        "section": "payment"
      },
      {
        "row": [
          {
            "size": "6",
            "html": [
              {
                "element": "h3",
                "content": "Totaal"
              }
            ]
          },
          {
            "size": "6",
            "html": [
              {
                "element": "h3",
                "content": "€ (total of transaction)",
                "css": {
                  "text-align": "right"
                }
              }
            ]
          }
        ],
        "css": {
          "padding": [2, 0, 0, 0],
          "flex": "1"
        },
        "section": "payment"
      },
      {
        "row": [
          {
            "size": "6",
            "element": "table",
            "htmlBefore": "<tr><th>Betalingen:</th><th></th></tr>",
            "forEach": "aPayments",
            "html": "<tr><td>[[sMethod]]</td><td>(amount)</td></tr>"
          },
          {
            "size": "6"
          }
        ],
        "css": {
          "padding": [3, 0, 0, 0]
        },
        "section": "payment"
      },
      {
        "row": [
          {
            "size": "12",
            "html": "<small><table><tr><td>TODO!</td><td>Ex. BTW</td><td>BTW</td><td>Totaal</td></tr><tr><td>0% BTW</td><td>€ 75,00</td><td>€ 0,00</td><td>€ 75,00</td></tr></table></small>"
          }
        ],
        "css": {
          "padding": [3, 0, 0, 0]
        },
        "section": "payment"
      },
      {
        "row": [
          {
            "size": "12",
            "html": "Spaarpunten! TODO!"
          }
        ],
        "css": {
          "padding": [3, 0, 0, 0]
        }
      },
      {
        "row": [
          {
            "size": "12",
            "html": "Ruilen binnen 8 dagen op vertoon van deze bon.<br/>Dank voor uw bezoek."
          }
        ],
        "css": {
          "padding": [3, 0, 0, 0]
        }
      }
    ]
  }


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
    this.fetchBusinessDetails();
    this.fetchTransaction(this.transaction.sNumber)
    this.getPrintSetting();
  }

  fetchBusinessDetails() {
    this.apiService.getNew('core', '/api/v1/business/' + this.iBusinessId)
      .subscribe(
        (result: any) => {
          this.businessDetails = result.data;
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

  createTemplate() {
    const body = {
      iBusinessId: this.iBusinessId,
      iLocationId: localStorage.getItem('currentLocation'),
      sName: 'Sample',
      eType: this.transaction.eType,
      template: this.templateString
    }

    this.apiService.postNew('cashregistry', '/api/v1/pdf/templates/create', body).subscribe((result: any) => {
    }, (error) => {
      this.loading = false;
      console.log('printing error', error);
    })
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

        let dataObject = JSON.parse(JSON.stringify(this.transaction));
        dataObject.aTransactionItems = [];
        this.transaction.aTransactionItems.forEach((item: any)=>{
          if(item.oType?.eKind != 'discount' || item?.oType?.eKind != 'loyalty-points-discount') {
            dataObject.aTransactionItems.push(item);
          }
        })
        let language: any = localStorage.getItem('language')
        dataObject.total = 0;
        let total = 0, totalAfterDisc = 0, totalVat = 0, totalDiscount = 0, totalSavingPoints = 0;
        dataObject.aTransactionItems.forEach((item: any)=>{
          total = total + item.nPriceIncVat;
          let name = '';
          if(item && item.oArticleGroupMetaData && item.oArticleGroupMetaData.oName && item.oArticleGroupMetaData.oName[language]) name = item?.oArticleGroupMetaData?.oName[language] + ' ';
          item.description = name;
          if(item?.oBusinessProductMetaData?.sLabelDescription) item.description = item.description + item?.oBusinessProductMetaData?.sLabelDescription + ' ' + item?.sProductNumber;
          const vat = (item.nVatRate * item.nPriceIncVat/100);
          item.vat = `${item.nVatRate}% (${vat})`
          totalVat += vat;
          totalSavingPoints += item.nSavingsPoints;
          let disc = item.nDiscount;
          if(item.bPaymentDiscountPercent){ 
            disc = (item.nDiscount * item.nPriceIncVat/100)
            item.nDiscount = `${item.nDiscount}%`
          } else {
            item.nDiscount = `€ ${item.nDiscount}`
          }
          totalAfterDisc += (item.nPriceIncVat -  item.nDiscount)
          totalDiscount += disc;
        })
        // dataObject.total = `€ ${totalAfterDisc}(${total})`;
        dataObject.total = total;
        dataObject.totalVat = totalVat;
        dataObject.totalDiscount = totalDiscount;
        dataObject.totalSavingPoints = totalSavingPoints;
        dataObject.dCreatedDate = moment(dataObject.dCreatedDate).format('DD-MM-yyyy hh:mm');
        this.pdfService.createPdf(JSON.stringify(result.data), dataObject, filename, print, printData, this.iBusinessId, this.transaction?._id)
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
}
