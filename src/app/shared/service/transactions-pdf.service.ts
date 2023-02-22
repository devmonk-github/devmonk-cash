import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as moment from 'moment';
import { PdfService } from 'src/app/shared/service/pdf2.service';
import { ApiService } from './api.service';
import { left } from '@popperjs/core';

@Injectable({
  providedIn: 'root'
})
export class TransactionsPdfService {

  styles: any =
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
        alignment: 'center',
        bold: false,
        margin: [0, 10, 20, 20]
      },
      businessName: {
        fontSize: 12,
      },
      afterLine: {
        margin: [0, 0, 0, 10]
      },
      afterLastLine: {
        margin: [0, 20, 0, 20]
      },
    };


  constructor(private pdf: PdfService,
    private apiService: ApiService) { }

  exportToPdf(requestParams: any, customerHeader: any, page: any, businessDetail: any) {
    let aTableBody: Array<any> = [];
    // this.downloading = true;
    let aActivityItem: any[] = [];

    let tableWidth: any = [];
    let tableHeader: any = [];
    let headerObj: any = {}

    customerHeader.forEach((header: any) => {
      tableWidth.push(header.width);
      tableHeader.push({ text: header.key, bold: true });
      headerObj = { ...headerObj, [header.value]: header.key }
    })

    this.apiService.postNew('cashregistry', '/api/v1/activities/items', requestParams).subscribe(
      (result: any) => {
        if (result && result.data && result.data.length) {
          aActivityItem = result.data;
          aActivityItem.forEach((activityItem: any, index: Number) => {
            let obj: any = {};
            let aEmployeeName :any 
            if(activityItem?.sEmployeeName) aEmployeeName = activityItem?.sEmployeeName.split(' ');
            if (headerObj['sNumber']) obj['sNumber'] = activityItem && activityItem.sNumber ? activityItem.sNumber : '-';
            if (headerObj['oCustomer.sLastName']) obj['oCustomer.sLastName'] = activityItem && activityItem.oCustomer?.sLastName ? activityItem.oCustomer?.sLastName : '-';
            if (headerObj['oCustomer.oInvoiceAddress.sCity']) obj['oCustomer.oInvoiceAddress.sCity'] = activityItem && activityItem?.oCustomer?.sCity ? activityItem?.oCustomer?.sCity : '-';
            if (headerObj['sDescription']) obj['sDescription'] = activityItem && activityItem?.sDescription ? activityItem?.sDescription : '-';
            if (headerObj['nTotalAmount']) obj['nTotalAmount'] = activityItem && activityItem?.nTotalAmount ? activityItem?.nTotalAmount : '-';
            if (headerObj['dCreatedDate']) obj['dCreatedDate'] = activityItem && activityItem.dCreatedDate ? moment(activityItem.dCreatedDate).format('DD-MM-yyyy') : '-';
            if (headerObj['dEstimatedDate']) obj['dEstimatedDate'] = activityItem && activityItem?.dEstimatedDate ? moment(activityItem?.dEstimatedDate).format('DD-MM-yyyy') : '-';
            if (headerObj['dActualFinishDate']) obj['dActualFinishDate'] = activityItem && activityItem.dActualFinishDate ? moment(activityItem.dActualFinishDate).format('DD-MM-yyyy') : '-';
            if (headerObj['sEmployeeName']) obj['sEmployeeName'] = (aEmployeeName && aEmployeeName[0].charAt(0) ? aEmployeeName[0].charAt(0) : '-') + (aEmployeeName && aEmployeeName[1].charAt(0) ? aEmployeeName[1].charAt(0) : '-');

            aTableBody.push(obj);
          })

          let date: any = Date.now();
          date = moment(date).format('DD-MM-yyyy');

          let bodyData: Array<any> = [];
          aTableBody.forEach((singleRecord: any) => {
            bodyData.push(Object.values(singleRecord));
          })


          let content = [
            { text: date, style: 'dateStyle' },
            { text: 'Activity Item Overview', style: 'header' },
            { text: businessDetail?.sName, style: 'businessName' },
            // { text: supplierDetailsName, style: 'supplierName' },
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 575, y2: 0, lineWidth: 1 }], margin: [0, 0, 20, 0], style: 'afterLine' },
            {
              style: 'tableExample',
              table: {
                headerRows: 1,
                widths: tableWidth,
                // widths: [70, 75, 85, 50, 30, 40, 40, 50, 50],
                // widths: [ 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto','auto' ],
                body: [tableHeader]
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
                // widths: [ 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto','auto' ],
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
            },
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 575, y2: 0, lineWidth: 1 }], margin: [0, 0, 20, 0], style: 'afterLastLine' },
          ]

          this.pdf.getPdfData({ styles: this.styles, content: content, orientation: 'portrait', pageSize: 'A4', pdfTitle: "TESTACTIVITYPDF" + '-' + 'StockList' })
          // this.downloading = false;
        }
      },
      (error: any) => {
        aActivityItem = [];
        // this.downloading = false;
      }
    );
  }
}
