import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { DialogComponent } from '../../service/dialog';
import { ApiService } from '../../service/api.service';
import { ToastService } from '../toast';

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
  searching: boolean = false;
  creating: boolean = false;
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
    'aLocation',
    'aImage',
    'aProperty',
    'sArticleNumber',
    'iArticleGroupId',
    'iBusinessPartnerId',
    'iBusinessBrandId',
  ];

  constructor(
    private viewContainer: ViewContainerRef,
    private apiService: ApiService,
    private toastService: ToastService,
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
    this.searching = true;
    this.apiService.postNew('core', '/api/v1/business/products/list', data).subscribe((result: any) => {
      this.searching = false;
      if (result && result.data && result.data.length) {
        const response = result.data[0];
        this.shopProducts = response.result;
      }
    }, (error) => {

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
      this.searching = true;
      this.apiService.postNew('core', '/api/v1/products/commonbrand/list', data).subscribe((result: any) => {
        this.searching = false;
        if (result && result.data && result.data.length) {
          const response = result.data[0];
          this.commonProducts = response.result;
        }
      }, (error) => {
        this.searching = false;
      })
    } catch (e) {
      this.searching = false;
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

  create(event: any) {
    event.target.disabled = true;
    this.creating = true;

    try {
      let data = {
        iBusinessId: this.business._id,
        iLocationId: localStorage.getItem('currentLocation'),
        oQuickButton: this.newSelectedProduct
      };

      if (!data.iLocationId) {
        this.toastService.show({ type: 'warning', text: `Please select a location` });
        return;
      }

      this.apiService.postNew('cashregistry', '/api/v1/quick-buttons/create', data).subscribe((result: any) => {
        if (result.message == 'success') {
          event.target.disabled = false;
          this.creating = false;
          this.close(true);
          this.toastService.show({ type: 'success', text: `New Quick Button added successfully` });
        }
      }, (error) => {
        event.target.disabled = false;
        this.creating = false;
      })
    } catch (e) {
      event.target.disabled = false;
      this.creating = false;
    }
  }

  close(action: boolean) {
    this.dialogRef.close.emit({ action: action })
  }
}
