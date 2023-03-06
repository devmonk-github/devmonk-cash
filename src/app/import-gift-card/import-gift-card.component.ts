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
  // updateTemplateForm: any;
  importInprogress: boolean = false;
  businessDetails: any = {};
  location: any = {};
  stepperInstatnce: any;
  @ViewChild('stepperContainer', { read: ViewContainerRef }) stepperContainer!: ViewContainerRef;

  constructor(
    private importService: ImportService,
    private apiService: ApiService,
  ) { }

  ngOnInit(): void {
    this.businessDetails._id = localStorage.getItem('currentBusiness');
    this.location._id = localStorage.getItem('currentLocation');
  }

  ngAfterContentInit(): void {
    StepperComponent.bootstrap();
    setTimeout(() => {
      this.stepperInstatnce = StepperComponent.getInstance(this.stepperContainer.element.nativeElement);
    }, 200);
  }

  public moveToStep(step: any) {
    if (step == 'next') {
      console.log('parsedGiftCardDataChange: ', this.parsedGiftCardData);
      this.stepperInstatnce.goNext();
    } else if (step == 'previous') {
      this.stepperInstatnce.goPrev();
    } else if (step == 'import') {
      this.importGiftCard()
      this.stepperInstatnce.goNext();
    }
  }

  importGiftCard() {
    this.importInprogress = true;
    let data: any = {
      iBusinessId: this.businessDetails._id,
      iLocationId: this.location._id,
      aGiftCard: this.parsedGiftCardData,
      sDefaultLanguage: localStorage.getItem('language') || 'n;'
    };

    this.apiService.postNew('cashregistry', '/api/v1/gift-card/import', data).subscribe((result: any) => {
      this.importInprogress = false;
    }, (error) => {
      console.error(error);
    });
  }

}
