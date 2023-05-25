import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { DialogComponent } from '../../service/dialog';
import { ApiService } from '../../service/api.service';
import { ToastService } from '../toast';
import { TranslateService } from '@ngx-translate/core';
import { TillService } from '../../service/till.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-set-payment-method-sequence',
  templateUrl: './set-payment-method-sequence.component.html',
  styleUrls: ['./set-payment-method-sequence.component.sass']
})
export class SetPaymentMethodSequenceComponent implements OnInit {

  dialogRef: DialogComponent;
  payMethods: any;
  iBusinessId: any = localStorage.getItem('currentBusiness');
  iLocationId: any = localStorage.getItem('currentLocation');
  bSaving = false
  aPaymentMethodSequence: any = [];

  constructor(
    private viewContainer: ViewContainerRef,
    private apiService: ApiService,
    private toastService: ToastService,
    private translateService: TranslateService,
    private tillService: TillService

  ) {
    const _injector = this.viewContainer.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit() {
    // console.log(this.payMethods)
    if (!this.aPaymentMethodSequence?.length) this.aPaymentMethodSequence = this.payMethods.map((el: any) => el._id)
    else {
      const aPaymentMethods:any = []
      this.aPaymentMethodSequence.forEach((iPaymentMethodId:any) => {
        aPaymentMethods.push(this.payMethods.find((el: any) => el._id === iPaymentMethodId))
      })
      this.payMethods = aPaymentMethods;
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.payMethods, event.previousIndex, event.currentIndex);
    this.aPaymentMethodSequence = this.payMethods.map((el:any) => el._id)
  }

  saveSequence() {
    const oBody = {
      aPaymentMethodSequence: this.aPaymentMethodSequence
    }
    this.bSaving = true;
    this.apiService.putNew('cashregistry', '/api/v1/settings/update/' + this.iBusinessId, oBody).subscribe((result: any) => {
      this.toastService.show({ type: 'success', text: 'Updated successfully!' });
      this.bSaving = false;
      this.close(true, result)
    })
  }

  close(action: boolean, data:any = {}) {
    this.dialogRef.close.emit({ action: action, data })
  }
}
