import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class CommonPrintSettingsService {
    MM_TO_PT_CONVERSION_FACTOR = 2.837; //convert mm into points

    oCommonParameters: any = {
        pageSize: 'A5',
        orientation: 'portrait',
        pageMargins: [10, 0, 0, 10],
        defaultStyle: {
            fontSize: 10
        }
    };
    pageWidth:number = 0;
    
    pdfTitle !: string;
    footer: any = {};
    pageSizes: any = { // unitis mm
        A4:{
            pageWidth:210,
            pageHeight:297
        },
        A5: {
            pageWidth: 148,
            pageHeight: 210
        }
    };
        }
    };

    mapCommonParams(commonParams: any) {
        commonParams.forEach((param: any) => {
            switch (param.sParameter) {
                case 'orientation':
                    this.oCommonParameters[param.sParameter] = param.value;
                    break;
                case 'fontSize':
                    this.oCommonParameters['defaultStyle'][param.sParameter] = param.value;
                    break;
                case 'pageSize':
                    if (param.value === 'custom'){
                        this.oCommonParameters[param.sParameter] = { width: param.nWidth, height: param.nHeight };
                        this.pageWidth = param.nWidth;
                    } else {
                        this.oCommonParameters[param.sParameter] = param.value;
                        this.pageWidth = this.pageSizes[param.value].pageWidth;
                    }
                    break;
                case 'pageMargins':
                    this.oCommonParameters[param.sParameter] = param.aValues;
                    // console.log(this.oCommonParameters);
                    break;
            }
        });
    }

    calcColumnWidth(size: number): number {
        size = (size === null || size > 12 || size === undefined) ? 12 : size;
        let totalMargin = this.oCommonParameters['pageMargins'][0] + this.oCommonParameters['pageMargins'][2];
        let num = size * ((this.pageWidth * this.MM_TO_PT_CONVERSION_FACTOR - totalMargin) / 12);
        // console.log({ size, width: parseFloat(num.toFixed(2)), totalMargin: totalMargin });
        return parseFloat(num.toFixed(2)) - 9;
    }
}