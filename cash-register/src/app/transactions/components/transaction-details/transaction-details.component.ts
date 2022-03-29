import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { DialogComponent } from 'src/app/shared/service/dialog';

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.sass']
})
export class TransactionDetailsComponent implements OnInit {

  transactionId!: string;
  dialogRef: DialogComponent;
  faTimes = faTimes;

  constructor(
    private viewContainerRef: ViewContainerRef
  ) {
    const _injector = this.viewContainerRef.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit(): void {
  }

  close(){
    this.dialogRef.close.emit();
  }
}
