import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { faCopy, faPencilAlt, faSave, faTimes, faXmark } from '@fortawesome/free-solid-svg-icons';
import { ToastService } from '../shared/components/toast';
import { ApiService } from '../shared/service/api.service';
import { DialogService } from '../shared/service/dialog';
import { TerminalService } from '../shared/service/terminal.service';

@Component({
  selector: 'payment-integration',
  templateUrl: './payment-integration.component.html',
  styleUrls: ['./payment-integration.component.scss'],
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
  currentOpenSettings: string = "paynl";
  oBusinessSetting: any = {
    iBusinessSettingId: '',
    aPaymentIntegration: []
  }
  eType:string = 'default';
  bTerminalsLoading: boolean = false;
  bSavingSettings: boolean = false;

  iPaymentServiceProviderId: string = '';
  oProviderSchema: any = {
    paynl: {
        sServiceId: '',
        sApiToken: '',
        sApiCode: '',
        aPaymentIntegrations: [],
    },
    ccv: {
      sApiCode: '',
      eManagementId: '',
      aPaymentIntegrations: [],
    },
    mollie: {
      sApiToken: '',
    },
    stripe: {
      sSecret: '',
      sSignature: ''
    }
  };
  oAllProviders:any = {
    default: { ... this.oProviderSchema },
    webshop: { ...this.oProviderSchema }
  };
  sManagementIds:any = [
    {
      key: 'GrundmasterNL',
      value: 'GrundmasterNL',
    },
    {
      key: 'GrundmasterBE',
      value: 'GrundmasterBE',
    },
    {
      key: 'GrundmasterNL-ThirdPartyTest',
      value: 'GrundmasterNL-ThirdPartyTest',
    },
    {
      key: 'GrundmasterBE-ThirdPartyTest',
      value: 'GrundmasterBE-ThirdPartyTest',
    }
  ];

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private terminalService: TerminalService
  ) { }
  
  async ngOnInit() {
    this.apiService.setToastService(this.toastService);

    this.fetchTerminals();
    this.getWorkstations();
  }

  getWorkstations() {
    this.workstations = [];
    this.apiService.getNew('cashregistry', `/api/v1/workstations/list/${this.iBusinessId}/${this.iLocationId}`).subscribe((result: any) => {
      if (result?.data?.length) {
        this.workstations = result.data;
        this.tableMaxWidth = this.workstations.length * 250;
        const current = this.workstations.splice(this.workstations.findIndex((el: any) => el._id === this.iWorkstationId), 1)
        this.workstations = [...current, ...this.workstations]
      }
    });
  }
  
  async fetchTerminals() {
    this.aTerminalList = []
    this.bTerminalsLoading = true;
    this.terminalService.getTerminals().subscribe(async (result: any) => {
      this.bTerminalsLoading = false;
      this.aTerminalList = result.data[0];
      this.fetchPaymentProviderSetting();
    }, (err) => {
      this.bTerminalsLoading = false;
      this.fetchPaymentProviderSetting();
    })

  }

  fetchPaymentProviderSetting() {
    const oBody = {
      iBusinessId: this.iBusinessId,
      iLocationId: this.iLocationId,
    }
    this.apiService.postNew('cashregistry', `/api/v1/payment-service-provider/list`, oBody).subscribe((result: any) => {
      if (result?.data?.length) {
        const oDefault = result.data.find((el:any) => el.eType == 'default');
        if(oDefault) this.oAllProviders.default = oDefault.oCredentials;
        
        const oWebshop = result.data.find((el:any) => el.eType == 'webshop');
        if (oWebshop) this.oAllProviders.webshop = oWebshop.oCredentials;
        
        console.log(this.oAllProviders);
        this.mapWorkstations();
      }
    });
  }

  mapWorkstations() {
    this.workstations.forEach((ws: any) => {
      ws.paynl = { sTerminalId: '', edit: false }
      ws.ccv = { sTerminalId: '', edit: false }
      if (this.oAllProviders?.default?.paynl?.aPaymentIntegrations?.length) {
        const oAssigned = this.oAllProviders.default?.paynl?.aPaymentIntegrations.find((item: any) => item.iWorkstationId == ws._id)
        if (oAssigned) {
          ws.paynl.sTerminalName = this.aTerminalList.find((oTerminal: any) => oTerminal.id == oAssigned.sTerminalId)?.name || '';
          ws.paynl.sTerminalId = oAssigned.sTerminalId || '';
        }
      }
      if (this.oAllProviders?.default?.ccv?.aPaymentIntegrations?.length) {
        const oAssigned = this.oAllProviders.default.ccv.aPaymentIntegrations.find((item: any) => item.iWorkstationId === ws._id)
        if (oAssigned) ws.ccv.sTerminalId = oAssigned.sTerminalId;
      }
    })
  }

  async remove(event: any, provider: any, workstation: any) {
    // let iPaymentServiceProviderId = '';
    // if (provider === 'paynl') {
    //   iPaymentServiceProviderId = this.oProviders[provider].oDefault.iPaymentServiceProviderId;
    //   const oSavedDataIndex = this.oProviders[provider].oDefault.aPaymentIntegrations.findIndex((i: any) => i.iWorkstationId === workstation._id);
    //   this.oProviders[provider].oDefault.aPaymentIntegrations.splice(oSavedDataIndex, 1);
    //   this.oProviders[provider].oDefault.aPaymentIntegrations = [...this.oProviders[provider].oDefault.aPaymentIntegrations];
    // } else {
    //   iPaymentServiceProviderId = this.oProviders[provider].oDefault.iPaymentServiceProviderId;
    //   const oSavedDataIndex = this.oProviders[provider].oDefault.aPaymentIntegrations.findIndex((i: any) => i.iWorkstationId === workstation._id);
    //   this.oProviders[provider].oDefault.aPaymentIntegrations.splice(oSavedDataIndex, 1);
    //   this.oProviders[provider].oDefault.aPaymentIntegrations = [...this.oProviders[provider].oDefault.aPaymentIntegrations];
    // }
    // const payload = {
    //   iPaymentServiceProviderId: this.iPaymentServiceProviderId,
    //   iBusinessId: this.iBusinessId,
    //   iLocationId: this.iLocationId,
    //   oCredentials: this.oProviders
    // }
    // this.apiService.postNew('cashregistry', `/api/v1/payment-service-provider`, payload).subscribe((result: any) => {
    //   workstation[provider].sTerminalId = '';
    //   if (result) {
    //     this.toastService.show({ type: 'success', text: 'DELETED' });
    //     this.fetchPaymentProviderSetting();
    //   } else this.toastService.show({ type: 'danger', text: 'ERROR' });
    // });
  }

  toggleSettings(provider: any) {
    if (this.currentOpenSettings === provider) {
      this.currentOpenSettings = "";
    } else {
      this.currentOpenSettings = provider;
    }    
  }

  async savePaymentIntegration(sTerminalId: any, provider: any, workstation: any) {
    const oTerminalData = { iWorkstationId: workstation._id, sTerminalId};
    let oCredentials = {
      [provider]: this.oAllProviders.default[provider]
    };
    const oSavedDataIndex = oCredentials[provider].aPaymentIntegrations.findIndex((i: any) => i.iWorkstationId === workstation._id);
    if (oSavedDataIndex > -1) oCredentials[provider].aPaymentIntegrations.splice(oSavedDataIndex, 1);
    oCredentials[provider].aPaymentIntegrations = [...oCredentials[provider].aPaymentIntegrations, oTerminalData];
    
    const oBody = {
      iBusinessId: this.iBusinessId,
      iLocationId: this.iLocationId,
      eType: 'default',
      oCredentials
    }
    this.apiService.postNew('cashregistry', `/api/v1/payment-service-provider`, oBody).subscribe((result: any) => {
      if (result)
        this.toastService.show({ type: 'success', text: 'UPDATED' });
      else
        this.toastService.show({ type: 'danger', text: 'ERROR' });
    });
    this.fetchPaymentProviderSetting();    
  }

  async saveSettings() {
    this.bSavingSettings = true;
    const oBody = {
      iPaymentServiceProviderId: this.iPaymentServiceProviderId,
      iBusinessId: this.iBusinessId,
      iLocationId: this.iLocationId,
      eType: this.eType,
      oCredentials: this.oAllProviders[this.eType]
    }
    this.apiService.postNew('cashregistry', `/api/v1/payment-service-provider/`, oBody).subscribe((result: any) => {
      if (result?.data) {
        this.bSavingSettings = false;
        this.toastService.show({ type: 'success', text: 'SAVED' });
      }
      this.fetchTerminals();
    });
  }

  trackByFunction(element: any) {
    return element._id;
  }
}