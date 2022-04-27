import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { ToastService } from 'src/app/shared/components/toast';
import { ApiService } from 'src/app/shared/service/api.service';

@Component({
  selector: 'app-customer-details-import',
  templateUrl: './customer-details-import.component.html',
  styleUrls: ['./customer-details-import.component.sass']
})
export class CustomerDetailsImportComponent implements OnInit {

 
  @Input() productDetailsForm: any;
  @Output() productDetailsFormChange: EventEmitter<any> = new EventEmitter();
  @Input() updateTemplateForm: any;
  @Output() updateTemplateFormChange: EventEmitter<any> = new EventEmitter();
  @Input() parsedProductData: any;
  @Output() moveToStep: EventEmitter<any> = new EventEmitter();

  headerOptions: Array<any> = [];

  doNothingForFields: Array<string> = [];
  overwriteForFields: Array<string> = [];
  ifUndefinedForFields: Array<string> = [];
  appendForFields: Array<string> = [];


  allFields: any = {
    first: [],
    last: [],
    all: []
  };

  language: string = 'nl';
  languageList = [
    { name: 'DUTCH', key: 'nl' },
    { name: 'ENGLISH', key: 'en' },
    { name: 'GERMAN', key: 'de' },
    { name: 'FRENCH', key: 'fr' },
    { name: 'SPANISH', key: 'es' }
  ]

  constructor(
    private apiService: ApiService,
    private toasterService: ToastService
  ) { }

  ngOnInit(): void {
    // if (this.productDetailsForm?.isTransaction) this.getDynamicFields(false); // FOR TESTING AND DYNAMIC DATA(TRANSACTION)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.parsedProductData && this.parsedProductData.length > 0) {
      this.headerOptions = Object.keys(this.parsedProductData[0]);
      this.productDetailsForm = {};
      this.updateTemplateForm = {};
      this.headerOptions.filter((option: any) => this.updateTemplateForm[option] = 'do-nothing');
      this.getDynamicFields(false);
    }
  }

  // Function for get dynamic field
  getDynamicFields(isResetAttributes: boolean) {
    let filter = {
      oFilterBy: {
        "sName": "import product details"
      }
    };

    this.apiService.postNew('core', '/api/v1/properties/list', filter).subscribe((result: any) => {
      if (result && result.data && result.data.length > 0) {
        this.allFields['all'] = result.data[0].aOptions;
        if (isResetAttributes) {
          this.productDetailsForm = {};
          this.updateTemplateForm = {};
        }
        this.allFields['all'].filter((field: any) => {
          if (this.headerOptions.indexOf(field.sKey) > -1) {
            this.productDetailsForm[field.sKey] = field.sKey;
          }
        });
      }
    }, error => {
      console.log("error :", error);
    })
  }


  filteredFieldOptions(optionFor: string, index: string): Array<string> {
    let uniqueList = [];
    // let overwriteForFields = this.productDetailForm.get('overwriteForFields')?.value;
    // let ifUndefinedForFields = this.productDetailForm.get('ifUndefinedForFields')?.value;
    // let appendForFields = this.productDetailForm.get('appendForFields')?.value;
    // let doNothingForFields = this.productDetailForm.get('doNothingForFields')?.value;
    switch (optionFor) {
      case 'DO_NOTHING':
        uniqueList = this.allFields[index].filter((o: any) => this.overwriteForFields.indexOf(o) === -1 && this.ifUndefinedForFields.indexOf(o) === -1 && this.appendForFields.indexOf(o) === -1);
        break;
      case 'OVERWRITE':
        uniqueList = this.allFields[index].filter((o: any) => this.doNothingForFields.indexOf(o) === -1 && this.ifUndefinedForFields.indexOf(o) === -1 && this.appendForFields.indexOf(o) === -1);
        break;
      case 'ADD_IF_UNDEFINED':
        uniqueList = this.allFields[index].filter((o: any) => this.overwriteForFields.indexOf(o) === -1 && this.doNothingForFields.indexOf(o) === -1 && this.appendForFields.indexOf(o) === -1);
        break;
      case 'APPEND':
        uniqueList = this.allFields[index].filter((o: any) => this.overwriteForFields.indexOf(o) === -1 && this.ifUndefinedForFields.indexOf(o) === -1 && this.doNothingForFields.indexOf(o) === -1);
        break;
      default:
        uniqueList = this.allFields[index];
    }
    return uniqueList;
  }

  // Function for go to step(next / previous)
  gotoStep(step: string) {
    if (Object.keys(this.productDetailsForm).length != this.headerOptions.length) {
      this.toasterService.show({ type: 'danger', text: 'You have not set some of the attributes exist in file.' });
    }
    this.updateTemplateFormChange.emit(this.updateTemplateForm);
    this.productDetailsFormChange.emit(this.productDetailsForm);
    this.moveToStep.emit(step);
  }

  // Function for validate product detail header linking
  validateProductHeaderLink(): boolean {
    return Object.keys(this.productDetailsForm).length == 0;
  }

}
