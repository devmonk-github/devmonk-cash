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
export class TransactionReceiptService {
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
    onlyHorizontalLineLayout = {
        hLineWidth: function (i: number, node: any) {
            // return (i === node.table.body.length ) ? 0 : 1;
            return 0.5;
        },
        vLineWidth: function (i: number, node: any) {
            return 0;
        },
    };

    tableLayout = {
        hLineWidth: function (i: number, node: any) {
            return i === 0 || i === node.table.body.length ? 0 : 0.5;
        },
        vLineWidth: function (i: number, node: any) {
            return i === 0 || i === node.table.widths.length ? 0 : 0;
        },
        hLineColor: function (i: number, node: any) {
            return i === 0 || i === node.table.body.length ? '#999' : '#999';
        },
        // paddingLeft: function (i: number, node: any) {
        //     return i === 0 ? 0 : 20;
        // },
        // paddingRight: function (i: number, node: any) {
        //     return i === node.table.widths.length ? 20 : 0;
        // },
    };

    transaction: any;
    logoUri: any;
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

    async exportToPdf({ transaction, templateData, pdfTitle }:any){
        this.transaction = transaction;
        // console.log(this.transaction);
        this.translations = await this.getTranslations();
        // console.log(this.translations);
        const result = await this.getBase64FromUrl(this.transaction.businessDetails.sLogoLight).toPromise();
        this.logoUri = result.data;
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

    processTemplate(layout:any){
        // console.log(layout);
        layout.forEach((item:any)=>{
            if(item.type==='columns'){ // parse column structure
                this.processColumns(item.row);
            } else if(item.type==='simple'){ //parse simple data
                this.processSimpleData(item.row);
            } else if (item.type === 'table') { //parse table
                this.processTableData(item.rows, item.columns, item.forEach );
            }
        });
    }

    processTableData(rows:any, columns: any, forEach: any){
        let tableWidths:any = [];
        let tableHeadersList:any = [];
        if(columns){ // parsing columns if present
            columns.forEach((column:any)=>{
                tableHeadersList.push({ text: this.translations[this.removeBrackets(column.html)]}); //removes [[ ]] and inserts translated values 
            });
        }
        let currentDataSource = this.transaction;
        let texts:any = [];

        if(forEach){ //if we have forEach (nested array) then loop through it
            currentDataSource = this.transaction[forEach]; //take nested array as currentDataSource
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
                // console.log(row, this.commonService.calcColumnWidth(row.size));
                let text = this.pdfService.replaceVariables(row.html, currentDataSource); 
                dataRow.push({ text: text });//colSpan: row?.colSpan || 0
                // tableWidths.push(this.commonService.calcColumnWidth(row.size) || '*');
                
                if(row?.colSpan){ // we have colspan so need to add empty {} in current row
                    tableWidths.push(this.commonService.calcColumnWidth(row.size) || '*');
                } else {
                    tableWidths.push(this.commonService.calcColumnWidth(row.size) || '*');
                }
                
                    
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
        // const finalData = [[...tableHeadersList], ...texts, [...totalRow]];
        // console.log(finalData);

        const data = {
            table: {
                headerRows: 1,
                widths: tableWidths,
                body: finalData,
                dontBreakRows: true,
                keepWithHeaderRows: 1,
            },
            // layout: 'lightHorizontalLines'
        };
        // console.log('finalData in content', data);
        this.content.push(data);

    }
    
    processSimpleData(row:any){
        row.forEach((el:any)=>{
            let html = el.html || '';
            if(typeof html==='string') {
                let text = this.pdfService.replaceVariables(html, this.transaction);
                console.log({text});
                this.content.push({ text: text, alignment: el.align });
            }
        });
    }
    
    // replaceVariables(html: any, dataSource?: any) {
    //     let extractedVariables = this.getVariables(html);
    //     let finalString = html;
    //     let providedData = (dataSource) ? this.transaction[dataSource] : this.transaction;
    //     console.log('provided data', providedData);
    //     if (Array.isArray(providedData)) {
    //         console.log('array', providedData);
    //         let temp = '';
    //         providedData.forEach((item: any) => {
    //             temp += this.matchAndAppendData(item, extractedVariables);
    //         })
    //         console.log(temp);
    //     } else {
    //         console.log('object', providedData);
    //         return this.matchAndAppendData(providedData, extractedVariables);
    //     }
    //     return finalString;
    // }

    private matchAndAppendData(providedData: any, extractedVariables:any){
        console.log({ providedData, extractedVariables });
            let finalString = '';
            extractedVariables.forEach((v:any) => {

                let matched = false;
                let newText = '';
                let currentMatchClean = this.removeBrackets(v);

                Object.keys(providedData).forEach((key) => {
                    if (key === currentMatchClean && String(providedData[currentMatchClean]).length > 0) {
                        matched = true;
                        newText = String(providedData[currentMatchClean]);
                    }
                });

                if (matched) {
                    finalString = finalString.replace(v, newText);
                }
            })
        
        return finalString;
    }

    private removeBrackets(textWithBrackets: string): string {
        return textWithBrackets.replace(/\s/g, '').replace(' ', '').replace('[[', '').replace(']]', '');
    }

    private getVariables(text: string): RegExpMatchArray | null {
        return text.match(/\[\[(.*?)]]/ig) || null
    }

    processColumns(row:any){
        const columns: any = [];

        row.forEach((el: any) => {
            if (el.element === 'businessLogo') {
                columns.push(
                    {
                        image: this.logoUri,
                        fit: [100, 100],
                        alignment: el.align
                    }
                );
            } else if (el.element ==='businessDetails'){
                let details = `${this.transaction.businessDetails?.sName || ''}
                            ${this.transaction.businessDetails?.sEmail || ''}
                            ${this.transaction.businessDetails?.sMobile || ''}
                            ${this.transaction.oBusiness?.oPhone?.sLandline || ''}
                            ${this.transaction.businessDetails?.aLocation?.oAddress?.street || ''}`;
                columns.push({ text: details, alignment: el.align})
            } else if (el.element === 'sReceiptNumber'){
                columns.push({ text: `${this.transaction.sReceiptNumber}`, alignment: el.align })
            }
        });
        this.content.push({
            columns: columns,
        });
    }
    

    processHeader() {
        const columns: any = [];

        let businessDetails = `${this.transaction.businessDetails?.sName || ''}
            ${this.transaction.businessDetails?.sEmail || ''}
            ${this.transaction.businessDetails?.sMobile || ''}
            ${this.transaction.oBusiness?.oPhone?.sLandline || ''}
            ${this.transaction.businessDetails?.aLocation?.oAddress?.street || ''}`;

        columns.push(
            {
                image: this.logoUri,
                fit: [100, 100],
            },
            { text: businessDetails, width: '*', style:['center'] },
            { text: `${this.transaction.sReceiptNumber}`, width: '10%', style:['right'] },
        );

        this.content.push({
            columns: columns,
        });

        let receiptDetails = `Datum: ${this.transaction.dCreatedDate}
            Bonnummer: ${this.transaction.sReceiptNumber}
            Transaction number: ${this.transaction.sNumber}\n\n\n`;

        this.content.push({ text: receiptDetails });


    }

    processTransactions(){
        const tableHeaders = [
            'Quantity',
            'Description',
            'VAT',
            'Discount',
            'SAVINGS_PO',
            'Amount',
        ];
        
        let transactionTableWidths = ['10%', '*', '10%', '10%', '10%', '15%'];
        
        let texts: any = [];
        let nTotalOriginalAmount = 0;
        this.transaction.aTransactionItems.forEach((item:any) =>{
            // console.log({item});
            nTotalOriginalAmount += item.nPriceIncVat; 
            let description = `${item.description} 
                Original amount: ${item.nPriceIncVat} 
                Already paid: \n${item.sTransactionNumber} | ${item.nPaymentAmount} (this receipt)\n`;
            
            if (item?.related?.length) {
                item.related.forEach((related: any) => {
                    description += `${related.sTransactionNumber}|${related.nPaymentAmount}\n`;
                });
            }

            texts.push([
                { text: item.nQuantity, style: ['td'] },
                { text: description , style: ['td'] },
                { text: `${item.nVatRate}(${item.vat})` , style: ['td'] },
                { text: item.nDiscountToShow, style: ['td'] },
                { text: item.nSavingsPoints , style: ['td'] },
                { text: `(${item.totalPaymentAmount})${item.totalPaymentAmountAfterDisc}` , style: ['td','right'] },
            ]);
            
        });
        

        let totalRow: any = [
            { text: 'Total' },
            { text: '' },
            { text: this.transaction.totalVat },
            { text: this.transaction.totalDiscount },
            { text: this.transaction.totalSavingPoints },
            { text: `(${this.transaction.total})${this.transaction.totalAfterDisc}\nFrom Total ${nTotalOriginalAmount}`, style: ['right'] }
        ];
        
        if (!(this.transaction.totalDiscount > 0)) {
            totalRow.splice(3,1);
            tableHeaders.splice(3,1);
            transactionTableWidths.splice(3,1);
            texts.map((text:any)=>{
                text.splice(3,1);
            })
        }
        
        const tableHeadersList: any = [];
        tableHeaders.forEach((header: any) => {
            if (header === 'Amount') tableHeadersList.push({ text: header, style: ['th', 'right'] })
            else tableHeadersList.push({ text: header, style: ['th'] })
        });

        const finalData = [[...tableHeadersList], ...texts, [...totalRow]];
        const transactionData = {
            table: {
                widths: transactionTableWidths,
                body: finalData,
            },
            layout: this.onlyHorizontalLineLayout
        };
        this.content.push(transactionData);
    }

    processPayments(){
        this.content.push('\n\n');
        const tableHeaders = [
            'Methode',
            'Bedrag',
        ];
        const tableHeadersList:any = [];
        tableHeaders.forEach((singleHeader: any) => {
            tableHeadersList.push({ text: singleHeader, style: ['th'] })
        });
        const tableWidths = ['30%', '10%'];
        let texts:any = []
        this.transaction.aPayments.forEach((payment:any)=>{
            texts.push([
                { text: `${payment.sMethod} (${payment.dCreatedDate})`},
                { text: `${payment.nAmount}`, style: ['left'] }
            ]);
        });
        const finalData = [[...tableHeadersList], ...texts];
        const data = {
            table: {
                headerRows: 1,
                widths: tableWidths,
                body: finalData,
                dontBreakRows: true,
                keepWithHeaderRows: 1,
            },
            layout: 'lightHorizontalLines'
        };
        this.content.push(data);
    }

    getBase64FromUrl(url: any): Observable<any> {
        return this.apiService.getNew('cashregistry', `/api/v1/pdf/templates/getBase64/${this.iBusinessId}?url=${url}`);
    }

    getTranslations() {
        let translationsObj: any = {};
        let translationsKey: Array<string> = [
            'CREATED_BY',
            'ART_NUMBER',
            'QUANTITY',
            'DESCRIPTION',
            'DISCOUNT',
            'AMOUNT',
            'VAT',
            'SAVINGS_POINTS',
            'GIFTCARD',
            'TO_THE_VALUE_OF',
            'ISSUED_AT',
            'VALID_UNTIL',
            'CARDNUMBER'
        ];

        this.translateService.get(translationsKey).subscribe((result:any) => {
            Object.entries(result).forEach((translation: any) => {
                translationsObj[String("__" + translation[0])] = translation[1]
            })
        });

        return translationsObj;
    }

    private isDefined(obj: any): boolean {
        //return typeof obj !== 'undefined'
        if (Array.isArray(obj)) {
            return Boolean(obj.length > 0 && obj[0] !== "")
        } else {
            return Boolean(obj)
        }
    }

    cleanUp(){
        this.transaction = null;
        this.content = [];
        this.styles = {};
    }
}