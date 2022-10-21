import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { CanvasService } from './canvas.service';
import { PrintService } from './print.service';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  iBusinessId: string;

  constructor(private printService: PrintService) {
    this.iBusinessId = localStorage.getItem('currentBusiness') || '';
   }

  /** Method to set PDF Title */
  setTitle(logo: any, title: string, page: any, pageSize: string): any {
    // let companyDetail = '';
    let margin;
    let fontSize;

    if (pageSize === 'A6') {
      margin = [15, 10, 0, 10];
      fontSize = 8;
    } else {
      margin = [15, 10, 0, 10];
      fontSize = 10;
    }

    return [
      {
        table: {
          widths: ['35%', '65%'],
          body: [
            [{
              image: logo,
              width: 60,
              height: 30,
              border: 1
            }],
            [{ text: title, fontSize, margin: [100, -20, 0, 0] }],
          ],
        },
        layout: 'noBorders',
      },

    ];
  }

  /**  Method for creating PDF table header */
  createTableHeader(header: string[]): any {
    const pageHeader = { fila_0: {} };
    header.forEach((attribute, i) => {
      // pageHeader.fila_0['col_' + (+i + 1)] = { text: attribute, style: 'tableHeader', margin: [0, 8, 0, 0] };
    });
    return pageHeader;
  }

  createBody(headers: any, records: object[]): any {
    const body = [];
    for (const key in headers) {
      const row = [];
      for (let headerKey in headers[key]) {
        row.push(headers[key][headerKey]);
      }
      body.push(row);
    }

    records.forEach((record: any) => {
      const row = [];
      for (const key in record) {
        row.push(record[key]);
      }
      body.push(row);
    });
    return body;
  }

  getDocDefinition(styles: any, content: any, orientation: string, pageSize?: any, footer?: any, pageMargins?: any, defaultStyle?: any) {

    let pageMargin;
    let headerFont;
    let contentFont;
    if (pageSize === 'A6') {
      pageMargin = [10, 110, 10, 10];
      headerFont = 10;
      contentFont = 7;
    } else {
      headerFont = 16;
      contentFont = 10;
      pageMargin = [10, 10, 10, 10];
    }
    const docDefinition:any = {
      pageOrientation: orientation,
      pageSize,
      pageMargins: pageMargin,
      content: content,
      styles: styles,
      defaultStyle: {
        fontSize: 6
      },
    };
    if(footer) docDefinition.footer = footer;
    if(pageMargins) docDefinition.pageMargins = pageMargins;
    if(defaultStyle) docDefinition.defaultStyle = defaultStyle;
    // console.log(docDefinition);
    return docDefinition;
  }

  generatePdf(docDefinition: any) {
    return pdfMake.createPdf(docDefinition);
    
  }

  getPdfData({ styles, content, orientation, pageSize, fileName, footer, pageMargins, defaultStyle, 
    printSettings, printActionSettings, aTransactionItemType, eSituation }:any) {
    const docDefinition = this.getDocDefinition(styles, content, orientation, pageSize, footer, pageMargins, defaultStyle);
    const pdfObject = this.generatePdf(docDefinition);
    this.processPrintAction(pdfObject, fileName, printSettings, printActionSettings, aTransactionItemType, eSituation);
  }


  processPrintAction(pdfObject: any, fileName: any, printSettings: any, printActionSettings: any, aTransactionItemType: any, eSituation:any){
    pdfObject.download(fileName);
    console.log({ printActionSettings, printSettings, aTransactionItemType, eSituation });
    // printActionSettings.forEach((actionSetting:any)=>{
    //   if(aTransactionItemType.includes(actionSetting.eType)){

    //   }
    // })
    return;
    pdfObject.getBase64((data: any) => {
      this.printService.printPDF(
        this.iBusinessId,
        data,
        printSettings.nPrinterId,
        printSettings.nComputerId,
        1,
        fileName,
        { title: fileName }
      )
    });
    pdfObject.download(fileName);
  }
}
