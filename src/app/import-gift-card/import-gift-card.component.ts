import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { ImportGiftCardService } from '../shared/service/import-gift-card.service';
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
  stepperInstance: any;
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
    private apiService: ApiService,
    private importGiftCardService: ImportGiftCardService
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
      this.stepperInstance = StepperComponent.getInstance(this.stepperContainer.element.nativeElement);
    }, 200);
  }

  async moveToStep(step: any) {
    if (step == 'next') {
      this.stepperInstance.goNext();
    } else if (step == 'previous') {
      this.stepperInstance.goPrev();
    } else if (step == 'import') {
      await this.importGiftCard()
      this.stepperInstance.goNext();
    }
  }

  async importGiftCard() {
    try {
      this.importInprogress = true;
      const oData = {
        parsedGiftCardData: this.parsedGiftCardData,
        referenceObj: this.referenceObj,
        iBusinessId: this.businessDetails._id,
        iLocationId: this.location._id,
        iWorkStationId: this.iWorkStationId,
        iEmployeeId: this.iEmployeeId
      }

      const { parsedGiftCardData, oBody } =await this.importGiftCardService.mapTheImportGiftCardBody(oData);
      this.parsedGiftCardData = parsedGiftCardData;
      const aTransactionItem = JSON.parse(JSON.stringify(oBody?.transactionItems));
      for (let i = 0; i < aTransactionItem?.length; i++) {
        oBody.transactionItems = [aTransactionItem[i]];
        oBody.oTransaction.iCustomerId = aTransactionItem[i].iCustomerId;
        oBody.oTransaction.eSource = 'import-csv';
        oBody.oTransaction.dCreatedDate = aTransactionItem[i].dCreatedDate;
        oBody.bImportGiftCard = true;
        oBody.payments = this.importGiftCardService.mapPayment(aTransactionItem[i]);
        this.apiService.postNew('cashregistry', '/api/v1/till/transaction', oBody).subscribe((result: any) => {
          this.importInprogress = false;
          this.parsedGiftCardData = [];
        }, (error) => {
          this.parsedGiftCardData = [];
          console.error(error);
        });
      }
    } catch (error) {
      this.parsedGiftCardData = [];
      console.log('Import Gift card error');
    }
  }

}
