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
  aUniqueTypes: any = [];
  aRepairItems: any = [];
  aTemplates: any = [];
  aRepairActionSettings: any;
  aRepairAlternativeActionSettings: any;
  usedActions: boolean = false;
  businessDetails:any;
  bRegularCondition: boolean = false;
  bOrderCondition: boolean = false;
  bGiftcardCondition: boolean = false;

  constructor(
    private viewContainer: ViewContainerRef,
    private receiptService: ReceiptService,) {
    const _injector = this.viewContainer.injector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit(): void {
    this.aRepairItems = this.activityItems.filter((item: any) => item.oType.eKind === 'repair');

    this.bRegularCondition = this.transaction.total > 0.02 || this.transaction.total < -0.02;
    this.bOrderCondition = this.nOrderCount === 1 && this.nRepairCount === 1 || this.nRepairCount > 1 || this.nOrderCount > 1;


    if (this.bRegularCondition) this.aUniqueTypes.push('regular');
    if (this.bOrderCondition) this.aUniqueTypes.push('order');
    // console.log(this.transaction)
    if (this.transaction.aTransactionItemType.includes('giftcard')){
      this.bGiftcardCondition = true;
      this.aUniqueTypes.push('giftcard')
    }
    this.aUniqueTypes = [...new Set(this.aUniqueTypes)]
    // console.log(this.transaction, this.aUniqueTypes);
  }

  close(data: any): void {
    this.dialogRef.close.emit(this.usedActions)
  }

  performAction(type: any, action: any, index?: number) {
    this.usedActions = true;
    let oDataSource = undefined;
    let template = undefined;
    let pdfTitle = '';

    if (index != undefined && (type === 'repair' || type === 'repair_alternative')) {
      // console.log('repair items index=', index, this.aRepairItems[index], this.activityItems);
      oDataSource = this.aRepairItems[index];
      const aTemp = oDataSource.sNumber.split("-");
      oDataSource.sPartRepairNumber = aTemp[aTemp.length - 1];

      template = this.aTemplates.filter((template: any) => template.eType === type)[0];
      oDataSource.sBarcodeURI = this.generateBarcodeURI(false, oDataSource.sNumber);
      oDataSource.oCustomer = this.transaction.oCustomer
      oDataSource.businessDetails = this.businessDetails;
      oDataSource.sAdvisedEmpFirstName = this.transaction.sAdvisedEmpFirstName;
      oDataSource.sBusinessLogoUrl = this.transaction.sBusinessLogoUrl
      pdfTitle = oDataSource.sNumber;
      
    } else if (type === 'regular') {
      oDataSource = this.transaction;
      pdfTitle = this.transaction.sNumber;
      template = this.aTemplates.filter((template: any) => template.eType === 'regular')[0];
    } else if (type === 'giftcard') {
      oDataSource = this.activityItems.filter((item: any) => item.oType.eKind === 'giftcard')[0];
      oDataSource.nTotal = oDataSource.nPaidAmount;
      oDataSource.sBarcodeURI = this.generateBarcodeURI(true, 'G-' + oDataSource.sGiftCardNumber);
      pdfTitle = oDataSource.sGiftCardNumber;
      template = this.aTemplates.filter((template: any) => template.eType === 'giftcard')[0];
    } else if (type === 'order') {
      template = this.aTemplates.filter((template: any) => template.eType === 'order')[0];
      oDataSource = this.transaction;
      oDataSource.sActivityNumber = this.transaction.activity.sNumber;
      pdfTitle = oDataSource.sActivityNumber;
    }
    console.log(111, this.transaction.sNumber)
    if (action == 'PRINT_THERMAL') {
      this.receiptService.printThermalReceipt({
        oDataSource: oDataSource,
        printSettings: this.printSettings.filter((s: any) => s.sType === type),
        sAction: 'thermal',
        apikey: this.businessDetails.oPrintNode.sApiKey,
        title: this.transaction.sNumber
      });
    } else {
      this.receiptService.exportToPdf({
        oDataSource: oDataSource,
        pdfTitle: pdfTitle,
        templateData: template,
        printSettings: this.printSettings.filter((s: any) => s.sType === type),
        sAction: (action === 'DOWNLOAD') ? 'download' : 'print',
      });
    }
  }

  generateBarcodeURI(displayValue: boolean = true, data: any) {
    var canvas = document.createElement("canvas");
    JsBarcode(canvas, data, { format: "CODE128", displayValue: displayValue });
    return canvas.toDataURL("image/png");
  }
}
