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

        td_no_margin: {
            fontSize: 9,
        },
        td: {
            fontSize: 9,
            margin: [0, 5],
        },
        "margin-5": {
            margin: [0, 5],
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
        horizontalLinesSlim: {
            hLineWidth: (i: any) => {
                return (i === 1) ? 1 : 0;
            },
            vLineWidth: () => {
                return 0
            },
            // defaultBorder: false,
        },
        horizontalLinesSlimWithTotal: {
            hLineWidth: (i: any, node:any) => {
                return (i === 1 || i === node.table.body.length - 1) ? 1 : 0;
            },
            vLineWidth: () => {
                return 0
            },
            // defaultBorder: false,
        },
        border_bottom:[false, false, false, true],
        border_top:[false, true, false, false],
        border_top_bottom: [false, true, false, true],
        tableLayout : {
            hLineWidth: function (i: number, node: any) {
                return i === 0 || i === node.table.body.length ? 0.5 : 0.5;
            },
            vLineWidth: function (i: number, node: any) {
                return i === 0 || i === node.table.widths.length ? 0 : 0.5;
            },
            hLineColor: function (i: number, node: any) {
                return i === 0 || i === node.table.body.length ? '#999' : '#999';
            },
        }
    };
    
    translations: any;
    sDisplayMethod: any;
    pageMargins: any = [10, 10,10,10];
    pageSize: any = 'A4';
    aTransactionItems: any;
    oEmployee: any = {};

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

    constructor(
        private pdf: PdfService,
        private apiService: ApiService,
        private translateService: TranslateService,
        private tillService: TillService,
        private commonPrintSettingsService: CommonPrintSettingsService
        ) {

        // const aKeywords: any = [
        //     'CASH_LEFTOVER', 
        //     'CASH_MUTATION', 
        //     'CASH_IN_TILL', 
        //     'CASH_COUNTED',
        //     'TREASURY_DIFFERENCE',
        //     'SKIM',
        //     'AMOUNT_TO_LEFT_IN_CASH' ,
        //     'AMOUNT',
        //     'DYANAMIC_DATA',
        //     'STATIC_DATA',
        //     'TRANSACTION_AUDIT_REPORT',
        //     'LOCATION(S)',
        //     'DISPLAY_METHOD',
        //     'WORKSTATION(S)',
        //     'TYPE_OF_DATA',
        //     'COMMENT',
        //     'TYPE' ,
        //     'PAYMENT_METHODS',
        //     'METHOD',
        //     'TOTAL_AMOUNT',
        //     'QUANTITY',
        //     'TOTAL' ,
        //     'REFUND' ,
        //     'PRICE' ,
        //     'TAX',
        //     'DESCRIPTION' ,
        //     'DISCOUNT(S)',
        //     'DISCOUNT',
        //     'PRODUCT_NAME' ,
        //     'REPAIR(S)',
        //     'NO_RECORDS_FOUND',
        //     'EMPLOYEE',
        //     'GIFTCARD(S)',
        //     'PAYMENT_TYPE',
        //     'DATE',
        //     'VAT_RATE',
        //     'NUMBER',
        //     'PAYMENT_TRANSACTION_NUMBER' ,
        //     'GOLD_PURCHASE(S)',
        //     'GIFT_CARD_NUMBER',
        //     'VAT_TYPE',
        //     'PRICE_WITH_VAT',
        //     'PURCHASE_PRICE_EX_VAT',
        //     'TOTAL_OF_VAT_RATE',
        //     'TOTAL_OF_ALL_VAT_RATE',
        //     'GROSS_PROFIT',
        //     'VAT_AMOUNT',
        //     'FROM',
        //     'TO' ,
        //     'PURCHASE_PRICE',
        //     'PARTICULARS',
        //     'PRICE_INCL_VAT',
        //     'SUPPLIER' ,
        //     'ARTICLE',
        //     'CATEGORY'
        // ]
        // this.translateService.get(aKeywords).subscribe((result: any) => this.translations = result)
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
        bIsSupplierMode,
        aEmployee
    }: any) {

        // console.log('PDF service: exportToPDF: ', {
        //     aSelectedLocation,
        //     sOptionMenu,
        //     bIsDynamicState,
        //     aLocation,
        //     aSelectedWorkStation,
        //     aWorkStation,
        //     oFilterDates,
        //     oBusinessDetails,
        //     sDisplayMethod,
        //     sDisplayMethodString,
        //     aStatistic,
        //     oStatisticsDocument,
        //     aStatisticsDocuments,
        //     aPaymentMethods,
        //     bIsArticleGroupLevel,
        //     bIsSupplierMode,
        //     aEmployee });

        const date = moment(Date.now()).format('DD-MM-yyyy');
        const columnWidths = ['*', 60, 80, 80, 100];
        let sType = sOptionMenu.parent.sValue
        let dataType = bIsDynamicState ? this.translateService.instant('DYANAMIC_DATA'): this.translateService.instant('STATIC_DATA');

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

        this.prepareEmployeeList(aEmployee);

        let dataFromTo =
            '( ' + this.translateService.instant('FROM') + ': ' + moment(oFilterDates.startDate).format('DD-MM-yyyy hh:mm A') + " "+  this.translateService.instant('TO')  + " " +
            moment(oFilterDates.endDate).format('DD-MM-yyyy hh:mm A') + ')';

        this.content = [
            { text: date, style: ['right', 'normal'] },
            { text: this.translateService.instant('TRANSACTION_AUDIT_REPORT'), style: ['header', 'center'] },
            { text: dataFromTo, style: ['center', 'normal'] },
            { text: oBusinessDetails.sName, style: 'businessName' },
            {
                columns: [
                    { text: this.translateService.instant('LOCATION(S)') + ': ', style: ['left', 'normal'], width: '15%' },
                    { text: sLocations, style: ['left', 'normal'], width: '35%' },
                    { width: '*', text: '' },
                    { text: this.translateService.instant('DISPLAY_METHOD') + ': ', style: ['right', 'normal'], width: '15%' },
                    { text: sDisplayMethodString, style: ['right', 'normal'], width: '35%' },
                ],
            },
            {
                columns: [
                    { text: this.translateService.instant('WORKSTATION(S)') + ': ', style: ['left', 'normal'], width: '15%' },
                    { text: sWorkstation, style: ['left', 'normal'], width: '35%' },
                    { width: '*', text: '' },
                    { text: this.translateService.instant('TYPE_OF_DATA')+': ', style: ['right', 'normal'], width: '15%' },
                    { text: dataType, style: ['right', 'normal'], width: '35%' },
                ],
            },
            {
                columns: [
                    { text: this.translateService.instant('COMMENT') + ': ', style: ['left', 'normal'], width: '15%' },
                    { text: oStatisticsDocument?.sComment, style: ['left', 'normal'], width: '35%' },
                    { width: '*', text: '' },
                    { text: this.translateService.instant('TYPE') + ': ', style: ['right', 'normal'], width: '15%' },
                    { text: sType, style: ['right', 'normal'], width: '35%' },
                ],
            },
            
        ];

        const [_aTransactionItems, _aActivityItems, _aGoldPurchases]: any = await Promise.all([ //, 
            this.fetchTransactionItems(oFilterDates,bIsArticleGroupLevel,bIsSupplierMode),
            this.fetchActivityItems(oFilterDates),
            this.fetchGoldPurchaseItems(oFilterDates)
        ]);
        // console.log(_aTransactionItems);

        this.aTransactionItems = (_aTransactionItems?.data?.length && _aTransactionItems?.data[0]?.result?.length) ? _aTransactionItems?.data[0]?.result : [];

        if (this.aTransactionItems?.length) {
            this.aRefundItems = this.aTransactionItems.filter((item: any) => item.oType.bRefund);
            this.aDiscountItems = this.aTransactionItems.filter((item: any) => item.oType.bDiscount);
        }

        if (_aActivityItems?.data?.length) {
            this.aRepairItems = _aActivityItems?.data.filter((item: any) => item.oType.eKind == 'repair');
            this.aGiftItems = _aActivityItems?.data.filter((item: any) => item.oType.eKind == 'giftcard');
        }

        this.aGoldPurchases = _aGoldPurchases?.data[0]?.result.filter((item: any) => item.oType.eKind == 'gold-purchase');

        if (sDisplayMethod != "aVatRates") {
            this.processCashCountings(oStatisticsDocument);
            this.processVatRates(oStatisticsDocument?.aVatRates);
        }
        this.sDisplayMethod = sDisplayMethod;
        
        switch (sDisplayMethod.toString()) {
            case 'revenuePerBusinessPartner':
                this.processPdfByRevenuePerBusinessPartner(columnWidths,aStatistic);
                break;
            case 'revenuePerSupplierAndArticleGroup':
                this.processPdfByRevenuePerSupplierAndArticleGroup(columnWidths,aStatistic);
                break;
            case 'revenuePerArticleGroupAndProperty':
                this.processPdfByRevenuePerArticleGroupAndProperty(columnWidths,aStatistic);
                break;
            case 'revenuePerProperty':
                this.processPdfByRevenuePerProperty(columnWidths,  aStatistic);
                break;
            case 'revenuePerArticleGroup':
                this.processPdfByRevenuePerArticleGroup(columnWidths,aStatistic);
                break;
            case 'aVatRates':
                aStatistic.forEach((oStatistic:any)=> {
                    this.processVatRates(oStatistic?.aVatRates);
                });
                break;
            case 'aRevenuePerTurnoverGroup':
                this.processRevenuePerTurnoverGroup(aStatistic);
                break;
        }
        this.processPaymentMethods(aPaymentMethods);

        this.addRefundToPdf();
        this.addDiscountToPdf();
        this.addRepairsToPdf();
        this.addGiftcardsToPdf();
        this.addGoldPurchasesToPdf();
        
        // console.log(this.content);
        this.pdf.getPdfData({
            styles: this.styles,
            content: this.content,
            orientation: 'portrait',
            pageSize: this.pageSize,
            pdfTitle: oBusinessDetails.sName + '-' + this.translateService.instant('TRANSACTION_AUDIT_REPORT'),
            defaultStyle:{
                fontSize: 5
            },
            pageMargins: this.pageMargins,
            addPageBreakBefore: true
        });
    }

    addTableHeading(text:string){
        this.content.push({ text: this.translateService.instant(text), style: ['normal'], margin: [0, 30, 0, 10], });
    }

    processPaymentMethods(aPaymentMethods:any) {
        this.addTableHeading('PAYMENT_METHODS');

        const aHeaderList = [
            { text: this.translateService.instant('METHOD'), style: ['th', 'bgGray'] },
            { text: this.translateService.instant('TOTAL_AMOUNT'), style: ['th', 'bgGray'] },
            { text: this.translateService.instant('QUANTITY'), style: ['th', 'bgGray'] },
        ];
        const aTexts:any = [aHeaderList];
        if (aPaymentMethods?.length) {
            let nTotalAmount = 0, nTotalQuantity = 0;
            aPaymentMethods.forEach((paymentMethod: any) => {
                nTotalAmount += parseFloat(paymentMethod.nAmount);
                nTotalQuantity += parseFloat(paymentMethod.nQuantity);

                aTexts.push([
                    { text: paymentMethod.sMethod, style: ['td', 'margin-5', 'center'] },
                    { text: paymentMethod.nAmount, style: ['td', 'margin-5', 'center'] },
                    { text: paymentMethod.nQuantity, style: ['td', 'margin-5', 'center'] },
                ]);
            });
            aTexts.push([
                { text: this.translateService.instant('TOTAL'), style: ['td', 'bold', 'bgGray', 'center'], border: this.styles.border_top },
                { text: nTotalAmount, style: ['td', 'bold', 'bgGray', 'center'], border: this.styles.border_top },
                { text: nTotalQuantity, style: ['td', 'bold', 'bgGray', 'center'], border: this.styles.border_top },
            ])
        } else {
            aTexts.push([
                { text: this.translateService.instant('NO_RECORDS_FOUND'), colSpan: 3, style: ['td', 'center'] },
                {},
                {}
            ]);
        }
        const data = {
            table: {
                headerRows: 1,
                widths: '*',
                body: aTexts,
                dontBreakRows: true,
                keepWithHeaderRows: true
            },
            layout: this.styles.horizontalLinesSlimWithTotal
        };
        this.content.push(data);
    }

    

    processCashCountings(oStatisticsDocument:any){
        const oCountings = oStatisticsDocument?.oCountings;

        const tableHeadersList: any = [
            { text: this.translateService.instant('PARTICULARS'), style: ['th', 'bgGray'] },
            { text: this.translateService.instant('AMOUNT'), style: ['th', 'bgGray'], }
        ];

        let texts: any = [
            [
                { text: this.translateService.instant('CASH_LEFTOVER'), style: ['td'] },
                { text: this.convertToMoney(oCountings?.nCashAtStart), style: ['td'] },
            ],
            [
                { text: this.translateService.instant('CASH_MUTATION'), style: ['td'] },
                { text: this.convertToMoney(0), style: ['td'] },
            ],
            [
                { text: this.translateService.instant('CASH_IN_TILL'), style: ['td'] },
                { text: this.convertToMoney(oCountings?.nCashInTill || 0), style: ['td'] },
            ],
            [
                { text: this.translateService.instant('CASH_COUNTED'), style: ['td'] },
                { text: this.convertToMoney(oCountings?.nCashCounted), style: ['td'] },
            ],
            [
                { text: this.translateService.instant('TREASURY_DIFFERENCE'), style: ['td'] },
                { text: this.convertToMoney(oCountings?.nCashDifference || 0) , style: ['td'] }
            ],
            [
                { text: this.translateService.instant('SKIM'), style: ['td'] },
                { text: this.convertToMoney(oCountings?.nSkim), style: ['td'] },
            ],
            [
                { text: this.translateService.instant('AMOUNT_TO_LEFT_IN_CASH'), style: ['td'] },
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
                layout: this.styles.tableLayout,
            }
        );

    }

    
    processRevenuePerTurnoverGroup(aStatistic: any) {
        this.addTableHeading('REVENUE_PER_TURNOVER_GROUP');
        // this.content.push({
        //     text: this.translateService.instant('REVENUE_PER_TURNOVER_GROUP'),
        //     style: ['left', 'normal'],
        //     margin: [0, 30, 0, 10],
        // });
        const aHeaders = [
            { key: 'RECEIPT_NO', weight: 1 },
            { key: 'ARTICLE_NUMBER', weight: 1 },
            { key: 'QUANTITY', weight: 1 },
            { key: 'DESCRIPTION', weight: 1, colSpan: 2 },//
            { key: '', weight: 1 },
            { key: 'PRODUCT_NUMBER', weight: 1 },
            { key: 'PRICE', weight: 1 },
            { key: 'DISCOUNT', weight: 1 },
            { key: 'REVENUE', weight: 1 },
            { key: 'VAT', weight: 1 },
            { key: 'EMPLOYEE', weight: 1 },
            { key: 'DATE', weight: 1 },
        ]; 

        this.commonPrintSettingsService.oCommonParameters['pageMargins'] = this.pageMargins;
        this.commonPrintSettingsService.oCommonParameters['pageSize'] = this.pageSize;
        this.commonPrintSettingsService.pageWidth = this.commonPrintSettingsService.pageSizes[this.pageSize].pageWidth
        const aWidths = [...aHeaders.map((el:any) => this.commonPrintSettingsService.calcColumnWidth(el.weight))];

        const headerList: any = [];
        aHeaders.forEach((el:any) => {
            const obj:any =  { 
                text: (el?.key) ? this.translateService.instant(el.key) : '', 
                style: ['td'], 
                border: this.styles.border_top_bottom 
            };
            if(el?.colSpan) obj.colSpan = el?.colSpan;
            headerList.push(obj) 
        })
        const aTexts = [headerList];
        
        const aDummy = [...headerList];
        aTexts.push([...aDummy.fill(' ')]);
        let nTotalDiscount = 0, nTotalRevenue = 0, nTotalVat = 0;
        aStatistic.forEach((oStatistic: any) => {
            // console.log({oStatistic})
            oStatistic.individual.forEach((oSupplier: any) => {
                // console.log({ oSupplier })
                oSupplier.aArticleGroups.forEach((oArticleGroup: any) => {
                    aTexts.push([
                        { text: '', style: ['td', 'bold'], headlineLevel: 1 },
                        { text: this.translateService.instant('CASH_GROUP') + ': ' + oSupplier.sCategory , style: ['td', 'bold'], colSpan: 2, border: this.styles.border_bottom }, //+ ': group number'
                        { text: '', style: ['td', 'bold'], border: this.styles.border_bottom },
                        { text: oArticleGroup.sName, style: ['td'], border: this.styles.border_bottom },
                        { text: this.translateService.instant('TRANSACTIONS'), style: ['td', 'bold'], border: this.styles.border_bottom }, //colSpan: 2,
                        { text: '', style: ['td', 'bold'] },
                        { text: '', style: ['td', 'bold'] },
                        { text: '', style: ['td', 'bold'] },
                        { text: '', style: ['td', 'bold'] },
                        { text: '', style: ['td', 'bold'] },
                        { text: '', style: ['td', 'bold'] },
                        { text: '', style: ['td', 'bold'] }
                    ]);
                    const aItems = this.aTransactionItems.filter((item:any) => item.iArticleGroupId === oArticleGroup._id)
                    
                    let nSubTotalDiscount = 0, nSubTotalRevenue = 0, nSubTotalVat = 0;
                    aItems.forEach((oItem: any) => {
                        const nVat = +((oItem.nRevenueAmount - (oItem.nRevenueAmount / (1 + oItem.nVatRate / 100))).toFixed(2));
                        let nDiscount = 0;
                        if(oItem.nDiscount) nDiscount = ((oItem.bDiscountOnPercentage) ? (oItem.nPriceIncVat * oItem.nQuantity * oItem.nDiscount / 100) : oItem.nDiscount).toFixed(2)
                        
                        nSubTotalDiscount += nDiscount;
                        nSubTotalRevenue += oItem.nRevenueAmount;
                        nSubTotalVat += nVat;

                        nTotalDiscount += +(nSubTotalDiscount);
                        nTotalRevenue += +(nSubTotalRevenue);
                        nTotalVat += +(nSubTotalVat);
                        
                        aTexts.push([
                            { text: oItem?.sReceiptNumber, style: ['td', 'property'] },
                            { text: oItem?.sArticleNumber || '', style: ['td', 'property'] },
                            { text: oItem.nQuantity, style: ['td', 'property'] },
                            { text: oItem?.sDescription, style: ['td', 'property'] }, //'description'
                            { text: oItem.sProductName, style: ['td', 'property'] },
                            { text: oItem?.sProductNumber || '', style: ['td', 'property'] }, //'product number'
                            { text: oItem?.nPriceIncVat, style: ['td', 'property'] },
                            { text: nDiscount, style: ['td', 'property'] },
                            { text: oItem?.nRevenueAmount * oItem.nQuantity, style: ['td', 'property'] },
                            { text: nVat, style: ['td', 'property'] },
                            { text: this.oEmployee[oItem.iEmployeeId], style: ['td', 'property'] },
                            { text: moment(oItem.dCreatedDate).format('HH:mm'), style: ['td', 'property'] },
                        ]);
                    });
                    aTexts.push([
                        { text: '', style: ['td', 'bold'] },
                        { text: this.translateService.instant('SUBTOTAL'), style: ['td'], colSpan: 2, border: this.styles.border_top },
                        { text: '', style: ['td'], border: this.styles.border_top },
                        { text: '', style: ['td'], border: this.styles.border_top },
                        { text: oArticleGroup.nQuantity, style: ['td', 'bold'], border: this.styles.border_top },
                        { text: '', style: ['td', 'bold'] },
                        { text: '', style: ['td', 'bold'] },
                        { text: nSubTotalDiscount, style: ['td', 'bold'], border: this.styles.border_top },
                        { text: nSubTotalRevenue, style: ['td', 'bold'], border: this.styles.border_top },
                        { text: nSubTotalVat, style: ['td', 'bold'], border: this.styles.border_top },
                        { text: '', style: ['td', 'bold'] },
                        { text: '', style: ['td', 'bold'] }
                    ])
                    aTexts.push([...aDummy.fill(' ')]);
                });
            });
        });

        aTexts.push([
            { text: '', style: ['td'], headlineLevel: 1, border: this.styles.border_top_bottom },
            { text: '', style: ['td'], colSpan: 2, border: this.styles.border_top_bottom }, //+ ': group number'
            { text: '', style: ['td'], border: this.styles.border_top_bottom },
            { text: '', style: ['td'], border: this.styles.border_top_bottom },
            { text: '', style: ['td'], border: this.styles.border_top_bottom }, //colSpan: 2,
            { text: '', style: ['td', 'bold'], border: this.styles.border_top_bottom },
            { text: '', style: ['td', 'bold'], border: this.styles.border_top_bottom },
            { text: nTotalDiscount.toFixed(2), style: ['td', 'bold'], border: this.styles.border_top_bottom },
            { text: nTotalRevenue.toFixed(2), style: ['td', 'bold'], border: this.styles.border_top_bottom },
            { text: nTotalVat.toFixed(2), style: ['td', 'bold'], border: this.styles.border_top_bottom },
            { text: '', style: ['td'], border: this.styles.border_top_bottom },
            { text: '', style: ['td'], border: this.styles.border_top_bottom },
        ]);

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
        // console.log(data, aTexts)
        this.content.push(data);
    }

    processVatRates(aVatRates: any) {
        const aHeaderList = [
            { text: this.translateService.instant('VAT_TYPE'), style: ['th', 'bgGray'] },
            { text: this.translateService.instant('PRICE_WITH_VAT'), style: ['th', 'bgGray'] },
            { text: this.translateService.instant('PURCHASE_PRICE_EX_VAT'), style: ['th', 'bgGray'] },
            { text: this.translateService.instant('GROSS_PROFIT'), style: ['th', 'bgGray'] },
            { text: this.translateService.instant('VAT_AMOUNT'), style: ['th', 'bgGray'] }
        ]
        const aTexts: any = [aHeaderList];

        if (aVatRates?.length) {
            let nOverallTotalRevenue = 0, nOverallTotalPurchaseValue = 0, nOverallTotalProfit = 0, nOverallTotalVatAmount = 0;
            aVatRates.forEach((oItem: any) => {
                let nTotalRevenue = 0, nTotalPurchaseValue = 0, nTotalProfit = 0, nTotalVatAmount = 0;
                aTexts.push([{ text: this.translateService.instant('VAT_RATE') + ((oItem?.nVat) ? oItem?.nVat : ''), colSpan: 5, style: ['bgGray', 'center', 'td'] }, {}, {}, {}, {}]);
                this.aFieldsToInclude.forEach((field: any) => {
                    nTotalRevenue += oItem[field].nTotalRevenue;
                    nTotalPurchaseValue += oItem[field].nPurchaseValue;
                    nTotalProfit += oItem[field].nProfit;
                    nTotalVatAmount += oItem[field].nVatAmount;
                    aTexts.push([
                        { text: field, style: ['td'] },
                        { text: parseFloat(oItem[field].nTotalRevenue.toFixed(2)), style: ['td', 'center'] },
                        { text: parseFloat(oItem[field].nPurchaseValue.toFixed(2)), style: ['td', 'center'] },
                        { text: parseFloat(oItem[field].nProfit.toFixed(2)), style: ['td', 'center'] },
                        { text: parseFloat(oItem[field].nVatAmount.toFixed(2)), style: ['td', 'center'] },
                    ])
                });
                nOverallTotalRevenue += nTotalRevenue;
                nOverallTotalPurchaseValue += nTotalPurchaseValue;
                nOverallTotalProfit += nTotalProfit;
                nOverallTotalVatAmount += nTotalVatAmount;

                aTexts.push([
                    { text: this.translateService.instant('TOTAL_OF_VAT_RATE') + ' ' + oItem?.nVat + '%', style: ['td', 'bold'] },
                    { text: parseFloat(nTotalRevenue.toFixed(2)), style: ['td', 'center', 'bold'] },
                    { text: parseFloat(nTotalPurchaseValue.toFixed(2)), style: ['td', 'center', 'bold'] },
                    { text: parseFloat(nTotalProfit.toFixed(2)), style: ['td', 'center', 'bold'] },
                    { text: parseFloat(nTotalVatAmount.toFixed(2)), style: ['td', 'center', 'bold'] },
                ])
            });

            aTexts.push([
                { text: this.translateService.instant('TOTAL_OF_ALL_VAT_RATE'), style: ['td', 'bold', 'bgGray'], border: this.styles.border_top },
                { text: parseFloat(nOverallTotalRevenue.toFixed(2)), style: ['td', 'center', 'bold', 'bgGray'], border: this.styles.border_top },
                { text: parseFloat(nOverallTotalPurchaseValue.toFixed(2)), style: ['td', 'center', 'bold', 'bgGray'], border: this.styles.border_top },
                { text: parseFloat(nOverallTotalProfit.toFixed(2)), style: ['td', 'center', 'bold', 'bgGray'], border: this.styles.border_top },
                { text: parseFloat(nOverallTotalVatAmount.toFixed(2)), style: ['td', 'center', 'bold', 'bgGray'], border: this.styles.border_top },
            ])
        } else {
            aTexts.push([{ text: this.translateService.instant('NO_RECORDS_FOUND'), colSpan: 5, style: ['td', 'center'] }, {}, {}, {}, {}]);
        }

        const data = {
            table: {
                headerRows: 1,
                widths: '*',
                body: aTexts,
                dontBreakRows: true,
                keepWithHeaderRows: true
            },
            layout: this.styles.horizontalLinesSlimWithTotal
        };
        this.content.push(data);
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
        this.addTableHeading('REFUND');

        const aHeaderList = [
            { text: this.translateService.instant('DESCRIPTION'), style: ['th', 'bgGray'] },
            { text: this.translateService.instant('PRICE'), style: ['th', 'bgGray'] },
            { text: this.translateService.instant('TAX'), style: ['th', 'bgGray'] },
            { text: this.translateService.instant('TOTAL'), style: ['th', 'bgGray'] }
        ];
        const aTexts: any = [aHeaderList];

        if (this.aRefundItems?.length) {
            this.aRefundItems.forEach((item: any) => {
                let itemDescription = item.nQuantity;
                if (item.sComment) {
                    itemDescription += 'x' + item.sComment;
                }
                aTexts.push([
                    { text: itemDescription, style: 'td' },
                    { text: item.nPriceIncVat, style: 'td' },
                    { text: item.nVatRate, style: 'td' },
                    { text: item.nTotal, style: 'td' },
                ]);

            });
        } else {
            aTexts.push([
                { text: this.translateService.instant('NO_RECORDS_FOUND'), colSpan: 4, style: ['td', 'center'] }, 
                {}, 
                {}, 
                {}, 
            ]);
        }
        this.addTableToContent(aTexts, this.styles.horizontalLinesSlim);
    }

    addTableToContent(aTexts:any, layout:any, widths:any = '*'){
        const data = {
            table: {
                headerRows: 1,
                widths: widths,
                body: aTexts,
                dontBreakRows: true,
                keepWithHeaderRows: true
            },
            layout: layout
        };
        this.content.push(data);
    }

    addDiscountToPdf() {
        this.addTableHeading('DISCOUNT(S)');

        const aHeaderList = [
            { text: this.translateService.instant('PRODUCT_NAME'),style: ['th', 'bgGray']}, 
            { text: this.translateService.instant('QUANTITY'),style: ['th', 'bgGray']}, 
            { text: this.translateService.instant('DISCOUNT'),style: ['th', 'bgGray']}, 
            { text: this.translateService.instant('PRICE'),style: ['th', 'bgGray']}, 
            { text: this.translateService.instant('TAX'),style: ['th', 'bgGray']},
        ];

        const aTexts: any = [aHeaderList];

        if (this.aDiscountItems?.length) {
            this.aDiscountItems.forEach((item: any) => {
                aTexts.push([
                    { text: item.sProductName, style: 'td' },
                    { text: item.nQuantity, style: 'td' },
                    { text: item.nDiscount, style: 'td' },
                    { text: item.nPriceIncVat, style: 'td' },
                    { text: item.nVatRate, style: 'td' },
                ]);    
            });
            
        } else {

            aTexts.push([
                { text: this.translateService.instant('NO_RECORDS_FOUND'), colSpan: 5 , style: ['td', 'center'] }, 
                {}, 
                {}, 
                {}, 
                {}
            ]);
        }

        this.addTableToContent(aTexts, this.styles.horizontalLinesSlim);
    }

    addRepairsToPdf() {
        this.addTableHeading('REPAIR(S)');
        const aHeaders = ['PRODUCT_NAME', 'COMMENT', 'QUANTITY', 'EMPLOYEE', 'TOTAL']
        const aHeaderList: any = [];
        aHeaders.forEach((el: any) => aHeaderList.push({ text: this.translateService.instant(el), style: ['th', 'bgGray'] }))
        const aTexts: any = [aHeaderList];

        if (this.aRepairItems?.length) {
            this.aRepairItems.forEach((item: any) => {
                aTexts.push([
                    { text: item.sProductName, style: 'td' },
                    { text: item.sCommentVisibleCustomer, style: 'td' },
                    { text: item.nQuantity, style: 'td' },
                    { text: item.sEmployeeName, style: 'td' },
                    { text: item.nTotalAmount, style: 'td' },
                ]);
            });
            
        } else {
            aTexts.push([
                { text: this.translateService.instant('NO_RECORDS_FOUND'), colSpan: 5, style: ['td', 'center'] },
                {},
                {},
                {},
                {},
            ],
            );
        }

        this.addTableToContent(aTexts, this.styles.horizontalLinesSlim);
    }

    addGiftcardsToPdf() {
        this.addTableHeading('GIFTCARD(S)');
        const aHeaders = ['GIFT_CARD_NUMBER','COMMENT','QUANTITY','EMPLOYEE','TOTAL'];
        const aHeaderList: any = [];
        aHeaders.forEach((el: any) => aHeaderList.push({ text: this.translateService.instant(el), style: ['th', 'bgGray'] }))
        const aTexts: any = [aHeaderList];

        if (this.aGiftItems?.length) {
            this.aGiftItems.forEach((item: any) => {
                aTexts.push([
                    { text: item.sGiftCardNumber, style: ['td', 'center'] },
                    { text: item.sCommentVisibleCustomer, style: ['td', 'center'] },
                    { text: item.nQuantity, style: ['td', 'center'] },
                    { text: item.sEmployeeName, style: ['td', 'center'] },
                    { text: item.nTotalAmount, style: ['td', 'center'] },
                ]);
            });
        } else {
            aTexts.push([
                { text: this.translateService.instant('NO_RECORD_FOUND'), colSpan: 5, style: ['td', 'center'] },
                {},
                {},
                {},
                {},
            ]);
        }

        this.addTableToContent(aTexts, this.styles.horizontalLinesSlim);
    }

    addGoldPurchasesToPdf() {
        this.content.push({
            text: this.translateService.instant('GOLD_PURCHASE(S)'),
            style: ['left', 'normal'],
            margin: [0, 30, 0, 10],
        });
        const widths = [100, 70, 50, 50, 50, '*', 80];
        const aHeaders = [
            this.translateService.instant('NUMBER'),
            this.translateService.instant('DATE'),
            this.translateService.instant('QUANTITY'),
            this.translateService.instant('PRICE'),
            this.translateService.instant('TOTAL'),
            this.translateService.instant('PAYMENT_TRANSACTION_NUMBER'),
            this.translateService.instant('PAYMENT_TYPE'),
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
                    body: [[{ text:this.translateService.instant('NO_RECORDS_FOUND'), colSpan: 7, alignment: 'center', style: ['td'] }, {}, {}, {}, {}, {}, {},],],
                },
                layout: {
                    hLineWidth: function (i: any) {
                        return i === 0 ? 0 : 1;
                    },
                },
            });
        }
    }

    processPdfByRevenuePerBusinessPartner(columnWidths: any,aStatistic:any) {
        let arr: Array<any> = [];
        const header: Array<any> = [
           this.translateService.instant('SUPPLIER'),
           this.translateService.instant('QUANTITY'),
           this.translateService.instant('PRICE_INCL_VAT'),
           this.translateService.instant('PURCHASE_PRICE'),
           this.translateService.instant('GROSS_PROFIT')
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
                layout: this.styles.tableLayout,
            };
            this.content.push(data);
            singleRecord.aArticleGroups.forEach((articleGroup: any) => {
                let texts: any = [
                    { text: articleGroup.sName, style: ['td', 'bgGray'] },
                    { text: articleGroup.nQuantity, style: ['td', 'bgGray'] },
                    { text: articleGroup.nTotalRevenue, style: ['td', 'bgGray'] },
                    {
                        text: articleGroup.nTotalPurchaseAmount,
                        style: ['td', 'bgGray'],
                    },
                    { text: articleGroup.nProfit, style: ['td', 'bgGray'] },
                    // { text: articleGroup.nMargin, style: ['td', 'bgGray'] },
                ];
                const data = {
                    table: {
                        headerRows: 0,
                        widths: columnWidths,
                        body: [texts],
                    },
                    layout: this.styles.tableLayout,
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
                        layout: this.styles.tableLayout,
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
            layout: this.styles.tableLayout,
        });
        this.pushSeparatorLine();
        this.content.push({
            table: {
                widths: columnWidths,
                body: [texts],
            },
            layout: this.styles.tableLayout,
        });
        this.pushSeparatorLine();
    }

    processPdfByRevenuePerArticleGroupAndProperty(columnWidths: any,aStatistic:any) {
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
                { text: singleRecord.sName, style: ['td', 'bgGray'] },
                { text: singleRecord.nQuantity, style: ['td', 'bgGray'] },
                { text: singleRecord.nTotalRevenue, style: ['td', 'bgGray'] },
                {
                    text: singleRecord.nTotalPurchaseAmount,
                    style: ['td', 'bgGray'],
                },
                { text: singleRecord.nProfit, style: ['td', 'bgGray'] },
                // { text: singleRecord.nMargin, style: ['td', 'bgGray'] },
            ];
            const data = {
                table: {
                    headerRows: 1,
                    widths: columnWidths,
                    heights: [30],
                    body: [texts],
                },
                layout: this.styles.tableLayout,
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
                    layout: this.styles.tableLayout,
                };
                this.content.push(data);
            });
        });
    }

    processPdfByRevenuePerSupplierAndArticleGroup(columnWidths: any,aStatistic: any) {
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
                layout: this.styles.tableLayout,
            };
            this.content.push(data);
            singleRecord.aArticleGroups.forEach((articleGroup: any) => {
                let texts: any = [
                    { text: articleGroup.sName, style: ['td', 'bgGray'] },
                    { text: articleGroup.nQuantity, style: ['td', 'bgGray'] },
                    { text: articleGroup.nTotalRevenue, style: ['td', 'bgGray'] },
                    {
                        text: articleGroup.nTotalPurchaseAmount,
                        style: ['td', 'bgGray'],
                    },
                    { text: articleGroup.nProfit, style: ['td', 'bgGray'] },
                    // { text: articleGroup.nMargin, style: ['td', 'bgGray'] },
                ];
                const data = {
                    table: {
                        headerRows: 0,
                        widths: columnWidths,
                        body: [texts],
                    },
                    layout: this.styles.tableLayout,
                };
                this.content.push(data);
            });
        });
    }

    processPdfByRevenuePerProperty(columnWidths: any,aStatistic: any) {
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
                layout: this.styles.tableLayout,
            };
            this.content.push(data);
        });
    }

    processPdfByRevenuePerArticleGroup(columnWidths: any,aStatistic: any) {
        let arr: Array<any> = [];

        const tableHeaders = [
            this.translateService.instant('ARTICLE'),
            this.translateService.instant('QUANTITY'),
            this.translateService.instant('PRICE_WITH_VAT'),
            this.translateService.instant('PURCHASE_PRICE_EX_VAT'),
            this.translateService.instant('GROSS_PROFIT'),
        ];

        const tableHeadersList: any = [];
        tableHeaders.forEach((header: any, index:number) => {
            tableHeadersList.push({
                text: header,
                style: ['th', 'bgGray'],
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
            { text: this.translateService.instant('TOTAL'), style: ['td', 'bold','bgGray'] },
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
                layout: this.styles.tableLayout,
            });
    }

    fetchTransactionItems(oFilterDates: any, bIsArticleGroupLevel: boolean, bIsSupplierMode:boolean){
        let data = {
            iTransactionId: 'all',
            sFrom:'turnover-group',
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
        const nNum = val; 
        if (val % 1 === 0) {
            //no decimals
            return (val) ? ((val < 0) ? String('-' + this.currency + Math.abs(val) + ',00') : String(this.currency + val + ',00')) : this.currency + '0,00';
        } else {
            val = String(val);
            let parts = val.split('.');
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
                    });
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

    prepareEmployeeList(aEmployee:any){
        // console.log('prepareEmployeeList', aEmployee);
        aEmployee.forEach((e:any) => this.oEmployee[e._id] = (String(e.sFirstName[0] + e.sLastName[0])).toUpperCase())
        // console.log(this.oEmployee);

    }
}