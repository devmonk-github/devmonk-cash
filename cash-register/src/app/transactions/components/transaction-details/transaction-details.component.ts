import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { faTimes, faSync, faFileInvoice, faDownload, faReceipt, faAt, faUndoAlt, faClipboard, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from 'src/app/shared/service/api.service';
import { DialogComponent } from 'src/app/shared/service/dialog';

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.sass']
})
export class TransactionDetailsComponent implements OnInit {

  dialogRef: DialogComponent;
  faTimes = faTimes;
  faSync = faSync;
  faFileInvoice = faFileInvoice;
  faDownload = faDownload;
  faReceipt = faReceipt;
  faAt = faAt;
  faUndoAlt = faUndoAlt;
  faClipboard = faClipboard;
  faTrashAlt = faTrashAlt;
  transaction: any = { };
  iBusinessId: string = '';
  loading: boolean = true;
  customerLoading: boolean = true;
  customer: any = { };
  imagePlaceHolder: string = '../../../../assets/images/no-photo.svg';

  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService
  ) {
    const _injector = this.viewContainerRef.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit(): void {
    this.iBusinessId = localStorage.getItem("currentBusiness") || '';
    this.fetchTransaction(this.transaction.sNumber)
  }

  close(){
    this.dialogRef.close.emit();
  }

  fetchTransaction(sNumber: any) {
    if (!sNumber) return;
    this.loading = true;
    this.apiService.postNew('cashregistry', '/api/v1/transaction/detail/' + sNumber, { iBusinessId: this.iBusinessId }).subscribe((result: any) => {
      if(!result?.data?.oCustomer) result.data.oCustomer = this.transaction.oCustomer;
      this.transaction = result.data;
      this.loading = false;
    }, (error) => {
      this.loading = false;
      console.log('printing error', error);
    })
  }
}
