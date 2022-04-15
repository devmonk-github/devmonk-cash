import { Component, OnInit } from '@angular/core';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../shared/service/api.service';

@Component({
  selector: 'app-webshop-settings',
  templateUrl: './webshop-settings.component.html',
  styleUrls: ['./webshop-settings.component.sass']
})
export class WebshopSettingsComponent implements OnInit {

  faPlus = faPlus;
  
  deliveryMethods: Array<any> = ['ExpressShipping', 'RegisteredShipping', 'Pick-upInStore', 'Neighborhood']
  method: String = '';
  paymentProvider: String = 'PayNL';
  business: any = { };
  showLoader: boolean = false;
  webShop: any = {
    oShippingCost: {
      domestic: 7,
      europe: 15,
      abroad: 30,
    },
    oFreeShippingFrom: {
      domestic: 60,
      europe: 300,
      abroad: 402,
    },
    aShippingOptions: [{
      type: {
        type: String,
        enum: ['ExpressShipping', 'RegisteredShipping', 'Pick-upInStore', 'Neighborhood']
      },
      domestic: Number,
      europe: Number,
      abroad: Number,
    }],
   }
  newShipping: any = {
    type: '',
    domestic: 60,
    europe: 300,
    abroad: 402,
  }
  
  constructor(
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.business._id = localStorage.getItem('currentBusiness');
    console.log(this.webShop)
    this.getWebShopSettings()
  }

  getWebShopSettings(){
    this.showLoader = true;
    this.apiService.getNew('cashregistry', '/api/v1/webShop-settings/' + this.business._id,).subscribe((result: any) => {
      console.log(result)
      if (result && result.data) {
        this.webShop = result.data;
      }
      this.showLoader = false;
    }, (error) => {
      this.showLoader = false;
    })
  }

  updateWebShopSettings(){
    this.showLoader = true;
    this.webShop.iBusinessId = this.business._id;
    this.apiService.putNew('cashregistry', '/api/v1/webShop-settings/update/' + this.business._id, this.webShop).subscribe((result: any) => {
      if (result && result.data) {
        console.log(result.data);
        this.webShop = result.data;
        console.log(this.webShop)
      }
      this.showLoader = false;
    }, (error) => {
      this.showLoader = false;
    })
  }

  AddDeliveryMethod(newShipping: any){
    console.log(newShipping);
    this.webShop.aShippingOptions.push(newShipping);
    this.updateWebShopSettings()
  }

  changeProvider(value: String){}
}
