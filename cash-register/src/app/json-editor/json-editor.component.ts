import { Component, Input, OnInit } from '@angular/core';
import { JsonEditorOptions } from "ang-jsoneditor";

@Component({
  selector: 'app-json-editor',
  templateUrl: './json-editor.component.html',
  styleUrls: ['./json-editor.component.scss'],
})
export class JsonEditorComponent implements OnInit {

  public editorOptions: JsonEditorOptions;
  @Input() initialData: any;
  public jsonData: any;

  constructor() {
    this.editorOptions = new JsonEditorOptions()
    this.editorOptions.modes = ['code', 'text', 'tree', 'view', 'form'];
    this.editorOptions.mode = 'tree';

  }
  ngOnInit() {
    this.jsonData = this.initialData;

  }
  showJson(d: Event) {
    this.jsonData = d;
  }
}
