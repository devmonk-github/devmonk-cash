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
const moment = (_moment as any).default ? (_moment as any).default : _moment;
import { PdfService } from 'src/app/shared/service/pdf2.service';
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
  @Input() customerHeaderList: Array<any> = [];
  customerList: Array<any> = [];
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
  iBusinessId: any;
  bAllSelected = true;

  fieldsToAdd: Array<any> = [];
  dataForCSV: Array<any> = [];
  fieldObject: any = {};
  faTimes = faTimes;
  customerTypes: any = [
    { key: 'ALL', value: 'all' },
    { key: 'PRIVATE', value: 'private' },
    { key: 'COMPANY', value: 'company' }
  ]

  dialogRef: DialogComponent;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
    private jsonToCsvService: JsonToCsvService,
    private exportsService: ExportsService,
    private dialogService: DialogService,
    private pdf: PdfService,
    private customerStructureService: CustomerStructureService
  ) {
    const _injector = this.viewContainerRef.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit(): void {
    this.iBusinessId = localStorage.getItem('currentBusiness');
    // this.fetchSecondHeaderList();
  }

  fetchSecondHeaderList() {
    var data = {
      iBusinessId: this.iBusinessId
    };
    this.apiService.postNew('core', '/api/v1/property/settings/list', data).subscribe(
      (result: any) => {
        this.loader = false;
        for (let index in result.data) {
          if (this.secondHeaderList.indexOf(result.data[index].property.sName) < 0) this.secondHeaderList.push(result.data[index].property.sName);
        }
      })
  }

  addToSecondHeaderList(data: String) {
    if (this.secondAProjection.indexOf(data) < 0 && data) this.secondAProjection.push(data);
  }

  selectAll(event: any) {
    this.bAllSelected = event.checked;
    this.customerHeaderList.forEach(element => {
      element.isSelected = event.checked;
    });
  }

  close(flag: Boolean) {
    var data = this.fieldsToAdd;
    this.fieldsToAdd = [];
    if (flag) this.dialogRef.close.emit({ action: true, data });
    else this.dialogRef.close.emit({ action: false })
  }
 
  getExportPDF() {
    var body = this.requestParams;
    var arr:any = [];
    this.apiService.postNew('customer', '/api/v1/customer/exports', body).subscribe(
      (result: any) => {
        this.customerList = result.data[0].result;
        this.customerList?.forEach((customer: any, index: Number) => {
          let ShippingAddress = customer?.oShippingAddress?.sStreet + " "+ customer?.oShippingAddress?.sHouseNumber + " "+ customer?.oShippingAddress?.sPostalCode;
          let InvoiceAddress = customer?.oInvoiceAddress?.sStreet + " "+ customer?.oInvoiceAddress?.sHouseNumber + " "+ customer?.oInvoiceAddress?.sPostalCode;
          
          var obj: any = {};
          obj['Salutation'] = customer?.sSalutation ? customer?.sSalutation : '';
          obj['First name'] = customer?.sFirstName ? customer?.sFirstName : '';
          obj['Prefix'] = customer?.sPrefix ? customer?.sPrefix : '';
          obj['Last name'] = customer?.sLastName ? customer?.sLastName : '';
          obj['Date of birth'] = customer?.dDateOfBirth ? moment(customer?.dDateOfBirth).format('DD-MM-yyyy') : '';
          obj['Gender'] = customer?.sGender ? customer?.sGender : '';
          obj['Email'] = customer?.sEmail ? customer?.sEmail : '';
          obj['Landline'] = customer?.oPhone.sLandLine ? customer?.oPhone.sLandLine : '';
          obj['Mobile'] = customer?.oPhone.sMobile ? customer?.oPhone.sMobile : '';
          obj['ShippingAddress'] = ShippingAddress || '';
          obj['InvoiceAddress'] = InvoiceAddress || '';
          obj['Company name'] = customer?.sCompanyName ? customer?.sCompanyName : '';
          obj['Vat number'] = customer?.sVatNumber ? customer?.sVatNumber : '';
          obj['Coc number'] = customer?.sCocNumber ? customer?.sCocNumber : '';
          obj['Payment term days'] = customer?.nPaymentTermDays ? customer?.nPaymentTermDays : 0;
          obj['Matching code'] = customer?.nMatchingCode ? customer?.nMatchingCode : 0;
          obj['Client id'] = customer?.nClientId ? customer?.nClientId : '';
          obj['Note'] = customer?.sNote ? customer?.sNote : '';
          obj['Points'] =  0;
          obj['Newsletter'] = customer?.bNewsletter ? customer?.bNewsletter : '';
          arr.push(obj);
        })
        if (this.bAllSelected && !this.fieldsToAdd.length) this.fieldsToAdd = this.customerHeaderList;
        var header = this.customerHeaderList;
        var date = Date.now();
        date = moment(date).format('DD-MM-yyyy');
        var headerList: Array<any> = [];
        header.forEach((singleHeader: any) => {
          headerList.push({ text: singleHeader.value, bold: true })
        })
        var bodyData: Array<any> = [];
        arr.forEach((singleRecord: any) => {
          bodyData.push(Object.values(singleRecord));
        })
        const tableWidth = ['10%','10%','10%','10%','10%','10%','10%','10%','10%','10%','10%','10%','10%','10%','10%','10%','10%','10%','10%','10%' ]
        
        var content = [
          { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 575, y2: 0, lineWidth: 1 }], margin: [0, 0, 20, 0], style: 'afterLine' },
          {
            style: 'tableExample',
            table: {
              headerRows: 1,
              widths: tableWidth,
              body: [headerList]
            },
            layout: {
              hLineStyle: function () {
                return { dash: { length: 0.001, space: 40 * 20 } };
              },
              vLineStyle: function () {
                return { dash: { length: 0.001, space: 40 * 20 } };
              },
            }
          },
          { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 575, y2: 0, lineWidth: 1 }], margin: [0, 0, 20, 0], style: 'afterLine' },
          {
            style: 'tableExample',
            table: {
              headerRows: 0,
              widths: tableWidth,
              body: bodyData
            },
            layout: {
              hLineStyle: function () {
                return { dash: { length: 0.001, space: 40 * 20 } };
              },
              vLineStyle: function () {
                return { dash: { length: 0.001, space: 40 * 20 } };
              },
            }
          }
          
        ]

        var styles =
        {
          dateStyle: {
            alignment: 'right',
            fontSize: 9,
            margin: [0, 0, 0, 0]
          },
          tableExample: {
            border: 0,
            fontSize: 9,
          },
          tableExample2: {
            fontSize: 8,
          },
          supplierName: {
            alignment: 'right',
            fontSize: 12,
            margin: [0, -10, 0, 10]
          },
          header: {
            fontSize: 15,
            bold: false,
            margin: [0, 10, 20, 20]
          },
          businessName: {
            fontSize: 12
          },
          afterLine: {
            margin: [0, 0, 0, 10]
          },
          afterLastLine: {
            margin: [0, 20, 0, 20]
          },
        };

        this.pdf.getPdfData({styles, content, orientation: 'portrait', pageSize: 'A3', pdfTitle: "Customer" + '-' + date })
              
      },
      (error: any) => {
        this.dataForCSV = [];
      }
    );
  }

  getExportData() {
    //this.separator = separator;
    for (let index in this.secondAProjection) {
      if (this.requestParams.aProjection.indexOf(this.secondAProjection[index]) < 0) this.requestParams.aProjection.push(this.secondAProjection[index]);
    }
    if (this.bAllSelected && !this.fieldsToAdd.length) this.fieldsToAdd = this.customerHeaderList;
    this.fieldsToAdd.forEach((header: any) => {
      this.headerList.push(header.value);
      this.valuesList.push(header.key);
    })
    this.requestParams.aProjection = this.valuesList;
    this.requestParams.aProjection.push('oPhone.sPrefixMobile', 'oPhone.sPrefixLandline');
    if (!this.useSameFilter) { this.requestParams.oFilterBy.oDynamic = {}; this.requestParams.oFilterBy.oStatic = {}; }
    var body = this.requestParams;
    this.apiService.postNew('customer', '/api/v1/customer/exports', body).subscribe(
      (result: any) => {
        if (result && result.data && result.data.length) {
          this.dataForCSV = result.data[0].result;
        }
        for (const customer of this.dataForCSV) {
          if (customer.dDateOfBirth) customer.dDateOfBirth = moment(customer.dDateOfBirth).format('DD-MM-yyyy');
          if (typeof (customer['oPoints']) == 'number') {
            customer['oPoints'] = (customer.oPoints ? customer.oPoints : '-')
          } else {
            customer['oPoints'] = '-'
          }
          customer['sEmail'] = customer.sEmail;
          if (customer?.oPhone?.sPrefixLandline) {
            customer['oPhone.sLandLine'] = customer?.oPhone?.sPrefixLandline + customer?.oPhone?.sLandLine;
          } else {
            customer['oPhone.sLandLine'] = (customer.oPhone && customer.oPhone.sLandLine ? customer.oPhone.sLandLine : '')
          }
          if (customer?.oPhone?.sPrefixMobile) {
            customer['oPhone.sMobile'] = customer?.oPhone?.sPrefixMobile + customer?.oPhone?.sMobile;
          } else {
            customer['oPhone.sMobile'] = (customer.oPhone && customer.oPhone.sMobile ? customer.oPhone.sMobile : '')
          }

          let ShippingAddress = customer?.oShippingAddress?.sStreet + " "+ customer?.oShippingAddress?.sHouseNumber + " "+ customer?.oShippingAddress?.sPostalCode;
          let InvoiceAddress = customer?.oInvoiceAddress?.sStreet + " "+ customer?.oInvoiceAddress?.sHouseNumber + " "+ customer?.oInvoiceAddress?.sPostalCode;
          
          customer['oShippingAddress'] = ShippingAddress || "-";
          customer['oInvoiceAddress'] = InvoiceAddress || "-";
          
        }
        for (let index in this.headerList) {
          this.fieldObject[this.headerList[index]] = this.valuesList[index]
        }
        this.download();
      },
      (error: any) => {
        this.dataForCSV = [];
      }
    );
  }
  download() {
    var data = { from: 'Customers-export' };
    this.jsonToCsvService.convertToCSV(this.dataForCSV, this.headerList, this.valuesList, 'Customers', this.separator, data)
    this.dialogRef.close.emit({ action: false });
  }
  removeFields(obj: any, event: any) {
    if (event?.target?.checked) {
      this.fieldsToAdd.push(obj);
    } else {
      var index = this.fieldsToAdd.findIndex((field) => field.value == obj.value);
      if (index > -1) this.fieldsToAdd.splice(index, 1);
    }
  }
}
