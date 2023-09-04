import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, UrlSerializer, ActivatedRoute } from '@angular/router';
import { faLongArrowAltDown, faLongArrowAltUp, faMinusCircle, faPlusCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { ActivityDetailsComponent } from '../shared/components/activity-details-dialog/activity-details.component';
import { CardsComponent } from '../shared/components/cards-dialog/cards-dialog.component';
import { ToastService } from '../shared/components/toast';
import { ApiService } from '../shared/service/api.service';
import { BarcodeService } from '../shared/service/barcode.service';
import { DialogService } from '../shared/service/dialog';
import { MenuComponent } from '../shared/_layout/components/common';
import { ActivityItemExportComponent } from '../shared/components/activity-item-export/activity-item-export.component';
import { TillService } from '../shared/service/till.service';

@Component({
  selector: 'app-testfilter',
  templateUrl: './testfilter.component.html',
  styleUrls: ['./testfilter.component.sass'],
  providers: [BarcodeService]
})
export class TestFilterComponent implements OnInit, OnDestroy {
  
  pageCounts: Array<number> = [10, 25, 50, 100]
  pageCount: number = 10;
  pageNumber: number = 1;
  setPaginateSize: number = 10;
  paginationConfig: any = {
    itemsPerPage: '10',
    currentPage: 1,
    totalItems: 0
  };
  importStatus: string = 'all';
  businessDetails: any = {};
  iLocationId: string;
  iBusinessId: string;

  requestParams: any = {
    create: {
      minDate: new Date('01-01-2015'),
      maxDate: new Date(new Date().setHours(23, 59, 59)),
    },
    estimate: {
      minDate: undefined,
      maxDate: undefined
    },
    // sortBy: { key: 'dCreatedDate', selected: true, sort: 'asc' },
    sortBy: 'dCreatedDate',
    sortOrder: 'desc',
    selectedRepairStatuses: [],
    selectedWorkstations: [],
    locations: [],
    selectedLocations: [],
    selectedKind: [],
    aSelectedBusinessPartner: [],
    iEmployeeId: '',
    iAssigneeId: '',
  };
  activityItems: Array<any> = [];
  showLoader: Boolean = false;
  faSearch = faSearch;
  faIncrease = faPlusCircle;
  faDecrease = faMinusCircle;
  faArrowUp = faLongArrowAltUp;
  faArrowDown = faLongArrowAltDown;
  sSearchValue: string = '';
  showAdvanceSearch = false;
  isDownloadEnable = false;
  type : string = '';


  workstations: Array<any> = [];
  employees: Array<any> = [];

  repairStatuses: Array<any> = [
    { key: 'NEW', value: 'new' },
    { key: 'INFO', value: 'info' },
    { key: 'PROCESSING', value: 'processing' },
    { key: 'CANCELLED', value: 'cancelled' },
    { key: 'INSPECTION', value: 'inspection' },
    { key: 'COMPLETED', value: 'completed' },
    { key: 'REFUND', value: 'refund' },
    { key: 'REFUNDINCASHREGISTER', value: 'refundInCashRegister' },
    { key: 'OFFER', value: 'offer' },
    { key: 'OFFER_IS_OK', value: 'offer-is-ok' },
    { key: 'OFFER_IS_NOT_OK', value: 'offer-is-not-ok' },
    { key: 'TO_REPAIR', value: 'to-repair' },
    { key: 'PART_ARE_ORDER', value: 'part-are-order' },
    { key: 'SHIPPED_TO_REPAIR', value: 'shipped-to-repair' },
    { key: 'DELIVERED', value: 'delivered' },
    { key: 'PRODUCT_ORDERED', value: 'product-ordered' },
    { key: 'ORDER_READY', value: 'order-ready' },
  ];

  aKind: Array<any> = [
    { key: 'RESERVATION', value: 'reservation' },
    { key: 'REPAIR', value: 'repair' },
    { key: 'GIFTCARD', value: 'giftcard' },
    { key: 'ORDER', value: 'order' },
    { key: 'GOLD_PURCHASE', value: 'gold-purchase' },
    { key: 'GOLD_SELL', value: 'gold-sell' },
    { key: 'OFFER', value: 'offer' },
    { key: 'REFUND', value: 'refund' }
  ]
  methodValue: string = 'All';
  transactionValue: string = 'All';
  aFilterBusinessPartner: any = [];

  tableHeaders: Array<any> = [
    { key: 'ACTIVITY_NO', selected: false, sort: 'asc' },
    { key: 'TYPE', disabled: true },
    { key: 'REPAIR_NUMBER', selected: false, sort: 'asc' },
    { key: 'INTAKE_DATE', selected: true, sort: 'asc' },
    { key: 'ESTIMATED_DATE', selected: false, sort: 'asc' },
    { key: 'STATUS', selected: false, sort: 'asc' },
    { key: 'SUPPLIER_REPAIRER', disabled: true },
    { key: 'CUSTOMER', disabled: true },
    { key: 'ACTION', disabled: true }
  ]

  selectedProperties: any;
  propertyOptions: Array<any> = [];
  aPropertyOptionIds: Array<any> = [];
  aProperty: Array<any> = [];
  propertyListSubscription!: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private dialogService: DialogService,
    private routes: Router,
    private toastrService: ToastService,
    private barcodeService: BarcodeService,
    private serializer: UrlSerializer,
    public tillService: TillService
  ) {

    this.activatedRoute.queryParams.subscribe(params => {
      let data1 = params['from_end_date'];
      let data2 = params['to_end_date'];
      let data3 = params['type'];
      let data5 = params['from_create_date'];
      let data6 = params['to_create_date'];
      let data7 = params['assignee'];

      if(data3 == undefined){
        data3 = 'repair';
      }
      this.type = data3;
      //console.log("this.type", this.type);
      var fromdate = new Date();
      fromdate = new Date(fromdate.getTime());
      fromdate.setDate(fromdate.getDate() - 365);
      let fromDate = this.convert(fromdate);
      let ToDate = this.convert(new Date());
      const queryParams: any = {
        //type: ['repair','order','gold-purchase','reservation','giftcard','gold-sell','refund'],
        from_create_date: fromDate,
        to_create_date: ToDate,
        from_end_date: fromDate,
        to_end_date: ToDate,
        assignee: "",
        // repair_status: ['new','processing','inspection','completed','delivered','cancelled','refund','refundInCashRegister',
        // 'offer','offer-is-ok','offer-is-not-ok','to-repair','part-are-order','shipped-to-repair']
      };

      if (data3 == 'repair') {
        queryParams.type = "repair";
        const tree = routes.createUrlTree([], { queryParams });
        //console.log(serializer.serialize(tree));
        this.routes.navigate(
          ['/business/testfilter'],
          { queryParams: queryParams }
        );
      }
      if (data3 == 'gold-purchase') {
        queryParams.type = "gold-purchase";
        const tree = routes.createUrlTree([], { queryParams });
        this.routes.navigate(
          ['/business/testfilter'],
          { queryParams: queryParams }
        );
      }

      if (data3 == 'order') {
        queryParams.type = "order";
        const tree = routes.createUrlTree([], { queryParams });
        this.routes.navigate(
          ['/business/testfilter'],
          { queryParams: queryParams }
        );
      }
      if (data3 == 'giftcard') {
        queryParams.type = "giftcard";
        const tree = routes.createUrlTree([], { queryParams });
        this.routes.navigate(
          ['/business/testfilter'],
          { queryParams: queryParams }
        );
      }
      this.apiService.setToastService(this.toastrService);
      this.iBusinessId = localStorage.getItem('currentBusiness') || "";
      this.iLocationId = localStorage.getItem('currentLocation') || "";
      if (typeof data3 == "string") {
        this.requestParams.selectedKind = [data3];
      } else {
        this.requestParams.selectedKind = data3;
      }
      if (data3 == "giftcard" || data3 == "order" || data3 == "gold-purchase" || data3 == "repair") {
        this.requestParams.estimate = { minDate: "", maxDate: "" };
      } else {
        if (data1 == undefined && data2 == undefined) {
          let estimate = { minDate: queryParams.from_end_date, maxDate: queryParams.to_end_date };
          this.requestParams.estimate = estimate;
        } else {
          let estimate = { minDate: data1, maxDate: data2 };
          this.requestParams.estimate = estimate;
        }
      }

      if (data5 == undefined && data6 == undefined) {
        let create = { minDate: new Date(queryParams.from_create_date), maxDate: new Date(new Date(queryParams.to_create_date).setHours(23, 59, 59)) };
        this.requestParams.create = create;
      } else {
        let create = { minDate: new Date(data5), maxDate: new Date(new Date(data6).setHours(23, 59, 59)) };
        this.requestParams.create = create;
      }
      if (data7 == undefined) {
        this.requestParams.iAssigneeId = queryParams.assignee;
      } else {
        this.requestParams.iAssigneeId = data7;
      }
      this.loadTransaction();
    });

  }

  async ngOnInit() {
    this.apiService.setToastService(this.toastrService);
    this.iBusinessId = localStorage.getItem('currentBusiness') || "";
    this.iLocationId = localStorage.getItem('currentLocation') || "";
    this.type = this.type;
    this.fetchBusinessDetails();
    this.loadTransaction();

    this.apiService.activityItemDetails.subscribe((res: any) => {
      let updatedActivityIndex = this.activityItems.findIndex((activity) => activity._id == res._id)
      if (updatedActivityIndex != -1) {
        this.activityItems[updatedActivityIndex] = res;
      }
    })

    this.getProperties();
    this.getLocations()
    this.getWorkstations()
    this.listEmployee()

    this.barcodeService.barcodeScanned.subscribe((barcode: string) => {
      this.openModal(barcode);
    });
  }

  convert(str:any) {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [date.getFullYear(), mnth, day].join("-");
  }
  fetchBusinessDetails() {
    this.apiService.getNew('core', '/api/v1/business/' + this.iBusinessId)
      .subscribe(
        (result: any) => {
          this.businessDetails = result.data;
          this.businessDetails.currentLocation = this.businessDetails?.aLocation?.filter((location: any) => location?._id.toString() == this.iLocationId.toString())[0];
          this.tillService.selectCurrency(this.businessDetails.currentLocation);
        })
  }
  

  // Function for reset selected filters
  resetFilters() {
    this.sSearchValue = "";
    this.requestParams = {
      create: {
        minDate: new Date('01-01-2015'),
        maxDate: new Date(new Date().setHours(23, 59, 59)),
      },
      estimate: {
        minDate: undefined,
        maxDate: undefined
      },

      sortBy: 'dCreatedDate',
      sortOrder: 'desc',
      selectedRepairStatuses: [],
      selectedWorkstations: [],
      locations: [],
      selectedLocations: [],
      selectedKind: [this.type],
      aSelectedBusinessPartner: [],
      iEmployeeId: '',
      iAssigneeId: '',
    };
    this.showAdvanceSearch = false;
    this.loadTransaction();
  }

  loadTransaction(isPageChanged?: boolean) {
    this.activityItems = [];
    if (this.requestParams.sSearchValue && !isPageChanged) this.resetThePagination();
    this.requestParams.iBusinessId = this.iBusinessId;
    this.requestParams.limit = this.paginationConfig.itemsPerPage || 50;
    if (this.requestParams?.selectedKind?.length) this.requestParams.selectedKind = this.requestParams.selectedKind

    if (this.iLocationId) this.requestParams.iLocationId = this.iLocationId;
    const oBody = { ... this.requestParams }
    oBody.aPropertyOptionIds = this.aPropertyOptionIds;
    oBody.importStatus = this.importStatus == 'all' ? undefined : this.importStatus;
    oBody.sSearchValue = this.sSearchValue;
    this.showLoader = true;
    this.apiService.postNew('cashregistry', '/api/v1/activities/items', oBody).subscribe(
      (result: any) => {
        this.isDownloadEnable = true;
        this.activityItems = result.data;
        this.paginationConfig.totalItems = result.count;
        this.showLoader = false;
        this.fetchBusinessPartnerName();
        setTimeout(() => {
          MenuComponent.bootstrap();
        }, 200);
        if (result?.aUniqueBusinessPartner?.length && !this.aFilterBusinessPartner?.length) this.aFilterBusinessPartner = result.aUniqueBusinessPartner;
      },
      (error: any) => {
        this.showLoader = false;
      })
  }
  fetchBusinessPartnerName() {
    var body = {
      iBusinessId: this.iBusinessId
    };
    this.apiService.postNew('core', '/api/v1/business/partners/list', body).subscribe((result: any) => {
      if (result?.data?.length && result.data[0]?.result?.length) {
        let partnersList = result.data[0].result;
        partnersList.forEach((partner: any) => {
          this.activityItems.forEach((activity: any) => {
            if (partner._id == activity.iBusinessPartnerId) {
              activity.sBusinessPartnerName = partner?.sName;
            }
          });
        })
      }
    })
  }

  openActivities(activity: any, openActivityId?: any) {
    this.dialogService.openModal(ActivityDetailsComponent,
      {
        cssClass: 'w-fullscreen mt--5',
        hasBackdrop: true,
        closeOnBackdropClick: true,
        closeOnEsc: true,
        context: {
          activityItems: [activity],
          businessDetails: this.businessDetails,
          openActivityId,
          items: true,
          employeesList: this.employees,
          from: 'activity-items'
        }
      }).instance.close.subscribe((result) => {
        if (result?.oData?.oCurrentCustomer) {
          activity.oCustomer._id = result && result.oData && result.oData.oCurrentCustomer && result.oData.oCurrentCustomer._id ? result.oData.oCurrentCustomer._id : activity.oCustomer._id;
          activity.iCustomerId = result && result.oData && result.oData.oCurrentCustomer && result.oData.oCurrentCustomer._id ? result.oData.oCurrentCustomer._id : activity.iCustomerId;
          activity.oCustomer.bIsCompany = result && result.oData && result.oData.oCurrentCustomer && result.oData.oCurrentCustomer.bIsCompany ? result.oData.oCurrentCustomer.bIsCompany:false;
          activity.oCustomer.sFirstName = result && result.oData && result.oData.oCurrentCustomer && result.oData.oCurrentCustomer.sFirstName ? result.oData.oCurrentCustomer.sFirstName:"";
          activity.oCustomer.sLastName = result && result.oData && result.oData.oCurrentCustomer && result.oData.oCurrentCustomer.sLastName ? result.oData.oCurrentCustomer.sLastName:"";
          activity.oCustomer.sSalutation = result && result.oData && result.oData.oCurrentCustomer && result.oData.oCurrentCustomer.sSalutation ? result.oData.oCurrentCustomer.sSalutation:"";
          activity.oCustomer.sPrefix = result && result.oData && result.oData.oCurrentCustomer && result.oData.oCurrentCustomer.sPrefix ? result.oData.oCurrentCustomer.sPrefix:"";
          activity.oCustomer.sEmail = result && result.oData && result.oData.oCurrentCustomer && result.oData.oCurrentCustomer.sEmail ? result.oData.oCurrentCustomer.sEmail:"";
          activity.oCustomer.sGender = result && result.oData && result.oData.oCurrentCustomer && result.oData.oCurrentCustomer.sGender ? result.oData.oCurrentCustomer.sGender:"";
          activity.oCustomer.sVatNumber = result && result.oData && result.oData.oCurrentCustomer && result.oData.oCurrentCustomer.sVatNumber ? result.oData.oCurrentCustomer.sVatNumber:"";
          activity.oCustomer.sCocNumber = result && result.oData && result.oData.oCurrentCustomer && result.oData.oCurrentCustomer.sCocNumber ? result.oData.oCurrentCustomer.sCocNumber:"";
          activity.oCustomer.nClientId = result && result.oData && result.oData.oCurrentCustomer && result.oData.oCurrentCustomer.nClientId ? result.oData.oCurrentCustomer.nClientId:"";
          activity.oCustomer.oContactPerson = result && result.oData && result.oData.oCurrentCustomer && result.oData.oCurrentCustomer.oContactPerson ? result.oData.oCurrentCustomer.oContactPerson:"";
          activity.oCustomer.sCompanyName = result && result.oData && result.oData.oCurrentCustomer && result.oData.oCurrentCustomer.sCompanyName ? result.oData.oCurrentCustomer.sCompanyName:"";
          activity.oCustomer.oShippingAddress = result && result.oData && result.oData.oCurrentCustomer && result.oData.oCurrentCustomer.oShippingAddress ? result.oData.oCurrentCustomer.oShippingAddress:"";
          activity.oCustomer.oInvoiceAddress = result && result.oData && result.oData.oCurrentCustomer && result.oData.oCurrentCustomer.oInvoiceAddress ? result.oData.oCurrentCustomer.oInvoiceAddress:"";
          activity.oCustomer.oPhone = result && result.oData && result.oData.oCurrentCustomer && result.oData.oCurrentCustomer.oPhone ? result.oData.oCurrentCustomer.oPhone:"";
          activity.oCustomer.bCounter = result && result.oData && result.oData.oCurrentCustomer && result.oData.oCurrentCustomer.bCounter ? result.oData.oCurrentCustomer.bCounter:false;
        }
      }, (error) => {
        console.log('Error here');
      });
  }

  openExportModel() {
    let header = [
      { key: 'ACTIVITY_NO', value: 'sNumber', width: '18%' },
      { key: 'CUSTOMER', value: 'oCustomer.sLastName', width: '10%' },
      { key: 'CITY', value: 'oCustomer.oInvoiceAddress.sCity', width: '10%' },
      { key: 'REPAIR_NUMBER', value: 'sBagNumber', width: '15%' },
      { key: 'COMMENT', value: 'sDescription', width: '15%' },
      { key: 'TOTAL_PRICE', value: 'nTotalAmount', width: '10%' },
      { key: 'CREATION_DATE', value: 'dCreatedDate', width: '10%' },
      { key: 'ESTIMATED_DATE', value: 'dEstimatedDate', width: '10%' },
      { key: 'DELIVERED_DATE', value: 'dActualFinishDate', width: '10%' },
      { key: 'EMPLOYEE', value: 'sEmployeeName', width: '7%' }
    ]
    if(this.type == 'giftcard') header = [
        { key: 'ACTIVITY_NO', value: 'sNumber', width: '20%' },
        { key: 'CUSTOMER', value: 'oCustomer.sLastName', width: '10%' },
        { key: 'COMMENT', value: 'sDescription', width: '11%' },
        { key: 'TOTAL_PRICE', value: 'nTotalAmount', width: '10%' },
        { key: 'CREATION_DATE', value: 'dCreatedDate', width: '10%' },
        { key: 'EMPLOYEE', value: 'sEmployeeName', width: '7%' },
        { key: 'REM_AMOUNT', value: 'nGiftcardRemainingAmount', width: '10%' },
        { key: 'STATUS', value: 'eActivityItemStatus', width: '10%' },
        { key: 'GIFTCARD_NUMBER', value: 'sGiftCardNumber', width: '20%' }
      ]

    this.dialogService.openModal(ActivityItemExportComponent, {
      cssClass: 'model-lg',
      closeOnEsc: true,
      context: {
        type:this.type,
        headerList: header,
        businessDetails: this.businessDetails,
        page: 'activityItem',
        aWorkStation: this.workstations,
        aLocation: this.requestParams.locations,
        aAssignee: this.employees,
        aBusinessPartner: this.aFilterBusinessPartner,
        requestParams: this.requestParams
      }
    }).instance.close.subscribe();
  }

  listEmployee() {
    this.apiService.postNew('auth', '/api/v1/employee/list', { iBusinessId: this.iBusinessId }).subscribe((result: any) => {
      if (result?.data?.length && result.data[0].result?.length) {
        this.employees = result.data[0].result
      }
    })
  }

  getLocations() {
    this.apiService.postNew('core', `/api/v1/business/${this.iBusinessId}/list-location`, {}).subscribe((result: any) => {
      if (result?.data?.aLocation?.length) {
        this.requestParams.locations = result.data.aLocation;
      }
    });
  }

  getWorkstations() {
    this.apiService.getNew('cashregistry', `/api/v1/workstations/list/${this.iBusinessId}/${this.iLocationId}`).subscribe((result: any) => {
      if (result?.data) {
        this.workstations = result.data;
      }
    });
  }

  resetThePagination() {
    this.requestParams.skip = 0;
    this.paginationConfig.currentPage = 1; 
    this.requestParams.limit = parseInt(this.paginationConfig.itemsPerPage);
  }
  
  // Function for update item's per page
  changeItemsPerPage() {
    this.resetThePagination();
    this.loadTransaction();
  }

  // Function for handle page change
  pageChanged(selctedPage: any) {
    this.requestParams.skip = (selctedPage - 1) * parseInt(this.paginationConfig.itemsPerPage);
    this.paginationConfig.currentPage = selctedPage;
    this.loadTransaction(true);
  }

  sortAndLoadTransactions(sortHeader: any) {
    let sortBy = 'dCreatedDate';
    if (sortHeader.key == 'ESTIMATED_DATE') sortBy = 'dEstimatedDate'
    else if (sortHeader.key == 'ACTIVITY_NO') sortBy = 'sNumber'
    else if (sortHeader.key == 'REPAIR_NUMBER') sortBy = 'sBagNumber'
    else if (sortHeader.key == 'STATUS') sortBy = 'eActivityItemStatus'
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
          th.sort = 'desc';
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
    if (barcode.startsWith('0002'))
      barcode = barcode.substring(4)
    if (barcode.startsWith("AI")) {
      this.toastrService.show({ type: 'success', text: 'Barcode detected: ' + barcode })
      let oBody: any = {
        iBusinessId: this.iBusinessId,
        oFilterBy: {
          sNumber: barcode
        }
      }
      const activityItemResult: any = await this.apiService.postNew('cashregistry', `/api/v1/activities/activity-item`, oBody).toPromise();
      if (activityItemResult?.data[0]?.result?.length) {

        const iActivityId = activityItemResult?.data[0].result[0].iActivityId;
        const iActivityItemId = activityItemResult?.data[0].result[0]._id;
        oBody = {
          iBusinessId: this.iBusinessId,
          oFilterBy: {
            _id: iActivityId
          }
        }
        const activityResult: any = await this.apiService.postNew('cashregistry', '/api/v1/activities', oBody).toPromise();

        if (activityResult.data?.length) {
          this.openActivities(activityResult.data[0], iActivityItemId);
        }
      }
    } else if (barcode.startsWith("A")) {
      this.toastrService.show({ type: 'success', text: 'Barcode detected: ' + barcode })
      let oBody = {
        iBusinessId: this.iBusinessId,
        oFilterBy: {
          sNumber: barcode
        }
      }
      const activityResult: any = await this.apiService.postNew('cashregistry', '/api/v1/activities', oBody).toPromise();

      if (activityResult.data?.length) {
        this.openActivities(activityResult.data[0]);
      }

      //activity.find({sNumber: barcode})
    } else if (barcode.startsWith("G")) {
      this.toastrService.show({ type: 'success', text: 'Barcode detected: ' + barcode })
      let oBody: any = {
        iBusinessId: this.iBusinessId,
        oFilterBy: {
          sGiftCardNumber: barcode.substring(2)
        }
      }
      let result: any = await this.apiService.postNew('cashregistry', `/api/v1/activities/activity-item`, oBody).toPromise();
      if (result?.data[0]?.result?.length) {
        const oGiftcard = result?.data[0]?.result[0];
        this.openCardsModal(oGiftcard)
      }
    } else if (barcode.startsWith("R")) {
    } else if (barcode.startsWith("T")) {
      this.toastrService.show({ type: 'warning', text: 'Please go to different page to process this barcode !' })
    }

  }

  openCardsModal(oGiftcard?: any, oCustomer?: any) {
    this.dialogService.openModal(CardsComponent, { cssClass: 'modal-lg', context: { customer: oCustomer, oGiftcard } })
      .instance.close.subscribe(result => {
      });
  }

  /* Property filter */
  getProperties() {
    this.selectedProperties = [];
    let data = {
      skip: 0,
      limit: 100,
      sortBy: '',
      sortOrder: '',
      searchValue: '',
      oFilterBy: {},
      iBusinessId: localStorage.getItem('currentBusiness'),
    };

    this.propertyListSubscription = this.apiService.postNew('core', '/api/v1/properties/list', data).subscribe((result: any) => {
      if (result?.data && result?.data[0]?.result?.length) {
        result.data[0].result.map((property: any) => {
          if (typeof this.propertyOptions[property._id] == 'undefined') {
            this.propertyOptions[property._id] = [];

            property.aOptions.map((option: any) => {
              if (option?.sCode?.trim() != '') {
                const opt: any = {
                  iPropertyId: property._id,
                  sPropertyName: property.sName,
                  iPropertyOptionId: option?._id,
                  sPropertyOptionName: option?.value,
                  sCode: option.sCode,
                  sName: option.sKey,
                  selected: false
                };
                this.propertyOptions[property._id].push(opt);
                const propertyIndex = this.aProperty.findIndex(
                  (prop: any) => prop.iPropertyId == property._id
                );
                if (propertyIndex === -1) this.aProperty.push(opt);
              }
            });
          }
        });
      }
    });
  }

  onProperties(value?: any) {
    if (this.selectedProperties && this.selectedProperties[value]) {
      this.aPropertyOptionIds = [];
      for (const oProperty of this.aProperty) {
        if (this.selectedProperties[oProperty?.iPropertyId]?.length) {
          const aOption = this.propertyOptions[oProperty?.iPropertyId].filter(
            (opt: any) => {
              return this.selectedProperties[oProperty?.iPropertyId].includes(
                opt.sName
              );
            }
          );
          for (const oOption of aOption) {
            this.aPropertyOptionIds.push(oOption?.iPropertyOptionId);
          }
        }
      }
    }
  }

  ngOnDestroy(): void {
    if (this.propertyListSubscription) this.propertyListSubscription.unsubscribe();
    MenuComponent.clearEverything();
  }
}
