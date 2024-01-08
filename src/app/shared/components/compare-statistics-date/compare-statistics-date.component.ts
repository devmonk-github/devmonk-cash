import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { DialogComponent } from "../../service/dialog";
import * as moment from 'moment';


@Component({
  selector: 'app-compare-statistics-date',
  templateUrl: './compare-statistics-date.component.html',
  styleUrls: ['./compare-statistics-date.component.scss']
})
export class CompareStatisticsDateComponent implements OnInit {
  dialogRef: DialogComponent
  faTimes = faTimes;
  sDateFormat = "YYYY-MM-DDTHH:mm";
  oData: any;

  constructor(
    private viewContainerRef: ViewContainerRef) {
    const _injector = this.viewContainerRef.parentInjector
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit(): void { }

  /* Dynamic comparision add and remove */

  addRecord() {
    this.oData?.aCompareData.push({ dFromState: "", dToState: "", nTotalQuantity: 0, nTotalRevenue: 0 })
  }

  removeRecord(nIndex: number) {
    this.oData?.aCompareData.splice(nIndex, 1);
  }

  /* Date operation and validation */

  setDefaultTimePart(date: string, isStartTime: boolean): string {
    const selectedDate = new Date(date);
    if (isStartTime) {
      const dDate = moment(new Date(selectedDate).setHours(0, 0, 0)).format(this.sDateFormat);
      return dDate;
    } else {
      const dDate = moment(new Date(selectedDate).setHours(23, 59, 59)).format(this.sDateFormat)
      return dDate;
    }
  }

  isValidDateRange(oCompareData: any): boolean {
    const startDate = new Date(oCompareData.dFromState);
    const endDate = new Date(oCompareData.dToState);
    return startDate < endDate;
  }

  // Check if all date ranges are valid
  isFormValid(): boolean {
    return this.oData.aCompareData.every((oCompareData: any) => this.isValidDateRange(oCompareData));
  }

  close(aCompareData?: any): void {
    this.dialogRef.close.emit(aCompareData);
  }

}
