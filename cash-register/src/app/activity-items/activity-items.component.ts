import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faLongArrowAltDown, faLongArrowAltUp, faMinusCircle, faPlusCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
import { ActivityDetailsComponent } from '../shared/components/activity-details-dialog/activity-details.component';
import { ApiService } from '../shared/service/api.service';
import { DialogService } from '../shared/service/dialog';
import { MenuComponent } from '../shared/_layout/components/common';

@Component({
  selector: 'app-activity-items',
  templateUrl: './activity-items.component.html',
  styleUrls: ['./activity-items.component.sass']
})
export class ActivityItemsComponent implements OnInit {

  pageCounts: Array<number> = [10, 25, 50, 100]
  pageCount: number = 10;
  pageNumber: number = 1;
  setPaginateSize: number = 10;
  paginationConfig: any = {
    itemsPerPage: '10',
    currentPage: 1,
    totalItems: 0
  };
  businessDetails: any = {};
  iLocationId: String | null | undefined;
  requestParams: any = {
    endDate: new Date(new Date().setHours(23, 59, 59)),
    startDate: new Date('01-01-2015'),
    searchValue: '',
    sortBy: { key: 'Date', selected: true, sort: 'asc' },
    sortOrder: 'asc',
    selectedRepairStatuses: [],
    selectedWorkstations: [],
    locations: [],
    selectedLocations: [],
    selectedTypes: [],
    employee: { sFirstName: 'All' }
  };
  activityItems: Array<any> = [];
  showLoader: Boolean = false;
  faSearch = faSearch;
  faIncrease = faPlusCircle;
  faDecrease = faMinusCircle;
  faArrowUp = faLongArrowAltUp;
  faArrowDown = faLongArrowAltDown;

  showAdvanceSearch = false;

  workstations: Array<any> = [];
  employees: Array<any> = [this.requestParams.employee];
  repairStatuses: Array<any> = ['info', 'processing', 'cancelled', 'inspection', 'completed']
  types: Array<any> = [ 'purchase-order-retailer', 'purchase-order-supplier', 'sales-order', 'cash-registry', 'webshop' ]
  methodValue: string = 'All';
  transactionValue: string = 'All';

  tableHeaders: Array<any> = [
    { key: 'Activity No.', selected: false, sort: '' },
    { key: 'Repair number', disabled: true },
    // { key: 'Type', disabled: true },
    { key: 'Intake date', selected: true, sort: 'asc' },
    { key: 'End date', selected: false, sort: 'asc' },
    { key: 'Status', disabled: true },
    { key: 'Supplier/Repairer', disabled: true },
    { key: 'Partner supplier status', disabled: true },
    { key: 'Customer', disabled: true },
  ]

  constructor(
    private apiService: ApiService,
    private dialogService: DialogService,
    private routes: Router
  ) { }

  ngOnInit(): void {
    this.businessDetails._id = localStorage.getItem('currentBusiness');
    this.iLocationId = localStorage.getItem('currentLocation');
    this.loadTransaction();
    this.getLocations();
    this.getWorkstations();
    this.listEmployee();
    this.openActivities({
      "_id": "6332bd040286494d78999e51",
      "oType": {
        "bPrepayment": true,
        "eTransactionType": "cash-registry",
        "bRefund": false,
        "eKind": "repair",
        "bDiscount": false
      },
      "eEstimatedDateAction": "call_on_ready",
      "aImage": [],
      "sProductName": "p8-95",
      "nPriceIncVat": 180,
      "nVatRate": 21,
      "nQuantity": 1,
      "oArticleGroupMetaData": {
        "aProperty": [
          {
            "iPropertyId": "61160712ae3cbb7453177f98",
            "iPropertyOptionId": "61f01aa45fc7504de957b258",
            "sPropertyOptionName": "WATCH",
            "sPropertyName": "Category",
            "sCode": "WA"
          },
          {
            "iPropertyId": "6261a5f76d3ec230f0886eee",
            "iPropertyOptionId": "62e8bd09c2910b2073515bad",
            "sPropertyOptionName": "TITANIUM",
            "sPropertyName": "Watch case material",
            "sCode": "TI"
          }
        ],
        "sCategory": "Repair",
        "sSubCategory": "Repair",
        "oName": {
          "nl": "Repair",
          "en": "Repair",
          "de": "Repair",
          "fr": "Repair"
        }
      },
      "dEstimatedDate": "2022-09-29T00:00:00.000Z",
      "iEmployeeId": "622addb11044dda518a269c3",
      "sBagNumber": "1234",
      "iSupplierId": "61fcff54fb7d0e4b20e96bb5",
      "sDescription": "description",
      "iCustomerId": "62420be55777d556346a9484",
      "iActivityId": "6332bd040286494d78999e4d",
      "nTotalAmount": 180,
      "nPaidAmount": 100,
      "sNumber": "AI2555-270922-1436",
      "iTransactionItemId": "6332bd040286494d78999e50",
      "dCreatedDate": "2022-09-27T09:06:12.580Z",
      "oBusinessProductMetaData": {
        "bBestseller": false,
        "bHasStock": false,
        "bShowSuggestion": false,
        "aImage": [],
        "eOwnerShip": "possession",
        "iSupplierId": "6275661d5732a79bf0e3f449",
        "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
        "sLabelDescription": "",
        "aProperty": [],
        "oName": {
          "en": "p8-95",
          "nl": "p8-95",
          "de": "p8-95",
          "fr": "p8-95"
        },
        "oShortDescription": {
          "nl": "",
          "en": "",
          "de": "",
          "fr": ""
        },
        "eGender": "female"
      },
      "nPaymentAmount": 100,
      "iActivityItemId": "6332bd040286494d78999e51",
      "sEmployeeName": "Alex Nil",
      "oCustomer": {
        "sFirstName": "Jolmer",
        "sLastName": "Ekeren2"
      }
    });
  }

  loadTransaction() {
    this.activityItems = [];
    this.requestParams.iBusinessId = this.businessDetails._id;
    this.requestParams.limit = this.paginationConfig.itemsPerPage || 50;
    if(this.iLocationId) this.requestParams.iLocationId = this.iLocationId;
    this.showLoader = true;
    this.apiService.postNew('cashregistry', '/api/v1/activities/items', this.requestParams).subscribe(
      (result: any) => {
        this.activityItems = result.data
        this.paginationConfig.totalItems = result.count;
        // this.activityItems.forEach((obj: any, index: number) => {
        //   if(obj.iCustomerId) this.fetchCustomer(obj.iCustomerId, index);
        // })
        // setTimeout(() => {
        //   MenuComponent.bootstrap();
        // }, 1000);
        this.showLoader = false;
      }, 
      (error: any) => {
        this.showLoader = false;
      })
  }

  openActivities(activity: any) {
    console.log(activity);
    this.dialogService.openModal(ActivityDetailsComponent, { cssClass: 'w-fullscreen', context: { activity:activity, items: true, from: 'activity-items' } })
      .instance.close.subscribe((result: any) => { 
        if (result) this.routes.navigate(['business/till']);
      });
  }

  // fetchCustomer(customerId: any, index: number) {
  //   this.apiService.getNew('customer', `/api/v1/customer/${customerId}?iBusinessId=${this.businessDetails._id}`).subscribe(
  //     (result: any) => {
  //       this.activityItems[index].oCustomer = { sFirstName: result?.sFirstName, sLastName: result?.sLastName, };
  //     },
  //     (error: any) => {
  //       console.error(error)
  //     }
  //   );
  // }

  listEmployee() {
    const oBody = { iBusinessId: this.businessDetails._id }
    this.apiService.postNew('auth', '/api/v1/employee/list', oBody).subscribe((result: any) => {
      if (result?.data?.length) {
        this.employees = this.employees.concat(result.data[0].result);
      }
    }, (error) => {
    })
  }

  getLocations() {
    this.apiService.postNew('core', `/api/v1/business/${this.businessDetails._id}/list-location`, {}).subscribe(
      (result: any) => {
        if (result.message == 'success') {
          this.requestParams.locations = result.data.aLocation;
        }
      }),
      (error: any) => {
        console.error(error)
      }
  }

  getWorkstations() {
    this.apiService.getNew('cashregistry', `/api/v1/workstations/list/${this.businessDetails._id}/${this.iLocationId}`).subscribe(
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

  sortAndLoadTransactions(sortHeader: any) {
    let sortBy = 'dCreatedDate';
    if (sortHeader.key == 'End date') sortBy = 'dPickedUp';
    if (sortHeader.key == 'Intake date') sortBy = 'dCreatedDate';
    if (sortHeader.key == 'Activity No.') sortBy = 'sNumber';
    this.requestParams.sortBy = sortBy;
    this.requestParams.sortOrder = sortHeader.sort;
    this.loadTransaction();
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

}
