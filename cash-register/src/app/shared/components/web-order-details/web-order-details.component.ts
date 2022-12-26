import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { faDownload, faEnvelope, faLongArrowAltDown, faLongArrowAltUp, faReceipt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../../service/api.service';
import { DialogComponent, DialogService } from '../../service/dialog';
import { ReceiptService } from '../../service/receipt.service';
import { MenuComponent } from '../../_layout/components/common';
import { TransactionItemsDetailsComponent } from '../transaction-items-details/transaction-items-details.component';
import * as JsBarcode from 'jsbarcode';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-web-order-details',
  templateUrl: './web-order-details.component.html',
  styleUrls: ['./web-order-details.component.scss']
})
export class WebOrderDetailsComponent implements OnInit {

  $element = HTMLInputElement
  dialogRef: DialogComponent;
  activityItems: Array<any> = [];
  business: any;
  statuses = ['new', 'processing', 'cancelled', 'completed', 'refund', 'refundInCashRegister', 'payInCashRegister'];
  statusesForItems = ['new', 'processing', 'cancelled', 'completed'];
  FeStatus = '';
  carriers = ['PostNL', 'DHL', 'DPD', 'bpost', 'other'];
  faTimes = faTimes;
  faDownload = faDownload;
  faReceipt = faReceipt;
  faEnvelope = faEnvelope;
  faArrowUp = faLongArrowAltUp;
  faArrowDown = faLongArrowAltDown;
  customer: any;
  activity: any;
  transactionDetails: any;
  loading: Boolean = false;
  iBusinessId = localStorage.getItem('currentBusiness');
  transactions: Array<any> = [];
  totalPrice: Number = 0;
  quantity: Number = 0;
  userDetail: any;
  showDeliverBtn: Boolean = false;
  showDetails: Boolean = true;
  downloading: Boolean = false;
  iLocationId: string = '';
  businessDetails: any;
  computerId: number | undefined;
  printerId: number | undefined;
  from: String = '';
  imagePlaceHolder: string = '../../../../assets/images/no-photo.svg';
  printActionSettings: any;
  printSettings: any;
  aTemplates: any;
  requestParams: any = {
    iBusinessId: this.iBusinessId,
    aProjection: [
      '_id',
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
  selectedLanguage: string;


  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
    private receiptService: ReceiptService,
    private dialogService: DialogService,
    private translateService: TranslateService
  ) {
    const _injector = this.viewContainerRef.injector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
    this.selectedLanguage = this.translateService.currentLang;
  }

  async ngOnInit() {
    this.activity = this.dialogRef.context.activity;
    this.selectedLanguage = localStorage.getItem('language')?.toString() || navigator.language.substring(0, 2);
    if (this.from == 'web-orders') {
      const index = this.statuses.indexOf('cancelled');
      if (index > -1) this.statuses.splice(index, 1);

      const index2 = this.statusesForItems.indexOf('cancelled');
      if (index > -1) this.statusesForItems.splice(index2, 1);
    }
    this.iLocationId = localStorage.getItem("currentLocation") || '';
    if (this.activity?.iCustomerId) this.fetchCustomer(this.activity.iCustomerId, -1);
    if (this.activity?.eActivityStatus != 'completed') this.showDeliverBtn = true;
    this.fetchBusinessDetails();
    this.getPrintSetting();
    this.getBusinessLocations();
    this.fetchTransactionItems();
    this.fetchTransactionDetails();

    const [_printActionSettings, _printSettings]: any = await Promise.all([
      this.getPdfPrintSetting({ oFilterBy: { sMethod: 'actions' } }),
      this.getPdfPrintSetting({ oFilterBy: {} })
    ]);
    this.printActionSettings = _printActionSettings?.data[0]?.result[0].aActions;
    this.printSettings = _printSettings?.data[0]?.result;
  }

  deliver(type: string) {
    const transactions = []
    for (const item of this.activityItems) {
      for (const receipt of item.receipts) { transactions.push({ ...receipt, iActivityItemId: item._id }) }
    }
    this.createStockCorrections(transactions, type)
  }

  createStockCorrections(transactions: any, type: string) {
    transactions.iBusinessId = this.iBusinessId;
    const data = {
      transactions,
      type,
      activity: this.activity,
      iBusinessId: this.iBusinessId
    }
    this.apiService.postNew('cashregistry', '/api/v1/transaction/item/stockCorrection/' + this.activity?._id, data)
      .subscribe((result: any) => {
        this.activityItems.forEach((item) => {
          item.eActivityItemStatus = 'completed';
        })
        this.showDeliverBtn = false;
      },
        (error) => {
          console.log(error);
        })
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

  fetchBusinessDetails() {
    this.apiService.getNew('core', '/api/v1/business/' + this.iBusinessId)
      .subscribe(
        (result: any) => {
          this.businessDetails = result.data;
        })
  }

  openTransaction(transaction: any, itemType: any) {
    transaction.iActivityId = this.activity._id;
    this.dialogService.openModal(TransactionItemsDetailsComponent, { cssClass: "modal-xl", context: { transaction, itemType } })
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
                iArticleGroupId: transactionItem.iArticleGroupId,
                quantity: transactionItem.nQuantity,
                price: transactionItem.nPriceIncVat,
                iRepairerId: transactionItem.iRepairerId,
                oArticleGroupMetaData: transactionItem.oArticleGroupMetaData,
                iEmployeeId: transactionItem.iEmployeeId,
                iBrandId: transactionItem.iBrandId,
                discount: 0,
                tax: transactionItem.nVatRate,
                paymentAmount,
                description: '',
                open: true,
              });
            }
          });
          result.transactionItems = transactionItems;
          localStorage.setItem('fromTransactionPage', JSON.stringify(result));
          localStorage.setItem('recentUrl', '/business/transactions');

          this.activityItems.forEach((obj: any) => {
            obj.eActivityItemStatus = this.activity.eActivityStatus;
          })
          // Need to find out some other option to change the status in this case.
          // this.updateActivity()

          setTimeout(() => {
            this.close(true);
          }, 100);
        }
      });
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

  downloadWebOrder() {
    this.generatePDF(false);
  }

  generatePDF(print: boolean): void {
    const sName = 'Sample', eType = this.activity.eType;
    this.downloading = true;
    this.activity.businessDetails = this.businessDetails;
    for (let i = 0; i < this.businessDetails?.aLocation.length; i++) {
      if (this.businessDetails.aLocation[i]?._id.toString() == this.iLocationId.toString()) {
        this.activity.currentLocation = this.businessDetails.aLocation[i];
      }
    }
    this.apiService.getNew('cashregistry', '/api/v1/pdf/templates/' + this.iBusinessId + '?sName=' + sName + '&eType=' + eType).subscribe(
      async (result: any) => {
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

        const oDataSource = {
          ...JSON.parse(JSON.stringify(this.transactionDetails)),
          totalVat: 0,
          totalDiscount: 0,
          totalRedeemedLoyaltyPoints: 0,
          totalSavingPoints: 0,
          total: 0,
          totalAfterDisc: 0
        };
        oDataSource.businessDetails = this.businessDetails;
        oDataSource.businessDetails.sMobile = this.businessDetails?.oPhone?.sMobile || '';
        const locationIndex = this.businessDetails.aLocation.findIndex((location: any) => location._id == this.iLocationId);
        const currentLocation = this.businessDetails.aLocation[locationIndex];
        oDataSource.sAddressline1 = currentLocation.oAddress.street + " " + currentLocation.oAddress.houseNumber + " " + currentLocation.oAddress.houseNumberSuffix + " ,  " + currentLocation.oAddress.postalCode + " " + currentLocation.oAddress.city;
        oDataSource.sAddressline2 = currentLocation.oAddress.country;

        oDataSource.oCustomer = {
          sFirstName: this.customer?.sFirstName || '',
          sLastName: this.customer?.sLastName || '',
          sEmail: this.customer?.sEmail || '',
          sMobile: this.customer?.oPhone?.sCountryCode || '' + this.customer?.oPhone?.sMobile || '',
          sLandLine: this.customer?.oPhone?.sLandLine || '',
        };

        const sBarcodeURI = this.generateBarcodeURI(false, oDataSource.sNumber);
        oDataSource.sBarcodeURI = sBarcodeURI;

        oDataSource.sBusinessLogoUrl = (await this.getBase64FromUrl(oDataSource?.businessDetails?.sLogoLight).toPromise()).data;
        oDataSource.aTransactionItems = this.activityItems;
        oDataSource.sActivityNumber = oDataSource.sNumber;
        oDataSource.aTransactionItems.forEach((item: any) => {
          item.sProductName = item?.receipts[0]?.sProductNumber || this.getName(item);
          item.sArticleGroupName = item.oArticleGroupMetaData.oName[this.selectedLanguage] || '';
          item.vat = ((parseFloat(item.nPriceIncVat) / 100) * parseFloat(item.nVatRate)).toFixed(2);
          item.sActivityItemNumber = item.sNumber;
          item.nSavingsPoints = this.getSavingPoint(item);
          item.sOrderDescription = item.sProductName + '\n' + item.sDescription;
          item.nDiscountPrice = item.nDiscount > 0 ?
            (item.bDiscountOnPercentage ?
              (item.nPriceIncVat * ((item.nDiscount || 0) / 100))
              : item.nDiscount)
            : 0
          oDataSource.totalVat += parseFloat(item.vat);
          oDataSource.totalDiscount += item.nDiscountPrice;
          oDataSource.totalRedeemedLoyaltyPoints += item.nRedeemedLoyaltyPoints || 0;
          oDataSource.totalSavingPoints += parseFloat(item.nSavingsPoints);
          oDataSource.total += item.nPriceIncVat;
          oDataSource.totalAfterDisc += item.nTotalAmount;
        });

        // let dataObject = this.transactionDetails;
        // dataObject.oBusiness = this.businessDetails;
        // dataObject.aTransactionItems = this.activityItems;

        this.receiptService.exportToPdf({
          oDataSource: oDataSource,
          pdfTitle: filename,
          templateData: result.data,
          printSettings: this.printSettings,
          printActionSettings: this.printActionSettings,
          eSituation: 'is_created'
        });
        // this.pdfService.createPdf(JSON.stringify(result.data), dataObject, filename, print, printData, this.iBusinessId, this.activity?._id)
        //   .then(() => {
        //     this.downloading = false;
        //   })
        //   .catch((e: any) => {
        //     this.downloading = false;
        //     console.error('err', e)
        //   })
      }, (error) => {
        this.downloading = false;
        console.log('printing error', error);
      })
  }

  fetchTransactionItems() {
    let url = `/api/v1/activities/items/${this.activity._id}`;
    this.loading = true;
    this.apiService.postNew('cashregistry', url, this.requestParams).subscribe((result: any) => {
      this.activityItems = result.data[0].result.sort((item1: any, item2: any) => !item1?.iBusinessProductId ? -1 : (!item2?.iBusinessProductId ? -1 : (item2.iBusinessProductId - item1.iBusinessProductId)));
      this.loading = false;
      let completed = 0, refunded = 0;
      // this.transactions = [];
      for (let i = 0; i < this.activityItems.length; i++) {
        // for(const item of obj.receipts){
        const obj = this.activityItems[i];
        if (obj.eActivityItemStatus == 'completed' || obj.eActivityItemStatus == 'refund' || obj.eActivityItemStatus == 'refundInCashRegister') completed += 1;
        if (obj.eActivityItemStatus == 'refund' || obj.eActivityItemStatus == 'refundInCashRegister') refunded += 1;
        if (obj?.iCustomerId) this.fetchCustomer(obj.iCustomerId, i);
        for (let j = 0; j < obj.receipts.length; j++) {
          // this.transactions.push({ ...item, ...obj });
          const item = obj.receipts[j];
          if (!item.iStockLocationId && item.iLocationId) item.iStockLocationId = item.iLocationId;
          this.totalPrice += item.nPaymentAmount;
          this.quantity += item.bRefund ? (- item.nQuantity) : item.nQuantity
          if (item.iStockLocationId) this.setSelectedBusinessLocation(item.iStockLocationId, i, j)
        }
      }
      if (completed == this.activityItems.length) { this.FeStatus = `completed (Refunded: ${refunded}/${this.activityItems.length})` }
      else if (completed) { this.FeStatus = `Partly Completed (Refunded: ${refunded}/${this.activityItems.length})` }
      else this.FeStatus = 'New';
      // for(let i = 0; i < this.transactions.length; i++){
      //   const obj = this.transactions[i];
      //   this.totalPrice += obj.nPaymentAmount;
      //   this.quantity += obj.bRefund ? (- obj.nQuantity) : obj.nQuantity
      //   if(obj.iStockLocationId) this.setSelectedBusinessLocation(obj.iStockLocationId, i)
      //   this.fetchCustomer(obj.iCustomerId, i);
      // }
      this.loading = false;
      setTimeout(() => {
        MenuComponent.reinitialization();
      }, 200);
    }, (error) => {
      this.loading = false;
      alert(error.error.message);
      this.dialogRef.close.emit('data');
    });
  }

  //  Function for fetch transaction details for print receipt
  fetchTransactionDetails() {
    this.apiService.postNew('cashregistry', `/api/v1/transaction/activity/${this.activity._id}`, { iBusinessId: this.iBusinessId }).subscribe(
      (result: any) => {
        if (result?.data?.length > 0) {
          this.transactionDetails = result.data[0];
        }
      }
    );
  }
  setSelectedBusinessLocation(locationId: string, parentIndex: number, index: number) {
    this.business.aInLocation.map(
      (location: any) => {
        if (location._id == locationId)
          this.activityItems[parentIndex].receipts[index].locationName = location.sName;
      })
  }

  // togglePayInCashRegister(event: any){}

  checkAllLocations() {
    let flag = true;
    for (let i = 0; i < this.activityItems.length; i++) {
      const obj = this.activityItems[i];
      for (let j = 0; j < obj.receipts.length; j++) {
        const item = obj.receipts[j];
        if (!item.iStockLocationId && item?.iBusinessProductId) flag = false;
      }
    }
    return flag;
  }

  getName(item: any) {
    if (item?.oArticleGroupMetaData?.oName?.en == 'product shipping') return 'Shipping costs';
    if (item?.oArticleGroupMetaData?.oName?.en == 'product engraving') return 'product engraving';
    if (item?.oArticleGroupMetaData?.oName?.en == 'product Basic gift wrap') return 'Basic gift wrap';
    return '';
  }

  selectBusiness(index: number, location?: any) {
    if (location?._id) {
      this.activityItems[index].receipts[0].locationName = location.sName;
      this.activityItems[index].receipts[0].iStockLocationId = location._id;
    }
    this.updateTransaction(this.activityItems[index].receipts[0]);
  }

  updateTransaction(transaction: any) {
    transaction.iBusinessId = this.iBusinessId;
    this.apiService.putNew('cashregistry', '/api/v1/transaction/item/StockLocation/' + transaction?._id, transaction)
      .subscribe((result: any) => {
      },
        (error) => {

        })
  }


  fetchCustomer(customerId: any, parentIndex: number) {
    this.apiService.getNew('customer', `/api/v1/customer/${customerId}?iBusinessId=${this.iBusinessId}`).subscribe(
      (result: any) => {
        if (parentIndex > -1) this.activityItems[parentIndex].customer = result;
        else this.customer = result;
      },
      (error: any) => {
        console.error(error)
      }
    );
  }


  changeStatusForAll(status: string) {
    if (status == 'refundInCashRegister' || status == 'payInCashRegister') {
      this.openTransaction(this.activity, 'activity');
    } else if (status == 'completed') {
    } else {
      this.activityItems.forEach((obj: any) => {
        obj.eActivityItemStatus = status;
      })
      this.updateActivity()
    }
  }

  changeTrackingNumberForAll(sTrackingNumber: string) {
    this.activityItems.forEach((obj: any) => {
      obj.sTrackingNumber = sTrackingNumber;
    })
    this.updateActivity();
  }

  changeCarrierForAll(eCarrier: string) {
    this.activityItems.forEach((obj: any) => {
      obj.eCarrier = eCarrier;
    })
    this.updateActivity();
  }

  updateActivityItem(item: any) {
    item.iBusinessId = this.iBusinessId;
    this.apiService.putNew('cashregistry', '/api/v1/activities/items/' + item?.iActivityItemId, item)
      .subscribe((result: any) => {
      },
        (error) => {
        })
  }

  updateActivity() {
    this.apiService.putNew('cashregistry', '/api/v1/activities/' + this.activity?._id, this.activity)
      .subscribe(
        (result: any) => { },
        (error) => { }
      )
  }

  close(data: any) {
    this.dialogRef.close.emit(data);
  }

  submit() {
  }

  getPdfPrintSetting(oFilterBy?: any) {
    const oBody = {
      iLocationId: this.iLocationId,
      ...oFilterBy
    }
    return this.apiService.postNew('cashregistry', `/api/v1/print-settings/list/${this.iBusinessId}`, oBody).toPromise();
  }

  generateBarcodeURI(displayValue: boolean = true, data: any) {
    var canvas = document.createElement("canvas");
    JsBarcode(canvas, data, { format: "CODE128", displayValue: displayValue });
    return canvas.toDataURL("image/png");
  }

  getBase64FromUrl(url: any): Observable<any> {
    return this.apiService.getNew('cashregistry', `/api/v1/pdf/templates/getBase64/${this.iBusinessId}?url=${url}`);
  }

  getSavingPoint(item: any) {
    let activityDetails = this.activity.activityitems.filter((aItem: any) => aItem._id == item._id)[0];
    return activityDetails.nSavingsPoints || '0';
  }

  async thermalPrintWebOrder() {
    const oDataSource = JSON.parse(JSON.stringify(this.transactionDetails));
    oDataSource.businessDetails = this.businessDetails;
    oDataSource.businessDetails.sMobile = this.businessDetails?.oPhone?.sMobile || '';
    const locationIndex = this.businessDetails.aLocation.findIndex((location: any) => location._id == this.iLocationId);
    const currentLocation = this.businessDetails.aLocation[locationIndex];
    oDataSource.sAddressline1 = currentLocation.oAddress.street + " " + currentLocation.oAddress.houseNumber + " " + currentLocation.oAddress.houseNumberSuffix + " ,  " + currentLocation.oAddress.postalCode + " " + currentLocation.oAddress.city;
    oDataSource.sAddressline2 = currentLocation.oAddress.country;

    oDataSource.oCustomer = {
      sFirstName: this.customer?.sFirstName || '',
      sLastName: this.customer?.sLastName || '',
      sEmail: this.customer?.sEmail || '',
      sMobile: this.customer?.oPhone?.sCountryCode || '' + this.customer?.oPhone?.sMobile || '',
      sLandLine: this.customer?.oPhone?.sLandLine || '',
    };

    oDataSource.sBusinessLogoUrl = (await this.getBase64FromUrl(oDataSource?.businessDetails?.sLogoLight).toPromise()).data;
    oDataSource.aTransactionItems = this.activityItems;
    oDataSource.sActivityNumber = oDataSource.sNumber;
    this.receiptService.printThermalReceipt({
      oDataSource: oDataSource,
      printSettings: this.printSettings,
      sAction: 'thermal',
      apikey: this.businessDetails.oPrintNode.sApiKey
    });
  }
}
