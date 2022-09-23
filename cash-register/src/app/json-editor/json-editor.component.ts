import { Component, OnInit } from '@angular/core';
import { JsonEditorOptions } from "ang-jsoneditor";

@Component({
  selector: 'app-json-editor',
  templateUrl: './json-editor.component.html',
  styleUrls: ['./json-editor.component.scss'],
})
export class JsonEditorComponent implements OnInit {

  public editorOptions: JsonEditorOptions;
  public initialData: any;
  public jsonData: any;

  constructor() {
    this.editorOptions = new JsonEditorOptions()
    this.editorOptions.modes = ['code', 'text', 'tree', 'view', 'form'];
    this.editorOptions.mode = 'tree';
    this.initialData = {
      readOnly: false,
      inverted: false,
      encoding: 28,
      media_darkness: 4,
      media_type: 'T',
      disable_upload: false,
      can_rotate: true,
      alternative_price_notation: false,
      _id: '61fa892aed11d7290f49a704',
      __v: 0,
      dateCreated: '2020-09-09T10:04:53.243Z',
      dpmm: 8,
      elements: [
        {
          type: 'rectangle',
          x: '1',
          y: '1',
          width: '176',
          height: '79',
        },
        {
          type: 'rectangle',
          x: '176',
          y: '1',
          width: '176',
          height: '79',
        },
        {
          type: 'barcode',
          x: '8',
          y: '8',
          height: '15',
          visible: true,
          pnfield: '%%ARTICLE_NUMBER%%',
        },
        {
          type: 'scalabletext',
          charwidth: 22,
          charheight: 22,
          x: '8',
          y: '30',
          euro_prefix: true,
          pnfield: ' %%SELLING_PRICE%%',
        },
        {
          type: 'scalabletext',
          charwidth: 16,
          charheight: 16,
          x: '8',
          y: '53',
          pnfield: '%%ARTICLE_NUMBER%%1',
        },
        {
          type: 'scalabletext',
          charwidth: 16,
          charheight: 16,
          x: '184',
          y: '8',
          pnfield: '%%PRODUCT_NUMBER%%',
        },
        {
          type: 'datamatrix',
          x: '184',
          y: '42',
          height: 15,
          width: 15,
          visible: true,
          pnfield: 'IW21233221',
          override: true,
        },
        {
          type: 'scalabletext',
          charwidth: 16,
          charheight: 16,
          x: '184',
          y: '26',
          pnfield: 'IW21233221',
        },
      ],
      height: 10,
      labelleft: 0,
      labeltop: 0,
      layout_name: 'LAYOUT1',
      name: 'Standaard 72mm (44 1072)',
      offsetleft: 0,
      offsettop: 0,
      shopId: '5f68b68defa1921dbc1e7493',
      width: 72,
    };
    this.jsonData = this.initialData;
  }
  ngOnInit() {

  }
  showJson(d: Event) {
    this.jsonData = d;
  }
}
