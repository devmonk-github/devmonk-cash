import { Component, OnInit } from '@angular/core';
import { faLongArrowAltDown, faLongArrowAltUp, faMinusCircle, faPlus, faPlusCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
import { ActivityDetailsComponent } from '../shared/components/activity-details-dialog/activity-details.component';
import { ApiService } from '../shared/service/api.service';
import { DialogService } from '../shared/service/dialog';
import { MenuComponent } from '../shared/_layout/components/common';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.sass']
})
export class ServicesComponent implements OnInit {

  option: boolean = true;
  faSearch = faSearch;
  faIncrease = faPlusCircle;
  faDecrease = faMinusCircle;
  faArrowUp = faLongArrowAltUp;
  faArrowDown = faLongArrowAltDown;
  cities = [
    { name: 'Amsterdam', code: 'AMS' },
    { name: 'Bruxelles', code: 'BRU' },
    { name: 'Paris', code: 'PAR' },
    { name: 'Instanbul', code: 'INS' }
  ];
  selectedCity: string = '';
  activities: Array<any> = [];
  businessDetails: any = {};
  userType: any = {};
  requestParams: any = {
    searchValue: '',
    sortBy: { key: 'Date', selected: true, sort: 'asc' },
    sortOrder: 'asc'
  };
  showLoader: Boolean = false;
  widgetLog: string[] = [];
  pageCounts: Array<number> = [10, 25, 50, 100]
  pageCount: number = 10;
  pageNumber: number = 1;
  setPaginateSize: number = 1;
  paginationConfig: any = {
    itemsPerPage: '10',
    currentPage: 1,
    totalItems: 0
  };
  showAdvanceSearch = false;
  transactionMenu = [
    { key: 'REST_PAYMENT' },
    { key: 'REFUND/REVERT' },
    { key: 'PREPAYMENT' },
    { key: 'MARK_CONFIRMED' },
  ];
  iBusinessId: any = '';

  // Advance search fields 

  filterDates: any = {
    endDate: new Date(new Date().setHours(23, 59, 59)),
    startDate: new Date('01-01-2015'),
  }
  paymentMethods: Array<any> = ['All', 'Cash', 'Credit', 'Card', 'Gift-Card'];
  transactionTypes: Array<any> = ['All', 'Refund', 'Repair', 'Gold-purchase', 'Gold-sale'];
  transactionStatus: string = 'all';
  invoiceStatus: string = 'all';
  importStatus: string = 'all';
  methodValue: string = 'All';
  transactionValue: string = 'All';
  employee: any = { sFirstName: 'All' };
  employees: Array<any> = [this.employee];
  workstations: Array<any> = [];
  selectedWorkstations: Array<any> = [];
  locations: Array<any> = [];
  selectedLocations: Array<any> = [];
  iLocationId: String | null | undefined;

  tableHeaders: Array<any> = [
    { key: 'Activity No.', selected: false, sort: '' },
    { key: 'Repair number', disabled: true },
    { key: 'Type', disabled: true },
    { key: 'Intake date', selected: true, sort: 'asc' },
    { key: 'End date', selected: false, sort: 'asc' },
    { key: 'Status', disabled: true },
    { key: 'Supplier/Repairer', disabled: true },
    { key: 'Partner supplier status', disabled: true },
    { key: 'Customer', disabled: true },
    { key: 'Actions' },
  ]

  constructor(
    private apiService: ApiService,
    private dialogService: DialogService
  ) { }

  ngOnInit(): void {
    this.businessDetails._id = localStorage.getItem('currentBusiness');
    this.iLocationId = localStorage.getItem('currentLocation');
    this.userType = localStorage.getItem('type');
    this.loadTransaction();
    this.iBusinessId = localStorage.getItem('currentBusiness');
    this.listEmployee();
    this.getWorkstations();
    this.getLocations();
  }

  // Function for handle event of transaction menu
  clickMenuOpt(key: string, transactionId: string) {

  }

  getTypes(arr: any){
    let str = '';
    if(arr && arr.length){
      for(let i = 0; i < arr.length; i++){
        if(arr[i]?.oArticleGroupMetaData?.sCategory){
          if(!str){ str += (arr[i]?.oArticleGroupMetaData?.sCategory) }
          else { str += (', ' + arr[i]?.oArticleGroupMetaData?.sCategory) }
        } 
      }
    }
    return str;
  }

  getLocations() {
    this.apiService.postNew('core', `/api/v1/business/${this.iBusinessId}/list-location`, {}).subscribe(
      (result: any) => {
        if (result.message == 'success') {
          this.locations = result.data.aLocation;
        }
      }),
      (error: any) => {
        console.error(error)
      }
  }

  getWorkstations() {
    this.apiService.getNew('cashregistry', '/api/v1/workstations/list/' + this.businessDetails._id).subscribe(
      (result: any) => {
        if (result && result.data) {
          this.workstations = result.data;
        }
      }),
      (error: any) => {
        console.error(error)
      }
  }

  // Function for update item's per page
  changeItemsPerPage(pageCount: any) {
    this.paginationConfig.itemsPerPage = pageCount;
    this.loadTransaction();
  }

  // Function for trigger event after page changes
  pageChanged(page: any) {
    this.requestParams.skip = (page - 1) * parseInt(this.paginationConfig.itemsPerPage);
    this.loadTransaction();
    this.paginationConfig.currentPage = page;
  }


  //  Function for set sort option on transaction table
  setSortOption(sortHeader: any) {
    if (sortHeader.selected) {
      sortHeader.sort = sortHeader.sort == 'asc' ? 'desc' : 'asc';
      this.sortAndLoadTransactions(sortHeader)
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
      this.sortAndLoadTransactions(sortHeader)
    }
  }

  sortAndLoadTransactions(sortHeader: any) {
    let sortBy = 'dCreatedDate';
    if (sortHeader.key == 'End date') sortBy = 'dPickedUp';
    if (sortHeader.key == 'Intake date') sortBy = 'dCreatedDate';
    if (sortHeader.key == 'Activity No.') sortBy = 'sNumber';
    this.requestParams.sortBy = sortBy;
    this.requestParams.sortOrder = sortHeader.sort;
    this.loadTransaction();
  }

  listEmployee() {
    const oBody = { iBusinessId: this.iBusinessId }
    this.apiService.postNew('auth', '/api/v1/employee/list', oBody).subscribe((result: any) => {
      if (result?.data?.length) {
        this.employees = this.employees.concat(result.data[0].result);
      }
    }, (error) => {
    })
  }

  openActivities(activity: any) {
    this.dialogService.openModal(ActivityDetailsComponent, { cssClass: 'w-fullscreen', context: { activity, items: false } })
      .instance.close.subscribe(result => {
        // console.log('I am closing this modal');
        // if (result.url)
        // this.item.aImage.push(result.url);
      });
  }

  loadTransaction() {
    this.activities = [];
    this.requestParams.iBusinessId = this.businessDetails._id;
    this.requestParams.skip = this.requestParams.skip || 0;
    this.requestParams.limit = this.paginationConfig.itemsPerPage || 50;
    this.requestParams.importStatus = this.importStatus;
    if(this.iLocationId) this.requestParams.iLocationId = this.iLocationId;
    this.showLoader = true;
    this.apiService.postNew('cashregistry', '/api/v1/activities', this.requestParams).subscribe((result: any) => {
      this.activities = result.data;
      this.paginationConfig.totalItems = result.count;
      this.getCustomers();
      setTimeout(() => {
        MenuComponent.bootstrap();
      }, 1000);
      this.showLoader = false;
    }, (error) => {
      this.showLoader = false;
    })
  }

  getCustomers(){
    const arr = [];
    for(let i = 0; i < this.activities.length; i++){
      if(this.activities[i].iCustomerId && arr.indexOf(this.activities[i].iCustomerId) < 0 ) arr.push(this.activities[i].iCustomerId);
    }

    const body = {
      iBusinessId: this.iBusinessId,
      arr: arr,
    }

    this.apiService.postNew('customer', '/api/v1/customer/list', body)
      .subscribe(async (result: any) => {
        const customers = result.data[0].result || [];
        for(let i = 0; i < this.activities.length; i++){
          for(let j = 0; j < customers.length; j++){
            if(this.activities[i]?.iCustomerId?.toString() == customers[j]?._id?.toString()){
              this.activities[i].oCustomer = {
                sFirstName: customers[j].sFirstName,
                sPrefix: customers[j].sPrefix,
                sLastName: customers[j].sLastName
              }
            }
          }
        }
      },
      (error) => {
      })
  }
}
