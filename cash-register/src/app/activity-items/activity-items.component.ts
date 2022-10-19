import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faLongArrowAltDown, faLongArrowAltUp, faMinusCircle, faPlusCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
import { ActivityDetailsComponent } from '../shared/components/activity-details-dialog/activity-details.component';
import { CardsComponent } from '../shared/components/cards-dialog/cards-dialog.component';
import { ToastService } from '../shared/components/toast';
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
    selectedKind: [],
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
  repairStatuses: Array<any> = ['new', 'info', 'processing', 'cancelled', 'inspection', 'completed', 'refund',
    'refundInCashRegister', 'offer', 'offer-is-ok', 'to-repair', 'part-are-order', 'shipped-to-repair', 'delivered'
  ]

  aKind: Array<any> = ['reservation', 'repair', 'giftcard', 'order', 'gold-purchase', 'gold-sell']
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
    private routes: Router,
    private toastrService: ToastService
  ) { }

  ngOnInit(): void {
    this.businessDetails._id = localStorage.getItem('currentBusiness');
    this.iLocationId = localStorage.getItem('currentLocation');
    this.loadTransaction();
    this.getLocations();
    this.getWorkstations();
    this.listEmployee();
  }

  loadTransaction() {
    this.activityItems = [];
    this.requestParams.iBusinessId = this.businessDetails._id;
    this.requestParams.limit = this.paginationConfig.itemsPerPage || 50;
    if(!this.requestParams.selectedKind.length){
      this.requestParams.selectedKind=['repair', 'giftcard', 'gold-sell', 'gold-purchase', 'order', 'reservation']
    }
    console.log("------------------------------------------");
    console.log(this.requestParams);
    if (this.iLocationId) this.requestParams.iLocationId = this.iLocationId;
    this.showLoader = true;
    this.apiService.postNew('cashregistry', '/api/v1/activities/items', this.requestParams).subscribe(
      (result: any) => {
        this.activityItems = result.data
        this.paginationConfig.totalItems = result.count;
        this.showLoader = false;
      },
      (error: any) => {
        this.showLoader = false;
      })
  }

  openActivities(activity: any, openActivityId?:any) {
    console.log('opening ActivityDetailsComponent with',activity);
    
    this.dialogService.openModal(ActivityDetailsComponent, { cssClass: 'w-fullscreen', context: { activity: activity, openActivityId, items: true, from: 'activity-items' } })
      .instance.close.subscribe((result: any) => {
        if (result) this.routes.navigate(['business/till']);
      });
  }

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

  goToCashRegister() {
    this.routes.navigate(['/business/till']);
  }

  async openModal(barcode: any) {
    this.toastrService.show({ type: 'success', text: 'Barcode detected: ' + barcode })
    if (barcode.startsWith("AI")) {
      console.log('activity item', barcode);
      // activityitem.find({sNumber: barcode},{eTransactionItem.eKind : 1})
      let oBody: any = {
        iBusinessId: this.businessDetails._id,
        oFilterBy: {
          sNumber: barcode
        }
      }
      const activityItemResult: any = await this.apiService.postNew('cashregistry', `/api/v1/activities/activity-item`, oBody).toPromise();
      if (activityItemResult?.data[0]?.result?.length) {

        const iActivityId = activityItemResult?.data[0].result[0].iActivityId;
        const iActivityItemId = activityItemResult?.data[0].result[0]._id;
        oBody = {
          iBusinessId: this.businessDetails._id,
          oFilterBy: {
            _id: iActivityId
          }
        }
        const activityResult:any = await this.apiService.postNew('cashregistry', '/api/v1/activities', oBody).toPromise();
        console.log({ activityResult });
        
        // const oActivityItem = activityItemResult?.data[0].result[0]._id;
        // console.log({ oActivityItem });
        // const activityItemsResult: any = await this.apiService.postNew('cashregistry', `/api/v1/activities/items/${iActivityId}`, {iBusinessId: this.businessDetails._id}).toPromise();
        // console.log({ activityItemsResult });
        if (activityResult.data?.length){
          this.openActivities(activityResult.data[0], iActivityItemId);
        }
      }
    } else if (barcode.startsWith("A")) {
      console.log('Fetching activity', barcode);
      let oBody = {
        iBusinessId: this.businessDetails._id,
        oFilterBy: {
          sNumber: barcode
        }
      }
      const activityResult: any = await this.apiService.postNew('cashregistry', '/api/v1/activities', oBody).toPromise();
      console.log({ activityResult });

      // const oActivityItem = activityItemResult?.data[0].result[0]._id;
      // console.log({ oActivityItem });
      // const activityItemsResult: any = await this.apiService.postNew('cashregistry', `/api/v1/activities/items/${iActivityId}`, {iBusinessId: this.businessDetails._id}).toPromise();
      // console.log({ activityItemsResult });
      if (activityResult.data?.length) {
        this.openActivities(activityResult.data[0]);
      }
      
      //activity.find({sNumber: barcode})
    } else if (barcode.startsWith("G")) {
      let oBody: any = {
        iBusinessId: this.businessDetails._id,
        oFilterBy: {
          sGiftCardNumber: barcode.substring(2)
        }
      }
      let result: any = await this.apiService.postNew('cashregistry', `/api/v1/activities/activity-item`, oBody).toPromise();
      // console.log(result);
      if (result?.data[0]?.result?.length) {
        const oGiftcard = result?.data[0]?.result[0];
        this.openCardsModal(oGiftcard)
      }
      // activityitem.find({sGiftcardNumber: barcode},{eTransactionItem.eKind : 1})
    } else if (barcode.startsWith("R")) {
      // activityitem.find({sRepairNumber: barcode},{eTransactionItem.eKind : 1})
    }

  }

  openCardsModal(oGiftcard?: any, oCustomer?:any ) {
    this.dialogService.openModal(CardsComponent, { cssClass: 'modal-lg', context: { customer: oCustomer, oGiftcard } })
      .instance.close.subscribe(result => {
        console.log('When Redeem GiftCard closed: ', result, result?.giftCardInfo?.type);
        if (result) {
          // if (result.giftCardInfo.nAmount > 0) {
          //   this.appliedGiftCards.push(result.giftCardInfo);
          //   this.changeInPayment();
          // }
          // if (result.redeemedLoyaltyPoints && result.redeemedLoyaltyPoints > 0) {
          //   this.addReedemedPoints(result.redeemedLoyaltyPoints);
          // }
        }
      });
  }
}
