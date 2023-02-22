import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { TranslateService } from '@ngx-translate/core';
import { DialogComponent } from '../../service/dialog';
import { ToastService } from '../toast';
import { TransactionsPdfService } from '../../service/transactions-pdf.service';

@Component({
  selector: 'app-activity-item-export',
  templateUrl: './activity-item-export.component.html',
  styleUrls: ['./activity-item-export.component.sass']
})
export class ActivityItemExportComponent implements OnInit {

  businessDetails:any;
  headerList: Array<any> = [];
  valuesList: Array<any> = [];
  fieldsToRemove: Array<any> = [];
  downloading: boolean = false;
  faTimes = faTimes;
  requestParams: any = {
    iBusinessId: '',
    iLocationId: '',
    aProjection: []
  }
  page: string = '';

  filterDates: any = {
    endDate: new Date(new Date().setHours(23, 59, 59)),
    startDate: new Date(new Date('01-01-2015').setHours(0, 0, 0))
  }

  dialogRef: DialogComponent;
  translate: any = [];

  constructor(
    private viewContainerRef: ViewContainerRef,
    private toastService: ToastService,
    private translateService: TranslateService,
    private transactionsPdfService: TransactionsPdfService
  ) {
    const _injector = this.viewContainerRef.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit(): void {
    this.requestParams.iBusinessId = localStorage.getItem("currentBusiness");
    this.requestParams.iLocationId = localStorage.getItem('currentLocation');
    const translate = ['NO_DATA_FOUND'];
    this.translateService.get(translate).subscribe((res) => {
      this.translate = res;
    })
  }

  close(flag: Boolean) {
    this.dialogRef.close.emit({ action: false })
  }

   exportToPDF() {
    let customHeader: any = [... this.headerList];
    this.requestParams.aProjection = [];
    for (let index in this.fieldsToRemove) {
      const headerIndex = customHeader.findIndex((customerheader: any) => customerheader.key == this.fieldsToRemove[index].key)
      if (headerIndex > -1) {
        customHeader.splice(headerIndex, 1);
      }
    }
     this.transactionsPdfService.exportToPdf(this.requestParams, customHeader, this.page , this.businessDetails);
    // this.dialogRef.close.emit({ action: false })

  }

  updateExportField(obj: any) {
    let index = this.fieldsToRemove.findIndex((field) => field.value == obj.value);
    if (index > -1) this.fieldsToRemove.splice(index, 1);
    else this.fieldsToRemove.push(obj)
  }
}
