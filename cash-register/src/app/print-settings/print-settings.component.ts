import { Component, OnInit } from '@angular/core';
import { faRefresh, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { LabelTemplateModelComponent } from 'src/app/print-settings/label-template-model/label-template-model.component';
import { PrintSettingsDetailsComponent } from '../shared/components/print-settings-details/print-settings-details.component';
import { DialogService } from '../shared/service/dialog';

@Component({
  selector: 'app-print-settings',
  templateUrl: './print-settings.component.html',
  styleUrls: ['./print-settings.component.sass']
})
export class PrintSettingsComponent {

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

  constructor(
    private dialogService: DialogService
  ) { }

  createPrintSettings() {
    this.dialogService.openModal(PrintSettingsDetailsComponent, { cssClass: "modal-xl", context: { mode: 'create' } }).instance.close.subscribe(result => { });
  }

  trackByFun(index: any, item: any) {
    return index;
  }

  openLabelTemplateModal() {
    this.dialogService.openModal(LabelTemplateModelComponent, {
      cssClass: "modal-xl  w-100"
    })
  }

}
