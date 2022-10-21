import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faLongArrowAltDown, faLongArrowAltUp, faMinusCircle, faPlus, faPlusCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
import { ActivityDetailsComponent } from '../shared/components/activity-details-dialog/activity-details.component';
import { CardsComponent } from '../shared/components/cards-dialog/cards-dialog.component';
import { ToastService } from '../shared/components/toast';
import { WebOrderDetailsComponent } from '../shared/components/web-order-details/web-order-details.component';
import { ApiService } from '../shared/service/api.service';
import { DialogService } from '../shared/service/dialog';
import { MenuComponent } from '../shared/_layout/components/common';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.sass']
})
export class ServicesComponent implements OnInit, AfterViewInit {

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
    transactionStatuses: ['new', 'processing', 'cancelled', 'inspection', 'completed', 'refund', 'refundInCashRegister'],
    selectedTransactionStatuses: [],
    locations: [],
    selectedLocations: [],
    searchValue: '',
    sortBy: { key: 'Date', selected: true, sort: 'asc' },
    sortOrder: 'asc'
  };
  showLoader: Boolean = false;
  widgetLog: string[] = [];
  pageCounts: Array<number> = [10, 25, 50, 100]
  pageCount: number = 10;
  pageNumber: number = 1;
  setPaginateSize: number = 10;
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
  transactionTypes: Array<any> = ['All', 'Refund', 'Repair', 'Gold-purchase', 'Gold-sale', 'order', 'giftcard', 'offer'];
  transactionStatus: string = 'all';
  invoiceStatus: string = 'all';
  importStatus: string = 'all';
  methodValue: string = 'All';
  transactionValue: string = 'All';
  employee: any = { sFirstName: 'All' };
  employees: Array<any> = [this.employee];
  workstations: Array<any> = [];
  selectedWorkstations: Array<any> = [];
  iLocationId: String | null | undefined;
  webOrders: Boolean = false;

  tableHeaders: Array<any> = [
    { key: 'Activity No.', selected: false, sort: '' },
    { key: 'Repair number', disabled: true },
    { key: 'Type', disabled: true },
    { key: 'Intake date', selected: true, sort: 'desc' },
    { key: 'End date', selected: false, sort: 'desc', sValue: 'dEstimatedDate' },
    { key: 'Status', disabled: true },
    { key: 'Supplier/Repairer', disabled: true },
    { key: 'Partner supplier status', disabled: true },
    { key: 'Customer', disabled: true },
    { key: 'Actions' },
  ]

  constructor(
    private apiService: ApiService,
    private dialogService: DialogService,
    private routes: Router,
    private toastrService: ToastService
  ) { }


  async ngOnInit(): Promise<void> {
    if (this.routes.url.includes('/business/webshop-orders')) {
      this.webOrders = true;
      this.requestParams.eType = ['webshop-revenue', 'webshop-reservation']
    }
    this.businessDetails._id = localStorage.getItem('currentBusiness');
    this.iLocationId = localStorage.getItem('currentLocation');
    console.log('this.iLocationId: ', this.iLocationId);
    this.userType = localStorage.getItem('type');
    this.iBusinessId = localStorage.getItem('currentBusiness');

    this.showLoader = true;
    await this.setLocation() /* For web-orders, we will switch to the web-order location otherwise keep current location */
    this.showLoader = false
    this.loadTransaction();
    this.listEmployee();
    this.getWorkstations();

  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      MenuComponent.reinitialization();
    }, 200);
  }


  // Function for handle event of transaction menu
  clickMenuOpt(key: string, transactionId: string) {

  }

  getTypes(arr: any) {
    let str = '';
    if (arr && arr.length) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i]?.oArticleGroupMetaData?.sCategory) {
          if (!str) { str += (arr[i]?.oArticleGroupMetaData?.sCategory) }
          else { str += (', ' + arr[i]?.oArticleGroupMetaData?.sCategory) }
        }
      }
    }
    return str;
  }
  getBusinessLocations() {
    return new Promise<any>((resolve, reject) => {

      this.apiService.getNew('core', '/api/v1/business/user-business-and-location/list')
        .subscribe((result: any) => {
          // console.log({ getBusinessLocations: result });
          if (result.message == "success" && result?.data) {

            resolve(result);
          }
          resolve(null);
        }, (error) => {
          resolve(error);
          console.error('error: ', error);
        })
    })

  }
  async getLocations() {
    return new Promise<any>((resolve, reject) => {
      this.apiService.postNew('core', `/api/v1/business/${this.iBusinessId}/list-location`, {}).subscribe(
        (result: any) => {
          // console.log({ getLocations: result });
          if (result.message == 'success') {
            this.requestParams.locations = result.data.aLocation;
            // console.log({ requestParams: this.requestParams.locations });
          }
          resolve(result);
        }),
        (error: any) => {
          reject(error);
          console.error(error)
        }
    })
  }
  async setLocation(sLocationId: string = "") {
    return new Promise<void>(async (resolve, reject) => {
      this.iLocationId = sLocationId ?? (localStorage.getItem('currentLocation') ?? '')
      try {
        const oBusinessLocation: any = await this.getBusinessLocations()
        let oNewLocation: any
        let bIsCurrentBIsWebshop = false
        for (let k = 0; k < oBusinessLocation?.data?.aBusiness?.length; k++) {
          const oAllLocations = oBusinessLocation?.data?.aBusiness[k]  
          for (let i = 0; i < oAllLocations?.aLocation?.length; i++) {
            const l = oAllLocations?.aLocation[i];
            if (l.bIsWebshop) oNewLocation = l
            if (l._id.toString() === this.iLocationId) {
              if (l.bIsWebshop) {
                bIsCurrentBIsWebshop = true
                this.iLocationId = l._id.toString()
                break
              }
            }
          }
        }
        if (!bIsCurrentBIsWebshop) {
          this.iLocationId = oNewLocation._id.toString()
        }
        resolve()
      } catch (error) {
        resolve()
      }
    })
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


  //  Function for set sort option on transaction table
  setSortOption(sortHeader: any) {
    console.log('setSortOption: ', sortHeader);
    if (sortHeader.selected) {
      sortHeader.sort = sortHeader.sort == 'desc' ? 'asc' : 'desc';
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
    if (sortHeader.key == 'End date') sortBy = 'dEstimatedDate';
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

  openActivities(activity: any, openActivityId?: any) {
    console.log('opening ActivityDetailsComponent with', activity);
    if (this.webOrders) {
      this.dialogService.openModal(WebOrderDetailsComponent, { cssClass: 'w-fullscreen', context: { activity, from: 'web-orders' } })
        .instance.close.subscribe(result => {
          if (this.webOrders && result) this.routes.navigate(['business/till']);
        });
    } else {
      this.dialogService.openModal(ActivityDetailsComponent, { cssClass: 'w-fullscreen', context: { activity, openActivityId, items: false, webOrders: this.webOrders, from: 'services' } })
        .instance.close.subscribe(result => {
          if (this.webOrders && result) this.routes.navigate(['business/till']);
        });
    }
  }

  loadTransaction() {
    if (this.routes.url.includes('/business/webshop-orders')) {
      this.requestParams.eType = ['webshop-revenue', 'webshop-reservation']
    } else {
      this.requestParams.eType = ['cash-register-service', 'cash-register-revenue']
    }
    this.activities = [];
    this.requestParams.iBusinessId = this.businessDetails._id;
    this.requestParams.skip = this.requestParams.skip || 0;
    this.requestParams.limit = this.paginationConfig.itemsPerPage || 50;
    this.requestParams.importStatus = this.importStatus;
    if (this.iLocationId) this.requestParams.iLocationId = this.iLocationId;
    this.showLoader = true;
    console.log('loadTransaction: ', this.iLocationId);
    this.apiService.postNew('cashregistry', '/api/v1/activities', this.requestParams).subscribe((result: any) => {
      if (result?.data?.length)
        this.activities = result?.data;
      else
        this.activities = [];
      this.paginationConfig.totalItems = result?.count;
      this.getCustomers();
      setTimeout(() => {
        MenuComponent.bootstrap();
        this.showLoader = false;
      }, 200);
    }, (error) => {
      this.showLoader = false;
    })
  }

  getCustomers() {
    const arr = [];
    for (let i = 0; i < this.activities.length; i++) {
      if (this.activities[i].iCustomerId && arr.indexOf(this.activities[i].iCustomerId) < 0) arr.push(this.activities[i].iCustomerId);
    }

    const body = {
      iBusinessId: this.iBusinessId,
      arr: arr,
    }

    this.apiService.postNew('customer', '/api/v1/customer/list', body)
      .subscribe(async (result: any) => {
        const customers = result.data[0].result || [];
        for (let i = 0; i < this.activities.length; i++) {
          for (let j = 0; j < customers.length; j++) {
            if (this.activities[i]?.iCustomerId?.toString() == customers[j]?._id?.toString()) {
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
        const activityResult: any = await this.apiService.postNew('cashregistry', '/api/v1/activities', oBody).toPromise();
        console.log({ activityResult });

        // const oActivityItem = activityItemResult?.data[0].result[0]._id;
        // console.log({ oActivityItem });
        // const activityItemsResult: any = await this.apiService.postNew('cashregistry', `/api/v1/activities/items/${iActivityId}`, {iBusinessId: this.businessDetails._id}).toPromise();
        // console.log({ activityItemsResult });
        if (activityResult.data?.length) {
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

  openCardsModal(oGiftcard?: any, oCustomer?: any) {
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
