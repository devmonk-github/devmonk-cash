import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as _moment from 'moment';
import { PdfService } from 'src/app/shared/service/pdf2.service';
import { ApiService } from './api.service';
import { TillService } from './till.service';
import { CommonPrintSettingsService } from './common-print-settings.service';
const moment = (_moment as any).default ? (_moment as any).default : _moment;

@Injectable()
export class TransactionAuditUiPdfService {
    
    aRefundItems: any;
    aDiscountItems: any;
    aRepairItems: any;
    aGoldPurchases: any;
    aGiftItems: any;
    iBusinessId: any = localStorage.getItem('currentBusiness');
    iLocationId: any = localStorage.getItem('currentLocation');
    iWorkstationId: any = localStorage.getItem('currentWorkstation');
    content: any = [];
    currency: string = "€";
    aFieldsToInclude = ['oShopPurchase', 'oWebShop'];
    styles:any = {
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
            margin: [0, 5],
            alignment:'center'
        },

        td: {
            fontSize: 9,
            // margin: [0, 5],
        },
        articleGroup: {
            fillColor: '#F5F8FA',
        },
        bgGray:{
            fillColor: '#F5F8FA',
        },
        doubleHeaderLines: {
            hLineWidth: (i:any) => {
                return (i === 0 || i === 1) ? 1 : 0;
            },
            vLineWidth: () => {
                return 0
            },
            // defaultBorder: false,
        },
        'border-bottom':{
            border: [false, false, false, true]
        },
        'border-top-bottom':{
            border: [false, true, false, true]
        },

    };
    
    translations: any;
    sDisplayMethod: any;
    pageMargins: any = [10, 10,10,10];
    pageSize: any = 'A4';

    constructor(
        private pdf: PdfService,
        private apiService: ApiService,
        private translateService: TranslateService,
        private tillService: TillService,
        private commonPrintSettingsService: CommonPrintSettingsService
        ) {

        const aKeywords: any = [
            'CASH_LEFTOVER', 
            'CASH_MUTATION', 
            'CASH_IN_TILL', 
            'CASH_COUNTED',
            'TREASURY_DIFFERENCE',
            'SKIM',
            'AMOUNT_TO_LEFT_IN_CASH' ,
            'AMOUNT',
            'DYANAMIC_DATA',
            'STATIC_DATA',
            'TRANSACTION_AUDIT_REPORT',
            'LOCATION(S)',
            'DISPLAY_METHOD',
            'WORKSTATION(S)',
            'TYPE_OF_DATA',
            'COMMENT',
            'TYPE' ,
            'PAYMENT_METHODS',
            'METHOD',
            'TOTAL_AMOUNT',
            'QUANTITY',
            'TOTAL' ,
            'REFUND' ,
            'PRICE' ,
            'TAX',
            'DESCRIPTION' ,
            'DISCOUNT(S)',
            'DISCOUNT',
            'PRODUCT_NAME' ,
            'REPAIR(S)',
            'NO_RECORDS_FOUND',
            'EMPLOYEE',
            'GIFTCARD(S)',
            'PAYMENT_TYPE',
            'DATE',
            'VAT_RATE',
            'NUMBER',
            'PAYMENT_TRANSACTION_NUMBER' ,
            'GOLD_PURCHASE(S)',
            'GIFT_CARD_NUMBER',
            'VAT_TYPE',
            'PRICE_WITH_VAT',
            'PURCHASE_PRICE_EX_VAT',
            'TOTAL_OF_VAT_RATE',
            'TOTAL_OF_ALL_VAT_RATE',
            'GROSS_PROFIT',
            'VAT_AMOUNT',
            'FROM',
            'TO' ,
            'PURCHASE_PRICE',
            'PARTICULARS',
            'PRICE_INCL_VAT',
            'SUPPLIER' ,
            'ARTICLE',
            'CATEGORY'
        ]
        this.translateService.get(aKeywords).subscribe(
            (result: any) => {aKeywords
                this.translations = result
            }
        )

    }

    selectCurrency(oLocation: any) {
        if (oLocation?.eCurrency) {
            switch (oLocation?.eCurrency) {
                case 'euro':
                    this.currency = "€";
                    break;
                case 'pound':
                    this.currency = "£";
                    break;
                case 'swiss':
                    this.currency = "₣";
                    break;
                default:
                    this.currency = "€";
                    break;
            }
        }
    }

    async exportToPDF({
        aSelectedLocation,
        sOptionMenu,
        bIsDynamicState,
        aLocation,
        aSelectedWorkStation,
        aWorkStation,
        oFilterDates,
        oBusinessDetails,
        sDisplayMethod,
        sDisplayMethodString,
        aStatistic,
        oStatisticsDocument,
        aStatisticsDocuments,
        aPaymentMethods,
        bIsArticleGroupLevel,
        bIsSupplierMode
    }: any) {
        console.log('PDF service: exportToPDF: ', {
            aSelectedLocation,
            sOptionMenu,
            bIsDynamicState,
            aLocation,
            aSelectedWorkStation,
            aWorkStation,
            oFilterDates,
            oBusinessDetails,
            sDisplayMethod,
            sDisplayMethodString,
            aStatistic,
            oStatisticsDocument,
            aStatisticsDocuments,
            aPaymentMethods,
            bIsArticleGroupLevel,
            bIsSupplierMode });

        const date = moment(Date.now()).format('DD-MM-yyyy');
        const columnWidths = ['*', 60, 80, 80, 100];
        const tableLayout = {
            hLineWidth: function (i: number, node: any) {
                return i === 0 || i === node.table.body.length ? 0.5 : 0.5;
            },
            vLineWidth: function (i: number, node: any) {
                return i === 0 || i === node.table.widths.length ? 0 : 0.5;
            },
            hLineColor: function (i: number, node: any) {
                return i === 0 || i === node.table.body.length ? '#999' : '#999';
            },
        };
        let sType = sOptionMenu.parent.sValue
        let dataType = bIsDynamicState ? this.translations['DYANAMIC_DATA']: this.translations['STATIC_DATA'];

        // get selected locaions
        let sLocations = '';
        let aLocations: any = [];
        if (aSelectedLocation?.length) {
            aSelectedLocation.forEach((el: any) => {
                aLocations.push(
                    aLocation
                        .filter((location: any) => location._id == el)
                        .map((location: any) => location.sName)
                );
            });
            sLocations = aLocations.join(', ');
        } else {
            sLocations = aLocation
                .map((location: any) => location.sName)
                .join(', ');
        }

        //get selected workstations
        let sWorkstation = '';
        if(this.tillService.settings.sDayClosureMethod === 'workstation') {
            if (aSelectedWorkStation?.length) {
                // aWorkStation = [];
                sWorkstation = aWorkStation
                    .filter((workstation: any) => aSelectedWorkStation.includes(workstation._id))
                    .map((workstation: any) => workstation.sName)
                    .join(', ');
                if (!sWorkstation) {
                    const temp = aWorkStation.filter((workstation: any) => workstation._id === aSelectedWorkStation);
                    if (temp?.length) {
                        sWorkstation = temp[0].sName;
                    } else {
                        sWorkstation = aSelectedWorkStation;
                    }
                }
            } else {
                sWorkstation = aWorkStation.map((workstation: any) => workstation.sName).join(', ');
            }
        } else {
            sWorkstation = aWorkStation.map((workstation: any) => workstation.sName).join(', ');
        }
        
        

        let dataFromTo =
            '( ' + this.translations['FROM'] + ': ' + moment(oFilterDates.startDate).format('DD-MM-yyyy hh:mm A') + " "+  this.translations['TO']  + " " +
            moment(oFilterDates.endDate).format('DD-MM-yyyy hh:mm A') + ')';

        this.content = [
            { text: date, style: ['right', 'normal'] },
            { text: this.translations['TRANSACTION_AUDIT_REPORT'], style: ['header', 'center'] },
            { text: dataFromTo, style: ['center', 'normal'] },
            { text: oBusinessDetails.sName, style: 'businessName' },
            {
                columns: [
                    { text: this.translations['LOCATION(S)'] + ': ', style: ['left', 'normal'], width: 100 },
                    { text: sLocations, style: ['left', 'normal'], width: 150 },
                    { width: '*', text: '' },
                    { text: this.translations['DISPLAY_METHOD'] + ': ', style: ['right', 'normal'], width: 100 },
                    { text: sDisplayMethodString, style: ['right', 'normal'], width: 150 },
                ],
            },
            {
                columns: [
                    { text: this.translations['WORKSTATION(S)'] + ': ', style: ['left', 'normal'], width: 100 },
                    { text: sWorkstation, style: ['left', 'normal'], width: 200 },
                    { width: '*', text: '' },
                    { text: this.translations['TYPE_OF_DATA']+': ', style: ['right', 'normal'], width: 100 },
                    { text: dataType, style: ['right', 'normal'], width: 150 },
                ],
            },
            {
                columns: [
                    { text: this.translations['COMMENT']+ ': ', style: ['left', 'normal'], width: 100 },
                    { text: oStatisticsDocument?.sComment, style: ['left', 'normal'], width: 200 },
                    { width: '*', text: '' },
                    { text: this.translations['TYPE']+ ': ', style: ['right', 'normal'], width: 100 },
                    { text: sType, style: ['right', 'normal'], width: 150 },
                ],
            },
            
        ];

        // const [_aTransactionItems]: any = await Promise.all([ //, _aActivityItems, _aGoldPurchases
        //     this.fetchTransactionItems(oFilterDates,bIsArticleGroupLevel,bIsSupplierMode),
        //     // this.fetchActivityItems(oFilterDates),
        //     // this.fetchGoldPurchaseItems(oFilterDates)
        // ]);

        // const aTransactionItems = (_aTransactionItems?.data?.length && _aTransactionItems?.data[0]?.result?.length) ? _aTransactionItems?.data[0]?.result : [];

        // if (aTransactionItems?.length) {
        //     this.aRefundItems = aTransactionItems.filter((item: any) => item.oType.bRefund);
        //     this.aDiscountItems = aTransactionItems.filter((item: any) => item.oType.bDiscount);
        // }

        // if (_aActivityItems?.data?.length) {
        //     this.aRepairItems = _aActivityItems?.data.filter((item: any) => item.oType.eKind == 'repair');
        //     this.aGiftItems = _aActivityItems?.data.filter((item: any) => item.oType.eKind == 'giftcard');
        // }

        // this.aGoldPurchases = _aGoldPurchases?.data[0]?.result.filter((item: any) => item.oType.eKind == 'gold-purchase');

        if (sDisplayMethod != "aVatRates") {
            this.processCashCountings(tableLayout, oStatisticsDocument, aStatistic);
            this.processVatRates(columnWidths, tableLayout, oStatisticsDocument?.aVatRates);
        }
        this.sDisplayMethod = sDisplayMethod;
        
        // console.log('sDisplayMethod: ', sDisplayMethod);
        switch (sDisplayMethod.toString()) {
            case 'revenuePerBusinessPartner':
                this.processPdfByRevenuePerBusinessPartner(columnWidths,tableLayout,aStatistic);
                break;
            case 'revenuePerSupplierAndArticleGroup':
                this.processPdfByRevenuePerSupplierAndArticleGroup(columnWidths,tableLayout,aStatistic);
                break;
            case 'revenuePerArticleGroupAndProperty':
                this.processPdfByRevenuePerArticleGroupAndProperty(columnWidths,tableLayout,aStatistic);
                break;
            case 'revenuePerProperty':
                this.processPdfByRevenuePerProperty(columnWidths, tableLayout, aStatistic);
                break;
            case 'revenuePerArticleGroup':
                this.processPdfByRevenuePerArticleGroup(columnWidths,tableLayout,aStatistic);
                break;
            case 'aVatRates':
                aStatistic.forEach((oStatistic:any)=> {
                    this.processVatRates(columnWidths, tableLayout, oStatistic?.aVatRates);
                });
                break;
            case 'aRevenuePerTurnoverGroup':
                this.processRevenuePerTurnoverGroup(columnWidths, tableLayout, aStatistic);
                break;
        }

        this.content.push({text: this.translations['PAYMENT_METHODS'] ,style: ['left', 'normal'],margin: [0, 30, 0, 10],});

        const tableHeaders = [this.translations['METHOD'], this.translations['TOTAL_AMOUNT'], this.translations['QUANTITY']];

        const tableHeadersList: Array<any> = [];
        tableHeaders.forEach((header: any) => {
            tableHeadersList.push({
                text: header,
                style: ['th', 'articleGroup'],
            });
        });

        if (aPaymentMethods?.length) {
            let texts: any = [];
            let nTotalAmount = 0, nTotalQuantity = 0;
            aPaymentMethods.forEach((paymentMethod: any) => {
                nTotalAmount += parseFloat(paymentMethod.nAmount);
                nTotalQuantity += parseFloat(paymentMethod.nQuantity);

                texts.push([
                    { text: paymentMethod.sMethod, style: ['td'] },
                    { text: paymentMethod.nAmount, style: ['td'] },
                    { text: paymentMethod.nQuantity, style: ['td'] },
                ]);
                
            });
            texts.push([
                {text: this.translations['TOTAL'], style:['td', 'bold','bgGray']},
                {text: nTotalAmount, style:['td', 'bold','bgGray']},
                {text: nTotalQuantity, style:['td', 'bold','bgGray']},
            ])
            const finalData = [[...tableHeadersList], ...texts];
            this.content.push({
                table: {
                    widths: '*',
                    body: finalData,
                    dontBreakRows: true,
                },
            });

        } else {
            this.content.push({
                table: {
                    widths: '*',
                    body: [
                        [...tableHeadersList],
                        [
                            { text: this.translations['NO_RECORDS_FOUND'], colSpan: 3, alignment: 'center', style: ['td'] },
                            {},
                            {},
                        ],
                    ],
                    dontBreakRows: true,
                }
            });
        }

        // this.addRefundToPdf();
        // this.addDiscountToPdf();
        // this.addRepairsToPdf();
        // this.addGiftcardsToPdf();
        // this.addGoldPurchasesToPdf();

        this.pdf.getPdfData({
            styles: this.styles,
            content: this.content,
            orientation: 'portrait',
            pageSize: this.pageSize,
            pdfTitle: oBusinessDetails.sName + '-' + this.translateService.instant('TRANSACTION_AUDIT_REPORT'),
            defaultStyle:{
                fontSize: 5
            },
            pageMargins: this.pageMargins
        });
    }

    aAmount: any = [
        { sLabel: '500.00', nValue: 500, nQuantity: 0, key: 'nType500' },
        { sLabel: '200.00', nValue: 200, nQuantity: 0, key: 'nType200' },
        { sLabel: '100.00', nValue: 100, nQuantity: 0, key: 'nType100' },
        { sLabel: '50.00', nValue: 50, nQuantity: 0, key: 'nType50' },
        { sLabel: '20.00', nValue: 20, nQuantity: 0, key: 'nType20' },
        { sLabel: '10.00', nValue: 10, nQuantity: 0, key: 'nType10' },
        { sLabel: '5.00', nValue: 5, nQuantity: 0, key: 'nType5' },
        { sLabel: '2.00', nValue: 2, nQuantity: 0, key: 'nType2' },
        { sLabel: '1.00', nValue: 1, nQuantity: 0, key: 'nType1' },
        { sLabel: '0.50', nValue: 0.5, nQuantity: 0, key: 'nType0_5' },
        { sLabel: '0.20', nValue: 0.2, nQuantity: 0, key: 'nType0_2' },
        { sLabel: '0.10', nValue: 0.1, nQuantity: 0, key: 'nType0_1' },
        { sLabel: '0.05', nValue: 0.05, nQuantity: 0, key: 'nType0_05' },
      ];

    processCashCountings(tableLayout: any, oStatisticsDocument:any, aStatistic:any){
        const oCountings = oStatisticsDocument?.oCountings;

        const tableHeadersList: any = [
            { text: this.translations['PARTICULARS'], style: ['th', 'articleGroup'] },
            { text: this.translations['AMOUNT'], style: ['th', 'articleGroup'], }
        ];

        let texts: any = [
            [
                { text: this.translations['CASH_LEFTOVER'], style: ['td'] },
                { text: this.convertToMoney(oCountings?.nCashAtStart), style: ['td'] },
            ],
            [
                { text: this.translations['CASH_MUTATION'], style: ['td'] },
                { text: this.convertToMoney(0), style: ['td'] },
            ],
            [
                { text: this.translations['CASH_IN_TILL'], style: ['td'] },
                { text: this.convertToMoney(oCountings?.nCashInTill || 0), style: ['td'] },
            ],
            [
                { text: this.translations['CASH_COUNTED'], style: ['td'] },
                { text: this.convertToMoney(oCountings?.nCashCounted), style: ['td'] },
            ],
            [
                { text: this.translations['TREASURY_DIFFERENCE'], style: ['td'] },
                { text: this.convertToMoney(oCountings?.nCashDifference || 0) , style: ['td'] }
            ],
            [
                { text: this.translations['SKIM'], style: ['td'] },
                { text: this.convertToMoney(oCountings?.nSkim), style: ['td'] },
            ],
            [
                { text: this.translations['AMOUNT_TO_LEFT_IN_CASH'], style: ['td'] },
                { text: this.convertToMoney(oCountings?.nCashRemain), style: ['td'] }
            ],
        ];

        // this.pushSeparatorLine();

        this.content.push(
            {
                table: {
                    widths: '*',
                    body: [[...tableHeadersList], ...texts],
                    dontBreakRows: true,
                },
                margin:[0,20],
                layout: tableLayout,
            }
        );

    }

    
    processRevenuePerTurnoverGroup(columnWidths: any, tableLayout: any, aStatistic: any) {
        // console.log("processRevenuePerTurnoverGroup", { columnWidths, tableLayout, aStatistic })
        this.content.push({
            text: this.translateService.instant('REVENUE_PER_TURNOVER_GROUP'),
            style: ['left', 'normal'],
            margin: [0, 30, 0, 10],
        });
        const aHeaders = [
            { key: 'RECEIPT_NO', weight: 1 },
            { key: 'ARTICLE_NUMBER', weight: 1 },
            { key: 'QUANTITY', weight: 1 },
            { key: 'DESCRIPTION', weight: 2, colSpan: 2 },
            { key: 'PRODUCT_NUMBER', weight: 1 },
            { key: 'PRICE', weight: 1 },
            { key: 'DISCOUNT', weight: 1 },
            { key: 'REVENUE', weight: 1 },
            { key: 'VAT', weight: 1 },
            { key: 'EMPLOYEE', weight: 1 },
            { key: 'DATE', weight: 1 },
        ]; 

        /*
            1. Receipt number from the transaction
            2. sArticleNumber from the transactionitem
            3. transItem.quantity
            4. transItem.description
            5. transItem.sProductNumber
            6. transItem.Price
            7. transitem.nDiscount
            8. transitem.nRevenueAmount * qt
            9. transitem.nRevenueAmount - ( transitem.nRevenueAmount / (1+ transItem.nVatRate / 100) )
            10. Firstname employee
            11. hh:mm (transaction.dCreationDate)
        */
        this.commonPrintSettingsService.oCommonParameters['pageMargins'] = this.pageMargins;
        this.commonPrintSettingsService.oCommonParameters['pageSize'] = this.pageSize;
        this.commonPrintSettingsService.pageWidth = this.commonPrintSettingsService.pageSizes[this.pageSize].pageWidth
        // const nWidth = (100 - nMarginWidth) / headerList.length;
        const aWidths = [...aHeaders.map((el:any) => this.commonPrintSettingsService.calcColumnWidth(el.weight))];
        // console.log({nWidth, aWidths});

        const headerList: any = [];
        aHeaders.forEach(el => {
            const obj:any =  { 
                text: this.translateService.instant(el.key), 
                style: ['td'], 
                border: [false, true, false, true] 
            };
            if(el?.colSpan) obj.colSpan = el.colSpan;
            headerList.push(obj) 
        })
        const aTexts = [headerList];
        // const data = {
        //     table: {
        //         headerRows: 1,
        //         widths: aWidths,
        //         body: [aTexts],
        //         dontBreakRows: true,
        //         keepWithHeaderRows: true
        //     },
        //     layout: this.styles.doubleHeaderLines,
        // };
        console.log(590, {aTexts})
        // this.content.push(data);
        const aDummy = [...headerList];
        aTexts.push([...aDummy.fill(' ')]);
        aStatistic.forEach((oStatistic: any) => {
            console.log({oStatistic})
            oStatistic.individual.forEach((oSupplier: any) => {
                // console.log({ oSupplier })
                // const aArticleGroupTexts: any = [];
                oSupplier.aArticleGroups.forEach((oArticleGroup: any) => {
                    // console.log({ oArticleGroup })
                    aTexts.push([
                        { text: '', style: ['td', 'bold'] },
                        { text: this.translateService.instant('CASH_GROUP') + ': group number', style: ['td', 'bold'], colSpan: 2, border: [false, false, false, true] },
                        { text: '', style: ['td', 'bold'], border: [false, false, false, true] },
                        { text: oArticleGroup.sName, style: ['td'], border: [false, false, false, true] },
                        { text: this.translateService.instant('TRANSACTIONS'), style: ['td', 'bold'], border: [false, false, false, true] }, //colSpan: 2,
                        { text: '', style: ['td', 'bold'] },
                        { text: '', style: ['td', 'bold'] },
                        { text: '', style: ['td', 'bold'] },
                        { text: '', style: ['td', 'bold'] },
                        { text: '', style: ['td', 'bold'] },
                        { text: '', style: ['td', 'bold'] }
                    ]);
                    
                    oArticleGroup.aRevenueByProperty.forEach((oRevenueByProperty: any) => {
                        // console.log({ oRevenueByProperty })
                        aTexts.push([
                            { text: 'receipt number', style: ['td', 'property'] },
                            { text: 'article number', style: ['td', 'property'] },
                            { text: oRevenueByProperty.nQuantity, style: ['td', 'property'] },
                            { text: 'description' + oRevenueByProperty.aCategory.join(' |'), style: ['td', 'property'] },
                            { text: 'product number', style: ['td', 'property'] },
                            { text: oRevenueByProperty.nTotalPurchaseAmount.toFixed(2), style: ['td', 'property'] },
                            { text: 'discount', style: ['td', 'property'] },
                            { text: 'revenue * qt', style: ['td', 'property'] },
                            { text: 'revenue - vat', style: ['td', 'property'] },
                            { text: 'emp', style: ['td', 'property'] },
                            { text: 'dt', style: ['td', 'property'] },
                        ]);
                    });
                    aTexts.push([
                        { text: '', style: ['td', 'bold'] },
                        { text: this.translateService.instant('SUBTOTAL'), style: ['td'], colSpan: 2, border: [false, true, false, false] },
                        { text: '', style: ['td'], border: [false, true, false, false] },
                        { text: '', style: ['td'], border: [false, true, false, false] },
                        { text: oArticleGroup.nQuantity, style: ['td', 'bold'], border: [false, true, false, false] },
                        { text: '', style: ['td', 'bold'] },
                        { text: 'subtotal discount', style: ['td', 'bold'], border: [false, true, false, false] },
                        { text: 'subtotal qty * price', style: ['td', 'bold'], border: [false, true, false, false] },
                        { text: 'vat', style: ['td', 'bold'], border: [false, true, false, false] },
                        { text: '', style: ['td', 'bold'] },
                        { text: '', style: ['td', 'bold'] }
                    ])
                });
            });
        });
        const data = {
            table: {
                headerRows: 1,
                widths: aWidths,
                body: aTexts,
                dontBreakRows: true,
                keepWithHeaderRows: true
            },
            layout: {
                defaultBorder: false
            },
        };
        console.log(data, aTexts)
        this.content.push(data);
    }

    processVatRates(columnWidths: any, tableLayout: any, aVatRates: any){
            const tableHeaders = [
                this.translations['VAT_TYPE'],
                this.translations['PRICE_WITH_VAT'],
                this.translations['PURCHASE_PRICE_EX_VAT'],
                this.translations['GROSS_PROFIT'],
                this.translations['VAT_AMOUNT'],
            ]
        const tableHeadersList: any =[];
            tableHeaders.forEach((header: any) => {
                tableHeadersList.push({
                    text: header,
                    style: ['th', 'articleGroup'],
                });
            });
            let texts: any = [];

            if(aVatRates?.length) {
                let nOverallTotalRevenue = 0, nOverallTotalPurchaseValue = 0, nOverallTotalProfit = 0, nOverallTotalVatAmount = 0;
                aVatRates.forEach((oItem: any) => {
                    let nTotalRevenue = 0, nTotalPurchaseValue = 0, nTotalProfit = 0, nTotalVatAmount = 0;
                    texts.push([{ text: this.translations['VAT_RATE'] + ((oItem?.nVat) ? oItem?.nVat : ''), colSpan: 5, style: ['articleGroup', 'center', 'td'] }, {}, {}, {}, {}]);
                    this.aFieldsToInclude.forEach((field: any) => {
                        nTotalRevenue += oItem[field].nTotalRevenue;
                        nTotalPurchaseValue += oItem[field].nPurchaseValue;
                        nTotalProfit += oItem[field].nProfit;
                        nTotalVatAmount += oItem[field].nVatAmount;
                        texts.push([
                            { text: field, style: ['td'] },
                            { text: parseFloat(oItem[field].nTotalRevenue.toFixed(2)), style: ['td'] },
                            { text: parseFloat(oItem[field].nPurchaseValue.toFixed(2)), style: ['td'] },
                            { text: parseFloat(oItem[field].nProfit.toFixed(2)), style: ['td'] },
                            { text: parseFloat(oItem[field].nVatAmount.toFixed(2)), style: ['td'] },
                        ])
                    });
                    nOverallTotalRevenue += nTotalRevenue;
                    nOverallTotalPurchaseValue += nTotalPurchaseValue;
                    nOverallTotalProfit += nTotalProfit;
                    nOverallTotalVatAmount += nTotalVatAmount;

                    texts.push([
                        { text: this.translations['TOTAL_OF_VAT_RATE'] + ' ' + oItem?.nVat + '%', style: ['td', 'bold'] },
                        { text: parseFloat(nTotalRevenue.toFixed(2)), style: ['td', 'bold'] },
                        { text: parseFloat(nTotalPurchaseValue.toFixed(2)), style: ['td', 'bold'] },
                        { text: parseFloat(nTotalProfit.toFixed(2)), style: ['td', 'bold'] },
                        { text: parseFloat(nTotalVatAmount.toFixed(2)), style: ['td', 'bold'] },
                    ])
                });

                texts.push([
                    { text: this.translations['TOTAL_OF_ALL_VAT_RATE'], style: ['td', 'bold', 'bgGray'] },
                    { text: parseFloat(nOverallTotalRevenue.toFixed(2)), style: ['td', 'bold', 'bgGray'] },
                    { text: parseFloat(nOverallTotalPurchaseValue.toFixed(2)), style: ['td', 'bold', 'bgGray'] },
                    { text: parseFloat(nOverallTotalProfit.toFixed(2)), style: ['td', 'bold', 'bgGray'] },
                    { text: parseFloat(nOverallTotalVatAmount.toFixed(2)), style: ['td', 'bold', 'bgGray'] },
                ])


                const finalData = [[...tableHeadersList], ...texts];
                this.content.push({
                    table: {
                        widths: columnWidths,
                        body: finalData,
                        dontBreakRows: true,
                    },
                    margin: [0, 0, 0, 20],
                    layout: tableLayout,
                });
            } else {
                this.content.push({
                    table: {
                        widths: columnWidths,
                        body: [
                            [...tableHeadersList],
                            [{ text: this.translations['NO_RECORDS_FOUND'], colSpan: 5, alignment: 'center', style: ['td'] }, {}, {}, {}, {}]
                        ],
                        dontBreakRows: true,
                    },
                    margin: [0, 0, 0, 20],
                    layout: tableLayout,
                });
            }
            // this.pushSeparatorLine();
        }

    pushSeparatorLine() {
            this.content.push({
                canvas: [{ type: 'line', x1: 0, y1: 0, x2: 575, y2: 0, lineWidth: 1 }],
                margin: [0, 0, 20, 0],
                style: ['afterLine'],
            });
    }

    addRefundToPdf() {
            this.content.push({
                text: this.translations['REFUND'],
                style: ['left', 'normal'],
                margin: [0, 30, 0, 10],
            });

            const refundHeaders = [this.translations['DESCRIPTION'], this.translations['PRICE'], this.translations['TAX'], this.translations['TOTAL']];

            const tableHeadersList: any =[];
            refundHeaders.forEach((header: any) => {
                tableHeadersList.push({ text: header, style: ['th', 'articleGroup'] });
            });

            if(this.aRefundItems?.length) {
            let texts: any = [];
            this.aRefundItems.forEach((item: any) => {
                let itemDescription = item.nQuantity;
                if (item.sComment) {
                    itemDescription += 'x' + item.sComment;
                }
                texts.push([
                    { text: itemDescription, style: 'td' },
                    { text: item.nPriceIncVat, style: 'td' },
                    { text: item.nVatRate, style: 'td' },
                    { text: item.nTotal, style: 'td' },
                ]);

            });
            this.content.push({
                table: {
                    widths: '*',
                    body: [[...tableHeadersList], ...texts],
                    dontBreakRows: true,
                }
            });
        } else {
            this.content.push({
                table: {
                    widths: '*',
                    body: [[...tableHeadersList],
                    [
                        { text: this.translations['NO_RECORDS_FOUND'], colSpan: 4, alignment: 'center', style: ['td'] },
                        {},
                        {},
                        {},
                    ],
                    ],
                }
            });
        }
    }

    addDiscountToPdf() {
        this.content.push({
            text: this.translations['DISCOUNT(S)'],
            style: ['left', 'normal'],
            margin: [0, 30, 0, 10],
        });

        const aHeaders = [this.translations['PRODUCT_NAME'], this.translations['QUANTITY'], this.translations['DISCOUNT'], this.translations['PRICE'], this.translations['TAX']];

        const tableHeadersList: any = [];
        aHeaders.forEach((header: any) => {
            tableHeadersList.push({text: header,style: ['th', 'articleGroup', 'bold'],});
        });

        if (this.aDiscountItems?.length) {
            let texts: any = [];
            this.aDiscountItems.forEach((item: any) => {
                texts.push([
                    { text: item.sProductName, style: 'td' },
                    { text: item.nQuantity, style: 'td' },
                    { text: item.nDiscount, style: 'td' },
                    { text: item.nPriceIncVat, style: 'td' },
                    { text: item.nVatRate, style: 'td' },
                ]);    
            });
            this.content.push({
                table: {
                    widths: '*',
                    body: [[...tableHeadersList], ...texts],
                    dontBreakRows: true,
                }
            });
        } else {
            this.content.push({
                table: {
                    widths: '*',
                    body: [[...tableHeadersList],
                    [
                        { text: this.translations['NO_RECORDS_FOUND'], colSpan: 5, alignment: 'center', style: ['td'] },
                        {},
                        {},
                        {},
                        {},
                    ],
                    ],
                }
            });
        }
    }

    addRepairsToPdf() {
        this.content.push({
            text: this.translations['REPAIR(S)'],
            style: ['left', 'normal'],
            margin: [0, 30, 0, 10],
        });

        const aHeaders = [
            this.translations['PRODUCT_NAME'],
            this.translations['COMMENT'],
            this.translations['QUANTITY'],
            this.translations['EMPLOYEE'],
            this.translations['TOTAL'],
        ];

        const tableHeadersList: any = [];
        aHeaders.forEach((header: any) => {
            tableHeadersList.push({ text: header, style: ['th', 'articleGroup'] });
        });

        if (this.aRepairItems?.length) {
            let texts: any = [];
            this.aRepairItems.forEach((item: any) => {
                texts.push([
                    { text: item.sProductName, style: 'td' },
                    { text: item.sCommentVisibleCustomer, style: 'td' },
                    { text: item.nQuantity, style: 'td' },
                    { text: item.sEmployeeName, style: 'td' },
                    { text: item.nTotalAmount, style: 'td' },
                ]);
            });
            this.content.push({
                table: {
                    widths: '*',
                    body: [[...tableHeadersList], ...texts],
                    dontBreakRows: true,
                }
            });
        } else {
            this.content.push({
                table: {
                    widths: '*',
                    body: [[...tableHeadersList],
                    [
                        { text: this.translations['NO_RECORDS_FOUND'], colSpan: 5, alignment: 'center', style: ['td'] },
                        {},
                        {},
                        {},
                        {},
                    ],
                    ],
                }
            });
        }
    }

    addGiftcardsToPdf() {
        this.content.push({
            text: this.translations['GIFTCARD(S)'],
            style: ['left', 'normal'],
            margin: [0, 30, 0, 10],
        });
        const aHeaders = [
            this.translations['GIFT_CARD_NUMBER'],
             this.translations['COMMENT'],
             this.translations['QUANTITY'],
             this.translations['EMPLOYEE'],
             this.translations['TOTAL'],
        ];

        const tableHeadersList: any = [];
        aHeaders.forEach((header: any) => {
            tableHeadersList.push({ text: header, style: ['th', 'articleGroup'] });
        });

        if (this.aGiftItems?.length) {
            let texts: any = [];
            this.aGiftItems.forEach((item: any) => {
                texts.push([
                    { text: item.sGiftCardNumber, style: 'td' },
                    { text: item.sCommentVisibleCustomer, style: 'td' },
                    { text: item.nQuantity, style: 'td' },
                    { text: item.sEmployeeName, style: 'td' },
                    { text: item.nTotalAmount, style: 'td' },
                ]);
            });
            this.content.push({
                table: {
                    widths: '*',
                    body: [[...tableHeadersList], ...texts],
                    dontBreakRows: true,
                }
            });
        } else {
            this.content.push({
                table: {
                    widths: '*',
                    body: [[...tableHeadersList],
                    [
                        { text: this.translations['NO_RECORD_FOUND'], colSpan: 5, alignment: 'center', style: ['td'] },
                        {},
                        {},
                        {},
                        {},
                    ],
                    ],
                }
            });
        }
    }

    addGoldPurchasesToPdf() {
        this.content.push({
            text: this.translations['GOLD_PURCHASE(S)'],
            style: ['left', 'normal'],
            margin: [0, 30, 0, 10],
        });
        const widths = [100, 70, 50, 50, 50, '*', 80];
        const aHeaders = [
            this.translations['NUMBER'],
            this.translations['DATE'],
            this.translations['QUANTITY'],
            this.translations['PRICE'],
            this.translations['TOTAL'],
            this.translations['PAYMENT_TRANSACTION_NUMBER'],
            this.translations['PAYMENT_TYPE'],
        ];

        const tableHeadersList: any = [];
        aHeaders.forEach((header: any) => {
            tableHeadersList.push({ text: header, style: ['th', 'articleGroup'] });
        });

        const oHeaderData = {
            table: {
                widths: widths,
                body: [tableHeadersList],
            },
        };
        this.content.push(oHeaderData);
        if (this.aGoldPurchases?.length) {
            this.aGoldPurchases.forEach((item: any, index: number) => {
                const date = moment(item.dCreatedDate).format('DD-MM-yyyy');
                let fillColor = index % 2 === 0 ? '#ccc' : '#fff';
                let texts: any = [
                    { text: item.sNumber, style: 'td', fillColor: fillColor },
                    { text: date, style: 'td', fillColor: fillColor },
                    { text: item.nQuantity, style: 'td', fillColor: fillColor },
                    { text: item.nPriceIncVat, style: 'td', fillColor: fillColor },
                    { text: item.nTotalAmount, style: 'td', fillColor: fillColor },
                    { text: '', style: 'td', fillColor: fillColor },
                    { text: '', style: 'td', fillColor: fillColor },
                ];
                this.content.push({
                    table: {
                        widths: widths,
                        body: [texts],
                    },
                    layout: {
                        hLineWidth: function (i: any) {
                            return i === 0 ? 0 : 1;
                        },
                    },
                });
                item.aTransactionItems.forEach((transaction: any) => {
                    const payments = transaction.aPayments
                        .map((el: any) => el.sMethod)
                        .join(', ');
                    let texts: any = [
                        { text: '', style: 'td', fillColor: fillColor },
                        { text: '', style: 'td', fillColor: fillColor },
                        { text: '', style: 'td', fillColor: fillColor },
                        { text: '', style: 'td', fillColor: fillColor },
                        { text: '', style: 'td', fillColor: fillColor },
                        {
                            text: transaction.sTransactionNumber,
                            style: 'td',
                            fillColor: fillColor,
                        },
                        { text: payments, style: 'td', fillColor: fillColor },
                    ];
                    this.content.push({
                        table: {
                            widths: widths,
                            body: [texts],
                        },
                        layout: {
                            hLineWidth: function (i: any, node: any) {
                                return i === 0 ? 0 : 1;
                            },
                        },
                    });
                });
            });
        } else {
            this.content.push({
                table: {
                    widths: widths,
                    body: [[{ text:this.translations['NO_RECORDS_FOUND'], colSpan: 7, alignment: 'center', style: ['td'] }, {}, {}, {}, {}, {}, {},],],
                },
                layout: {
                    hLineWidth: function (i: any) {
                        return i === 0 ? 0 : 1;
                    },
                },
            });
        }
    }

    processPdfByRevenuePerBusinessPartner(columnWidths: any,tableLayout: any,aStatistic:any) {
        let arr: Array<any> = [];
        const header: Array<any> = [
           this.translations['SUPPLIER'],
           this.translations['QUANTITY'],
           this.translations['PRICE_INCL_VAT'],
           this.translations['PURCHASE_PRICE'],
           this.translations['GROSS_PROFIT']
        ];
        const headerList: Array<any> = [];
        header.forEach((singleHeader: any) => {
            headerList.push({ text: singleHeader, bold: true });
        });


        aStatistic[0].individual.forEach((el: any) => {
            var obj: any = {};
            obj['sBusinessPartnerName'] = el.sBusinessPartnerName;
            obj['nQuantity'] = el.nQuantity;
            obj['nTotalRevenue'] = el.nTotalRevenue;
            obj['nTotalPurchaseAmount'] = el.nTotalPurchaseAmount;
            obj['nProfit'] = el.nProfit;
            // obj['nMargin'] = el.nMargin;
            obj['aArticleGroups'] =
                el.aArticleGroups.map((article: any) => {
                    let data = {
                        sName: article.sName,
                        nQuantity: article.nQuantity,
                        nTotalRevenue: article.nTotalRevenue,
                        nTotalPurchaseAmount: article.nTotalPurchaseAmount,
                        nProfit: article.nProfit,
                        // nMargin: article.nMargin,
                        aRevenueByProperty: article?.aRevenueByProperty.map(
                            (property: any) => {
                                let revenue = {
                                    aCategory: property.aCategory.join(' | '),
                                    nQuantity: property.nQuantity || 0,
                                    nTotalRevenue: property.nTotalRevenue,
                                    nTotalPurchaseAmount: property.nTotalPurchaseAmount,
                                    nProfit: property.nProfit || 0,
                                    // nMargin: property.nMargin || 0,
                                };
                                return revenue;
                            }
                        ),
                    };
                    return data;
                }) || [];

            arr.push(obj);
        });
        arr.forEach((singleRecord: any) => {
            let texts: any = [
                { text: singleRecord.sBusinessPartnerName, style: 'th' },
                { text: singleRecord.nQuantity, style: 'th' },
                { text: singleRecord.nTotalRevenue, style: 'th' },
                { text: singleRecord.nTotalPurchaseAmount, style: 'th' },
                { text: singleRecord.nProfit, style: 'th' },
                // { text: singleRecord.nMargin, style: 'th' },
            ];
            const data = {
                table: {
                    headerRows: 1,
                    widths: columnWidths,
                    heights: [30],
                    body: [[...headerList],texts],
                },
                layout: tableLayout,
            };
            this.content.push(data);
            singleRecord.aArticleGroups.forEach((articleGroup: any) => {
                let texts: any = [
                    { text: articleGroup.sName, style: ['td', 'articleGroup'] },
                    { text: articleGroup.nQuantity, style: ['td', 'articleGroup'] },
                    { text: articleGroup.nTotalRevenue, style: ['td', 'articleGroup'] },
                    {
                        text: articleGroup.nTotalPurchaseAmount,
                        style: ['td', 'articleGroup'],
                    },
                    { text: articleGroup.nProfit, style: ['td', 'articleGroup'] },
                    // { text: articleGroup.nMargin, style: ['td', 'articleGroup'] },
                ];
                const data = {
                    table: {
                        headerRows: 0,
                        widths: columnWidths,
                        body: [texts],
                    },
                    layout: tableLayout,
                };
                this.content.push(data);

                articleGroup.aRevenueByProperty.forEach((property: any) => {
                    let texts: any = [
                        { text: property.aCategory, style: ['td', 'property'] },
                        { text: property.nQuantity, style: ['td', 'property'] },
                        { text: property.nTotalRevenue, style: ['td', 'property'] },
                        { text: property.nTotalPurchaseAmount, style: ['td', 'property'] },
                        { text: property.nProfit, style: ['td', 'property'] },
                        // { text: property.nMargin, style: ['td', 'property'] },
                    ];
                    const data = {
                        table: {
                            widths: columnWidths,
                            body: [texts],
                            dontBreakRows: true,
                        },
                        layout: tableLayout,
                    };
                    this.content.push(data);
                });
            });
            // this.content.push({
            //     canvas: [{ type: 'line', x1: 0, y1: 0, x2: 575, y2: 0, lineWidth: 1 }],
            //     margin: [0, 0, 20, 0],
            //     style: ['afterLine', 'separatorLine'],
            // });
        });

        let texts: any = [
            { text: 'Total', style: 'th' },
            { text: aStatistic[0].overall[0].nQuantity, style: 'th' },
            { text: aStatistic[0].overall[0].nTotalRevenue, style: 'th' },
            { text: aStatistic[0].overall[0].nTotalPurchaseAmount, style: 'th' },
            { text: Math.round(aStatistic[0].overall[0].nProfit).toFixed(2), style: 'th' },
            // { text: Math.round(aStatistic[0].overall[0].nMargin).toFixed(2), style: 'th' },
        ];

        this.pushSeparatorLine();
        this.content.push({
            style: 'headerStyle',
            table: {
                headerRows: 1,
                widths: columnWidths,
                body: [headerList],
            },
            layout: tableLayout,
        });
        this.pushSeparatorLine();
        this.content.push({
            table: {
                widths: columnWidths,
                body: [texts],
            },
            layout: tableLayout,
        });
        this.pushSeparatorLine();
    }

    processPdfByRevenuePerArticleGroupAndProperty(columnWidths: any,tableLayout: any,aStatistic:any) {
        let arr: Array<any> = [];

        aStatistic[0].individual.forEach((el: any) => {
            var obj: any = {};
            obj['sName'] = el.sName;
            obj['nQuantity'] = el.nQuantity;
            obj['nTotalRevenue'] = el.nTotalRevenue;
            obj['nTotalPurchaseAmount'] = el.nTotalPurchaseAmount;
            obj['nProfit'] = el.nProfit;
            // obj['nMargin'] = el.nMargin;
            obj['aRevenueByProperty'] =
                el.aRevenueByProperty.map((property: any) => {
                    let revenue = {
                        aCategory: property.aCategory.join(' | '),
                        nQuantity: property.nQuantity || 0,
                        nTotalRevenue: property.nTotalRevenue,
                        nTotalPurchaseAmount: property.nTotalPurchaseAmount,
                        nProfit: property.nProfit || 0,
                        // nMargin: property.nMargin || 0,
                    };
                    return revenue;
                }) || [];

            arr.push(obj);
        });
        arr.forEach((singleRecord: any) => {
            let texts: any = [
                { text: singleRecord.sName, style: ['td', 'articleGroup'] },
                { text: singleRecord.nQuantity, style: ['td', 'articleGroup'] },
                { text: singleRecord.nTotalRevenue, style: ['td', 'articleGroup'] },
                {
                    text: singleRecord.nTotalPurchaseAmount,
                    style: ['td', 'articleGroup'],
                },
                { text: singleRecord.nProfit, style: ['td', 'articleGroup'] },
                // { text: singleRecord.nMargin, style: ['td', 'articleGroup'] },
            ];
            const data = {
                table: {
                    headerRows: 1,
                    widths: columnWidths,
                    heights: [30],
                    body: [texts],
                },
                layout: tableLayout,
            };
            this.content.push(data);
            singleRecord.aRevenueByProperty.forEach((property: any) => {
                let texts: any = [
                    { text: property.aCategory, style: ['td', 'property'] },
                    { text: property.nQuantity, style: ['td', 'property'] },
                    { text: property.nTotalRevenue, style: ['td', 'property'] },
                    { text: property.nTotalPurchaseAmount, style: ['td', 'property'] },
                    { text: property.nProfit, style: ['td', 'property'] },
                    // { text: property.nMargin, style: ['td', 'property'] },
                ];
                const data = {
                    table: {
                        widths: columnWidths,
                        body: [texts],
                    },
                    layout: tableLayout,
                };
                this.content.push(data);
            });
        });
    }

    processPdfByRevenuePerSupplierAndArticleGroup(columnWidths: any,tableLayout: any,aStatistic: any) {
        let arr: Array<any> = [];

        aStatistic[0].individual.forEach((el: any) => {
            var obj: any = {};
            obj['sBusinessPartnerName'] = el.sBusinessPartnerName;
            obj['nQuantity'] = el.nQuantity;
            obj['nTotalRevenue'] = el.nTotalRevenue;
            obj['nTotalPurchaseAmount'] = el.nTotalPurchaseAmount;
            obj['nProfit'] = el.nProfit;
            // obj['nMargin'] = el.nMargin;
            obj['aArticleGroups'] =
                el.aArticleGroups.map((article: any) => {
                    let data = {
                        sName: article.sName,
                        nQuantity: article.nQuantity,
                        nTotalRevenue: article.nTotalRevenue,
                        nTotalPurchaseAmount: article.nTotalPurchaseAmount,
                        nProfit: article.nProfit,
                        // nMargin: article.nMargin,
                    };
                    return data;
                }) || [];

            arr.push(obj);
        });
        arr.forEach((singleRecord: any) => {
            let texts: any = [
                { text: singleRecord.sBusinessPartnerName, style: 'th' },
                { text: singleRecord.nQuantity, style: 'th' },
                { text: singleRecord.nTotalRevenue, style: 'th' },
                { text: singleRecord.nTotalPurchaseAmount, style: 'th' },
                { text: singleRecord.nProfit, style: 'th' },
                // { text: singleRecord.nMargin, style: 'th' },
            ];
            const data = {
                table: {
                    headerRows: 1,
                    widths: columnWidths,
                    heights: [30],
                    body: [texts],
                },
                layout: tableLayout,
            };
            this.content.push(data);
            singleRecord.aArticleGroups.forEach((articleGroup: any) => {
                let texts: any = [
                    { text: articleGroup.sName, style: ['td', 'articleGroup'] },
                    { text: articleGroup.nQuantity, style: ['td', 'articleGroup'] },
                    { text: articleGroup.nTotalRevenue, style: ['td', 'articleGroup'] },
                    {
                        text: articleGroup.nTotalPurchaseAmount,
                        style: ['td', 'articleGroup'],
                    },
                    { text: articleGroup.nProfit, style: ['td', 'articleGroup'] },
                    // { text: articleGroup.nMargin, style: ['td', 'articleGroup'] },
                ];
                const data = {
                    table: {
                        headerRows: 0,
                        widths: columnWidths,
                        body: [texts],
                    },
                    layout: tableLayout,
                };
                this.content.push(data);
            });
        });
    }

    processPdfByRevenuePerProperty(columnWidths: any,tableLayout: any,aStatistic: any) {
        let arr: Array<any> = [];

        aStatistic[0].individual.forEach((property: any) => {
            let revenue = {
                aCategory: property.aCategory.join(' | '),
                nQuantity: property.nQuantity || 0,
                nTotalRevenue: property.nTotalRevenue,
                nTotalPurchaseAmount: property.nTotalPurchaseAmount,
                nProfit: property.nProfit || 0,
                // nMargin: property.nMargin || 0,
            };

            arr.push(revenue);
        });
        arr.forEach((property: any) => {
            let texts: any = [
                {
                    text: property.aCategory.length ? property.aCategory : '-',
                    style: ['td', 'property'],
                },
                { text: property.nQuantity, style: ['td', 'property'] },
                { text: property.nTotalRevenue, style: ['td', 'property'] },
                { text: property.nTotalPurchaseAmount, style: ['td', 'property'] },
                { text: property.nProfit, style: ['td', 'property'] },
                // { text: property.nMargin, style: ['td', 'property'] },
            ];
            const data = {
                table: {
                    widths: columnWidths,
                    body: [texts],
                },
                layout: tableLayout,
            };
            this.content.push(data);
        });
    }

    processPdfByRevenuePerArticleGroup(columnWidths: any,tableLayout: any,aStatistic: any) {
        let arr: Array<any> = [];

        const tableHeaders = [
            this.translations['ARTICLE'],
            this.translations['QUANTITY'],
            this.translations['PRICE_WITH_VAT'],
            this.translations['PURCHASE_PRICE_EX_VAT'],
            this.translations['GROSS_PROFIT'],
        ];

        const tableHeadersList: any = [];
        tableHeaders.forEach((header: any, index:number) => {
            tableHeadersList.push({
                text: header,
                style: ['th', 'articleGroup'],
            });
        });
        aStatistic[0].individual.forEach((el: any) => {
            var obj: any = {};
            obj['sName'] = el.sName;
            obj['nQuantity'] = el.nQuantity;
            obj['nTotalRevenue'] = el.nTotalRevenue;
            obj['nTotalPurchaseAmount'] = el.nTotalPurchaseAmount;
            obj['nProfit'] = Math.round(el.nProfit).toFixed(2);
            arr.push(obj);
        });
        let texts:any = [];
        let nTotalRevenue=0, nTotalQuantity=0, nTotalPurchaseAmount=0, nTotalProfit = 0;
        arr.forEach((item: any) => {
            nTotalRevenue += item.nTotalRevenue;
            nTotalQuantity += item.nQuantity;
            nTotalPurchaseAmount += item.nTotalPurchaseAmount;
            nTotalProfit += parseFloat(item.nProfit);
            texts.push([
                { text: item.sName, style: ['td'] },
                { text: item.nQuantity, style: ['td'] },
                { text: parseFloat(item.nTotalRevenue.toFixed(2)), style: ['td'] },
                {
                    text: parseFloat(item.nTotalPurchaseAmount.toFixed(2)),
                    style: ['td'],
                },
                { text: parseFloat(item.nProfit), style: ['td'] },
            ]);
        });
        texts.push([
            { text: this.translations['TOTAL'], style: ['td', 'bold','bgGray'] },
            { text: nTotalQuantity, style:['td', 'bold','bgGray'] },
            { text: parseFloat(nTotalRevenue.toFixed(2)), style:['td', 'bold','bgGray'] },
            { text: parseFloat(nTotalPurchaseAmount.toFixed(2)), style:['td', 'bold','bgGray'] },
            { text: parseFloat(nTotalProfit.toFixed(2)), style:['td', 'bold','bgGray'] },
        ]);
        this.content.push(
            {
                table: {
                    headerRows: 1,
                    widths: columnWidths,
                    // heights: [30],
                    body: [[...tableHeadersList], ...texts],
                },
                margin: [0, 20],
                layout: tableLayout,
            });
    }

    fetchTransactionItems(oFilterDates: any, bIsArticleGroupLevel: boolean, bIsSupplierMode:boolean){
        let data = {
            iTransactionId: 'all',
            oFilterBy: {
                dStartDate: oFilterDates.startDate,
                dEndDate: oFilterDates.endDate,
                bIsArticleGroupLevel: bIsArticleGroupLevel,
                bIsSupplierMode: bIsSupplierMode
            },
            iBusinessId: this.iBusinessId,
            iLocationId: this.iLocationId,
            iWorkstationId: this.iWorkstationId,
        };

        return this.apiService.postNew('cashregistry','/api/v1/transaction/item/list',data).toPromise();
    }

    fetchActivityItems(oFilterDates: any) {
        let data = {
            startDate: oFilterDates.startDate,
            endDate: oFilterDates.endDate,
            iBusinessId: this.iBusinessId,
            selectedWorkstations: [this.iWorkstationId],
        };

        return this.apiService.postNew('cashregistry','/api/v1/activities/items',data).toPromise();
    }

    fetchGoldPurchaseItems(oFilterDates: any) {
        let data = {
            oFilterBy: {
                startDate: oFilterDates.startDate,
                endDate: oFilterDates.endDate,
            },
            iBusinessId: this.iBusinessId,
        };
        return this.apiService.postNew('cashregistry','/api/v1/activities/gold-purchases-payments/list',data).toPromise();
    }

    convertToMoney(val: any) {
        // console.log('convertToMoney: ', val);
        const nNum = val; 
        if (val % 1 === 0) {
            //no decimals
            return (val) ? ((val < 0) ? String('-' + this.currency + Math.abs(val) + ',00') : String(this.currency + val + ',00')) : this.currency + '0,00';
        } else {
            val = String(val);
            let parts = val.split('.');
            // console.log('parts: ', parts, val);
            if (parts[1].length === 1) {
                val = (nNum < 0) ? ('-' + this.currency + Math.abs(nNum) + '0') : (this.currency + val + '0');
            }
            val = (nNum < 0) ? '-' + this.currency + Math.abs(nNum) : this.currency + nNum

            const t = val.replace('.', ',')
            return t
        }
    }

    summingUpCounting(oData: any) {
        try {
            const { oCountings, oProcessCountings } = oData;
            oProcessCountings.nCashAtStart += (oCountings?.nCashAtStart || 0);
            oProcessCountings.nCashCounted += (oCountings?.nCashCounted || 0);
            oProcessCountings.nSkim += (oCountings?.nSkim || 0);
            oProcessCountings.nCashRemain += (oCountings?.nCashRemain || 0);
            oProcessCountings.nCashDifference += (oCountings?.nCashDifference || 0);
            oProcessCountings.nCashInTill += (oCountings?.nCashInTill || 0);
            return oProcessCountings;
        } catch (error) {
            console.log('Error: ', error);
            return oData?.oProcessCountings?.length ? oData?.oProcessCountings : [];
        }
    }

    summingUpVatRate(oData: any) {
        try {
            const { aVatRates, aProcessVatRates } = oData;
            if (aVatRates?.length) {
                aVatRates.forEach((oItem: any) => {
                    console.log('oItem oShopPurchase: ', oItem?.oShopPurchase);
                    const oFoundVat = aProcessVatRates.find((oProcessVat: any) => oProcessVat.nVat == oItem?.nVat);
                    if (!oFoundVat) {
                        aProcessVatRates.push(oItem);
                        return;
                    }
                    this.aFieldsToInclude.forEach((field: any) => {
                        oFoundVat[field].nTotalRevenue += (oItem[field].nTotalRevenue || 0);
                        oFoundVat[field].nPurchaseValue += (oItem[field].nPurchaseValue || 0);
                        oFoundVat[field].nProfit += (oItem[field].nProfit || 0);
                        oFoundVat[field].nVatAmount += (oItem[field].nVatAmount || 0);
                        // console.log('nTotalVatAmount: ', oFoundVat[field].nTotalVatAmount, oItem[field].nTotalVatAmount);
                    });
                    console.log('summingUpVatRate aProcessVatRates: ', aProcessVatRates);
                })
            }

            return aProcessVatRates;
        } catch (error) {
            return oData?.aProcessVatRates?.length ? oData?.aProcessVatRates : [];
        }
    }

    processingMultipleStatisticsBySummingUp(oBody: any) {
        try {
            const { aStatisticsDocuments } = oBody;
            if (!aStatisticsDocuments?.length) return {};
            if (aStatisticsDocuments?.length === 1) return aStatisticsDocuments[0];
            const oProcessedStatisticData = {
                aPaymentMethods: [],
                aVatRates: [],
                oCountings: {
                    nCashAtStart: 0,
                    nCashCounted: 0,
                    nSkim: 0,
                    nCashRemain: 0,
                    nCashDifference: 0,
                    nCashInTill: 0
                }
            }
            for (const oStatisticsDocument of aStatisticsDocuments) {
                oProcessedStatisticData.oCountings = this.summingUpCounting({ oCountings: oStatisticsDocument.oCountings, oProcessCountings: oProcessedStatisticData?.oCountings });
                oProcessedStatisticData.aVatRates = this.summingUpVatRate({ aVatRates: oStatisticsDocument.aVatRates, aProcessVatRates: oProcessedStatisticData?.aVatRates });
            }
            return oProcessedStatisticData;
        } catch (error) {
            console.log('Error in processingMultipleStatisticsInOne: ', error);
            return oBody?.aStatisticsDocuments?.length ? oBody?.aStatisticsDocuments[0] : {};
        }
    }
}