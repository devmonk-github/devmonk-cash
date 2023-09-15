import { Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren, ViewContainerRef } from '@angular/core';
import { DialogComponent } from '../../service/dialog';
import { ApiService } from '../../service/api.service';
import { ToastService } from '../toast';
import { TranslateService } from '@ngx-translate/core';
import { TillService } from '../../service/till.service';
import { StepperComponent } from '../../_layout/components/common';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { CreateArticleGroupService } from '../../service/create-article-groups.service';

@Component({
  selector: 'app-quickbutton-wizard',
  templateUrl: './quickbutton-wizard.component.html',
  styleUrls: ['./quickbutton-wizard.component.sass']
})


export class QuickbuttonWizardComponent implements OnInit {
  dialogRef: DialogComponent;
  stepperInstance: any;
  searchKeyword: any;
  shopProducts: any = [];
  taxes: any;

  oShopProductsPaginationConfig: any = {
    id: 'paginate_shop_products',
    itemsPerPage: 6,
    currentPage: 1,
    totalItems: 0
  };
  
  bSearchingProduct: boolean;
  iBusinessId: any;
  language: any;
  aProjection: any;
  bProductSelected: boolean;
  iLocationId: any;
  bFromBarcode: boolean;
  faTimes = faTimes;
  stepperIndex: any = 1;
  showLoader: boolean = false;

  aArticleGroupType: Array<any> = [
    { key: 'REPAIRS', value: 'repair' },
    { key: 'ORDERS', value: 'order' },
    // { key: 'GIFTCARD', value: 'giftcard' },
    { key: 'STOCK', value: 'stock' },
    // { key: 'SERVICES', value: 'service' },
    { key: 'OTHER', value: 'other' }
  ];

  selectedArticleGroup: any = 'stock';

  oNewProduct: any = {
    sName: '',
    iArticleGroupId: '',
    nPurchasePrice: 0,
    nSellingPrice: 0,
    nMargin: 1,
    nVat: 21
  };

  oStaticData: any = {};

  selectedProduct: any = {
    sName: '',
    nPrice: '',
    oKeyboardShortcut: {
      sKey1: '',
      sKey2: ''
    }
  };
  
  limit: number = 20;

  aFunctionKeys:any = [
    { title: '' },
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
  currentLanguage: any;
  iEmployeeId: any;
  @Output() triggerEvent: EventEmitter<any> = new EventEmitter();
  @ViewChildren('searchField') searchField!: QueryList<ElementRef>;
  translate: any;
  product: any;
  bNewArticlegroup: boolean = false;
  sNewArticlegroupName: string =  '';
  
  constructor(
    private viewContainer: ViewContainerRef,
    private apiService: ApiService,
    private toastService: ToastService,
    private translateService: TranslateService,
    public tillService: TillService,
    private createArticleGroupService: CreateArticleGroupService,
  ) { 
    const _injector = this.viewContainer.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  async ngOnInit(): Promise<void> {
    this.iBusinessId = localStorage.getItem('currentBusiness');
    this.currentLanguage = localStorage.getItem('language') || 'en';
    this.iLocationId = localStorage.getItem('currentLocation');
    this.taxes = this.tillService.taxes;

    const translate=['PRODUCT_ADDED_SUCCESSFULLY' , 'GROUPS_UPDATE_SUCCESSFULLY'];
    this.translateService.get(translate).subscribe((res:any)=>{
        this.translate = res;
    })
  }
  
  ngAfterViewInit(): void {
    this.searchField.first.nativeElement.focus();
  }

  ngAfterContentInit(): void {
    StepperComponent.bootstrap();
    setTimeout(() => {
      this.stepperInstance = StepperComponent.getInstance(this.stepperInstance?.element.nativeElement);
    }, 200);
  }
  
  // Function for STEPPER
  public moveToStep(step: any, product?: any) {
    this.stepperIndex = step;
    
    switch(step){
      case 1:
        this.clearAll();
        break;
      case 2:
        this.oNewProduct.sName =  this.searchKeyword;
        break;
      case 3: 
        this.onSelectProduct(product);
        break;
      default:
        break;
    }
  }

  getArticleGroups(){
    const data = {
      iBusinessId: this.iBusinessId,
    };
    this.apiService.postNew('core', '/api/v1/business/article-group/list', data).subscribe((result: any) => {
      if (result?.data?.length && result?.data[0]?.result?.length)
        this.oStaticData.articleGroupsList = result.data[0].result;
        this.oStaticData.articleGroupsList.forEach((el: any, index: any) => {
          el.sArticleGroupName = (el?.oName) ? el?.oName[this.language] || el?.oName['en'] || '' : '';
        })
    });

    
  }

  clearAll(){
    this.bNewArticlegroup = false;
    this.searchKeyword = '';
    this.bSearchingProduct = false;
    this.oNewProduct = {
      sName: '',
      iArticleGroupId: '',
      nPurchasePrice: 0,
      nSellingPrice: 0,
      nMargin: 1,
      nVat: 21
    };
    this.selectedProduct = {
      name: '',
      nSellingPrice: '',
      oKeyboardShortcut: {
        sKey1: '',
        sKey2: ''
      }
    };
    this.selectedArticleGroup = 'stock';
    this.shopProducts = [];
  }

  // Function for pagination
  pageChanged(page: any, isFrom: string = 'shopProducts', searchValue: string) {
    if (isFrom == 'shopProducts') {
      this.oShopProductsPaginationConfig.currentPage = page;
      this.listShopProducts(searchValue);
    }
  }

  //Function for product search
  search() {
    if(this.searchKeyword?.length > 2){
      this.oShopProductsPaginationConfig.currentPage = 1;
      this.shopProducts = [];
      this.listShopProducts(this.searchKeyword);
    }
  }
  
  //Function to fetch product based on search value
  listShopProducts(searchValue: string | undefined) {
    this.shopProducts = [];
    this.bSearchingProduct = true;
    let data = {
      iBusinessId: this.iBusinessId,
      skip: (this.oShopProductsPaginationConfig.currentPage - 1) * this.oShopProductsPaginationConfig.itemsPerPage,
      limit: this.oShopProductsPaginationConfig.itemsPerPage,
      sortBy: `oName.${this.language}`,
      sortOrder: 'asc',
      searchValue: searchValue,
      aProjection: this.aProjection,
      oFilterBy: {
        oStatic: {},
        oDynamic: {}
      },
    }

    this.bProductSelected = false;
    this.apiService.postNew('core', '/api/v1/business/products/list', data).subscribe((result: any) => {
      this.bSearchingProduct = false;
      if (result?.data?.length) {
        const response = result.data[0];
        this.shopProducts = response.result;
        this.oShopProductsPaginationConfig.totalItems = response.count.totalData;
        this.shopProducts.forEach((el: any) => el.oCurrentLocation = el?.aLocation?.find((oLoc: any) => oLoc?._id?.toString() === this.iLocationId));
        // console.log('shop products are loaded')
        this.shopProducts.forEach((product: any) => {
          if (product?.sArticleNumber) {
            product.sNewArticleNumber = product.sArticleNumber.split('*/*')[0];
          }
        });
      }
    }, (error) => {
      this.bSearchingProduct = false;
    });
  }

  // Function for selecting a product
  onSelectProduct(product: any) {
      this.product = product;
      this.selectedProduct._id = product._id;
      this.selectedProduct.sNameOriginal = product.oName ? product.oName[this.currentLanguage] : 'No name';
      if (product.oName[this.currentLanguage]?.length >= 20) {
        this.selectedProduct.sName = product.oName[this.currentLanguage].slice(0, 20);
      }else{
        this.selectedProduct.sName = product.oName ? product.oName[this.currentLanguage] : 'No name';
      }
      this.selectedProduct.sArticleNumber = product.sArticleNumber;
      this.selectedProduct.sNewArticleNumber = product.sArticleNumber?.split('*/*')[0];
      this.selectedProduct.iBusinessProductId = product._id;
      this.selectedProduct.aImage = product.aImage;
      //console.log('aLocation ', product?.aLocation);
      if (product?.aLocation?.length) {
        this.selectedProduct.nPrice = product?.aLocation.filter((location: any) => location._id === this.iLocationId)[0]?.nPriceIncludesVat || 0;
      }
      this.shopProducts = null;
  }

  // Function for calculating storage factor or margin
  updatePricesAndMargin(object: any) {
    switch(object){
      case 'purchasePrice':
        this.oNewProduct.nPurchasePrice = this.oNewProduct.nSellingPrice / this.oNewProduct.nMargin;
        break;
      case 'margin':
        let margin = this.oNewProduct.nSellingPrice / this.oNewProduct.nPurchasePrice;
        this.oNewProduct.nMargin = Number(margin.toFixed(2));
        break;
      default: 
        break;
    }
  }


  // Function for creating business product
  async createBusinessProduct(){
 
    //console.log('I will create a product with this info', this.oNewProduct);
    
    //STEP 1: CHECK SUPPLIER
    let supplier: any = await this.createArticleGroupService.fetchInternalBusinessPartner(this.iBusinessId);

    //STEP 2: CHECK ARTICLE GROUP
    let result: any;
    let rand = Math.floor(Math.random() * 900);
    if(this.selectedArticleGroup == 'stock' || this.selectedArticleGroup == 'other'){

      if(this.oNewProduct.iArticleGroupId == '' && this.bNewArticlegroup){
        console.log('im here', this.oNewProduct.iArticleGroupId, this.sNewArticlegroupName)
        let data = {
          name: this.sNewArticlegroupName,
          iBusinessId: this.iBusinessId,
          nMargin: 0,
          aBusinessPartner: [{
              iBusinessPartnerId: supplier._id,
              nMargin: supplier.nPurchaseMargin || 0
            }]
        };
        //console.log(data)
        try {
          result  = await (await this.createArticleGroupService.createNewArticleGroup(data)).toPromise();
          this.oNewProduct.iArticleGroupId = result?.data?._id;
        }catch (error) {
          this.toastService.show({type: 'danger', text:'DUPLICATED_ARTICLE_GROUP_NAME' })
        }
      }
      
    }else{
      let iArticleGroupId = '';
      result = await this.createArticleGroupService.checkArticleGroups(this.selectedArticleGroup).toPromise();
      if (result?.data) {
        iArticleGroupId = result?.data._id;
      }
      this.oNewProduct.iArticleGroupId = iArticleGroupId;
    }
    
    if(this.oNewProduct.iArticleGroupId && this.oNewProduct.iArticleGroupId != ''){
      console.log('im here', this.oNewProduct.iArticleGroupId, this.sNewArticlegroupName)
      //STEP 3: Create Product and go to step 3 with data
      this.oNewProduct.iBusinessId = this.iBusinessId;
      this.oNewProduct.oName = {
          nl: this.oNewProduct.sName,
          en: this.oNewProduct.sName,
          de: this.oNewProduct.sName,
          fr: this.oNewProduct.sName,
          es: this.oNewProduct.sName
      };
      this.oNewProduct.iSupplierId = supplier.iSupplierId;
      this.oNewProduct.iBusinessPartnerId = supplier._id;
      this.oNewProduct.sBusinessPartnerName = supplier.sName;
      this.oNewProduct.iEmployeeId = this.iEmployeeId?.userId;
      this.oNewProduct.sFunctionName = 'create-business-product';
      this.oNewProduct.sProductNumber = 'QB-' + this.oNewProduct.sName?.toUpperCase().slice(0, 5) + rand;
      this.oNewProduct.sSelectedLanguage = this.currentLanguage || 'en';
      this.oNewProduct.aLocation = {
        _id: this.iLocationId,
        "nStock" : 0,
        "nPriceIncludesVat" : this.oNewProduct.nSellingPrice,
        "nMinStock" : 0,
        "nVatRate" : this.oNewProduct.nVat
      }
      this.oNewProduct.nHighestPrice = this.oNewProduct.nSellingPrice;
      this.oNewProduct.nLowestPrice = this.oNewProduct.nSellingPrice;
      this.showLoader = true;
      this.apiService.postNew('core', '/api/v1/business/products', this.oNewProduct).subscribe((result: any) => {
        if (result && result.message == 'success') {
            this.toastService.show({type: 'success', text: this.translate['PRODUCT_ADDED_SUCCESSFULLY']});
            this.showLoader = false;
            this.moveToStep(3, result.data);
        }
      }, error => { 
        this.close(true);
        this.toastService.show({type: 'danger', text: error?.error?.message || 'Error while adding new product' });
      });
    }else{
      this.toastService.show({type: 'danger', text: 'PLEASE_ADD_ARTICLE_GROUP' });
    }
  }

  // Function for creating quick button
  async createQuickButton(){
    this.showLoader = true;

    if(this.selectedProduct.oKeyboardShortcut.sKey1.startsWith('F') || this.selectedProduct.oKeyboardShortcut.sKey1 == '' ){
      this.selectedProduct.oKeyboardShortcut.sKey2 = '';
    }

    let data = {
      iBusinessId: this.iBusinessId,
      iLocationId: this.iLocationId,
      oQuickButton: this.selectedProduct,
    };

    if (!data.iLocationId) {
      this.toastService.show({ type: 'warning', text: this.translateService.instant('PLEASE_SELECT_LOCATION')`Please select a location` });
      return;
    }

    if(this.selectedProduct.nPrice != this.product.nPrice){
      
      //Update business product selling price
      let newPriceIncVat = this.product?.aLocation.filter((location: any) => location._id === this.iLocationId)[0]?.nPriceIncludesVat;
      this.product?.aLocation.map((location: any) => {
        if(location._id === this.iLocationId)
        location.nPriceIncludesVat =  Number(this.selectedProduct.nPrice);
      }); 
      this.product.sFunctionName = 'update-business-product';
      await this.apiService.putNew('core', `/api/v1/business/products/${this.product._id}?iBusinessId=${this.iBusinessId}`, this.product).toPromise();

      //Update purchase price
      let margin = Number((newPriceIncVat / this.product.nPurchasePrice).toFixed(2));
      let newPurchasePrice = this.selectedProduct.nPrice / margin;
     
      let data = {
        iLocationId: this.iLocationId,
        nPurchasePrice: newPurchasePrice
      }
      await this.apiService.putNew('core', `/api/v1/business/products/purchase-price/${this.product._id}?iBusinessId=${this.iBusinessId}`, data).toPromise();
    }

    let _result: any, msg:string = '';    
    _result = await this.apiService.postNew('cashregistry', '/api/v1/quick-buttons/create', data).toPromise();
    msg = this.translateService.instant('NEW_QUICK_BUTTON_ADDED')
   
    this.showLoader = false;

    if (_result.message == 'success') {
      this.close(true);
      this.toastService.show({ type: 'success', text: msg }); //`New Quick Button added successfully`
    } else {
      this.toastService.show({ type: 'success', text: this.translateService.instant('AN_ERROR_OCCURED') });
    }
  }

  //Function to close modal
  close(action: boolean) {
    this.dialogRef.close.emit({ action: action })
  }
}
