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
import { faLongArrowAltDown, faLongArrowAltUp } from '@fortawesome/free-solid-svg-icons';
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
      aSearchField: [],
      aSelectedGroups: []
    },
    customerType: 'all'
  };
  iChosenCustomerId : any;
  aInputHint:Array<any> = [""];
  bIsComaRemoved: boolean = false;
  bIsProperSearching: boolean = true;
  
  @ViewChildren('inputElement') inputElement!: QueryList<ElementRef>;
  showFilters = false;

  aFilterFields: Array<any> = [
    { key: 'FIRSTNAME', value: 'sFirstName' },
    { key: 'INSERT', value: 'sPrefix' },
    { key: 'LASTNAME', value: 'sLastName' },
    { key: 'PHONE', value: 'sMobile' },
    { key: 'POSTAL_CODE', value: 'sPostalCode' },
    { key: 'HOUSE_NUMBER', value: 'sHouseNumber' },
    { key: 'STREET', value: 'sStreet' },
    { key: 'COMPANY_NAME', value: 'sCompanyName' },
    { key: 'NCLIENTID', value: 'nClientId'}
  ];
  customerTypes:any=[
   { key:'ALL', value:'all'},
    {key:'PRIVATE' , value:'private'},
    {key:'COMPANY' , value:'company'}
  ]
  translations:any;
  aPlaceHolder: Array<any> = ["Search"];
  fNameString :any = "FIRSTNAME";
  LNameString :any = "LASTNAME";
  PrefixString:any = "INSERT";
  PhoneString:any ="PHONE";
  CNameString :any = "COMPANY_NAME";
  nCNameString :any = "NCLIENTID";
  StreetString :any = "STREET";
  PCodeString :any = "POSTAL_CODE";
  HNumberString :any = "HOUSE_NUMBER";
  showAdvanceSearch: boolean = false;
  faArrowUp = faLongArrowAltUp;
  faArrowDown = faLongArrowAltDown;
  tableHeaders: Array<any> = [
    { key: 'NAME',  disabled: true },
    { key: 'PHONE', disabled: true },
    { key: 'EMAIL', disabled: true },
    { key: 'SHIPPING_ADDRESS', selected: false, sort: '' },
    { key: 'INVOICE_ADDRESS', selected: false, sort: '' },
    {key:'ACTION' , disabled:true }
  ]
  customerGroupList :any=[];
 
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
    this.getCustomerGroups();
  }

  getSettings() {
    this.getSettingsSubscription = this.apiService.getNew('customer', `/api/v1/customer/settings/get/${this.requestParams.iBusinessId}`).subscribe((result: any) => {
      this.settings = result;
      if (this.settings?.aCustomerSearch) {
        this.requestParams.oFilterBy.aSearchField = this.settings?.aCustomerSearch;
        this.showAdvanceSearch = this.requestParams.oFilterBy.aSearchField.length > 0 ? true : false;
      }
      this.setPlaceHolder();
    }, (error) => {
      console.log(error);
    })
  }

  getCustomerGroups(){
    this.apiService.postNew('customer', '/api/v1/group/list', { iBusinessId: this.requestParams.iBusinessId, iLocationId: localStorage.getItem('currentLocation') }).subscribe((res: any) => {
      if (res?.data?.length) {
        this.customerGroupList = res?.data[0]?.result;
      }
    }, (error) => {})
  }

  // Function for reset selected filters
  resetFilters() {
    this.aPlaceHolder = ["SEARCH"];
    this.requestParams.searchValue = '';
    this.requestParams = {
      iBusinessId: this.business._id,
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
        aSearchField: [],
        aSelectedGroups: []
      },
      customerType: 'all'
    };
    this.getCustomers();
    this.getSettings();
  }

  removeItemAll(arr: any, value: any) {
    var i = 0;
    while (i < arr.length) {
      if (arr[i] === value) {
        arr.splice(i, 1);
      } else {
        ++i;
      }
    }
    return arr;
  }
  
  //  Function for set sort option on customer table
  setSortOption(sortHeader: any) {
    if (sortHeader.selected) {
      sortHeader.sort = sortHeader.sort == 'asc' ? 'desc' : 'asc';
      this.sortAndLoadCustomers(sortHeader)
    } else {
      this.tableHeaders = this.tableHeaders.map((th: any) => {
        if (sortHeader.key == th.key) {
          th.selected = true;
          th.sort = 'asc';
        } else {
          th.selected = false;
        }
        return th;
      })
      this.sortAndLoadCustomers(sortHeader)
    }
  }
  sortAndLoadCustomers(sortHeader: any) {
    let sortBy = 'dCreatedDate';
    if (sortHeader.key == 'SHIPPING_ADDRESS') sortBy = 'oShippingAddress.sStreet';
    if (sortHeader.key == 'INVOICE_ADDRESS') sortBy = 'oInvoiceAddress.sStreet';
    
    this.requestParams.sortBy = sortBy;
    this.requestParams.sortOrder = sortHeader.sort;
    this.getCustomers();
  }
  setPlaceHolder() {
    if (this.requestParams.oFilterBy.aSearchField.length != 0) {
      let pIndex = this.requestParams.oFilterBy.aSearchField.indexOf("sPostalCode");
      let sIndex = this.requestParams.oFilterBy.aSearchField.indexOf("sStreet");
      let hIndex = this.requestParams.oFilterBy.aSearchField.indexOf("sHouseNumber");
      let fIndex = this.requestParams.oFilterBy.aSearchField.indexOf("sFirstName");
      let prIndex = this.requestParams.oFilterBy.aSearchField.indexOf("sPrefix");
      let lIndex = this.requestParams.oFilterBy.aSearchField.indexOf("sLastName");
      let mIndex = this.requestParams.oFilterBy.aSearchField.indexOf("sMobile");
      let cIndex = this.requestParams.oFilterBy.aSearchField.indexOf("sCompanyName");
      let nIndex = this.requestParams.oFilterBy.aSearchField.indexOf("nClientId");
      
      if (pIndex == -1) {
        this.aPlaceHolder = this.removeItemAll(this.aPlaceHolder, this.translateService.instant(this.PCodeString));
        this.removeItemAll(this.aInputHint, "0000AB");
      } else {
        this.aPlaceHolder[pIndex] = this.translateService.instant(this.PCodeString);
        this.aInputHint[pIndex] = "0000AB";
      }

      if (sIndex == -1) {
        this.aPlaceHolder = this.removeItemAll(this.aPlaceHolder, this.translateService.instant(this.StreetString));
        this.removeItemAll(this.aInputHint, "Mainstreet");
      } else {
        this.aPlaceHolder[sIndex] = this.translateService.instant(this.StreetString);
        this.aInputHint[sIndex] = "Mainstreet";
      }

      if (hIndex == -1) {
        this.aPlaceHolder = this.removeItemAll(this.aPlaceHolder, this.translateService.instant(this.HNumberString));
        this.removeItemAll(this.aInputHint, "123A");
      } else {
        this.aPlaceHolder[hIndex] = this.translateService.instant(this.HNumberString);
        this.aInputHint[hIndex] = "123A";
      }
      if (fIndex == -1) {
        this.aPlaceHolder = this.removeItemAll(this.aPlaceHolder, this.translateService.instant(this.fNameString));
        this.removeItemAll(this.aInputHint, "John");
      } else {
        this.aPlaceHolder[fIndex] = this.translateService.instant(this.fNameString);
        this.aInputHint[fIndex] = "John";
      }
      if (prIndex == -1) {
        this.aPlaceHolder = this.removeItemAll(this.aPlaceHolder, this.translateService.instant(this.PrefixString));
        this.removeItemAll(this.aInputHint, "Van");
      } else {
        this.aPlaceHolder[prIndex] = this.translateService.instant(this.PrefixString);
        this.aInputHint[prIndex] = "Van";
      }
      if (lIndex == -1) {
        this.aPlaceHolder = this.removeItemAll(this.aPlaceHolder, this.translateService.instant(this.LNameString));
        this.removeItemAll(this.aInputHint, "Doe");
      } else {
        this.aPlaceHolder[lIndex] = this.translateService.instant(this.LNameString);
        this.aInputHint[lIndex] = "Doe";
      }
      if (mIndex == -1) {
        this.aPlaceHolder = this.removeItemAll(this.aPlaceHolder, this.translateService.instant(this.PhoneString));
        this.removeItemAll(this.aInputHint, "1234567890");
      } else {
        this.aPlaceHolder[mIndex] = this.translateService.instant(this.PhoneString);
        this.aInputHint[mIndex] = "1234567890";
      }
      if (cIndex == -1) {
        this.aPlaceHolder = this.removeItemAll(this.aPlaceHolder, this.translateService.instant(this.CNameString));
        this.removeItemAll(this.aInputHint, "Modern Company");
      } else {
        this.aPlaceHolder[cIndex] = this.translateService.instant(this.CNameString);
        this.aInputHint[cIndex] = "Modern Company";
      }
      if (nIndex == -1) {
        this.aPlaceHolder = this.removeItemAll(this.aPlaceHolder, this.translateService.instant(this.nCNameString));
        this.removeItemAll(this.aInputHint, "000000");
      } else {
        this.aPlaceHolder[nIndex] = this.translateService.instant(this.nCNameString);
        this.aInputHint[cIndex] = "Modern Company";
      }
    } else {
      this.aPlaceHolder = ["Search"];
    }
    this.aPlaceHolder = this.removeDuplicates(this.aPlaceHolder);
    this.aInputHint = this.removeDuplicates(this.aInputHint);
    this.showSearchWarningText();
  }

  removeDuplicates(arr: any) {
    return arr.filter((item: any, index: any) => arr.indexOf(item) === index);
  }

  /* show warnign if user is not searching as shown */
  showSearchWarningText() {
    this.bIsProperSearching = true;
    const aSearchValueArray = this.requestParams.searchValue.split(',').map((el: any) => el.trim()).filter((elem: any) => elem != '');
    if (aSearchValueArray?.length && aSearchValueArray?.length !== this.requestParams.oFilterBy?.aSearchField?.length) {
      this.bIsProperSearching = false;
    }
  }

  /* converting space into comma */
  customerEventHandler(event: any) {
    if (event.keyCode === 32) {
      if (!this.bIsComaRemoved && this.requestParams.oFilterBy.aSearchField?.length > 1) this.requestParams.searchValue = this.requestParams.searchValue.replace(/.$/, ",");
      this.bIsComaRemoved = false;
    } else if (event.keyCode === 8) {
      if (!this.requestParams.searchValue) this.bIsComaRemoved = false;
      else this.bIsComaRemoved = true;
    }
    this.showSearchWarningText();
  }

  /* Function to detect typed string and automatically prefill fields, if fields are not prefilled. */
  stringDetection() {
    this.aPlaceHolder = ["search"];
    const aSearchValueArray = this.requestParams.searchValue.split(',').map((el: any) => el.trim()).filter((elem: any) => elem != '');

     /* Prefill if no option is selected */
    if (aSearchValueArray.length == 1 && aSearchValueArray[0].match(/\d+/g)) {
      //console.log('This', aSearchValueArray[0], 'and', aSearchValueArray[0].match(/\d+/g)[0].length);

      /* Prefill with house number */
      if(aSearchValueArray[0].match(/\d+/g)[0].length <= 3 && !this.requestParams.oFilterBy.aSearchField.includes('sHouseNumber')){
        //console.log('it is a house number!');
        this.requestParams.oFilterBy.aSearchField.splice(0,0,'sHouseNumber');
        this.requestParams.oFilterBy.aSearchField = this.removeDuplicates(this.requestParams.oFilterBy.aSearchField);
        let pIndex = this.requestParams.oFilterBy.aSearchField.indexOf("sHouseNumber");
        this.aInputHint[pIndex] = "123A";
        this.aInputHint = this.removeDuplicates(this.aInputHint);

      /* Prefill with postal code */
      }else if (aSearchValueArray[0].match(/\d+/g)[0].length >= 4 &&  !this.requestParams.oFilterBy.aSearchField.includes('sPostalCode')) {
        /*If string contains number & >= 4 -> then add sPostalCode in selected field */
        //console.log('It is a postal code!',  this.requestParams.oFilterBy.aSearchField.length)
        this.requestParams.oFilterBy.aSearchField.splice(0,0,'sPostalCode');
        this.requestParams.oFilterBy.aSearchField = this.removeDuplicates(this.requestParams.oFilterBy.aSearchField);
        let pIndex = this.requestParams.oFilterBy.aSearchField.indexOf("sPostalCode");
        this.aInputHint[pIndex] = "0000AB";
        this.aInputHint = this.removeDuplicates(this.aInputHint);
      }
    } else if(aSearchValueArray.length > 1 && aSearchValueArray[0].length >= 3){
      //console.log('Else', aSearchValueArray[0], 'and', aSearchValueArray.length);
    }
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
            customer['PHONE'] = (customer.oPhone.sLandLine && customer.oPhone.sPrefixLandline ? customer.oPhone.sPrefixLandline : '') + (customer.oPhone && customer.oPhone.sLandLine ? customer.oPhone.sLandLine : '') + (customer.oPhone && customer.oPhone.sLandLine && customer.oPhone.sMobile ? ' / ' : '') + (customer.oPhone.sMobile && customer.oPhone.sPrefixMobile ? customer.oPhone.sPrefixMobile : '') + (customer.oPhone && customer.oPhone.sMobile ? customer.oPhone.sMobile : '');
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
