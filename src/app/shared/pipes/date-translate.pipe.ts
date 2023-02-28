import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'dateTranslate',
  pure: false
})

export class DateTranslatePipe implements PipeTransform {

  constructor(private translateService: TranslateService) { }

  transform(value: any, format = 'mediumDate') {
    const datePipe = new DatePipe(this.translateService.currentLang || 'en');
    return datePipe.transform(value, format);
  }


}
