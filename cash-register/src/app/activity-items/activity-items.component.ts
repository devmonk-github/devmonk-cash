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
  types: Array<any> = ['purchase-order-retailer', 'purchase-order-supplier', 'sales-order', 'cash-registry', 'webshop']
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
    // this.openActivities({
    //   "iBusinessId": "6182a52f1949ab0a59ff4e7b",
    //   "iCustomerId": "62420be55777d556346a9484",
    //   "sNumber": "A1627-071022-1753",
    //   "dCreatedDate": "2022-10-07T12:23:55.723Z",
    //   "eStatus": "y",
    //   "_id": "63401a5b5a265131006dda7b",
    //   "count": {
    //     "totalData": 1639
    //   },
    //   "activityitems": [
    //     {
    //       "_id": "63401a5c5a265131006dda82",
    //       "oType": {
    //         "bPrepayment": true,
    //         "eTransactionType": "cash-registry",
    //         "bRefund": false,
    //         "eKind": "repair",
    //         "bDiscount": false
    //       },
    //       "eStatus": "y",
    //       "bIsRefunded": false,
    //       "eEstimatedDateAction": "call_on_ready",
    //       "aImage": [],
    //       "nSavingsPoints": 2,
    //       "bImported": false,
    //       "sProductName": "Repair",
    //       "nPriceIncVat": 47,
    //       "nVatRate": 21,
    //       "nQuantity": 1,
    //       "iBusinessId": "6182a52f1949ab0a59ff4e7b",
    //       "iArticleGroupId": "62df8699e0fe7580bed87c83",
    //       "iArticleGroupOriginalId": "62df8699e0fe7580bed87c83",
    //       "oArticleGroupMetaData": {
    //         "aProperty": [
    //           {
    //             "iPropertyId": "61160712ae3cbb7453177f98",
    //             "iPropertyOptionId": "61f01aa45fc7504de957b258",
    //             "sPropertyOptionName": "WATCH",
    //             "sPropertyName": "Category",
    //             "sCode": "WA"
    //           },
    //           {
    //             "iPropertyId": "6261a5f76d3ec230f0886eee",
    //             "iPropertyOptionId": "62e8bd09c2910b2073515bad",
    //             "sPropertyOptionName": "TITANIUM",
    //             "sPropertyName": "Watch case material",
    //             "sCode": "TI"
    //           }
    //         ],
    //         "sCategory": "Repair",
    //         "sSubCategory": "Repair",
    //         "oName": {
    //           "nl": "Repair",
    //           "en": "Repair",
    //           "de": "Repair",
    //           "fr": "Repair"
    //         }
    //       },
    //       "iBusinessBrandId": "623b1562b376430e5a5c2376",
    //       "iWorkstationId": "632ac16d10f3247770f75236",
    //       "sBagNumber": "4567",
    //       "iSupplierId": "61fcff54fb7d0e4b20e96bb5",
    //       "iTransactionId": "63401a5b5a265131006dda7a",
    //       "sUniqueIdentifier": "0a1f44d9-4173-44e5-8920-bed4e202b525",
    //       "nRevenueAmount": 11.85,
    //       "sDescription": "Necklace repair",
    //       "sServicePartnerRemark": "",
    //       "eActivityItemStatus": "new",
    //       "iCustomerId": "62420be55777d556346a9484",
    //       "iActivityId": "63401a5b5a265131006dda7b",
    //       "iBusinessPartnerId": "61fcff54fb7d0e4b20e96bb5",
    //       "aLog": [],
    //       "nTotalAmount": 47,
    //       "nPaidAmount": 27.65,
    //       "sNumber": "AI2636-071022-1753",
    //       "iTransactionItemId": "63401eb85a265131006ddaaf",
    //       "nCostOfRevenue": 9.4,
    //       "nProfitOfRevenue": 0,
    //       "dCreatedDate": "2022-10-07T12:23:56.191Z",
    //       "dUpdatedDate": "2022-10-07T12:42:32.497Z",
    //       "__v": 0
    //     },
    //     {
    //       "_id": "63401a5c5a265131006dda7f",
    //       "oType": {
    //         "bPrepayment": true,
    //         "eTransactionType": "cash-registry",
    //         "bRefund": false,
    //         "eKind": "repair",
    //         "bDiscount": false
    //       },
    //       "eStatus": "y",
    //       "bIsRefunded": false,
    //       "eEstimatedDateAction": "call_on_ready",
    //       "aImage": [],
    //       "nSavingsPoints": 2,
    //       "bImported": false,
    //       "sProductName": "Repair",
    //       "nPriceIncVat": 48,
    //       "nVatRate": 21,
    //       "nQuantity": 1,
    //       "iBusinessId": "6182a52f1949ab0a59ff4e7b",
    //       "iArticleGroupId": "62df8699e0fe7580bed87c83",
    //       "iArticleGroupOriginalId": "62df8699e0fe7580bed87c83",
    //       "oArticleGroupMetaData": {
    //         "aProperty": [
    //           {
    //             "iPropertyId": "61160712ae3cbb7453177f98",
    //             "iPropertyOptionId": "61f01aa45fc7504de957b258",
    //             "sPropertyOptionName": "WATCH",
    //             "sPropertyName": "Category",
    //             "sCode": "WA"
    //           },
    //           {
    //             "iPropertyId": "6261a5f76d3ec230f0886eee",
    //             "iPropertyOptionId": "62e8bd09c2910b2073515bad",
    //             "sPropertyOptionName": "TITANIUM",
    //             "sPropertyName": "Watch case material",
    //             "sCode": "TI"
    //           }
    //         ],
    //         "sCategory": "Repair",
    //         "sSubCategory": "Repair",
    //         "oName": {
    //           "nl": "Repair",
    //           "en": "Repair",
    //           "de": "Repair",
    //           "fr": "Repair"
    //         }
    //       },
    //       "iBusinessBrandId": "62b426627ee2c637cc3879d5",
    //       "iWorkstationId": "632ac16d10f3247770f75236",
    //       "sBagNumber": "1234",
    //       "iSupplierId": "61fcff54fb7d0e4b20e96bb5",
    //       "iTransactionId": "63401a5b5a265131006dda7a",
    //       "sUniqueIdentifier": "e025ce55-2fa3-46a7-97e1-d686a8b32209",
    //       "nRevenueAmount": 12.1,
    //       "sDescription": "",
    //       "sServicePartnerRemark": "",
    //       "eActivityItemStatus": "new",
    //       "iCustomerId": "62420be55777d556346a9484",
    //       "iActivityId": "63401a5b5a265131006dda7b",
    //       "iBusinessPartnerId": "61fcff54fb7d0e4b20e96bb5",
    //       "aLog": [],
    //       "nTotalAmount": 48,
    //       "nPaidAmount": 28.229999999999997,
    //       "sNumber": "AI2635-071022-1753",
    //       "iTransactionItemId": "63401eb85a265131006ddab3",
    //       "nCostOfRevenue": 9.600000000000001,
    //       "nProfitOfRevenue": 0,
    //       "dCreatedDate": "2022-10-07T12:23:56.191Z",
    //       "dUpdatedDate": "2022-10-07T12:42:32.730Z",
    //       "__v": 0
    //     },
    //     {
    //       "_id": "63401a5c5a265131006dda85",
    //       "oType": {
    //         "bPrepayment": true,
    //         "eTransactionType": "cash-registry",
    //         "bRefund": false,
    //         "eKind": "order",
    //         "bDiscount": false
    //       },
    //       "eStatus": "y",
    //       "bIsRefunded": false,
    //       "eEstimatedDateAction": "email_on_ready",
    //       "aImage": [],
    //       "nSavingsPoints": 28,
    //       "bImported": false,
    //       "sProductName": "green ring",
    //       "nPriceIncVat": 500,
    //       "nVatRate": 21,
    //       "nQuantity": 1,
    //       "iBusinessId": "6182a52f1949ab0a59ff4e7b",
    //       "iArticleGroupId": "62821497b7efe8158849dec0",
    //       "iArticleGroupOriginalId": "631f46857ac07d4fe8309278",
    //       "oArticleGroupMetaData": {
    //         "aProperty": [
    //           {
    //             "iPropertyId": "61160712ae3cbb7453177f98",
    //             "iPropertyOptionId": "61f01aa45fc7504de957b258",
    //             "sPropertyOptionName": "WATCH",
    //             "sPropertyName": "Category",
    //             "sCode": "WA"
    //           },
    //           {
    //             "iPropertyId": "6261a5f76d3ec230f0886eee",
    //             "iPropertyOptionId": "62e8bd09c2910b2073515bad",
    //             "sPropertyOptionName": "TITANIUM",
    //             "sPropertyName": "Watch case material",
    //             "sCode": "TI"
    //           }
    //         ],
    //         "sCategory": "Ordered products",
    //         "sSubCategory": "Ordered products",
    //         "oName": {
    //           "nl": "Ordered products",
    //           "en": "Ordered products",
    //           "de": "Ordered products",
    //           "fr": "Ordered products"
    //         }
    //       },
    //       "iBusinessBrandId": "62b426627ee2c637cc3879d5",
    //       "iWorkstationId": "632ac16d10f3247770f75236",
    //       "iSupplierId": "61fcff54fb7d0e4b20e96bb5",
    //       "iTransactionId": "63401a5b5a265131006dda7a",
    //       "sUniqueIdentifier": "8de01c60-af66-4ed6-80c0-75cc1a2e452f",
    //       "nRevenueAmount": 126.05,
    //       "sDescription": "I ordered this green ring from excellent supplier and it will arrive next week",
    //       "sServicePartnerRemark": "",
    //       "iCustomerId": "62420be55777d556346a9484",
    //       "iActivityId": "63401a5b5a265131006dda7b",
    //       "iBusinessPartnerId": "61fcff54fb7d0e4b20e96bb5",
    //       "aLog": [],
    //       "nTotalAmount": 500,
    //       "nPaidAmount": 294.12,
    //       "sNumber": "AI2637-071022-1753",
    //       "iTransactionItemId": "63401eb85a265131006ddaba",
    //       "nCostOfRevenue": 99.99999999999999,
    //       "nProfitOfRevenue": 0,
    //       "dCreatedDate": "2022-10-07T12:23:56.191Z",
    //       "dUpdatedDate": "2022-10-07T12:42:32.979Z",
    //       "__v": 0
    //     },
    //     {
    //       "_id": "634021ab5a265131006ddada",
    //       "oType": {
    //         "bPrepayment": false,
    //         "eTransactionType": "cash-registry",
    //         "bRefund": false,
    //         "eKind": "regular",
    //         "bDiscount": false
    //       },
    //       "eStatus": "y",
    //       "bIsRefunded": false,
    //       "eEstimatedDateAction": "call_on_ready",
    //       "aImage": [
    //         "https://prismanote.s3.amazonaws.com/A00301-05.jpg"
    //       ],
    //       "nSavingsPoints": 20,
    //       "bImported": false,
    //       "sProductName": "p8-151",
    //       "nPriceIncVat": 200,
    //       "nVatRate": 21,
    //       "nQuantity": 1,
    //       "iBusinessPartnerId": "6275661d5732a79bf0e3f449",
    //       "iBusinessId": "6182a52f1949ab0a59ff4e7b",
    //       "iArticleGroupId": "631f46857ac07d4fe8309278",
    //       "iArticleGroupOriginalId": "631f46857ac07d4fe8309278",
    //       "oArticleGroupMetaData": {
    //         "aProperty": [
    //           {
    //             "iPropertyId": "61160712ae3cbb7453177f98",
    //             "sPropertyName": "Category",
    //             "sPropertyOptionName": "WATCH",
    //             "iPropertyOptionId": "61f01aa45fc7504de957b258",
    //             "sCode": "WA"
    //           },
    //           {
    //             "iPropertyId": "6261a5f76d3ec230f0886eee",
    //             "sPropertyName": "Watch case material",
    //             "sPropertyOptionName": "TITANIUM",
    //             "iPropertyOptionId": "62e8bd09c2910b2073515bad",
    //             "sCode": "TI"
    //           }
    //         ],
    //         "oName": {
    //           "nl": "Prisma127",
    //           "en": "Prisma127",
    //           "de": "Prisma127",
    //           "fr": "Prisma127"
    //         }
    //       },
    //       "iBusinessBrandId": "62b426627ee2c637cc3879d5",
    //       "iWorkstationId": "632ac16d10f3247770f75236",
    //       "iSupplierId": "6275661d5732a79bf0e3f449",
    //       "iTransactionId": "634021aa5a265131006ddad7",
    //       "sUniqueIdentifier": "9ab2a701-c7f5-4a28-abc5-9b5473f69fac",
    //       "nRevenueAmount": 200,
    //       "sDescription": "asdfasdf",
    //       "iCustomerId": "62420be55777d556346a9484",
    //       "iActivityId": "63401a5b5a265131006dda7b",
    //       "aLog": [],
    //       "nTotalAmount": 200,
    //       "nPaidAmount": 200,
    //       "sNumber": "AI2638-071022-1825",
    //       "iTransactionItemId": "634021ab5a265131006ddad9",
    //       "nCostOfRevenue": 100,
    //       "nProfitOfRevenue": 65.28925619834712,
    //       "dCreatedDate": "2022-10-07T12:55:07.117Z",
    //       "dUpdatedDate": "2022-10-07T12:55:07.117Z",
    //       "__v": 0
    //     },
    //     {
    //       "_id": "634021b05a265131006ddae0",
    //       "oType": {
    //         "bPrepayment": false,
    //         "eTransactionType": "cash-registry",
    //         "bRefund": false,
    //         "eKind": "giftcard",
    //         "bDiscount": false
    //       },
    //       "eStatus": "y",
    //       "bIsRefunded": false,
    //       "eEstimatedDateAction": "call_on_ready",
    //       "aImage": [],
    //       "nSavingsPoints": 8,
    //       "bImported": false,
    //       "sProductName": "Giftcard",
    //       "nPriceIncVat": 84,
    //       "nVatRate": 21,
    //       "nQuantity": 1,
    //       "iBusinessId": "6182a52f1949ab0a59ff4e7b",
    //       "iArticleGroupId": "6284c08939f87a6ddafcfc96",
    //       "iArticleGroupOriginalId": "6284c08939f87a6ddafcfc96",
    //       "oArticleGroupMetaData": {
    //         "aProperty": [],
    //         "sCategory": "Giftcard",
    //         "sSubCategory": "Repair"
    //       },
    //       "sGiftCardNumber": "1665147271561",
    //       "iWorkstationId": "632ac16d10f3247770f75236",
    //       "iTransactionId": "634021aa5a265131006ddad7",
    //       "sUniqueIdentifier": "cccef1d7-3cc3-486f-9b22-56c40c1d02eb",
    //       "nRevenueAmount": 84,
    //       "sDescription": "",
    //       "sServicePartnerRemark": "",
    //       "eActivityItemStatus": "new",
    //       "bGiftcardTaxHandling": true,
    //       "iCustomerId": "62420be55777d556346a9484",
    //       "iActivityId": "63401a5b5a265131006dda7b",
    //       "iBusinessPartnerId": "6282aaabc3165b444f14dac9",
    //       "aLog": [],
    //       "nTotalAmount": 84,
    //       "nPaidAmount": 84,
    //       "sNumber": "AI2639-071022-1825",
    //       "iTransactionItemId": "634021b05a265131006ddadf",
    //       "nCostOfRevenue": 69.42148760330579,
    //       "nProfitOfRevenue": 0,
    //       "dCreatedDate": "2022-10-07T12:55:12.896Z",
    //       "dUpdatedDate": "2022-10-07T12:55:12.896Z",
    //       "__v": 0
    //     }
    //   ],
    //   "oCustomer": {
    //     "sFirstName": "Jolmer",
    //     "sPrefix": "Van",
    //     "sLastName": "Ekeren2"
    //   }
    // });
  }

  loadTransaction() {
    this.activityItems = [];
    this.requestParams.iBusinessId = this.businessDetails._id;
    this.requestParams.limit = this.paginationConfig.itemsPerPage || 50;
    if (this.iLocationId) this.requestParams.iLocationId = this.iLocationId;
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

  openActivities(activity: any, openActivityId?:any) {
    console.log('opening ActivityDetailsComponent with',activity);
    
    this.dialogService.openModal(ActivityDetailsComponent, { cssClass: 'w-fullscreen', context: { activity: activity, openActivityId, items: true, from: 'activity-items' } })
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
