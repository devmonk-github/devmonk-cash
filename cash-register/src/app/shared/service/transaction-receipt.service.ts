import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Observer } from "rxjs";
import { map, take } from "rxjs/operators";
import { ApiService } from "./api.service";
import { PdfService } from "./pdf2.service";

@Injectable()
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
            fontSize: 15,
            bold: false,
            margin: 5, //[0, 5, 0, 10]
        },
        businessName: {
            fontSize: 12,
            margin: 5, //[0, 5, 0, 10]
        },
        normal: {
            fontSize: 10,
            margin: 5, //[0, 5, 0, 5]
        },
        tableExample: {
            // border: 0,
            fontSize: 9,
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
            fontSize: 10,
            bold: true,
            // margin: [5, 10],
        },

        td: {
            fontSize: 10,
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
            return 1;
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
    dataURL !: string;

    constructor(
        private pdf: PdfService,
        private apiService: ApiService,
        private http: HttpClient) {
        this.iBusinessId = localStorage.getItem('currentBusiness') || '';
        this.iLocationId = localStorage.getItem('currentLocation') || '';
        this.iWorkstationId = localStorage.getItem('currentWorkstation') || '';
    }

    async exportToPdf({transaction}:any){
        this.transaction = transaction;
        console.log(this.transaction);
        
        await this.getBase64FromUrl("../../assets/images/no-photo.svg").toPromise();
        await this.processHeader().toPromise();

        this.processTransactions();
        this.processPayments();
        // this.content.push(
        //     {
        //         image: await this.getBase64FromUrl("https://lirp.cdn-website.com/2568326e/dms3rep/multi/opt/Juwelier-Bos-208w.png"),
        //     }
        // );


        
        console.log({content:this.content});

        this.pdf.getPdfData(
            this.styles,
            this.content,
            'portrait',
            'A4',
            'Receipt'
        );
    }

    processHeader(): Observable<any>{
        console.log('processHeader', this.content);
        const columns: any = [];
        return new Observable((observer: Observer<void>) => {
            let businessDetails = `
            ${this.transaction.businessDetails?.sName}\n
            ${this.transaction.businessDetails?.sEmail}\n
            ${this.transaction.businessDetails?.sMobile || ''}\n
            ${this.transaction.oBusiness?.oPhone?.sLandline || ''}\n
            ${this.transaction.businessDetails?.aLocation?.oAddress?.street || ''}\n
            `;
            
            columns.push(
                {
                    image: this.dataURL,
                    // image: await this.getBase64FromUrl("https://lirp.cdn-website.com/2568326e/dms3rep/multi/opt/Juwelier-Bos-208w.png").toPromise(),
                    fit: [100, 100],
                    // text:1,
                    // width: '*'
                },
                { text: businessDetails, width:'*' },
                { text: `${this.transaction.sReceiptNumber}`, width: '*' },
            );

            this.content.push({
                columns: columns
            });
            
            let receiptDetails = `Datum: ${this.transaction.dCreatedDate}\n
            Bonnummer: ${this.transaction.sReceiptNumber}\n
            Transaction number: ${this.transaction.sNumber}`;

            this.content.push({text: receiptDetails});
            observer.complete();
        })
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
        const tableHeadersList: any = [];
        tableHeaders.forEach((singleHeader:any)=>{
            tableHeadersList.push({text: singleHeader, style:['th']})
        });
        const transactionTableWidths = ['10%', '45%', '10%', '10%', '10%', '15%'];
        // const transactionHeaderData = {
        //     table: {
        //         widths: transactionTableWidths,
        //         body: [tableHeadersList],
        //     },
        //     layout: this.onlyHorizontalLineLayout
        // };
        // this.content.push(transactionHeaderData);
        let texts: any = [];
        this.transaction.aTransactionItems.forEach((item:any) =>{
            console.log({item});
            let description = `${item.description}\n 
                Original amount: ${item.nPriceIncVat} 
                Already paid:\n ${item.sTransactionNumber} | ${item.nPaymentAmount} (this receipt)\n`;
            
            item.related.forEach((related:any)=>{
                description += `${related.sTransactionNumber}|${related.nPaymentAmount}\n`;
            });


            texts.push([
                { text: item.nQuantity, style: ['td'] },
                { text: description , style: ['td'] },
                { text: `${item.nVatRate}(${item.vat})` , style: ['td'] },
                { text: item.nDiscountToShow , style: ['td'] },
                { text: item.nSavingsPoints , style: ['td'] },
                { text: `(${item.totalPaymentAmount})${item.totalPaymentAmountAfterDisc}` , style: ['td','right'] },
            ]);
            
        });
        const finalData = [[...tableHeadersList], ...texts];
        const transactionData = {
            table: {
                widths: transactionTableWidths,
                body: finalData,
            },
            layout: this.onlyHorizontalLineLayout
        };
        this.content.push(transactionData);

        this.content.push(
            {
                canvas: [{ type: 'line', x1: 0, y1: 0, x2: 575, y2: 0, lineWidth: 1 }],
                margin: [0, 0, 20, 0],
                style: 'afterLine',
            },
            
        );
        let totalRow: any = [
            { text: 'Total', style: ['td'] },
            { text: '', style: ['td'] },
            { text: this.transaction.totalVat, style: ['td'] },
            { text: this.transaction.totalDiscount, style: ['td'] },
            { text: this.transaction.totalSavingPoints, style: ['td'] },
            { text: `(${this.transaction.total})${this.transaction.totalAfterDisc}`, style: ['td','right'] },
        ];
        const data = {
            table: {
                widths: transactionTableWidths,
                body: [totalRow],
            },
            layout: this.onlyHorizontalLineLayout
        };
        this.content.push(data);

    }

    processPayments(){
        const tableHeaders = [
            'Methode',
            'Bedrag',
        ];
        const tableHeadersList:any = [];
        tableHeaders.forEach((singleHeader: any) => {
            tableHeadersList.push({ text: singleHeader, style: ['th'] })
        });
        const tableWidths = ['20%', '30%'];
        let texts:any = []
        this.transaction.aPayments.forEach((payment:any)=>{
            texts.push([
                { text: `${payment.sMethod}(${payment.dCreatedDate})`, style: ['td'] },
                { text: `${payment.nAmount}`, style: ['td','left'] }
            ]);
        });
        const finalData = [[...tableHeadersList], ...texts];
        const data = {
            table: {
                widths: tableWidths,
                body: finalData,
            },
            layout: 'noBorders'
        };
        this.content.push(data);
    }

    getBase64FromUrl(url: any): Observable<any> {
        // const imgUrl = 'https://images.pexels.com/photos/736230/pexels-photo-736230.jpeg?cs=srgb&dl=pexels-jonas-kakaroto-736230.jpg&fm=jpg'
        // this.http
        //     .get(url, { responseType: 'blob' })
        //     .subscribe((res: any) => {
        //         console.log(res);
        //     });

        // let header = new HttpHeaders();
        // header.set('Access-Control-Allow-Origin', '*');
        // return this.http.get(url, { responseType: 'arraybuffer', observe: 'response', headers: header }).subscribe((data:any)=>{
        //     console.log(data);
        // },(err)=>{
        //     console.log(err);
        // })

        return new Observable((observer: Observer<void>) => {
            var img = new Image();
            img.crossOrigin = "Anonymous";

            img.onload = () => {
                var canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;

                var ctx = canvas.getContext("2d");
                if(ctx)ctx.drawImage(img, 0, 0);

                this.dataURL = canvas.toDataURL("image/png");

                observer.complete();
            };

            img.onerror = error => {
                observer.error(error);
            };

            img.src = url;
        });
    }
}