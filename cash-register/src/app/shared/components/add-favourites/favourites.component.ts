import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { DialogComponent } from '../../service/dialog';
import { ApiService } from '../../service/api.service';

@Component({
  selector: 'app-favourites',
  templateUrl: './favourites.component.html',
  styleUrls: ['./favourites.component.sass']
})
export class AddFavouritesComponent implements OnInit {

  dialogRef: DialogComponent;
  searchKeyword: any;
  shopProducts: any;
  commonProducts: any;
  business: any = {};
  mode: string = '';
  isStockSelected = true;
  newSelectedProduct: any = {};
  requestParams: any = {
    iBusinessId: ''
  }
  customMethod: any = {
    sName: '',
    bStockReduction: false,
    bInvoice: false,
    // bAssignSavingPoints : false,
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
    'aImage',
    'aProperty',
    'sArticleNumber',
    'iArticleGroupId',
    'iBusinessPartnerId',
    'iBusinessBrandId',
  ];

  constructor(
    private viewContainer: ViewContainerRef,
    private apiService: ApiService
  ) {
    const _injector = this.viewContainer.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit(): void {
    this.business._id = localStorage.getItem('currentBusiness');
  }

  search() {
    this.shopProducts = [];
    this.commonProducts = [];
    // if (searchValue && searchValue.length > 2) {
    //   this.isLoading = true;
    this.listShopProducts(this.searchKeyword, false);
    if (!this.isStockSelected) {
      this.listCommonBrandProducts(this.searchKeyword, false); // Searching for the products of common brand
    }
  }

  /* Search API for finding the  common-brands products */
  listShopProducts(searchValue: string | undefined, isFromEAN: boolean | false) {
    let data = {
      iBusinessId: this.business._id,
      skip: 0,
      limit: 10,
      sortBy: '',
      sortOrder: '',
      searchValue: searchValue,
      aProjection: this.aProjection,
      oFilterBy: {
        oStatic: {},
        oDynamic: {}
      }
    }
    this.apiService.postNew('core', '/api/v1/business/products/list', data).subscribe((result: any) => {
      // this.isLoading = false;
      if (result && result.data && result.data.length) {
        const response = result.data[0];
        this.shopProducts = response.result;
        console.log('shopProducts: ', this.shopProducts);
      }
    }, (error) => {
      // this.isLoading = false;
    });
  }

  listCommonBrandProducts(searchValue: string | undefined, isFromEAN: boolean | false) {
    try {
      let data = {
        iBusinessId: this.business._id,
        skip: 0,
        limit: 10,
        sortBy: '',
        sortOrder: '',
        searchValue: searchValue,
        aProjection: this.aProjection,
        oFilterBy: {
          oStatic: {},
          oDynamic: {}
        }
      };
      this.apiService.postNew('core', '/api/v1/products/commonbrand/list', data).subscribe((result: any) => {
        // this.isLoading = false;
        if (result && result.data && result.data.length) {
          const response = result.data[0];
          this.commonProducts = response.result;
        }
      }, (error) => {
        // this.isLoading = false;
      })
    } catch (e) {
      // this.isLoading = false;
    }
  }

  onSelectProduct(product: any, isFrom: string, isFor: string) {
    console.log('selected product', product);
    this.shopProducts = null;

    this.newSelectedProduct.sName = product.oName ? product.oName['en'] : 'No name';
    this.newSelectedProduct.nPrice = product.nPriceIncludesVat || 0;
    this.newSelectedProduct.iBusinessProductId = product._id;
    this.newSelectedProduct.aImage = product.aImage;
  }



  update() {

  }

  create() {
    try {
      let data = {
        iBusinessId: this.business._id,
        iLocationId: localStorage.getItem('currentLocation') || '',
        oQuickButton: this.newSelectedProduct
      };
      this.apiService.postNew('cashregistry', '/api/v1/quick-buttons/create', data).subscribe((result: any) => {
        if (result.message == 'success')
          this.close(true);
      }, (error) => {
        // this.isLoading = false;
      })
    } catch (e) {
      // this.isLoading = false;
    }
  }

  close(action: boolean) {
    this.dialogRef.close.emit({ action: action })
  }
}
