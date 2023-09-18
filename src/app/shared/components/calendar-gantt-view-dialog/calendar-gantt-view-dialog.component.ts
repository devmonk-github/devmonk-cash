import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { DialogComponent } from "../../service/dialog";

/* Range-wise calendar depedency */
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-calendar-gantt-view-dialog',
  templateUrl: './calendar-gantt-view-dialog.component.html',
  styleUrls: ['./calendar-gantt-view-dialog.component.sass']
})
export class CalendarGanttViewDialogComponent implements OnInit {
  dialogRef: DialogComponent;
  faTimes = faTimes;

  aCalendarEvent: any;
  calendarOptions: CalendarOptions = {
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],
    // weekends: true,
    events: [ // An array of events to display on the calendar
      // {
      //   abc: 'Event 1',
      //   SStart: '2023-09-15T10:00:00',
      //   enddd: '2023-09-18T12:00:00',
      // },
      // {
      //   title: 'Event 2',
      //   start: '2023-09-14T14:00:00',
      //   end: '2023-09-17T16:00:00',
      // },
    ],
    eventClick: this.handleEventClick.bind(this),
  };

  constructor(
    private viewContainerRef: ViewContainerRef,
  ) {
    const _injector = this.viewContainerRef.parentInjector
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit(): void {
    if (this.aCalendarEvent?.length) this.calendarOptions.events = this.aCalendarEvent;
  }

  handleEventClick(info: any): void {
    const oData = info.event; /* title, start, end, extendedProps.customProperty */
    this.close({ isChosen: true, oData });
  }

  close(oData?: any): void {
    this.dialogRef.close.emit(oData)
  }
}
