import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { DialogComponent } from '../../service/dialog';
import { ApiService } from '../../service/api.service';
import { ToastService } from '../toast';
import { TranslateService } from '@ngx-translate/core';
import { TillService } from '../../service/till.service';
import { StepperComponent } from '../../_layout/components/common';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

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
  public taxOptions: Array<any> = [
    {
      sName: "Standaard",
      nRate: 21
    },
    {
      sName: "Verlaagd",
      nRate: 9
    },
    {
      sName: "Super verlaagd",
      nRate: 0
    }
  ];

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
    articleGroup: '',
    purchasePrice: '',
    sellingPrice: '',
    margin: '',
    vat: ''
  };

  selectedProduct: any = {
    name: '',
    priec: '',
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
    this.iBusinessId = localStorage.getItem('currentBusiness');
  }

  ngAfterContentInit(): void {
    StepperComponent.bootstrap();
    setTimeout(() => {
      this.stepperInstance = StepperComponent.getInstance(this.stepperInstance?.element.nativeElement);
    }, 200);
  }
  
  // Function for go to next step
  public moveToStep(step: any) {
    this.stepperIndex = step;

   if(this.stepperIndex == 2){
      this.oNewProduct =  this.searchKeyword;
    }else if(this.stepperIndex == 3){
      this.showLoader = true;
    }
  }

  pageChanged(page: any, isFrom: string = 'shopProducts', searchValue: string) {
    if (isFrom == 'shopProducts') {
      this.oShopProductsPaginationConfig.currentPage = page;
      this.listShopProducts(searchValue);
    }
  }

  search() {
    if(this.searchKeyword?.length > 2){
      this.oShopProductsPaginationConfig.currentPage = 1;
      this.shopProducts = [];
      this.listShopProducts(this.searchKeyword);
    }
  }
  
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
        if (this.bFromBarcode && this.shopProducts.length == 1) {
          this.bFromBarcode = false;
          this.onSelectProduct(this.shopProducts[0], 'business', 'shopProducts');
        }
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

  onSelectProduct(arg0: any, arg1: string, arg2: string) {
    throw new Error('Method not implemented.');
  }

  close(action: boolean) {
    this.dialogRef.close.emit({ action: action })
  }
}
