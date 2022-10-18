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
  format:any;
  jsonData:any = {};
  oTemplate: any = {
    layout:{}
  };
  
  iBusinessId: any = '';
  iLocationId: any = '';
  layout: any;

  mode !: string;
  aTypeOptions: any = ['REPAIR','GIFTCARD'];
  aSituationOptions: any = ['IS_CREATED', 'IS_READY'];
  aActionToPerform:any = ['DOWNLOAD', 'PRINT', 'EMAIL'];

  eType:string = 'REPAIR';
  eSituation: string = 'IS_CREATED';
  sAction: string = 'DOWNLOAD';

  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
    private toastService: ToastService,
  ) { 
    const _injector = this.viewContainerRef.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
    this.iBusinessId = localStorage.getItem('currentBusiness')
    this.iLocationId = localStorage.getItem('currentLocation')
  }

  ngOnInit(): void {

  }

  saveSettings(){
    const data:any = {
      eType: this.eType,
      eActions: this.eSituation,
      aActionToPerform: [this.sAction]
    };
    this.close(data);
  }

  close(data: any) {
    this.dialogRef.close.emit(data);
  }
}
