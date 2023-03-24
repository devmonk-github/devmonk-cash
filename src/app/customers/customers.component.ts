import { Component, OnInit, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { DialogService } from '../shared/service/dialog';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../shared/service/api.service';
import { PaginatePipe } from 'ngx-pagination';
import { CustomerDetailsComponent } from '../shared/components/customer-details/customer-details.component';
import { CustomerStructureService } from '../shared/service/customer-structure.service';
import { ToastService } from '../shared/components/toast';
import {ExportsComponent} from '../shared/components/exports/exports.component';
import { MenuComponent } from '../shared/_layout/components/common';
import { CustomerDialogComponent } from '../shared/components/customer-dialog/customer-dialog.component';
// import { result } from 'lodash';

// interface FSEntry {
//   NAME: string;
//   PHONE: string;
//   EMAIL: string;
//   SHIPPING_ADDRESS?: string;
//   INVOICE_ADDRESS?: string;
// }

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.sass']
})
export class CustomersComponent implements OnInit {

   customer: any = null;

  faSearch = faSearch;
  bIsShowDeletedCustomer: boolean = false;

  updated_customer: any = null;
  business: any = {}
  customers: Array<any> = [];  //make it empty later
  showLoader: boolean = false;

  pageCounts: Array<number> = [10, 25, 50, 100]
  pageNumber: number = 1;
  setPaginateSize: number = 10;
  paginationConfig: any = {
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  };

 
  customColumn = 'NAME';
  defaultColumns = ['PHONE', 'EMAIL', 'SHIPPING_ADDRESS', 'INVOICE_ADDRESS'];
  allColumns = [...this.defaultColumns];  
  customerMenu = [
    { key: 'MERGE' }
    
  ];
  options = [
    { key: 'DELETED' },
    { key: 'EXPORT' }
    
  ];
  requestParams: any = {
    iBusinessId: "",
    skip: 0,
    limit: 10,
    sortBy: '_id',
    sortOrder: -1,
    searchValue: '',
    aProjection: ['sSalutation', 'sFirstName', 'sPrefix', 'sLastName', 'dDateOfBirth', 'dDateOfBirth', 'nClientId', 'sGender', 'bIsEmailVerified',
      'bCounter', 'sEmail', 'oPhone', 'oShippingAddress', 'oInvoiceAddress', 'iBusinessId', 'sComment', 'bNewsletter', 'sCompanyName', 'oPoints',
      'sCompanyName', 'oIdentity', 'sVatNumber', 'sCocNumber', 'nPaymentTermDays',
       'nDiscount', 'bWhatsApp', 'nMatchingCode' , 'sNote' , 'iEmployeeId' , 'bIsMigrated' ,'bIsMerged','eStatus','bIsImported','aGroups'],
    oFilterBy: {
      oStatic: {},
      oDynamic: {}
    }
  };
  iChosenCustomerId : any;
  @ViewChildren('inputElement') inputElement!: QueryList<ElementRef>;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private paginationPipe: PaginatePipe,
    private dialogService: DialogService,
    private customerStructureService: CustomerStructureService
  ) {
  }

  ngOnInit(): void {
    this.apiService.setToastService(this.toastService);
    this.business._id = localStorage.getItem("currentBusiness");
    this.requestParams.iBusinessId = this.business._id;
    this.getCustomers()

  }

  // Function for handle event of transaction menu
  clickMenuOpt(key: string, customer:any) {
    switch (key) {
      case "MERGE":
        this.openCustomerDialog(customer,customer?._id,null,key);
        break;
    }
  }

  // clickMenuOptions(key: string) {
  //   switch (key) {
  //     case "DELETED":
  //       this.getDeletedCustomers();
  //       break;
  //       case "EXPORT":
  //       this.export();
  //       break;
  //   }
  // }


  openCustomerDialog(customer:any,Id:any,iSearchedCustomerId:any,key:any): void {
    
    this.dialogService.openModal(CustomerDialogComponent, { cssClass: 'modal-xl', context: {allcustomer:this.customers, customer:customer ,iChosenCustomerId:Id,iSearchedCustomerId:null,key:"MERGE"} }).instance.close.subscribe((data:any) => {
        

        // this.requestParams = {
        //   iBusinessId: this.requestParams.iBusinessId,
        //   searchValue: ''
        // }
          
        //   let icIndex = this.customers.findIndex(i => i._id.toString() == Id.toString());
         
        //   if(icIndex != -1){
        //   this.customers[icIndex].isDisable = true;
        //   this.customers[icIndex].isMerged = true;
        //   }
         
        //   let isIndex = this.customers.findIndex(i => i._id == data?.customer?.data?._id);
        //   if(isIndex != -1){
        //   this.customers[isIndex] = data?.customer?.data;
        //   this.customers[isIndex].isUpdated = true;
        //   this.customers[isIndex].name = this.customerStructureService.makeCustomerName(data?.customer?.data);
        //   this.customers[isIndex]['NAME'] = this.customerStructureService.makeCustomerName(data?.customer?.data);
        //   this.customers[isIndex]['SHIPPING_ADDRESS'] = this.customerStructureService.makeCustomerAddress(data?.customer?.data?.oShippingAddress, false);
        //   this.customers[isIndex]['INVOICE_ADDRESS'] = this.customerStructureService.makeCustomerAddress(data?.customer?.data?.oInvoiceAddress, false);
        //   this.customers[isIndex]['EMAIL'] = data?.customer?.data?.sEmail;
        //   this.customers[isIndex]['PHONE'] = (data?.customer?.data?.oPhone && data?.customer?.data?.oPhone.sLandLine ? data?.customer?.data?.oPhone.sLandLine : '') + (data?.customer?.data?.oPhone && data?.customer?.data?.oPhone.sLandLine && data?.customer?.data?.oPhone.sMobile ? ' / ' : '') + (data?.customer?.data?.oPhone && data?.customer?.data?.oPhone.sMobile ? data?.customer?.data?.oPhone.sMobile : '')
        //   }

      })

  }

  createCustomer() {
    this.dialogService.openModal(CustomerDetailsComponent, { cssClass: "modal-xl", context: { mode: 'create' } }).instance.close.subscribe(result => {
      if (result && result.action && result.action == true) this.getCustomers()
    });
  }

  changeItemsPerPage(pageCount: any) {
    this.paginationConfig.itemsPerPage = pageCount;
    this.requestParams.skip = this.paginationConfig.itemsPerPage * (this.paginationConfig.currentPage - 1);
    this.requestParams.limit = this.paginationConfig.itemsPerPage;
    this.getCustomers()
  }

  // getDeletedCustomers() {
  //   this.showLoader = true;
  //   this.requestParams.showRemovedCustomers = true;
  //   this.customers = [];
  //   this.apiService.postNew('customer', '/api/v1/customer/list', this.requestParams)
  //     .subscribe(async (result: any) => {
  //       this.showLoader = false;
  //       if (result?.data?.[0]?.result) {
  //         this.paginationConfig.totalItems = result.data[0].count.totalData;
  //         this.customers = result.data[0].result;
  //         for (const customer of this.customers) {
  //           customer.isDisable = false;
  //           customer.isUpdated = false;
  //           customer.isMerged = false;
  //           customer.name = this.customerStructureService.makeCustomerName(customer);
  //           customer['NAME'] = this.customerStructureService.makeCustomerName(customer);
  //           customer['SHIPPING_ADDRESS'] = this.customerStructureService.makeCustomerAddress(customer.oShippingAddress, false);
  //           customer['INVOICE_ADDRESS'] = this.customerStructureService.makeCustomerAddress(customer.oInvoiceAddress, false);
  //           customer['EMAIL'] = customer.sEmail;
  //           customer['PHONE'] = (customer.oPhone && customer.oPhone.sLandLine ? customer.oPhone.sLandLine : '') + (customer.oPhone && customer.oPhone.sLandLine && customer.oPhone.sMobile ? ' / ' : '') + (customer.oPhone && customer.oPhone.sMobile ? customer.oPhone.sMobile : '')
  //         }
  //         setTimeout(() => {
  //           MenuComponent.bootstrap();
  //           // MenuComponent.reinitialization();
  //         }, 200);
  //       }
  //     },
  //       (error: any) => {
  //         this.customers = [];
  //         this.showLoader = false;
  //       })
  // }

  getCustomers() {
    this.showLoader = true;
    if(this.bIsShowDeletedCustomer){
      this.requestParams.showRemovedCustomers = true;
    }else{
    this.requestParams.showRemovedCustomers = false;
  }
    this.customers = [];
    this.apiService.postNew('customer', '/api/v1/customer/list', this.requestParams)
      .subscribe(async (result: any) => {
        this.showLoader = false;
        if (result?.data?.[0]?.result) {
          this.paginationConfig.totalItems = result.data[0].count.totalData;
          this.customers = result.data[0].result;
          for (const customer of this.customers) {
            customer.isDisable = false;
            customer.isUpdated = false;
            customer.isMerged = false;
            customer.name = this.customerStructureService.makeCustomerName(customer);
            customer['NAME'] = this.customerStructureService.makeCustomerName(customer);
            customer['SHIPPING_ADDRESS'] = this.customerStructureService.makeCustomerAddress(customer.oShippingAddress, false);
            customer['INVOICE_ADDRESS'] = this.customerStructureService.makeCustomerAddress(customer.oInvoiceAddress, false);
            customer['EMAIL'] = customer.sEmail;
            customer['PHONE'] = (customer.oPhone && customer.oPhone.sLandLine ? customer.oPhone.sLandLine : '') + (customer.oPhone && customer.oPhone.sLandLine && customer.oPhone.sMobile ? ' / ' : '') + (customer.oPhone && customer.oPhone.sMobile ? customer.oPhone.sMobile : '')
          }
          setTimeout(() => {
            MenuComponent.bootstrap();
            // MenuComponent.reinitialization();
          }, 200);
        }
      },
        (error: any) => {
          this.customers = [];
          this.showLoader = false;
        })
  }

  // Function for return data to render on tree grid view
  loadPageTableData() {
    let result = this.paginationPipe.transform(this.customers, this.paginationConfig);
    // return this.dataSourceBuilder.create(result, this.getters);
  }

  export() {
    const headerList = [
      { key: "sSalutation", value: 'Salutation' }, { key: "sFirstName", value: 'First name' }, { key: "sPrefix", value: 'Prefix' }, { key: "sLastName", value: 'Last name' }, { key: "dDateOfBirth", value: 'Date of birth' }, { key: "nClientId", value: 'Client id' }, { key: "sGender", value: 'Gender' }, { key: "bIsEmailVerified", value: 'Email verified' }, { key: "bCounter", value: 'Counter' }, { key: "sEmail", value: 'Email' }, { key: "oPhone.sLandLine", value: 'Landline' },
      { key: 'oPhone.sMobile', value: 'Mobile' }, { key: 'oShippingAddress.sStreet', value: 'street' }, { key: 'oShippingAddress.sHouseNumber', value: 'House Number' }, { key: 'oShippingAddress.sPostalCode', value: 'Postal code' }, { key: 'oShippingAddress.sCountryCode', value: 'country code' }, { key: "sComment", value: 'Comment' }, { key: "bNewsletter", value: 'Newsletter' }, { key: "sCompanyName", value: 'Company name' }, { key: "oPoints", value: 'Points' }, { key: "oIdentity", value: 'Identity' }, { key: "sVatNumber", value: 'Vat number' },
      { key: "sCocNumber", value: 'Coc number' }, { key: "nPaymentTermDays", value: 'Payment term days' }, { key: "nDiscount", value: 'Discount' }, { key: "bWhatsApp", value: 'Whatsapp' }, { key: "nMatchingCode", value: 'Matching code' }, { key: "sNote", value: 'Note' }, { key: "bIsMigrated", value: 'Migrated customer' }
    ];
    this.dialogService.openModal(ExportsComponent, { cssClass: "modal-lg", context: { requestParams: this.requestParams, customerHeaderList: headerList, separator: '' } }).instance.close.subscribe(result => {})
  }

  openCustomer(customer: any) {
      this.dialogService.openModal(CustomerDetailsComponent, { cssClass: "modal-xl position-fixed start-0 end-0", context: { customerData: customer, mode: 'details', from: 'customer' } }).instance.close.subscribe(
      result => { if (result && result.action && result.action == true) this.getCustomers(); });
  }

  // Function for handle page change
  pageChanged(page: any) {
    this.paginationConfig.currentPage = page;
    this.requestParams.skip = this.paginationConfig.itemsPerPage * (page - 1);
    this.requestParams.limit = this.paginationConfig.itemsPerPage;
    this.getCustomers()
  }
}
