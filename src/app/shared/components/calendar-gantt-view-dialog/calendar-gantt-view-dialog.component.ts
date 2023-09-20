import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { DialogComponent } from "../../service/dialog";

/* Range-wise calendar depedency */
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import * as _moment from 'moment';
const moment = (_moment as any).default ? (_moment as any).default : _moment;

const aColorCode = [
  '#FF5733', // Red
  '#33FF57', // Green
  '#3366FF', // Blue
  '#FF33E9', // Pink
  '#FF9933', // Orange
];

@Component({
  selector: 'app-calendar-gantt-view-dialog',
  templateUrl: './calendar-gantt-view-dialog.component.html',
  styleUrls: ['./calendar-gantt-view-dialog.component.sass']
})
export class CalendarGanttViewDialogComponent implements OnInit {
  dialogRef: DialogComponent;
  faTimes = faTimes;
  aWorkStation: any;
  aLocation: any;
  selectedWorkStation: any;
  aSelectedLocation: any;
  sDayClosureMethod: string;

  aCalendarEvent: any;
  oCalendarSelectedData: any;
  eType: string; /* from-state or to-state */
  calendarOptions: any = {
    headerToolbar: {
      left: 'prev,today,next',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    validRange: {
      end: new Date()
    },
    initialView: 'dayGridMonth',
    firstDay: 1,
    plugins: [dayGridPlugin],
    events: [],
    displayEventTime: false,
    // eventTimeFormat: { // like '14:30:00'
    //   hour: '2-digit',
    //   minute: '2-digit',
    //   second: '2-digit',
    //   hour12: false
    // },
    eventClick: this.handleEventClick.bind(this),
  };

  constructor(
    private viewContainerRef: ViewContainerRef,
  ) {
    const _injector = this.viewContainerRef.parentInjector
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit(): void {
    let nColorIndex = 0;
    const aArray = this.sDayClosureMethod == 'workstation' ? this.aWorkStation : this.aLocation;
    aArray.map((oElement: any) => {
      const sColor = aColorCode[nColorIndex];
      nColorIndex = (nColorIndex + 1) % aColorCode.length;
      oElement.backgroundColor = sColor
      return;
    })
    if (this.aCalendarEvent?.length) this.processingTheEvent();
  }

  getRandomColor() {
    const randomIndex = Math.floor(Math.random() * aColorCode.length);
    return aColorCode[randomIndex];
  }

  processingTheEvent(__aCalendarEvent?: any) {
    const _aCalendarEvent = __aCalendarEvent ? __aCalendarEvent : JSON.parse(JSON.stringify(this.aCalendarEvent));
    // const _sDayClosureMethod = this.sDayClosureMethod || 'workstation';
    const aArray = this.sDayClosureMethod == 'workstation' ? this.aWorkStation : this.aLocation;
    /* FROM-STATE */
    if (this.eType === 'FROM_STATE') {
      this.calendarOptions.validRange.start = undefined;
      if (this.oCalendarSelectedData.dCloseDate) this.calendarOptions.validRange.end = this.oCalendarSelectedData.dCloseDate;

      this.calendarOptions.events = _aCalendarEvent?.filter((oEvent: any) => oEvent?.start)?.map((oEvent: any) => {
        const dOpenDate = oEvent.customProperty?.oDayClosure?.dOpenDate;
        let iId = oEvent.customProperty?.oDayClosure?.iWorkstationId
        if (this.sDayClosureMethod != 'workstation') iId = oEvent.customProperty?.oDayClosure?.iLocationId;
        oEvent.backgroundColor = (aArray.find((oElement: any) => oElement._id == iId))?.backgroundColor || this.getRandomColor();
        oEvent.title = `${oEvent.title} (${(moment(dOpenDate).format('DD-MM-yyyy HH:mm'))})`
        return oEvent;
      })
    } else {
      /* TO_STATE */

      this.calendarOptions.validRange.end = new Date();
      if (this.oCalendarSelectedData.dOpenDate) this.calendarOptions.validRange.start = this.oCalendarSelectedData.dOpenDate;

      this.calendarOptions.events = _aCalendarEvent?.filter((oEvent: any) => oEvent?.end)?.map((oEvent: any) => {
        const dCloseDate = oEvent.customProperty?.oDayClosure?.dCloseDate;
        // oEvent.backgroundColor = this.getRandomColor();
        oEvent.backgroundColor = (this.aWorkStation.find((oWorkstation: any) => oWorkstation._id == oEvent.customProperty?.oDayClosure?.iWorkstationId))?.backgroundColor || this.getRandomColor();
        oEvent.title = `${oEvent.title} (${(moment(dCloseDate).format('DD-MM-yyyy hh:mm'))})`
        return oEvent;
      })
    }

  }

  handleEventClick(info: any): void {
    const oData = info.event; /* title, start, end, extendedProps.customProperty */
    oData.selectedWorkStation = this.selectedWorkStation;
    oData.aSelectedLocation = this.aSelectedLocation;
    this.close({ isChosen: true, oData });
  }

  onChangeDropdown(eType: string) {
    let _aCalendarEvent = JSON.parse(JSON.stringify(this.aCalendarEvent))
    if (this.selectedWorkStation?.length) _aCalendarEvent = _aCalendarEvent.filter((oEvent: any) => this.selectedWorkStation.includes(oEvent?.customProperty?.oDayClosure?.iWorkstationId?.toString()))
    if (this.aSelectedLocation?.length) _aCalendarEvent = _aCalendarEvent.filter((oEvent: any) => this.aSelectedLocation.includes(oEvent?.customProperty?.oDayClosure?.iLocationId?.toString()))
    this.processingTheEvent(_aCalendarEvent);
  }

  close(oData?: any): void {
    this.dialogRef.close.emit(oData)
  }
}
