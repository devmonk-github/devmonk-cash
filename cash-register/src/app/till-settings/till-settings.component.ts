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
  bookKeepingMode: boolean = false;
  bookKeepings: Array<any> = [];
  searchValue: string = '';
  requestParams: any = {
    iBusinessId: ''
  }
  settings: any = { nLastReceiptNumber: 0, nLastInvoiceNumber: 0, id: null };
  overviewColumns = [
    // { key:'', name:'action'}, 
    { key: 'sDescription', name: 'DESCRIPTION' },
    { key: 'nNumber', name: 'LEDGER_NUMBER' },
  ];
  articleGroupList!: Array<any>;
  loading: boolean = false;
  quickButtons: Array<any> = [];
  quickButtonsLoading: boolean = false;

  constructor(
    private apiService: ApiService,
    private dialogService: DialogService,
    private toastService: ToastService,
  ) { }

  ngOnInit(): void {
    this.requestParams.iBusinessId = localStorage.getItem('currentBusiness');
    this.getPaymentMethods();
    this.getBookkeepingSetting();
    this.getSettings();
    this.fetchQuickButtons();
  }

  deleteMethod(method: any) {
    const buttons = [
      { text: "YES", value: true, status: 'success', class: 'btn-primary ml-auto mr-2' },
      { text: "NO", value: false, class: 'btn-warning' }
    ]
    this.dialogService.openModal(ConfirmationDialogComponent, {
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
    this.apiService.getNew('cashregistry', '/api/v1/settings/' + this.requestParams.iBusinessId).subscribe((result: any) => {
      this.settings = result;
    }, (error) => {
      console.log(error);
    })
  }

  getGeneralLedgerNumber() {
    this.bookKeepings = [];
    this.loading = true;
    this.apiService.getNew('bookkeeping', '/api/v1/ledger/?iBusinessId=' + this.requestParams.iBusinessId + '&sType=general&searchValue=' + this.searchValue).subscribe(
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
    this.apiService.postNew('bookkeeping', '/api/v1/bookkeeping-setting/update', data).subscribe(
      (result: any) => {
      },
      (error: any) => {
      }
    )
  }

  getBookkeepingSetting() {
    this.apiService.getNew('bookkeeping', '/api/v1/bookkeeping-setting/list/' + this.requestParams.iBusinessId).subscribe(
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

    this.apiService.postNew('bookkeeping', '/api/v1/ledger', createArticle).subscribe(
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
    this.apiService.putNew('bookkeeping', '/api/v1/ledger', Obj).subscribe(
      (result: any) => {
      },
      (error: any) => {
      }
    )
  }

  getLedgerNumber(methodId: any, index: number) {
    this.apiService.getNew('bookkeeping', '/api/v1/ledger/payment-method/' + methodId + '?iBusinessId=' + this.requestParams.iBusinessId).subscribe(
      (result: any) => {
        if (result && result.nNumber) { this.payMethods[index].sLedgerNumber = result.nNumber; }
      }
    )
  }


  createPaymentMethod() {
    this.dialogService.openModal(CustomPaymentMethodComponent, { cssClass: "", context: { mode: 'create' } }).instance.close.subscribe(result => {
      if (result.action) this.getPaymentMethods();
    });
  }

  close() {
    this.close();
  }

  getPaymentMethods() {
    this.payMethodsLoading = true;
    this.payMethods = []
    this.apiService.getNew('cashregistry', '/api/v1/payment-methods/' + this.requestParams.iBusinessId + '?type=custom').subscribe((result: any) => {
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
    this.dialogService.openModal(CustomPaymentMethodComponent, { cssClass: "", context: { mode: 'details', customMethod: method } }).instance.close.subscribe(result => {
      if (result.action) this.getPaymentMethods();
    });
  }

  // updateSettings(): void {
  //   console.log(this.settings);
  // }

  updateSettings(): void {
    const { nLastInvoiceNumber, nLastReceiptNumber } = this.settings;
    const body = { nLastInvoiceNumber, nLastReceiptNumber };
    this.apiService.putNew('cashregistry', '/api/v1/settings/update/' + this.requestParams.iBusinessId, body)
      .subscribe((result: any) => {
        console.log(result);
        // this.getWebShopSettings()
        // this.showLoader = false;
      }, (error) => {
        console.log(error);
      })
  }
  ngOnDestroy(): void {
    console.log('destroy called');
  }

  createFavourite() {
    this.dialogService.openModal(AddFavouritesComponent, { context: { mode: 'create' }, cssClass: "modal-lg", hasBackdrop: true, closeOnBackdropClick: true, closeOnEsc: true }).instance.close.subscribe(result => {
      if (result.action)
        this.fetchQuickButtons();
    });
  }

  fetchQuickButtons() {
    this.quickButtonsLoading = true;
    try {
      this.apiService.getNew('cashregistry', '/api/v1/quick-buttons/' + this.requestParams.iBusinessId).subscribe((result: any) => {
        this.quickButtonsLoading = false;
        if (result?.length) this.quickButtons = result;
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
      this.apiService.putNew('cashregistry', '/api/v1/quick-buttons/update/' + this.requestParams.iBusinessId, this.quickButtons).subscribe((result: any) => {
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
    console.log(button);
    try {
      this.apiService.deleteNew('cashregistry', `/api/v1/quick-buttons/${button._id}/${this.requestParams.iBusinessId}`).subscribe((result: any) => {
        this.toastService.show({ type: 'success', text: `Quick button deleted successfully` });
        this.fetchQuickButtons();
      }, (error) => {

      })
    } catch (e) {

    }
  }
}
