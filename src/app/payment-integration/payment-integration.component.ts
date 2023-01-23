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
    aPaymentIntegration: [],
    iPaymentServiceProviderId: ''
  };
  oCCV:any = {
    sApiCode: '',
    sManagementId: '',
    aPaymentIntegration: [],
    iPaymentServiceProviderId: ''
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
    this.fetchTerminals();
  }
  
  fetchTerminals() {
    this.terminalService.getTerminals().subscribe((res) => {
      this.aTerminalList = res;
      // this.aTerminalList.forEach((terminal:any) => {
      //   terminal.keyValue = terminal.name + '/id/'+ terminal.id;
      // })
      this.getWorkstations();
    });
  }

  async getWorkstations() {
    this.loading = true;
    this.workstations = [];
    const _result: any = await this.apiService.getNew('cashregistry', `/api/v1/workstations/list/${this.iBusinessId}/${this.iLocationId}`).toPromise();
    if (_result?.data?.length > 0) {
      this.workstations = _result.data;
      this.tableMaxWidth = this.workstations.length * 250;
      const current = this.workstations.splice(this.workstations.findIndex((el: any) => el._id === this.iWorkstationId), 1)
      this.workstations = [...current, ...this.workstations]
      this.fetchPaymentProviderSetting();
    }
  }

  async fetchPaymentProviderSetting() {
    const oBody = {
      iBusinessId: this.iBusinessId,
      oFilterBy: {
        eName: ['paynl', 'ccv'],
        "oWebshop.bUseForWebshop" : false
      }
    }
    const _result:any = await this.apiService.postNew('cashregistry', `/api/v1/payment-service-provider/list`, oBody).toPromise();
    if(_result?.data?.length) {
      const _paynl:any = _result?.data.find((item: any) => item.eName === 'paynl');
      if(_paynl) {
        this.oPaynl = {
          iPaymentServiceProviderId: _paynl?._id || '',
          sServiceId: _paynl?.oPayNL.sServiceId || '',
          sApiToken: _paynl?.oPayNL.sApiToken || '',
          sApiCode: _paynl?.oPayNL.sApiCode || '',
          aPaymentIntegration: _paynl?.aPaymentIntegration || []
        }
      }
      const _ccv = _result?.data.find((item: any) => item.eName === 'ccv');
      if(_ccv) {
        this.oCCV = {
          iPaymentServiceProviderId: _ccv?._id || '',
          sApiCode: _ccv?.oCCV.sApiCode || '',
          sManagementId: _ccv?.oCCV.sManagementId || '',
          aPaymentIntegration: _ccv?.aPaymentIntegration || []
        };
      }
    }
    this.mapWorkstations();
  }

  mapWorkstations() {
    this.workstations.forEach((ws:any) => {
      ws.paynl = { sTerminalId: '', edit: false }
      ws.ccv = { sTerminalId  : '', edit: false }
      

      if(this.oPaynl.aPaymentIntegration?.length) {
        const oAssigned = this.oPaynl.aPaymentIntegration.find((item:any)=> item.iWorkstationId === ws._id)
        if(oAssigned) {
          ws.paynl.sTerminalName = this.aTerminalList.find((el: any) => el.id === oAssigned.sTerminalId)?.name || '';
          ws.paynl.sTerminalId = oAssigned.sTerminalId || '';
        }
      }

      if (this.oCCV.aPaymentIntegration?.length) {
        const oAssigned = this.oCCV.aPaymentIntegration.find((item: any) => item.iWorkstationId === ws._id)
        if (oAssigned) {
          ws.ccv.sTerminalId = oAssigned.sTerminalId;
        }
      }
    })
    this.loading = false;
    console.log(this.oPaynl, this.oCCV, {ws: this.workstations});
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
  async remove(event:any, provider:any, workstation: any) { 
    let oBody: any = {
      iBusinessId: this.iBusinessId,
      aPaymentIntegration: []
    }
    let iPaymentServiceProviderId = '';
    if(provider === 'paynl') {
      iPaymentServiceProviderId = this.oPaynl.iPaymentServiceProviderId;
      const oSavedData = this.oPaynl.aPaymentIntegration.findIndex((i: any) => i.iWorkstationId === workstation._id);
      this.oPaynl.aPaymentIntegration.splice(oSavedData, 1);      
      oBody.aPaymentIntegration = [...this.oPaynl.aPaymentIntegration];
    } else {
      iPaymentServiceProviderId = this.oCCV.iPaymentServiceProviderId;
      const oSavedData = this.oCCV.aPaymentIntegration.findIndex((i: any) => i.iWorkstationId === workstation._id);
      this.oCCV.aPaymentIntegration.splice(oSavedData, 1);
      oBody.aPaymentIntegration = [...this.oCCV.aPaymentIntegration];
    }
    const _result: any = await this.apiService.putNew('cashregistry', `/api/v1/payment-service-provider/${iPaymentServiceProviderId}`, oBody).toPromise();
    workstation[provider].sTerminalId = '';
  }

  toggleSettings(provider:any){
    if (this.currentOpenSettings === provider) {
      this.currentOpenSettings = "";
    } else {
      this.currentOpenSettings = provider;
    }    
  }

  async savePaymentIntegration(event:any, provider:any, workstation:any){
    console.log(event, provider, workstation, this.oCCV);
    // const ids = event.split('/id/');
    
    let oBody:any = {
      iBusinessId: this.iBusinessId,
      aPaymentIntegration : []
    }
    
    let iPaymentServiceProviderId = '';
    
    if (provider === 'paynl') {
      iPaymentServiceProviderId = this.oPaynl.iPaymentServiceProviderId;
      const oSavedData = this.oPaynl.aPaymentIntegration.findIndex((i: any) => i.iWorkstationId === workstation._id);
      if (oSavedData > -1) {
        this.oPaynl.aPaymentIntegration.splice(oSavedData, 1);
      }
      oBody.aPaymentIntegration = [...this.oPaynl.aPaymentIntegration, { iWorkstationId: workstation._id, sTerminalId: event }];
    } else {
      iPaymentServiceProviderId = this.oCCV.iPaymentServiceProviderId;
      const oSavedData = this.oCCV.aPaymentIntegration.findIndex((i: any) => i.iWorkstationId === workstation._id);
      if (oSavedData > -1) {
        this.oCCV.aPaymentIntegration.splice(oSavedData, 1);
      }
      oBody.aPaymentIntegration = [...this.oCCV.aPaymentIntegration, { iWorkstationId: workstation._id, sTerminalId: event }];
    }

    if (!iPaymentServiceProviderId?.length) {
      this.toastService.show({ type: 'warning', text: `Please set your credentials for ${provider}!` })
      // workstation[provider].edit = false;
      workstation[provider].sTerminalId = '';
      return;
    }
    workstation[provider].sTerminalName = this.aTerminalList.find((el: any) => el.id === event).name;
    
    const _result: any = await this.apiService.putNew('cashregistry', `/api/v1/payment-service-provider/${iPaymentServiceProviderId}`, oBody).toPromise();
    console.log(oBody, iPaymentServiceProviderId);
    // return;
  }

  saveSettings() {
    const oBody: any = {
      iBusinessId: this.iBusinessId,
      iLocationId: this.iLocationId,
      eName : this.currentOpenSettings
    };
    
    if(this.currentOpenSettings === 'paynl') {
      oBody.oPayNL = {
        sServiceId: this.oPaynl.sServiceId,
        sApiToken: this.oPaynl.sApiToken,
        sApiCode: this.oPaynl.sApiCode,
      }
    } else {
      oBody.oCCV = {
        sApiCode: this.oCCV.sApiCode,
        sManagementId: this.oCCV.sManagementId
      }
    }
    this.apiService.postNew('cashregistry', `/api/v1/payment-service-provider/`, oBody).subscribe((result: any) => {
      if(result?.data?._id)
      this.toastService.show({ type: 'success', text: 'Saved!' });
      this.oCCV.iPaymentServiceProviderId = result.data._id;
    })
  }

  

  trackByFunction(element: any) {
    return element._id;
  }

  groupByFn = (item: any) => item.computer.name;
}
