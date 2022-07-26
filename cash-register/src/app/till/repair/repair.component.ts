import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { faTimes, faPlus, faMinus, faUpload } from "@fortawesome/free-solid-svg-icons";
import { ToastService } from 'src/app/shared/components/toast';
import { ApiService } from 'src/app/shared/service/api.service';
import { CreateArticleGroupService } from 'src/app/shared/service/create-article-groups.service';
import { DialogService } from 'src/app/shared/service/dialog';
import { PriceService } from 'src/app/shared/service/price.service';
import { ImageUploadComponent } from '../../shared/components/image-upload/image-upload.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[till-repair]',
  templateUrl: './repair.component.html',
  styleUrls: ['./repair.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RepairComponent implements OnInit {
  @Input() item: any
  @Input() taxes: any
  @Output() itemChanged = new EventEmitter<any>();

  faTimes = faTimes;
  faPlus = faPlus;
  faMinus = faMinus;
  faUpload = faUpload;
  employee: any = null;
  brand: any = null;
  supplierOptions: Array<any> = [];
  suppliersList: Array<any> = [];
  filteredEmployees: Array<any> = [];
  employeesList: Array<any> = [];
  filteredBrands: Array<any> = [];
  brandsList: Array<any> = [];
  typeArray = ['regular', 'broken', 'return'];
  propertyOptions: Array<any> = [];
  selectedProperties: Array<any> = [];
  showDeleteBtn: boolean = false;

  repairer: any = null;
  // temporary variable
  supplier: any;
  constructor(private priceService: PriceService,
    private apiService: ApiService,
    private dialogService: DialogService,
    private toastrService: ToastService,
    private createArticleGroupService: CreateArticleGroupService) { }

  ngOnInit(): void {
    this.listSuppliers();
    this.listEmployees();
    this.getBusinessBrands();
    this.checkArticleGroups();
    this.getProperties();
    this.listSuppliers();
    this.getBusinessBrands();
  }
  updatePayments(): void {
    this.itemChanged.emit('update');
  }
  deleteItem(): void {
    this.itemChanged.emit('delete')
  }

  listEmployees() {
    const oBody = {
      iBusinessId: localStorage.getItem('currentBusiness') || '',
    }
    let url = '/api/v1/employee/list';
    this.apiService.postNew('auth', url, oBody).subscribe((result: any) => {
      if (result && result.data && result.data.length) {
        this.employeesList = result.data[0].result;
        this.employeesList.map(o => o.sName = `${o.sFirstName} ${o.sLastName}`);
        if (this.item.iEmployeeId) {
          const tempsupp = this.employeesList.find(o => o._id === this.item.iSupplierId);
          this.employee = tempsupp.sName;
        }
      }
    }, (error) => {
    });
  }

  checkArticleGroups() {
    this.createArticleGroupService.checkArticleGroups('Repair')
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

  async createArticleGroup() {
    const articleBody = { name: 'Repair', sCategory: 'Repair', sSubCategory: 'Repair' };
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

  listSuppliers() {
    const oBody = {
      iBusinessId: localStorage.getItem('currentBusiness') || '',
    }
    let url = '/api/v1/business/partners/supplierList';
    this.apiService.postNew('core', url, oBody).subscribe((result: any) => {
      if (result && result.data && result.data.length) {
        this.suppliersList = result.data[0].result;
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
        if (this.item.iBrandId) {
          const tempsupp = this.brandsList.find(o => o._id === this.item.iBrandId);
          this.brand = tempsupp.sName;
        }
      }
    })
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

  // Function for search suppliers
  searchSuppliers(searchStr: string) {
    if (searchStr && searchStr.length > 2) {
      this.supplierOptions = this.suppliersList.filter((supplier: any) => {
        return supplier.sName && supplier.sName.toLowerCase().includes(searchStr.toLowerCase());
      });
    }
  }

  // Function for search suppliers
  searchEmployees(searchStr: string) {
    if (searchStr && searchStr.length > 2) {
      this.filteredEmployees = this.employeesList.filter((employee: any) => {
        return employee.sName && employee.sName.toLowerCase().includes(searchStr.toLowerCase());
      });
    }
  }

  // Function for search suppliers
  searchBrands(searchStr: string) {
    if (searchStr && searchStr.length > 2) {
      this.filteredBrands = this.brandsList.filter((brands: any) => {
        return brands.sName && brands.sName.toLowerCase().includes(searchStr.toLowerCase());
      });
    }
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

  openImageModal() {
    this.dialogService.openModal(ImageUploadComponent, { cssClass: "modal-m", context: { mode: 'create' } })
      .instance.close.subscribe(result => {
        if (result.url)
          this.item.aImage.push(result.url);
      });
  }

  clearRepair(): void {
    this.repairer = null;
  }

  getTotalPrice(item: any): void {
    return this.priceService.calculateItemPrice(item)
  }

  removeImage(index: number): void {
    this.item.aImage.splice(index, 1);
  }

  changeTotalAmount() {
    this.item.paymentAmount = -1 * this.item.quantity * this.item.price;
  }
}
