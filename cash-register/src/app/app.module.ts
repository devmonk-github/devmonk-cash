import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
// import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule } from '@angular/common/http';
import { PrintComponent } from './print/print.component';
import { FormsModule } from "@angular/forms";
import { Observable } from 'rxjs';

// Translate imports
import * as en from '../assets/json/translations/en-translation.json';
import * as nl from '../assets/json/translations/nl-translation.json';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { SharedServiceModule } from './shared/shared-service.module';
export class CustomTranslateLoader implements TranslateLoader {
  public getTranslation(lang: string): Observable<any> {
    return new Observable((observer: any) => {
      lang = localStorage.getItem('language') || 'nl';
      if (lang === 'nl') {
        observer.next(nl);
      } else {
        observer.next(en);
      }
      observer.complete();
    });
  }
}

@NgModule({
  declarations: [
    AppComponent,
    PrintComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    // BrowserAnimationsModule,
    AppRoutingModule,
    TranslateModule.forRoot(),
    FormsModule,
    NgJsonEditorModule,
    SharedServiceModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {

}
