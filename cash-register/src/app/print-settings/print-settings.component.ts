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
  ]
  iBusinessId: string = '';
  iLocationId: string = '';
  isLoadingLabel: boolean = false;
  defaultLabelsData: Array<any> = []
  LabelTemplatesData: Array<any> = []

  constructor(
    private dialogService: DialogService,
    private toastService: ToastService,
    private apiService: ApiService,

  ) { }

  ngOnInit(): void {
    this.iBusinessId = localStorage.getItem('currentBusiness') || '';
    this.iLocationId = localStorage.getItem('currentLocation') || '';
    this.getLabelTemplate()
  }

  createPrintSettings() {
    this.dialogService.openModal(PrintSettingsDetailsComponent, { cssClass: "modal-xl", context: { mode: 'create' } }).instance.close.subscribe(result => { });
  }

  trackByFun(index: any, item: any) {
    return index;
  }

  openLabelTemplateModal(jsonData: any, mode: 'create' | 'edit') {
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

    dialogRef.instance.close.subscribe(result => {
      if (result) {

        if (mode === 'create') {
          this.createLabelTemplate(result)
          this.getLabelTemplate()
        }
        if (mode === 'edit') {
          this.toastService.show({ type: 'warning', text: 'TODO: add put api in backend' });

        }
      }
      console.log(result);

    });
  }

  async getLabelTemplate(): Promise<any[]> {
    // await this.postLabelTemplate()
    return new Promise((resolve, reject) => {
      this.isLoadingLabel = true
      this.apiService.getNew('cashregistry', `/api/v1/label/templates/${this.iBusinessId}`).subscribe((result: any) => {
        console.log({ LabelTemplates: result })
        this.defaultLabelsData = result.data.filter((lable: any) => lable.readOnly)
        this.LabelTemplatesData = result.data.filter((lable: any) => !lable.readOnly)
        this.isLoadingLabel = false

        resolve(result.data)
      }, (error) => {
        this.isLoadingLabel = false

        console.log('error: ', error);
        resolve(error)
      })
    });
  }

  createLabelTemplate(jsonData: any) {
    const oBody = {
      "iBusinessId": jsonData.iBusinessId,
      "iLocationId": jsonData.iLocationId,
      "template": jsonData
    }
    return new Promise(resolve => {

      this.apiService.postNew('cashregistry', `/api/v1/label/templates/create`, oBody).subscribe((result: any) => {
        console.log(result);
        this.toastService.show({ type: 'success', text: 'Item added' });
        resolve(result);
      }, (error) => {
        resolve(error);
        console.log('error: ', error);
        this.toastService.show({ type: 'warning', text: 'Something went wrong' });
      })
    })
  }
  deleteLabelTemplate(id: string) {
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
        result => {
          console.log(result)
          this.toastService.show({ type: 'warning', text: 'TODO: add delete api in backend' });

        }
      )
  }

}
