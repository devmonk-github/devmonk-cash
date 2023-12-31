import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { TemplateJSON, TemplateJSONElement } from '../../print-settings/print-settings.component';
import { ToastService } from '../../shared/components/toast';
import { DialogComponent } from '../../shared/service/dialog';
import { Js2zplService } from '../../shared/service/js2zpl.service';

export const makeDataObjectForProduct = (product: any) => {

  const dataObject = {
    "%%PRODUCT_NAME%%": product?.sProductName,
    "%%SELLING_PRICE%%": product?.nPriceIncVat,
    "%%PRODUCT_NUMBER%%": product?.sProductNumber,
    "%%ARTICLE_NUMBER%%": product?.sArticleNumber,
    "%%BRAND_NAME%%": product?.oBusinessBrand?.sAlias || product?.oBusinessBrand?.sName,
    "%%QUANTITY%%": 1,
    "%%EAN%%": "",
    "%%DIAMONDINFO%%": product?.sDiamondInfo,
    "%%PRODUCT_WEIGHT%%": 12.32,
    "%%DESCRIPTION%%": product?.sComment || product?.sLabelDescription,
    "%%MY_OWN_COLLECTION%%": product?.sArticleGroupName || '',
    "%%TOTALCARATWEIGHT%%": 0.65,
    "%%LAST_DELIVERY_DATE%%": product.dDateLastPurchased,
    "%%SUPPLIER_NAME%%": product.oBusinessPartner?.sBusinessPartnerName,
    "%%SUPPLIER_CODE%%": product.oBusinessPartner?.sBusinessCode,
    "%%SUGGESTED_RETAIL_PRICE%%": "0,00",
    "%%PRODUCT_CATEGORY%%": "",
    "%%PRODUCT_SIZE%%": 30,
    "%%JEWEL_TYPE%%": "",
    "%%JEWEL_MATERIAL%%": "",
  }

  return dataObject

}
@Component({
  selector: 'app-label-template-model',
  templateUrl: './label-template-model.component.html',
  styleUrls: ['./label-template-model.component.scss']
})
export class LabelTemplateModelComponent implements OnInit {
  @ViewChild('jsonEditor') jsonEditor!: any
  dialogRef: DialogComponent;
  faTimes = faTimes;
  mode: 'create' | 'edit' = 'create';
  jsonData = {};
  image = '';
  eType:any;
  iTemplateId:any;

  constructor(private viewContainerRef: ViewContainerRef,
    private toastService: ToastService,
  ) {
    const _injector = this.viewContainerRef.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit() {
    // console.log(this.mode)
  }
  saveLabelTemplate() {
    if(this.eType === 'tspl') {
      this.close({
        ...this.jsonEditor.jsonData, 
        "readOnly": false,
        "nSeqOrder": 1,
      })  
    } else {
        if (this.validateTemplateJson(this.jsonEditor.jsonData)) this.close(this.jsonEditor.jsonData)
    }
  }

  close(data: any) {
    this.dialogRef.close.emit(data);
  }
  validateTemplateJson(jsonData: TemplateJSON) {
    if(this.eType === 'tspl') return true;
    let excluded = ['dCreatedDate', 'dUpdatedDate', '_id', '__v']
    let json: any = {
      "readOnly": false,
      "inverted": false,
      "encoding": 28,
      "media_darkness": 4,
      "media_type": "T",
      "disable_upload": false,
      "can_rotate": true,
      "alternative_price_notation": false,
      "dpmm": 8,
      "elements": [
        {
          "sType": "",
          "x": 1,
          "y": 1,
          "width": 176,
          "height": 79
        },
      ],
      "height": 10,
      "labelleft": 0,
      "labeltop": 0,
      "layout_name": "",
      "name": "",
      "width": 72,
      offsetleft: 0,
      offsettop: 0,
      // iBusinessId: '',
      // iLocationId: '',
      "bDefault": true,
      "nSeqOrder": 1,
    }
    let jsonKeys = Object.keys(json)
    let jsonDataKeys = Object.keys(jsonData).filter(e => {
      return !excluded.includes(e)
    })
    // console.log('jsonKeys', jsonKeys, 'jsonDataKeys',jsonDataKeys);
    let isMissingAnyKey = jsonKeys.sort().join() !== jsonDataKeys.sort().join();
    if (isMissingAnyKey) {
      this.toastService.show({ type: 'warning', text: 'Invalid Json Template' });

      return false
    }
    jsonData.elements.forEach((ele, i) => {
      if (!ele.sType || !ele.x || !ele.y) {
        isMissingAnyKey = true
        this.toastService.show({ type: 'warning', text: 'Invalid Json Template Element ' + (i + 1) });
      }
    })
    return !isMissingAnyKey
  }
  preview() {
    const Product = makeDataObjectForProduct({
      nPriceIncVat: 100,
      nReceivedQuantity: 0,
      sArticleNumber: "00000000000",
      sProductNumber: "PN-12345",
      sComment: "Description",
      dLastDeliveryDate: "01/01/2023",
      sBusinessPartnerName: "Supplier",
      sProductName: 'Name',
      oBusinessBrand: {
        sAlias: 'Brand alias',
        sName: 'Brand name'
      },
      oBusinessPartner: {
        sBusinessCode: 'SCODE',
        sName: 'Supplier Name'
      },
      sArticleGroupName: 'Article group',
      sDiamondInfo: 'Diamond information'
    })
    const JsonTemplate = JSON.parse(JSON.stringify(this.jsonEditor.jsonData));

    JsonTemplate.elements = JsonTemplate.elements.map((template: any, i: number) => {
      JsonTemplate.elements[i]['type'] = template.sType
      return template
    })
    const js2zplService = new Js2zplService(JsonTemplate)

    const zpl = js2zplService.generatePreview(JsonTemplate, Product)
    //  '^XA^XFE:LAYOUT1.ZPL^FN3^FWN^FD000000002^FS^FN4^FH^FWN^FD_E2_82_AC 45600,00^FS^FN5^FWN^FD0000000021^FS^FN6^FWN^FDERIX-SNELTOETS^FS^FN7^FWN^FDIW21233221^FS^FN8^FWN^FDIW21233221^FS^XZ'
    const oBody = {
      zpl: zpl ?? '',
      height: 15,
      width: 50,
      index: 0,
      dpmm: 8
    }

    function convertToInches(mmValue: any) {
      return Number(mmValue / 25.4).toFixed(2);
    }
    const data = oBody.zpl
      .replace(/(\^LH+[0-9]+,)\w+/gm, '^LH0,0')
      .replace(/(\^LS+[0-9])\w+/gm, '^LS0')
      .replace(/(\^LT+[0-9])\w+/gm, '^LT0');
    const widthInches = convertToInches(oBody.width);
    const heightInches = convertToInches(oBody.height);

    this.image = `http://api.labelary.com/v1/printers/${oBody.dpmm.toString()}dpmm/labels/${widthInches}x${heightInches}/0/${encodeURI(data)}`;

  }
}
