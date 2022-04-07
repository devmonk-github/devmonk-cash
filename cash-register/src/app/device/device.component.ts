import { Component, OnInit } from '@angular/core';
import { DeviceDetailsComponent } from '../shared/components/device-details/device-details.component';
import { DialogService } from '../shared/service/dialog';

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.sass']
})
export class DeviceComponent implements OnInit {

  requestParams: any = {
    searchValue: ''
  }

  constructor(
    private dialogService: DialogService
  ) { }

  ngOnInit(): void {
  }

  addNewDevice(){
    console.log('-- addNewDevice!');
    this.dialogService.openModal(DeviceDetailsComponent, { cssClass:"", context: { mode: 'create' } }).instance.close.subscribe(result =>{ 
     console.log(result);
    });
  }

}
