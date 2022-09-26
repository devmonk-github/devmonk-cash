import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { TemplateJSON, TemplateJSONElement } from 'src/app/print-settings/print-settings.component';
import { ToastService } from 'src/app/shared/components/toast';
import { DialogComponent } from 'src/app/shared/service/dialog';

@Component({
  selector: 'app-label-template-model',
  templateUrl: './label-template-model.component.html',
  styleUrls: ['./label-template-model.component.sass']
})
export class LabelTemplateModelComponent implements OnInit {
  @ViewChild('jsonEditor') jsonEditor!: any
  dialogRef: DialogComponent;
  faTimes = faTimes;
  mode: 'create' | 'edit' = 'create'
  jsonData = {}

  constructor(private viewContainerRef: ViewContainerRef,
    private toastService: ToastService,

  ) {
    const _injector = this.viewContainerRef.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit() {
  }
  saveLabelTemplate() {
    console.log(
      { json: this.jsonEditor.jsonData }
    );
    if (this.validateTemplateJson(this.jsonEditor.jsonData))
      this.close(this.jsonEditor.jsonData)
  }
  close(data: any) {
    this.dialogRef.close.emit(data);
  }
  validateTemplateJson(jsonData: TemplateJSON) {
    let json: TemplateJSON = {
      "readOnly": false,
      "inverted": false,
      "encoding": 28,
      "media_darkness": 4,
      "media_type": "T",
      "disable_upload": false,
      "can_rotate": true,
      "alternative_price_notation": false,
      "dpmm": 8,
      "elements": [
        {
          "sType": "",
          "x": 1,
          "y": 1,
          "width": 176,
          "height": 79
        },
      ],
      "height": 10,
      "labelleft": 0,
      "labeltop": 0,
      "layout_name": "",
      "name": "",
      "width": 72,
      offsetleft: 0,
      offsettop: 0,
      iBusinessId: '',
      iLocationId: ''
    }
    let jsonKeys = Object.keys(json)
    let jsonDataKeys = Object.keys(jsonData)
    let isMissingAnyKey = jsonKeys.sort().join() !== jsonDataKeys.sort().join();
    console.log({
      jsonKeys,
      jsonDataKeys,
      isMissingAnyKey
    })
    if (isMissingAnyKey) {
      this.toastService.show({ type: 'warning', text: 'Invalid Json Template' });

      return false
    }
    jsonData.elements.forEach((ele, i) => {
      if (!ele.sType || !ele.x || !ele.y) {
        isMissingAnyKey = true
        this.toastService.show({ type: 'warning', text: 'Invalid Json Template Element ' + (i + 1) });
        console.log({
          ele
        });
      }
    })
    console.log({
      isMissingAnyKey
    });
    return !isMissingAnyKey
  }
}
