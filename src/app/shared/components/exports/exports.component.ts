import { Component, OnInit, Input, ViewContainerRef } from '@angular/core';
import { ApiService } from 'src/app/shared/service/api.service';
import { JsonToCsvService } from 'src/app/shared/service/json-to-csv.service';
import { ExportsService } from 'src/app/shared/service/exports.service';
import * as _moment from 'moment';
import _ from 'lodash';
import { DialogService } from '../../service/dialog';
import { DialogComponent } from '../../service/dialog';
const moment = (_moment as any).default ? (_moment as any).default : _moment;

@Component({
  selector: 'app-exports',
  templateUrl: './exports.component.html',
  styleUrls: ['./exports.component.sass']
})
export class ExportsComponent implements OnInit {
  @Input() requestParams: any = {};
  @Input() headerList: Array<any> = [];
  @Input() valuesList: Array<any> = [];
  @Input() separator: String = '';
  @Input() socialMedia: Boolean = false;

  secondHeaderList: Array<any> = [];
  secondValuesList: Array<any> = [];
  secondAProjection: Array<any> = [];
  aProperty: Array<any> = [];
  expand: Boolean = false;
  loader: Boolean = false;
  useSameFilter: Boolean = true;
  articleGroupNames: Array<any> = [];
  secondAG: String = '';
  firstAG: String = '';
  secondAGId: String = '';
  firstAGId: String = '';
  iBusinessId:any;

  fieldsToRemove : Array<any> = [];
  dataForCSV: Array<any> = [];
  fieldObject: any = {};

  dialogRef: DialogComponent;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
    private jsonToCsvService: JsonToCsvService,
    private exportsService: ExportsService,
    private dialogService:DialogService
  ) { 
    const _injector = this.viewContainerRef.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent); 
  }

  ngOnInit(): void { 
    this.iBusinessId = localStorage.getItem('currentBusiness');
    // this.fetchArticleGroupNames();
    // this.fetchSecondHeaderList();
  }

  fetchSecondHeaderList(){
    var data = {
      iBusinessId: this.iBusinessId
    };
    this.apiService.postNew('core','/api/v1/property/settings/list', data).subscribe(
      (result : any) => {
        this.loader = false;
        for(let index in result.data){
          if(this.secondHeaderList.indexOf(result.data[index].property.sName) < 0) this.secondHeaderList.push(result.data[index].property.sName);
        }
      })
  }

  addToSecondHeaderList(data: String){
    if(this.secondAProjection.indexOf(data) < 0 && data) this.secondAProjection.push(data);
  }

  close(flag: Boolean){
    var data = this.fieldsToRemove;
    this.fieldsToRemove = [];
    if(flag) this.dialogRef.close.emit({ action: true, data });
    else this.dialogRef.close.emit({ action: false })
  }

  fetchArticleGroupNames(){
    var body = this.requestParams;
    body.firstAG = this.firstAG;
    body.secondAG = this.secondAG;
    body.withoutPagination = true;
    this.apiService.postNew('core','/api/v1/business/article-group/list', body).subscribe(
      (result : any) => {
        this.loader = false;
        if(result && result.data && result.data.length) this.articleGroupNames = result.data;
      })
  }

  getExportData(){
    var valuesListObj = _.clone(this.valuesList);
    var headerListObj = _.clone(this.headerList);
    for(let index in this.secondAProjection){
      if(this.requestParams.aProjection.indexOf(this.secondAProjection[index]) < 0) this.requestParams.aProjection.push(this.secondAProjection[index]);
    }
    for(let index in this.fieldsToRemove){
      var charIndex = this.requestParams.aProjection.indexOf(this.fieldsToRemove[index]);
      this.requestParams.aProjection.splice(charIndex, 1);
      var valueIndex = valuesListObj.indexOf(this.fieldsToRemove[index]);
      valuesListObj.splice(valueIndex, 1);
      headerListObj.splice(valueIndex, 1);
    }
    if(!this.useSameFilter){ this.requestParams.oFilterBy.oDynamic = {}; this.requestParams.oFilterBy.oStatic = {}; }
    var body = this.requestParams;
    // body.firstAGId = this.firstAGId;
    // body.secondAGId = this.secondAGId;
    this.apiService.postNew('customer', '/api/v1/customer/list', body).subscribe(
      (result : any) => {
        if(result && result.data && result.data.length){
          this.dataForCSV = result.data[0].result;
        }
        // for(let index in this.dataForCSV){
        //   this.dataForCSV[index].dCreatedDate = moment(this.dataForCSV[index].dCreatedDate).format('DD-MM-yyyy');
        //   this.dataForCSV[index].name = this.dataForCSV[index] && this.dataForCSV[index].oName && this.dataForCSV[index].oName.en ? this.dataForCSV[index].oName.en : '';
        //   this.dataForCSV[index].nInventory = this.dataForCSV[index] && this.dataForCSV[index].oStock && this.dataForCSV[index].oStock.nInventory ? this.dataForCSV[index].oStock.nInventory : 0;
        //   this.dataForCSV[index].iArticleGroupId = this.dataForCSV[index] && this.dataForCSV[index].iArticleGroupId && (this.dataForCSV[index].iArticleGroupId['en-us'] || this.dataForCSV[index].iArticleGroupId['en']) ? (this.dataForCSV[index].iArticleGroupId['en-us'] || this.dataForCSV[index].iArticleGroupId['en']) : ''; 
        //   var aProperty = this.dataForCSV[index].aProperty;
        //   this.aProperty.push(aProperty);
        //   for(let index2 in aProperty){
        //     if(aProperty[index2].oProperty) this.dataForCSV[index][aProperty[index2].sPropertyName] = Object.keys(aProperty[index2].oProperty)[0];
        //   }
        //   // if(this.socialMedia) this.getGoogleCode(index);
        // }
        for(let index in this.headerList){
          this.fieldObject[this.headerList[index]] = this.valuesList[index]
        }
        if(this.socialMedia){
          if(this.headerList.indexOf('Google_product_category') < 0) this.headerList.push('Google_product_category');
          if(this.valuesList.indexOf('inputVal') < 0) this.valuesList.push('inputVal')
        }
        this.download()
      },
      (error : any) =>{
        this.dataForCSV = [];
      }
    );
  }

  // getGoogleCode(index: any){
  //   if (this.dataForCSV[index] && this.dataForCSV[index].Category) {
  //     if (this.dataForCSV[index].Category == 'JEWEL') {
  //       if((this.dataForCSV[index].Category == 'JEWEL') && this.dataForCSV[index]['Sub-category']){
  //         var jewelType = this.dataForCSV[index]['Sub-category'];
  //         if(jewelType == 'PENDANT_EARRINGS' || jewelType == 'STUD_EARRINGS' || jewelType == 'HOOP_EARRINGS' || jewelType == 'CREOLE_EARRINGS'){
  //           this.dataForCSV[index].inputVal = '194';
  //         }else if(jewelType == 'BRACELET' || jewelType == 'TENNIS_BRACELET' || jewelType == 'SLAVE_BRACELET'){
  //           this.dataForCSV[index].inputVal = '191';
  //         }else if(jewelType == 'CHARM'){
  //           this.dataForCSV[index].inputVal = '192';
  //         }else if(jewelType == 'BROOCH'){
  //           this.dataForCSV[index].inputVal = '197';
  //         }else if(jewelType == 'ANKLETS'){
  //           this.dataForCSV[index].inputVal = '189';
  //         }else if(jewelType == 'CHOKER' || jewelType == 'NECKLACE' || jewelType == 'TENNIS_NECKLACE'){
  //           this.dataForCSV[index].inputVal = '196';
  //         }else if(jewelType == 'RING' || jewelType == 'SEAL_RING' || jewelType == 'COMBINATION_RING' || jewelType == 'RING_WITH_PEARL' || jewelType == 'RING_WITH_GEM'){
  //           this.dataForCSV[index].inputVal = '200';
  //         }else{ this.dataForCSV[index].inputVal = '188'; }
  //       }else{ this.dataForCSV[index].inputVal = '188'; }
  //     } else if (this.dataForCSV[index].Category == 'WATCH') {
  //       this.dataForCSV[index].inputVal = '201'
  //     } else if (this.dataForCSV[index].Category == 'STRAP') {
  //       this.dataForCSV[index].inputVal = '5123'
  //     } else if (this.dataForCSV[index].Category == 'OTHERS') {
  //       this.dataForCSV[index].inputVal = '000'
  //     }else{
  //       this.dataForCSV[index].inputVal = '999'
  //     }
  //   }
  // }

  // getProductDetails(){
  //   this.expand = !this.expand;
  //   for(let index in this.dataForCSV){
  //     var aProperty = this.dataForCSV[index].aProperty;
  //     for(let index2 in this.aProperty){
  //       this.dataForCSV[index][aProperty[index2].sPropertyName] = Object.keys(aProperty[index2].oProperty)[0];
  //       if(this.secondHeaderList.indexOf(aProperty[index2].sPropertyName) < 0) this.secondHeaderList.push(aProperty[index2].sPropertyName);
  //       if(this.secondValuesList.indexOf(aProperty[index2].sPropertyName) < 0) this.secondValuesList.push(aProperty[index2].sPropertyName);
  //     }
  //   }
  //   for(let index in this.secondHeaderList){
  //     this.fieldObject[this.secondHeaderList[index]] = this.secondValuesList[index];
  //   }
  // }

  download(){
    var headerListObj = this.headerList.concat(this.secondAProjection);
    var valuesListObj = this.valuesList.concat(this.secondAProjection);
    for(let index in this.fieldsToRemove){
      var index2 = headerListObj.indexOf(this.fieldsToRemove[index]);
      headerListObj.splice(index2, 1);
      valuesListObj.splice(index2, 1);
    }
    this.secondAProjection = [];
    var data = { from: 'Assortment-stock-export'};
    this.jsonToCsvService.convertToCSV(this.dataForCSV, headerListObj, valuesListObj, 'Assortment-stock', ';', data)
    this.dialogRef.close.emit({ action: false });
  }

  selectFirstAG(data: any){ this.firstAGId = data._id; }

  selectSecondAG(data: any){ this.secondAGId = data._id; }

  removeFields(key : any){
    var obj: any = {
      'Brand': 'iBusinessBrandId',
      'Article group': 'iArticleGroupId',
      'Product number': 'sProductNumber', 
      'Label Description': 'sLabelDescription', 
      'Price inclv vat': 'nPriceIncludesVat',
      'Min Stock': 'nMinStock',
      'Article number': 'sArticleNumber',
      'Stock': 'nStock',
      'Ownership': 'eOwnerShip', 
      'Date': 'dCreatedDate'
    };
    var field = obj[key];
    var index = this.fieldsToRemove.indexOf(field);
    if(index > -1) this.fieldsToRemove.splice(index, 1);
    else this.fieldsToRemove.push(field)
  }
}
