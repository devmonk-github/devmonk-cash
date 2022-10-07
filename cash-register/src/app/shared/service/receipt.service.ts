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
    DIVISON_FACTOR: number = 1;

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
                this.processColumns(item.row, item?.styles);
            } else if (item.type === 'simple') { //parse simple data
                this.processSimpleData(item.row, item?.object);
            } else if (item.type === 'table') { //parse table
                this.content.push(this.processTableData(item));
            } else if (item.type === 'absolute') { //parse table
                this.processAbsoluteData(item.absoluteElements);
            } else if (item.type === 'dashedLine'){
                this.content.push(this.addDashedLine(item.coordinates, item.absolutePosition));
            } else if (item.type === 'textAsTables'){
                this.content.push(this.processTextAsTableData(item));
            }
        }
    }

    processTextAsTableData(item:any){
        const rows = item.rows;
        const layout = item?.layout;
        let tableWidths: any = [];
        let texts: any = [];
        let tables:any = [];
        let nSize = 0;
        rows.forEach((row: any) => {
            // console.log('process row', row);
            if (row?.type === 'dashedLine'){
                this.content.push(this.addDashedLine(row.coordinates, row.absolutePosition));
            } else if(row?.type === 'rect'){
                this.content.push(this.addRect(row.coordinates, row?.absolutePosition));
            } else {

                let text = this.pdfService.replaceVariables(row.html, this.oOriginalDataSource);
                let obj = { text: text };
                if (row?.styles) obj = { ...obj, ...row.styles };
                texts.push(obj);
                tableWidths.push(this.getWidth(row.size));

                nSize += Number(row.size);
                // console.log('size is', nSize);
                if (nSize >= 12) {
                    let data: any = {
                        table: {
                            widths: tableWidths,
                            body: [texts],
                        },
                        layout: (layout) ? this.getLayout(layout) : 'noBorders'
                    };
                    tables.push(data);
                    // console.log('pushing current table', data);
                    tableWidths = [];
                    nSize = 0;
                    texts = [];
                }
            }
            

        });
        if(tableWidths?.length){ //we have table, so push it
            let data: any = {
                table: {
                    widths: tableWidths,
                    body: [texts],
                },
                layout: (layout) ? this.getLayout(layout) : 'noBorders'
            };
            tables.push(data);
        }
        
        // console.log({tables});
        // if (layout) data.layout = this.getLayout(layout);
        return tables;
    }

    getLayout(layout:any){
        return (['noBorders', 'headerLineOnly', 'lightHorizontalLines'].includes(layout)) ? layout : this.commonService.layouts[layout];
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

    processTableData(element:any){
        const rows = element.rows;
        const columns = element.columns;
        const forEach = element.forEach;
        const layout = element.layout;
        const styles = element.styles;
        
        let tableWidths:any = [];
        let tableHeadersList:any = [];
        if(columns){ // parsing columns if present
            // console.log('columns.foreach', columns);
            columns.forEach((column:any)=>{
                // console.log('column: ',column);
                let text = this.pdfService.removeBrackets(column.html);//removes [[ ]] from placeholders
                let obj: any = { text: this.pdfService.translations[text] || text };
                if(column?.styles) {
                    // column.styles.forEach((style:any)=>{
                    //     obj[style] = true;
                    // })
                    obj = { ...obj, ...column.styles};
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
                    let obj = { text: text };
                    if (row?.styles) obj = { ...obj, ...row.styles };
                    dataRow.push(obj);
                    if(!bWidthPushed){
                        tableWidths.push(this.getWidth(row.size));
                    } 
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
                    dataRow.push(img);
                    tableWidths.push(this.getWidth(row.size));
                } else {
                    // console.log(row, this.getWidth(row.size));
                    if (row?.object) currentDataSource = this.oOriginalDataSource[row.object];
                    let text = this.pdfService.replaceVariables(row.html, currentDataSource);
                    let obj = { text: text };
                    if(row?.styles) obj = { ...obj, ...row.styles};
                    dataRow.push(obj);//colSpan: row?.colSpan || 0
                    // console.log('calling getwidth', row)
                    tableWidths.push(this.getWidth(row.size));
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
                // headerRows: 1,
                widths: tableWidths,
                body: finalData,
                dontBreakRows: true,
                // keepWithHeaderRows: 1,
            },
        };
        if (styles) {
            data = { ...data, ...styles };
            // styles.forEach((style: any) => {
            // });
        }
        
        if (layout){
            //pdfmake provides 3 built-in layouts so we can use them directly, otherwise we can use custom layout from common service
            data.layout = (['noBorders', 'headerLineOnly', 'lightHorizontalLines'].includes(layout)) ? data.layout = layout : this.commonService.layouts[layout];
        } 
        // console.log('finalData in content', data);
        return data;
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
                    if (el?.alignment) obj.alignment = el.alignment;
                    if(el?.size) obj.width = this.getWidth(el.size);
                    if (el?.styles) {
                        obj = { ...obj, ...el.styles}
                    }
                    // console.log(obj);
                    this.content.push(obj);
                }
            } else if(el?.type === 'image'){
                let img = this.addImage(el);
                this.content.push(img);
            }
        });
    }

    processColumns(row:any, styles ?:any){
        let columns: any = [];
        row.forEach((el: any) => {
            if (el?.type === 'image') {
                let img = this.addImage(el);
                // console.log(372, img);
                columns.push(img);
            } else if(el?.type === 'dashedLine'){
                columns.push(this.addDashedLine(el.coordinates))
            } else if(el?.type === 'table'){
                columns.push(this.processTableData(el));
            } else if (el?.type === 'textAsTables') {
                this.DIVISON_FACTOR = row.length;
                columns.push(this.processTextAsTableData(el));
                this.DIVISON_FACTOR = 1;
            }
             else {
                let html = el.html || '';
                // console.log(360, html);
                let object = el?.object;
                let text = this.pdfService.replaceVariables(html, (object) ? this.oOriginalDataSource[object] : this.oOriginalDataSource);
                // console.log(362, text);
                let columnData:any = { text: text };
                if(columnData?.alignment) columnData.alignment = el?.alignment;
                if (el?.styles) {
                    columnData = { ...columnData, ...el.styles }
                }
                columns.push(columnData);
            }
        });
        let obj = {columns: columns};
        if (styles) obj = {...obj, ...styles };
        // console.log({obj});
        this.content.push(obj);
    }

    getBase64FromUrl(url: any): Observable<any> {
        return this.apiService.getNew('cashregistry', `/api/v1/pdf/templates/getBase64/${this.iBusinessId}?url=${url}`);
    }

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
        if(el?.styles) img = { ...img, ...el.styles};
        return img;
    }

    addDashedLine(coordinates: any, absolutePosition?:any ,config ?: any){
        let obj:any = {
            canvas: [
                { 
                    type: 'line', 
                    x1: coordinates.x1, y1: coordinates.y1, x2: coordinates.x2, y2: coordinates.y2, 
                    dash: { 
                        length: config?.dashLength || 2, 
                        space: config?.dashSpace || 4
                    }, 
                    lineWidth: config?.lineWidth || 1, 
                    lineColor: config?.lineColor || '#ccc' 
                }
            ]
        };
        if(absolutePosition){
            obj.absolutePosition = absolutePosition;
        }
        return obj;
    }

    addRect(coordinates: any, absolutePosition?:any, config ?:any){
        let obj:any = {
            canvas: [
                {
                    type: 'rect',
                    x: coordinates.x,
                    y: coordinates.y,
                    w: coordinates.w,
                    h: coordinates.h,
                    r: coordinates.r,
                    lineWidth: config?.lineWidth || 1,
                    lineColor: config?.lineColor || '#000',
                }
            ]
        };
        if (absolutePosition) {
            obj.absolutePosition = absolutePosition;
        }
        return obj;
    }

    getWidth(size:any){
        size = size / this.DIVISON_FACTOR;
        return ['auto', '*'].includes(size) ? size : this.commonService.calcColumnWidth(size);
    }

    cleanUp(){
        this.oOriginalDataSource = null;
        this.content = [];
        this.styles = {};
    }
}