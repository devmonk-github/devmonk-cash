import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class CommonPrintSettingsService {
    oCommonParameters: any = {
        pageSize: 'A5',
        orientation: 'portrait',
        pageMargins: [10, 0, 0, 100],
        defaultStyle: {
            fontSize: 10
        }
    };
    pdfTitle !: string;
    footer: any = {};

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
                    this.oCommonParameters[param.sParameter] = (param.value === 'custom') ? { width: param.nWidth, height: param.nHeight } : param.value;
                    break;
                case 'pageMargins':
                    this.oCommonParameters[param.sParameter] = param.aValues;
                    break;
            }
        });
    }
}