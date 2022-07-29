import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/shared/service/api.service';

@Component({
  selector: 'app-day-closures',
  templateUrl: './day-closures.component.html',
  styleUrls: ['./day-closures.component.sass']
})
export class DayClosuresComponent implements OnInit, OnDestroy {

  showLoader: boolean = false;
  aDayClosure: any = [];
  iBusinessId: any = '';

  iLocationId: any = '';
  aLocation: any = [];
  aSelectedLocation: any;

  iWorkstationId: any;
  aWorkStation: any = [];
  oSelectedWorkStation: any;

  oUser: any = {};

  listBusinessSubscription !: Subscription;
  workstationListSubscription !: Subscription;
  dayClosureListSubscription !: Subscription;

  constructor(private apiService: ApiService) {
    this.iBusinessId = localStorage.getItem('currentBusiness') || '';
    this.iLocationId = localStorage.getItem('currentLocation') || '';
    this.iWorkstationId = localStorage.getItem('currentWorkstation');

    const _oUser = localStorage.getItem('currentUser');
    if (_oUser) this.oUser = JSON.parse(_oUser);
  }

  ngOnInit(): void {
    this.fetchDayClosureList();
    this.fetchBusinessLocation();
    this.getWorkstations();
  }

  fetchBusinessLocation() {
    if (!this.oUser?.userId) return;
    this.listBusinessSubscription = this.apiService.postNew('core', `/api/v1/business/${this.iBusinessId}/list-location`, { iBusinessId: this.iBusinessId }).subscribe((result: any) => {
      if (result?.data?.aLocation?.length) this.aLocation = result.data.aLocation;
    }, (error) => {
      console.log('error: ', error);
    })
  }

  getWorkstations() {
    this.workstationListSubscription = this.apiService.getNew('cashregistry', '/api/v1/workstations/list/' + this.iBusinessId).subscribe(
      (result: any) => {
        if (result && result.data?.length) this.aWorkStation = result.data;
        console.log('getWorkstations called: ', this.aWorkStation);
      }),
      (error: any) => {
        console.error(error)
      }
  }

  fetchDayClosureList() {
    this.aDayClosure = [];
    this.showLoader = true;
    const oBody = {
      iBusinessId: this.iBusinessId,
      oFilter: {
        iLocationId: this.iLocationId,
        aLocationId: this?.aSelectedLocation?.length ? this.aSelectedLocation : [],
        iWorkstationId: this.oSelectedWorkStation?._id,
      },
    }
    this.dayClosureListSubscription = this.apiService.postNew('cashregistry', `/api/v1/statistics/day-closure/list`, oBody).subscribe((result: any) => {
      if (result?.data?.length) this.aDayClosure = result.data;
      this.showLoader = false;
    }, (error) => {
      console.log('error: ', error);
      this.showLoader = false;
    })
  }

  ngOnDestroy(): void {
    if (this.listBusinessSubscription) this.listBusinessSubscription.unsubscribe();
    if (this.workstationListSubscription) this.workstationListSubscription.unsubscribe();
    if (this.dayClosureListSubscription) this.dayClosureListSubscription.unsubscribe();
  }

  // viewStatistics(oDayClosure: any) {
  //   console.log('viewStatistics called: ', oDayClosure);
  // }
}
