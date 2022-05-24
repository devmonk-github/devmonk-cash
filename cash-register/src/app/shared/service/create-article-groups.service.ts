import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CreateArticleGroupService {

  constructor(private apiService: ApiService) { }

  createArticleGroup(articleData: { name: string, sCategory: string, sSubCategory: string }): Observable<any> {
    const { name } = articleData;
    let data = {
      ...articleData,
      iBusinessId: localStorage.getItem('currentBusiness'),
      oName: { nl: name, en: name, de: name, fr: name },
      bShowInOverview: false,
      bShowOnWebsite: false,
      bInventory: false,
      aProperty: []
    };
    console.log(data);
    return this.apiService.postNew('core', '/api/v1/business/article-group/general', data).pipe(retry(1));
    // return this.apiService.postNew('core', '/api/v1/business/article-group/general', data).pipe(retry(1), catchError(this.processError));
  }

  checkArticleGroups(searchValue: string): Observable<any> {
    let data = {
      skip: 0,
      limit: 20,
      searchValue,
      oFilterBy: {
      },
      iBusinessId: localStorage.getItem('currentBusiness'),
    };
    return this.apiService.postNew('core', '/api/v1/business/article-group/list', data).pipe(retry(1), catchError(this.processError));
  }

  processError(err: any) {
    console.log(err);
    console.log(err.error.message);

    let message = '';
    if (err.error instanceof ErrorEvent) {
      console.log(err.error);
      message = err.error.message;
    } else {
      message = `Error Code: ${err.status}\nMessage: ${err.message}`;
    }
    console.log(message);
    return throwError(() => {
      message;
    });
  }
}
