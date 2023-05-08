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
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.sass'],
  animations: [trigger('openClose', [
    state('open', style({
      height: '*',
      opacity: 1,
    })),
    state('closed', style({
      height: '0',
      opacity: 0
    })),
    transition('open => closed', [
      animate('300ms')
    ]),
    transition('closed => open', [
      animate('300ms')
    ]),
  ])
  ]
})
export class CustomersComponent implements OnInit {

  customer: any = null;
  faSearch = faSearch;
  bIsShowDeletedCustomer: boolean = false;
  updated_customer: any = null;
  business: any = {}
  customers: Array<any> = [];  //make it empty later
  showLoader: boolean = false;
  settings:any;
  getSettingsSubscription !: Subscription;
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
    { key: 'SHOW_DELETED_CUSTOMERS' },
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
      'nDiscount', 'bWhatsApp', 'nMatchingCode', 'sNote', 'iEmployeeId', 'bIsMigrated', 'bIsMerged', 'eStatus', 'bIsImported', 'aGroups', 'bIsCompany', 'oContactPerson'],
    oFilterBy: {
      aSearchField: []
    },
    customerType: 'all'
  };
  iChosenCustomerId : any;
  
  @ViewChildren('inputElement') inputElement!: QueryList<ElementRef>;
  showFilters = false;
  // aFilterFields: any = [
  //   { title: 'PSOTAL_CODE', key: 'sPostalCode' },
  //   { title: 'HOUSE_NUMBER', key: 'sHouseNumber' },
  // ]

  aFilterFields: Array<any> = [
    { key: 'FIRSTNAME', value: 'sFirstName' },
    { key: 'LASTNAME', value: 'sLastName' },
    { key: 'ADDRESS', value: 'sAddress' },
    // { key: 'PSOTAL_CODE', value: 'sPostalCode' },
    // { key: 'HOUSE_NUMBER', value: 'sHouseNumber' },
    // { key: 'STREET', value: 'sStreet' },
    { key: 'COMPANY_NAME', value: 'sCompanyName' },
    { key: 'NCLIENTID', value: 'nClientId'}
    //{ key: 'CONTACT_PERSON', value: 'oContactPerson' }
  ];
  customerTypes:any=[
   { key:'ALL', value:'all'},
    {key:'PRIVATE' , value:'private'},
    {key:'COMPANY' , value:'company'}
  ]
  translations:any;
  aCustomerSearch:Array<any> = [String];
  aPlaceHolder: Array<any> = ["Search"];
  addressString :any = "STREETHOUSE_NUMBERPOSTAL_CODE";
  fNameString :any = "FIRSTNAME";
  LNameString :any = "LASTNAME";
  CNameString :any = "COMPANY_NAME";
  nCNameString :any = "NCLIENTID";
  //aKeywords = ['FIRSTNAME', 'LASTNAME']
  
  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private paginationPipe: PaginatePipe,
    private dialogService: DialogService,
    private translateService: TranslateService,
    private customerStructureService: CustomerStructureService
  ) {
  }

  async ngOnInit() {
    this.apiService.setToastService(this.toastService);
    this.business._id = localStorage.getItem("currentBusiness");
    this.requestParams.iBusinessId = this.business._id;
    this.getSettings();
    this.translateService.onTranslationChange.subscribe((result:any) => {
    this.translateService.get(this.aPlaceHolder).subscribe((result:any) => {
      this.aPlaceHolder.forEach((el:any, index:any) => {
        this.aPlaceHolder[index] = result[el];
      })
     });
   })
  this.getCustomers();
  }

  getSettings() {
    this.getSettingsSubscription = this.apiService.getNew('customer', `/api/v1/customer/settings/get/${this.requestParams.iBusinessId}`).subscribe((result: any) => {
      this.settings = result;
      if (this.settings?.aCustomerSearch) {
        this.requestParams.oFilterBy.aSearchField = this.settings?.aCustomerSearch;
        this.setPlaceHolder();
      }
    }, (error) => {
      console.log(error);
    })
  }

  setPlaceHolder() {
    if (this.requestParams.oFilterBy.aSearchField.length != 0) {
      let aIndex = this.requestParams.oFilterBy.aSearchField.indexOf("sAddress");
      let fIndex = this.requestParams.oFilterBy.aSearchField.indexOf("sFirstName");
      let lIndex = this.requestParams.oFilterBy.aSearchField.indexOf("sLastName");
      let cIndex = this.requestParams.oFilterBy.aSearchField.indexOf("sCompanyName");
      let nIndex = this.requestParams.oFilterBy.aSearchField.indexOf("nClientId");
      if (aIndex != -1 || fIndex != -1 || lIndex != -1 || cIndex != -1 || nIndex != -1) {
        this.aPlaceHolder[aIndex] = this.translateService.instant(this.addressString);
        this.aPlaceHolder[fIndex] = this.translateService.instant(this.fNameString);
        this.aPlaceHolder[lIndex] = this.translateService.instant(this.LNameString);
        this.aPlaceHolder[cIndex] = this.translateService.instant(this.CNameString);
        this.aPlaceHolder[nIndex] = this.translateService.instant(this.nCNameString);
      } else {
        this.aPlaceHolder = this.requestParams.oFilterBy.aSearchField;
      }
    } else {
      this.aPlaceHolder = ["Search"];
    }
    this.aPlaceHolder = this.removeDuplicates(this.aPlaceHolder);
  }

  removeDuplicates(arr:any) {
    return arr.filter((item:any,index:any) => arr.indexOf(item) === index);
  }

  // Function for handle event of transaction menu
  clickMenuOpt(key: string, customer:any) {
    switch (key) {
      case "MERGE":
        this.openCustomerDialog(customer,customer?._id,null,key);
        break;
    }
  }

  // Function for menu options
  clickMenuOptions(key: string) {
    switch (key) {
      case "SHOW_DELETED_CUSTOMERS":
        this.options[0].key = "HIDE_DELETED_CUSTOMERS";
        this.bIsShowDeletedCustomer = true;
        this.getCustomers();
        break;
      case "HIDE_DELETED_CUSTOMERS":
        this.options[0].key = "SHOW_DELETED_CUSTOMERS";
        this.bIsShowDeletedCustomer = false;
        this.getCustomers();
        break;
      case "EXPORT":
        this.export();
        break;
    }
  }

  openCustomerDialog(customer:any,Id:any,iSearchedCustomerId:any,key:any): void {
    this.dialogService.openModal(CustomerDialogComponent, { cssClass: 'modal-xl', context: {allcustomer:this.customers, customer:customer ,iChosenCustomerId:Id,iSearchedCustomerId:null,key:"MERGE"} }).instance.close.subscribe((data:any) => {
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


  getCustomers(bIsSearch?: boolean) {
    this.showLoader = true;
    if (bIsSearch) this.requestParams.skip = 0;
    if (this.bIsShowDeletedCustomer) {
      this.requestParams.bShowRemovedCustomers = true;
    } else {
      this.requestParams.bShowRemovedCustomers = false;
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
            if (customer?.bIsCompany) {
              customer.name = customer.sCompanyName;
              customer['NAME'] = customer.sCompanyName;
            } else {
              customer.name = this.customerStructureService.makeCustomerName(customer);
              customer['NAME'] = this.customerStructureService.makeCustomerName(customer);
            }

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


  /*
   * Function to detect typed string and automatically prefill fields, if fields are not prefilled. 
   * If string contains number add ADDRESS in selected fields.
   * If string contains letters add LASTNAME in selected fields.
  */
  stringDetection(){
    /*When length of searchvalue is equal to 4, we will be able to detect if user is searching for someting in the address or lastname*/
    if(this.requestParams.searchValue.length == 4 && this.requestParams.oFilterBy.aSearchField.length==0){
      /*If string contains number -> then add Address in selected field */
      if(/\d/.test(this.requestParams.searchValue)){
        console.log(this.requestParams.searchValue);
        console.log(this.requestParams.oFilterBy.aSearchField, '-',this.settings?.aCustomerSearch, '-', this.aFilterFields[2].value);
        /*TODO: fill the selection with address, the following code is is not showing the selected element on frontend*/
        this.requestParams.oFilterBy.aSearchField.unshift('sAddress');
        console.log(this.requestParams.oFilterBy.aSearchField);
      }else{
        /*If string contains only letters -> then add Lastname in selected field */
        /*TODO: fill the selection with lastname, the following code is is not showing the selected element on frontend*/
        this.requestParams.oFilterBy.aSearchField.unshift('sLastName');
        console.log(this.requestParams.oFilterBy.aSearchField);
      }
    }
  }
}
