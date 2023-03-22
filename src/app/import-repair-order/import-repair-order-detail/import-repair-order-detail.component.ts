import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { faSync, faTimes } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import { ImportRepairOrderService } from 'src/app/shared/service/import-repair-order.service';

@Component({
  selector: 'import-repair-order-detail',
  templateUrl: './import-repair-order-detail.component.html',
  styleUrls: ['./import-repair-order-detail.component.sass']
})
export class ImportRepairOrderDetailComponent implements OnInit {

  @Input() repairOrderDetailsForm: any;
  @Input() referenceObj: any;
  @Output() repairOrderDetailsFormChange: EventEmitter<any> = new EventEmitter();
  @Output() referenceObjChange: EventEmitter<any> = new EventEmitter();
  @Input() updateTemplateForm: any;
  @Output() updateTemplateFormChange: EventEmitter<any> = new EventEmitter();
  @Input() parsedRepairOrderData: any;
  @Output() moveToStep: EventEmitter<any> = new EventEmitter();
  @Input() allFields: any;
  faTimes = faTimes;
  faSync = faSync;
  headerOptions: Array<any> = [];
  doNothingForFields: Array<string> = [];
  overwriteForFields: Array<string> = [];
  ifUndefinedForFields: Array<string> = [];
  appendForFields: Array<string> = [];
  translations: any = [];
  language: string = 'nl';
  iBusinessId !: string | null;
  aDefaultAttribute: any = [];

  constructor(
    private translateService: TranslateService,
    private ImportRepairOrderService: ImportRepairOrderService
  ) { }

  ngOnInit(): void {
    const translations = ['YOU_HAVE_NOT_SET_SOME_OF_THE_ATTRIBUTES_EXISTS_IN_FILE']
    this.translateService.get(translations).subscribe(result => this.translations = result);
    this.iBusinessId = localStorage.getItem('currentBusiness') ? localStorage.getItem('currentBusiness') : '';
    this.aDefaultAttribute = this.ImportRepairOrderService.defaultImportRepairOrderAttribute();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.parsedRepairOrderData?.length) {
      this.headerOptions = [...Object.keys(this.parsedRepairOrderData[0])];
      console.log('this.headerOptionss: ', this.headerOptions);
      this.headerOptions = this.headerOptions.sort();
      this.repairOrderDetailsForm = {};
      this.updateTemplateForm = {};
      this.getDynamicFields(false);
    }
  }

  /* Sorting aProperty based on the sColumnHeader */
  sortTheProperty(aProperty: any = []) {
    aProperty.sort((oObjectA: any, oObjectB: any) => {
      const sNameA = oObjectA?.sColumnHeader?.toUpperCase(); /* case-insensitive */
      const sNameB = oObjectB?.sColumnHeader?.toUpperCase(); /* case-insensitive */

      /* Sorting in ascending order */
      if (sNameA < sNameB) return -1;
      if (sNameA > sNameB) return 1;
      return 0; /* if equal */
    })

    return aProperty;
  }

  // Function for get dynamic field
  getDynamicFields(isResetAttributes: boolean) {
    console.log('getDynamicFields: ', isResetAttributes)

    this.allFields['all'] = this.aDefaultAttribute;
    if (isResetAttributes) {
      this.repairOrderDetailsForm = {};
      this.updateTemplateForm = {};
    }
    this.allFields['all'].map((field: any) => {
      const index = this.headerOptions.indexOf(field.sColumnHeader);
      if (index > -1) {
        this.repairOrderDetailsForm[field.sColumnHeader] = field.sColumnHeader;
        if (!this.referenceObj) this.referenceObj = {};
        this.referenceObj[this.headerOptions[index]] = field.sDataBaseFieldName;
        this.updateTemplateForm[field.sColumnHeader] = 'overwrite'
      }
    });

    /* For making, de-selection works in drop-down */
    this.allFields['all'].unshift({
      eFormField: "input",
      sColumnHeader: "",
      sDataBaseFieldName: "EMPTY",
      sName: "EMPTY",
      aOptions: []
    })

    this.headerOptions.filter((option: any) => {
      if (!this.repairOrderDetailsForm[option]) {
        this.repairOrderDetailsForm[option] = "";
      }
    });
  }


  filteredFieldOptions(optionFor: string, index: string): Array<string> {
    let uniqueList = [];
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
    console.log('gotoStep: ', step);
    if (Object.keys(this.repairOrderDetailsForm).length != this.headerOptions.length) {
      // this.toasterService.show({ type: 'warning', text: this.translations['YOU_HAVE_NOT_SET_SOME_OF_THE_ATTRIBUTES_EXISTS_IN_FILE'] });
    }
    this.updateTemplateFormChange.emit(this.updateTemplateForm);
    this.repairOrderDetailsFormChange.emit(this.repairOrderDetailsForm);
    this.moveToStep.emit(step);
  }

  // Function for validate repair-order detail header linking
  validateRepairOrderHeaderLink(): boolean {
    return !Object.keys(this.repairOrderDetailsForm).length;
  }

  setTemplate(option: any, obj: any) {
    /* for empty drop-down */
    if (obj === '') {
      this.repairOrderDetailsForm[option] = '';
      return;
    };
    for (let i = 0; i < this.allFields.all.length; i++) {
      if (this.allFields.all[i].sColumnHeader === obj) {
        this.referenceObj[option] = this.allFields.all[i].sDataBaseFieldName;
      }
    }
    this.updateTemplateForm[this.repairOrderDetailsForm[option]] = "overwrite";
  }

}
