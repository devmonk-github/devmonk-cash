import { Component, OnInit } from '@angular/core';
import { ApiService } from '../shared/service/api.service';

@Component({
  selector: 'app-workstation',
  templateUrl: './workstation.component.html',
  styleUrls: ['./workstation.component.sass']
})
export class WorkstationComponent implements OnInit {

  addNew: boolean = false;
  workstation: any = {
    sName: '',
    sDescription: ''
  }
  business: any = {};
  loading: boolean = false;
  workstations: Array<any> = [];

  constructor(
    private apiService: ApiService,

  ) { }

  ngOnInit(): void {
    this.business._id = localStorage.getItem('currentBusiness');
    this.getWorkstations();
  }

  createWorkstation(){
    this.workstation.iBusinessId = this.business._id;
    this.loading = true;
    this.addNew = false;
    this.apiService.postNew('cashregistry', '/api/v1/workstations/create', this.workstation).subscribe(
      (result : any) => {
        this.loading = false;
        this.getWorkstations();
      }),
      (error: any) => {
        this.loading = false;
        console.log(error)
      }
  }

  getWorkstations(){
    this.loading = true;
    this.apiService.getNew('cashregistry', '/api/v1/workstations/list/' + this.business._id).subscribe(
      (result : any) => {
       if(result && result.data && result.data[0] && result.data[0].result && result.data[0].result.length){
        this.workstations = result.data[0].result;
       }       
        this.loading = false;
      }),
      (error: any) => {
        this.loading = false;
      }
  }

}
