import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faPencilAlt, faCopy, faXmark, faSave } from '@fortawesome/free-solid-svg-icons';
import { AddEditWorkstationComponent } from 'src/app/shared/components/add-edit-workstation/add-edit-workstation.component';
import { PrintSettingsEditorComponent } from 'src/app/shared/components/print-settings-editor/print-settings-editor.component';
import { ApiService } from 'src/app/shared/service/api.service';
import { DialogService } from 'src/app/shared/service/dialog';

@Component({
  selector: 'print-workstation',
  templateUrl: './print-workstation.component.html',
  styleUrls: ['./print-workstation.component.sass']
})
export class PrintWorkstationComponent implements OnInit {

  constructor(
    private apiService: ApiService,
    private dialogService: DialogService
  ) { }

  @Input() businessDetails: any;
  @Input() iLocationId: any;
  @Output() openSetting: EventEmitter<any> = new EventEmitter();
  faPencilAlt = faPencilAlt;
  faSave = faSave;
  faCopy = faCopy;
  faXmark = faXmark;
  businessWorkstations: Array<any> = [];
  templates: Array<any> = [
    {
      name: 'PDF',
      typeList: [
        { name: 'BUSINESS_RECEIPT', key: 'transaction', enabled: true },
        { name: 'ORDER_RECEIPT', key: 'activity', enabled: true },
        { name: 'REPAIR_RECEIPT', key: 'repair', enabled: true },
        { name: 'GIFTCARD_RECEIPT', key: 'giftCard', enabled: true },
        { name: 'REPAIR_ALTERNATIVE_RECEIPT', key: 'repair_alternative', enabled: true }
      ]
    },
    {
      name: 'THERMAL',
      typeList: [
        { name: 'BUSINESS_RECEIPT', key: 'transaction', enabled: false },
        { name: 'REPAIR_RECEIPT', key: 'repair', enabled: false }
      ]
    },
    {
      name: 'LABEL',
      typeList: [
        { name: 'LABEL', key: 'default', enabled: false }
      ]
    }
  ];
  loading: boolean = false;
  tableMaxWidth: number = window.innerWidth - 200;
  workstations !: Array<any>;
  computersList !: Array<any>;
  businessPrintSettings !: Array<any>;

  ngOnInit(): void {
    this.getWorkstations();
    this.fetchPrintSettings();
  }

  createWorkstation(workstation: any) {
    workstation.iBusinessId = this.businessDetails._id;
    workstation.iLocationId = this.iLocationId;
    this.loading = true;
    this.apiService.postNew('cashregistry', '/api/v1/workstations/create', workstation).subscribe(
      (result: any) => {
        this.loading = false;
        this.getWorkstations();
      }),
      (error: any) => {
        this.loading = false;
        console.error(error)
      }
  }

  // Function for get workstations list
  getWorkstations() {
    this.loading = true;
    this.workstations = [];
    this.apiService.getNew('cashregistry', `/api/v1/workstations/list/${this.businessDetails._id}/${this.iLocationId}`).subscribe(
      (result: any) => {
        if (result?.data?.length > 0) {
          this.tableMaxWidth = result.data.length * 250;
          let workstations: any = [];
          result.data.map(async (workstation: any) => {
            if (workstation.nPrintNodeComputerId) {
              workstation.printers = await this.getPrintersList(workstation.nPrintNodeComputerId).toPromise();
              workstation.computer = workstation.printers[0]?.computer || undefined;
              workstations.unshift(workstation);
            } else {
              workstations.push(workstation);
            }
          });
          this.workstations = workstations;
        }
        this.loading = false;
      }),
      (error: any) => {
        this.loading = false;
      }
  }

  // Function for get computers list
  getComputersList() {
    let urlParams = `?id=187612`
    this.apiService.getNew('cashregistry', '/api/v1/printnode/computers' + urlParams).subscribe(
      (result: any) => {
        if (result?.length > 0) {
          this.computersList = [];
          let self = this;
          result.map(async (computer: any) => {
            computer.printers = await this.getPrintersList(computer.id).toPromise();
            self.computersList.push(computer);
          });
        }
      }
    )
  }

  // Function for get computers list
  getPrintersList(computerId: number) {
    let urlParams = `?id=187612&deviceId=${computerId}`
    return this.apiService.getNew('cashregistry', '/api/v1/printnode/printers' + urlParams);
  }

  // Function for edit template
  openEditSetting(format: any) {
    this.dialogService.openModal(PrintSettingsEditorComponent, { cssClass: "modal-xl", context: { format } })
      .instance.close.subscribe(result => {

      });
  }

  // Function for edit workstation
  editWorkstation(workstation?: any) {
    if (!workstation) {
      workstation = {
        sName: '',
        sDescription: '',
        iBusinessId: this.businessDetails._id,
        iLocationId: this.iLocationId,
        nPrintNodeComputerId: undefined,
      }
    }
    this.dialogService.openModal(AddEditWorkstationComponent, { cssClass: "modal-xl", context: { workstation, printNodeAccountId: 187612 } })
      .instance.close.subscribe(result => {
        if (result == "fetchWorkstations") {
          this.getWorkstations();
        }
      });
  }

  // Function for create or update print settings
  savePrintSetting(type: any) {
    let printer = type.workstation.printers.filter((printer: any) => printer.id == type.workstation[type.name][type.type]?.nPrinterId);
    if (printer.length == 1) {
      let reqData = {
        sPrinterName: printer[0].name,
        sMethod: type.name == 'LABEL' ? 'labelDefinition' : type.name.toLowerCase(),
        sUser: 'customer',
        nComputerId: type.workstation.computer.id,
        nPrinterId: printer[0].id,
        sType: type.type,
        iBusinessId: this.businessDetails._id,
        iLocationId: this.iLocationId,
        iWorkstationId: type.workstation._id,
      }
      this.apiService.postNew('cashregistry', '/api/v1/print-settings/create', reqData).subscribe(
        (result: any) => {
          console.log(result);
        }
      )
    }
  }

  trackByFunction(element: any) {
    return element._id;
  }

  onChange(event: any, type: any) {
    if (!type.workstation[type.name]) {
      type.workstation[type.name] = {};
    }
    type.workstation[type.name][type.type] = {
      nPrinterId: event,
      nComputerId: type.workstation.nPrintNodeComputerId
    };
    this.savePrintSetting(type);
  }

  getSelectedValue(event: any) {
    if (!event.workstation.nPrintNodeComputerId) return '';
    let value = event.workstation && event.workstation[event.name] && event.workstation[event.name][event.type] ? event.workstation[event.name][event.type]?.nPrinterId : '';
    if (value == '') {
      let method = event.name == 'LABEL' ? 'labelDefinition' : event.name.toLowerCase()
      value = this.businessPrintSettings.filter((setting: any) => {
        return setting.iWorkstationId == event.workstation._id &&
          setting.nComputerId == event.workstation?.nPrintNodeComputerId &&
          setting?.sMethod == method && setting?.sType == event.type;
      })[0]?.nPrinterId || '';
    }
    return value;
  }

  fetchPrintSettings() {
    let reqData = { iBusinessId: this.businessDetails._id, iLocationId: this.iLocationId };
    this.apiService.postNew('cashregistry', '/api/v1/print-settings/list/' + this.businessDetails._id, reqData).subscribe(
      (result: any) => {
        if (result?.data[0]?.result?.length > 0) {
          this.businessPrintSettings = result.data[0].result;
        }
      }
    )
  }
}
