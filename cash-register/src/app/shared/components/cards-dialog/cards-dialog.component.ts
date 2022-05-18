import { Component, OnInit, Input, Output, EventEmitter, ViewContainerRef, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { fromEvent } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import * as _ from 'lodash';
import { ApiService } from '../../service/api.service';
import { DialogComponent } from '../../service/dialog';
import { ToastService } from '../toast';

@Component({
  selector: 'app-cards-dialog',
  templateUrl: './cards-dialog.component.html',
  styleUrls: ['./cards-dialog.component.scss']
})
export class CardsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('searchgift') input!: ElementRef;

  dialogRef: DialogComponent;
  faTimes = faTimes;
  faSpinner = faSpinner;
  currentEmployeeId: any;
  iBusinessId: any;
  sGiftCardNumber = '';
  giftCardDetails: any;
  fetchInProgress = false;
  appliedGiftCards: Array<any> = [];
  nAmount = 0;
  customer: any;
  // elem ref
  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService
  ) {
    const _injector = this.viewContainerRef.injector;;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit() {
    console.log('oninit');
    this.customer = this.dialogRef.context.customer;
    this.iBusinessId = localStorage.getItem('currentBusiness');
    console.log(this.customer);
    // this.fetchGiftCard();
  }

  ngAfterViewInit(): void {
    // wait .5s between keyups to emit current value
    const keyup$ = fromEvent(this.input.nativeElement, 'keyup')
    keyup$.pipe(
      map((i: any) => i.currentTarget.value),
      debounceTime(500)
    )
      .subscribe((value) => {
        console.log('value is', value);
        this.fetchGiftCard(value);
      });
  }
  close(data: any) {
    this.dialogRef.close.emit(data);
  }

  fetchGiftCard(sGiftCardNumber: string) {
    if (4 > sGiftCardNumber.length) {
      return;
    }
    this.fetchInProgress = true;
    // '1652816053496'
    const url = `/api/v1/activities/giftcard?iBusinessId=${this.iBusinessId}&sGiftCardNumber=${sGiftCardNumber}`;
    this.apiService.getNew('cashregistry', url).subscribe((result: any) => {
      console.log(result);
      this.giftCardDetails = result;

      this.fetchInProgress = false;
    }, (error) => {
      alert(error.error.message);
      this.dialogRef.close.emit('data');
      this.fetchInProgress = false;
    });
  }

  // useThisCard(card: any) {

  //   console.log(card);
  //   this.appliedGiftCards.push(card);
  //   console.log(this.appliedGiftCards)
  // }
  submit() {
    console.log(this.giftCardDetails, this.nAmount);
    this.giftCardDetails['nAmount'] = this.nAmount;
    this.close(this.giftCardDetails);
  }

  ngOnDestroy(): void {

    // this.keyup$.unsubscribe();
  }
}
