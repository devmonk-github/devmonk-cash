import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { DialogComponent, DialogService } from "../../service/dialog";
import { TillService } from '../../service/till.service';
import { AddExpensesComponent } from '../add-expenses-dialog/add-expenses.component';

@Component({
  selector: 'app-closing-daystate-helper-dialog',
  templateUrl: './closing-daystate-helper-dialog.component.html',
  styleUrls: ['./closing-daystate-helper-dialog.component.sass']
})
export class ClosingDaystateHelperDialogComponent implements OnInit {
  dialogRef: DialogComponent
  faTimes = faTimes;
  oHelperDetails:any = {
    oStartAmountIncorrect: {
      bChecked: false,
      nAmount: 0
    },
    bCantCloseDueToDifference: false,
    bWrongDayEndCash: false,
    aReasons: [
      { nAmount: 0}
    ]
  }

  aReasons:any = [
    { sKey: 'lost-money', sTitle: 'LOST_MONEY' },
    { sKey: 'add-expenses', sTitle: 'WANT_TO_ADD_EXPENSES' },
    { sKey: 'cash-to-add-without-revenue', sTitle: 'FOUND_CASH_TO_BE_ADDED_NO_REVENUE' },
    { sKey: 'cash-should-higher', sTitle: 'CASH_SHOULD_BE_HIGHER_BECAUSE_SOLD_SOMETHING_WITHOUT_USING_CASH_REGISTER' },
    { sKey: 'cash-should-lower', sTitle: 'CASH_SHOULD_BE_LOWER_BUT_NOT_USED_CASH_REGISTER' },
  ];
  aAllReasons:any = JSON.parse(JSON.stringify(this.aReasons));
  paymentMethod:any;

  constructor(
    private viewContainerRef: ViewContainerRef,
    public tillService: TillService,
    private dialogService: DialogService) {
    const _injector = this.viewContainerRef.parentInjector
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit() {
    this.oHelperDetails?.aReasons.forEach((oReason:any) => {
      if (oReason.sKey) {
        const oItem = this.aReasons.find((el: any) => el.sKey == oReason.sKey)
        oItem.selected = true;
        oReason.selected = true;
        oReason.sTitle = oItem.sTitle;
      } 
    });
  }

  reset() {
    this.oHelperDetails = {
      oStartAmountIncorrect: { bChecked: false, nAmount: 0 },
      bCantCloseDueToDifference: false,
      bWrongDayEndCash: false,
      aReasons: [{ nAmount: 0 }]
    };

    this.aReasons.forEach((el:any) => el.selected = false)
  }

  close(data:any) {
    this.dialogRef.close.emit(data)
  }    

  addMoreReasons() {
    this.oHelperDetails.aReasons.push({ nAmount: 0 });
  }

  async onChange(key:any, oReason: any) {
    const oItem = this.aReasons.find((el: any) => el.sKey == key);
    oItem.selected = true;
    oReason.sTitle = oItem.sTitle;
    
    if (key == 'add-expenses') {
      this.dialogService.openModal(AddExpensesComponent,
        {
          cssClass: 'modal-m',
          context: {
            paymentMethod: this.paymentMethod.find((o: any) => o.sName.toLowerCase() === 'cash'),
            taxes: this.tillService.taxes
          },
          hasBackdrop: true,
        }).instance.close.subscribe(result => { 
          if(result) {
            oReason.nAmount = result.nRevenueAmount;
          }
        });
    }
  }
}
