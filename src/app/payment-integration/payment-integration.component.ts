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

  typeList: any = [
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
  currentOpenSettings: string = "";
  // old_oPaynl: any = {
  //   sServiceId: '',
  //   sApiToken: '',
  //   sApiCode: '',
  //   aPaymentIntegration: [],
  //   iPaymentServiceProviderId: ''
  // };
  // old_oCCV: any = {
  //   sApiCode: '',
  //   eManagementId: '',
  //   aPaymentIntegration: [],
  //   iPaymentServiceProviderId: ''
  // };
  // old_oMollie: any = {
  //   sApiToken: '',
  //   iPaymentServiceProviderId: ''
  // }
  oBusinessSetting: any = {
    iBusinessSettingId: '',
    aPaymentIntegration: []
  }
  bTerminalsLoading: boolean = false;
  bSavingSettings: boolean = false;
  bPaynlUseForWebshop: boolean = false;
  bCcvUseForWebshop: boolean = false;
  bMollieUseForWebshop: boolean = false;
  bStripeUseForWebshop: boolean = false;

  oPaymentServiceProviders: any = {
    default: {
      oPaynl: {
        sServiceId: '',
        sApiToken: '',
        sApiCode: '',
        aPaymentIntegration: [],
        iPaymentServiceProviderId: ''
      },
      oCCV: {
        sApiCode: '',
        eManagementId: '',
        aPaymentIntegration: [],
        iPaymentServiceProviderId: ''
      },
      oMollie: {
        sApiToken: '',
        iPaymentServiceProviderId: ''
      },
      oStripe: {
        sSecret: '',
        sSignature: ''
      }
    },
    oWebshop: {
      oPaynl: {
        sServiceId: '',
        sApiToken: '',
        sApiCode: '',
        aPaymentIntegration: [],
        iPaymentServiceProviderId: ''
      },
      oCCV: {
        sApiCode: '',
        eManagementId: '',
        aPaymentIntegration: [],
        iPaymentServiceProviderId: ''
      },
      oMollie: {
        sApiToken: '',
        iPaymentServiceProviderId: ''
      },
      oStripe: {
        sSecret: '',
        sSignature: ''
      }
    }
  };

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
      oFilterBy: {
        eName: ['paynl', 'ccv', 'mollie', 'stripe'],
      }
    }
    this.apiService.postNew('cashregistry', `/api/v1/payment-service-provider/list`, oBody).subscribe((result: any) => {
      if (result?.data?.length) {
        const oPaynlData: any = result?.data.find((item: any) => item.eName === 'paynl');
        if (oPaynlData) {
          this.oPaymentServiceProviders.default.oPaynl = {
            iPaymentServiceProviderId: oPaynlData?._id || '',
            sServiceId: oPaynlData?.oPayNL.sServiceId || '',
            sApiToken: oPaynlData?.oPayNL.sApiToken || '',
            sApiCode: oPaynlData?.oPayNL.sApiCode || '',
            aPaymentIntegration: oPaynlData?.aPaymentIntegration || []
          }
          this.bPaynlUseForWebshop = oPaynlData?.oWebshop?.bUseForWebshop || false;
          if (this.bPaynlUseForWebshop) this.oPaymentServiceProviders['oWebshop']['oPaynl'] = oPaynlData;
        }
        const oCcvData = result?.data.find((item: any) => item.eName === 'ccv');
        if (oCcvData) {
          this.oPaymentServiceProviders.default.oCCV = {
            iPaymentServiceProviderId: oCcvData?._id || '',
            sApiCode: oCcvData?.oCCV.sApiCode || '',
            eManagementId: oCcvData?.oCCV.eManagementId || '',
            aPaymentIntegration: oCcvData?.aPaymentIntegration || []
          };
          this.bCcvUseForWebshop = oCcvData?.oWebshop?.bUseForWebshop || false;
          if (this.bCcvUseForWebshop) this.oPaymentServiceProviders['oWebshop']['oCCV'] = oCcvData.oCredentials['ccv'].oWebShop;
        }
        const oMollieData = result?.data.find((item: any) => item.eName === 'mollie');
        if (oMollieData) {
          this.oPaymentServiceProviders.default.oMollie = {
            iPaymentServiceProviderId: oMollieData?._id || '',
            sApiToken: oMollieData?.oMollie.sApiToken || '',
          };
          this.bMollieUseForWebshop = oMollieData?.oWebshop?.bUseForWebshop || false;
          if (this.bMollieUseForWebshop) this.oPaymentServiceProviders['oWebshop']['oMollie'] = oMollieData.oCredentials['mollie'].oWebShop;
        }
        const oStripeData = result?.data.find((item: any) => item.eName === 'stripe');
        if (oStripeData) {
          this.oPaymentServiceProviders.default.oStripe = {
            iPaymentServiceProviderId: oStripeData?._id || '',
            sSecret: oStripeData?.oStripe.sSecret || '',
            sSignature: oStripeData?.oStripe.sSignature || '',
          };
          this.bStripeUseForWebshop = oStripeData?.oWebshop?.bUseForWebshop || false;
          if (this.bStripeUseForWebshop) this.oPaymentServiceProviders['oWebshop']['oStripe'] = oStripeData.oCredentials['stripe'].oWebShop;
        }
      }
      this.mapWorkstations();
    });
  }

  mapWorkstations() {
    this.workstations.forEach((ws: any) => {
      ws.paynl = { sTerminalId: '', edit: false }
      ws.ccv = { sTerminalId: '', edit: false }
      if (this.oPaymentServiceProviders.default.oPaynl.aPaymentIntegration?.length) {
        const oAssigned = this.oPaymentServiceProviders.default.oPaynl.aPaymentIntegration.find((item: any) => item.iWorkstationId == ws._id)
        if (oAssigned) {
          ws.paynl.sTerminalName = this.aTerminalList.find((oTerminal: any) => oTerminal.id == oAssigned.sTerminalId)?.name || '';
          ws.paynl.sTerminalId = oAssigned.sTerminalId || '';
        }
      }

      if (this.oPaymentServiceProviders.default.oCCV.aPaymentIntegration?.length) {
        const oAssigned = this.oPaymentServiceProviders.default.oCCV.aPaymentIntegration.find((item: any) => item.iWorkstationId === ws._id)
        if (oAssigned) {
          ws.ccv.sTerminalId = oAssigned.sTerminalId;
        }
      }
    })
  }

  async remove(event: any, provider: any, workstation: any) {
    let oBody: any = {
      iBusinessId: this.iBusinessId,
      aPaymentIntegration: []
    }
    let iPaymentServiceProviderId = '';
    if (provider === 'paynl') {
      iPaymentServiceProviderId = this.oPaymentServiceProviders.default.oPaynl.iPaymentServiceProviderId;
      const oSavedDataIndex = this.oPaymentServiceProviders.default.oPaynl.aPaymentIntegration.findIndex((i: any) => i.iWorkstationId === workstation._id);
      this.oPaymentServiceProviders.default.oPaynl.aPaymentIntegration.splice(oSavedDataIndex, 1);
      oBody.aPaymentIntegration = [...this.oPaymentServiceProviders.default.oPaynl.aPaymentIntegration];
    } else {
      iPaymentServiceProviderId = this.oPaymentServiceProviders.default.oCCV.iPaymentServiceProviderId;
      const oSavedDataIndex = this.oPaymentServiceProviders.default.oCCV.aPaymentIntegration.findIndex((i: any) => i.iWorkstationId === workstation._id);
      this.oPaymentServiceProviders.default.oCCV.aPaymentIntegration.splice(oSavedDataIndex, 1);
      oBody.aPaymentIntegration = [...this.oPaymentServiceProviders.default.oCCV.aPaymentIntegration];
    }
    this.apiService.putNew('cashregistry', `/api/v1/payment-service-provider/${iPaymentServiceProviderId}`, oBody).subscribe((result: any) => {
      workstation[provider].sTerminalId = '';
      if (result)
        this.toastService.show({ type: 'success', text: 'DELETED' });
      else
        this.toastService.show({ type: 'danger', text: 'ERROR' });
    });
  }

  toggleSettings(provider: any) {
    if (this.currentOpenSettings === provider) {
      this.currentOpenSettings = "";
    } else {
      this.currentOpenSettings = provider;
    }
  }

  async savePaymentIntegration(event: any, provider: any, workstation: any) {
    let oBody: any = {
      iBusinessId: this.iBusinessId,
      aPaymentIntegration: []
    }

    let iPaymentServiceProviderId = '';
    const oTerminalData = { iWorkstationId: workstation._id, sTerminalId: event };

    if (provider === 'paynl') {

      iPaymentServiceProviderId = this.oPaymentServiceProviders.default.oPaynl.iPaymentServiceProviderId;
      const oSavedDataIndex = this.oPaymentServiceProviders.default.oPaynl.aPaymentIntegration.findIndex((i: any) => i.iWorkstationId === workstation._id);
      if (oSavedDataIndex > -1) this.oPaymentServiceProviders.default.oPaynl.aPaymentIntegration.splice(oSavedDataIndex, 1);
      oBody.aPaymentIntegration = [...this.oPaymentServiceProviders.default.oPaynl.aPaymentIntegration, oTerminalData];

    } else if (provider === 'ccv') {

      iPaymentServiceProviderId = this.oPaymentServiceProviders.default.oCCV.iPaymentServiceProviderId;
      const oSavedDataIndex = this.oPaymentServiceProviders.default.oCCV.aPaymentIntegration.findIndex((i: any) => i.iWorkstationId === workstation._id);
      if (oSavedDataIndex > -1) this.oPaymentServiceProviders.default.oCCV.aPaymentIntegration.splice(oSavedDataIndex, 1);
      oBody.aPaymentIntegration = [...this.oPaymentServiceProviders.default.oCCV.aPaymentIntegration, oTerminalData];

    } else if (provider === 'mollie') {

      iPaymentServiceProviderId = this.oPaymentServiceProviders.default.oMollie.iPaymentServiceProviderId;
      const oSavedDataIndex = this.oPaymentServiceProviders.default.oMollie.aPaymentIntegration.findIndex((i: any) => i.iWorkstationId === workstation._id);
      if (oSavedDataIndex > -1) this.oPaymentServiceProviders.default.oMollie.aPaymentIntegration.splice(oSavedDataIndex, 1);
      oBody.aPaymentIntegration = [...this.oPaymentServiceProviders.default.oMollie.aPaymentIntegration, oTerminalData];

    } else if (provider === 'stripe') {

      iPaymentServiceProviderId = this.oPaymentServiceProviders.default.oStripe.iPaymentServiceProviderId;
      const oSavedDataIndex = this.oPaymentServiceProviders.default.oStripe.aPaymentIntegration.findIndex((i: any) => i.iWorkstationId === workstation._id);
      if (oSavedDataIndex > -1) this.oPaymentServiceProviders.default.oStripe.aPaymentIntegration.splice(oSavedDataIndex, 1);
      oBody.aPaymentIntegration = [...this.oPaymentServiceProviders.default.oStripe.aPaymentIntegration, oTerminalData];

    }


    

    if (!iPaymentServiceProviderId) {
      this.toastService.show({ type: 'warning', text: `Please set your credentials for ${provider}!` })
      // workstation[provider].edit = false;
      workstation[provider].sTerminalId = '';
      return;
    }
    workstation[provider].sTerminalName = this.aTerminalList.find((el: any) => el.id === event).name;
    this.apiService.putNew('cashregistry', `/api/v1/payment-service-provider/${iPaymentServiceProviderId}`, oBody).subscribe((result: any) => {
      if (result)
        this.toastService.show({ type: 'success', text: 'UPDATED' });
      else
        this.toastService.show({ type: 'danger', text: 'ERROR' });
    });
    this.fetchPaymentProviderSetting();
  }

  async saveSettings() {
    debugger
    this.bSavingSettings = true;
    const sType = this.currentOpenSettings;
    const oBody: any = {
      iBusinessId: this.iBusinessId,
      iLocationId: this.iLocationId,
      eName: sType,
      oWebshop: { bUseForWebshop: false }
    };

    let id = '';
    let data = {};

    if (sType === 'paynl') {
      id = this.oPaymentServiceProviders.default.oPaynl?.iPaymentServiceProviderId;
      oBody.oPayNL = {
        sServiceId: this.oPaymentServiceProviders.default.oPaynl.sServiceId,
        sApiToken: this.oPaymentServiceProviders.default.oPaynl.sApiToken,
        sApiCode: this.oPaymentServiceProviders.default.oPaynl.sApiCode,
      }
      oBody.oWebshop.bUseForWebshop = this.bPaynlUseForWebshop;

      data = {
        oDefault: oBody.oPaynl,
        oWebShop: oBody.oWebshop.bUseForWebshop ? oBody.oPaynl : {
          sServiceId: '',
          sApiToken: '',
          sApiCode: '',
          aPaymentIntegration: [],
          iPaymentServiceProviderId: ''
        }
      }
    } else if (sType === 'ccv') {
      id = this.oPaymentServiceProviders.default.oCCV?.iPaymentServiceProviderId;
      oBody.oCCV = {
        sApiCode: this.oPaymentServiceProviders.default.oCCV.sApiCode,
        eManagementId: this.oPaymentServiceProviders.default.oCCV.eManagementId
      }
      oBody.oWebshop.bUseForWebshop = this.bCcvUseForWebshop;

      data = {
        oDefault: oBody.oCCV,
        oWebShop: oBody.oWebshop.bUseForWebshop ? oBody.oCCV : {
          sApiCode: '',
          eManagementId: '',
          aPaymentIntegration: [],
          iPaymentServiceProviderId: ''
        }
      }
    } else if (sType === 'mollie') {
      id = this.oPaymentServiceProviders.default.oMollie?.iPaymentServiceProviderId;
      oBody.oMollie = {
        sApiToken: this.oPaymentServiceProviders.default.oMollie.sApiToken,
      }
      oBody.oWebshop.bUseForWebshop = this.bMollieUseForWebshop;
      data = {
        oDefault: oBody.oMollie,
        oWebShop: this.bMollieUseForWebshop ? oBody.oMollie : {
          sApiToken: ""
        }
      }
    } else if (sType === 'stripe') {
      id = this.oPaymentServiceProviders.default.oStripe?.iPaymentServiceProviderId;
      oBody.oStripe = {
        sSecret: this.oPaymentServiceProviders.default.oStripe.sSecret,
        sSignature: this.oPaymentServiceProviders.default.oStripe.sSignature,
      }
      oBody.oWebshop.bUseForWebshop = this.bStripeUseForWebshop;
      data = {
        oDefault: oBody.oStripe,
        oWebShop: this.bStripeUseForWebshop ? oBody.oStripe : {
          sSecret: "",
          sSignature: ""
        }
      }
    }

    const payload = {
      ...oBody,
      ...(id && { iPaymentServiceProviderId: id }),
      oCredentials: {
        [oBody.eName]: data
      }
    }

    console.log("payload", payload)

    // if(id) { ///update
    //   await this.apiService.putNew('cashregistry', `/api/v1/payment-service-provider/${id}`, payload).toPromise();
    //   this.bSavingSettings = false;
    //   this.toastService.show({ type: 'success', text: 'UPDATED' });
    // } else { // create
    // }
    const result: any = await this.apiService.postNew('cashregistry', `/api/v1/payment-service-provider/`, payload).toPromise();
    if (result?.data?._id) {
      this.toastService.show({ type: 'success', text: 'SAVED' });
      if (sType === 'paynl') this.oPaymentServiceProviders.default.oPaynl.iPaymentServiceProviderId = result.data._id;
      else if (sType === 'ccv') this.oPaymentServiceProviders.default.oCCV.iPaymentServiceProviderId = result.data._id;
      else if (sType === 'mollie') this.oPaymentServiceProviders.default.oMollie.iPaymentServiceProviderId = result.data._id;
      else if (sType === 'stripe') this.oPaymentServiceProviders.default.oStripe.iPaymentServiceProviderId = result.data._id;
      else this.oPaymentServiceProviders.default.oCCV.iPaymentServiceProviderId = result.data._id;
    }
    this.fetchTerminals();
    this.fetchPaymentProviderSetting();
  }

  trackByFunction(element: any) {
    return element._id;
  }

  onLocationChange(oLocation: any) {
    if (!oLocation?.oPaynl) {
      oLocation.oPaynl = {
        sServiceId: '',
        sApiToken: '',
        sApiCode: '',
        bUseForWebshop: false
      }
    }
  }

  onUseForWebshop(event: any, type: string) {
    if (event.target.checked) {
      this.oPaymentServiceProviders['oWebshop'][type] = this.oPaymentServiceProviders.default[type];
    } else {
      // const object:any = this.oPaymentServiceProviders['oWebshop'][type];
      this.oPaymentServiceProviders['oWebshop'][type] = (object: any) => {
        for (const name in object) {
          if (object.hasOwnProperty(name)) {
            delete object[name];
          }
        }
      };
    }

  }




}
