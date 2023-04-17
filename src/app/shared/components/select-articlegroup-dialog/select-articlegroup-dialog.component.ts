import { Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
// import * as _ from 'lodash';

import { ApiService } from '../../service/api.service';
import { CreateArticleGroupService } from '../../service/create-article-groups.service';
import { DialogComponent } from "../../service/dialog";
import { ToastService } from '../toast';
@Component({
  selector: 'app-select-articlegroup-dialog',
  templateUrl: './select-articlegroup-dialog.component.html',
  styleUrls: ['./select-articlegroup-dialog.component.scss']
})
export class SelectArticleDialogComponent implements OnInit {
  @Input() customer: any;
  dialogRef: DialogComponent;
  filteredArticleGroups: Array<any> = [];
  filteredSupplierList: Array<any> = [];
  filteredBrandList: Array<any> = [];
  articleGroupsList: Array<any> = [];
  partnersList: Array<any> = [];
  brandsList: Array<any> = [];
  brand: any = null;
  articlegroup: any = null;
  supplier: any = null;
  iBusinessId = localStorage.getItem('currentBusiness');
  selectedLanguage: string;
  iArticleGroupId: any = null;
  iBusinessBrandId: any = null;
  from: any;
  @ViewChild('articleGroupRef') articleGroupRef!: NgSelectComponent
  articleGroupLoading = false;

  constructor(
    private viewContainer: ViewContainerRef,
    private apiService: ApiService,
    private toastrService: ToastService,
    private createArticleGroupService: CreateArticleGroupService) {
    const _injector = this.viewContainer.injector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);

  }

  ngOnInit() {
    // this.fetchArticleGroups(null);
    this.selectedLanguage = localStorage.getItem('language') || 'nl';
    //console.log("this.selectedLanguage", this.selectedLanguage);
    this.fetchBusinessPartners([]);
    this.getBusinessBrands();
  }

  async fetchArticleGroups(iBusinessPartnerId: any, bIsSupplierUpdated:boolean = false) {
    if (!bIsSupplierUpdated) {
      const oDefaultArticle: any = await this.createArticleGroupService.checkArticleGroups(this.from).toPromise();
      // console.log('oDefaultArticle', oDefaultArticle)
      if (oDefaultArticle?.data?.length && oDefaultArticle?.data[0]?.result?.length) {
        this.articlegroup = oDefaultArticle?.data[0]?.result[0];
        // console.log('this.articlegroup', this.articlegroup);
        if (!this.articlegroup.aBusinessPartner?.length) {
          const result:any = await this.createArticleGroupService.saveInternalBusinessPartnerToArticleGroup(this.articlegroup).toPromise();
          this.articlegroup = result?.data;
        }
        this.supplier = this.partnersList.find((el: any) => el._id === this.articlegroup.aBusinessPartner[0]?.iBusinessPartnerId);
        // console.log(55, this.articlegroup);
      } else {
        const articleBody = { name: (this.from === 'repair') ? 'Repair' : 'Order', sCategory: this.from, sSubCategory: this.from };
        const result: any = await this.createArticleGroupService.createArticleGroup(articleBody);
        // console.log(59, {result});
        this.articlegroup = result?.data;//[0]?.result[0];
        // console.log(61, this.articlegroup)
        this.supplier = this.partnersList.find((el: any) => el._id === this.articlegroup.aBusinessPartner[0].iBusinessPartnerId);

      }
    }
    
    let data = {
      iBusinessPartnerId,
      iBusinessId: this.iBusinessId,
    };
    
    this.apiService.postNew('core', '/api/v1/business/article-group/list', data).subscribe((result: any) => {
        if (result.data?.length && result.data[0]?.result?.length) {
          this.articleGroupsList = result.data[0].result;
          // console.log("this.articleGroupsList", this.articleGroupsList);
          this.articleGroupLoading = false;
          
          // setTimeout(() => {
          //   if (this.articleGroupRef)
          //     this.articleGroupRef.focus()
          // }, 150);
        } 
        // else {
        //   this.fetchArticleGroups(null);
        // }

      }, error => {
        this.toastrService.show({ type: 'danger', text: error.message });
      });
  }

  // Function for search article group
  searchArticlegroup(searchStr: string) {
    if (searchStr && searchStr.length > 2) {
      this.filteredArticleGroups = this.articleGroupsList.filter((articlegroup: any) => {
        //console.log("articlegroup.oName", articlegroup.oName);
        return articlegroup.oName;
      });
    } else {
      this.filteredArticleGroups = [];
    }
  }

  // Function for search supplier
  searchSupplier(searchStr: string) {
    if (searchStr && searchStr.length > 2) {
      this.filteredSupplierList = this.partnersList.filter((supplier: any) => {
        return supplier.sName && supplier.sName.toLowerCase().includes(searchStr.toLowerCase());
      });
    } else {
      this.filteredSupplierList = [];
    }
  }

  searchBrand(searchStr: string) {
    if (searchStr && searchStr.length > 2) {
      this.filteredBrandList = this.brandsList.filter((brand: any) => {
        return brand.sName && brand.sName.toLowerCase().includes(searchStr.toLowerCase());
      });
    } else {
      this.filteredBrandList = [];
    }
  }

  fetchBusinessPartners(aBusinessPartnerId: any) {
    this.articleGroupLoading = true;
    this.partnersList = [];
    var body = {
      iBusinessId: this.iBusinessId,
      aBusinessPartnerId
    };
    if (this.supplier) {
      this.brand = null;
    }
    this.apiService.postNew('core', '/api/v1/business/partners/list', body).subscribe(
      (result: any) => {
        if (result?.data?.length && result.data[0]?.result?.length) {
          this.partnersList = result.data[0].result;
          this.fetchArticleGroups(null);
          if (aBusinessPartnerId.length > 0) {
            this.supplier = this.partnersList[0];
          }
        }
      },
      (error: any) => {
        this.partnersList = [];
      }
    );
  }

  changeInArticleGroup() {
    const aBusinessPartnerId: Array<any> = [];
    if (this.articlegroup.aBusinessPartner && this.articlegroup.aBusinessPartner.length) {
      this.articlegroup.aBusinessPartner.forEach((bPartner: any) => {
        aBusinessPartnerId.push(bPartner.iBusinessPartnerId);
      });
    };
    if (!this.supplier)
      this.fetchBusinessPartners(aBusinessPartnerId);

  }

  changeInSupplier() {
    this.fetchArticleGroups(this.supplier._id, true);
  }

  changeInBrand() {
    if (!this.supplier) {
      if (this.from && this.from === 'repair') {
        this.brand.iBusinessPartnerId = this.brand.iRepairerId ? this.brand.iRepairerId : this.brand.iBusinessPartnerId
      }
      this.fetchBusinessPartners([this.brand.iBusinessPartnerId]);
    }
  }

  getBusinessBrands() {
    const oBody = {
      iBusinessId: this.iBusinessId
    }
    this.apiService.postNew('core', '/api/v1/business/brands/list', oBody).subscribe((result: any) => {
      if (result.data && result.data.length > 0) {
        this.brandsList = result.data[0].result;
        this.brand = this.brandsList.find((o: any) => o.iBrandId === this.iBusinessBrandId);
      }
    })
  }

  close(status: boolean): void {
    const data = {
      articleGroupsList: this.articleGroupsList,
      brandsList: this.brandsList,
      partnersList: this.partnersList
    };
    if (status) {
      if (!this.articlegroup || !this.supplier) {
        return
      };
      const businessPartner = this.articlegroup.aBusinessPartner.find((o: any) => o.iBusinessPartnerId === this.supplier._id);
      let nMargin = businessPartner ? businessPartner.nMargin : 1;
      
      this.dialogRef.close.emit({ 
        action: true, 
        brand: this.brand || {}, 
        articlegroup: this.articlegroup, 
        supplier: this.supplier, 
        nMargin, 
        ...data
      });
    } else {
      this.dialogRef.close.emit({ action: false, ...data });
    }
  }
}
