import { Component, Input, OnInit, ViewContainerRef, ViewChildren, QueryList, ElementRef, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { faTimes, faSearch, faSpinner, faRefresh, faCheck } from "@fortawesome/free-solid-svg-icons";
import * as _ from 'lodash';

import { DialogComponent } from "../../service/dialog";
import { TerminalService } from '../../service/terminal.service';
import { ToastService } from '../toast';

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
  printActionSettings: any;
  nRepairCount: number = 0;
  nOrderCount: number = 0;
  aTypes = ['regular', 'order', 'repair', 'giftcard', 'repair_alternative'];
  aActionSettings = ['DOWNLOAD', 'PRINT_THERMAL', 'PRINT_PDF']
  aUniqueTypes:any = [];
  aRepairItems: any = [];
  aRepairActionSettings: any;
  aRepairAlternativeActionSettings: any;

  constructor(
    private viewContainer: ViewContainerRef) {
    const _injector = this.viewContainer.injector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit(): void {
    this.aUniqueTypes = [...new Set(this.transaction.aTransactionItemType)]
    console.log(this.aUniqueTypes);
    this.nRepairCount = this.transaction.aTransactionItemType.filter((e: any) => e === 'repair')?.length;
    this.nOrderCount = this.transaction.aTransactionItemType.filter((e: any) => e === 'order')?.length;
    this.aRepairItems = this.transaction.aTransactionItems.filter((item:any)=> item.oType.eKind === 'repair');
    this.aRepairActionSettings = this.printActionSettings.filter((s:any)=> s.eType === 'repair');
    this.aRepairAlternativeActionSettings = this.printActionSettings.filter((s:any)=> s.eType === 'repair_alternative');
  }

  close(data: any): void {
    this.dialogRef.close.emit(data)
  }

}
