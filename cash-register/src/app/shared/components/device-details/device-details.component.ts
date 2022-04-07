import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ApiService } from '../../service/api.service';
import { DialogComponent } from '../../service/dialog';

@Component({
  selector: 'app-device-details',
  templateUrl: './device-details.component.html',
  styleUrls: ['./device-details.component.sass']
})
export class DeviceDetailsComponent implements OnInit {

  dialogRef: DialogComponent;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService
  ) { 
    const _injector = this.viewContainerRef.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit(): void {
    console.log('---- DeviceDetailsComponent! ')
  }

}
