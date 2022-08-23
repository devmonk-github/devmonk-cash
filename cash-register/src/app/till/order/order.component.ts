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
  faUpload = faUpload;
  typeArray = ['regular', 'return'];
  propertyOptions: Array<any> = [];
  selectedProperties: Array<any> = [];
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
    this.checkArticleGroups();
    this.getProperties();
    this.listSuppliers();
    this.getBusinessBrands();
  }
  deleteItem(): void {
    this.itemChanged.emit('delete')
  }
  getDiscount(item: any): string {
    return this.priceService.getDiscount(item.nDiscount)
  }

  getColorCode(item: any): string {
    const { eTransactionItemType } = item;
    if (item.tType === 'refund') {
      return '#f7422e';
    }
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

  async createArticleGroup() {
    const articleBody = { name: 'Ordered products', sCategory: 'Ordered products', sSubCategory: 'Ordered products' };
    const result: any = await this.createArticleGroupService.createArticleGroup(articleBody);
    this.item.iArticleGroupId = result.data._id;
    this.item.oArticleGroupMetaData.sCategory = result.data.sCategory;
    this.item.oArticleGroupMetaData.sSubCategory = result.data.sSubCategory;
  }

  constisEqualsJson(obj1: any, obj2: any) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    return keys1.length === keys2.length && Object.keys(obj1).every(key => obj1[key] == obj2[key]);
  }

  getProperties() {
    this.selectedProperties = [];
    let data = {
      skip: 0,
      limit: 100,
      sortBy: '',
      sortOrder: '',
      searchValue: '',
      oFilterBy: {
        bRequiredForArticleGroup: true
      },
      iBusinessId: localStorage.getItem('currentBusiness'),
    };

    const aProperty: any = [];
    this.apiService.postNew('core', '/api/v1/properties/list', data).subscribe(
      (result: any) => {
        if (result.data && result.data.length > 0) {
          result.data[0].result.map((property: any) => {
            if (typeof (this.propertyOptions[property._id]) == 'undefined') {
              this.propertyOptions[property._id] = [];
              property.aOptions.map((option: any) => {
                if (option?.sCode?.trim() != '') {
                  let opt: any = {
                    iPropertyId: property._id,
                    iPropertyOptionId: option?._id,
                    sPropertyName: property.sName,
                    oProperty: {
                    },
                    sCode: option.sCode,
                    sName: option.sKey
                  };
                  opt.oProperty[option.sKey] = option.value;
                  this.propertyOptions[property._id].push(opt);
                  const proprtyIndex = aProperty.findIndex((prop: any) => prop.iPropertyId == property._id);
                  if (proprtyIndex === -1) {
                    aProperty.push(opt);
                  }
                }
              });
            }
          });

          if (this.item.oArticleGroupMetaData.aProperty.length === 0) {
            this.item.oArticleGroupMetaData.aProperty = aProperty
          };
          const data = this.item.oArticleGroupMetaData.aProperty.filter(
            (set => (a: any) => true === set.has(a.iPropertyId))(new Set(aProperty.map((b: any) => b.iPropertyId)))
          );

          data.forEach((element: any) => {
            const toReplace = this.propertyOptions[element.iPropertyId].find((o: any) => this.constisEqualsJson(o.oProperty, element.oProperty));
            if (toReplace) {
              element = toReplace;
              this.selectedProperties[toReplace.iPropertyId] = toReplace.sCode;
            }
          });
          this.item.oArticleGroupMetaData.aProperty = data;
        }
      }
    );
  }

  openImageModal() {
    this.dialogService.openModal(ImageUploadComponent, { cssClass: "modal-m", context: { mode: 'create' } })
      .instance.close.subscribe(result => {
        if (result.url)
          this.item.aImage.push(result.url);
      });
  }
  // Function for search suppliers
  searchSuppliers(searchStr: string) {
    if (searchStr && searchStr.length > 2) {
      this.supplierOptions = this.suppliersList.filter((supplier: any) => {
        return supplier.sName && supplier.sName.toLowerCase().includes(searchStr.toLowerCase());
      });
    }
  }

  listSuppliers() {
    const oBody = {
      iBusinessId: localStorage.getItem('currentBusiness') || '',
    }
    let url = '/api/v1/business/partners/supplierList';
    this.apiService.postNew('core', url, oBody).subscribe((result: any) => {
      if (result && result.data && result.data.length) {
        const response = result.data[0];
        this.suppliersList = response.result;
        if (this.item.iSupplierId) {
          const tempsupp = this.suppliersList.find(o => o._id === this.item.iSupplierId);
          this.supplier = tempsupp.sName;
        }
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
        if (this.item.iBusinessBrandId) {
          const tempsupp = this.brandsList.find(o => o._id === this.item.iBusinessBrandId);
          this.brand = tempsupp.sName;
        }
      }
    })
  }

  // Function for search suppliers
  searchBrands(searchStr: string) {
    if (searchStr && searchStr.length > 2) {
      this.filteredBrands = this.brandsList.filter((brands: any) => {
        return brands.sName && brands.sName.toLowerCase().includes(searchStr.toLowerCase());
      });
    }
  }
  checkArticleGroups() {
    this.createArticleGroupService.checkArticleGroups('Ordered products')
      .subscribe((res: any) => {
        if (1 > res.data.length) {
          this.createArticleGroup();
        } else {
          this.item.iArticleGroupId = res.data[0].result[0]._id;
          this.item.oArticleGroupMetaData.sCategory = res.data[0].result[0].sCategory;
          this.item.oArticleGroupMetaData.sSubCategory = res.data[0].result[0].sSubCategory;
        }
      }, err => {
        this.toastrService.show({ type: 'danger', text: err.message });
      });
  }

  // Function for set dynamic property option
  setPropertyOption(property: any, index: number) {
    if (this.propertyOptions[property.iPropertyId]?.length > 0) {
      let option = this.propertyOptions[property.iPropertyId].filter((opt: any) => opt.sCode == this.selectedProperties[property.iPropertyId]);
      if (option?.length > 0) {
        this.item.oArticleGroupMetaData.aProperty[index] = option[0];
      }
    }
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

  updatePayments(): void {
    this.itemChanged.emit('update');
  }
}
