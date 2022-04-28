import { Component, OnInit } from '@angular/core';
import { DialogComponent } from '../../service/dialog';
import { ViewContainerRef } from '@angular/core';
import { ApiService } from 'src/app/shared/service/api.service';
import { faTimes } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.sass']
})
export class CustomerDetailsComponent implements OnInit {

  dialogRef: DialogComponent;
  salutations: Array<any> = [ 'Mr', 'Mrs', 'Mr/Mrs', 'Family', 'Firm']
  gender: Array<any> = ['Male', 'Female', "Other"]
  documentTypes: Array<any> = [ 'Driving license', 'Passport', 'Identity card', 'Alien document'];
  mode: string = '';
  editProfile: boolean = false;
  showStatistics: boolean = false;
  faTimes = faTimes;
  customer: any = {
    bNewsletter: true,
    sSalutation: 'Mr',
    sEmail: '',
    sFirstName: '',
    sPrefix: '',
    sLastName: '',
    oPhone: {
      sCountryCode: '',
      sMobile: '',
      sLandLine: '',
      sFax: '',
      bWhatsApp: true
    },
    note: '',
    dDateOfBirth: '',
    oIdentity: {
      documentName: '',
      documentNumber: '',
    },
    sGender: 'male',
    oInvoiceAddress: {
      country: 'Netherlands',
      countryCode: 'NL',
      state: '',
      postalCode: '',
      houseNumber: '',
      houseNumberSuffix: '',
      addition: '',
      street: '',
      city: ''
    },
    oShippingAddress: {
      country: 'Netherlands',
      countryCode: 'NL',
      state: '',
      postalCode: '',
      houseNumber: '',
      houseNumberSuffix: '',
      addition: '',
      street: '',
      city: ''
    },
    sCompanyName: '',
    sVatNumber: '',
    sCocNumber: '',
    nPaymentTermDays: ''
  }
  requestParams : any = {
    iBusinessId: "",
  };
  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService
  ) { 
    const _injector = this.viewContainerRef.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit(): void {
    this.requestParams.iBusinessId = localStorage.getItem('currentBusiness')
  }

  customerCountryChanged(type: string, event: any){
    this.customer[type].countryCode = event.key;
    this.customer[type].country = event.value;
  }

  EditOrCreateCustomer(){
    this.customer.iBusinessId = this.requestParams.iBusinessId;
    if(this.mode == 'create'){
      this.apiService.postNew('customer', '/api/v1/customer/create', this.customer).subscribe(
        (result : any) => {
          this.close({ action: true, customer: this.customer });
         },
        (error: any) => {
          console.log(error)
        }
      );
    }
    if(this.mode == 'details'){
      this.apiService.putNew('customer', '/api/v1/customer/update/' + this.requestParams.iBusinessId + '/' + this.customer._id, this.customer).subscribe(
        (result : any) => { 
          this.close({ action: true });
        },
        (error: any) => {
          console.log(error)
        }
      );
    }
  }

  close(data: any) {
    this.dialogRef.close.emit(data);
  }
}
