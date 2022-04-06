import { Component, OnInit } from '@angular/core';
import { faRefresh, faPencilAlt } from '@fortawesome/free-solid-svg-icons';

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
  printers: Array<any> =[
    'Any'
  ]
  pageFormats: Array<any> = [
    'Any',
    'Transaction receipt'
  ]

  constructor() { }

  ngOnInit(): void {
  }

  trackByFun(index: any, item: any) {
    return index;
  }

}
