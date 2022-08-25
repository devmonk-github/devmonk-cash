import { Component, Input, OnInit, ViewContainerRef } from '@angular/core';
import * as _ from 'lodash';
import { ApiService } from '../../service/api.service';

import { DialogComponent } from "../../service/dialog";
import { TillService } from '../../service/till.service';
// import { TerminalService } from '../../service/terminal.service';

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
  iArticleGroupId: any = null;
  iBusinessBrandId: any = null;
  constructor(
    private viewContainer: ViewContainerRef,
    private tillService: TillService,
    private apiService: ApiService) {
    const _injector = this.viewContainer.injector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit(): void {
    this.fetchArticleGroups(null);
    this.fetchBusinessPartners([]);
    this.getBusinessBrands();
    this.iBusinessBrandId= this.dialogRef.context?.item?.iBusinessBrandId;
  }

  fetchArticleGroups(iBusinessPartnerId: any) {
    if (!iBusinessPartnerId) {
      this.articlegroup = null;
    }
    let data = {
      searchValue: '',
      oFilterBy: {
      },
      iBusinessPartnerId,
      iBusinessId: localStorage.getItem('currentBusiness'),
    };
    this.apiService.postNew('core', '/api/v1/business/article-group/list', data)
      .subscribe((result: any) => {
        if (result && result.data && result.data[0] && result.data[0].result && result.data[0].result.length) {
          this.articleGroupsList = result.data[0].result;
          console.log(this.iArticleGroupId);
          console.log(this.articleGroupsList);
        } else {
          this.fetchArticleGroups(null);
        }
      }, error => {
        console.log(error);
      });
  }

  // Function for search article group
  searchArticlegroup(searchStr: string) {
    if (searchStr && searchStr.length > 2) {
      this.filteredArticleGroups = this.articleGroupsList.filter((articlegroup: any) => {
        return articlegroup.oName && articlegroup.oName.en && articlegroup.oName.en.toLowerCase().includes(searchStr.toLowerCase());
      });
    }
  }

  // Function for search supplier
  searchSupplier(searchStr: string) {
    if (searchStr && searchStr.length > 2) {
      this.filteredSupplierList = this.partnersList.filter((supplier: any) => {
        return supplier.sName && supplier.sName.toLowerCase().includes(searchStr.toLowerCase());
      });
    }
  }

  searchBrand(searchStr: string) {
    if (searchStr && searchStr.length > 2) {
      this.filteredBrandList = this.brandsList.filter((brand: any) => {
        return brand.sName && brand.sName.toLowerCase().includes(searchStr.toLowerCase());
      });
    }
  }

  fetchBusinessPartners(aBusinessPartnerId: any) {
    this.partnersList = [];
    var body = {
      iBusinessId: this.iBusinessId,
      aBusinessPartnerId
    };
    this.brand = null;
    this.apiService.postNew('core', '/api/v1/business/partners/list', body).subscribe(
      (result: any) => {
        if (result && result.data && result.data && result.data[0] && result.data[0].result && result.data[0].result.length && result.data[0].count && result.data[0].count.totalData) {
          this.partnersList = result.data[0].result;
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
    this.fetchBusinessPartners(aBusinessPartnerId);

  }

  changeInSupplier() {
    this.fetchArticleGroups(this.supplier._id);
  }

  changeInBrand() {
    console.log(this.brand);
  }

  getBusinessBrands() {
    const oBody = {
      iBusinessId: localStorage.getItem('currentBusiness') || '',
    }
    this.apiService.postNew('core', '/api/v1/business/brands/list', oBody).subscribe((result: any) => {
      if (result.data && result.data.length > 0) {
        this.brandsList = result.data[0].result;
        this.brand = this.brandsList.find((o: any) => o.iBrandId === this.iBusinessBrandId);
      }
    })
  }

  close(status: boolean): void {
    if (status) {
      if (!this.brand || !this.articlegroup || !this.supplier) {
        return
      };
      const businessPartener = this.articlegroup.aBusinessPartner.find((o: any) => o.iBusinessPartnerId === this.supplier._id );
      let nMargin = businessPartener? businessPartener.nMargin: 1;
      this.dialogRef.close.emit({ brand: this.brand, articlegroup: this.articlegroup, supplier: this.supplier, nMargin });
    } else {
      this.dialogRef.close.emit(false);
    }
  }
}
