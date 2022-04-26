import { Injectable } from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

@Injectable({
  providedIn: 'root'
})
export class StringService {

  constructor( private translateService: TranslateService) {

  }

  translate(keyword: string): string {
    return this.translateService.instant(keyword)
  }

  slugify(text: string): string {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, '') // Trim - from end of text
  }

  //Encode a string
  b2a(text: string): string {
    //https://gist.github.com/oeon/0ada0457194ebf70ec2428900ba76255
    if (!text) return text;
    let c, d, e, f, g, h, i, j, o, b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", k = 0, l = 0, m = "", n = [];

    do c = text.charCodeAt(k++), d = text.charCodeAt(k++), e = text.charCodeAt(k++), j = c << 16 | d << 8 | e,
      f = 63 & j >> 18, g = 63 & j >> 12, h = 63 & j >> 6, i = 63 & j, n[l++] = b.charAt(f) + b.charAt(g) + b.charAt(h) + b.charAt(i); while (k < text.length);
    return m = n.join(""), o = text.length % 3, (o ? m.slice(0, o - 3) :m) + "===".slice(o || 3);
  }

}
