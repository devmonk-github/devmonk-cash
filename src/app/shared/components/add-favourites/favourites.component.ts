import { Component, HostListener, OnInit, ViewContainerRef } from '@angular/core';
import { DialogComponent } from '../../service/dialog';
import { ApiService } from '../../service/api.service';
import { ToastService } from '../toast';
import { TranslateService } from '@ngx-translate/core';
import { TillService } from '../../service/till.service';

@Component({
  selector: 'app-favourites',
  templateUrl: './favourites.component.html',
  styleUrls: ['./favourites.component.sass']
})

 /**
  * TODO:
  * 1. Disable buttons on footer if no product is selected
  * 2. Create new product functionality
  *   a. Check if internal supllier exists
  *   b. Check if article group exists -> repairs, orders, giftcards, stocks, services and others
  *   c. Calculate margin function
  *   d. Fetch business taxes
  *   e. Backend call to create product
  * 3. After selection or creation, needs to pass product information to STEP 3
  *   a. Select product function
  * 4. Show article number inside STEP 3
  * 5. Create quick button backend call
  * 6. Clear/reset everything at the end (or add a button to clear/reset wizard).
  */
 
export class AddFavouritesComponent implements OnInit {

  dialogRef: DialogComponent;
  searchKeyword: any;
  oActivityItem:any;
  shopProducts: any;
  mode: string = '';
  newSelectedProduct: any = {
    oKeyboardShortcut: {
      sKey1: '',
      sKey2: ''
    }
  };
  
  searching: boolean = false;
  creating: boolean = false;
  customMethod: any = {
    sName: '',
    bStockReduction: false,
    bInvoice: false,
    bAssignSavingPointsLastPayment: true,
    sLedgerNumber: ''
  }
  aProjection: Array<any> = [
    'oName',
    'sEan',
    'nVatRate',
    'sProductNumber',
    'nPriceIncludesVat',
    'bDiscountOnPercentage',
    'nDiscount',
    'sLabelDescription',
    'aLocation',
    'aImage',
    'aProperty',
    'sArticleNumber',
    'iArticleGroupId',
    'iBusinessPartnerId',
    'iBusinessBrandId',
  ];
  iBusinessId:any = localStorage.getItem('currentBusiness');
  iLocationId: any = localStorage.getItem('currentLocation');
  currentLanguage = localStorage.getItem('language') || 'en';
  
  button?:any;
  bValid:boolean = false;
  limit: number = 20;

  
  aFunctionKeys:any = [
    { title: 'Control' },
    { title: 'Alt' },
    { title: 'F1' },
    { title: 'F2' },
    { title: 'F3' },
    { title: 'F4' },
    { title: 'F5' },
    { title: 'F6' },
    { title: 'F7' },
    { title: 'F8' },
    { title: 'F9' },
    { title: 'F10' },
    { title: 'F11' },
    { title: 'F12' },
  ]

  constructor(
    private viewContainer: ViewContainerRef,
    private apiService: ApiService,
    private toastService: ToastService,
    private translateService: TranslateService,
    private tillService: TillService

  ) {
    const _injector = this.viewContainer.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit(): void {

    if(this.mode==='edit') {
      this.newSelectedProduct.nPrice = this.button?.nPrice || 0;
      this.newSelectedProduct.sName = this.button?.sName || 'No name';
      this.newSelectedProduct._id = this.button?._id;
      if (this.button?.oKeyboardShortcut) this.newSelectedProduct.oKeyboardShortcut = this.button?.oKeyboardShortcut;
      this.validate();
    }
  } 

  async search() {
    this.shopProducts = [];
    let data = {
      iBusinessId: this.iBusinessId,
      limit: 10,
      searchValue: this.searchKeyword,
      aProjection: this.aProjection,
      sortBy: `oName.${this.currentLanguage}`,
      sortOrder: 'asc',
      oFilterBy: {
        oStatic: {},
        oDynamic: {}
      }
    }
    this.searching = true;
    const shopResult:any = await this.apiService.postNew('core', '/api/v1/business/products/list', data).toPromise();
    if (shopResult && shopResult.data && shopResult.data.length) {
      this.shopProducts = shopResult.data[0].result;
    }
    this.searching = false;
  }
  

  onSelectProduct(product: any, isFrom?: string, isFor?: string) {
    if (this.mode == 'create' || this.mode == 'assign') {
      this.newSelectedProduct._id = product._id;
      this.newSelectedProduct.sName = product.oName ? product.oName[this.currentLanguage] : 'No name';
      this.newSelectedProduct.iBusinessProductId = product._id;
      this.newSelectedProduct.aImage = product.aImage;
      if (product?.aLocation?.length) {
        this.newSelectedProduct.nPrice = product?.aLocation.filter((location: any) => location._id === this.iLocationId)[0]?.nPriceIncludesVat || 0
      }
      this.shopProducts = null;
      this.validate(); 
    }else{
      this.shopProducts = null;
    }
  }

  assignProduct(){
    this.oActivityItem.iBusinessId = this.iBusinessId;
    this.oActivityItem.sProductName = this.newSelectedProduct.sName;
    this.oActivityItem.aImage = this.newSelectedProduct.aImage
    this.oActivityItem.iBusinessProductId = this.newSelectedProduct.iBusinessProductId
    
    const nPrice = this.newSelectedProduct.nPrice;
    this.oActivityItem.nPriceIncVat = nPrice
    this.oActivityItem.nTotalAmount = nPrice * this.oActivityItem.nQuantity;
    const nDiscountAmount = +((this.oActivityItem.bDiscountOnPercentage ? this.tillService.getPercentOf(nPrice, this.oActivityItem?.nDiscount || 0) : this.oActivityItem.nDiscount).toFixed(2));
    this.oActivityItem.nPaidAmount += (nDiscountAmount * this.oActivityItem.nQuantity);
    
    this.apiService.putNew('cashregistry', '/api/v1/activities/items/' + this.oActivityItem._id, this.oActivityItem)
      .subscribe((result: any) => {
        if(result.message == 'success'){
          this.apiService.activityItemDetails.next(this.oActivityItem);
          this.toastService.show({ type: "success", text: this.translateService.instant('SUCCESSFULLY_UPDATED') });
          this.close(this.oActivityItem);
        }
        else
        {
          this.toastService.show({type:"warning" , text:result.message});
        }
      }, (error) => {
        console.log('error: ', error);
        this.toastService.show({type:"warning" , text:error.message});
      })


  }

  async create(event: any) {
    event.target.disabled = true;
    this.creating = true;

    let data = {
      iBusinessId: this.iBusinessId,
      iLocationId: this.iLocationId,
      oQuickButton: this.newSelectedProduct,
    };

    if (!data.iLocationId) {
      this.toastService.show({ type: 'warning', text: this.translateService.instant('PLEASE_SELECT_LOCATION')`Please select a location` });
      return;
    }
    let _result: any, msg:string = '';
    if (this.mode === 'create') {
      _result = await this.apiService.postNew('cashregistry', '/api/v1/quick-buttons/create', data).toPromise();
      msg = this.translateService.instant('NEW_QUICK_BUTTON_ADDED')
    } else {
      _result = await this.apiService.putNew('cashregistry', `/api/v1/quick-buttons/${this.newSelectedProduct._id}`, data).toPromise();
      msg = this.translateService.instant('QUICK_BUTTON_UPDATED')
    }
    event.target.disabled = false;
    this.creating = false;

    if (_result.message == 'success') {
      this.close(true);
      this.toastService.show({ type: 'success', text: msg }); //`New Quick Button added successfully`
    } else {
      this.toastService.show({ type: 'success', text: this.translateService.instant('AN_ERROR_OCCURED') });
    }
  }

  validate() {
    // Disable -> no product is selected, name is more than the limit (quick buttons case) or if the length is 0.
    
    /*Create new quick button validation (to create qb, products needs to be created/selected first)*/
    if(this.mode != 'assign' && (!this.newSelectedProduct._id || this.newSelectedProduct.sName.length > this.limit || this.newSelectedProduct.sName.length == 0)){
      this.bValid = false;
    }else if(this.mode === 'assign' && (!this.newSelectedProduct._id || this.newSelectedProduct.sName.length == 0)){
      /*Assign product to existing AI/A validation*/
      this.bValid = false;
    }else{
      this.bValid = true;
    }
  }

  close(action: boolean) {
    this.dialogRef.close.emit({ action: action })
  }
}
