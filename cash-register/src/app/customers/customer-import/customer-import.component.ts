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
  ) { 
  }

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
    let newParsedCustomer:any =[];
    let updatedTemplate ={};
    
    for(let[key , value] of Object.entries(this.parsedCustomerData[0])){
 
      let updateTem = this.customerDetailsForm[key];
      updatedTemplate ={ ... updatedTemplate , [updateTem]:this.updateTemplateForm[key]}
    }

    this.parsedCustomerData.forEach((customer:any)=>{
        let newCustomer={}
         for (let [key, value] of Object.entries(customer)) {
             let cus = this.customerDetailsForm[key];
             newCustomer ={ ... newCustomer , [cus]:value}
         }
      
         newParsedCustomer.push(newCustomer);
    })

    this.importInprogress = true;
    let data: any = {
      iBusinessId: this.businessDetails._id,
      oTemplate: this.importService.processImportCustomer({ customer:updatedTemplate }),
      aCustomer: newParsedCustomer,
      sDefaultLanguage: localStorage.getItem('language') || 'n;'
    };


    this.apiService.postNew('customer', '/api/v1/customer/import', data).subscribe((result: any) => {
      this.importInprogress = false;
    }, (error) => {
      console.error(error);
    });
  }

}
