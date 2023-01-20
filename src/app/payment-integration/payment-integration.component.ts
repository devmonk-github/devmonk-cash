import { trigger, transition, style, animate } from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faCopy, faPencilAlt, faSave, faXmark, faTimes } from '@fortawesome/free-solid-svg-icons';
import { throwError } from 'rxjs';
import { AddEditWorkstationComponent } from 'src/app/shared/components/add-edit-workstation/add-edit-workstation.component';
import { PrintSettingsEditorComponent } from 'src/app/shared/components/print-settings-editor/print-settings-editor.component';
import { ToastService } from 'src/app/shared/components/toast';
import { ApiService } from 'src/app/shared/service/api.service';
import { DialogService } from 'src/app/shared/service/dialog';
import { TerminalService } from '../shared/service/terminal.service';

@Component({
  selector: 'payment-integration',
  templateUrl: './payment-integration.component.html',
  styleUrls: ['./payment-integration.component.sass'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('0ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class PaymentIntegrationComponent implements OnInit {
  
  businessDetails: any;
  iBusinessId: any = localStorage.getItem('currentBusiness');
  iLocationId: any = localStorage.getItem('currentLocation');
  iWorkstationId = localStorage.getItem('currentWorkstation');
  @Output() openSetting: EventEmitter<any> = new EventEmitter();
  faPencilAlt = faPencilAlt;
  faSave = faSave;
  faCopy = faCopy;
  faXmark = faXmark;
  faTimes = faTimes;
  businessWorkstations: Array<any> = [];

  typeList:any = [
    { name: 'PAYNL', key: 'paynl', enabled: true },
    { name: 'CCV', key: 'ccv', enabled: true },
  ]

  loading: boolean = false;
  tableMaxWidth: number = window.innerWidth - 200;
  workstations: any = [];
  aTerminalList: any = [];
  businessPrintSettings !: Array<any>;
  workStationsCount: number = 0;
  bOpen = false;
  currentOpenSettings:string = "";
  oPaynl:any = {
    sServiceId: '',
    sApiToken: '',
    sApiCode: '',
  };
  oCcv:any = {
    sApiCode: '',
    sManagementId: ''
  };
  oBusinessSetting: any = {
    iBusinessSettingId: '',
    aPaymentIntegration: []
  }

  constructor(
    private apiService: ApiService,
    private dialogService: DialogService,
    private toastService: ToastService,
    private terminalService: TerminalService
  ) { }

  
  
  ngOnInit(): void {
    this.apiService.setToastService(this.toastService);
    this.getWorkstations();
    // this.fetchPaymentProviderSetting();
    this.fetchTerminals();
  }

  fetchTerminals() {
    this.terminalService.getTerminals().subscribe((res) => {
        this.aTerminalList = res;
      }, err => {
      this.toastService.show({ type: 'danger', text: err.message });
      });
  }

  fetchPaymentProviderSetting() {
    this.apiService.getNew('cashregistry', `/api/v1/payment/providers/${this.iBusinessId}`).subscribe((result: any) => {
      console.log(result)
      // if (result?.data?._id) {
        
      //   this.oBusinessSetting.iBusinessSettingId = result.data._id;
      //   this.oBusinessSetting.aPaymentIntegration = result?.data?.aPaymentIntegration || [];
      //   console.log(this.oBusinessSetting);
      //   if (this.oBusinessSetting?.aPaymentIntegration?.length) {
      //     this.oBusinessSetting.aPaymentIntegration.forEach((item:any) => {
      //       if (item?.sProviderName === 'paynl') {
      //         this.oPaynl.sServiceId = item?.sServiceId || '';
      //         this.oPaynl.sApiToken = item?.sApiToken || '';
      //         this.oPaynl.sApiCode = item?.sApiCode || '';
      //       } else if (item?.sProviderName === 'ccv') {
      //         this.oCcv.sApiCode = item?.sApiCode || '';
      //         this.oCcv.sManagementId = item?.sManagementId || '';
      //       }
      //     })
      //   }
      // }
    }, (error) => {
      console.error('error: ', error);
    })
  }

  getWorkstations() {
    this.loading = true;
    this.workstations = [];
    this.apiService.getNew('cashregistry', `/api/v1/workstations/list/${this.iBusinessId}/${this.iLocationId}`).subscribe(
      (result: any) => {
        if (result?.data?.length > 0) {
          this.workstations = result.data;
          this.tableMaxWidth = this.workstations.length * 250;
          const current = this.workstations.splice(this.workstations.findIndex((el: any) => el._id === this.iWorkstationId), 1)
          this.workstations = [...current, ...this.workstations]
        }
        this.loading = false;
      }),
      (error: any) => {
        this.loading = false;
      }
  }

  fetchPrintSettings() {
    let reqData = { iBusinessId: this.iBusinessId, iLocationId: this.iLocationId };
    this.apiService.postNew('cashregistry', '/api/v1/print-settings/list/' + this.businessDetails._id, reqData).subscribe(
      (result: any) => {
        if (result?.data[0]?.result?.length > 0) {
          this.businessPrintSettings = result.data[0].result;
        }
      }
    )
  }

  openEditSetting(format: any) {
    this.dialogService.openModal(PrintSettingsEditorComponent, { cssClass: "modal-xl", context: { format } })
      .instance.close.subscribe(result => {
      });
  }

  editWorkstation(workstation?: any) {
    if (!workstation) {
      workstation = {
        sName: '',
        sDescription: '',
        iBusinessId: this.iBusinessId,
        iLocationId: this.iLocationId,
        nPrintNodeComputerId: undefined,
      }
    }
    workstation = JSON.parse(JSON.stringify(workstation));
    this.dialogService.openModal(AddEditWorkstationComponent, { cssClass: "modal-xl", context: { workstation, printNodeAccountId: this.businessDetails?.oPrintNode?.nAccountId, apikey: this.businessDetails?.oPrintNode?.sApiKey  } })
      .instance.close.subscribe(result => {
        if (result == "fetchWorkstations") {
          this.getWorkstations();
        }
      });
  }

  

  // Function for remove print setting
  removePrintSetting(details: any) {
    let printSetting = details.workstation[details.name][details.type]?.printSetting;
    this.apiService.deleteNew('cashregistry', `/api/v1/print-settings/${this.iBusinessId}/${printSetting._id}`).subscribe(
      (result: any) => {
        if (result.message == 'success') {
          this.businessPrintSettings = this.businessPrintSettings.filter((pSetting: any) => pSetting._id != printSetting._id);
          details.workstation[details.name][details.type] = undefined;
        }
      }
    )
  }

  toggleSettings(provider:any){
    if (this.currentOpenSettings === provider) {
      this.currentOpenSettings = "";
    } else {
      this.currentOpenSettings = provider;
    }    
  }

  saveSettings() {
    const oBody:any = {
      iBusinessId: this.iBusinessId,
      aPaymentIntegration: [
        {
          sProviderName: 'paynl',
          sServiceId: this.oPaynl.sServiceId,
          sApiToken: this.oPaynl.sApiToken,
          sApiCode: this.oPaynl.sApiCode,
        },
        {
          sProviderName: 'ccv',
          sApiCode: this.oCcv.sApiCode,
          sManagementId: this.oCcv.sManagementId
        }
      ]
    }
    this.apiService.putNew('core', `/api/v1/business/setting/${this.oBusinessSetting.iBusinessSettingId}`, oBody)
      .subscribe((result: any) => {
        this.toastService.show({ type: 'success', text: 'Setting has been updated' });
      }, (error) => {
        console.error('error: ', error);
        this.toastService.show({ type: 'warning', text: 'Something went wrong' });
      })
  }

  

  trackByFunction(element: any) {
    return element._id;
  }

  groupByFn = (item: any) => item.computer.name;
}
