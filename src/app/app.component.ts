import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TranslationsService } from './shared/service/translation.service';
import { ToastService } from './shared/components/toast';
import { ApiService } from './shared/service/api.service';

@Component({
  selector: 'body[root]',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  translation: any = [];

  constructor(
    private translateService: TranslateService,
    private customTranslationService: TranslationsService,
    private toastService: ToastService,
    private apiService: ApiService) {
    // localStorage.setItem('currentBusiness', '6182a52f1949ab0a59ff4e7b')
    // localStorage.setItem('currentLocation', '623b6d840ed1002890334456')
    // localStorage.setItem('org', '{"aLanguage":["en","nl","fr","es","de","da","ar","da","sv","nb","fi","pl","it","ms"],"_id":"62defbfc9585fbe5d0fbba6c","sName":"Prismanote2","sIndustry":"jewellery_and_watches","sBackgroundColor":"#b45f5f","bDisableFreeTier":true,"bEnableFrontendCodeAccess":true,"sLogo":"https://prismanote.s3.amazonaws.com/prismanote-logo-groen.png","sSupportEmail":"info@prismanote2.com"}')
    localStorage.setItem('currentWorkstation', '62cfa01063953715a759acbd')
    // localStorage.setItem('currentUser', '{"userId":"61a48b1d7f39a87d3576c5f0","userName":"New Org","aRights":["OWNER"],"bHomeWorker":true}')
    // localStorage.setItem('aRights', '[{"sControllerName":"transaction","sEndPoint":"create","isAccessible":true},{"sControllerName":"transaction","sEndPoint":"createPurchaseOrder","isAccessible":true},{"sControllerName":"transaction","sEndPoint":"cashRegister","isAccessible":true},{"sControllerName":"activities","sEndPoint":"itemsList","isAccessible":true},{"sControllerName":"businessPartner","sEndPoint":"create","isAccessible":true},{"sControllerName":"businessPartner","sEndPoint":"supplierList","isAccessible":true},{"sControllerName":"statistics","sEndPoint":"get","isAccessible":true},{"sControllerName":"users","sEndPoint":"create","isAccessible":true},{"sControllerName":"business","sEndPoint":"update","isAccessible":true}]')
    // localStorage.setItem('authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MmI1NjA4NzYzZjE0YzNjNWIzZGUyODQiLCJlVXNlclR5cGUiOiJyZXRhaWxlciIsImFSaWdodHMiOlsiT1dORVIiXSwiaU9yZ2FuaXphdGlvbklkIjoiNjJkZWZiZmM5NTg1ZmJlNWQwZmJiYTZjIiwiaWF0IjoxNjk4MTI0NzczLCJleHAiOjE2OTgzODM5NzN9.51CDEVREbePG1QEjthvyIV_A0VmNdsCStesB9MVT5WE')
    // localStorage.setItem('language', 'en');
  }

  ngOnInit() {
    const org = JSON.parse(localStorage.org);
    this.fetchTranslation(org)
  }

  fetchTranslation(oOrganization: any) {
    return new Promise<void>((resolve, reject) => {
      try {
        let defaultLanguage = navigator.language.substring(0, 2);
        let currentLang: any;
        if (localStorage.getItem('language')) {
          currentLang = localStorage.getItem('language');
        } else {
          localStorage.setItem('language', defaultLanguage);
          currentLang = defaultLanguage;
        }
        this.translateService.use(currentLang);

        this.customTranslationService.getTranslations({ sOrganizationName: oOrganization?.sName, aLanguage: oOrganization?.aLanguage }).then((translations: any) => {
          const langs = Object.keys(translations);
          this.translateService.addLangs(langs);
          langs.map((language: any) => {
            this.translateService.setTranslation(language, {
              ...translations[language]
            });
          })
          this.translateService.setDefaultLang('none');

          const translate = ['PLATFORM_UPDATE']
          this.translateService.get(translate).subscribe((res: any) => {
            this.translation = res;
          })
          // if (this.swUpdate.isEnabled) {
          //   this.swUpdate.available.subscribe(() => {
          //     this.globalService.updateAvailable();
          //   });
          // }

          resolve();
        }).catch(((error: any) => {
          console.log(error)
          this.toastService.show({ type: 'warning', text: 'Translation not loaded properly' });
        }))
      } catch (error) {
        console.log('error here: ', error);
        this.toastService.show({ type: 'warning', text: 'Translation not loaded properly' });
      }
    })
  }

}
