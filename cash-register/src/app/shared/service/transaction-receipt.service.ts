import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";
import { PdfService } from "./pdf2.service";

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

    constructor(
        private pdf: PdfService,
        private apiService: ApiService) {
        this.iBusinessId = localStorage.getItem('currentBusiness') || '';
        this.iLocationId = localStorage.getItem('currentLocation') || '';
        this.iWorkstationId = localStorage.getItem('currentWorkstation') || '';
    }

    async exportToPdf({transaction}:any){
        this.transaction = transaction;
        console.log(this.transaction);
        const result = await this.getBase64FromUrl(this.transaction.businessDetails.sLogoLight).toPromise();
        this.logoUri = result.data;
        
        this.processHeader();
        this.processTransactions();
        this.processPayments();
        
        this.content.push("\nRuilen binnen 8 dagen op vertoon van deze bon.\nDank voor uw bezoek.")

        // console.log(this.content);

        this.pdf.getPdfData(
            this.styles,
            this.content,
            this.orientation,
            this.pageSize,
            'Receipt'
        );
        this.cleanUp();
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

    cleanUp(){
        this.transaction = null;
        this.content = [];
        this.styles = {};
    }
}