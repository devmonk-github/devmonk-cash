import { Component, OnInit } from '@angular/core';
import { faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../shared/service/api.service';
import { MenuComponent } from '../shared/_layout/components/common';
import { Subscription } from 'rxjs';
import { DialogComponent, DialogService } from '../shared/service/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
//import { ToastService } from '../shared/components/toast';
@Component({
  selector: 'app-statistics-settings',
  templateUrl: './statistics-settings.component.html',
  styleUrls: ['./statistics-settings.component.sass']
})
export class StatisticsSettingsComponent implements OnInit {
  dialogRef: DialogComponent;
  addNew: boolean = false;
  faPencilAlt = faPencilAlt;
  faTrash = faTrash;
  workstation: any = {
    sName: '',
    sDescription: ''
  }
  loading: boolean = false;
  workstations: Array<any> = [];
  //settings: Array<any> = [];
  settings: any;
  iBusinessId = localStorage.getItem('currentBusiness')
  downloadOptions = [
    {
      title: 'CSV_DOWNLOAD',
      key: 'CSV_DOWNLOAD'
    },
    {
      title: 'PDF_DOWNLOAD',
      key: 'PDF_DOWNLOAD'
    }
  ];
  expiry: Array<any> = [
    'Year', 'Month', 'Day'
  ];
  updateSettingsSubscription !: Subscription;
  getSettingsSubscription !: Subscription;
  updatingSettings: boolean = false;
  savingPointsSettings: any = {};
  requestParams: any = {
    iBusinessId: localStorage.getItem('currentBusiness')
  }
  constructor(
    private apiService: ApiService,
    private dialogService: DialogService,
    //private toastService: ToastService

  ) { }

  ngOnInit(): void {
    //this.apiService.setToastService(this.toastService);
    // this.business._id = localStorage.getItem('currentBusiness');
    //this.fetchSetting();
    this.getSettings();
  }
  getSettings() {
    this.getSettingsSubscription = this.apiService.getNew('cashregistry', `/api/v1/settings/${this.requestParams.iBusinessId}`).subscribe((result: any) => {
      this.settings = result;
      console.log("this.settings",this.settings);

      
    }, (error) => {
      console.log(error);
    })
  }
  enableTurnoverGroups() {
    //console.log("enableTurnoverGroups", this.settings.bShowDayStates);
    if (this.settings.bShowDayStates) {
      let confirmBtnDetails = [
        { text: "YES", value: 'remove', status: 'success', class: 'ml-auto mr-2' },
        { text: "CANCEL", value: 'close' }
      ];
      this.dialogService.openModal(ConfirmationDialogComponent, { context: { header: '', bodyText: 'Are you sure you want to enable turnover groups on your daystates/statistics?', buttonDetails: confirmBtnDetails } })
        .instance.close.subscribe(
          (status: any) => {
            console.log("status");
            console.log(status);
            if (status == 'remove') {
              this.apiService.postNew('cashregistry', '/api/v1/transaction/item/get-transactionitems-by-businessId', {  iBusinessId: this.requestParams.iBusinessId }).subscribe((res: any) => {
                if (res?.message == 'success') {
                  this.close({ action: true });

                } else {

                }
              })

            }
          })
    }
  }

  close(data: any) {
    this.dialogRef.close.emit(data);
  }
  updateSettings() {

    const body = {
      bSumUpArticleGroupStatistics: this.settings?.bSumUpArticleGroupStatistics,
      bShowDayStates:this.settings?.bShowDayStates
     
    };
    console.log("body",body);

    this.updatingSettings = true;
    this.updateSettingsSubscription = this.apiService.putNew('cashregistry', '/api/v1/settings/update/' + this.requestParams.iBusinessId, body)
      .subscribe((result: any) => {
        if (result){
          console.log("result",result);
          this.updatingSettings = false;
          //this.toastService.show({ type: 'success', text: 'Saved Successfully' });
        } 
      }, (error) => {
        console.log(error);
      })
  }
  

 

}
