import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { ApiService, ToastService } from 'src/app/shared/service';
import { DrawerComponent } from 'src/app/_layout/components/common';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';


@Component({
  selector: 'app-supplier-product-slider',
  templateUrl: './supplier-product-slider.component.html',
  styleUrls: ['./supplier-product-slider.component.scss'],
})

export class SupplierProductSliderComponent implements OnInit {
  @Input() $data!: Observable<any>;
  subscription!: Subscription;
  productData: any = {};
  currentTab = 1;
  stock: number = 0;

  tabs = [
    { index: 1, name: 'Altern lev.', isDisable: false },
    { index: 5, name: 'Altern.', isDisable: false },
    { index: 0, name: 'Lev.combi', isDisable: false },
    { index: 3, name: 'Meest verk', isDisable: false },
    { index: 4, name: '/ingek(2wk)', isDisable: false },
    { index: 2, name: 'Vari', isDisable: false },
  ];
  buyNowButtonText: 'SET_AS_MIN_STOCK_PRODUCT' | 'Re-order' | 'Buy Now' = 'Buy Now';
  iBusinessId: any = '';
  iLocationId: any = '';
  iSupplierId: any = '';
  ComparableProducts: any[] = [];
  aTradeProducts: any[] = [];
  bCanRightSliderTurnOnRetailer: any;
  bCanRightSliderTurnOnSupplier: any;
  bIsSlideTurnOff: boolean = false;
  AvailableSizesProducts: {
    retailerBusinessProducts: any[]
    supplierBusinessProducts: any[]
  } = {
      retailerBusinessProducts: [],
      supplierBusinessProducts: [],
    }
  ComparableProductsLoading = false;
  bIsTradeProductLoading = false;
  AvailableSizesProductsLoading = false;
  ProductsLoading = true;
  showInputStock: boolean = false;
  minStockSubject : Subject<string> = new Subject<string>();

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.iSupplierId = activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    this.subscription = this.$data?.subscribe({
      next: async (data: any) => {
        DrawerComponent.reinitialization();
        this.reset();
        if (Object.values(data).length) {
          if (!data?.oCurrentLocation) data.oCurrentLocation = {};
          this.productData = data;
          const response :any= await this.getSupplierDetails(data.iSupplierId)
          this.productData.bCanRightSliderTurnOnSupplier = response.bCanRightSliderTurnOn;
          this.bCanRightSliderTurnOnRetailer = this.productData?.bCanRightSliderTurnOnRetailer;
          this.bCanRightSliderTurnOnSupplier = this.productData?.bCanRightSliderTurnOnSupplier;
          this.bIsSlideTurnOff = !this.bCanRightSliderTurnOnRetailer && !this.bCanRightSliderTurnOnSupplier ? true : false
          // this.bIsSlideTurnOff = this.productData?.bCanRightSliderTurnOn;
          for (const oTab of this.tabs) {
            if (oTab?.name == 'Comparable' || oTab?.name == 'Most sold' || oTab?.name == '/ purchased') oTab.isDisable = this.bIsSlideTurnOff;
          }
          await this.getProductData(data?._id.toString())

        }
      },
      error: (err: any) => { },
    });
  }

  reset() {
    this.iBusinessId = localStorage.getItem('currentBusiness');
    this.iLocationId = localStorage.getItem('currentLocation');
    this.ComparableProducts = [];
    this.ComparableProductsLoading = false;
    this.bIsTradeProductLoading = false;
    this.aTradeProducts = [];
    this.currentTab = 0;
    this.stock = 0;
    this.productData = {};
  }

  viewOnSupplierWebShop(url:any){
    window.open(url , '_blank');
    let body = {
      'iBusinessId' : this.iBusinessId.toString() , 
      'iSupplierId' : this.productData.iSupplierId ,
      'iProductId': this.productData.iProductId ,
      'iLocationId':this.iLocationId ,
      'sB2bUrl' : url

    }

    this.apiService.postNew('core' , '/api/v1/business/products/viewSupplierOnWebshop' , body).subscribe((res:any)=>{

    })
  }

  findCurrentStock(): void {
    const currentLocationId = localStorage.getItem('currentLocation') ?? '';
    this.productData?.aLocation?.map((l: any) => {
      if (currentLocationId) {
        if (l._id.toString() === currentLocationId.toString()) {
          this.stock = l?.nStock ?? 0;
          this.productData.oCurrentLocation = l;
          this.setBuyNowButtonText();
        }
      }
    });
  }

  setBuyNowButtonText() {
    this.buyNowButtonText = 'Buy Now';
    if (this.stock >= 1) this.buyNowButtonText = 'SET_AS_MIN_STOCK_PRODUCT';
    else if (this.stock === 0) this.buyNowButtonText = 'SET_AS_MIN_STOCK_PRODUCT';
    else if (this.productData?.advised) this.buyNowButtonText = 'SET_AS_MIN_STOCK_PRODUCT';
  }

  onBuyNowClick(event:any) {
    this.showInputStock = true;
    this.productData.oCurrentLocation.nMinStock += 1;
    this.minStockSubject.next(event);
  }

  async onSelectCompareProduct(productId: string) {
    this.ComparableProductsLoading = true;
    await this.getProductData(productId.toString())
    if (this.currentTab === 1) this.getComparableProducts();
    else if (this.currentTab === 2) this.getAvailableSizesProducts();
    this.ComparableProductsLoading = false
  }

  async onSelectAvailableSizeProduct(productId: string) {
    this.ComparableProductsLoading = true;
    await this.getProductData(productId.toString())
    if (this.currentTab === 1) this.getComparableProducts();
    else if (this.currentTab === 2) this.getAvailableSizesProducts();
    this.ComparableProductsLoading = false
  }

  async onSelectTradeProduct(productId: string) {
    this.bIsTradeProductLoading = true;
    await this.getProductData(productId.toString())
    if (this.currentTab === 3 || this.currentTab === 4) this.getTradeProducts();
    this.bIsTradeProductLoading = false;
  }

  onTabChange(index: any) {
    if (this.currentTab === index) return;
    this.currentTab = index;
    if (index === 0) return;
    else if (index === 1) this.getComparableProducts()
    else if (index === 2) this.getAvailableSizesProducts()
    else if (index === 3 || index === 4) this.getTradeProducts()
    else if (index === 5 ) this.getComparableProducts()
  }

  getSupplierDetails(supplierId:any){
    return new Promise<any>((resolve , reject)=>{
       this.apiService.getNew('core', '/api/v1/suppliers/' + supplierId).subscribe((res:any)=>{
        resolve(res.data);
        return
       }, (error)=>{
          resolve(error);
       })
    })
  }

  getProductData(iBusinessProductId: string) {
    this.ProductsLoading = true;
    return new Promise<any>((resolve, reject) => {
      this.apiService
        .getNew('core', `/api/v1/business/products/${iBusinessProductId}?iBusinessId=${this.iBusinessId.toString()}`)
        .subscribe(
          (result: any) => {
            if (result.message === "success") {
              this.productData = result.data
              if (!this.productData?.oCurrentLocation) this.productData.oCurrentLocation = {};
              this.findCurrentStock();
              this.ProductsLoading = false;
              resolve(result.data);
              return
            }
            this.toastService.show({ type: 'danger', text: result?.message })
            this.ProductsLoading = false;

            resolve(result);
          },
          (err: any) => {
            this.toastService.show({ type: 'danger', text: err?.error?.message })
            console.log({ err: err });
            this.ProductsLoading = false;

            resolve(err);
          }
        );
    })
  }

  /* Most sold and purchased-product */
  async getTradeProducts() {
    this.aTradeProducts = [];
    this.bIsTradeProductLoading = true;
    const body = {
      iBusinessId: this.iBusinessId.toString(),
      iLocationId: this.iLocationId.toString(),
      iBusinessProductId: this.productData._id.toString(),
      eMode: this.currentTab === 3 ? 'cash-registry' : 'purchase-order-retailer',
      iSupplierId: this.iSupplierId
    };
    return new Promise<any>((resolve, reject) => {
      this.apiService.postNew('core', '/api/v1/business/products/list-trade-products', body).subscribe((result: any) => {
        this.aTradeProducts = result.data;
        this.bIsTradeProductLoading = false;
        resolve(result);
      }, (err: any) => {
        this.bIsTradeProductLoading = false;
        console.log({ err: err });
        this.toastService.show({ type: 'danger', text: err?.error?.message })
        reject(err)
      });
    })
  }

  async getComparableProducts() {
    this.ComparableProducts = [];
    this.ComparableProductsLoading = true;
    const body = {
      iBusinessId: this.iBusinessId.toString(),
      iLocationId: this.iLocationId.toString(),
      iBusinessProductId: this.productData._id.toString(),
    };
    return new Promise<any>((resolve, reject) => {
      this.apiService
        .postNew(
          'core',
          '/api/v1/business/products/list-comparable-products',
          body
        )
        .subscribe(
          (result: any) => {
            this.ComparableProducts = result.data;
            this.ComparableProductsLoading = false;
            resolve(result);
          },
          (err: any) => {
            this.ComparableProductsLoading = false;
            console.log({ err: err });
            this.toastService.show({ type: 'danger', text: err?.error?.message })

            resolve(err)
          }
        );
    })
  }

  async getAvailableSizesProducts() {
    this.AvailableSizesProductsLoading = true
    const body = {
      iBusinessId: this.iBusinessId.toString(),
      iLocationId: this.iLocationId.toString(),
      iBusinessProductId: this.productData._id.toString(),
    };
    return new Promise<any>((resolve, reject) => {

      this.apiService
        .postNew(
          'core',
          '/api/v1/business/products/list-product-available-sizes',
          body
        )
        .subscribe(
          (result: any) => {
            this.AvailableSizesProducts = result.data;
            this.AvailableSizesProductsLoading = false
            resolve(result);

          },
          (err: any) => {
            console.log({ err: err });
            this.toastService.show({ type: 'danger', text: err?.error?.message })

            this.AvailableSizesProductsLoading = false
            resolve(err)
          }
        );
    })
  }

  nMinStockChange(event:any){
    this.minStockSubject.next(event);
  }

  updateMinStock() {
    const oBody = {
      iBusinessId: this.iBusinessId,
      oLocation: {
        _id: this.iLocationId,
        nMinStock: this.productData?.oCurrentLocation?.nMinStock
      }
    }
    this.apiService.putNew('core', `/api/v1/business/products/location/${this.productData._id}`, oBody).subscribe(
      (result: any) => {
        this.toastService.show({ type: 'success', text: 'Min-stock updated sucecssfully' });
      }, (err: any) => {
        console.log({ err: err });
        this.toastService.show({ type: 'danger', text: 'Something went wrong' })
      }
    );
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
    this.minStockSubject.pipe(
      filter(Boolean),
      debounceTime(1000),
      distinctUntilChanged(),
    ).subscribe(() => {
      this.updateMinStock();
    });
  }

}