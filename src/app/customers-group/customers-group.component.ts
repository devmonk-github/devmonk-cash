import { Component, OnInit } from '@angular/core';
import { faSearch , faTrash , faEdit} from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../shared/service/api.service';
import { DialogService } from '../shared/service/dialog';
import { CustomerGroupDetailComponent } from '../shared/components/customer-group-detail/customer-group-detail.component';

@Component({
  selector: 'app-customers-group',
  templateUrl: './customers-group.component.html',
  styleUrls: ['./customers-group.component.sass']
})
export class CustomersGroupComponent implements OnInit {

  faSearch = faSearch;
  faTrash = faTrash;
  faEdit = faEdit;
  headerColumn:any =['NAME' , 'DESCRIPTION'];
  iBusinessId:any;
  iLocationId:any;
  showLoader:Boolean = false;
  requestParams:any={
    skip:0,
    limit:10,
    searchValue:'',
    sortBy:'',
    sortOrder:'desc'
  }
  groupList:any=[];
  pageCounts: Array<number> = [10, 25, 50, 100]
  pageNumber: number = 1;
  setPaginateSize: number = 10;
  paginationConfig: any = {
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  };


  constructor(private apiService:ApiService,
    private dialogService:DialogService
    ) { }

  ngOnInit(): void {
    this.iBusinessId = localStorage.getItem('currentBusiness');
    this.iLocationId = localStorage.getItem('currentLocation');
    this.getCustomersGroupList();
  }

  getCustomersGroupList(){
    this.showLoader=true;
    this.groupList=[];
    this.requestParams.iBusinessId = this.iBusinessId;
    this.requestParams.iLocationId = this.iLocationId;
    this.apiService.postNew('customer' , '/api/v1/group/list' , this.requestParams).subscribe((res:any)=>{
      this.showLoader=false;
      if(res?.message =='success'){
        if(res?.data?.length) {
          this.paginationConfig.totalItems = res?.data[0]?.count?.totalData;
          this.groupList = res?.data[0]?.result
        }
      }
    })
  }
  changeItemsPerPage(pageCount:any){
    this.paginationConfig.itemsPerPage = pageCount;
    this.requestParams.skip = this.paginationConfig.itemsPerPage * (this.paginationConfig.currentPage - 1);
    this.requestParams.limit = this.paginationConfig.itemsPerPage;
    this.getCustomersGroupList()
  }

  pageChanged(page: any) {
    this.paginationConfig.currentPage = page;
    this.requestParams.skip = this.paginationConfig.itemsPerPage * (page - 1);
    this.requestParams.limit = this.paginationConfig.itemsPerPage;
    this.getCustomersGroupList()
  }

  editCustomersGroup(group:any){
    this.dialogService.openModal(CustomerGroupDetailComponent , { cssClass: "modal-lg", context: { mode: 'update' , customerGroup:group } }).instance.close.subscribe((result:any) => {
     console.log(result);
      // if(result?.action) this.getCustomersGroupList()
    })
  }

  deleteCustomersGroup(index:any){
    console.log("-------------------delete customer ----------------------");
  }
  
  createGroup(){
    this.dialogService.openModal(CustomerGroupDetailComponent , { cssClass: "modal-lg", context: { mode: 'create' } }).instance.close.subscribe((result:any) => {
      if(result?.action) this.getCustomersGroupList()
    })
  }

}
