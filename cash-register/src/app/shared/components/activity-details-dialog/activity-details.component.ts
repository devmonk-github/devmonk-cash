import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from '../../service/dialog';
import { ViewContainerRef } from '@angular/core';
import { ApiService } from 'src/app/shared/service/api.service';
import { faTimes, faMessage, faEnvelope, faEnvelopeSquare, faUser, faReceipt, faEuro, faChevronRight, faDownload } from "@fortawesome/free-solid-svg-icons";
import { PdfService } from '../../service/pdf.service';
import { TransactionItemsDetailsComponent } from '../transaction-items-details/transaction-items-details.component';
import { MenuComponent } from '../../_layout/components/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-activity-details',
  templateUrl: './activity-details.component.html',
  styleUrls: ['./activity-details.component.scss']
})
export class ActivityDetailsComponent implements OnInit {

  $element = HTMLInputElement
  dialogRef: DialogComponent;
  customer: any;
  activity: any;
  webOrders: boolean | undefined;
  items: Array<any> = [];
  from: string = '';
  mode: string = '';
  showLoader = false;
  activityItems: Array<any> = [];
  imagePlaceHolder: string = '../../../../assets/images/no-photo.svg';
  faTimes = faTimes;
  faMessage = faMessage;
  faEnvelope = faEnvelope;
  faEnvelopeSquare = faEnvelopeSquare;
  faUser = faUser;
  faReceipt = faReceipt;
  faEuro = faEuro;
  faChevronRight = faChevronRight;
  faDownload = faDownload;
  repairStatus = ['info', 'processing', 'cancelled', 'inspection', 'completed'];
  carriers = ['PostNL', 'DHL', 'DPD', 'bpost', 'other'];
  printOptions = ['Portrait', 'Landscape'];
  itemType = 'transaction';
  customerReceiptDownloading: Boolean = false;
  loading: Boolean = false;
  collapsedBtn: Boolean = false;
  iBusinessId = localStorage.getItem('currentBusiness');
  transactions: Array<any> = [];
  totalPrice: Number = 0;
  quantity: Number = 0;
  userDetail: any;
  business: any;
  iLocationId: String = '';
  showDetails: Boolean = true;
  loadCashRegister: Boolean = false;
  requestParams: any = {
    iBusinessId: this.iBusinessId,
    aProjection: ['_id',
      'iBusinessId',
      'iProductId',
      'iSupplierId',
      'nQuantity',
      'sProductName',
      'nPriceIncVat',
      'nPurchasePrice',
      'nVatRate',
      'nPaymentAmount',
      'nRefundAmount',
      'oType',
      'sArticleNumber',
      'dCreatedDate',
      'dUpdatedDate',
      'iActivityItemId']
  };
  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
    private pdfService: PdfService,
    private dialogService: DialogService,
    private routes: Router
  ) {
    const _injector = this.viewContainerRef.injector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit(): void {
    this.activity = this.dialogRef.context.activity;
    this.items = this.dialogRef.context.activity;
    // if (this.items.length) {
    if (this.activity) {
      if (this.activity?.activityitems?.length) {
        this.activityItems = this.activity.activityitems;
      } else {
        const items = JSON.parse(JSON.stringify(this.activity));
        this.activityItems = [items]
      }
      if (this.activityItems.length == 1) this.collapsedBtn = true;
    } else {
      this.fetchTransactionItems();
    }
    if (this.activity?.iCustomerId) this.fetchCustomer(this.activity.iCustomerId, -1);
    this.getBusinessLocations();
    // this.itemType = this.dialogRef.context.itemType;
    // this.transaction = this.dialogRef.context.transaction;
  }

  downloadOrder() { }

  changeStatusForAll(type: string) {
    this.activityItems.forEach((obj: any) => {
      obj.eRepairStatus = type;
      this.updateActivityItem(obj)
    })
  }

  changeTrackingNumberForAll(sTrackingNumber: string) {
    this.activityItems.forEach((obj: any) => {
      obj.sTrackingNumber = sTrackingNumber;
      this.updateActivityItem(obj)
    })
  }

  changeCarrierForAll(eCarrier: string) {
    this.activityItems.forEach((obj: any) => {
      obj.eCarrier = eCarrier;
      this.updateActivityItem(obj)
    })
  }

  updateActivityItem(item: any) {
    item.iBusinessId = this.iBusinessId;
    this.apiService.putNew('cashregistry', '/api/v1/activities/items/' + item?.iActivityItemId, item)
      .subscribe((result: any) => {
      },
        (error) => {
        })
  }

  getBusinessLocations() {
    this.apiService.getNew('core', '/api/v1/business/user-business-and-location/list')
      .subscribe((result: any) => {
        if (result.message == "success" && result?.data) {
          this.userDetail = result.data;
          if (this.userDetail.aBusiness) {
            this.userDetail.aBusiness.map(
              (business: any) => {
                if (business._id == this.iBusinessId) {
                  this.business = business;
                }
              })
          }
        }
        setTimeout(() => {
          MenuComponent.reinitialization();
        }, 200);
      }, (error) => {
        console.log('error: ', error);
      });
  }

  selectBusiness(index: number, location?: any) {
    if (location?._id) {
      this.transactions[index].locationName = location.sName;
      this.transactions[index].iStockLocationId = location._id;
    }
    this.updateTransaction(this.transactions[index]);
  }

  updateTransaction(transaction: any) {
    transaction.iBusinessId = this.iBusinessId;
    this.apiService.putNew('cashregistry', '/api/v1/transaction/item/StockLocation/' + transaction?._id, transaction)
      .subscribe((result: any) => {
      },
        (error) => {
        })
  }

  setSelectedBusinessLocation(locationId: string, index: number) {
    this.business.aInLocation.map(
      (location: any) => {
        if (location._id == locationId)
          this.transactions[index].locationName = location.sName;
      })
  }

  openTransaction(transaction: any, itemType: any) {
    transaction.iActivityId = this.activity._id;
    this.dialogService.openModal(TransactionItemsDetailsComponent, { cssClass: "modal-xl", context: { transaction, itemType, selectedId: transaction._id } })
      .instance.close.subscribe((result: any) => {
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
                iArticleGroupId: transactionItem.iArticleGroupId,
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
                iBusinessBrandId: transactionItem.iBusinessBrandId,
                discount: 0,
                tax: transactionItem.nVatRate,
                paymentAmount,
                description: '',
                open: true,
                nMargin: transactionItem.nMargin,
                nPurchasePrice: transactionItem.nPurchasePrice,
              });
            }
          });
          result.transactionItems = transactionItems;
          localStorage.setItem('fromTransactionPage', JSON.stringify(result));
          localStorage.setItem('recentUrl', '/business/transactions');
          setTimeout(() => {
            if (this.loadCashRegister) {
              this.routes.navigate(['/business/till']);
            }
            this.close(true);
          }, 100);
        }
      });
  }

  downloadCustomerReceipt(index: number) {
    const data = this.activity.activityitems[index];
    const sName = 'Sample', eType = 'completed';
    this.customerReceiptDownloading = true;
    this.apiService.getNew('cashregistry', '/api/v1/pdf/templates/' + this.iBusinessId + '?sName=' + sName + '&eType=' + eType).subscribe(
      (result: any) => {
        const template = result.data;
        const filename = new Date().getTime().toString()
        let printData = null
        let print = false;
        // if (print) {
        //   printData = {
        //     computerId: this.computerId,
        //     printerId: this.printerId,
        //     title: filename,
        //     quantity: 1
        //   }
        // }

        this.pdfService.createPdf(JSON.stringify(template), data, filename, print, printData, this.iBusinessId, this.activity?._id)
          .then(() => {
            this.customerReceiptDownloading = false;
          })
          .catch((e: any) => {
            this.customerReceiptDownloading = false;
            console.error('err', e)
          })
      }, (error) => {
        this.customerReceiptDownloading = false;
      })
  }

  fetchCustomer(customerId: any, index: number) {
    this.apiService.getNew('customer', `/api/v1/customer/${customerId}?iBusinessId=${this.iBusinessId}`).subscribe(
      (result: any) => {
        console.log(result);
        if (index > -1) this.transactions[index].customer = result;
        else this.customer = result;
        // this.close({ action: true });
      },
      (error: any) => {
        console.error(error)
      }
    );
  }

  fetchTransactionItems() {
    let url = `/api/v1/activities/items/${this.activity._id}`;
    this.loading = true;
    this.apiService.postNew('cashregistry', url, this.requestParams).subscribe((result: any) => {
      this.activityItems = result.data[0].result;
      this.transactions = [];
      for (const obj of this.activityItems) {
        for (const item of obj.receipts) {
          // if(!item.bRefund) item.eRepairStatus = obj.eRepairStatus;
          this.transactions.push({ ...item, ...obj });
        }
        // this.transactions = this.transactions.concat(obj.receipts);
      }
      for (let i = 0; i < this.transactions.length; i++) {
        const obj = this.transactions[i];
        this.totalPrice += obj.nPaymentAmount;
        this.quantity += obj.bRefund ? (- obj.nQuantity) : obj.nQuantity
        if (obj.iStockLocationId) this.setSelectedBusinessLocation(obj.iStockLocationId, i)
        this.fetchCustomer(obj.iCustomerId, i);
      }
      setTimeout(() => {
        MenuComponent.reinitialization();
      }, 200);
      this.loading = false;
    }, (error) => {
      this.loading = false;
      alert(error.error.message);
      this.dialogRef.close.emit('data');
    });
  }

  close(data: any) {
    this.dialogRef.close.emit(data);
  }

  submit() {
    console.log('Submit');
  }
}
