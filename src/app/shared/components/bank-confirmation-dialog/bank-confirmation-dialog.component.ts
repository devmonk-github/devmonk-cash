import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../../service/api.service';
import { DialogComponent, DialogService } from '../../service/dialog';


@Component({
  selector: 'app-bank-confirmation-dialog',
  templateUrl: './bank-confirmation-dialog.component.html',
  styleUrls: ['./bank-confirmation-dialog.component.sass']
})
export class BankConfirmationDialogComponent implements OnInit {

  faTimes = faTimes;
  dialogRef: DialogComponent;
  transaction:any;
  bankConfirmation:any ={
    dDateConfirmed:Date.now(),
    nAmount:0
  }
  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
    private dialogService: DialogService,
  ) {
    const _injector = this.viewContainerRef.injector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);

   }

  ngOnInit(): void {
   console.log("transaction" , this.transaction);
  }

  bankConfirmed(){
    console.log("--------------bank confirmed---------------");

  }

  close(data: any) {
    this.dialogRef.close.emit(data);
  }


}
