import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { ImportService } from '../shared/service/import.service';
import { StepperComponent } from '../shared/_layout/components/common';

@Component({
  selector: 'import-gift-card',
  templateUrl: './import-gift-card.component.html',
  styleUrls: ['./import-gift-card.component.sass']
})

export class ImportGiftCardComponent implements OnInit {

  stepperIndex: any = 0;
  parsedGiftCardData: Array<any> = [];
  giftCardDetailsForm: any;
  updateTemplateForm: any;
  importInprogress: boolean = false;
  businessDetails: any = {};
  location: any = {};
  stepperInstatnce: any;
  allFields: any = {
    first: [],
    last: [],
    all: []
  };
  referenceObj: any = {};
  iWorkStationId: any;
  iEmployeeId: any;
  @ViewChild('stepperContainer', { read: ViewContainerRef }) stepperContainer!: ViewContainerRef;

  constructor(
    private importService: ImportService,
    private apiService: ApiService,
  ) { }

  ngOnInit(): void {
    this.businessDetails._id = localStorage.getItem('currentBusiness');
    this.location._id = localStorage.getItem('currentLocation');
    this.iWorkStationId = localStorage.getItem('currentWorkstation');
    this.iEmployeeId = JSON.parse(localStorage.getItem('currentUser') || '{}').userId;
  }

  ngAfterContentInit(): void {
    StepperComponent.bootstrap();
    setTimeout(() => {
      this.stepperInstatnce = StepperComponent.getInstance(this.stepperContainer.element.nativeElement);
    }, 200);
  }

  public moveToStep(step: any) {
    if (step == 'next') {
      this.stepperInstatnce.goNext();
    } else if (step == 'previous') {
      this.stepperInstatnce.goPrev();
    } else if (step == 'import') {
      this.importGiftCard()
      this.stepperInstatnce.goNext();
    }
  }

  importGiftCard() {
    try {
      this.importInprogress = true;

      this.parsedGiftCardData = this.parsedGiftCardData.map((oGiftCard: any) => {
        // console.log('oGiftCard: ', oGiftCard, Object.keys(oGiftCard).length);
        if (Object.keys(oGiftCard).length) {
          for (let [key, value] of Object.entries(oGiftCard)) {
            oGiftCard[this.referenceObj[key]] = value;
            console.log('Hello', oGiftCard[this.referenceObj[key]], key, value, this.referenceObj[key])
            console.log('oGiftCard: ', oGiftCard);
            delete oGiftCard[key];
          }
        }
        return oGiftCard;
      })

      let data: any = {
        iBusinessId: this.businessDetails._id,
        iLocationId: this.location._id,
        iWorkstationId: this.iWorkStationId,
        oTransaction: {
          eStatus: 'y',
          eType: 'cash-register-revenue',
          iBusinessId: this.businessDetails._id,
          iLocationId: this.location._id,
          iWorkstationId: this.iWorkStationId,
        },
        payments: [],
        redeemedLoyaltyPoints: 0,
        transactionItems: this.parsedGiftCardData.map((el: any) => {
          el.bImported = true;
          el.oType = {
            "eTransactionType": "cash-registry",
            "bRefund": false,
            "nStockCorrection": 1,
            "eKind": "giftcard",
            "bDiscount": false,
            "bPrepayment": false
          }
          el.nQuantity = 1;
          el.nSavingsPoints = 0;
          el.iArticleGroupId = "635cd1f3d82c4631fe1d9585";
          el.iArticleGroupOriginalId = "635cd1f3d82c4631fe1d9585";
          el.nPaymentAmount = 100;
          el.nDiscount = 0;
          el.oArticleGroupMetaData = {
            "aProperty": [],
            "sCategory": "Giftcard",
            "sSubCategory": "Repair",
            "oName": {},
            "oNameOriginal": {}
          };
          return el;
        }),
        // transactionItems: [
        //   {
        //     "sProductName": "Voucher",
        //     "nPriceIncVat": 5,
        //     "nPurchasePrice": 4.13,
        //     "nProfit": 0.8700000000000001,
        //     "nVatRate": 21,
        //     "nQuantity": 1,
        //     "aImage": [],
        //     "nMargin": 1,
        //     "iBusinessId": "6182a52f1949ab0a59ff4e7b",
        //     "iArticleGroupId": "635cd1f3d82c4631fe1d9585",
        //     "iArticleGroupOriginalId": "635cd1f3d82c4631fe1d9585",
        //     "oArticleGroupMetaData": {
        //       "aProperty": [],
        //       "sCategory": "Giftcard",
        //       "sSubCategory": "Repair",
        //       "oName": {},
        //       "oNameOriginal": {}
        //     },
        //     "bPayLater": false,
        //     "bDeposit": false,
        //     "sProductCategory": "CATEGORY",
        //     "sGiftCardNumber": 1678190684433,
        //     "nEstimatedTotal": 5,
        //     "nPaymentAmount": 5,
        //     "nPaidLaterAmount": 0,
        //     "bDiscount": false,
        //     "nRefundAmount": 0,
        //     "eStatus": "y",
        //     "iWorkstationId": "62b47942503dcc27f84c6f7e",
        //     "iEmployeeId": "61a48b1d7f39a87d3576c5f0",
        //     "iLocationId": "623b6d840ed1002890334456",
        //     "oType": {
        //       "eTransactionType": "cash-registry",
        //       "bRefund": false,
        //       "nStockCorrection": 1,
        //       "eKind": "giftcard",
        //       "bDiscount": false,
        //       "bPrepayment": false
        //     },
        //     "nDiscount": 0,
        //     "sUniqueIdentifier": "4c70d74e-721b-4416-8eeb-5e5d81721e36",
        //     "nRevenueAmount": 5,
        //     "sDescription": "",
        //     "sServicePartnerRemark": "",
        //     "sCommentVisibleServicePartner": "",
        //     "eEstimatedDateAction": "call_on_ready",
        //     "eActivityItemStatus": "delivered",
        //     "bGiftcardTaxHandling": "true",
        //     "bDiscountOnPercentage": false
        //   }
        // ],
        sDefaultLanguage: localStorage.getItem('language') || 'n;'
      };

      console.log('importGiftCard: ', data);
      console.log('this.referenceObj: ', this.referenceObj);
      console.log('this.allFields: ', this.allFields);
      this.apiService.postNew('cashregistry', '/api/v1/till/transaction', data).subscribe((result: any) => {
        this.importInprogress = false;
      }, (error) => {
        console.error(error);
      });
    } catch (error) {
      console.log('Import Gift card');
    }
  }

}
