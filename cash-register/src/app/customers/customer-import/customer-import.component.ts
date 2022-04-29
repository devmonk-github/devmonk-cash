import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ApiService } from 'src/app/shared/service/api.service';
import { ImportService } from 'src/app/shared/service/import.service';
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
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.businessDetails._id = localStorage.getItem('currentBusiness')
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
      this.importCustomer()
      this.stepperInstatnce.goNext();
    }
  }

  importCustomer() {
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
      console.log(error);
    });
  }

}
