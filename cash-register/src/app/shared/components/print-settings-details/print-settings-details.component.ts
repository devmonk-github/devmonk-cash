import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../../service/api.service';
import { DialogComponent } from '../../service/dialog';

@Component({
  selector: 'app-print-settings-details',
  templateUrl: './print-settings-details.component.html',
  styleUrls: ['./print-settings-details.component.sass']
})
export class PrintSettingsDetailsComponent implements OnInit {

  dialogRef: DialogComponent;
  faTimes = faTimes;
  methods: Array<any> = [ 'pdf', 'labelDefinition', 'thermal' ]
  method: string = 'pdf';
  types: Array<any> = [
    'transaction', 'repair', 'order', 'offer', 'giftCard', 'dayState', 'purchaseOrder', 'mutation', 'ccvMerchant', 'default'
  ]
  type: string = '';
  users: Array<any> = [
    'customer', 'partner'
  ]
  user: string = '';
  business: any = {};
  location: any = {};
  workstation: any = {};

  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService
  ) { 
    const _injector = this.viewContainerRef.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
    this.business._id = localStorage.getItem('currentBusiness')
    this.location._id = localStorage.getItem('currentLocation')
    this.workstation._id = localStorage.getItem('currentWorkstation')
  }

  ngOnInit(): void {
    this.initialSetup();
  }

  createPrintSetting(){
    let data = {
      iBusinessId: this.business._id,
      iLocationId: this.location._id,
      iWorkstationId: this.workstation._id,
      sMethod: this.method,
      sType: this.type,
      sUser: this.user
    }

    this.apiService.postNew('cashregistry', '/api/v1/print-settings/create', data).subscribe(
      (result : any) => {
        this.close({ action: true });
       },
      (error: any) => {
        console.log(error)
      }
    );
  }

  initialSetup(){
    switch(this.method){
      case'thermal' :
        this.types = [ 'transaction', 'repair', 'order', 'offer', 'giftCard', 'dayState', 'purchaseOrder', 'mutation', 'ccvMerchant' ];
        break;
      case'pdf' :
        this.types = [ 'transaction', 'repair', 'order', 'offer', 'giftCard', 'dayState', 'purchaseOrder' ];
        break;
      case'labelDefinition' :
        this.types = ['default'];
        break;
    }
  }

  selectMethod(method: string){
    this.initialSetup();
  }

  close(data: any) {
    this.dialogRef.close.emit(data);
  }
}
