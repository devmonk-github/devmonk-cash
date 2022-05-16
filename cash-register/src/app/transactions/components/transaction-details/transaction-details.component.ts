import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
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
  transaction: any = { };
  iBusinessId: string = '';
  loading: boolean = true;

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
      this.transaction = result.data;
      this.loading = false;
    }, (error) => {
      this.loading = false;
      console.log('printing error', error);
    })
  }
}
