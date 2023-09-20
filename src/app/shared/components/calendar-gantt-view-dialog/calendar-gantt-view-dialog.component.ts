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
  aSelectedWorkStation: any = [];
  aSelectedLocation: any = [];

  aCalendarEvent: any;
  oCalendarSelectedData: any;
  eType: string; /* from-state or to-state */
  calendarOptions: any = {
    headerToolbar: {
      left: 'prev,today,next',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    // eventContent: function () {
    //   return {
    //     html: '<button>' + 'BUTTON CUSTOM' + '</button>', // Custom HTML content
    //     // classNames: ['custom-event'], // Custom CSS class
    //   };
    // },
    // customButtons: {
    //   customButton: {
    //     text: 'Custom Button', // Button text
    //     click: function () {
    //       // Custom action when the button is clicked
    //     },
    //   },
    // },
    validRange: {
      end: new Date()
    },
    initialView: 'dayGridMonth',
    firstDay: 1,
    plugins: [dayGridPlugin],
    // weekends: true,
    events: [],
    eventClick: this.handleEventClick.bind(this),
  };

  constructor(
    private viewContainerRef: ViewContainerRef,
  ) {
    const _injector = this.viewContainerRef.parentInjector
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit(): void {
    // console.log('before validRange: ', this.calendarOptions.validRange);
    if (this.aCalendarEvent?.length) this.processingTheEvent();
    // console.log('after validRange: ', this.calendarOptions.validRange);
    // if (this.oCalendarSelectedData?.dOpenDate) this.calendarOptions.validRange.start = this.oCalendarSelectedData?.dOpenDate;
    // this.calendarOptions.validRange.end = this.oCalendarSelectedData?.dCloseDate || new Date();
  }

  getRandomColor() {
    const randomIndex = Math.floor(Math.random() * aColorCode.length);
    return aColorCode[randomIndex];
  }

  processingTheEvent(__aCalendarEvent?: any) {
    // console.log('processingTheEvent: ', __aCalendarEvent);
    const _aCalendarEvent = __aCalendarEvent ? __aCalendarEvent : JSON.parse(JSON.stringify(this.aCalendarEvent));

    /* FROM-STATE */
    if (this.eType === 'FROM_STATE') {
      this.calendarOptions.validRange.start = undefined;
      if (this.oCalendarSelectedData.dCloseDate) this.calendarOptions.validRange.end = this.oCalendarSelectedData.dCloseDate;

      this.calendarOptions.events = _aCalendarEvent?.filter((oEvent: any) => oEvent?.start)?.map((oEvent: any) => {
        const dOpenDate = oEvent.customProperty?.oDayClosure?.dOpenDate;
        oEvent.backgroundColor = this.getRandomColor();
        oEvent.textColor = '#FFFFFF';
        oEvent.title = `${oEvent.title} (${(moment(dOpenDate).format('DD-MM-yyyy hh:mm'))})`
        return oEvent;
      })
    } else {
      /* TO_STATE */

      this.calendarOptions.validRange.end = new Date();
      if (this.oCalendarSelectedData.dOpenDate) this.calendarOptions.validRange.start = this.oCalendarSelectedData.dOpenDate;

      this.calendarOptions.events = _aCalendarEvent?.filter((oEvent: any) => oEvent?.end)?.map((oEvent: any) => {
        const dCloseDate = oEvent.customProperty?.oDayClosure?.dCloseDate;
        oEvent.backgroundColor = this.getRandomColor();
        oEvent.textColor = '#FFFFFF';
        oEvent.title = `${oEvent.title} (${(moment(dCloseDate).format('DD-MM-yyyy hh:mm'))})`
        return oEvent;
      })
    }

  }

  handleEventClick(info: any): void {
    const oData = info.event; /* title, start, end, extendedProps.customProperty */
    this.close({ isChosen: true, oData });
  }

  onChangeDropdown(eType: string) {
    let _aCalendarEvent = JSON.parse(JSON.stringify(this.aCalendarEvent))
    // console.log('Total length: ', _aCalendarEvent?.length);
    if (this.aSelectedWorkStation?.length) _aCalendarEvent = _aCalendarEvent.filter((oEvent: any) => this.aSelectedWorkStation.includes(oEvent?.customProperty?.oDayClosure?.iWorkstationId?.toString()))
    // console.log('After workstation selection: ', _aCalendarEvent?.length);
    if (this.aSelectedLocation?.length) _aCalendarEvent = _aCalendarEvent.filter((oEvent: any) => this.aSelectedLocation.includes(oEvent?.customProperty?.oDayClosure?.iLocationId?.toString()))
    // console.log('after location selection: ', _aCalendarEvent?.length);
    this.processingTheEvent(_aCalendarEvent);

    // if (eType === 'workstation' && !this.aSelectedLocation?.length) {
    //   console.log('workstation: ', _aCalendarEvent, this.aSelectedWorkStation);


    // } else if (eType == 'location' && !this.aSelectedWorkStation?.length) {

    //   // console.log('location: ', _aCalendarEvent, this.aSelectedLocation);
    // }
  }

  close(oData?: any): void {
    this.dialogRef.close.emit(oData)
  }
}
