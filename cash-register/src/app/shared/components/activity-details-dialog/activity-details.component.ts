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
import { TranslateService } from '@ngx-translate/core';
import { TillService } from '../../service/till.service';
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
  repairStatus = ['new', 'info', 'processing', 'cancelled', 'inspection', 'completed', 'refundInCashRegister',
    'offer', 'offer-is-ok', 'offer-is-not-ok', 'to-repair', 'part-are-order', 'shipped-to-repair', 'delivered'];

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
  oLocationName: any;
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
      'iActivityItemId',
      'sBusinessPartnerName',
      'iBusinessPartnerId',
      'iBusinessBrandId',
      'iBrand',
      'iAssigneeId'
    ]
  };
  filteredEmployees: Array<any> = [];
  employeesList: Array<any> = [];
  brandsList: Array<any> = [];
  filteredBrands: Array<any> = [];
  supplierOptions: Array<any> = [];
  suppliersList: Array<any> = [];
  bFetchingTransaction: boolean = false;
  px2mmFactor !: number;
  printSettings: any;
  printActionSettings: any;
  iWorkstationId: string;
  aTemplates: any;
  eKindValue = ['discount', 'loyalty-points-discount' , 'loyalty-points'];
  eKindValueForLayout = [
    'regular',
    'expenses',
    'reservation',
    // below types used in cash register and webshop
    'empty-line',
    // below types only used in cash register
    'repair',
    'order',
    'gold-sell',
    'loyalty-points-discount',
    'giftcard-discount',

    'loyalty-points',
    'discount',
    'payment-discount',
    'offer',
    'refund'
  ];
  // eKindForLayoutHide =['giftcard'];
  translation:any=[];
  bActivityNumber: boolean = false;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
    private pdfService: PdfService,
    private dialogService: DialogService,
    private routes: Router,
    private receiptService: ReceiptService,
    private toastService: ToastService ,
    private translationService:TranslateService,
    private tillService: TillService,
  ) {
    const _injector = this.viewContainerRef.injector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
    this.iWorkstationId = localStorage.getItem("currentWorkstation") || '';
    this.iBusinessId = localStorage.getItem('currentBusiness') || '';
    this.iLocationId = localStorage.getItem('currentLocation') || '';
  }


  async ngOnInit() {
    let translationKey=['SUCCESSFULLY_UPDATED' , 'NO_DATE_SELECTED'];
    this.translationService.get(translationKey).subscribe((res:any)=>{
      this.translation = res;
    })
    this.oLocationName = this.activity.oLocationName;
    let _transactionItemData:any;
    if (this.activity) {
      if (this.activity?.activityitems?.length) {
        this.activityItems = this.activity.activityitems;
        if (this.activityItems?.length == 1) this.activityItems[0].collapsedBtn = true; /* only item there then we will always open it */
        if (this.openActivityId) {
          this.activityItems.forEach((item: any) => {
            if (item._id === this.openActivityId) item.collapsedBtn = true;
          });
        }
        
      } else {
        _transactionItemData = await this.fetchTransactionItems();
        this.processTransactionItems(_transactionItemData);
      }

    } else {
      _transactionItemData = await this.fetchTransactionItems();
      this.processTransactionItems(_transactionItemData);
    }
    

    if (this.activity?.iCustomerId) this.fetchCustomer(this.activity.iCustomerId, -1);
    this.getBusinessLocations();
    this.getListEmployees()
    this.getListSuppliers()
    this.getBusinessBrands();

    const [_printActionSettings, _printSettings, _template]: any = await Promise.all([
      this.getPdfPrintSetting({ oFilterBy: { sMethod: 'actions' } }),
      this.getPdfPrintSetting({ oFilterBy: { sType: ['repair', 'order', 'repair_alternative'] } }),
      this.getTemplate(['repair', 'order', 'repair_alternative' , 'giftcard'])
    ]);
    this.printActionSettings = _printActionSettings?.data[0]?.result[0].aActions;
    this.printSettings = _printSettings?.data[0]?.result;
    this.aTemplates = _template.data;
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
        this.activityItems.forEach((items:any , index:any)=>{
          let employeeIndex= this.employeesList.findIndex((employee:any)=> employee._id == items.iAssigneeId);
          if(employeeIndex != -1){
              this.activityItems[index] = { ... items , "employeeName":this.employeesList[employeeIndex].sName }
          }
        })
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
        this.activityItems.forEach((items:any , index:any)=>{
          let brandIndex= this.brandsList.findIndex((brand:any)=> brand._id == items.iBusinessBrandId);
          if(brandIndex != -1){
              this.activityItems[index] = { ... items , "brandName":this.brandsList[brandIndex].sName }
          }
        })
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

  removeBrands(index:any){
   this.activityItems[index].brandName=null;
   this.activityItems[index].iBusinessBrandId = null; 
  }

  removeSuppliers(index:any){
    this.activityItems[index].iBusinessPartnerId = null;
    this.activityItems[index].sBusinessPartnerName = null;
  }

  removeEmployeees(index:any){
    this.activityItems[index].iAssigneeId = null;
    this.activityItems[index].employeeName = null;
  }
  onEmployeeChange(e: any , index:any) {
    this.activityItems[index].iAssigneeId = e._id;
    this.activityItems[index].employeeName = e.sName;
    // this.employee = e.sName
  }
  onSupplierChange(e: any , index:any) {
    this.activityItems[index].iBusinessPartnerId = e._id;
    this.activityItems[index].sBusinessPartnerName = e.sName;
    // this.supplier = e.sName
  }
  onBrandChange(e: any , index:any) {
    this.activityItems[index].brandName = e.sName;
    this.activityItems[index].iBusinessBrandId = e._id;
    this.activityItems[index].iBrand = e.iBrandId;
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
    console.log('openTransaction: ', JSON.parse(JSON.stringify(transaction)), itemType);
    transaction.iActivityId = this.activity._id;
    this.dialogService.openModal(TransactionItemsDetailsComponent, { cssClass: "modal-xl", context: { transaction, itemType, selectedId: transaction._id } })
      .instance.close.subscribe((result: any) => {
        const data = this.tillService.processTransactionSearchResult(result);
        // const transactionItems: any = [];
        //if (result.transaction) {
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
          //       iArticleGroupId: transactionItem.iArticleGroupId,
          //       prePaidAmount: tType === 'refund' ? transactionItem.nPaidAmount : transactionItem.nPaymentAmount,
          //       type: transactionItem.sGiftCardNumber ? 'giftcard' : transactionItem.oType.eKind,
          //       eTransactionItemType: 'regular',
          //       nBrokenProduct: 0,
          //       tType,
          //       oType: transactionItem.oType,
          //       sUniqueIdentifier: transactionItem.sUniqueIdentifier,
          //       aImage: transactionItem.aImage,
          //       nonEditable: transactionItem.sGiftCardNumber ? true : false,
          //       sGiftCardNumber: transactionItem.sGiftCardNumber,
          //       quantity: transactionItem.nQuantity,
          //       price: transactionItem.nPriceIncVat,
          //       iRepairerId: transactionItem.iRepairerId,
          //       oArticleGroupMetaData: transactionItem.oArticleGroupMetaData,
          //       nRedeemedLoyaltyPoints: transactionItem.nRedeemedLoyaltyPoints,
          //       iEmployeeId: transactionItem.iEmployeeId,
          //       iBusinessBrandId: transactionItem.iBusinessBrandId,
          //       discount: 0,
          //       tax: transactionItem.nVatRate,
          //       paymentAmount,
          //       description: '',
          //       open: true,
          //       nMargin: transactionItem.nMargin,
          //       nPurchasePrice: transactionItem.nPurchasePrice,
          //       sServicePartnerRemark: transactionItem.sServicePartnerRemark,
          //       eActivityItemStatus: transactionItem.eActivityItemStatus,
          //       eEstimatedDateAction: transactionItem.eEstimatedDateAction,
          //       bGiftcardTaxHandling: transactionItem.bGiftcardTaxHandling,
          //     });
          //   }
          // });
          // result.transactionItems = transactionItems;

          localStorage.setItem('fromTransactionPage', JSON.stringify(data));
          localStorage.setItem('recentUrl', '/business/transactions');
          setTimeout(() => {
            if (this.loadCashRegister) {
              this.routes.navigate(['/business/till']);
            }
            this.close(true);
          }, 100);
        //}
      }, (error) => {
        console.log('error: ', error);
      });
  }
  getBusinessDetails(): Observable<any> {
    return this.apiService.getNew('core', '/api/v1/business/' + this.business._id);
  }

  async downloadCustomerReceipt(index: number) {
    let oDataSource = JSON.parse(JSON.stringify(this.activity));
    if (oDataSource?.activityitems) {
      oDataSource = oDataSource.activityitems[index];
    }
    let type:any;
    let sBarcodeURI:any;
    if(oDataSource?.oType?.eKind === 'giftcard'){
      type = oDataSource.oType.eKind;
      oDataSource.nTotal = oDataSource.nPaidAmount;
      sBarcodeURI = this.generateBarcodeURI(true, 'G-'+oDataSource.sGiftCardNumber);
    } 
    else {
      type = (oDataSource?.oType.eKind === 'regular') ? 'repair_alternative' : 'repair';
      sBarcodeURI = this.generateBarcodeURI(false, oDataSource.sNumber);
    } 
    if (!this.businessDetails) {
      const result: any = await this.getBusinessDetails().toPromise();
      this.businessDetails = result.data;
    }
    oDataSource.businessDetails = this.businessDetails;

    const template = this.aTemplates.filter((t: any) => t.eType === type)[0];

    oDataSource.oCustomer = {
      sFirstName: this.customer?.sFirstName || '',
      sLastName: this.customer?.sLastName || '',
      sEmail: this.customer?.sEmail || '',
      sMobile: this.customer?.oPhone?.sCountryCode || '' + this.customer?.oPhone?.sMobile || '',
      sLandLine: this.customer?.oPhone?.sLandLine || '',
      sAddressLine1:this.customer?.oShippingAddress?.sStreet + " " + this.customer?.oShippingAddress?.sHouseNumber + " " + this.customer?.oShippingAddress?.sHouseNumberSuffix + " , " + this.customer?.oShippingAddress?.sPostalCode + " " + this.customer?.oShippingAddress?.sCity ,
      sAddressLine2:this.customer?.oShippingAddress?.sCountry
    };
    if(!oDataSource.dEstimatedDate){
        oDataSource.dEstimatedDate = this.translation['NO_DATE_SELECTED'];
    }
    if(oDataSource?.iEmployeeId){
      const employeeIndex:any = this.employeesList.findIndex((employee:any)=> employee._id == oDataSource.iEmployeeId);
      if(employeeIndex != -1){
          oDataSource.sEmployeeName= this.employeesList[employeeIndex]['sName'];
      }
    }
    oDataSource.sBarcodeURI = sBarcodeURI;
    const aTemp = oDataSource.sNumber.split("-");
    oDataSource.sPartRepairNumber = aTemp[aTemp.length - 1];
    oDataSource.sBusinessLogoUrl = (await this.getBase64FromUrl(oDataSource?.businessDetails?.sLogoLight).toPromise()).data;
    // return;
    // this.printSettings = this.getPdfPrintSetting(type);

    this.sendForReceipt(oDataSource, template, oDataSource.sNumber);
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

  getTemplate(types: any) {
    const body = {
      iBusinessId: this.iBusinessId,
      oFilterBy: {
        eType: types
      }
    }
    return this.apiService.postNew('cashregistry', `/api/v1/pdf/templates`, body).toPromise();
  }

  fetchCustomer(customerId: any, index: number) {
    this.apiService.getNew('customer', `/api/v1/customer/${customerId}?iBusinessId=${this.iBusinessId}`).subscribe(
      (result: any) => {
        if (index > -1) this.transactions[index].customer = result;
        else this.customer = result;
      },
      (error: any) => {
        console.error(error)
      }
    );
  }

  processTransactionItems(result:any){
    this.activityItems = result.data[0].result;
    this.oLocationName = this.activityItems[0].oLocationName;   
    if (this.activityItems.length == 1) this.activityItems[0].collapsedBtn = true;
    this.transactions = [];
    for (const obj of this.activityItems) {
      for (const item of obj.receipts) {
        this.transactions.push({ ...item, ...obj });
      }
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
  }

  fetchTransactionItems() {
    this.loading = true;
    return this.apiService.postNew('cashregistry', `/api/v1/activities/activity-item/${this.activity._id}`, this.requestParams).toPromise();

    // .subscribe((result: any) => {
      
    // }
    // , (error) => {
    //   this.loading = false;
    //   alert(error.error.message);
    //   this.dialogRef.close.emit('data');
    // });
  }

  close(data: any) {
    this.dialogRef.close.emit(data);
  }

  submit(activityItemId: any, index: any) {
    const oActivityItem = this.activityItems[index];
    oActivityItem.iBusinessId = this.iBusinessId;
    this.apiService.putNew('cashregistry', '/api/v1/activities/items/' + activityItemId, oActivityItem)
      .subscribe((result: any) => {
        if(result.message == 'success'){
          this.apiService.activityItemDetails.next(oActivityItem);
          this.toastService.show({type:"success" , text:this.translation['SUCCESSFULLY_UPDATED']});
        }
        else
        {
          let errorMessage = "";
          this.translationService.get(result.message).subscribe((res:any)=>{
            errorMessage =res;
          })
          this.toastService.show({type:"danger" , text:errorMessage});
        }
      }, (error) => {
        console.log('error: ', error);
        let errorMessage = "";
        this.translationService.get(error.error.message).subscribe((res:any)=>{
          errorMessage =res;
        })
        this.toastService.show({type:"danger" , text:errorMessage});
      })
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

  generateBarcodeURI(displayValue: boolean = true, data: any) {
    var canvas = document.createElement("canvas");
    JsBarcode(canvas, data, { format: "CODE128", displayValue: displayValue });
    return canvas.toDataURL("image/png");
  }

  async downloadReceipt() {
    const oDataSource = JSON.parse(JSON.stringify(this.activity));
    const template = this.aTemplates.filter((t: any) => t.eType === 'order')[0];
    if (!this.businessDetails) {
      const result: any = await this.getBusinessDetails().toPromise();
      this.businessDetails = result.data;
    }
    oDataSource.businessDetails = this.businessDetails;
    oDataSource.businessDetails.sMobile = this.businessDetails.oPhone.sMobile;
    const locationIndex = this.businessDetails.aLocation.findIndex((location:any)=>location._id == this.iLocationId);
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
    oDataSource.aTransactionItems = oDataSource.activityitems;
    oDataSource.sActivityNumber = oDataSource.sNumber;
    oDataSource.aTransactionItems.forEach((item: any) => {
      item.sActivityItemNumber = item.sNumber;
      item.sOrderDescription = item.sProductName + '\n' + item.sDescription;
    });

    this.sendForReceipt(oDataSource, template, oDataSource.sNumber);
  }

  sendForReceipt(oDataSource: any, template: any, title: any) {
    this.receiptService.exportToPdf({
      oDataSource: oDataSource,
      pdfTitle: title,
      templateData: template,
      printSettings: this.printSettings,
      printActionSettings: this.printActionSettings,
      eSituation: 'is_created'
    });
  }

  getPdfPrintSetting(oFilterBy?: any) {
    const oBody = {
      iLocationId: this.iLocationId,
      ...oFilterBy
    }
    return this.apiService.postNew('cashregistry', `/api/v1/print-settings/list/${this.iBusinessId}`, oBody).toPromise();
  }

  changeTotalAmount(activity: any) {
    activity.nTotalAmount = activity.nPriceIncVat * activity.nQuantity;
  }
}
