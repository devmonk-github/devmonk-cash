import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../../service/api.service';
import { DialogComponent } from '../../service/dialog';
import { ToastService } from '../toast';

@Component({
  selector: 'app-action-settings',
  templateUrl: './action-settings.component.html',
  styleUrls: ['./action-settings.component.sass']
})
export class ActionSettingsComponent implements OnInit {

  dialogRef: DialogComponent;
  faTimes = faTimes;
  oTemplate: any = {
    layout:{}
  };
  
  iBusinessId: any = '';
  iLocationId: any = '';
  layout: any;

  mode !: string;
  aTypeOptions: any = [
    { key: 'repair', value: 'REPAIR' },
    { key: 'giftcard', value: 'GIFTCARD' }
  ];
  aSituationOptions: any = [
    { key: 'is_created', value: 'IS_CREATED' },
    { key: 'is_ready', value: 'IS_READY' }
  ];
  aActionToPerform:any = ['DOWNLOAD', 'PRINT', 'EMAIL'];

  eType:string = 'repair';
  eSituation: string = 'is_created';
  aActions: Array<string> = ['DOWNLOAD'];
  iWorkstationId: string | null;
  _id: any;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
    private toastService: ToastService,
  ) { 
    const _injector = this.viewContainerRef.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
    this.iBusinessId = localStorage.getItem('currentBusiness')
    this.iLocationId = localStorage.getItem('currentLocation')
    this.iWorkstationId = localStorage.getItem('currentWorkstation')
  }

  ngOnInit(): void {
    
  }

  async saveSettings(){
    const data = {
      eType: this.eType,
      eSituation: this.eSituation,
      aActionToPerform: this.aActions
    } 
    let oBody:any = {
      iBusinessId: this.iBusinessId,
      iLocationId: this.iLocationId,
      iWorkstationId: this.iWorkstationId,
      sMethod: 'actions',
      aActions:[
        {...data}
      ]
    }
    let result;
    if(this.mode === 'create') {
      result = await this.apiService.postNew('cashregistry', '/api/v1/print-settings/create', oBody).toPromise()
    } else {
      oBody._id = this._id;
      result = await this.apiService.putNew('cashregistry', '/api/v1/print-settings/update', oBody).toPromise();
    }
    this.close(true);
  }

  close(data: any) {
    this.dialogRef.close.emit(data);
  }
}
