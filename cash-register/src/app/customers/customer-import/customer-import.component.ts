import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/shared/service/api.service';
import { ImportService } from 'src/app/shared/service/import.service';
import { TranslationsService } from 'src/app/shared/service/translation.service';
import { StepperComponent } from 'src/app/shared/_layout/components/common';
@Component({
  selector: 'app-customer-import',
  templateUrl: './customer-import.component.html',
  styleUrls: ['./customer-import.component.sass']
})
export class CustomerImportComponent implements OnInit {

  stepperIndex: any = 0;
  parsedCustomerData: Array<any> = [];
  customerDetailsForm: any;
  updateTemplateForm: any;
  importInprogress: boolean = false;
  businessDetails: any = {};
  stepperInstatnce: any;
  @ViewChild('stepperContainer', { read: ViewContainerRef }) stepperContainer!: ViewContainerRef;

  constructor(
    private importService: ImportService,
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    private translationsService: TranslationsService
  ) { 
    this.translationsService.setTranslationsObject(this.activatedRoute.snapshot.data.translations);
    console.log('set translation obj', this.translationsService.getTranslationsObject())
  }

  ngOnInit(): void {
    console.log("---------------------customer import-----------------------");
    this.businessDetails._id = localStorage.getItem('currentBusiness');
    console.log(this.parsedCustomerData);
  }

  ngAfterContentInit(): void {
    StepperComponent.bootstrap();
    setTimeout(() => {
      this.stepperInstatnce = StepperComponent.getInstance(this.stepperContainer.element.nativeElement);
    }, 200);
  }

  public moveToStep(step: any) {
    console.log("--------------------move to step----------------");
    console.log(this.parsedCustomerData);
    if (step == 'next') {
      this.stepperInstatnce.goNext();
    } else if (step == 'previous') {
      this.stepperInstatnce.goPrev();
    } else if (step == 'import') {
      this.importCustomer()
      this.stepperInstatnce.goNext();
    }
  }

  importCustomer() {
    console.log("-------------------import customer-----------------");
    console.log(this.updateTemplateForm);
    console.log(this.customerDetailsForm);
    this.importInprogress = true;
    let data: any = {
      iBusinessId: this.businessDetails._id,
      oTemplate: this.importService.processImportCustomer({ customer: this.updateTemplateForm }),
      aCustomer: this.parsedCustomerData,
      sDefaultLanguage: localStorage.getItem('language') || 'n;'
    };


    this.apiService.postNew('customer', '/api/v1/customer/import', data).subscribe((result: any) => {
      this.importInprogress = false;
    }, (error) => {
      console.error(error);
    });
  }

}
