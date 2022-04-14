import { Component, OnInit } from '@angular/core';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-webshop-settings',
  templateUrl: './webshop-settings.component.html',
  styleUrls: ['./webshop-settings.component.sass']
})
export class WebshopSettingsComponent implements OnInit {

  faPlus = faPlus;
  
  deliveryMethods: Array<any> = [
    'FAST_SHIPPING_EXPRESS',
    'REGISTERED_SHIPPING',
    'DELIVERY_NEARBY'
  ];
  method: String = '';
  paymentProvider: String = 'PayNL';
  
  constructor() { }

  ngOnInit(): void {
    console.log('-- we are here!!')
  }

  changeProvider(value: String){}
}
