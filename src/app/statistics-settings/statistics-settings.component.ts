import { Component, OnInit } from '@angular/core';
import { faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../shared/service/api.service';
import { MenuComponent } from '../shared/_layout/components/common';
import { Subscription } from 'rxjs';
import { DialogComponent, DialogService } from '../shared/service/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { ToastService } from '../shared/components/toast';
import { ActivatedRoute, Router } from '@angular/router';
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
  routerLink:any;
  workstation: any = {
    sName: '',
    sDescription: ''
  }
  loading: boolean = false;
  bIsDisable: boolean = true;
  workstations: Array<any> = [];
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
  savingPointsSettings: any = {};
  selectedLanguage: any;
  articleGroupList!: Array<any>;
  requestParams: any = {
    iBusinessId: localStorage.getItem('currentBusiness')
  }
  constructor(
    private apiService: ApiService,
    private dialogService: DialogService,
    private toastService: ToastService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.apiService.setToastService(this.toastService);
    this.selectedLanguage = localStorage.getItem('language');
    this.getSettings();
    this.getArticleGroups();
  }

  getSettings() {
    this.getSettingsSubscription = this.apiService.getNew('cashregistry', `/api/v1/settings/${this.requestParams.iBusinessId}`).subscribe((result: any) => {
      this.settings = result;
    }, (error) => {
      this.toastService.show({ type: 'warning', text: 'something went wrong' });
      console.log(error);
    })
  }

  onChangeShowDayStatesBasedOnTurnover(event: any) {
    if (event) {
      let confirmBtnDetails = [
        { text: "YES", value: 'success', status: 'success', class: 'ml-auto mr-2' },
        { text: "CANCEL", value: 'close' }
      ];
      this.dialogService.openModal(ConfirmationDialogComponent, { context: { header: '', bodyText: 'Are you sure you want to enable turnover groups on your daystates/statistics?', buttonDetails: confirmBtnDetails } })
        .instance.close.subscribe((status: any) => {
          if (status == 'success') {
            this.loading = true;
            this.apiService.postNew('cashregistry', '/api/v1/transaction/item/get-transactionitems-by-businessId', { iBusinessId: this.requestParams.iBusinessId }).subscribe((res: any) => {
              this.loading = false;
              if (res?.message == 'success') {
                this.close({ action: true });
              }
            }, (error) => {
              this.loading = false;
              this.toastService.show({ type: 'warning', text: 'something went wrong' });
            })
          }
        })

    }
  }

  getArticleGroups() {
    this.articleGroupList = [];
    this.loading = true;
    this.apiService.postNew('core', '/api/v1/business/article-group/list', this.requestParams).subscribe(
      (result: any) => {
        this.loading = false;
        if (result?.data?.length && result.data[0]?.result?.length) {
          this.articleGroupList = result.data[0].result.filter((item: any) => {
            if (!item?.oName?.[this.selectedLanguage]) {
              for (const sName of Object.values(item.oName)) {
                if (sName) {
                  item.oName[this.selectedLanguage] = sName;
                  break;
                }
              }
            }
            if (!item?.oName?.[this.selectedLanguage]) item.oName[this.selectedLanguage] = 'NO_NAME';
            return !item.sCategory
          });
        }
      }, (error) => {
        this.loading = false;
        this.toastService.show({ type: 'warning', text: 'something went wrong' });
      })
  }

  goToArticleGroup(id: string){
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/business/article-groups/'+id])
    );
    window.open("/#"+url, '_blank');
  }

  close(data: any) {
    this.dialogRef.close.emit(data);
  }
  
  updateSettings() {
    const body = {
      bSumUpArticleGroupStatistics: this.settings?.bSumUpArticleGroupStatistics,
      bShowDayStatesBasedOnTurnover: !this.settings?.bSumUpArticleGroupStatistics ? false : this.settings?.bShowDayStatesBasedOnTurnover
    };
    this.updateSettingsSubscription = this.apiService.putNew('cashregistry', '/api/v1/settings/update/' + this.requestParams.iBusinessId, body)
      .subscribe((result: any) => {
        this.toastService.show({ type: 'success', text: 'Saved Successfully' });
      }, (error) => {
        this.toastService.show({ type: 'warning', text: 'something went wrong' });
        console.log(error);
      })
  }
}
