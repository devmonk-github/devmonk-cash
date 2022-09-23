import { Component, OnInit } from '@angular/core';
import { faRefresh, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { LabelTemplateModelComponent } from 'src/app/print-settings/label-template-model/label-template-model.component';
import { ApiService } from 'src/app/shared/service/api.service';
import { PrintSettingsDetailsComponent } from '../shared/components/print-settings-details/print-settings-details.component';
import { DialogService } from '../shared/service/dialog';

@Component({
  selector: 'app-print-settings',
  templateUrl: './print-settings.component.html',
  styleUrls: ['./print-settings.component.sass']
})
export class PrintSettingsComponent implements OnInit {

  faRefresh = faRefresh;
  faPencilAlt = faPencilAlt;
  loading: boolean = false;
  business: any;
  device: any = {
    name: 'Shubham`s device'
  };
  newLabel: boolean = false;
  newPrinter: boolean = false;
  oldLabelList: Array<any> = [
    'Any'
  ]
  newLabelList: Array<any> = [
    'Any'
  ]
  layouts: Array<any> = [
    'Any'
  ]
  printers: Array<any> = [
    'Any'
  ]
  pageFormats: Array<any> = [
    'Any',
    'Transaction receipt'
  ]
  iBusinessId: string = '';
  iLocationId: string = '';
  isLoadingLabel: boolean = false;
  defaultLabelsData: Array<any> = []
  LabelTemplatesData: Array<any> = []

  constructor(
    private dialogService: DialogService,
    // private toastService: ToastService,
    private apiService: ApiService,

  ) { }

  ngOnInit(): void {
    this.iBusinessId = localStorage.getItem('currentBusiness') || '';
    this.iLocationId = localStorage.getItem('currentLocation') || '';
    this.getLabelTemplate()
  }

  createPrintSettings() {
    this.dialogService.openModal(PrintSettingsDetailsComponent, { cssClass: "modal-xl", context: { mode: 'create' } }).instance.close.subscribe(result => { });
  }

  trackByFun(index: any, item: any) {
    return index;
  }


  addDefaultLabelTemplate() {
    const oBody = {
      "iBusinessId": this.iBusinessId,
      "iLocationId": this.iLocationId,
      "template": {
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
            "type": "rectangle",
            "x": "1",
            "y": "1",
            "width": "140",
            "height": "64"
          },
          {
            "type": "rectangle",
            "x": "140",
            "y": "1",
            "width": "140",
            "height": "64"
          },
          {
            "type": "barcode",
            "x": "8",
            "y": "8",
            "height": "15",
            "visible": true,
            "pnfield": "%%ARTICLE_NUMBER%%"
          },
          {
            "type": "scalabletext",
            "charwidth": 22,
            "charheight": 22,
            "x": "8",
            "y": "26",
            "euro_prefix": true,
            "pnfield": " %%SELLING_PRICE%%"
          },
          {
            "type": "scalabletext",
            "charwidth": 16,
            "charheight": 16,
            "x": "8",
            "y": "47",
            "pnfield": "%%ARTICLE_NUMBER%%"
          },
          {
            "type": "scalabletext",
            "charwidth": 16,
            "charheight": 16,
            "x": "148",
            "y": "8",
            "pnfield": "%%PRODUCT_NUMBER%%"
          },
          {
            "type": "scalabletext",
            "charwidth": 16,
            "charheight": 16,
            "x": "148",
            "y": "22",
            "blockwidth": 166,
            "blocklines": 2,
            "pnfield": "Dit is een beschrijving met twee"
          },
          {
            "type": "scalabletext",
            "charwidth": 16,
            "charheight": 16,
            "x": "148",
            "y": "53",
            "pnfield": "%%BRAND_NAME%%"
          }
        ],
        "height": 12,
        "labelleft": -12,
        "labeltop": 16,
        "layout_name": "LAYOUT3",
        "name": "Kader 69mm (34 869IR)",
        "offsetleft": 0,
        "offsettop": 0,
        "width": 71
      }
    }
    return new Promise(resolve => {

      this.apiService.postNew('cashregistry', `/api/v1/label/templates/create`, oBody).subscribe((result: any) => {
        console.log(result);
        // this.toastService.show({ type: 'success', text: 'Item added' });
        resolve(result);
      }, (error) => {
        resolve(error);
        console.log('error: ', error);
        // this.toastService.show({ type: 'warning', text: 'Something went wrong' });
      })
    })
  }

  async getLabelTemplate(): Promise<any[]> {
    // await this.postLabelTemplate()
    return new Promise((resolve, reject) => {
      this.isLoadingLabel = true
      this.apiService.getNew('cashregistry', `/api/v1/label/templates/${this.iBusinessId}`).subscribe((result: any) => {
        console.log({ LabelTemplates: result })
        this.defaultLabelsData = result.data.filter((lable: any) => lable.readOnly)
        this.LabelTemplatesData = result.data.filter((lable: any) => !lable.readOnly)
        this.isLoadingLabel = false

        resolve(result.data)
      }, (error) => {
        this.isLoadingLabel = false

        console.log('error: ', error);
        resolve(error)
      })
    });
  }

  openLabelTemplateModal() {
    this.dialogService.openModal(LabelTemplateModelComponent, {
      cssClass: "modal-xl w-100"
    })
  }

}
