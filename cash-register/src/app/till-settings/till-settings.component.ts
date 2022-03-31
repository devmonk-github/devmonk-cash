import { Component, OnInit } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { DialogService } from '../shared/service/dialog';
import { CustomPaymentMethodComponent } from '../shared/components/custom-payment-method/custom-payment-method.component';

@Component({
  selector: 'app-till-settings',
  templateUrl: './till-settings.component.html',
  styleUrls: ['./till-settings.component.sass']
})
export class TillSettingsComponent implements OnInit {

  payMethodsLoading: boolean = false;
  payMethods: Array<any> = [];
  requestParams: any = {
    iBusinessId: ''
  }

  constructor(
    private apiService: ApiService,
    private dialogService: DialogService
  ) { }

  ngOnInit(): void {
    this.requestParams.iBusinessId = localStorage.getItem('currentBusiness');
    this.getPaymentMethods();
  }

  createPaymentMethod() {
    this.dialogService.openModal(CustomPaymentMethodComponent, { cssClass:"", context: { mode: 'create' } }).instance.close.subscribe(result =>{ });
  }

  close(){
    this.close();
  }

  getPaymentMethods(){
    this.payMethodsLoading = true;
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
