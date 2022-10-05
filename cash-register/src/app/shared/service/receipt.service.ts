import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";
import { CommonPrintSettingsService } from "./common-print-settings.service";
import { PdfService as PdfServiceNew } from "./pdf2.service";
import { PdfService as PdfService } from "./pdf.service";

@Injectable({
    providedIn: 'root'
})
export class ReceiptService {
    iBusinessId: string;
    iLocationId: string;
    iWorkstationId: string;

    content: any = [];
    styles: any = {
        businessLogo: {
            alignment: 'left',
        },
        right: {
            alignment: 'right',
        },
        left: {
            alignment: 'left',
        },
        center: {
            alignment: 'center',
        },
        bold: {
            bold: true,
        },
        header: {
            fontSize: 12,
            bold: false,
            margin: 5, //[0, 5, 0, 10]
        },
        businessName: {
            fontSize: 12,
            margin: 5, //[0, 5, 0, 10]
        },
        // normal: {
        //     fontSize: 8,
        //     margin: 5, //[0, 5, 0, 5]
        // },
        tableExample: {
            // border: 0,
            fontSize: 8,
        },
        headerStyle: {
            fontSize: 10,
            bold: true,
            color: '#333',
            margin: [0, 10, 0, 10]
        },
        supplierName: {
            alignment: 'right',
            fontSize: 12,
            margin: [0, -10, 0, 10],
        },
        afterLine: {
            margin: [0, 0, 0, 10],
        },
        separatorLine: {
            color: '#ccc',
        },
        afterLastLine: {
            margin: [0, 20, 0, 20],
        },
        th: {
            // fontSize: 8,
            bold: true,
            // margin: [5, 10],
        },

        td: {
            // fontSize: 8,
            // margin: [5, 10],
        },
        articleGroup: {
            fillColor: '#F5F8FA',
        },
        property: {
            // color: "#ccc",
        },
    };
    


    oOriginalDataSource: any;
    // logoUri: any;
    pageSize: any = 'A5';
    orientation: string = 'portrait';
    translations: any;

    constructor(
        private pdfServiceNew: PdfServiceNew,
        private apiService: ApiService,
        private translateService: TranslateService,
        private commonService: CommonPrintSettingsService,
        private pdfService: PdfService) {
        this.iBusinessId = localStorage.getItem('currentBusiness') || '';
        this.iLocationId = localStorage.getItem('currentLocation') || '';
        this.iWorkstationId = localStorage.getItem('currentWorkstation') || '';
    }

    async exportToPdf({ oDataSource, templateData, pdfTitle }:any){
        this.oOriginalDataSource = oDataSource;
        console.log(this.oOriginalDataSource);
        this.pdfService.getTranslations();
        // console.log(this.translations);
        // if (this.oOriginalDataSource?.businessDetails?.sLogoLight){
        //     const result = await this.getBase64FromUrl(this.oOriginalDataSource.businessDetails.sLogoLight).toPromise();
        //     this.logoUri = result.data;
        // }
        this.commonService.pdfTitle = pdfTitle;
        this.commonService.mapCommonParams(templateData.aSettings);
        this.processTemplate(templateData.layout);
        
        // this.processHeader();
        // this.processTransactions();
        // this.processPayments();
        
        // this.content.push("\nRuilen binnen 8 dagen op vertoon van deze bon.\nDank voor uw bezoek.")

        // console.log(this.content);

        this.pdfServiceNew.getPdfData(
            this.styles,
            this.content,
            this.commonService.oCommonParameters.orientation,
            this.commonService.oCommonParameters.pageSize,
            this.commonService.pdfTitle,
            this.commonService.footer,
            this.commonService.oCommonParameters.pageMargins,
            this.commonService.oCommonParameters.defaultStyle
        );
        this.cleanUp();
    }

    processTemplate(layout: any) {
        /*
          we have 3 tipes of data structures
          1. column - like sections of header (ex. LEFT : business logo, CENTER: business details, RIGHT: receipt number)
          2. simple - plain textual information like paragraph
          3. table format
        */

        // console.log(layout);
        for (const item of layout) {
            if (item.type === 'columns') { // parse column structure
                this.processColumns(item.row);
            } else if (item.type === 'simple') { //parse simple data
                this.processSimpleData(item.row, item?.object);
            } else if (item.type === 'table') { //parse table
                this.processTableData(item.rows, item.columns, item.forEach, item?.layout, item?.styles);
            } else if (item.type === 'absolute') { //parse table
                this.processAbsoluteData(item.absoluteElements);
            }
        }
    }

    processAbsoluteData(absoluteElements: any) {
        // console.log('absoluteElements: ', absoluteElements);
        // absoluteElements.forEach(async (el: any) => {
        //     if(el.type==='text'){
        //         let text = this.pdfService.replaceVariables(el.html, this.oOriginalDataSource);
        //         this.content.push({ text: text, absolutePosition: { x: el.position.x * this.commonService.MM_TO_PT_CONVERSION_FACTOR, y: el.position.y * this.commonService.MM_TO_PT_CONVERSION_FACTOR } })
        //     } else if(el.type==='image'){
        //         let l = (await this.getBase64FromUrl(this.oOriginalDataSource[el.url]).toPromise()).data;
        //         console.log(l);
        //         this.content.push({
        //             image: l,
        //             width: el.size || 150,
        //             absolutePosition: { x: el.position.x, y: el.position.y }
        //         });
                
        //     }
        // });

        for (const el of absoluteElements) {
            if (el.type === 'text') {
                let text = this.pdfService.replaceVariables(el.html, this.oOriginalDataSource);
                this.content.push({ text: text, absolutePosition: { x: el.position.x * this.commonService.MM_TO_PT_CONVERSION_FACTOR, y: el.position.y * this.commonService.MM_TO_PT_CONVERSION_FACTOR } })
            } else if (el.type === 'image') {
                const img = this.addImage(el);
                // console.log(188, img);
                this.content.push(img);
                // console.log(this.oOriginalDataSource);
                // const result:any = await this.getBase64FromUrl(this.oOriginalDataSource[el.url]).toPromise();
                // const img = result.data;
                // console.log(img);
                
                
                // this.content.push({
                //     image: this.oOriginalDataSource[el.url],
                //     width: el.size || 150,
                //     absolutePosition: { x: el.position.x * this.commonService.MM_TO_PT_CONVERSION_FACTOR, y: el.position.y * this.commonService.MM_TO_PT_CONVERSION_FACTOR }
                // });

            }
            // });
        }
    }

    processTableData(rows:any, columns: any, forEach: any, layout?:any, styles?:any){
        let tableWidths:any = [];
        let tableHeadersList:any = [];
        if(columns){ // parsing columns if present
            columns.forEach((column:any)=>{
                // console.log('column: ',column);
                let text = this.pdfService.removeBrackets(column.html);//removes [[ ]] from placeholders
                let obj: any = { text: this.pdfService.translations[text] || text };
                if(column?.styles) {
                    column.styles.forEach((style:any)=>{
                        obj[style] = true;
                    })
                }
                tableHeadersList.push(obj); 
                // console.log(obj);
            });
        }
        // console.log(tableHeadersList);
        let currentDataSource = this.oOriginalDataSource;
        let texts:any = [];

        if(forEach){ //if we have forEach (nested array) then loop through it
            currentDataSource = this.oOriginalDataSource[forEach]; //take nested array as currentDataSource
            let bWidthPushed = false;
            currentDataSource.forEach((dataSource:any)=>{
                let dataRow:any = [];
                rows.forEach((row: any) => {
                    // console.log(row, this.commonService.calcColumnWidth(row.size));
                    let text = this.pdfService.replaceVariables(row.html, dataSource); //replacing placeholders with the actual values
                    dataRow.push({text: text});
                    if(!bWidthPushed) tableWidths.push(this.commonService.calcColumnWidth(row.size) || '*');
                });
                // console.log(dataRow, tableWidths);
                texts.push(dataRow);
                bWidthPushed = true;
            });
        } else { //we don't have foreach so only parsing single row
            let dataRow: any = [];
            rows.forEach((row: any) => { //parsing rows
                if(row?.type === 'image'){
                    let img = this.addImage(row);
                    // console.log(247, img);
                    // let img:any = {
                    //     image: this.oOriginalDataSource[row.url],// this.logoUri,
                    // };
                    // if(row?.margin) img.margin = row.margin;
                    // if(row?.fit) img.fit = row.fit;
                    // if (row?.align) img.alignment = row.align;
                    // if(row?.width) img.width = row.width;

                    dataRow.push(img);
                    tableWidths.push(this.commonService.calcColumnWidth(row.size) || 'auto');
                } else {
                    // console.log(row, this.commonService.calcColumnWidth(row.size));
                    if (row?.object) currentDataSource = this.oOriginalDataSource[row.object];
                    let text = this.pdfService.replaceVariables(row.html, currentDataSource); 
                    dataRow.push({ text: text });//colSpan: row?.colSpan || 0
                    tableWidths.push(this.commonService.calcColumnWidth(row.size) || '*');
                }
                
                // if(row?.colSpan){ // we have colspan so need to add empty {} in current row
                //     tableWidths.push(this.commonService.calcColumnWidth(row.size) || '*');
                // } else {
                //     tableWidths.push(this.commonService.calcColumnWidth(row.size) || '*');
                // }
                
                    
            });
            // console.log(dataRow, tableWidths);
            texts.push(dataRow);
        }
        // let totalRow: any = [];
        let finalData:any = [];
        if (tableHeadersList?.length)
            finalData = [[...tableHeadersList], ...texts];
        else 
            finalData = texts;

        let data:any = {
            table: {
                headerRows: 1,
                widths: tableWidths,
                body: finalData,
                dontBreakRows: true,
                keepWithHeaderRows: 1,
            },
        };
        if (styles) {
            styles.forEach((style:any)=>{
                data = { ...data, ...style};
            });
        }
        
        if (layout){
            //pdfmake provides 3 built-in layouts so we can use them directly, otherwise we can use custom layout from common service
            data.layout = (['noBorders', 'headerLineOnly', 'lightHorizontalLines'].includes(layout)) ? data.layout = layout : this.commonService.layouts[layout];
        } 
        // console.log('finalData in content', data);
        this.content.push(data);

    }
    
    processSimpleData(row:any, object?:any){
        // console.log(row, object);
        row.forEach((el: any) => {
            if (el?.html) {

                let html = el.html || '';
                if (typeof html === 'string') {
                    let text = this.pdfService.replaceVariables(html, (object) ? this.oOriginalDataSource[object] : this.oOriginalDataSource) || html;
                    // console.log({ text });
                    // text = this.pdfService.removeBrackets(text);
                    let obj:any = { text: text};
                    // if(el?.align) obj.alignment = el.alignment;
                    
                    if (el?.styles) {
                        obj = { ...obj, ...el.styles}
                    }
                    console.log(obj);
                    this.content.push(obj);
                }
            } else if(el?.type === 'image'){
                let img = this.addImage(el);
                this.content.push(img);
            }
        });
    }

    processColumns(row:any){
        const columns: any = [];

        row.forEach((el: any) => {
            if (el?.element === 'businessLogo') {
                columns.push(
                    {
                        // image: (await this.getBase64FromUrl(this.oOriginalDataSource.businessDetails.sLogoLight).toPromise()).data,// this.logoUri,
                        image: this.oOriginalDataSource[el.sBusinessLogoUrl],// this.logoUri,
                        // fit: [100, 100],
                        alignment: el.alignment
                    }
                );
            } 
            // else if (el?.element ==='businessDetails'){
            //     // console.log(el, this.oOriginalDataSource);
            //     let details = `${this.oOriginalDataSource.businessDetails?.sName || ''}
            //                 ${this.oOriginalDataSource.businessDetails?.sEmail || ''}
            //                 ${this.oOriginalDataSource.businessDetails?.sMobile || ''}
            //                 ${this.oOriginalDataSource.oBusiness?.oPhone?.sLandline || ''}
            //                 ${this.oOriginalDataSource.businessDetails?.aLocation?.oAddress?.street || ''}`;
            //     columns.push({ text: details, alignment: el.alignment})
            // } 
            else if (el?.element === 'sReceiptNumber'){
                columns.push({ text: `${this.oOriginalDataSource.sReceiptNumber}`, alignment: el.alignment })
            } 
            // else if( el?.element === 'barcode'){
            //     columns.push(
            //         {
            //             image: this.oOriginalDataSource.sBarcodeURI,
            //             fit: [el.width, el.height],
            //             alignment: el.alignment
            //         }
            //     );
            // } 
            else if (el?.type === 'image') {
                let img = this.addImage(el);
                // console.log(357, img);
                columns.push(img);
                // columns.push(
                //     {
                //         // image: (await this.getBase64FromUrl(this.oOriginalDataSource.businessDetails.sLogoLight).toPromise()).data,// this.logoUri,
                //         image: this.oOriginalDataSource[el.url],// this.logoUri,
                //         fit: el?.fit || [100, 100],
                //         alignment: el.alignment,
                //         margin: el?.margin || [0,0,0,0]
                //     }
                // );
            } else {
                let html = el.html || '';
                let object = el?.object;
                let text = this.pdfService.replaceVariables(html, (object) ? this.oOriginalDataSource[object] : this.oOriginalDataSource);
                console.log(374, text);
                columns.push({ text: text, alignment: el?.alignment || 'left' });
            }
        });
        this.content.push({
            columns: columns,
        });
    }
    

    // processHeader() {
    //     const columns: any = [];

    //     let businessDetails = `${this.oOriginalDataSource.businessDetails?.sName || ''}
    //         ${this.oOriginalDataSource.businessDetails?.sEmail || ''}
    //         ${this.oOriginalDataSource.businessDetails?.sMobile || ''}
    //         ${this.oOriginalDataSource.oBusiness?.oPhone?.sLandline || ''}
    //         ${this.oOriginalDataSource.businessDetails?.aLocation?.oAddress?.street || ''}`;

    //     columns.push(
    //         {
    //             image: this.logoUri,
    //             fit: [100, 100],
    //         },
    //         { text: businessDetails, width: '*', style:['center'] },
    //         { text: `${this.oOriginalDataSource.sReceiptNumber}`, width: '10%', style:['right'] },
    //     );

    //     this.content.push({
    //         columns: columns,
    //     });

    //     let receiptDetails = `Datum: ${this.oOriginalDataSource.dCreatedDate}
    //         Bonnummer: ${this.oOriginalDataSource.sReceiptNumber}
    //         Transaction number: ${this.oOriginalDataSource.sNumber}\n\n\n`;

    //     this.content.push({ text: receiptDetails });


    // }

    // processTransactions(){
    //     const tableHeaders = [
    //         'Quantity',
    //         'Description',
    //         'VAT',
    //         'Discount',
    //         'SAVINGS_PO',
    //         'Amount',
    //     ];
        
    //     let transactionTableWidths = ['10%', '*', '10%', '10%', '10%', '15%'];
        
    //     let texts: any = [];
    //     let nTotalOriginalAmount = 0;
    //     this.oOriginalDataSource.aTransactionItems.forEach((item:any) =>{
    //         // console.log({item});
    //         nTotalOriginalAmount += item.nPriceIncVat; 
    //         let description = `${item.description} 
    //             Original amount: ${item.nPriceIncVat} 
    //             Already paid: \n${item.sTransactionNumber} | ${item.nPaymentAmount} (this receipt)\n`;
            
    //         if (item?.related?.length) {
    //             item.related.forEach((related: any) => {
    //                 description += `${related.sTransactionNumber}|${related.nPaymentAmount}\n`;
    //             });
    //         }

    //         texts.push([
    //             { text: item.nQuantity, style: ['td'] },
    //             { text: description , style: ['td'] },
    //             { text: `${item.nVatRate}(${item.vat})` , style: ['td'] },
    //             { text: item.nDiscountToShow, style: ['td'] },
    //             { text: item.nSavingsPoints , style: ['td'] },
    //             { text: `(${item.totalPaymentAmount})${item.totalPaymentAmountAfterDisc}` , style: ['td','right'] },
    //         ]);
            
    //     });
        

    //     let totalRow: any = [
    //         { text: 'Total' },
    //         { text: '' },
    //         { text: this.oOriginalDataSource.totalVat },
    //         { text: this.oOriginalDataSource.totalDiscount },
    //         { text: this.oOriginalDataSource.totalSavingPoints },
    //         { text: `(${this.oOriginalDataSource.total})${this.oOriginalDataSource.totalAfterDisc}\nFrom Total ${nTotalOriginalAmount}`, style: ['right'] }
    //     ];
        
    //     if (!(this.oOriginalDataSource.totalDiscount > 0)) {
    //         totalRow.splice(3,1);
    //         tableHeaders.splice(3,1);
    //         transactionTableWidths.splice(3,1);
    //         texts.map((text:any)=>{
    //             text.splice(3,1);
    //         })
    //     }
        
    //     const tableHeadersList: any = [];
    //     tableHeaders.forEach((header: any) => {
    //         if (header === 'Amount') tableHeadersList.push({ text: header, style: ['th', 'right'] })
    //         else tableHeadersList.push({ text: header, style: ['th'] })
    //     });

    //     const finalData = [[...tableHeadersList], ...texts, [...totalRow]];
    //     const transactionData = {
    //         table: {
    //             widths: transactionTableWidths,
    //             body: finalData,
    //         },
    //         layout: this.commonService.layouts['onlyHorizontalLineLayout']
    //     };
    //     this.content.push(transactionData);
    // }

    // processPayments(){
    //     this.content.push('\n\n');
    //     const tableHeaders = [
    //         'Methode',
    //         'Bedrag',
    //     ];
    //     const tableHeadersList:any = [];
    //     tableHeaders.forEach((singleHeader: any) => {
    //         tableHeadersList.push({ text: singleHeader, style: ['th'] })
    //     });
    //     const tableWidths = ['30%', '10%'];
    //     let texts:any = []
    //     this.oOriginalDataSource.aPayments.forEach((payment:any)=>{
    //         texts.push([
    //             { text: `${payment.sMethod} (${payment.dCreatedDate})`},
    //             { text: `${payment.nAmount}`, style: ['left'] }
    //         ]);
    //     });
    //     const finalData = [[...tableHeadersList], ...texts];
    //     const data = {
    //         table: {
    //             headerRows: 1,
    //             widths: tableWidths,
    //             body: finalData,
    //             dontBreakRows: true,
    //             keepWithHeaderRows: 1,
    //         },
    //         layout: 'lightHorizontalLines'
    //     };
    //     this.content.push(data);
    // }

    getBase64FromUrl(url: any): Observable<any> {
        return this.apiService.getNew('cashregistry', `/api/v1/pdf/templates/getBase64/${this.iBusinessId}?url=${url}`);
    }

    // getTranslations() {
    //     let translationsObj: any = {};
    //     let translationsKey: Array<string> = [
    //         'CREATED_BY',
    //         'ART_NUMBER',
    //         'QUANTITY',
    //         'DESCRIPTION',
    //         'DISCOUNT',
    //         'AMOUNT',
    //         'VAT',
    //         'SAVINGS_POINTS',
    //         'GIFTCARD',
    //         'TO_THE_VALUE_OF',
    //         'ISSUED_AT',
    //         'VALID_UNTIL',
    //         'CARDNUMBER',
    //         'Methode',
    //         'Bedrag',
    //         'GIFTCARD',
    //         'TO_THE_VALUE_OF',
    //         'ISSUED_AT',
    //         'VALID_UNTIL',
    //     ];

    //     this.translateService.get(translationsKey).subscribe((result:any) => {
    //         Object.entries(result).forEach((translation: any) => {
    //             translationsObj[String("__" + translation[0])] = translation[1]
    //         })
    //     });

    //     return translationsObj;
    // }

    addImage(el:any){
        // console.log(el);
        let img: any = {
            image: this.oOriginalDataSource[el.url],// this.logoUri,
        };
        if (el?.margin) img.margin = el.margin;
        if (el?.fit) img.fit = el.fit;
        if (el?.alignment) img.alignment = el.alignment;
        if (el?.width) img.width = el.width;
        if (el?.absolutePosition) img.absolutePosition = { x: el.position.x * this.commonService.MM_TO_PT_CONVERSION_FACTOR, y: el.position.y * this.commonService.MM_TO_PT_CONVERSION_FACTOR };
        
        return img;
    }

    cleanUp(){
        this.oOriginalDataSource = null;
        this.content = [];
        this.styles = {};
    }
}