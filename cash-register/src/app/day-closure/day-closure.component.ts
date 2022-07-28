import { Subscription } from 'rxjs';
import { Component, OnInit, HostListener, ViewChild, OnDestroy } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { ToastService } from '../shared/components/toast/toast.service';



@Component({
  selector: 'app-day-closure',
  templateUrl: './day-closure.component.html',
  styleUrls: ['./day-closure.component.sass']
})
export class DayClosureComponent implements OnInit, OnDestroy {

  iBusinessId: any;
  iLocationId: any;
  iWorkstationId: any;
  closingDayState: boolean = false;
  closeSubscription !: Subscription;
  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) { }


  @ViewChild('adminFrame') iframe: any;

  @HostListener('window:message', ['$event'])
  onMessage(e: any) {
    if (e.data && e.data.for == 'frame loaded') {
      setTimeout(() => {
        this.onFrameLoad();
      }, 500);
    }
  }

  ngOnInit(): void {
    this.iBusinessId = localStorage.getItem('currentBusiness');
    this.iLocationId = localStorage.getItem('currentLocation');
    this.iWorkstationId = localStorage.getItem('currentWorkstation');
    // this.closeDayState();
  }

  onFrameLoad(): void {
    if (this.iframe == null) return;
    let iWindow = this.iframe.nativeElement.contentWindow;
    if (iWindow == null) return;
    iWindow.postMessage({ "parentOrigin": window.location.origin }, 'http://localhost:4002');
  }

  closeDayState(event?: any) {
    const oBody = {
      iBusinessId: this.iBusinessId,
      iLocationId: this.iLocationId,
      iWorkstationId: this.iWorkstationId
    }
    this.closingDayState = true;
    if (event) event.target.disabled = true;
    this.closeSubscription = this.apiService.postNew('cashregistry', `/api/v1/statistics/close/day-state`, oBody).subscribe((result: any) => {
      this.toastService.show({ type: 'success', text: `Day-state is close now` });
      this.closingDayState = false;
      if (event) event.target.disabled = false;
    }, (error) => {
      console.log('Error: ', error);
      this.toastService.show({ type: 'warning', text: 'Something went wrong or open the day-state first' });
      this.closingDayState = false;
      if (event) event.target.disabled = false;
    })
  }

  ngOnDestroy(): void {
    if (this.closeSubscription) this.closeSubscription.unsubscribe();

  }
}
