import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { faTimes, faPlus, faMinus, faArrowDown, faArrowUp, faUpload } from '@fortawesome/free-solid-svg-icons'
import { ImageUploadComponent } from 'src/app/shared/components/image-upload/image-upload.component';
import { ToastService } from 'src/app/shared/components/toast';
import { ApiService } from 'src/app/shared/service/api.service';
import { CreateArticleGroupService } from 'src/app/shared/service/create-article-groups.service';
import { DialogService } from 'src/app/shared/service/dialog';
import { PriceService } from 'src/app/shared/service/price.service';
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[till-goldpurchase]',
  templateUrl: './gold-purchase.component.html',
  styleUrls: ['./gold-purchase.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class GoldPurchaseComponent implements OnInit {
  @Input() item: any
  @Input() taxes: any
  @Output() itemChanged = new EventEmitter<any>();

  faTimes = faTimes
  faPlus = faPlus
  faMinus = faMinus
  faArrowDown = faArrowDown;
  faArrowUp = faArrowUp;
  faUpload = faUpload;
  goldFor = [{ type: 'goods', name: 'giftcard' },
  { type: 'goods', name: 'repair' },
  { type: 'goods', name: 'order' },
  { type: 'goods', name: 'stock' },
  { type: 'payment', name: 'cash' },
  { type: 'payment', name: 'bank' }];
  // goldFor = ['giftcard', 'repair', 'order', 'stock', 'cash', 'bankpayment'];
  propertyOptions: Array<any> = [];
  selectedProperties: Array<any> = [];
  articleGroups: Array<any> = [];
  articleGroupDetails: any = {
    iBusinessId: "",
    sCategory: "",
    sSubCategory: "",
    oName: {},
    bShowInOverview: false,
    bShowOnWebsite: false,
    bInventory: false,
    aProperty: []
  };
  brand: any = null;
  brandsList: Array<any> = [];
  filteredBrands: Array<any> = [];
  supplier: any;
  supplierOptions: Array<any> = [];
  suppliersList: Array<any> = [];
  showDeleteBtn: boolean = false;
  aProperty: any = [];
  constructor(
    private priceService: PriceService,
    private apiService: ApiService,
    private createArticleGroupService: CreateArticleGroupService,
    private toastrService: ToastService,
    private dialogService: DialogService) { }

  ngOnInit(): void {
    // this.getProperties();
    // this.getBusinessBrands();
    this.checkArticleGroups();
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

  assignArticleGroup(value: string) {
    const goldFor = this.goldFor.find(o => o.name === value);
    this.item.goldFor = goldFor;
    const artGroup = this.articleGroups.find((o: any) => o.sSubCategory === this.item.goldFor.name);
    if (!artGroup) {
      this.createArticleGroup();
    } else {
      this.item.iArticleGroupId = artGroup._id;
      this.item.oArticleGroupMetaData.sCategory = artGroup.sCategory;
      this.item.oArticleGroupMetaData.sSubCategory = artGroup.sSubCategory;
    }
  }

  checkArticleGroups() {
    this.createArticleGroupService.checkArticleGroups('Gold purchase')
      .subscribe((res: any) => {
        if (1 > res.data.length) {
          this.createArticleGroup();
        } else {
          this.articleGroups = res.data[0].result;
          this.assignArticleGroup(this.item.goldFor.name);
        }
      }, err => {
        this.toastrService.show({ type: 'danger', text: err.message });
      });
  }

  createArticleGroup() {
    this.createArticleGroupService.createArticleGroup({ name: 'Gold purchase', sCategory: 'Gold purchase', sSubCategory: this.item.goldFor.name })
      .subscribe((res: any) => {
        this.item.iArticleGroupId = res.data._id;
        this.item.oArticleGroupMetaData.sCategory = res.data.sCategory;
        this.item.oArticleGroupMetaData.sSubCategory = res.data.sSubCategory;
      },
        err => {
          this.toastrService.show({ type: 'danger', text: err.message });
        });
  }

  constisEqualsJson(obj1: any, obj2: any) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    return keys1.length === keys2.length && Object.keys(obj1).every(key => obj1[key] == obj2[key]);
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

  removeImage(index: number): void {
    this.item.aImage.splice(index, 1);
  }
}
