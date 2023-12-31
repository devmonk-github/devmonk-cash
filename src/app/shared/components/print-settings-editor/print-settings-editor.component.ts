import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../../service/api.service';
import { DialogComponent } from '../../service/dialog';
import { ToastService } from '../toast';

@Component({
  selector: 'app-print-settings-editor',
  templateUrl: './print-settings-editor.component.html',
  styleUrls: ['./print-settings-editor.component.scss']
})
export class PrintSettingsEditorComponent implements OnInit {

  dialogRef: DialogComponent;
  faTimes = faTimes;
  format: any;
  jsonData: any = {};
  oTemplate: any = {
    layout: {}
  };

  iBusinessId: any = localStorage.getItem('currentBusiness');
  iLocationId: any = localStorage.getItem('currentLocation');
  layout: any;
  oSettings: any = {};
  aDefaultSettings: any = [
    {
      sTitle: 'Business logo',
      sParameter: 'logo',
      bShow: true,
      eType: 'switch'
    },
    {
      sTitle: 'Orientation',
      sParameter: 'orientation',
      eOptions: ['portrait', 'landscape'],
      value: 'portrait',
      eType: 'dropdown'
    },
    {
      sTitle: 'PDF Method',
      sParameter: 'pdfMethod',
      eOptions: ['PDFMake', 'Javascript'],
      value: 'PDFMake',
      eType: 'dropdown'
    },
    {
      sTitle: 'Page size',
      sParameter: 'pageSize',
      eOptions: ['A4', 'A5', 'A6', 'custom'],
      value: 'A5',
      nWidth: 0,
      nHeight: 0,
      eType: 'dropdown'
    },
    {
      sTitle: 'Page margins',
      sParameter: 'pageMargins',
      eOptions: ['left', 'top', 'right', 'bottom'],
      aValues: [0, 0, 0, 0],
      eType: 'textArray'
    },
    {
      sTitle: 'Font',
      sParameter: 'font',
      value: 'Roboto',
      eOptions: ['Roboto', 'Times New Roman'],
      eType: 'dropdown'
    },
    {
      sTitle: 'Font size',
      sParameter: 'fontSize',
      value: 10,
      eType: 'text'
    },
  ];
  mode !: string;
  @ViewChild('jsonEditor') jsonEditor!: any

  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
    private toastService: ToastService,
  ) {
    const _injector = this.viewContainerRef.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit() {
    const aParameters = ['logo', 'orientation', 'pdfMethod', 'pageSize', 'pageMargins', 'font', 'fontSize'];
    aParameters.forEach((el: any) => this.oSettings[el] = {});
    this.fetchSettings();
  }

  async fetchSettings() {
    const result: any = await this.apiService.getNew('cashregistry', `/api/v1/pdf/templates/${this.iBusinessId}?eType=${this.format.key}&iLocationId=${this.iLocationId}`).toPromise();
    if (result?.data) {
      this.mode = 'update';
      this.oTemplate = result.data;
      this.jsonEditor.jsonData = result.data.layout;
      // if (!result.data?.aSettings?.length) this.oTemplate.aSettings = this.getDefaultSettings();
      // else this.mapWithDefaultSettings();
    } else {
      this.mode = 'create';
      // this.oTemplate.aSettings = this.getDefaultSettings();
    }

    if (result?.data?.aSettings?.length) this.mapWithDefaultSettings();
    else this.oTemplate.aSettings = this.getDefaultSettings();

    this.oTemplate.aSettings.forEach((oSettings: any) => {
      this.oSettings[oSettings.sParameter] = oSettings;
    })
    this.oSettings.bLoaded = true;
  }

  mapWithDefaultSettings() {
    this.aDefaultSettings.forEach((defaultSetting: any) => {
      const oMatch = this.oTemplate.aSettings.find((setting: any) => setting.sParameter === defaultSetting.sParameter);
      if (oMatch) {
        oMatch.eOptions = defaultSetting?.eOptions;
        oMatch.eType = defaultSetting?.eType;
      } else {
        this.oTemplate.aSettings.push(defaultSetting);
      }
    });
  }
  
  getDefaultSettings() {
    return [...this.aDefaultSettings];
  }

  saveSettings() {
    if (this.mode === 'update') {
      const oBody = {
        layout: this.jsonEditor.jsonData,
        aSettings: this.oTemplate.aSettings,
        iTemplateId: this.oTemplate._id,
        iBusinessId: this.iBusinessId
      }

      this.apiService.putNew('cashregistry', `/api/v1/pdf/templates/${this.oTemplate._id}`, oBody).subscribe((result: any) => {
        this.toastService.show({ type: 'success', text: 'Your settings are successfully saved!' });
      }, (err: any) => {
        this.toastService.show({ type: 'danger', text: 'Error occured!' });
      });
    } else {
      const oBody = {
        layout: this.jsonEditor.jsonData,
        aSettings: this.oTemplate.aSettings,
        iTemplateId: this.oTemplate._id,
        iBusinessId: this.iBusinessId,
        iLocationId: this.iLocationId,
        eType: this.format.key,
        sName: this.format.value
      }
      this.apiService.postNew('cashregistry', `/api/v1/pdf/templates/create`, oBody).subscribe((result: any) => {
        this.toastService.show({ type: 'success', text: 'Your settings are successfully saved!' });
      }, (err: any) => {
        this.toastService.show({ type: 'danger', text: 'Error occured!' });
      });
    }
  }

  close(data: any) {
    this.dialogRef.close.emit(data);
  }
}
