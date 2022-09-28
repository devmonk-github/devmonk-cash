import { ifStmt } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit } from '@angular/core';
import { faRefresh, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { LabelTemplateModelComponent } from 'src/app/print-settings/lable-template-model/label-template-model.component';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { ToastService } from 'src/app/shared/components/toast';
import { ApiService } from 'src/app/shared/service/api.service';
import { PrintSettingsDetailsComponent } from '../shared/components/print-settings-details/print-settings-details.component';
import { DialogService } from '../shared/service/dialog';

@Component({
  selector: 'app-print-settings',
  templateUrl: './print-settings.component.html',
  styleUrls: ['./print-settings.component.sass']
})
export class PrintSettingsComponent implements OnInit {

  faRefresh = faRefresh;
  faPencilAlt = faPencilAlt;
  loading: boolean = false;
  business: any;
  device: any = {
    name: 'Shubham`s device'
  };
  newLabel: boolean = false;
  newPrinter: boolean = false;
  oldLabelList: Array<any> = [
    'Any'
  ]
  newLabelList: Array<any> = [
    'Any'
  ]
  layouts: Array<any> = [
    'Any'
  ]
  printers: Array<any> = [
    'Any'
  ]
  pageFormats: Array<any> = [
    'Any',
    'Transaction receipt'
  ];

  aTemplates: Array<any> = [
    {
      sTitle: 'Transaction Receipt',
      aSettings: [
        {
          sTitle: 'Business logo',
          sParameter: 'logo',
          bShow: true,
          type: 'switch'
        },
        {
          sTitle: 'Orientation',
          sParameter: 'orientation',
          eOptions: ['portrait', 'landscape'],
          value: 'portrait',
          type: 'dropdown'
        },
        {
          sTitle: 'Page size',
          sParameter: 'pageSize',
          eOptions: ['A4', 'A5','custom'],
          value: 'A5',
          width:0,
          height:0,
          type: 'dropdown'
        },
        {
          sTitle: 'Page margins',
          sParameter: 'pageMargins',
          eOptions: ['left', 'top','right', 'bottom'],
          values: [0,0,0,0],
          type: 'textArray'
        },
        {
          sTitle: 'Font size',
          sParameter: 'fontSize',
          value: 10,
          type: 'text'
        }
      ]
    },
    {
      sTitle: 'Activity Receipt',
      aSettings: [
        {
          sTitle: 'Orientation',
          sParameter: 'orientation',
          eOptions: ['portrait', 'landscape'],
          value: 'portrait',
          type: 'dropdown'
        },
        {
          sTitle: 'Page size',
          sParameter: 'pageSize',
          eOptions: ['A4', 'A5'],
          value: 'A5',
          type: 'dropdown'
        },
        {
          sTitle: 'Page margins',
          sParameter: 'pageMargins',
          eOptions: ['left', 'top', 'right', 'bottom'],
          values: [0, 0, 0, 0],
          type: 'textArray'
        }
      ]
    }
  ]
  iBusinessId: string = '';
  iLocationId: string = '';
  isLoadingDefaultLabel: boolean = false;
  isLoadingTemplatesLabel: boolean = false;
  defaultLabelsData: Array<TemplateJSON> = []
  LabelTemplatesData: Array<TemplateJSON> = []

  constructor(
    private dialogService: DialogService,
    private toastService: ToastService,
    private apiService: ApiService,

  ) { }

  ngOnInit(): void {
    this.iBusinessId = localStorage.getItem('currentBusiness') || '';
    this.iLocationId = localStorage.getItem('currentLocation') || '';
    this.isLoadingDefaultLabel = true
    this.isLoadingTemplatesLabel = true
    this.getLabelTemplate()
  }

  createPrintSettings() {
    this.dialogService.openModal(PrintSettingsDetailsComponent, { cssClass: "modal-xl", context: { mode: 'create' } }).instance.close.subscribe(result => { });
  }

  trackByFun(index: any, item: any) {
    return index;
  }


  openLabelTemplateModal(jsonData: TemplateJSON, mode: 'create' | 'edit') {
    if (mode === 'create') {
      jsonData.readOnly = false
      jsonData.iBusinessId = this.iBusinessId
      jsonData.iLocationId = this.iLocationId
      delete jsonData.dCreatedDate
      delete jsonData.dUpdatedDate
      delete jsonData._id
      delete jsonData.__v
    }
    const dialogRef = this.dialogService.openModal(LabelTemplateModelComponent, {
      cssClass: "modal-xl w-100",
      context: {
        mode,
        jsonData
      }
    })

    dialogRef.instance.close.subscribe(async (result) => {
      if (result) {

        this.isLoadingTemplatesLabel = true

        if (mode === 'create') {
          await this.createLabelTemplate(result)
          this.getLabelTemplate()
        }
        if (mode === 'edit') {
          await this.updateLabelTemplate(result._id.toString(), result)
          this.getLabelTemplate()
          // this.toastService.show({ type: 'warning', text: 'TODO: add put api in backend' });
        }
      }
      console.log(result);

    });
  }

  async getLabelTemplate(): Promise<any[]> {
    // await this.postLabelTemplate()
    return new Promise((resolve, reject) => {
      this.apiService.getNew('cashregistry', `/api/v1/label/templates/${this.iBusinessId}`).subscribe((result: any) => {
        console.log({ LabelTemplates: result })
        this.defaultLabelsData = result.data.filter((lable: any) => lable.readOnly)
        this.LabelTemplatesData = result.data.filter((lable: any) => !lable.readOnly)
        this.isLoadingTemplatesLabel = false
        this.isLoadingDefaultLabel = false

        resolve(result.data)
      }, (error) => {
        this.isLoadingTemplatesLabel = false
        this.isLoadingDefaultLabel = false
        console.log('error: ', error);
        resolve(error)
      })
    });
  }

  createLabelTemplate(jsonData: TemplateJSON) {
    const oBody = {
      "iBusinessId": jsonData.iBusinessId,
      "iLocationId": jsonData.iLocationId,
      "template": jsonData
    }
    return new Promise(resolve => {

      this.apiService.postNew('cashregistry', `/api/v1/label/templates`, oBody).subscribe((result: any) => {
        console.log(result);
        this.toastService.show({ type: 'success', text: 'label created successfully' });
        resolve(result);
      }, (error) => {
        resolve(error);
        console.log('error: ', error);
        this.toastService.show({ type: 'warning', text: 'Something went wrong' });
      })
    })
  }

  updateLabelTemplate(id: string, jsonData: TemplateJSON) {
    const oBody = {
      "iBusinessId": jsonData.iBusinessId,
      "iLocationId": jsonData.iLocationId,
      "template": jsonData
    }
    return new Promise(resolve => {

      this.apiService.putNew('cashregistry', `/api/v1/label/templates/${id.toString()}`, oBody).subscribe((result: any) => {
        console.log(result);
        this.toastService.show({ type: 'success', text: 'label updated successfully' });
        resolve(result);
      }, (error) => {
        resolve(error);
        console.log('error: ', error);
        this.toastService.show({ type: 'warning', text: 'Something went wrong' });
      })
    })
  }

  deleteLabelTemplate(id: any) {
    const buttons = [
      { text: 'YES', value: true, status: 'success', class: 'btn-primary ml-auto mr-2' },
      { text: 'NO', value: false, class: 'btn-danger ' }
    ]
    this.dialogService.openModal(ConfirmationDialogComponent, {
      context: {
        header: 'REMOVE_LABEL_TEMPLATE',
        bodyText: 'ARE_YOU_SURE_TO_REMOVE_THIS_LABEL_TEMPLATE',
        buttonDetails: buttons
      }
    })
      .instance.close.subscribe(
        (result) => {
          console.log(result)
          if (result) {
            this.isLoadingTemplatesLabel = true

            this.apiService.deleteNew('cashregistry', `/api/v1/label/templates/${id.toString()}`).subscribe((result: any) => {
              console.log(result);
              this.getLabelTemplate()
              this.toastService.show({ type: 'success', text: 'label deleted successfully' });

            }, (error) => {
              console.log('error: ', error);
              this.toastService.show({ type: 'warning', text: 'Something went wrong' });
              this.isLoadingTemplatesLabel = false

            })
          }

        }
      )
  }

  saveTemplateSettings(){

  }


}
// Generated by https://quicktype.io

export interface TemplateJSON {
  _id?: String;
  __v?: String;
  readOnly: boolean;
  inverted: boolean;
  encoding: number;
  media_darkness: number;
  media_type: string;
  disable_upload: boolean;
  can_rotate: boolean;
  alternative_price_notation: boolean;
  dpmm: number;
  height: number;
  width: number;
  labelleft: number;
  labeltop: number;
  offsetleft: number;
  offsettop: number;
  elements: TemplateJSONElement[];
  layout_name: string;
  name: string;
  iBusinessId: string;
  iLocationId: string;
  dCreatedDate?: string;
  dUpdatedDate?: string;
}

export interface TemplateJSONElement {
  _id?: string;
  sType: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  visible?: string;
  pnfield?: string;
  charwidth?: number;
  charheight?: number;
  euro_prefix?: boolean;
}
