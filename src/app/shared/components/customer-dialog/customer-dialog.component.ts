import { Component, ElementRef, Input, OnInit, QueryList, ViewChildren, ViewContainerRef } from '@angular/core';
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../service/api.service';
import { DialogComponent, DialogService } from "../../service/dialog";
import { CustomerDetailsComponent } from '../customer-details/customer-details.component';
import { CustomerAddressDialogComponent } from '../customer-address-dialog/customer-address-dialog.component';
import { ToastService } from '../toast';
import { PaginatePipe } from 'ngx-pagination';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CustomerStructureService } from 'src/app/shared/service/customer-structure.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-customer-dialog',
  templateUrl: './customer-dialog.component.html',
  styleUrls: ['./customer-dialog.component.sass'],
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
export class CustomerDialogComponent implements OnInit {
  @Input() customer: any;
  dialogRef: DialogComponent

  faTimes = faTimes
  faSearch = faSearch
  loading = false
  showLoader = false;
  customers: Array<any> = [];
  allcustomer: Array<any> = [];
  settings:any;
  getSettingsSubscription !: Subscription;
  business: any = {}
  customColumn = 'NAME';
  defaultColumns = [ 'PHONE', 'EMAIL', 'SHIPPING_ADDRESS', 'INVOICE_ADDRESS'];
  allColumns = [ this.customColumn, ...this.defaultColumns ];
  isCustomerSearched:Boolean = false;
  requestParams: any = {
    searchValue: '',
    skip:0 , 
    limit:10,
    oFilterBy: {
      aSearchField: []
    },
  }
  pageCounts: Array<number> = [10, 25, 50, 100]
  pageNumber: number = 1;
  setPaginateSize: number = 10;
  paginationConfig: any = {
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  };
  fakeCustomer: any = {
    number: '45663',
    counter: false,
    name: 'Christy van Woudenberg',
    email: 'CristyvanWoudenberg@armyspy.com',
    address: {
      street: 'Slatuinenweg',
      number: 24,
      zip: '1057 KB',
      city: 'Amsterdam'
    }
  }
  fakeCustomers = [] = [
    {
      number: '45663',
      counter: false,
      name: 'Christy van Woudenberg',
      email: 'CristyvanWoudenberg@armyspy.com',
      address: {
        street: 'Slatuinenweg',
        number: 24,
        zip: '1057 KB',
        city: 'Amsterdam'
      }
    },
    {
      number: '99647',
      counter: false,
      name: 'Irem Botman',
      email: 'IremBotman@teleworm.us',
      address: {
        street: 'Van der Leeuwlaan',
        number: 39,
        zip: '3119 LP',
        city: 'Schiedam'
      }
    },
    {
      number: '666543',
      counter: false,
      name: 'Chaline Kruisselbrink',
      email: 'ChalineKruisselbrink@dayrep.com',
      address: {
        street: 'Hogenhof',
        number: 1,
        zip: '3861 CG',
        city: 'Nijkerk'
      }
    },
    {
      number: '55147',
      counter: false,
      name: 'Jovan Abbink',
      email: 'JovanAbbink@teleworm.us',
      address: {
        street: 'Turfsteker',
        number: 94,
        zip: '8447 DB',
        city: 'Heerenveen'
      }
    },
    {
      number: '33654',
      counter: false,
      name: 'Richano van der Zijden',
      email: 'RichanovanderZijden@teleworm.us',
      address: {
        street: 'Veilingweg',
        number: 192,
        zip: '4731 CW',
        city: 'Oudenbosch'
      }
    }
  ]
  key:any;
  iChosenCustomerId : any;
  iSearchedCustomerId : any;
  // aFilterFields:any = [
  //   { title: 'PSOTAL_CODE', key: 'sPostalCode'},
  //   { title: 'HOUSE_NUMBER', key: 'sHouseNumber'},
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
  
  showFilters = false;
  from:any;

  @ViewChildren('inputElement') inputElement!: QueryList<ElementRef>;

  constructor(
    private viewContainer: ViewContainerRef,
    private paginationPipe: PaginatePipe,
    private dialogService: DialogService,
    private apiService: ApiService,
    private translateService: TranslateService,
    private customerStructureService: CustomerStructureService,
    private toastService: ToastService) {
    const _injector = this.viewContainer.parentInjector
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngAfterViewInit(): void {
    this.inputElement.first.nativeElement.focus();
  }

  ngOnInit(): void {
    this.apiService.setToastService(this.toastService);
    this.business._id = localStorage.getItem("currentBusiness");
    this.requestParams.iBusinessId = this.business._id;
    this.getSettings();
    this.allcustomer = this.dialogRef?.context?.allcustomer;
  }
  getSettings() {
    this.getSettingsSubscription = this.apiService.getNew('customer', `/api/v1/customer/settings/get/${this.requestParams.iBusinessId}`).subscribe((result: any) => {
      this.settings = result;
      if (this.settings?.aCustomerSearch) {
        this.requestParams.oFilterBy.aSearchField = this.settings?.aCustomerSearch;
      }
    }, (error) => {
      console.log(error);
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
    if (address.sStreet) {
      result += address.sStreet + ' ';
    }
    if (address.sHouseNumber) {
      result += address.sHouseNumber + (address.sHouseNumberSuffix ? '' : ' ');
    }
    if (address.sHouseNumberSuffix) {
      result += address.sHouseNumberSuffix + ' ';
    }
    if (address.sPostalCode) {
      result += this.formatZip(address.sPostalCode) + ' ';
    }
    if (address.sCity) {
      result += address.sCity;
    }
    if (includeCountry && address.sCountry) {
      result += address.sCountry;
    }
    return result;
  }

  getCustomers() {
    //const condition1 = Object.keys(this.requestParams.oFilterBy).some((key: any) => this.requestParams.oFilterBy[key]?.length);
    if (this.requestParams?.searchValue?.length < 3) return; // && !condition1
    
    
    this.showLoader = true;
    this.customers = [];
    this.isCustomerSearched = false;
    this.apiService.postNew('customer', '/api/v1/customer/list', this.requestParams)
      .subscribe(async (result: any) => {
        this.showLoader = false;
        this.isCustomerSearched = true;
          if (result && result.data && result.data[0] && result.data[0].result) {
            
            if(this.key == "MERGE"){
              this.customers = result.data[0].result.filter((customer: any) => customer?._id.toString() != this.iChosenCustomerId.toString());
              }else{
              this.customers = result.data[0].result;
             }


            this.paginationConfig.totalItems = result.data[0].count.totalData;        
            for(const customer of this.customers){
              if(customer?.bIsCompany){
                customer['NAME'] = customer.sCompanyName;
              }else{
                customer['NAME'] = this.customerStructureService.makeCustomerName(customer);
              }
              customer['SHIPPING_ADDRESS'] = this.makeCustomerAddress(customer.oShippingAddress, false);
              customer['INVOICE_ADDRESS'] = this.makeCustomerAddress(customer.oInvoiceAddress, false);
              customer['EMAIL'] = customer.sEmail;
              customer['PHONE'] = (customer.oPhone && customer.oPhone.sLandLine ? customer.oPhone.sLandLine : '') + (customer.oPhone && customer.oPhone.sLandLine && customer.oPhone.sMobile ? ' / ' : '') + (customer.oPhone && customer.oPhone.sMobile ? customer.oPhone.sMobile : '')
            }

          }
      },
      (error : any) =>{
        this.customers = [];
        this.showLoader = false;
      })
  }

  getMergeCustomers() {
    if (this.requestParams?.searchValue?.length < 3) return;
    this.showLoader = true;
    this.customers = [];
    this.isCustomerSearched = false;
    this.apiService.postNew('customer', '/api/v1/customer/mergecustomer/list', this.requestParams)
      .subscribe(async (result: any) => {
        this.showLoader = false;
        this.isCustomerSearched = true;
        this.requestParams = {
          searchValue: ''
        }
          if (result && result.data && result.data[0] && result.data[0].result) {
            this.customers = result.data[0].result;
            
            for(const customer of this.customers){
              customer['NAME'] = await this.makeCustomerName(customer);
              customer['SHIPPING_ADDRESS'] = this.makeCustomerAddress(customer.oShippingAddress, false);
              customer['INVOICE_ADDRESS'] = this.makeCustomerAddress(customer.oInvoiceAddress, false);
              customer['EMAIL'] = customer.sEmail;
              //customer['STATUS'] = customer.bIsConnected;
              customer['PHONE'] = (customer.oPhone && customer.oPhone.sLandLine ? customer.oPhone.sLandLine : '') + (customer.oPhone && customer.oPhone.sLandLine && customer.oPhone.sMobile ? ' / ' : '') + (customer.oPhone && customer.oPhone.sMobile ? customer.oPhone.sMobile : '')
            }
          }
      },
      (error : any) =>{
        this.customers = [];
        this.showLoader = false;
      })
  }
  
  AddCustomer(){
    this.dialogService.openModal(CustomerDetailsComponent, { cssClass:"modal-xl", context: { mode: 'create' } }).instance.close.subscribe(async (result) =>{ 
      let customer =  result.customer;
      customer['NAME'] =  await this.makeCustomerName(customer);
      customer['SHIPPING_ADDRESS'] = this.makeCustomerAddress(customer.oShippingAddress, false);
      customer['INVOICE_ADDRESS'] = this.makeCustomerAddress(customer.oInvoiceAddress, false);
      customer['EMAIL'] = customer.sEmail;
      customer['PHONE'] = (customer.oPhone && customer.oPhone.sLandLine ? customer.oPhone.sLandLine : '') + (customer.oPhone && customer.oPhone.sLandLine && customer.oPhone.sMobile ? ' / ' : '') + (customer.oPhone && customer.oPhone.sMobile ? customer.oPhone.sMobile : '')
      this.close({action: true, customer: customer });
    });
  }

  editCustomer(customer: any){
    this.dialogService.openModal(CustomerDetailsComponent, { cssClass:"modal-xl", context: { mode: 'details', customerData: customer, editProfile: false } }).instance.close.subscribe(result =>{
       this.getCustomers()
    });
  }

  changeItemsPerPage(pageCount: any) {
    this.paginationConfig.itemsPerPage = pageCount;
    this.getCustomers();
  }

  // Function for trigger event after page changes
  pageChanged(page: any) {
    this.requestParams.skip = (page - 1) * parseInt(this.paginationConfig.itemsPerPage);
    this.getCustomers();
    this.paginationConfig.currentPage = page;
  }


  

  close(data: any): void {
    this.dialogRef.close.emit(data)
  }

  randNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min +1) + min);
  }

  async setCustomer(customer: any) {

    if(this.key == "MERGE"){

      this.dialogService.openModal(CustomerAddressDialogComponent, { cssClass:"modal-lg", context: {iChosenCustomerId:this.iChosenCustomerId, mode: 'create', customerData: customer, editProfile: true } }).instance.close.subscribe(data =>{
        
       this.requestParams = {
        iBusinessId: this.requestParams.iBusinessId,
        searchValue: ''
      }
        
        let icIndex = this.allcustomer.findIndex(i => i._id.toString() == this.iChosenCustomerId.toString());
       
        if(icIndex != -1){
          this.allcustomer[icIndex].isDisable = true;
          this.allcustomer[icIndex].isMerged = true;
        }
       
       
        let isIndex = this.allcustomer.findIndex(i => i._id == data?.customer?.data?._id);
       
        if(isIndex != -1){
          this.allcustomer[isIndex] = data?.customer?.data;
          this.allcustomer[isIndex].isUpdated = true;
          this.allcustomer[isIndex].name = data?.customer?.data?.sSalutation.toUpperCase() +" " + data?.customer?.data?.sFirstName + " "+  data?.customer?.data?.sPrefix + " "+  data?.customer?.data?.sLastName ;
          this.allcustomer[isIndex]['NAME'] = data?.customer?.data?.sSalutation.toUpperCase() +" " + data?.customer?.data?.sFirstName + " "+  data?.customer?.data?.sPrefix + " "+  data?.customer?.data?.sLastName ;
          this.allcustomer[isIndex]['SHIPPING_ADDRESS'] = this.makeCustomerAddress(data?.customer?.data?.oShippingAddress, false);
          this.allcustomer[isIndex]['INVOICE_ADDRESS'] = this.makeCustomerAddress(data?.customer?.data?.oInvoiceAddress, false);
          this.allcustomer[isIndex]['EMAIL'] = data?.customer?.data?.sEmail;
          this.allcustomer[isIndex]['PHONE'] = (data?.customer?.data?.oPhone && data?.customer?.data?.oPhone.sLandLine ? data?.customer?.data?.oPhone.sLandLine : '') + (data?.customer?.data?.oPhone && data?.customer?.data?.oPhone.sLandLine && data?.customer?.data?.oPhone.sMobile ? ' / ' : '') + (data?.customer?.data?.oPhone && data?.customer?.data?.oPhone.sMobile ? data?.customer?.data?.oPhone.sMobile : '')
        }
     });




      // this.iSearchedCustomerId = customer._id;
      // this.loading = true;
      // this.requestParams.iChosenCustomerId = this.iChosenCustomerId;
      // this.requestParams.iSearchedCustomerId = this.iSearchedCustomerId;
      // this.apiService.postNew('customer', '/api/v1/customer/mergecustomer/create', this.requestParams)
      //   .subscribe(async (result: any) => {
      //     this.showLoader = false;
      //     this.isCustomerSearched = true;

      //     this.apiService.getNew('customer', "/api/v1/customer/" + this.requestParams.iBusinessId+"/"+this.iSearchedCustomerId).subscribe((res: any)=>{
           
      //       this.customer = res;
      //       this.close({action: true, customer: res });
      //       return;

      //     });
      //     this.getMergeCustomers();
      //   },
      //     (error: any) => { })
        
    } else {
      if (this.from && this.from === 'cash-register') {
        customer.loading = true;
        const oBody = {
          iBusinessId: this.business._id,
          type: 'transaction'
        }
        
        const _activityData:any = await this.apiService.postNew('cashregistry', `/api/v1/activities/customer/${customer._id}`, oBody).toPromise();
        if (_activityData?.data?.length && _activityData?.data[0]?.result?.length) {
          customer.activityData = _activityData?.data[0]?.result;
        }
        customer.loading = false;
      }
      this.customer = customer;
    }
  this.dialogRef.close.emit({ action: false, customer: this.customer })
  }

  save(): void {
    this.dialogRef.close.emit({action: true, customer: this.customer})
  }

}
