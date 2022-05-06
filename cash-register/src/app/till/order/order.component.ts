import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { faTimes, faPlus, faMinus, faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons'
import { ApiService } from 'src/app/shared/service/api.service';
import { PriceService } from 'src/app/shared/service/price.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[till-order]',
  templateUrl: './order.component.html',
  encapsulation: ViewEncapsulation.None
})
export class OrderComponent implements OnInit {
  @Input() item: any
  @Input() taxes: any
  @Output() itemChanged = new EventEmitter<any>();

  faTimes = faTimes
  faPlus = faPlus
  faMinus = faMinus
  faArrowDown = faArrowDown;
  faArrowUp = faArrowUp;
  typeArray = ['regular', 'return'];
  constructor(private priceService: PriceService,
    private apiService: ApiService) { }

  ngOnInit(): void {
    console.log('I am being called');
    this.checkArticleGroups();
    this.fetchInternalBusinessPartner();
  }
  deleteItem(): void {
    this.itemChanged.emit('delete')
  }
  getDiscount(item: any): string {
    return this.priceService.getDiscount(item.discount)
  }

  getColorCode(item: any): string {
    const { eTransactionItemType } = item;
    switch (eTransactionItemType) {
      case 'regular':
        return '#4ab69c';
      case 'broken':
        return '#f0e959';
      case 'return':
        return '#f7422e';
      default:
        return '#4ab69c';
    }
  }

  fetchInternalBusinessPartner() {
    let data = {
      skip: 0,
      limit: 500,
      sortBy: '',
      sortOrder: '',
      searchValue: '',
      oFilterBy: {
        bInternal: true,
      },
      iBusinessId: localStorage.getItem('currentBusiness'),
    }
    this.apiService.postNew('core', '/api/v1/business/partners/supplierList', data).subscribe((result: any) => {
      if (result && result.data && result.data.length > 0) {
        const supplier = result.data[0].result;
        this.item.iBusinessPartnerId = supplier[0]._id;
      } else {
        this.createInternalBusinessPartners();
      }
    });
  }


  createInternalBusinessPartners() {
    const businessId = localStorage.getItem('currentBusiness')
    this.apiService.getNew('core', '/api/v1/business/' + businessId)
      .subscribe(
        (result: any) => {
          const { data } = result;
          const order = {
            iBusinessId: localStorage.getItem('currentBusiness'), // creator of the internal businessPartner
            iSupplierId: localStorage.getItem('currentBusiness'), // creator of the internal businessPartner
            iClientGroupId: null,
            sEmail: data.sEmail, // business.sEmail
            sName: `${data.sName} internal supplier`, // business.sName + ' internal supplier',
            sWebsite: data.sWebsite, // business.website
            oPhone: data.oPhone,
            oAddress: data.oAddress,
            nPurchaseMargin: 2,
            bPreFillCompanySettings: false,
            aBankDetail: data.aBankDetail,
            aProperty: data.aProperty,
            aRetailerComments: [],
            eFirm: 'private',
            eAccess: 'n',
            eType: 'supplier',
            bInternal: true,
          }
          this.apiService.postNew('core', `/api/v1/business/partners`, order)
            .subscribe(
              (result: any) => {
                this.item.iBusinessPartnerId = result.data._id;
              }
            )
        });
  }

  createArticleGroup() {
    let data = {
      iBusinessId: localStorage.getItem('currentBusiness'),
      oName: { nl: 'Ordered products (not categorised)', en: 'Ordered products (not categorised)', de: 'Ordered products (not categorised)', fr: 'Ordered products (not categorised)' },
      bShowInOverview: false,
      bShowOnWebsite: false,
      bInventory: false,
      aProperty: []
    };

    this.apiService.postNew('core', '/api/v1/business/article-group/create/for/order', data).subscribe(
      (result: any) => {
        this.item.iArticleGroupId = result.data._id;

      }
    )
  }

  checkArticleGroups() {
    let data = {
      skip: 0,
      limit: 1,
      searchValue: 'Ordered products',
      oFilterBy: {
      },
      iBusinessId: localStorage.getItem('currentBusiness'),
    };
    this.apiService.postNew('core', '/api/v1/business/article-group/list', data).subscribe(
      (result: any) => {
        if (1 > result.data.length) {
          this.createArticleGroup();
        } else {
          this.item.iArticleGroupId = result.data[0].result[0]._id;
        }
      }
    )
  }

  changeInbrokenAmount(item: any) {
    if (item.nBrokenProduct < 0) {
      item.nBrokenProduct = 0;
    }
    if (item.quantity < item.nBrokenProduct) {
      item.nBrokenProduct = item.quantity;
    }
  }

  getTotalDiscount(item: any): string {
    return this.priceService.getDiscountValue(item);
  }

  getTotalPrice(item: any): string {
    return this.priceService.getArticlePrice(item)
  }
}
