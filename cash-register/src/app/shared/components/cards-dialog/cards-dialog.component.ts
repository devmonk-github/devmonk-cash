import { Component, OnInit, Input, Output, EventEmitter, ViewContainerRef, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { fromEvent } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import * as _ from 'lodash';
import { ApiService } from '../../service/api.service';
import { DialogComponent } from '../../service/dialog';
import { ToastService } from '../toast';
import { TerminalService } from '../../service/terminal.service';

@Component({
  selector: 'app-cards-dialog',
  templateUrl: './cards-dialog.component.html',
  styleUrls: ['./cards-dialog.component.scss']
})
export class CardsComponent implements OnInit, AfterViewInit {
  @ViewChild('searchgift') input!: ElementRef;
  @ViewChild('searchExternalGift') serachExternal!: ElementRef;

  dialogRef: DialogComponent;
  faTimes = faTimes;
  faSpinner = faSpinner;
  currentEmployeeId: any;
  iBusinessId: any;
  sGiftCardNumber = '';
  giftCardDetails: any;
  fetchInProgress = false;
  appliedGiftCards: Array<any> = [];
  externalGiftCardDetails: any = {};
  nAmount = 0;
  customer: any;
  pincode: any;
  giftCardInfo = { sGiftCardNumber: '', pincode: '', nAmount: 0, profileIconUrl: '', type: 'custom' };
  // elem ref
  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
    private terminalService: TerminalService,
  ) {
    const _injector = this.viewContainerRef.injector;;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit() {
    this.customer = this.dialogRef.context.customer;
    this.iBusinessId = localStorage.getItem('currentBusiness');
  }

  ngAfterViewInit(): void {
    // wait .5s between keyups to emit current value
    const keyup$ = fromEvent(this.input.nativeElement, 'keyup');
    const searchExternalGift$ = fromEvent(this.serachExternal.nativeElement, 'keyup');

    keyup$.pipe(
      map((i: any) => i.currentTarget.value),
      debounceTime(500)
    )
      .subscribe((value) => {
        this.fetchGiftCard(value);
      });
    searchExternalGift$.pipe(
      map((i: any) => i.currentTarget.value),
      debounceTime(500)
    )
      .subscribe((value) => {
        this.fetchExternalGiftCard(value);
      });
  }
  close(data: any) {
    console.log(data);
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
      this.dialogRef.close.emit(false);
      this.fetchInProgress = false;
    });
  }

  fetchExternalGiftCard(sGiftCardNumber: string) {
    console.log('I am here fetchExternalGiftCard');
    if (4 > sGiftCardNumber.length) {
      return;
    }
    // this.fetchInProgress = true;
    console.log('I am in fetch extenal gift card');
    this.terminalService.getGiftCardInformation({ sGiftCardNumber, pincode: this.pincode })
      .subscribe(res => {
        this.externalGiftCardDetails = res;

        console.log(this.externalGiftCardDetails);
      }, (error) => {
        alert(error.error.message);
        this.dialogRef.close.emit(false);
        this.fetchInProgress = false;
      });
  }
  // useThisCard(card: any) {

  //   console.log(card);
  //   this.appliedGiftCards.push(card);
  //   console.log(this.appliedGiftCards)
  // }
  submit() {
    console.log('hello this is me');
    console.log(this.externalGiftCardDetails);
    console.log(this.nAmount);
    console.log(this.sGiftCardNumber, this.pincode);
    // this.giftCardDetails['sGiftCardNumber'] = this.sGiftCardNumber;
    // this.giftCardDetails['nAmount'] = this.nAmount;
    this.giftCardInfo.sGiftCardNumber = this.sGiftCardNumber;
    this.giftCardInfo.nAmount = this.nAmount;
    this.giftCardInfo.pincode = this.pincode;
    this.giftCardInfo.profileIconUrl = this.externalGiftCardDetails.profileIconUrl;
    this.giftCardInfo.type = this.externalGiftCardDetails.type;
    this.close(this.giftCardInfo);
  }
}
