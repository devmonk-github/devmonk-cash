import { Subscription } from 'rxjs';
import { AddFavouritesComponent } from './../shared/components/add-favourites/favourites.component';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { DialogService } from '../shared/service/dialog';
import { CustomPaymentMethodComponent } from '../shared/components/custom-payment-method/custom-payment-method.component';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ToastService } from '../shared/components/toast';
@Component({
  selector: 'app-till-settings',
  templateUrl: './till-settings.component.html',
  styleUrls: ['./till-settings.component.scss']
})
export class TillSettingsComponent implements OnInit, OnDestroy {

  faTrash = faTrash;
  payMethodsLoading: boolean = false;
  payMethods: Array<any> = [];
  aCustomerSearch: Array<any> = [];
  bookKeepingMode: boolean = false;
  bookKeepings: Array<any> = [];
  searchValue: string = '';
  requestParams: any = {
    iBusinessId: localStorage.getItem('currentBusiness')
  }
  updatingSettings: boolean = false;
  updatingCustomerSettings: boolean = false;
  iLocationId: any = localStorage.getItem('currentLocation');
  
  settings: any = {
    nLastReceiptNumber: 0,
    nLastInvoiceNumber: 0,
    nLastnClientID:0,
    id: null
  };
  overviewColumns = [
    // { key:'', name:'action'}, 
    { key: 'sDescription', name: 'DESCRIPTION' },
    { key: 'nNumber', name: 'LEDGER_NUMBER' },
  ];
  articleGroupList!: Array<any>;
  selectedLanguage: any;
  loading: boolean = false;
  quickButtons: Array<any> = [];
  quickButtonsLoading: boolean = false;
  deleteMethodModalSub !: Subscription;
  getSettingsSubscription !: Subscription;
  getCustomerSettingsSubscription!: Subscription;
  getLedgerSubscription !: Subscription;
  geBookkeepingUpdateSubscription !: Subscription;
  geBookkeepingListSubscription !: Subscription;
  updateLedgerSubscription !: Subscription;
  updateGeneralLedgerSubscription !: Subscription;
  getLedgerNumberSubscription !: Subscription;
  createPaymentModalSub !: Subscription;
  getPaymentMethodsSubscription !: Subscription;
  viewDetailsModalSub !: Subscription;
  updateSettingsSubscription !: Subscription;
  createFavouriteModalSub !: Subscription;
  fetchQuickButtonsSubscription !: Subscription;
  saveFavouritesSubscription !: Subscription;
  removeQuickButtonSubscription !: Subscription;
  dayClosureCheckSubscription !: Subscription;
  aSelectedFields:any;
  aPrefillFields:any = [
    { key: 'bArticleGroup', title: 'ARTICLE_GROUPS' },
    { key: 'bLabelDescription', title: 'LABEL_DESCRIPTION' },
    { key: 'bProductNumber', title: 'PRODUCT_NUMBER' },
  ]
  aFilterFields: Array<any> = [
    { key: 'FIRSTNAME', value: 'sFirstName' },
    { key: 'LASTNAME', value: 'sLastName' },
    { key: 'ADDRESS', value: 'sAddress' },
    { key: 'COMPANY_NAME', value: 'sCompanyName' },
    { key: 'NCLIENTID', value: 'nClientId'}
  ];
  

  constructor(
    private apiService: ApiService,
    private dialogService: DialogService,
    private toastService: ToastService,
  ) { }

  ngOnInit(): void {
    this.apiService.setToastService(this.toastService);
    this.selectedLanguage = localStorage.getItem('language');
    this.getPaymentMethods();
    this.getBookkeepingSetting();
    this.getSettings();
    this.fetchQuickButtons();
    this.getArticleGroups();
  }

  getArticleGroups() {
    this.articleGroupList = [];
    this.loading = true;
    this.apiService.postNew('core', '/api/v1/business/article-group/list', this.requestParams).subscribe(
      (result: any) => {
        this.loading = false;
        if (result?.data?.length && result.data[0]?.result?.length) {
          this.articleGroupList = result.data[0].result.filter((item: any) => {
            if (!item?.oName?.[this.selectedLanguage]) {
              for (const sName of Object.values(item.oName)) {
                if (sName) {
                  item.oName[this.selectedLanguage] = sName;
                  break;
                }
              }
            }
            if (!item?.oName?.[this.selectedLanguage]) item.oName[this.selectedLanguage] = 'NO_NAME';
            return item.sCategory
          });
        }
      }, (error) => {
        this.loading = false;
        this.toastService.show({ type: 'warning', text: 'something went wrong' });
      })
  }

  deleteMethod(method: any) {
    const buttons = [
      { text: "YES", value: true, status: 'success', class: 'btn-primary ml-auto mr-2' },
      { text: "NO", value: false, class: 'btn-warning' }
    ]
    this.deleteMethodModalSub = this.dialogService.openModal(ConfirmationDialogComponent, {
      context: {
        header: 'DELETE_PAYMENT_METHOD',
        bodyText: 'ARE_YOU_SURE_TO_DELETE_THIS_PAYMENT_METHOD?',
        buttonDetails: buttons
      }
    })
      .instance.close.subscribe(
        result => {
          if (result) {
            this.apiService.deleteNew('cashregistry', '/api/v1/payment-methods/remove/' + method._id + '?iBusinessId=' + this.requestParams.iBusinessId).subscribe((result: any) => {
              this.getPaymentMethods()
            }, (error) => {
            })
          }
        }
      )
  }

  getSettings() {
      this.getSettingsSubscription = this.apiService.getNew('cashregistry', `/api/v1/settings/${this.requestParams.iBusinessId}`).subscribe((result: any) => {
      this.settings = result;
      this.getCustomerSettingsSubscription = this.apiService.getNew('customer', `/api/v1/customer/settings/get/${this.requestParams.iBusinessId}`).subscribe((result: any) => {
        this.settings.nLastnClientID = result?.nLastnClientID;
        this.settings.aCustomerSearch = result?.aCustomerSearch;
      }, (error) => {
        console.log(error);
      });
      const oBagNumberSettings = {
        iLocationId: this.iLocationId,
        bAutoIncrementBagNumbers: true,
        nLastBagNumber: 0,
        sPrefix:""
      };
      
      const oPrefillSettings = {
        iLocationId: this.iLocationId,
        bArticleGroup: true,
        bProductNumber: true,
        bLabelDescription:true
      }
      let oMergedSettings:any = {};
      if (!this.settings?.aBagNumbers?.length) {
        oMergedSettings = {...oBagNumberSettings};
      } else {
        oMergedSettings = {...(this.settings.aBagNumbers.find((el:any) => el.iLocationId === this.iLocationId) || oBagNumberSettings) };
      }
      
      if (!this.settings?.aCashRegisterPrefill?.length) {
        oMergedSettings = { ...oMergedSettings, ...oPrefillSettings };
        this.settings.aCashRegisterPrefill = [{...oPrefillSettings}];
      } else {
        oMergedSettings = { ...oMergedSettings, ...(this.settings.aCashRegisterPrefill.find((el: any) => el.iLocationId === this.iLocationId) || oPrefillSettings) };
      }

      this.settings.currentLocation = oMergedSettings;
    }, (error) => {
      console.log(error);
    })
  }

  getGeneralLedgerNumber() {
    this.bookKeepings = [];
    this.loading = true;
    this.getLedgerSubscription = this.apiService.getNew('bookkeeping', '/api/v1/ledger/?iBusinessId=' + this.requestParams.iBusinessId + '&sType=general&searchValue=' + this.searchValue).subscribe(
      (result: any) => {
        if (result && result.length) this.bookKeepings = result;
        this.loading = false;
      }),
      (error: any) => {
        this.bookKeepings = [];
        this.loading = false;
        console.error(error)
      }
  }

  // createBookkeepingSetting(){
  //   const data = {
  //     iBusinessId: this.requestParams.iBusinessId,
  //     bBookkeeping: true
  //   };

  //   this.apiService.postNew('bookkeeping', '/api/v1/bookkeeping-setting/create', data).subscribe(
  //     (result : any) => {      
  //     },
  //     (error: any) =>{
  //     }
  //   )
  // }

  updateBookkeepingSetting(bBookkeeping: boolean) {
    const data = {
      iBusinessId: this.requestParams.iBusinessId,
      bBookkeeping
    };
    if (bBookkeeping) this.getGeneralLedgerNumber();
    this.geBookkeepingUpdateSubscription = this.apiService.postNew('bookkeeping', '/api/v1/bookkeeping-setting/update', data).subscribe(
      (result: any) => {
      },
      (error: any) => {
      }
    )
  }

  getBookkeepingSetting() {
    this.geBookkeepingListSubscription = this.apiService.getNew('bookkeeping', '/api/v1/bookkeeping-setting/list/' + this.requestParams.iBusinessId).subscribe(
      (result: any) => {
        if (result && result.bBookkeeping) {
          this.bookKeepingMode = result.bBookkeeping;
          this.getGeneralLedgerNumber();
        }
      },
      (error: any) => {
      }
    )
  }

  updateLedgerNumber(method: any) {
    const createArticle = {
      iBusinessId: this.requestParams.iBusinessId,
      iPaymentMethodId: method._id,
      nNumber: method.sLedgerNumber
    };

    this.updateLedgerSubscription = this.apiService.postNew('bookkeeping', '/api/v1/ledger', createArticle).subscribe(
      (result: any) => {
      },
      (error: any) => {
      }
    )
  }

  updateGeneralLedgerNumber(data: any) {
    const Obj = {
      iBusinessId: this.requestParams.iBusinessId,
      _id: data._id,
      nNumber: data.nNumber
    };
    this.updateGeneralLedgerSubscription = this.apiService.putNew('bookkeeping', '/api/v1/ledger', Obj).subscribe(
      (result: any) => {
      },
      (error: any) => {
      }
    )
  }

  getLedgerNumber(methodId: any, index: number) {
    this.getLedgerNumberSubscription = this.apiService.getNew('bookkeeping', '/api/v1/ledger/payment-method/' + methodId + '?iBusinessId=' + this.requestParams.iBusinessId).subscribe(
      (result: any) => {
        if (result && result.nNumber) { this.payMethods[index].sLedgerNumber = result.nNumber; }
      }
    )
  }


  createPaymentMethod() {
    this.createPaymentModalSub = this.dialogService.openModal(CustomPaymentMethodComponent, { cssClass: "", context: { mode: 'create' } }).instance.close.subscribe(result => {
      if (result.action) this.getPaymentMethods();
    });
  }

  close() {
    this.close();
  }

  getPaymentMethods() {
    this.payMethodsLoading = true;
    this.payMethods = []
    this.getPaymentMethodsSubscription = this.apiService.getNew('cashregistry', '/api/v1/payment-methods/' + this.requestParams.iBusinessId + '?type=custom').subscribe((result: any) => {
      if (result && result.data && result.data.length) {
        this.payMethods = result.data;
        for (let i = 0; i < this.payMethods.length; i++) { this.getLedgerNumber(this.payMethods[i]._id, i) }
      }
      this.payMethodsLoading = false;
    }, (error) => {
      this.payMethodsLoading = false;
    })
  }

  viewDetails(method: any) {
    this.viewDetailsModalSub = this.dialogService.openModal(CustomPaymentMethodComponent, { cssClass: "", context: { mode: 'details', customMethod: method }, hasBackdrop: true }).instance.close.subscribe(result => {
      if (result.action) this.getPaymentMethods();
    });
  }

  
  updateCustomerSettings() {
    const CustomerSettingsbody = {
      aCustomerSearch:this.settings?.aCustomerSearch
    }
    this.updatingCustomerSettings = true;
    this.updateSettingsSubscription = this.apiService.putNew('customer', '/api/v1/customer/settings/update/' + this.requestParams.iBusinessId, CustomerSettingsbody)
      .subscribe((result: any) => {
        if (result){
          this.updatingCustomerSettings = false;
          this.toastService.show({ type: 'success', text: 'Saved Successfully' });
        } 
      }, (error) => {
        this.updatingCustomerSettings = false;
        console.log(error);
      })
  }

  updateSettings() {
    if(this.settings?.aBagNumbers?.length) {
      this.settings.aBagNumbers = [...this.settings?.aBagNumbers?.filter((el: any) => el.iLocationId !== this.iLocationId), this.settings.currentLocation];
    }
    if(this.settings?.aCashRegisterPrefill?.length) {
      const oCurrentSettrings = {
        iLocationId: this.settings.currentLocation.iLocationId,
        bArticleGroup: this.settings.currentLocation.bArticleGroup,
        bProductNumber: this.settings.currentLocation.bProductNumber,
        bLabelDescription: this.settings.currentLocation.bLabelDescription,
      } 
      this.settings.aCashRegisterPrefill = [...this.settings?.aCashRegisterPrefill?.filter((el: any) => el.iLocationId !== this.iLocationId), {...oCurrentSettrings}];
      // console.log(this.settings.aCashRegisterPrefill);
    }

    const body = {
      nLastInvoiceNumber: this.settings?.nLastInvoiceNumber,
      nLastReceiptNumber: this.settings?.nLastReceiptNumber,
      sDayClosurePeriod: this.settings?.sDayClosurePeriod,
      sDayClosureMethod: this.settings?.sDayClosureMethod,
      bOpenCashDrawer: this.settings?.bOpenCashDrawer,
      bShowOrder: this.settings?.bShowOrder,
      bShowGoldPurchase: this.settings?.bShowGoldPurchase,
      bShowOpenDrawer: this.settings?.bShowOpenDrawer,
      aBagNumbers: this.settings?.aBagNumbers,
      aCashRegisterPrefill: this.settings?.aCashRegisterPrefill,
      iDefaultArticleGroupForOrder:this.settings?.iDefaultArticleGroupForOrder,
      iDefaultArticleGroupForRepair:this.settings?.iDefaultArticleGroupForRepair
    };
    this.updatingSettings = true;
    this.updateSettingsSubscription = this.apiService.putNew('cashregistry', '/api/v1/settings/update/' + this.requestParams.iBusinessId, body)
      .subscribe((result: any) => {
        if (result){
          this.updatingSettings = false;
          this.toastService.show({ type: 'success', text: 'Saved Successfully' });
        } 
      }, (error) => {
        console.log(error);
      })
      
  }


  createFavourite() {
    this.createFavouriteModalSub = this.dialogService.openModal(AddFavouritesComponent, { context: { mode: 'create' }, cssClass: "modal-lg", hasBackdrop: true, closeOnBackdropClick: true, closeOnEsc: true }).instance.close.subscribe(result => {
      if (result.action)
        this.fetchQuickButtons();
    });
  }

  fetchQuickButtons() {
    this.quickButtonsLoading = true;
    try {
      this.fetchQuickButtonsSubscription = this.apiService.getNew('cashregistry', `/api/v1/quick-buttons/${this.requestParams.iBusinessId}?iLocationId=${this.iLocationId}`).subscribe((result: any) => {
        this.quickButtonsLoading = false;
        if (result?.length) this.quickButtons = result;
        else this.quickButtons =[];
      }, (error) => {
        this.quickButtonsLoading = false;
      })
    } catch (e) {
      this.quickButtonsLoading = false;
    }
  }

  shiftQuickButton(type: string, index: number) {
    if (type == 'up') {
      if (this.quickButtons[index - 1])
        [this.quickButtons[index - 1], this.quickButtons[index]] = [this.quickButtons[index], this.quickButtons[index - 1]]

    } else {
      if (this.quickButtons[index + 1])
        [this.quickButtons[index + 1], this.quickButtons[index]] = [this.quickButtons[index], this.quickButtons[index + 1]]
    }
  }

  saveFavourites(event: any) {
    event.target.disabled = true;
    this.quickButtonsLoading = true;
    try {
      this.saveFavouritesSubscription = this.apiService.putNew('cashregistry', '/api/v1/quick-buttons/updateSequence/' + this.requestParams.iBusinessId, this.quickButtons).subscribe((result: any) => {
        this.toastService.show({ type: 'success', text: `Quick Buttons order saved successfully` });
        this.quickButtonsLoading = false;
        event.target.disabled = false;
      }, (error) => {
        this.quickButtonsLoading = false;
        event.target.disabled = false;
      })
    } catch (e) {
      this.quickButtonsLoading = false;
      event.target.disabled = false;
    }

  }

  removeQuickButton(button: any) {
    try {
      this.removeQuickButtonSubscription = this.apiService.deleteNew('cashregistry', `/api/v1/quick-buttons/${button._id}/${this.requestParams.iBusinessId}`).subscribe((result: any) => {
        this.toastService.show({ type: 'success', text: `Quick button deleted successfully` });
        this.fetchQuickButtons();
      }, (error) => {

      })
    } catch (e) {

    }
  }

  editQuickButton(button:any) {
    console.log(button)
    this.createFavouriteModalSub = this.dialogService.openModal(AddFavouritesComponent, { context: { mode: 'edit', button:button}, cssClass: "modal-lg", hasBackdrop: true, closeOnBackdropClick: true, closeOnEsc: true }).instance.close.subscribe(result => {
      if (result.action)
        this.fetchQuickButtons();
    });
  }

  onChangeDayClosureMethod(sRevertDayClosureMethod: string) {
    const oBody = {
      iBusinessId: this.requestParams.iBusinessId,
      iLocationId: this.iLocationId,
      sDayClosureMethod: 'location' /* passing default because we need to check in all workstation for particular location */
    }
    this.dayClosureCheckSubscription = this.apiService.postNew('cashregistry', `/api/v1/statistics/day-closure/check`, oBody).subscribe(async (result: any) => {
      /* if any day-state is open then we don't allow to change the method as it will create the calculation problem in statistics */
      if (result?.data?.bIsDayStateOpened) {
        this.settings.sDayClosureMethod = sRevertDayClosureMethod;
        this.toastService.show({ type: 'warning', text: 'Please close all the day-state first then and only you can change the method' });
      }
    }, (error) => {
      this.toastService.show({ type: 'warning', text: 'something went wrong' });
    });
  }
 
  ngOnDestroy(): void {
    if (this.deleteMethodModalSub) this.deleteMethodModalSub.unsubscribe();
    if (this.getSettingsSubscription) this.getSettingsSubscription.unsubscribe();
    if (this.getCustomerSettingsSubscription) this.getCustomerSettingsSubscription.unsubscribe();
    if (this.getLedgerSubscription) this.getLedgerSubscription.unsubscribe();
    if (this.geBookkeepingUpdateSubscription) this.geBookkeepingUpdateSubscription.unsubscribe();
    if (this.geBookkeepingListSubscription) this.geBookkeepingListSubscription.unsubscribe();
    if (this.updateLedgerSubscription) this.updateLedgerSubscription.unsubscribe();
    if (this.updateGeneralLedgerSubscription) this.updateGeneralLedgerSubscription.unsubscribe();
    if (this.getLedgerNumberSubscription) this.getLedgerNumberSubscription.unsubscribe();
    if (this.createPaymentModalSub) this.createPaymentModalSub.unsubscribe();
    if (this.getPaymentMethodsSubscription) this.getPaymentMethodsSubscription.unsubscribe();
    if (this.viewDetailsModalSub) this.viewDetailsModalSub.unsubscribe();
    if (this.updateSettingsSubscription) this.updateSettingsSubscription.unsubscribe();
    if (this.createFavouriteModalSub) this.createFavouriteModalSub.unsubscribe();
    if (this.fetchQuickButtonsSubscription) this.fetchQuickButtonsSubscription.unsubscribe();
    if (this.saveFavouritesSubscription) this.saveFavouritesSubscription.unsubscribe();
    if (this.removeQuickButtonSubscription) this.removeQuickButtonSubscription.unsubscribe();
    if (this.dayClosureCheckSubscription) this.dayClosureCheckSubscription.unsubscribe();
  }
}
