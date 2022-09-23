import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
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
    this.close(this.jsonEditor.jsonData)
  }
  close(data: any) {
    this.dialogRef.close.emit(data);
  }
}
