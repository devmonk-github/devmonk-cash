import { AfterViewInit, Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from '../../service/dialog';
import { ViewContainerRef } from '@angular/core';
import { ApiService } from 'src/app/shared/service/api.service';
import { faTimes, faMessage, faEnvelope, faEnvelopeSquare, faUser, faReceipt, faEuro, faChevronRight, faDownload, faPrint } from "@fortawesome/free-solid-svg-icons";
import { PdfService } from '../../service/pdf.service';
import { TransactionItemsDetailsComponent } from '../transaction-items-details/transaction-items-details.component';
import { MenuComponent } from '../../_layout/components/common';
import { Router } from '@angular/router';
import { TransactionDetailsComponent } from 'src/app/transactions/components/transaction-details/transaction-details.component';
import * as JsBarcode /* , { Options as jsBarcodeOptions } */ from 'jsbarcode';
import { ReceiptService } from '../../service/receipt.service';
import { Observable } from 'rxjs';
import { ToastService } from '../toast';
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
  faPrint = faPrint;
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
  businessDetails: any;
  iLocationId: String = '';
  showDetails: Boolean = true;
  loadCashRegister: Boolean = false;
  openActivityId: any;
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
      'iActivityItemId'
    ]
  };
  employee: any = null;
  filteredEmployees: Array<any> = [];
  employeesList: Array<any> = [];
  brand: any = null;
  brandsList: Array<any> = [];
  filteredBrands: Array<any> = [];
  supplier: any;
  supplierOptions: Array<any> = [];
  suppliersList: Array<any> = [];
  bFetchingTransaction: boolean = false;
  px2mmFactor !: number;
  printSettings: any;
  iWorkstationId: string;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
    private pdfService: PdfService,
    private dialogService: DialogService,
    private routes: Router,
    private receiptService: ReceiptService,
    private toastService: ToastService
  ) {
    const _injector = this.viewContainerRef.injector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent); 
    this.iWorkstationId = localStorage.getItem("currentWorkstation") || '';
  }


  ngOnInit(): void {
    // this.activity = this.dialogRef.context.activity;
    // this.items = this.dialogRef.context.items;
    // if (this.items.length) {
    // console.log(this.activity);
    if (this.activity) {
      if (this.activity?.activityitems?.length) {
        this.activityItems = this.activity.activityitems;
        if (this.openActivityId){
          this.activityItems.forEach((item:any)=>{
            if(item._id === this.openActivityId) item.collapsedBtn = true;
          });
        }
      } else {
        this.fetchTransactionItems();
        // const items = JSON.parse(JSON.stringify(this.activity));
        // this.activityItems = [items]
      }

    } else {
      this.fetchTransactionItems();
    }
    if (this.activity?.iCustomerId) this.fetchCustomer(this.activity.iCustomerId, -1);
    this.getBusinessLocations();
    // this.itemType = this.dialogRef.context.itemType;
    // this.transaction = this.dialogRef.context.transaction;
    this.getListEmployees()
    this.getListSuppliers()
    this.getBusinessBrands();
  }

  getListEmployees() {
    const oBody = {
      iBusinessId: localStorage.getItem('currentBusiness') || '',
    }
    let url = '/api/v1/employee/list';
    this.apiService.postNew('auth', url, oBody).subscribe((result: any) => {
      if (result && result.data && result.data.length) {
        this.employeesList = result.data[0].result;
        this.employeesList.map(o => o.sName = `${o.sFirstName} ${o.sLastName}`);
        // if (this.item.iEmployeeId) {
        //   const tempsupp = this.employeesList.find(o => o._id === this.item.iSupplierId);
        //   this.employee = tempsupp.sName;
        // }
      }
    }, (error) => {
    });
  }

  getListSuppliers() {
    const oBody = {
      iBusinessId: localStorage.getItem('currentBusiness') || '',
    }
    let url = '/api/v1/business/partners/supplierList';
    this.apiService.postNew('core', url, oBody).subscribe((result: any) => {
      if (result && result.data && result.data.length) {
        this.suppliersList = result.data[0].result;
        // if (this.item.iSupplierId) {
        //   const tempsupp = this.suppliersList.find(o => o._id === this.item.iSupplierId);
        //   this.supplier = tempsupp.sName;
        // }
      }
    }, (error) => {
    });
  }

  getBusinessBrands() {
    const oBody = {
      iBusinessId: localStorage.getItem('currentBusiness') || '',
    }
    this.apiService.postNew('core', '/api/v1/business/brands/list', oBody).subscribe((result: any) => {
      if (result.data && result.data.length > 0) {
        this.brandsList = result.data[0].result;
        // if (this.item.iBusinessBrandId) {
        //   const tempsupp = this.brandsList.find(o => o._id === this.item.iBusinessBrandId);
        //   this.brand = tempsupp.sName;
        // }
      }
    })
  }
  // Function for search suppliers
  searchSuppliers(searchStr: string) {
    if (searchStr && searchStr.length > 2) {
      this.supplierOptions = this.suppliersList.filter((supplier: any) => {
        return supplier.sName && supplier.sName.toLowerCase().includes(searchStr.toLowerCase());
      });
    }
  }

  // Function for search suppliers
  searchEmployees(searchStr: string) {
    if (searchStr && searchStr.length > 2) {
      this.filteredEmployees = this.employeesList.filter((employee: any) => {
        return employee.sName && employee.sName.toLowerCase().includes(searchStr.toLowerCase());
      });
    }
  }

  // Function for search suppliers
  searchBrands(searchStr: string) {
    if (searchStr && searchStr.length > 2) {
      this.filteredBrands = this.brandsList.filter((brands: any) => {
        return brands.sName && brands.sName.toLowerCase().includes(searchStr.toLowerCase());
      });
    }
  }

  onEmployeeChange(e: any) {
    this.employee = e.sName
    console.log({ onSupplierChange: e });

  }
  onSupplierChange(e: any) {
    this.supplier = e.sName
    console.log({ onSupplierChange: e });

  }
  onBrandChange(e: any) {
    this.brand = e.sName
    console.log({ onBrandChange: e });

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
                sServicePartnerRemark: transactionItem.sServicePartnerRemark,
                eActivityItemStatus: transactionItem.eActivityItemStatus,
                eEstimatedDateAction: transactionItem.eEstimatedDateAction,
                bGiftcardTaxHandling: transactionItem.bGiftcardTaxHandling,
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
  getBusinessDetails(): Observable<any> {
    return this.apiService.getNew('core', '/api/v1/business/' + this.business._id);
  }

  async downloadCustomerReceipt(index: number, bPrint: boolean = false) {
    // console.log('downloading customer receipt', index, this.activity);
    let oDataSource = JSON.parse(JSON.stringify(this.activity));
    if (oDataSource?.activityitems){
      oDataSource = oDataSource.activityitems[index];
    }
    const type = (oDataSource?.oType.eKind === 'regular') ? 'repair_alternative' : 'repair';
    const sBarcodeURI = this.generateBarcodeURI(false, oDataSource.sNumber);    
    if(!this.businessDetails){
      const result: any = await this.getBusinessDetails().toPromise();
      this.businessDetails = result.data;
    }
    oDataSource.businessDetails = this.businessDetails;
    // const template = await this.getTemplate('activity').toPromise();
    // console.log(oDataSource);
    
    const template = await this.getTemplate(type).toPromise();

    oDataSource.oCustomer = {
      sFirstName: this.customer?.sFirstName || '',
      sLastName: this.customer?.sLastName || '',
      sEmail: this.customer?.sEmail || '',
      sMobile: this.customer?.oPhone?.sCountryCode || '' + this.customer?.oPhone?.sMobile || '',
      sLandLine: this.customer?.oPhone?.sLandLine || '',
    };
    oDataSource.sBarcodeURI = sBarcodeURI;
    const aTemp = oDataSource.sNumber.split("-");
    oDataSource.sPartRepairNumber = aTemp[aTemp.length - 1];
    oDataSource.sBusinessLogoUrl = (await this.getBase64FromUrl(oDataSource?.businessDetails?.sLogoLight).toPromise()).data;

    if (bPrint)
      this.printSettings = this.getPdfPrintSetting(type);

    this.receiptService.exportToPdf({
      oDataSource: oDataSource,
      templateData: template.data,
      pdfTitle: oDataSource.sNumber,
      printSettings: this.printSettings,
      bPrint: bPrint
    })
    return;
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

  getBase64FromUrl(url: any): Observable<any> {
    return this.apiService.getNew('cashregistry', `/api/v1/pdf/templates/getBase64/${this.iBusinessId}?url=${url}`);
  }

  getTemplate(type: string): Observable<any> {
    return this.apiService.getNew('cashregistry', `/api/v1/pdf/templates/${this.iBusinessId}?eType=${type}`);
  }

  fetchCustomer(customerId: any, index: number) {
    this.apiService.getNew('customer', `/api/v1/customer/${customerId}?iBusinessId=${this.iBusinessId}`).subscribe(
      (result: any) => {
        // console.log(result);
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
    this.loading = true;
    this.apiService.postNew('cashregistry', `/api/v1/activities/activity-item/${this.activity._id}`, this.requestParams).subscribe((result: any) => {
      this.activityItems = result.data[0].result;
      if (this.activityItems.length == 1) this.activityItems[0].collapsedBtn = true;
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
      // console.log(this.transactions);
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


  // Function for show transaction details
  async showTransaction(transactionItem: any, event: any) {
    const oBody = {
      iBusinessId: this.iBusinessId,
      oFilterBy: {
        _id: transactionItem.iTransactionId
      }
    }
    transactionItem.bFetchingTransaction = true;
    event.target.disabled = true;
    const _oTransaction: any = await this.apiService.postNew('cashregistry', `/api/v1/transaction/cashRegister`, oBody).toPromise();
    const transaction = _oTransaction?.data?.result[0];
    transactionItem.bFetchingTransaction = false;
    event.target.disabled = false;

    this.dialogService.openModal(TransactionDetailsComponent, { cssClass: "modal-xl", context: { transaction: transaction, eType: 'cash-register-revenue', from: 'activity-details' } })
      .instance.close.subscribe(
        (res: any) => {
          // if (res) this.router.navigate(['business/till']);
        });
  }

  generateBarcodeURI(displayValue: boolean = true, data :any) {
    var canvas = document.createElement("canvas");
    JsBarcode(canvas, data, { format: "CODE128", displayValue: displayValue });
    return canvas.toDataURL("image/png");
    // this.getBase64FromUrl('')  
  }

  // getBase64FromUrl(url: any): Observable<any> {
  //   const oBody = {
  //     iBusinessId: this.iBusinessId,

  //   }
  //   return this.apiService.getNew('cashregistry', `/api/v1/pdf/templates/generateBarcode/`, oBody);
  // }

  async downloadReceipt(){
    // console.log(this.activity);
    const oDataSource = JSON.parse(JSON.stringify(this.activity));
    const template = await this.getTemplate('activity').toPromise();
    if (!this.businessDetails) {
      const result: any = await this.getBusinessDetails().toPromise();
      this.businessDetails = result.data;
    }
    
    oDataSource.businessDetails = this.businessDetails;
    
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

    this.receiptService.exportToPdf({
      oDataSource: oDataSource,
      templateData: template.data,
      pdfTitle: this.activity.sNumber
    })

  }

  getPdfPrintSetting(eType:any) {
    return this.apiService.getNew('cashregistry', `/api/v1/print-settings/${this.iBusinessId}/${this.iWorkstationId}/pdf/${eType}`);
  }
}
