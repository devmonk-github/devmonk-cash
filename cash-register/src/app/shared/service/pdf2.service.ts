import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { CanvasService } from './canvas.service';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor(private canvas: CanvasService) { }

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

  generatePdf(docDefinition: any, fileName: any) {
    // const fonts = {
    //   MyCustom: {
    //     normal: 'GIL_____.ttf',
    //     bold: 'GILB____.ttf',
    //     italics: 'GILI___.ttf',
    //     bolditalics: 'GILBI___.ttf'
    //   }
    // };
    
    // pdfMake.fonts = {
    //   MyCustom: {
    //     normal: 'GIL_____.ttf',
    //     bold: 'GILB____.ttf',
    //     italics: 'GILI___.ttf',
    //     bolditalics: 'GILBI___.ttf'
    //   }
    // };
    // console.log(pdfMake);

    const pdfObject = pdfMake.createPdf(docDefinition);
    pdfObject.download(fileName);
  }

  getPdfData(styles: any, content: any, orientation: string, pageSize: any, fileName: string, footer?: any, pageMargins?: any, defaultStyle?: any) {
    this.generatePdf(this.getDocDefinition(styles, content, orientation, pageSize, footer, pageMargins, defaultStyle), fileName);
  }
}
