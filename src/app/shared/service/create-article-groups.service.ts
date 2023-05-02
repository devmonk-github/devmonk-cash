import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CreateArticleGroupService {
  oInternalBusinessPartner:any;
  iBusinessId:any = localStorage.getItem('currentBusiness');
  aSuppliersList:any;
  org = localStorage.getItem('org');
  aLanguage:any;
  constructor(private apiService: ApiService, private translateService: TranslateService) {
    this.fetchInternalBusinessPartner(this.iBusinessId);
    if(this.org)
    this.aLanguage = JSON.parse(this.org)['aLanguage']
  }

  getSupplierList(body: any): Observable<any> {
    return this.apiService.postNew('core', '/api/v1/business/partners/supplierList', body)
  }

  // createInternalBusinessPartner(iBusinessId: string): Observable<any> {
  //   const body = {
  //     oFilterBy: {
  //       bInternal: true,
  //     },
  //     iBusinessId,
  //   };
  //   return this.apiService.postNew('core', '/api/v1/business/partners', body)
  // }

  getBusiness(iBusinessId: string): Observable<any> {
    return this.apiService.getNew('core', `/api/v1/business/${iBusinessId}`)
  }

  async fetchInternalBusinessPartner(iBusinessId: any) {
    if (this.oInternalBusinessPartner) return this.oInternalBusinessPartner;
    else {
      const body = {
        oFilterBy: {
          bInternal: true,
        },
        iBusinessId,
      };
      let internalBusinessPartner: any = await this.getSupplierList(body).toPromise();
      if (internalBusinessPartner?.data?.length) {
        const supplier = internalBusinessPartner.data[0].result;
        this.oInternalBusinessPartner = supplier[0];
        return this.oInternalBusinessPartner;
      } else {
        const businessDetails: any = await this.getBusiness(iBusinessId).toPromise();
        const { data } = businessDetails;
        const order = {
          iBusinessId, // creator of the internal businessPartner
          iSupplierId: iBusinessId, // creator of the internal businessPartner
          iClientGroupId: null,
          sEmail: data.sEmail, // business.sEmail
          sName: `${data.sName} internal supplier`, // business.sName + ' internal supplier',
          sWebsite: data.sWebsite, // business.website
          oPhone: data.oPhone,
          oAddress: data.oAddress,
          nPurchaseMargin: 2,
          bPreFillCompanySettings: false,
          aBankDetail: data.aBankDetail,
          aProperty: data.aProperty,
          aRetailerComments: [],
          eFirm: 'private',
          eAccess: 'n',
          eType: 'supplier',
          bInternal: true,
        };
        // internalBusinessPartner = this.createInternalBusinessPartner(order).toPromise();
        internalBusinessPartner = await this.apiService.postNew('core', '/api/v1/business/partners', order).toPromise();
        this.oInternalBusinessPartner = internalBusinessPartner.data;
        return this.oInternalBusinessPartner;
      }
    }
  }

  saveInternalBusinessPartnerToArticleGroup(oArticleGroup:any) {
    // console.log('saveInternalBusinessPartnerToArticleGroup')
    const oBody = {
      aBusinessPartner: [{
        iBusinessPartnerId: this.oInternalBusinessPartner._id,
        nMargin: this.oInternalBusinessPartner.nPurchaseMargin
      }]
    }
    return this.apiService.putNew('core', `/api/v1/business/article-group/${oArticleGroup._id}?iBusinessId=${oArticleGroup.iBusinessId}`, oBody);
  }

  async createArticleGroup(articleData: { name: string, sCategory: string, sSubCategory: string }) {
    const { name } = articleData;
    const iBusinessId = localStorage.getItem('currentBusiness')
    const oBusinessPartner = await this.fetchInternalBusinessPartner(iBusinessId);
    const org = JSON.parse(localStorage.getItem('org') || '');
    // console.log(org);
    const oName:any = {};
    if(org) {
      const aTranslations = this.translateService.translations;
      // console.log(82, aTranslations);
      org.aLanguage.forEach((lang:any) => {
          oName[lang] = aTranslations[lang][name.toUpperCase()] || name;
      })
    }
    let data = {
      ...articleData,
      iBusinessId,
      nMargin: 0,
      aBusinessPartner: [{
          iBusinessPartnerId: oBusinessPartner._id,
          nMargin: oBusinessPartner.nPurchaseMargin || 0
        }],
      oName: { ...oName },
      bShowInOverview: false,
      bShowOnWebsite: false,
      bInventory: false,
      aProperty: []
    };
    return await this.apiService.postNew('core', '/api/v1/business/article-group/general', data).toPromise();
  }

  checkArticleGroups(eDefaultArticleGroup: string): Observable<any> {
    let data = {
      eDefaultArticleGroup,
      aLanguage: this.aLanguage,
      iBusinessId: localStorage.getItem('currentBusiness'),
    };
    return this.apiService.postNew('core', '/api/v1/business/article-group/get/default-article', data);
  }

  processError(err: any) {
    let message = '';
    if (err.error instanceof ErrorEvent) {
      message = err.error.message;
    } else {
      message = `Error Code: ${err.status}\nMessage: ${err.message}`;
    }
    return throwError(() => {
      message;
    });
  }
}
