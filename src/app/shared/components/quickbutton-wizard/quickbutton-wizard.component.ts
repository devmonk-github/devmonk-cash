import { Component, Input, OnInit, ViewContainerRef } from '@angular/core';
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

 /**
  * TODO:
  * 2. Create new product functionality
  *   a. Check if internal supllier exists
  *   b. Check if article group exists -> repairs, orders, giftcards, stocks, services and others
  *       I. By selecting stock, services or other default article group will return SERVER ERROR 500
  *       -> "businessarticlegroups validation failed: eDefaultArticleGroup: `other` is not a valid enum value for path `eDefaultArticleGroup`."
  *   DONE! c. Calculate margin function
  *   DONE! d. Fetch business taxes
  *   e. Backend call to create product
  * 5. Create quick button backend call.
  * 
  * DONE! 1. Disable buttons onstep 1 -> On back RESET everything.
  * DONE! 3. After selection or creation, needs to pass product information to STEP 3
  *   a. Select product function
  * DONE! 4. Show article number inside STEP 3
  * DONE! 6. Clear/reset everything at the end (or add a button to clear/reset wizard).
  */

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
    { key: 'GIFTCARD', value: 'giftcard' },
    { key: 'STOCK', value: 'stock' },
    { key: 'SERVICES', value: 'service' },
    { key: 'OTHER', value: 'other' }
  ];

  oNewProduct: any = {
    name: '',
    articleGroup: 'stock',
    purchasePrice: 0,
    sellingPrice: 0,
    margin: 1,
    tax: 21
  };

  selectedProduct: any = {
    name: '',
    sellingPrice: '',
    oKeyboardShortcut: {
      sKey1: '',
      sKey2: ''
    }
  };
  
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
  currentLanguage: any;

  constructor(
    private viewContainer: ViewContainerRef,
    private apiService: ApiService,
    private toastService: ToastService,
    private translateService: TranslateService,
    public tillService: TillService,
    private createArticleGroupService: CreateArticleGroupService
  ) { 
    const _injector = this.viewContainer.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit(): void {
    this.iBusinessId = localStorage.getItem('currentBusiness');
    this.currentLanguage = localStorage.getItem('language') || 'en';
    this.iLocationId = localStorage.getItem('currentLocation');
    this.taxes = this.tillService.taxes;
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
        this.oNewProduct.name =  this.searchKeyword;
        break;
      default:
        break;
    }
  }

  clearAll(){
    this.searchKeyword = '';
    this.bSearchingProduct = false;
    this.oNewProduct = {
      name: '',
      articleGroup: 'stock',
      purchasePrice: 0,
      sellingPrice: 0,
      margin: 1,
      vat: 21
    };
    this.selectedProduct = {
      name: '',
      sellingPrice: '',
      oKeyboardShortcut: {
        sKey1: '',
        sKey2: ''
      }
    };
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

  // Function to select product
  onSelectProduct(product: any) {
      this.selectedProduct._id = product._id;
      this.selectedProduct.sNameOriginal = product.oName ? product.oName[this.currentLanguage] : 'No name';
      if (product.oName[this.currentLanguage]?.length >= 20) {
        this.selectedProduct.sName = product.oName[this.currentLanguage].slice(0, 20); // Ritaglia la stringa ai primi 20 caratteri
      }else{
        this.selectedProduct.sName = product.oName ? product.oName[this.currentLanguage] : 'No name';
      }
      this.selectedProduct.sArticleNumber = product.sArticleNumber;
      this.selectedProduct.sNewArticleNumber = product.sArticleNumber?.split('*/*')[0];
      this.selectedProduct.iBusinessProductId = product._id;
      this.selectedProduct.aImage = product.aImage;
      //console.log('aLocation ', product?.aLocation);
      if (product?.aLocation?.length) {
        this.selectedProduct.sellingPrice = product?.aLocation.filter((location: any) => location._id === this.iLocationId)[0]?.nPriceIncludesVat || 0;
      }
      this.shopProducts = null;
  }

  // Function for calculate storage factor or margin
  updatePricesAndMargin(object: any) {
    switch(object){
      case 'purchasePrice':
        this.oNewProduct.purchasePrice = this.oNewProduct.sellingPrice / this.oNewProduct.margin;
        break;
      case 'margin':
        let margin = this.oNewProduct.sellingPrice / this.oNewProduct.purchasePrice;
        this.oNewProduct.margin = Number(margin.toFixed(2));
        break;
      default: 
        break;
    }
  }

  //Function for Business product creation
  async createBusinessProduct(){
    //TODO: create Business Product 
    console.log('I will create a product with this info', this.oNewProduct);

    //STEP 1: Check if article group exist
    let result: any;
    result = await this.createArticleGroupService.checkArticleGroups(this.oNewProduct.articleGroup).toPromise();
    console.log(result);
    let iArticleGroupId = '';
    if (result?.data?.length && result?.data[0]?.result?.length) {
      iArticleGroupId = result?.data[0]?.result[0]?._id;
    }else{
      
    }

    //STEP 2: Check if supplier exist

    //Create and go to step 3
    this.moveToStep(3);
  }

  //Function for Quick button creation
  createQuickButton(){
    //TODO: create quick button
    console.log('I will create a quick button with this info',this.selectedProduct);
  }

  //Function to close modal
  close(action: boolean) {
    this.dialogRef.close.emit({ action: action })
  }
}
