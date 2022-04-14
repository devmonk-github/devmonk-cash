import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-webshop-settings',
  templateUrl: './webshop-settings.component.html',
  styleUrls: ['./webshop-settings.component.sass']
})
export class WebshopSettingsComponent implements OnInit {

  deliveryMethods: Array<any> = [
    'FAST_SHIPPING_EXPRESS',
    'REGISTERED_SHIPPING',
    'DELIVERY_NEARBY'
  ];
  method: String = '';
  
  constructor() { }

  ngOnInit(): void {
    console.log('-- we are here!!')
  }

}
