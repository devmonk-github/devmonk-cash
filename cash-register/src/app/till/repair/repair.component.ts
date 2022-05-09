import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { faTimes, faPlus, faMinus, faUpload } from "@fortawesome/free-solid-svg-icons";
import { ApiService } from 'src/app/shared/service/api.service';
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
  showDeleteBtn: boolean = false;

  repairer: any = null;
  // temporary variable
  supplier: any;
  constructor(private priceService: PriceService,
    private apiService: ApiService,
    private dialogService: DialogService) { }

  ngOnInit(): void {
    this.listSuppliers();
    this.listEmployees();
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
        const response = result.data[0];
        this.employeesList = response.result;
        this.employeesList.map(o => o.sName = `${o.sFirstName} ${o.sLastName}`);
        if (this.item.iEmployeeId) {
          const tempsupp = this.employeesList.find(o => o._id === this.item.iRepairerId);
          this.employee = tempsupp.sName;
        }
      }
    }, (error) => {
    });
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
        if (this.item.iRepairerId) {
          const tempsupp = this.suppliersList.find(o => o._id === this.item.iRepairerId);
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
  // Function for select supplier
  // onSelectBusinessPartner(supplier: any) {
  //   if (supplier._id) {
  //     this.repairer = supplier.sName;
  //     this.supplierOptions = [];
  //   }
  // }

  openImageModal() {
    this.dialogService.openModal(ImageUploadComponent, { cssClass: "modal-m", context: { mode: 'create' } })
      .instance.close.subscribe(result => {
        if (result.url)
          this.item.aImage.push(result.url);
      });
  }

  clearRepair(): void {
    console.log('clear repair called');
    this.repairer = null;
  }

  getTotalPrice(item: any): void {
    return this.priceService.calculateItemPrice(item)
  }

  removeImage(index: number): void {
    console.log(index);
    this.item.aImage.splice(index, 1);
  }
}
