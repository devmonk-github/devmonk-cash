import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-pdf',
  template: '<div #pdfGenerator id="pdfGenerator"></div><iframe [style]="frameStyle" #pdfHtmlFrame id="pdfHtmlFrame">{{pdfString}}</iframe>',
  styleUrls: ['./pdf.component.sass']
})
export class PdfComponent implements OnInit {
  @Input() pdfString: string = ""
  @ViewChild('pdfHtmlFrame') pdfHtmlFrame!: ElementRef;
  frameStyle: string = "";
  constructor() { }

  ngOnInit(): void {
  }

  setHtmlContent(content: string): void {
    let doc = this.pdfHtmlFrame.nativeElement.contentDocument || this.pdfHtmlFrame.nativeElement.document;
    doc.body.innerHTML = content;
  }

  setStyle(pageSize: any) {
    this.frameStyle = 'width: ' + pageSize.width + 'mm; height: ' + pageSize.height + 'mm';
    // console.log('frameStyle', this.frameStyle)
  }

}
