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
  bTerminalsLoading: boolean = false;
  bSavingSettings: boolean = false;
  bPaynlUseForWebshop: boolean = false;
  bCcvUseForWebshop: boolean = false;

  constructor(
    private apiService: ApiService,
    private dialogService: DialogService,
    private toastService: ToastService,
    private terminalService: TerminalService
  ) { }
  
  async ngOnInit() {
    this.apiService.setToastService(this.toastService);
    
    this.bTerminalsLoading = true;

    const [_terminals, _workstations, _paymentProviderSettings]:any = await Promise.all([
      this.fetchTerminals(),
      this.getWorkstations(),
      this.fetchPaymentProviderSetting()
    ])

    this.bTerminalsLoading = false;
    this.aTerminalList = _terminals;

    this.handleWorkstationResponse(_workstations);
    this.handlePaymentProviderSettingsResponse(_paymentProviderSettings);
    this.loading = false;
  }

  getWorkstations() {
    this.workstations = [];
    return this.apiService.getNew('cashregistry', `/api/v1/workstations/list/${this.iBusinessId}/${this.iLocationId}`).toPromise();
  }
  
  async fetchTerminals() {
    this.aTerminalList = []
    return this.terminalService.getTerminals().toPromise();
    
  }

  fetchPaymentProviderSetting() {
    const oBody = {
      iBusinessId: this.iBusinessId,
      oFilterBy: {
        eName: ['paynl', 'ccv'],
        // "oWebshop.bUseForWebshop" : false
      }
    }
    return this.apiService.postNew('cashregistry', `/api/v1/payment-service-provider/list`, oBody).toPromise();
  }

  handlePaymentProviderSettingsResponse(_result:any) {
    // console.log('handlePaymentProviderSettingsResponse', _result)
    if (_result?.data?.length) {
      const oPaynlData: any = _result?.data.find((item: any) => item.eName === 'paynl');
      if (oPaynlData) {
        this.oPaynl = {
          iPaymentServiceProviderId: oPaynlData?._id || '',
          sServiceId: oPaynlData?.oPayNL.sServiceId || '',
          sApiToken: oPaynlData?.oPayNL.sApiToken || '',
          sApiCode: oPaynlData?.oPayNL.sApiCode || '',
          aPaymentIntegration: oPaynlData?.aPaymentIntegration || []
        }
        this.bPaynlUseForWebshop = oPaynlData?.oWebshop?.bUseForWebshop || false;
      }
      const oCcvData = _result?.data.find((item: any) => item.eName === 'ccv');
      if (oCcvData) {
        this.oCCV = {
          iPaymentServiceProviderId: oCcvData?._id || '',
          sApiCode: oCcvData?.oCCV.sApiCode || '',
          sManagementId: oCcvData?.oCCV.sManagementId || '',
          aPaymentIntegration: oCcvData?.aPaymentIntegration || []
        };
        this.bCcvUseForWebshop = oCcvData?.oWebshop?.bUseForWebshop || false;
      }
    }
    this.mapWorkstations();
    // console.log(this.workstations);
  }
  

  handleWorkstationResponse(_result:any) {
    if (_result?.data?.length > 0) {
      this.workstations = _result.data;
      this.tableMaxWidth = this.workstations.length * 250;
      const current = this.workstations.splice(this.workstations.findIndex((el: any) => el._id === this.iWorkstationId), 1)
      this.workstations = [...current, ...this.workstations]
    }
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

  async remove(event:any, provider:any, workstation: any) { 
    let oBody: any = {
      iBusinessId: this.iBusinessId,
      aPaymentIntegration: []
    }
    let iPaymentServiceProviderId = '';
    if(provider === 'paynl') {
      iPaymentServiceProviderId = this.oPaynl.iPaymentServiceProviderId;
      const oSavedDataIndex = this.oPaynl.aPaymentIntegration.findIndex((i: any) => i.iWorkstationId === workstation._id);
      this.oPaynl.aPaymentIntegration.splice(oSavedDataIndex, 1);      
      oBody.aPaymentIntegration = [...this.oPaynl.aPaymentIntegration];
    } else {
      iPaymentServiceProviderId = this.oCCV.iPaymentServiceProviderId;
      const oSavedDataIndex = this.oCCV.aPaymentIntegration.findIndex((i: any) => i.iWorkstationId === workstation._id);
      this.oCCV.aPaymentIntegration.splice(oSavedDataIndex, 1);
      oBody.aPaymentIntegration = [...this.oCCV.aPaymentIntegration];
    }
    this.apiService.putNew('cashregistry', `/api/v1/payment-service-provider/${iPaymentServiceProviderId}`, oBody).subscribe((result:any) => {
      workstation[provider].sTerminalId = '';
      if(result)
        this.toastService.show({ type: 'success', text: 'DELETED' });
      else
        this.toastService.show({ type: 'danger', text: 'ERROR' });
    });
  }

  toggleSettings(provider:any){
    if (this.currentOpenSettings === provider) {
      this.currentOpenSettings = "";
    } else {
      this.currentOpenSettings = provider;
    }    
  }

  async savePaymentIntegration(event:any, provider:any, workstation:any){    
    let oBody:any = {
      iBusinessId: this.iBusinessId,
      aPaymentIntegration : []
    }
    
    let iPaymentServiceProviderId = '';
    const oTerminalData = { iWorkstationId: workstation._id, sTerminalId: event };
    
    if (provider === 'paynl') {

      iPaymentServiceProviderId = this.oPaynl.iPaymentServiceProviderId;
      const oSavedDataIndex = this.oPaynl.aPaymentIntegration.findIndex((i: any) => i.iWorkstationId === workstation._id);
      if (oSavedDataIndex > -1) this.oPaynl.aPaymentIntegration.splice(oSavedDataIndex, 1);
      oBody.aPaymentIntegration = [...this.oPaynl.aPaymentIntegration, oTerminalData];
    
    } else {

      iPaymentServiceProviderId = this.oCCV.iPaymentServiceProviderId;
      const oSavedDataIndex = this.oCCV.aPaymentIntegration.findIndex((i: any) => i.iWorkstationId === workstation._id);
      if (oSavedDataIndex > -1) this.oCCV.aPaymentIntegration.splice(oSavedDataIndex, 1);      
      oBody.aPaymentIntegration = [...this.oCCV.aPaymentIntegration, oTerminalData];
    
    }

    if (!iPaymentServiceProviderId) {
      this.toastService.show({ type: 'warning', text: `Please set your credentials for ${provider}!` })
      // workstation[provider].edit = false;
      workstation[provider].sTerminalId = '';
      return;
    }
    workstation[provider].sTerminalName = this.aTerminalList.find((el: any) => el.id === event).name;
    this.apiService.putNew('cashregistry', `/api/v1/payment-service-provider/${iPaymentServiceProviderId}`, oBody).subscribe((result:any) => {
      if(result)
        this.toastService.show({ type: 'success', text: 'UPDATED' });
      else
        this.toastService.show({ type: 'danger', text: 'ERROR' });
    });
    this.fetchPaymentProviderSetting();    
  }

  async saveSettings() {
    this.bSavingSettings = true;
    const sType = this.currentOpenSettings;
    const oBody: any = {
      iBusinessId: this.iBusinessId,
      iLocationId: this.iLocationId,
      eName : sType,
      oWebshop: { bUseForWebshop: false }
    };
    
    let id = '';

    if(sType === 'paynl') {
      id = this.oPaynl?.iPaymentServiceProviderId;
      oBody.oPayNL = {
        sServiceId: this.oPaynl.sServiceId,
        sApiToken: this.oPaynl.sApiToken,
        sApiCode: this.oPaynl.sApiCode,
      }
      oBody.oWebshop.bUseForWebshop = this.bPaynlUseForWebshop;
    } else {
      id = this.oCCV?.iPaymentServiceProviderId;
      oBody.oCCV = {
        sApiCode: this.oCCV.sApiCode,
        sManagementId: this.oCCV.sManagementId
      }
      oBody.oWebshop.bUseForWebshop = this.bCcvUseForWebshop;
    }

    if(id) { ///update
      await this.apiService.putNew('cashregistry', `/api/v1/payment-service-provider/${id}`, oBody).toPromise();
      this.bSavingSettings = false;
      this.toastService.show({ type: 'success', text: 'UPDATED' });
    } else { // create
      const result: any = await this.apiService.postNew('cashregistry', `/api/v1/payment-service-provider/`, oBody).toPromise();
      if (result?.data?._id) {
        this.toastService.show({ type: 'success', text: 'SAVED' });
        if (sType === 'paynl') this.oPaynl.iPaymentServiceProviderId = result.data._id;
        else this.oCCV.iPaymentServiceProviderId = result.data._id;
      }
    }
    this.performAfterUpdateOperations();
  }

  async performAfterUpdateOperations() {
    this.bTerminalsLoading = true;
    this.loading = true;
    const [_terminalResult, _PaymentProviderResult]:any = await Promise.all([
      this.fetchTerminals(),
      this.fetchPaymentProviderSetting(),
    ])
    this.bTerminalsLoading = false;
    this.aTerminalList = _terminalResult;

    this.loading = false;
    // console.log('performAfterUpdateOperations', _PaymentProviderResult);
    this.handlePaymentProviderSettingsResponse(_PaymentProviderResult);
  }

  trackByFunction(element: any) {
    return element._id;
  }
}
