import { AfterViewInit, Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from '../../service/dialog';
import { ViewContainerRef } from '@angular/core';
import { ApiService } from 'src/app/shared/service/api.service';
import { faTimes, faMessage, faEnvelope, faEnvelopeSquare, faUser, faUpload, faReceipt, faEuro, faChevronRight, faDownload, faPrint } from "@fortawesome/free-solid-svg-icons";
import { TransactionItemsDetailsComponent } from '../transaction-items-details/transaction-items-details.component';
import { MenuComponent } from '../../_layout/components/common';
import { NavigationEnd, Router } from '@angular/router';
import { TransactionDetailsComponent } from 'src/app/transactions/components/transaction-details/transaction-details.component';
import * as JsBarcode /* , { Options as jsBarcodeOptions } */ from 'jsbarcode';
import { ReceiptService } from '../../service/receipt.service';
import { Observable } from 'rxjs';
import { ToastService } from '../toast';
import { TranslateService } from '@ngx-translate/core';
import { TillService } from '../../service/till.service';
import { AddFavouritesComponent } from '../add-favourites/favourites.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { animate, style, transition, trigger } from '@angular/animations';
import { CustomerDetailsComponent } from '../customer-details/customer-details.component';
import { PdfService } from '../../service/pdf.service';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { CustomerDialogComponent } from '../customer-dialog/customer-dialog.component';
@Component({
  selector: 'app-activity-details',
  templateUrl: './activity-details.component.html',
  styleUrls: ['./activity-details.component.scss'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('500ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class ActivityDetailsComponent implements OnInit {

  $element = HTMLInputElement
  dialogRef: DialogComponent;
  customer: any;
  activity: any;
  createrDetail: any;
  webOrders: boolean | undefined;
  items: Array<any> = [];
  from: string;
  mode: string = '';
  showLoader = false;
  activityItems: Array<any> = [];
  imagePlaceHolder: string = '../../../../assets/images/no-photo.svg';
  faTimes = faTimes;
  faMessage = faMessage;
  faUpload = faUpload;
  faEnvelope = faEnvelope;
  faEnvelopeSquare = faEnvelopeSquare;
  faUser = faUser;
  faPrint = faPrint;
  faReceipt = faReceipt;
  faEuro = faEuro;
  faChevronRight = faChevronRight;
  faDownload = faDownload;
  submitted = false;
  repairStatus = [
    { key: 'NEW', value: 'new' },
    { key: 'INFO', value: 'info' },
    { key: 'PROCESSING', value: 'processing' },
    { key: 'CANCELLED', value: 'cancelled' },
    { key: 'INSPECTION', value: 'inspection' },
    { key: 'COMPLETED', value: 'completed' },
    { key: 'REFUNDINCASHREGISTER', value: 'refundInCashRegister' },
    { key: 'OFFER', value: 'offer' },
    { key: 'OFFER_IS_OK', value: 'offer-is-ok' },
    { key: 'OFFER_IS_NOT_OK', value: 'offer-is-not-ok' },
    { key: 'TO_REPAIR', value: 'to-repair' },
    { key: 'PART_ARE_ORDER', value: 'part-are-order' },
    { key: 'SHIPPED_TO_REPAIR', value: 'shipped-to-repair' },
    { key: 'DELIVERED', value: 'delivered' }
  ]
  // repairStatus = ['new', 'info', 'processing', 'cancelled', 'inspection', 'completed', 'refundInCashRegister',
  // 'offer', 'offer-is-ok', 'offer-is-not-ok', 'to-repair', 'part-are-order', 'shipped-to-repair', 'delivered'];

  carriers = ['PostNL', 'DHL', 'DPD', 'bpost', 'other'];
  printOptions = ['Portrait', 'Landscape'];
  itemType = 'transaction';
  customerReceiptDownloading: Boolean = false;
  loading: Boolean = false;
  bIsVisible: Boolean = false;
  iBusinessId = localStorage.getItem('currentBusiness');
  transactions: Array<any> = [];
  totalPrice: Number = 0;
  quantity: Number = 0;
  userDetail: any;
  business: any;
  oLocationName: any= "";
  businessDetails: any;
  iLocationId: String = '';
  language: any;
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
      'iAssigneeId',
      'iBusinessProductId',
      'oCustomer'
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
  eKindValue = ['discount', 'loyalty-points-discount', 'loyalty-points'];
  oCurrentCustomer: any = {}; /* We are having the same oCustomer for Activity, ActivityItem and Transaction */
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
  translation: any = [];
  bShowOrderDownload: boolean = false;
  routerSub: any;
  bActivityPdfGenerationInProgress: boolean = false;
  bCustomerReceipt: boolean = false;
  bDownloadCustomerReceipt: boolean = false;
  bDownloadReceipt: boolean = false;
  aContactOption = [{ key: 'CALL_ON_READY', value: 'call_on_ready' },
  { key: 'EMAIL_ON_READY', value: 'email_on_ready' },
  { key: 'WHATSAPP_ON_READY', value: 'whatsapp_on_ready' }]

  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
    private dialogService: DialogService,
    private routes: Router,
    private receiptService: ReceiptService,
    private pdfService: PdfService,
    private toastService: ToastService,
    private translationService: TranslateService,
    public tillService: TillService,
    private clipboard: Clipboard
  ) {
    const _injector = this.viewContainerRef.injector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
    this.iWorkstationId = localStorage.getItem("currentWorkstation") || '';
    this.iBusinessId = localStorage.getItem('currentBusiness') || '';
    this.iLocationId = localStorage.getItem('currentLocation') || '';
    this.language = localStorage.getItem('language') || 'en';
  }


  async ngOnInit() {
    //console.log('from-----------transaction', this.from, this.activityItems, this.activity)
    this.customer = this.activityItems[0].oCustomer;
    
    this.oCurrentCustomer = this.activityItems[0].oCustomer;
  
    this.apiService.setToastService(this.toastService);
    this.routerSub = this.routes.events.subscribe((event) => {
      if (event instanceof NavigationEnd && !(event.url.startsWith('/business/activity-items') || event.url.startsWith('/business/services'))) {
        this.routerSub.unsubscribe();
        this.close(false);
      }
    });


    let translationKey = ['SUCCESSFULLY_UPDATED', 'NO_DATE_SELECTED'];
    this.translationService.get(translationKey).subscribe((res: any) => {
      this.translation = res;
    })

    
    

    if (this.activity) {
      //console.log(this.activity);
      //console.log("this.activity-----");
      // this.oLocationName = this.activity.oLocationName;
      this.bShowOrderDownload = true;
      this.fetchTransactionItems(this.activity._id);
      // if (this.activity?.activityitems?.length) {
      // console.log(211)
      // this.activityItems = this.activity.activityitems;
      // if (this.activityItems?.length == 1) this.activityItems[0].bIsVisible = true; /* only item there then we will always open it */
      //  this.activityItems.forEach((item:any , index)=>{
      //   if(item.oType.eKind == 'order' && item?.iBusinessProductId){
      //     this.getBusinessProduct(item.iBusinessProductId).subscribe((res:any)=>{
      //      const productDetail = res.data;
      //      this.activityItems[index].sArticleNumber = productDetail.sArticleNumber
      //      this.activityItems[index].sProductNumber = productDetail.sProductNumber
      //      this.activityItems[index].sArticleName = productDetail?.oArticleGroup?.oName[this.language]
      //     });

      //    }
      //  })
      // }
    } else {
      //console.log("else");
      //console.log(this.activityItems[0].iActivityId);
      // we have opened an activity item so fetch associated activity (required for checkout)
      // this.fetchActivity(this.activity._id); //actually it is an id of activity item
      // console.log(235)
      if(this.activityItems && this.activityItems.length>0){
        this.oLocationName = this.businessDetails.aLocation.find((location: any) => location._id === this.activityItems[0].iLocationId)?.sName;
     
      }else{
        this.oLocationName ="";
      }
      //console.log("-this.oLocationName--");
      //console.log(this.oLocationName);
      this.fetchActivity(this.activityItems[0].iActivityId);
      this.fetchTransactionItems(this.activityItems[0]._id);
    }
    // console.log(236)
    // this.processActivityItems();

    // if (this.activity?.iCustomerId) this.fetchCustomer(this.activity.iCustomerId, -1);
    this.getBusinessLocations();
    this.getListSuppliers()
    this.getBusinessBrands();
    this.activityItems.forEach((items: any, index: any) => {
      console.log(this.brandsList);
      console.log(items.iBusinessBrandId);
      let brandIndex = this.brandsList.findIndex((brand: any) => brand._id == items.iBusinessBrandId);
      if (brandIndex != -1) {
        this.activityItems[index] = { ...items, "brandName": this.brandsList[brandIndex].sName }
      }
    })
   
      
  
    const [_printActionSettings, _printSettings]: any = await Promise.all([
      this.getPdfPrintSetting({ oFilterBy: { sMethod: 'actions' } }),
      this.getPdfPrintSetting({ oFilterBy: { sType: ['repair', 'order', 'repair_alternative'] } }),
    ]);
    this.printActionSettings = _printActionSettings?.data[0]?.result[0].aActions;
    this.printSettings = _printSettings?.data[0]?.result;
  }

  processActivityItems() {
    const aDiscounts = this.activityItems.filter((item: any) => item?.oType?.eKind === 'discount')
    this.activityItems = this.activityItems.filter((item: any) => item?.oType?.eKind !== 'discount')

    if (this.activityItems?.length == 1) {

      this.activityItems[0].bIsVisible = true;

    } else if (this.openActivityId) {

      this.activityItems.find((item: any) => item._id === this.openActivityId).bIsVisible = true

    } else {
      this.activityItems.forEach((item: any) => item.bIsVisible = false)
    }

    if (aDiscounts?.length) {
      this.activityItems.forEach((item: any) => {
        const discountRecord = aDiscounts.find((d: any) => d.sUniqueIdentifier === item.sUniqueIdentifier)
        if (discountRecord) {
          item.nPaidAmount = item.nPaidAmount + discountRecord.nPaidAmount;
        }
      })
    }
  }

  fetchActivity(_id: any) {
    this.apiService.getNew('cashregistry', `/api/v1/activities/${_id}?iBusinessId=${this.requestParams.iBusinessId}`).subscribe((result: any) => {
      if (result?.data?._id)
        this.activity = result.data;
        
    });
  }

  openImageModal(activityindex: any) {
    this.dialogService.openModal(ImageUploadComponent, { cssClass: "modal-m", context: { mode: 'create' } })
      .instance.close.subscribe(result => {
        if (result.url)
          this.activityItems[activityindex].aImage.push(result.url);
      });
  }

  getBusinessProduct(iProductId: any) {
    return this.apiService.getNew('core', `/api/v1/business/products/${iProductId}?iBusinessId=${this.iBusinessId}`);
  }

  getListEmployees() {
    // const oBody = {
    //   iBusinessId: localStorage.getItem('currentBusiness') || '',
    // }
    // this.apiService.postNew('auth', `/api/v1/employee/list`, oBody).subscribe((result: any) => {
    //   if (result && result.data && result.data.length) {
    // this.employeesList = result.data[0].result;
    if (this.activity?.iEmployeeId) {
      let createerIndex = this.employeesList.findIndex((employee: any) => employee._id == this.activity.iEmployeeId);
      if (createerIndex != -1) {
        this.createrDetail = this.employeesList[createerIndex];
        this.activity.sAdvisedEmpFirstName = this.createrDetail?.sFirstName || 'a';
      }
    }

    this.employeesList.map(o => o.sName = `${o.sFirstName} ${o.sLastName}`);
    if (this.activityItems[0]?.iEmployeeId) {
      let createerIndex = this.employeesList.findIndex((employee: any) => employee._id == this.activityItems[0].iEmployeeId);
      if (createerIndex != -1) {
        this.createrDetail = this.employeesList[createerIndex]
      }
    }
    this.activityItems.forEach((items: any, index: any) => {
      let employee = this.employeesList.find((employee: any) => employee._id === items.iAssigneeId);
      if (employee) {
        this.activityItems[index] = { ...items, "employeeName": employee.sName }
      }
    })
    // }
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
        this.activityItems.forEach((items: any, index: any) => {
          let brandIndex = this.brandsList.findIndex((brand: any) => brand._id == items.iBusinessBrandId);
          if (brandIndex != -1) {
            this.activityItems[index] = { ...items, "brandName": this.brandsList[brandIndex].sName }
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

  removeBrands(index: any) {
    this.activityItems[index].brandName = null;
    this.activityItems[index].iBusinessBrandId = null;
  }

  removeSuppliers(index: any) {
    this.activityItems[index].iBusinessPartnerId = null;
    this.activityItems[index].sBusinessPartnerName = null;
  }

  removeEmployeees(index: any) {
    this.activityItems[index].iAssigneeId = null;
    this.activityItems[index].employeeName = null;
  }
  onEmployeeChange(e: any, index: any) {
    this.activityItems[index].iAssigneeId = e._id;
    this.activityItems[index].employeeName = e.sName;
    // this.employee = e.sName
  }
  onSupplierChange(e: any, index: any) {
    this.activityItems[index].iBusinessPartnerId = e._id;
    this.activityItems[index].sBusinessPartnerName = e.sName;
    // this.supplier = e.sName
  }
  onBrandChange(e: any, index: any) {
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

  removeImage(activityindex: any, imageIndex: any) {
    this.activityItems[activityindex].aImage.splice(imageIndex, 1);
  }
  openImage(activityindex: any, imageIndex: any) {
    const url = this.activityItems[activityindex].aImage[imageIndex];
    window.open(url, "_blank");
  }



  openCustomer(customer: any) {
    //console.log("customer477");
    //console.log(customer);
    this.dialogService.openModal(CustomerDetailsComponent,
      { cssClass: "modal-xl position-fixed start-0 end-0", context: { customerData: customer, mode: 'details', editProfile: false } }).instance.close.subscribe(result => { });
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
                  this.tillService.selectCurrency(this.business?.aInLocation?.filter((location: any) => location?._id.toString() == this.iLocationId.toString())[0]);
                }
              })
          }
        }

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

  AssignOrderProduct(activity: any, index: any) {
    this.dialogService.openModal(AddFavouritesComponent, { cssClass: 'modal-lg', context: { "mode": "assign", "oActivityItem": activity }, hasBackdrop: true, closeOnBackdropClick: true, closeOnEsc: true }).instance.close.subscribe((result: any) => {
      if (result?.action != false) {
        this.getBusinessProduct(result.action.iBusinessProductId).subscribe((res: any) => {
          const productDetail = res.data;
          this.activityItems[index].sArticleNumber = productDetail.sArticleNumber
          this.activityItems[index].sProductNumber = productDetail.sProductNumber
          this.activityItems[index].sArticleName = productDetail?.oArticleGroup?.oName[this.language]
        });
      }
    }, (error) => {
      console.log(error);
    })
  }

  openTransaction(transaction: any, itemType: any) {
    // console.log('openTransaction: ', this.activity, itemType);
    transaction.iActivityId = this.activity._id;
    this.dialogService.openModal(TransactionItemsDetailsComponent, { cssClass: "modal-xl", context: { transaction: this.activity, itemType, selectedId: transaction._id } })
      .instance.close.subscribe((result: any) => {
        // console.log(514, result)
        if (result?.action) {
          // console.log(516, 'calling process transaction search result')
          const data = this.tillService.processTransactionSearchResult(result);
          // console.log(518, data)
          localStorage.setItem('fromTransactionPage', JSON.stringify(data));
          localStorage.setItem('recentUrl', '/business/transactions');
          setTimeout(() => {
            if (this.loadCashRegister) {
              this.close(true);
              this.routes.navigate(['/business/till']);
            }
          }, 100);
        }
      }, (error) => {
        console.log('error: ', error);
      });
  }
  getBusinessDetails(): Observable<any> {
    return this.apiService.getNew('core', '/api/v1/business/' + this.business._id);
  }

  async downloadCustomerReceipt(index: number, receipt: any) {
    if (receipt == 'customerReceipt') {
      this.bCustomerReceipt = true;
    } else if (receipt == 'downloadCustomerReceipt') {
      this.bDownloadCustomerReceipt = true;
    }

    let oDataSource = JSON.parse(JSON.stringify(this.activityItems[index]));
    // if (oDataSource?.activityitems) {
    //   oDataSource = oDataSource.activityitems[index];
    // }
    let type: any;
    let sBarcodeURI: any;
    if (oDataSource?.oType?.eKind === 'giftcard') {
      type = oDataSource.oType.eKind;
      oDataSource.nTotal = oDataSource.nPaidAmount;
      sBarcodeURI = this.generateBarcodeURI(true, 'G-' + oDataSource.sGiftCardNumber);
    }
    else {
      type = (oDataSource?.oType?.eKind === 'regular') ? 'repair_alternative' : 'repair';
      sBarcodeURI = this.generateBarcodeURI(false, oDataSource.sNumber);
    }
    // if (!this.businessDetails) {
    //   const result: any = await this.getBusinessDetails().toPromise();
    //   this.businessDetails = result.data;
    // }
    oDataSource.businessDetails = this.businessDetails;
    const aPromises = [];
    let bBusinessLogo = false, bTemplate = false;
    if (this.businessDetails?.sBusinessLogoUrl) {
      oDataSource.sBusinessLogoUrl = this.businessDetails?.sBusinessLogoUrl;
    } else {
      if (oDataSource?.businessDetails?.sLogoLight) {
        aPromises.push(this.getBase64FromUrl(oDataSource?.businessDetails?.sLogoLight).toPromise())
        bBusinessLogo = true;
      }
    }

    if (!this.aTemplates?.length) {
      aPromises.push(this.getTemplate(['repair', 'order', 'repair_alternative', 'giftcard']));
      bTemplate = true;
    }

    const aResultPromises: any = await Promise.all(aPromises);

    if (bBusinessLogo) {
      oDataSource.sBusinessLogoUrl = aResultPromises[0].data;
      this.businessDetails.sBusinessLogoUrl = aResultPromises[0].data;
    }

    if (bTemplate) {
      this.aTemplates = (bBusinessLogo) ? aResultPromises[1].data : aResultPromises[0].data;
    }

    const template = this.aTemplates.filter((t: any) => t.eType === type)[0];
    oDataSource.oCustomer = this.tillService.processCustomerDetails(this.customer);
    
    // {
    //   sFirstName: this.customer?.sFirstName || '',
    //   sLastName: this.customer?.sLastName || '',
    //   sEmail: this.customer?.sEmail || '',
    //   sMobile: this.customer?.oPhone?.sCountryCode || '' + this.customer?.oPhone?.sMobile || '',
    //   sLandLine: this.customer?.oPhone?.sLandLine || '',
    //   sAddressLine1: this.customer?.oShippingAddress?.sStreet + " " + this.customer?.oShippingAddress?.sHouseNumber + " " + this.customer?.oShippingAddress?.sHouseNumberSuffix + " , " + this.customer?.oShippingAddress?.sPostalCode + " " + this.customer?.oShippingAddress?.sCity,
    //   sAddressLine2: this.customer?.oShippingAddress?.sCountry
    // };
    if (!oDataSource.dEstimatedDate) {
      oDataSource.dEstimatedDate = this.translation['NO_DATE_SELECTED'];
    }
    if (oDataSource?.iEmployeeId) {
      const employeeIndex: any = this.employeesList.findIndex((employee: any) => employee._id == oDataSource.iEmployeeId);
      if (employeeIndex != -1) {
        oDataSource.sEmployeeName = this.employeesList[employeeIndex]['sName'];
        oDataSource.sAdvisedEmpFirstName = this.employeesList[employeeIndex]['sFirstName'] || 'a';
        // if(type==='repair')
        // else
        //   oDataSource.sAdvisedEmpFirstName = `Advised By: ${this.employeesList[employeeIndex]['sFirstName']}`;
      }
    }
    oDataSource.sBarcodeURI = sBarcodeURI;
    const aTemp = oDataSource.sNumber.split("-");
    oDataSource.sPartRepairNumber = aTemp[aTemp.length - 1];
    // oDataSource.sBusinessLogoUrl = (await this.getBase64FromUrl(oDataSource?.businessDetails?.sLogoLight).toPromise()).data;
    this.sendForReceipt(oDataSource, template, oDataSource.sNumber, receipt);
  }

  getBase64FromUrl(url: any): Observable<any> {
    return this.apiService.getNew('cashregistry', `/api/v1/pdf/templates/getBase64/${this.iBusinessId}?url=${url}`);
  }

  getTemplate(types: any) {
    const body = {
      iBusinessId: this.iBusinessId,
      iLocationId: this.iLocationId,
      oFilterBy: {
        eType: types
      }
    }
    return this.apiService.postNew('cashregistry', `/api/v1/pdf/templates`, body).toPromise();
  }

  fetchCustomer(customerId: any, index: number) {
    
    if (!customerId) return;
    this.apiService.getNew('customer', `/api/v1/customer/${customerId}?iBusinessId=${this.iBusinessId}`).subscribe(
      (result: any) => {
        if (index > -1) this.transactions[index].customer = result;
        this.customer = result;
        console.log(result);console.log("result");

      },
      (error: any) => {
        console.error(error)
      }
    );  
  }

  async processTransactionItems(result: any) {
    this.activityItems = result.data[0].result;
    this.activityItems.forEach((items: any, index: any) => {
        let brandIndex = this.brandsList.findIndex((brand: any) => brand._id == items.iBusinessBrandId);
        if (brandIndex != -1) {
          this.activityItems[index] = { ...items, "brandName": this.brandsList[brandIndex].sName }
        }
        
    });
    this.oCurrentCustomer = this.activityItems[0].oCustomer;
    this.oLocationName = this.activityItems[0].oLocationName;
    // if (this.activityItems.length == 1) this.activityItems[0].bIsVisible = true;
    this.transactions = [];
    for (const obj of this.activityItems) {
      if (obj.oType.eKind == 'order' && obj?.iBusinessProductId) {
        const _productData: any = await this.getBusinessProduct(obj.iBusinessProductId).toPromise();
        const productDetail = _productData.data;
        obj.sArticleNumber = productDetail.sArticleNumber
        obj.sProductNumber = productDetail.sProductNumber
      }
      for (const item of obj.receipts) {
        this.transactions.push({ ...item, ...obj });
      }
    }
    for (let i = 0; i < this.transactions.length; i++) {
      const obj = this.transactions[i];
      this.totalPrice += obj.nPaymentAmount;
      this.quantity += obj.bRefund ? (- obj.nQuantity) : obj.nQuantity
      if (obj.iStockLocationId) this.setSelectedBusinessLocation(obj.iStockLocationId, i)
      //console.log(obj?.iCustomerId);
      //console.log("obj?.iCustomerId");
      this.fetchCustomer(obj?.iCustomerId, i);
    }
    this.getListEmployees()
    this.loading = false;
    setTimeout(() => {
      MenuComponent.reinitialization();
    }, 200);
  }

  fetchTransactionItems(_id: any) {
    this.loading = true;
    const url = (this.from === 'activity-items') ? `/api/v1/activities/activity-item/${_id}` : `/api/v1/activities/items/${_id}`;
    this.apiService.postNew('cashregistry', url, this.requestParams).subscribe((result: any) => {
      this.processTransactionItems(result)
    });
  }

  close(data: any) {
    this.dialogRef.close.emit(data);
  }

  submit(activityItemId: any, index: any) {
    this.submitted = true;
    const oActivityItem = this.activityItems[index];
    oActivityItem.iBusinessId = this.iBusinessId;
    this.apiService.putNew('cashregistry', '/api/v1/activities/items/' + activityItemId, oActivityItem)
      .subscribe((result: any) => {

        if (result.message == 'success') {
          this.submitted = false;
          this.apiService.activityItemDetails.next(oActivityItem);
          this.toastService.show({ type: "success", text: this.translation['SUCCESSFULLY_UPDATED'] });


        }
        else {
          this.submitted = false;
          let errorMessage = "";
          this.translationService.get(result.message).subscribe((res: any) => {
            errorMessage = res;
          })
          this.toastService.show({ type: "warning", text: errorMessage });
        }
      }, (error) => {
        this.submitted = false;
        console.log('error: ', error);
        let errorMessage = "";
        this.translationService.get(error.message).subscribe((res: any) => {
          errorMessage = res;
        })
        this.toastService.show({ type: "warning", text: errorMessage });
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

  async downloadReceipt(event: any, receipt: any) {
    if (receipt == 'downloadReceipt') {
      this.bDownloadReceipt = true;
    }
    this.bActivityPdfGenerationInProgress = true;
    event.target.disabled = true;

    const oDataSource = JSON.parse(JSON.stringify(this.activity));
    oDataSource.businessDetails = this.businessDetails;

    // if (!this.businessDetails) {
    //   const result: any = await this.getBusinessDetails().toPromise();
    //   this.businessDetails = result.data;
    // }
    const aPromises = [];
    let bBusinessLogo = false, bTemplate = false;
    if (this.businessDetails?.sBusinessLogoUrl) {
      oDataSource.sBusinessLogoUrl = this.businessDetails?.sBusinessLogoUrl;
    } else {
      if (oDataSource?.businessDetails?.sLogoLight) {
        aPromises.push(this.getBase64FromUrl(oDataSource?.businessDetails?.sLogoLight).toPromise())
        bBusinessLogo = true;
      }
    }

    if (!this.aTemplates?.length) {
      aPromises.push(this.getTemplate(['repair', 'order', 'repair_alternative', 'giftcard']));
      bTemplate = true;
    }

    const aResultPromises: any = await Promise.all(aPromises);

    if (bBusinessLogo) {
      oDataSource.sBusinessLogoUrl = aResultPromises[0].data;
      this.businessDetails.sBusinessLogoUrl = aResultPromises[0].data;
    }

    if (bTemplate) {
      this.aTemplates = (bBusinessLogo) ? aResultPromises[1].data : aResultPromises[0].data;
    }


    const template = this.aTemplates.filter((t: any) => t.eType === 'order')[0];

    oDataSource.businessDetails.sMobile = this.businessDetails.oPhone.sMobile;
    oDataSource.businessDetails.sLandLine = this.businessDetails?.oPhone?.sLandLine;
    const locationIndex = this.businessDetails.aLocation.findIndex((location: any) => location._id == this.iLocationId);
    const currentLocation = this.businessDetails.aLocation[locationIndex];
    oDataSource.businessDetails.sAddressline1 = currentLocation.oAddress.street + " " + currentLocation.oAddress.houseNumber + " " + currentLocation.oAddress.houseNumberSuffix + " ,  " + currentLocation.oAddress.postalCode + " " + currentLocation.oAddress.city;
    oDataSource.businessDetails.sAddressline2 = currentLocation.oAddress.country;
    oDataSource.oCustomer = this.tillService.processCustomerDetails(this.customer);
    
    // {
    //   sFirstName: this.customer?.sFirstName || '',
    //   sLastName: this.customer?.sLastName || '',
    //   sEmail: this.customer?.sEmail || '',
    //   sMobile: this.customer?.oPhone?.sCountryCode || '' + this.customer?.oPhone?.sMobile || '',
    //   sLandLine: this.customer?.oPhone?.sLandLine || '',
    // };

    const sActivityBarcodeURI = this.generateBarcodeURI(false, oDataSource.sNumber);
    oDataSource.sActivityBarcodeURI = sActivityBarcodeURI;

    // oDataSource.aTransactionItems = oDataSource.activityitems;
    oDataSource.sActivityNumber = oDataSource.sNumber;
    let nTotalPaidAmount = 0;
    oDataSource.activityitems.forEach((item: any) => {
      nTotalPaidAmount += item.nPaidAmount;
      item.sActivityItemNumber = item.sNumber;
      item.sOrderDescription = item.sProductName + '\n' + item.sDescription;
    });
    oDataSource.nTotalPaidAmount = nTotalPaidAmount;

    this.sendForReceipt(oDataSource, template, oDataSource.sNumber, receipt);
    this.bActivityPdfGenerationInProgress = false;
    event.target.disabled = false;
  }

  async sendForReceipt(oDataSource: any, template: any, title: any, receipt: any) {
    const oPdfSetting = template.aSettings.find((el: any) => el.sParameter === 'pdfMethod');
    if (oPdfSetting && oPdfSetting.value === 'Javascript') {
      await this.pdfService.createPdf(JSON.stringify(template), oDataSource, oDataSource.sNumber, true, null, this.iBusinessId, null);
    } else {
      this.receiptService.exportToPdf({
        oDataSource: oDataSource,
        pdfTitle: title,
        templateData: template,
        printSettings: this.printSettings,
        printActionSettings: this.printActionSettings,
        eSituation: 'is_created'
      });
    }

    if (receipt == 'customerReceipt') {
      this.bCustomerReceipt = false;
    } else if (receipt == 'downloadCustomerReceipt') {
      this.bDownloadCustomerReceipt = false;
    } else if (receipt == 'downloadReceipt') {
      this.bDownloadReceipt = false;
    }
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

  copyToClipboard(activity: any) {
    this.clipboard.copy(activity.sNumber);
    activity.bActivityNumberCopied = true;
    setTimeout(() => {
      activity.bActivityNumberCopied = false;
    }, 3000);
  }

  /* Update customer in [T, A, AI] */
  updateCurrentCustomer(oData: any) {
    const oBody = {
      oCustomer: oData.oCustomer,
      iBusinessId: this.iBusinessId,
      iActivityItemId: this.activityItems[0]._id
    }
    this.apiService.postNew('cashregistry', '/api/v1/transaction/update-customer', oBody).subscribe((result: any) => {
      console.log('Customer Updated: ', result, oBody?.oCustomer);
      this.oCurrentCustomer = oBody?.oCustomer;
      this.toastService.show({ type: "success", text: this.translation['SUCCESSFULLY_UPDATED'] });
    }, (error) => {
      console.log('update customer error: ', error);
      this.toastService.show({ type: "warning", text: `Something went wrong` });
    });
  }

  selectCustomer() {
    this.dialogService.openModal(CustomerDialogComponent, { cssClass: 'modal-xl' })
      .instance.close.subscribe((data) => {
        console.log('after selecting customer: ', data);
        if (!data?.customer?._id || !this.activityItems?.length || !this.activityItems[0]?._id) return;
        this.updateCurrentCustomer({ oCustomer: data?.customer });
      }, (error) => {
        console.log('selectCustomer error: ', error);
        this.toastService.show({ type: "warning", text: `Something went wrong` });
      })
  }

  /* Here the current customer means from the Transaction/Activity/Activity-Items */
  openCurrentCustomer(oCurrentCustomer: any) {
    console.log('openCurrentCustomer: ', oCurrentCustomer);
    const bIsCounterCustomer = (oCurrentCustomer?.sEmail === "balieklant@prismanote.com" || !oCurrentCustomer?._id) ? true : false /* If counter customer used then must needs to change */
    this.dialogService.openModal(CustomerDetailsComponent,
      {
        cssClass: bIsCounterCustomer == true ? "modal-lg" : "modal-xl position-fixed start-0 end-0",
        context: {
          customerData: oCurrentCustomer,
          mode: 'details',
          editProfile: true,
          bIsCurrentCustomer: true, /* We are only going to change in the A/T/AI */
          bIsCounterCustomer: bIsCounterCustomer
        }
      }).instance.close.subscribe(result => {
        console.log('result: ', result);
        if (result?.bIsSelectingCustomer) this.selectCustomer();
        else if (result?.bShouldUpdateCustomer) this.updateCurrentCustomer({ oCustomer: result?.oCustomer });
      }, (error) => {
        console.log("Error in customer: ", error);
        this.toastService.show({ type: "warning", text: `Something went wrong` });
      });
  }
}
