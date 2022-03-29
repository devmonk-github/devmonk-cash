import { Component, OnInit } from '@angular/core';
import { DialogService } from '../shared/service/dialog';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../shared/service/api.service';
import { PaginatePipe } from 'ngx-pagination';
import {TranslateService} from "@ngx-translate/core";
import { CustomerDetailsComponent } from '../shared/components/customer-details/customer-details.component';
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

  faSearch= faSearch;

  business: any = {}
  customers: Array<any> = [];  //make it empty later
  showLoader: boolean = false;

  pageCounts: Array<number> = [ 10, 25, 50, 100]
  pageNumber: number = 1;
  setPaginateSize: number = 12;
  paginationConfig: any = {
    itemsPerPage: 1, 
    currentPage: 1, 
    totalItems: 0
  };

  customColumn = 'NAME';
  defaultColumns = [ 'PHONE', 'EMAIL', 'SHIPPING_ADDRESS', 'INVOICE_ADDRESS' ];
  allColumns = [ this.customColumn, ...this.defaultColumns ];
  requestParams : any = {
    iBusinessId: "",
    skip : 0,
    limit : 10,
    sortBy : '',
    sortOrder : '',
    searchValue : '',
    aProjection: [ 'sSalutation', 'sFirstName', 'sPrefix', 'sLastName', 'dDateOfBirth', 'dDateOfBirth', 'nClientId', 'sGender', 'bIsEmailVerified',
    'bCounter', 'sEmail', 'oPhone', 'oShippingAddress', 'oInvoiceAddress', 'iBusinessId', 'sComment', 'bNewsletter', 'sCompanyName', 'oPoints', 
    'sCompanyName', 'oIdentity', 'sVatNumber', 'sCocNumber', 'nPaymentTermDays', 'nDiscount', 'bWhatsApp' ],
    oFilterBy : {
      oStatic : {},
      oDynamic : {}
    }
  };
 
  constructor(
    private apiService: ApiService,
    // private dataSourceBuilder: NbTreeGridDataSourceBuilder<FSEntry>,
    private paginationPipe : PaginatePipe,
    private translateService: TranslateService,
    private dialogService: DialogService
  ) {

    // this.commonService.onUserDetailChange().subscribe((userDetails)=>{
    //   if(userDetails.user){
    //     this.business = userDetails.shop
    //     if(this.business && this.business._id){
    //       this.getCustomers()
    //     }
    //   }
    // })
  }

  ngOnInit(): void {
    this.business._id = localStorage.getItem("currentBusiness");
    this.requestParams.iBusinessId = this.business._id;
    this.getCustomers()

  }

  createCustomer() {
    this.dialogService.openModal(CustomerDetailsComponent, { cssClass:"modal-xl", context: { mode: 'create' } }).instance.close.subscribe(result =>{ });
  }

  changeItemsPerPage(pageCount: any){
    this.paginationConfig.itemsPerPage = pageCount;
    this.requestParams.skip = this.paginationConfig.itemsPerPage * ( this.paginationConfig.currentPage - 1);
    this.requestParams.limit = this.paginationConfig.itemsPerPage;
    this.getCustomers()
  }

  getCustomers() {
    this.showLoader = true;
    this.customers = [];
    this.apiService.postNew('customer', '/api/v1/customer/list', this.requestParams)
      .subscribe(async (result: any) => {
        this.showLoader = false;
        
          if (result && result.data && result.data[0] && result.data[0].result) {
            this.paginationConfig.totalItems = result.data[0].count.totalData;
            this.customers = result.data[0].result;
            for(const customer of this.customers){
              customer['NAME'] = await this.makeCustomerName(customer);
              customer['SHIPPING_ADDRESS'] = this.makeCustomerAddress(customer.oShippingAddress, false);
              customer['INVOICE_ADDRESS'] = this.makeCustomerAddress(customer.oInvoiceAddress, false);
              customer['EMAIL'] = customer.sEmail;
              customer['PHONE'] = (customer.oPhone && customer.oPhone.sLandLine ? customer.oPhone.sLandLine : '') + (customer.oPhone && customer.oPhone.sLandLine && customer.oPhone.sMobile ? ' / ' : '') + (customer.oPhone && customer.oPhone.sMobile ? customer.oPhone.sMobile : '')
            }
          }

          console.log(this.customers);
      },
      (error : any) =>{
        this.customers = [];
        this.showLoader = false;
      })
  }

  makeCustomerName = async (customer: any) => {
    if (!customer) {
      return '';
    }
    let result = '';
    if (customer.sSalutation) {
      await this.translateService.get(customer.sSalutation.toUpperCase()).subscribe( (res) => {
        result += res + ' ';
      });
    }
    if (customer.sFirstName) {
      result += customer.sFirstName + ' ';
    }
    if (customer.sPrefix) {
      result += customer.sPrefix + ' ';
    }

    if (customer.sLastName) {
      result += customer.sLastName;
    }

    return result;
  }

  formatZip(zipcode: string) {
    if (!zipcode) {
      return '';
    }
    return zipcode.replace(/([0-9]{4})([a-z]{2})/gi, (original, group1, group2) => {
      return group1 + ' ' + group2.toUpperCase();
    });
  }

  makeCustomerAddress(address: any, includeCountry: boolean) {
    if (!address) {
      return '';
    }
    let result = '';
    if (address.street) {
      result += address.street + ' ';
    }
    if (address.houseNumber) {
      result += address.houseNumber + (address.houseNumberSuffix ? '' : ' ');
    }
    if (address.houseNumberSuffix) {
      result += address.houseNumberSuffix + ' ';
    }
    if (address.postalCode) {
      result += this.formatZip(address.postalCode) + ' ';
    }
    if (address.city) {
      result += address.city;
    }
    if (includeCountry && address.country) {
      result += address.country;
    }
    return result;
  }

  // Function for return data to render on tree grid view
  loadPageTableData(){
    let result = this.paginationPipe.transform(this.customers, this.paginationConfig);
    // return this.dataSourceBuilder.create(result, this.getters);
  }

  openCustomer(customer:any) {
    this.dialogService.openModal(CustomerDetailsComponent, { cssClass:"modal-xl", context: { customer: customer, mode: 'details' } }).instance.close.subscribe(
      result =>{ this.getCustomers(); });
  }

  // Function for handle page change
  pageChanged(page:any){
    this.paginationConfig.currentPage = page;
    this.requestParams.skip = this.paginationConfig.itemsPerPage * ( page - 1);
    this.requestParams.limit = this.paginationConfig.itemsPerPage;
    this.getCustomers()
  }
}
