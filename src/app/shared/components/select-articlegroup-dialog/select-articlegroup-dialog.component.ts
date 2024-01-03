import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ApiService } from '../../service/api.service';
import { CreateArticleGroupService } from '../../service/create-article-groups.service';
import { DialogComponent } from "../../service/dialog";
import { TillService } from '../../service/till.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

@Component({
  selector: 'app-select-articlegroup-dialog',
  templateUrl: './select-articlegroup-dialog.component.html',
  styleUrls: ['./select-articlegroup-dialog.component.scss']
})

export class SelectArticleDialogComponent implements OnInit , AfterViewInit {
  @Input() customer: any;
  dialogRef: DialogComponent;
  articleGroupsList: Array<any>;
  partnersList: Array<any> = [];
  brandsList: Array<any> = [];
  brand: any = null;
  articlegroup: any = null;
  supplier: any = null;
  iBusinessId = localStorage.getItem('currentBusiness');
  selectedLanguage: string;
  iBusinessBrandId: any = null;
  from: any;
  @ViewChild('articleGroupRef') articleGroupRef!: NgSelectComponent;
  articleGroupChanged = new Subject<any>();
  businessPartnerChanged = new Subject<any>();
  businessBrandChanged = new Subject<any>();
  showArticleGroupLoader: boolean = false;
  showBusinessPartnerLoader: boolean = false;
  showBusinessBrandLoader: boolean = false;
  aLanguage:any=[];

  constructor(
    private viewContainer: ViewContainerRef,
    private apiService: ApiService,
    private tillService: TillService,
    private cdref: ChangeDetectorRef,
    private createArticleGroupService: CreateArticleGroupService) {
    const _injector = this.viewContainer.injector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngAfterViewInit(): void {
    this.cdref.detectChanges();
    /* Articlegroup search debounce */
    this.articleGroupChanged.pipe(
      filter(Boolean),
      debounceTime(1500),
      distinctUntilChanged(),
    ).subscribe((res: any) => {
      this.fetchArticleGroups(res?.searchValue, null);
    });

    /* Business partner search debounce */
    this.businessPartnerChanged.pipe(
      filter(Boolean),
      debounceTime(1500),
      distinctUntilChanged(),
    ).subscribe((res: any) => {
      this.fetchBusinessPartners(res?.searchValue, null, false);
    });

    /* BusinessBrand search debounce */
    this.businessBrandChanged.pipe(
      filter(Boolean),
      debounceTime(1500),
      distinctUntilChanged(),
    ).subscribe((res: any) => {
      this.getBusinessBrands(res?.searchValue);
    });
  }

  ngOnInit() {
    this.selectedLanguage = localStorage.getItem('language') || 'en';
    this.aLanguage= JSON.parse(localStorage.getItem('org') || '{}')?.aLanguage
    if(this.from == 'repair'){
      this.getDefaultArticleGroupDetail(this.tillService?.settings?.iDefaultArticleGroupForRepair);
    }
    if(this.from == 'order'){
      this.getDefaultArticleGroupDetail( this.tillService?.settings?.iDefaultArticleGroupForOrder);
     ;
    }
  }

  getAllArticleGroupList(data: any) {
    return this.apiService.postNew('core', '/api/v1/business/article-group/list', data).toPromise();
  }

  async getDefaultArticleGroupDetail(iArticleGroupId: any) {
    /*  If default article group set then we will find articleDetail otherwise we will set default article*/
    if (iArticleGroupId) {
      const data = {
        iBusinessId: this.iBusinessId,
        oFilterBy: {
          _id: [iArticleGroupId]
        }
      }
      this.showArticleGroupLoader = true;
      const result: any = await this.getAllArticleGroupList(data);
      this.showArticleGroupLoader = false;
      if (result?.data[0]?.result?.length) {
        this.articleGroupsList = this.createArticleGroupService.setArticleGroupName(result?.data[0]?.result, this.selectedLanguage);
        if (this.articleGroupsList?.length) {
          this.articlegroup = this.articleGroupsList[0];
          if (this.articlegroup?.aBusinessPartner?.length) {
            const aBusinessPartners: any = [];
            this.articlegroup.aBusinessPartner.forEach((partner: any) => {
              if (partner?.iBusinessPartnerId) aBusinessPartners.push(partner.iBusinessPartnerId);
            })
            if (aBusinessPartners?.length) this.fetchBusinessPartners('', aBusinessPartners, true);
          }
        }
      }
    } else {
      /* Set Default articleGroup detail */
      const oDefaultArticle: any = await this.createArticleGroupService.checkArticleGroups(this.from).toPromise();
      if (oDefaultArticle?.data?._id) {
        this.articlegroup = oDefaultArticle?.data;
        if (!this.articlegroup?.aBusinessPartner?.length) {
          const result: any = await this.createArticleGroupService.saveInternalBusinessPartnerToArticleGroup(this.articlegroup).toPromise();
          this.articlegroup = result?.data;
        }

      } else {
        const articleBody: any = { name: this.from, eDefaultArticleGroup: this.from };
        const result: any = await this.createArticleGroupService.createArticleGroup(articleBody);
        this.articlegroup = result?.data;//[0]?.result[0];
        this.supplier = this.partnersList.find((el: any) => el._id === this.articlegroup.aBusinessPartner[0].iBusinessPartnerId);
      }
      [this.articlegroup] = this.createArticleGroupService.setArticleGroupName([this.articlegroup], this.selectedLanguage);
      if (this.articlegroup?.aBusinessPartner?.length) {
        const aBusinessPartner: any = this.articlegroup.aBusinessPartner.map((partner: any) => partner?.iBusinessPartnerId)
        if (aBusinessPartner?.length) this.fetchBusinessPartners('', aBusinessPartner, true);
      }
    }
  }

  async fetchArticleGroups(searchValue: any, iBusinessPartnerId: any) {
    let data = {
      iBusinessPartnerId,
      iBusinessId: this.iBusinessId,
      searchValue: searchValue,
      aLanguage:this.aLanguage
    };
    this.showArticleGroupLoader = true;
    this.articleGroupsList = [];

    const result: any = await this.getAllArticleGroupList(data);
    this.showArticleGroupLoader = false;
    if (result?.data[0]?.result?.length) {
      this.articleGroupsList = this.createArticleGroupService.setArticleGroupName(result?.data[0]?.result, this.selectedLanguage);

    }
  }

  // Function for search article group
  searchArticlegroup(searchStr: string) {
    if (searchStr?.length > 1) {
      this.showArticleGroupLoader = true;
      this.articleGroupsList = [];
      this.articleGroupChanged.next({ searchValue: searchStr });
    }
  }

  // Function for search supplier
  searchSupplier(searchStr: string) {
    if (searchStr?.length > 1) {
      this.showBusinessPartnerLoader = true;
      this.partnersList = [];
      this.businessPartnerChanged.next({ searchValue: searchStr })
    }
  }

  searchBrand(searchStr: string) {
    if (searchStr?.length > 1) {
      this.showBusinessBrandLoader = true;
      this.brandsList = [];
      this.businessBrandChanged.next({ searchValue: searchStr });
    }
  }

  fetchBusinessPartners(searchValue: any, aBusinessPartnerId: any, isSetSupplier: any) {
    this.showBusinessPartnerLoader = true;
    this.partnersList = [];
    var body = {
      iBusinessId: this.iBusinessId,
      searchValue,
      aBusinessPartnerId
    };
    this.apiService.postNew('core', '/api/v1/business/partners/list', body).subscribe((result: any) => {
      this.showBusinessPartnerLoader = false;
      if (result?.data[0]?.result?.length) {
        this.partnersList = result.data[0].result;
        if (isSetSupplier) this.supplier = this.partnersList[0];
      }
    }, (error: any) => {
      console.log("Business Partner Fetch error", error);
      this.showBusinessPartnerLoader = false;
    });
  }

  changeInArticleGroup(articlegroup: any) {
    if (this.articlegroup) {
      /* If supplier is not selected then only fetch the business partner data based on article group busines partner */
      if (!this.supplier) {
        const aBusinessPartner: any = [];
        if (this.articlegroup?.aBusinessPartner?.length) {
          this.articlegroup.aBusinessPartner.forEach((partner: any) => {
            if (partner?.iBusinessPartnerId) aBusinessPartner.push(partner?.iBusinessPartnerId);
          })
        }
        if (aBusinessPartner?.length) this.fetchBusinessPartners('', aBusinessPartner, false);

      }
    }
  }

  changeInSupplier() {
    if (this.supplier) {
      /* If articlegroup is not selected then only fetchArticleGroups based on business partner */
      if (!this.articlegroup) {
        this.fetchArticleGroups('', [this.supplier?._id])
      }
      /* If barnd is not selected then only fetch getBusinessBrand  */
      /*    if(!this.brand){
           this.getBusinessBrands('')
         } */
    }
  }

  changeInBrand(brand: any) {
    if (this.brand) {
      if (!this.supplier && this.brand?.iSupplierId) {
        this.fetchBusinessPartners('', [this.brand?.iSupplierId], true);
      }
    }
  }

  getBusinessBrands(searchValue: any) {
    const oBody = {
      iBusinessId: this.iBusinessId,
      searchValue
    }
    this.showBusinessBrandLoader = true;
    this.brandsList = [];
    this.apiService.postNew('core', '/api/v1/business/brands/list', oBody).subscribe((result: any) => {
      this.showBusinessBrandLoader = false;
      if (result?.data[0]?.result?.length) {
        this.brandsList = result.data[0].result;
      }
    }, (error: any) => {
      console.log("Business brand error", error);
      this.showBusinessBrandLoader = false;
    })
  }

  close(status: boolean): void {
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
      });
    } else {
      this.dialogRef.close.emit({ action: false});
    }
  }
}