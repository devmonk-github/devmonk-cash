import { Component, OnInit } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { DialogService } from '../shared/service/dialog';
import { CustomPaymentMethodComponent } from '../shared/components/custom-payment-method/custom-payment-method.component';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-till-settings',
  templateUrl: './till-settings.component.html',
  styleUrls: ['./till-settings.component.sass']
})
export class TillSettingsComponent implements OnInit {

  faTrash = faTrash;
  payMethodsLoading: boolean = false;
  payMethods: Array<any> = [];
  bookKeepingMode: boolean = false;
  requestParams: any = {
    iBusinessId: ''
  }

  constructor(
    private apiService: ApiService,
    private dialogService: DialogService
  ) { }

  deleteMethod(method: any){
    const buttons = [
      {text: "YES", value: true, status: 'success', class: 'btn-primary ml-auto mr-2'},
      {text: "NO", value: false, class: 'btn-warning'}
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

  ngOnInit(): void {
    this.requestParams.iBusinessId = localStorage.getItem('currentBusiness');
    this.getPaymentMethods();
  }

  createPaymentMethod() {
    this.dialogService.openModal(CustomPaymentMethodComponent, { cssClass:"", context: { mode: 'create' } }).instance.close.subscribe(result =>{ 
      this.getPaymentMethods();
    });
  }

  close(){
    this.close();
  }

  getPaymentMethods(){
    this.payMethodsLoading = true;
    this.payMethods = []
    this.apiService.getNew('cashregistry', '/api/v1/payment-methods/' + this.requestParams.iBusinessId + '?type=custom').subscribe((result: any) => {
      if (result && result.data && result.data.length) {
        this.payMethods = result.data;
      }
      this.payMethodsLoading = false;
    }, (error) => {
      this.payMethodsLoading = false;
    })
  }

  viewDetails(method: any){
    this.dialogService.openModal(CustomPaymentMethodComponent, { cssClass:"", context: { mode: 'details', customMethod: method } }).instance.close.subscribe(result =>{ 
      this.getPaymentMethods();
    });
  }
}
