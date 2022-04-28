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
  parsedCustomerData: Array<any> =[];
  customerDetailsForm: any;
  updateTemplateForm: any;
  importInprogress: boolean = false;
  businessDetails: any ={};
  stepperInstatnce: any;
  @ViewChild('stepperContainer', { read: ViewContainerRef }) stepperContainer!: ViewContainerRef;

  constructor(
    private importService: ImportService,
    private apiService: ApiService
  ) { }

  ngOnInit(): void { }

  ngAfterContentInit(): void {
    StepperComponent.bootstrap();
    setTimeout(()=>{
      this.stepperInstatnce = StepperComponent.getInstance(this.stepperContainer.element.nativeElement);
    }, 200);
  }

  public moveToStep( step: any){
    if(step == 'next'){
      this.stepperInstatnce.goNext();
    } else if(step == 'previous'){
      this.stepperInstatnce.goPrev();
    } else if( step == 'import'){
      this.importCustomer()
      this.stepperInstatnce.goNext();
    }
  }

  importCustomer() {
    console.log(' importCustomer ');
    this.importInprogress = true;
    let data: any = {
      iBusinessId: this.businessDetails._id,
      oTemplate: this.importService.processImportProduct({ product: this.updateTemplateForm }),
      aProduct: this.parsedCustomerData,
      sDefaultLanguage: localStorage.getItem('language') || 'n;'
    };

    this.parsedCustomerData.forEach((customer, index) => {
      let brand = this.customerDetailsForm.updatedBrand.filter((brand: any) => brand.foundName == customer[this.customerDetailsForm['Brand']]);
      data.aProduct[index]["iBusinessBrandId"] = brand.length > 0 && brand[0].selected._id && brand[0].selected._id ? brand[0].selected._id : '';
    });

    this.apiService.postNew('core', '/api/v1/general/import/products', data).subscribe((result: any) => {
      this.importInprogress = false;
    });
  }

}
