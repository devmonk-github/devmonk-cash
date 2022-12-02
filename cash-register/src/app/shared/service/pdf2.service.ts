import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { ToastService } from '../components/toast/toast.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { CanvasService } from './canvas.service';
import { PrintService } from './print.service';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  iBusinessId: string;
  iWorkstationId: any;

  constructor(private printService: PrintService, private toastrService: ToastService) {
    this.iBusinessId = localStorage.getItem('currentBusiness') || '';
    this.iWorkstationId = localStorage.getItem('currentWorkstation') || ''
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
    const docDefinition: any = {
      pageOrientation: orientation,
      pageSize,
      pageMargins: pageMargin,
      content: content,
      styles: styles,
      defaultStyle: {
        fontSize: 6
      },
    };
    if (footer) docDefinition.footer = footer;
    if (pageMargins) docDefinition.pageMargins = pageMargins;
    if (defaultStyle) docDefinition.defaultStyle = defaultStyle;
    return docDefinition;
  }

  generatePdf(docDefinition: any) {
    return pdfMake.createPdf(docDefinition);

  }

  getPdfData({ styles, content, orientation, pageSize, pdfTitle, footer, pageMargins, defaultStyle,
    printSettings, printActionSettings, eType, eSituation, sAction }: any) {
    // console.log('getPdfData', { orientation, pageSize, pdfTitle, pageMargins, printSettings, printActionSettings, sAction, eType })
    const docDefinition = this.getDocDefinition(styles, content, orientation, pageSize, footer, pageMargins, defaultStyle);
    const pdfObject = this.generatePdf(docDefinition);
    if ((printSettings?.length && printActionSettings?.length) || sAction) {
      this.processPrintAction(pdfObject, pdfTitle, printSettings, printActionSettings, eType, eSituation, sAction);
    } else {
      pdfObject.download(pdfTitle);
    }
  }


  processPrintAction(pdfObject: any, pdfTitle: any, printSettings: any, printActionSettings: any, eType: any, eSituation: any, sAction: any) {
    // pdfObject.download(pdfTitle);
    if (!printActionSettings?.length && !sAction) {
      pdfObject.download(pdfTitle);
      return;
    } else if (printActionSettings?.length){
      printActionSettings = printActionSettings.filter((s: any) => s.eType === eType && s.eSituation === eSituation);
    }
    // if(eType === 'regular') eType = 'transaction'; 
    printSettings = printSettings.filter((s: any) => s.sType === eType && s.iWorkstationId === this.iWorkstationId);
    // console.log('filtered actions', printSettings)
    if (sAction && sAction === 'print') {
      // console.log('if sAction= print')
      printSettings = printSettings.filter((s: any) => s.sMethod === 'pdf')[0];
      // console.log('if filter', printSettings)
      this.handlePrint(pdfObject, printSettings, pdfTitle);
    } else if (sAction && sAction === 'download') {
      // console.log('else if saction=download')
      pdfObject.download(pdfTitle);
      return;
    } else if (sAction && sAction === 'thermal') {
      // console.log('else if saction=thermal')
      printSettings = printSettings.filter((s: any) => s.sMethod === 'thermal')[0];
      this.handlePrint(pdfObject, printSettings, pdfTitle);
      return;
    } else {
      if (printActionSettings?.length) {
        const aActionToPerform = printActionSettings[0].aActionToPerform;
        aActionToPerform.forEach((action: any) => {
          switch (action) {
            case 'PRINT_PDF':
              printSettings = printSettings.filter((s: any) => s.sMethod === 'pdf')[0];
              if (!printSettings?.nPrinterId) {
                this.toastrService.show({ type: 'danger', text: `Printer is not selected for ${printSettings.sType}` });
                return;
              }
              this.handlePrint(pdfObject, printSettings, pdfTitle);
              break;
            case 'DOWNLOAD':
              pdfObject.download(pdfTitle);
              break;
            case 'PRINT_THERMAL':
              printSettings = printSettings.filter((s: any) => s.sMethod === 'thermal')[0];
              this.handlePrint(pdfObject, printSettings, pdfTitle);
              break;
          }
        });
      } else {
        pdfObject.download(pdfTitle);
        return;
      }
    }
  }

  handlePrint(pdfObject: any, printSettings: any, pdfTitle: any) {
    pdfObject.getBase64((data: any) => {
      this.printService.printPDF(
        this.iBusinessId,
        data,
        printSettings.nPrinterId,
        printSettings.nComputerId,
        1,
        pdfTitle,
        { title: pdfTitle }
      )
    });
  }
}
