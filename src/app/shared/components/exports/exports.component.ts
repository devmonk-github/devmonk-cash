import { Component, OnInit, Input, ViewContainerRef } from '@angular/core';
import { ApiService } from 'src/app/shared/service/api.service';
import { JsonToCsvService } from 'src/app/shared/service/json-to-csv.service';
import { ExportsService } from 'src/app/shared/service/exports.service';
import * as _moment from 'moment';
import _, { head } from 'lodash';
import { DialogService } from '../../service/dialog';
import { DialogComponent } from '../../service/dialog';
import { CustomerStructureService } from '../../service/customer-structure.service';
import { faTimes } from "@fortawesome/free-solid-svg-icons";

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
  @Input() customerHeaderList:Array<any> =[];

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
  faTimes = faTimes;

  dialogRef: DialogComponent;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
    private jsonToCsvService: JsonToCsvService,
    private exportsService: ExportsService,
    private dialogService:DialogService ,
    private customerStructureService: CustomerStructureService
  ) { 
    const _injector = this.viewContainerRef.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent); 
  }

  ngOnInit(): void { 
    this.iBusinessId = localStorage.getItem('currentBusiness');
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

  getExportData(separator:any){
    this.separator = separator;
    for(let index in this.secondAProjection){
      if(this.requestParams.aProjection.indexOf(this.secondAProjection[index]) < 0) this.requestParams.aProjection.push(this.secondAProjection[index]);
    }
    let secondHeader = _.clone(this.customerHeaderList);
    for(let index in this.fieldsToRemove){
      const headerIndex =secondHeader.findIndex((customerheader:any)=> customerheader.key == this.fieldsToRemove[index].key)
      if(headerIndex >-1){
         secondHeader.splice(headerIndex , 1);
      }
    }
     secondHeader.forEach((header:any)=>{
      this.headerList.push(header.value);
      this.valuesList.push(header.key);
    })

    this.requestParams.aProjection = this.valuesList;
    if(!this.useSameFilter){ this.requestParams.oFilterBy.oDynamic = {}; this.requestParams.oFilterBy.oStatic = {}; }
    var body = this.requestParams;
    this.apiService.postNew('customer', '/api/v1/customer/exports', body).subscribe(
      (result : any) => {
        if(result && result.data && result.data.length){
          this.dataForCSV = result.data[0].result;
        }
          for (const customer of this.dataForCSV) {
            if(typeof(customer['oPoints']) == 'number'){
              customer['oPoints'] = (customer.oPoints ? customer.oPoints : '-')
            }else{
              customer['oPoints'] = '-'
            }
            // customer['NAME'] = this.customerStructureService.makeCustomerName(customer);
            // customer['oShippingAddress'] = this.customerStructureService.makeCustomerAddress(customer.oShippingAddress, false);
            // customer['oInvoiceAddress'] = this.customerStructureService.makeCustomerAddress(customer.oInvoiceAddress, false);
            customer['sEmail'] = customer.sEmail;
            customer['oPhone.sLandLine'] = customer.oPhone && customer.oPhone.sLandLine? customer.oPhone.sLandLine:'';
            customer['oPhone.sMobile'] =customer.oPhone && customer.oPhone.sMobile ? customer.oPhone.sMobile :"";
            customer['oShippingAddress.sStreet'] = customer.oShippingAddress && customer.oShippingAddress.sStreet ? customer.oShippingAddress.sStreet :"";
            customer['oShippingAddress.sHouseNumber'] = customer.oShippingAddress &&  customer.oShippingAddress.sHouseNumber ? customer.oShippingAddress.sHouseNumber :"";
            customer['oShippingAddress.sPostalCode'] =customer.oShippingAddress &&  customer.oShippingAddress.sPostalCode? customer.oShippingAddress.sPostalCode:"";
            customer['oShippingAddress.sCountryCode'] = customer.oShippingAddress && customer.oShippingAddress.sCountryCode ? customer.oShippingAddress.sCountryCode:"";
            // customer['oPhone'] = (customer.oPhone && customer.oPhone.sLandLine ? customer.oPhone.sLandLine : '') + (customer.oPhone && customer.oPhone.sLandLine && customer.oPhone.sMobile ? ' / ' : '') + (customer.oPhone && customer.oPhone.sMobile ? customer.oPhone.sMobile : '')
            customer['oIdentity'] = (customer.oIdentity && customer.oIdentity.documentName ? customer.oIdentity.documentName : '-') + (customer.oIdentity && customer.oIdentity.documentNumber ? customer.oIdentity.documentNumber : '')
          }
          

        for(let index in this.headerList){
          this.fieldObject[this.headerList[index]] = this.valuesList[index]
        }
      
        this.download()
      },
      (error : any) =>{
        this.dataForCSV = [];
      }
    );
  }


  download(){  
    var data = { from: 'Assortment-stock-export'};
    this.jsonToCsvService.convertToCSV(this.dataForCSV, this.headerList, this.valuesList, 'Assortment-stock', this.separator, data)
    this.dialogRef.close.emit({ action: false });
  }

  removeFields(obj : any){
    var index = this.fieldsToRemove.findIndex((field)=>field.value == obj.value);
    if(index > -1) this.fieldsToRemove.splice(index, 1);
    else this.fieldsToRemove.push(obj)
  }
}
