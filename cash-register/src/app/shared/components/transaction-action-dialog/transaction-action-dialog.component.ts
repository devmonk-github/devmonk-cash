import { Component, Input, OnInit, ViewContainerRef, ViewChildren, QueryList, ElementRef, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { faTimes, faSearch, faSpinner, faRefresh, faCheck } from "@fortawesome/free-solid-svg-icons";
import * as _ from 'lodash';

import { DialogComponent } from "../../service/dialog";
import { TerminalService } from '../../service/terminal.service';
import { ToastService } from '../toast';
import { ReceiptService } from '../../service/receipt.service';
import * as JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-transaction-action',
  templateUrl: './transaction-action-dialog.component.html',
  styleUrls: ['./transaction-action-dialog.component.scss']
})
export class TransactionActionDialogComponent implements OnInit {
  dialogRef: DialogComponent

  faTimes = faTimes;
  faSearch = faSearch;
  faSpinner = faSpinner;
  faRefresh = faRefresh;
  faCheck = faCheck;
  loading = false;
  showLoader = false;
  transaction: any;
  activityItems: any;
  printActionSettings: any;
  printSettings: any;
  nRepairCount: number = 0;
  nOrderCount: number = 0;
  aTypes = ['regular', 'order', 'repair', 'giftcard', 'repair_alternative'];
  aActionSettings = ['DOWNLOAD', 'PRINT_THERMAL', 'PRINT_PDF']
  aUniqueTypes:any = [];
  aRepairItems: any = [];
  aTemplates: any = [];
  aRepairActionSettings: any;
  aRepairAlternativeActionSettings: any;
  usedActions: boolean = false;

  constructor(
    private viewContainer: ViewContainerRef,
    private receiptService: ReceiptService,) {
    const _injector = this.viewContainer.injector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit(): void {

    this.aRepairItems = this.activityItems.filter((item:any)=> item.oType.eKind === 'repair');
    
    const bRegularCondition = this.transaction.total > 0.02 || this.transaction.total < -0.02;
    const bOrderCondition = this.nOrderCount === 1 && this.nRepairCount === 1 || this.nRepairCount > 1 || this.nOrderCount > 1;
    
    if(bRegularCondition) this.aUniqueTypes.push('regular');
    if(bOrderCondition) this.aUniqueTypes.push('order');
    this.aUniqueTypes = [...new Set(this.aUniqueTypes)]
    // console.log(this.transaction, this.aUniqueTypes);
  }

  close(data: any): void {
    this.dialogRef.close.emit(this.usedActions)
  }

  performAction(type:any, action:any, index?:number){
    this.usedActions = true;
    // console.log(type, action, this.printSettings, this.aTemplates)

    if(index != undefined && type==='repair'){
      // console.log('repair items index=', index, this.aRepairItems[index], this.activityItems);
      const oDataSource = this.aRepairItems[index];
      const aTemp = oDataSource.sNumber.split("-");
      oDataSource.sPartRepairNumber = aTemp[aTemp.length - 1];

      const template = this.aTemplates.filter((template: any) => template.eType === 'repair')[0];
      oDataSource.sBarcodeURI = this.generateBarcodeURI(false, oDataSource.sNumber);
      oDataSource.oCustomer = this.transaction.oCustomer
      // console.log(oDataSource)
      // console.log('sending for receipt, ', oDataSource)
      this.receiptService.exportToPdf({
        oDataSource: oDataSource,
        pdfTitle: oDataSource.sNumber,
        templateData: template,
        printSettings: this.printSettings.filter((s:any) => s.sType === type),
        sAction: (action === 'DOWNLOAD') ? 'download' : (action === 'PRINT_PDF') ? 'print' : 'thermal',
      });
    } else if(type==='regular') {
      const template = this.aTemplates.filter((template: any) => template.eType === 'regular')[0];
      this.receiptService.exportToPdf({
        oDataSource: this.transaction,
        pdfTitle: this.transaction.sNumber,
        templateData: template,
        printSettings: this.printSettings.filter((s: any) => s.sType === type),
        sAction: (action === 'DOWNLOAD') ? 'download' : (action === 'PRINT_PDF') ? 'print' : 'thermal',
      });
    }
      
  }

  generateBarcodeURI(displayValue: boolean = true, data: any) {
    var canvas = document.createElement("canvas");
    JsBarcode(canvas, data, { format: "CODE128", displayValue: displayValue });
    return canvas.toDataURL("image/png");
  }

}
