import { Component, OnInit, ViewContainerRef, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import * as _ from 'lodash';
import { ApiService } from '../../service/api.service';
import { DialogComponent } from '../../service/dialog';
import { TerminalService } from '../../service/terminal.service';
import { ToastService } from '../toast';
import { TranslateService } from '@ngx-translate/core';
import { TillService } from '../../service/till.service';

@Component({
  selector: 'app-cards-dialog',
  templateUrl: './cards-dialog.component.html',
  styleUrls: ['./cards-dialog.component.scss']
})
export class CardsComponent implements OnInit, AfterViewInit {
  @ViewChild('searchgift') input!: ElementRef;
  @ViewChild('searchExternalGift') serachExternal!: ElementRef;
  @ViewChild('loyaltyPointElem') loyaltyPointElem!: ElementRef;
  // @ViewChild('myDiv') myDiv: ElementRef<HTMLElement>;

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
  loyaltyPoints = 0;
  redeemedLoyaltyPoints = 0;
  customer: any;
  pincode: any;
  giftCardInfo = { sGiftCardNumber: '', pincode: '', nAmount: 0, profileIconUrl: '', type: 'custom', nPaidAmount: 0, iArticleGroupId: '', nGiftcardRemainingAmount:0 };
  oGiftcard:any;
  activeTabIndex:number = 0;
  translation:any=[];

  /* Check if saving points are enabled */
  savingPointsSetting:boolean = JSON.parse(localStorage.getItem('savingPoints') || '');
  redeemedPointsValue:number = 0;
  // elem ref
  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
    private terminalService: TerminalService,
    private toastService:ToastService , 
    private translateService:TranslateService,
    public tillService: TillService
  ) {
    const _injector = this.viewContainerRef.injector;;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit() {
    this.customer = this.dialogRef.context.customer;
    this.iBusinessId = localStorage.getItem('currentBusiness');
    this.fetchLoyaltyPoints();
    if(this.oGiftcard && Object.keys(this.oGiftcard)?.length){
      this.sGiftCardNumber = this.oGiftcard.sGiftCardNumber;
      this.fetchGiftCard(this.sGiftCardNumber);
      this.activeTabIndex = 1;
    }
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
    this.dialogRef.close.emit(data);
  }

  fetchGiftCard(sGiftCardNumber: string) {
    if (4 > sGiftCardNumber.length) {
      return;
    }
    this.fetchInProgress = true;
    const url = `/api/v1/activities/giftcard/${sGiftCardNumber}?iBusinessId=${this.iBusinessId}`;
    this.apiService.getNew('cashregistry', url).subscribe((result: any) => {
      this.giftCardDetails = result;
      this.giftCardInfo.nGiftcardRemainingAmount = result?.nGiftcardRemainingAmount || 0;
      this.fetchInProgress = false;
    }, (error) => {
      alert(error.error.message);
      this.dialogRef.close.emit(false);
      this.fetchInProgress = false;
    });
  }

  fetchExternalGiftCard(sGiftCardNumber: string) {
    if (4 > sGiftCardNumber.length) {
      return;
    }
    // this.fetchInProgress = true;
    this.terminalService.getGiftCardInformation({ sGiftCardNumber, pincode: this.pincode })
      .subscribe(res => {
        this.externalGiftCardDetails = res;
        if(res?.message == 'success'){
          this.toastService.show({type:'success' , text:this.translateService.instant('GIFT_CARD_APPLIED_SUCCESSFULLY')})
        }
      }, (error) => {
        let errorMessage:any;
        this.translateService.get(error.message).subscribe((res:any)=>{
          errorMessage = res;
        })
        this.toastService.show({type:'warning' , text:errorMessage});
        // alert(error.error);
        this.dialogRef.close.emit(false);
        this.fetchInProgress = false;
      });
  }

  fetchLoyaltyPoints() {
    if (this.customer) {
      this.apiService.getNew('cashregistry', `/api/v1/points-settings/points?iBusinessId=${this.iBusinessId}&iCustomerId=${this.customer._id}`).subscribe((result: any) => {
        this.loyaltyPoints = result;
      });
    }
  }

  submit() {
    this.giftCardInfo.sGiftCardNumber = this.sGiftCardNumber;
    // this.giftCardInfo.nAmount = this.nAmount;
    this.giftCardInfo.nGiftcardRemainingAmount -= this.giftCardInfo.nAmount;
    this.giftCardInfo.pincode = this.pincode;
    this.giftCardInfo.profileIconUrl = this.externalGiftCardDetails.profileIconUrl;
    this.giftCardInfo.iArticleGroupId = this.giftCardDetails?.iArticleGroupId;
    this.giftCardInfo.type = this.externalGiftCardDetails.type ? this.externalGiftCardDetails.type : 'custom';
    // console.log(this.giftCardInfo.nAmount);
    this.close({ giftCardInfo: this.giftCardInfo, redeemedLoyaltyPoints: this.redeemedPointsValue });
  }
}
