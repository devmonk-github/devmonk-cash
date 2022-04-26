import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-customer-import',
  templateUrl: './customer-import.component.html',
  styleUrls: ['./customer-import.component.sass']
})
export class CustomerImportComponent implements OnInit {

  stepperIndex: any = 0;
  parsedProductData: Array<any> =[];
  productDetailsForm: any;
  updateTemplateForm: any;
  importInprogress: boolean = false;
  businessDetails: any ={};
  stepperInstatnce: any;

  constructor() { }

  ngOnInit(): void {
  }

  public moveToStep( step: any){
    if(step == 'next'){
      this.stepperInstatnce.goNext();
    } else if(step == 'previous'){
      this.stepperInstatnce.goPrev();
    } else if( step == 'import'){
      this.stepperInstatnce.goNext();
    }
  }

  importProduct() {
    this.importInprogress = true;
    let productData: any = {
      iBusinessId: this.businessDetails._id,
      // oTemplate: this.importService.processImportProduct({ product: this.updateTemplateForm }),
      aProduct: this.parsedProductData,
      sDefaultLanguage: localStorage.getItem('language') || 'n;'
    };

    this.parsedProductData.forEach((product, index) => {
      let brand = this.productDetailsForm.updatedBrand.filter((brand: any) => brand.foundName == product[this.productDetailsForm['Brand']]);
      productData.aProduct[index]["iBusinessBrandId"] = brand.length > 0 && brand[0].selected._id && brand[0].selected._id ? brand[0].selected._id : '';
    });

    // this.apiService.postNew('core', '/api/v1/general/import/products', productData).subscribe((result: any) => {
    //   this.importInprogress = false;
    // });
  }

}
