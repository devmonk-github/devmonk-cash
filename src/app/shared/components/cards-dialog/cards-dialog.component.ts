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
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-cards-dialog',
  templateUrl: './cards-dialog.component.html',
  styleUrls: ['./cards-dialog.component.scss'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('500ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class CardsComponent implements OnInit, AfterViewInit {
  @ViewChild('searchgift') input!: ElementRef;
  @ViewChild('searchExternalGift') serachExternal!: ElementRef;
  @ViewChild('loyaltyPointElem') loyaltyPointElem!: ElementRef;

  dialogRef: DialogComponent;
  faTimes = faTimes;
  faSpinner = faSpinner;
  iBusinessId: any;
  mode:string;
  oGiftcard:any;

  appliedGiftCards: Array<any> = [];
  
  oExternalGiftcard: any = {};
  nExternalAmount = 0;

  loyaltyPoints = 0;
  redeemedLoyaltyPoints = 0;
  customer: any;
  pincode: any;
  activeTabIndex:number = 0;
  fetchInProgress = false;

  redeemedPointsValue:number = 0;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
    private terminalService: TerminalService,
    private toastService:ToastService , 
    private translateService:TranslateService,
    public tillService: TillService) {
    const _injector = this.viewContainerRef.injector;;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit() {
    this.customer = this.dialogRef.context.customer;
    this.iBusinessId = localStorage.getItem('currentBusiness');
    if (this.customer) this.fetchLoyaltyPoints();
    
    // console.log(this.oGiftcard)
    if (this.mode == 'edit') {
      this.oGiftcard.nCurrentRedeemedAmount = this.oGiftcard.nAmount;
      this.oGiftcard.nAmount = 0;
      this.fetchGiftCard(this.oGiftcard.sGiftCardNumber);
    } else {
      this.oGiftcard = {
        sGiftCardNumber: '',
        pincode: '',
        nAmount: 0,
        nCurrentRedeemedAmount: 0,
        profileIconUrl: '',
        type: 'custom',
        nPaidAmount: 0,
        iArticleGroupId: '',
        nGiftcardRemainingAmount: 0
      }
    }
  }

  ngAfterViewInit() {
    const keyup$ = fromEvent(this.input.nativeElement, 'keyup');
    const searchExternalGift$ = fromEvent(this.serachExternal.nativeElement, 'keyup');
    keyup$.pipe(
      map((i: any) => i.currentTarget.value),
      debounceTime(500)
    ).subscribe((value) => {
      
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
    if (sGiftCardNumber.length < 4) return;
    this.fetchInProgress = true;
    this.apiService.getNew('cashregistry', `/api/v1/activities/giftcard/${sGiftCardNumber}?iBusinessId=${this.iBusinessId}`).subscribe((result: any) => {
      this.fetchInProgress = false;
      if(result?._id) {
        const oExisting = this.appliedGiftCards.find((el: any) => el.sGiftCardNumber == sGiftCardNumber)
        if (oExisting) {
          // console.log({ oExisting })
          this.mode = 'edit';
          this.oGiftcard.nCurrentRedeemedAmount = oExisting.nAmount;
        } else {
          this.mode = 'new';
          this.oGiftcard.nCurrentRedeemedAmount = 0;
        }
        this.oGiftcard.nAmount = 0;

        this.oGiftcard.nGiftcardRemainingAmount = (result?.nGiftcardRemainingAmount || 0);
        this.oGiftcard._id = result._id;
        this.oGiftcard.nCurrentLimit = this.oGiftcard.nGiftcardRemainingAmount - this.oGiftcard.nCurrentRedeemedAmount;
      } else {
        delete this.oGiftcard?._id;
        this.toastService.show({ type: 'warning', text: this.translateService.instant('GIFTCARD_NOT_FOUND_WITH_THIS_NUMBER') });
      }
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
        this.oExternalGiftcard = res;
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
    this.apiService.getNew('cashregistry', `/api/v1/points-settings/points?iBusinessId=${this.iBusinessId}&iCustomerId=${this.customer._id}`).subscribe((result: any) => {
      this.loyaltyPoints = result;
    });
  }

  submit() {
    if(this.oGiftcard.nAmount > this.oGiftcard.nGiftcardRemainingAmount){
      this.toastService.show({type:'warning' , text: this.translateService.instant('USING_MORE_THAN_AVAILABLE')});
    } else {
      const oGiftcard = { ...this.oGiftcard }
      oGiftcard.type = this.oExternalGiftcard.type ? this.oExternalGiftcard.type : 'custom';
      oGiftcard.nAmount += oGiftcard.nCurrentRedeemedAmount;
      oGiftcard.nGiftcardRemainingAmount -= this.oGiftcard.nAmount
      const oBody = { 
        oGiftCard:oGiftcard,
        redeemedLoyaltyPoints: this.redeemedPointsValue 
      }
      this.close(oBody);
    }
  }
}
