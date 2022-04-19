import {ComponentFactoryResolver, Injectable, ViewContainerRef} from '@angular/core';
import {PdfComponent} from "../components/pdf/pdf.component";
import * as moment from 'moment';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas'
import { invert } from 'lodash';

interface StaticPaperSize {
  type: string,
  width: string,
  height: string
}

interface Margins {
  top: number
  bottom: number,
  left: number,
  right: number
}

interface PaperSize {
  width: number,
  height: number,
  type: string
}

interface BarcodeOptions {
  bcid: string,
  scale: number,
  height: number,
  width: string,
  includetext: boolean,
  textalign: string,
  text: string
}

@Injectable({
  providedIn: 'root'
})

export class PdfService {

  private data: any = {};
  private css: string = "";
  private currency: string = "€";
  private defaultElement: string = "span";
  private fontSize: string = "10pt";
  private layout: any[] = [];
  private margins: number[] = [0];
  private dateFormat: string = "L";
  private orientation: string = "portrait";
  private paperSize: string | PaperSize = "A4";
  private pixelsPerMm: number = 3.76;
  private rotation: number = 0;
  private debug: boolean = false;
  private barcodeOptions: BarcodeOptions = {
    bcid: "code128",
    scale: 2,
    height: 10,
    width: '100%',
    includetext: false,
    textalign: 'center',
    text: ''
  }
  private staticPaperSize: StaticPaperSize[] = [
    {
      type: "A4",
      width: "210",
      height: "297"
    },
    {
      type: "A5",
      width: "148",
      height: "210"
    },
    {
      type: "A6",
      width: "105",
      height: "148"
    }
  ]

  private totalPageCount: number = 0
  private pdfContainer: any;
  private parsedPaperSize: PaperSize = {
    height: 0,
    width: 0,
    type: 'A4'
  }

  constructor(private factoryResolver: ComponentFactoryResolver) {}

  private addRowToPageWrap(page: any, row: any) {
    let wrapper = page.getElementsByClassName('wrapper')[0];
    wrapper.appendChild(row);
    return page;
  }

  private createWrapInPage(page: any, margins: Margins) {
    let wrapper = document.createElement('div');
    wrapper.classList.add('wrapper');
    wrapper.style.padding = margins.top + 'mm ' + margins.right + 'mm ' + margins.bottom + 'mm ' + margins.left + 'mm';
    page.appendChild(wrapper);

    return page;
  }

  private isValidJson(json: string): boolean {
    try {
      if(json) {
        JSON.parse(json)
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  }

  private isDefined(obj: any): boolean {
    return typeof obj !== 'undefined'
  }

  private calcSectionPage(rows: any): any {
    for (let r = 0; r < rows.length; r++) {
      let row = rows[r];
      let rowData = row.dataset;

      if (rowData.sectionHeight > 0 && rowData.sectionRemaingSpace > 0 && rowData.sectionHeight >= rowData.sectionRemaingSpace) {
        rowData.sectionToNewPage = true;
      }
    }
    return rows;
  }

  private calcNewProductTotal(price: number, quantity: number, discountPercent: number, discountValue: number): number {
    if (discountPercent && discountValue) {
      return (price * (100 / (100 - discountValue))) * quantity;
    } else if (!discountPercent && discountValue) {
      return (price + discountValue) * quantity;
    } else {
      return price * quantity
    }
  }

  private createRandomString(len: number = 5): string {
    let text = "";
    const possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < len; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  private formatContent(val: any, type: string): any {
    switch (type) {
      case 'money':
        return this.convertStringToMoney(val);
        break;
      case 'moneyplus':
        return this.currency + ' ' + this.convertStringToMoney(val);
        break;
      case 'barcode':
        return this.convertValueToBarcode(val);
        break;
      case 'date':
        return moment(val).format(this.dateFormat);
        break;

      default:
        return val;
        break;
    }
  }

  private convertHtmlToElement(htmlString: string): any {
    let div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
  }

  private convertStringToMoney(val: any): any {
    if (val % 1 === 0) {
      //no decimals
      return String(val + ',00');
    } else {
      val = String(val);
      let parts = val.split('.');

      if(parts[1].length === 1) {
        val = val+'0';
      }
      return val.replace('.', ',')
    }
  }

  private convertValueToBarcode(val: string): any {
    let canvas = document.createElement('canvas');
    let resultImg = document.createElement('img');

    try {
      let options = this.barcodeOptions;
      options.text = val;


      const queryString = new URLSearchParams(JSON.parse(JSON.stringify(options)))
      resultImg.src = 'https://bwipjs-api.metafloor.com/?' + queryString;
      resultImg.style.width = options.width;
    } catch (e) {
      console.error('Error creating barcode', e)
    }
    return resultImg.outerHTML;
  }

  private htmlDefaultStyling(): string {
    return `
		@page { margin: 0 }
		body { margin: 0 }
		p { margin: 0 }
		.sheet {
			margin: 0;
			overflow: hidden;
			position: relative;
			box-sizing: border-box;
			page-break-after: always;
			display: flex;
			flex-direction: column;
		}

		hr {
			width: 100%;
			margin: 1mm 0;
			height:1px;
		}

		h1,h2,h3,h4 {
			font-weight: 500;
		}

		img { max-width: 100%; }

		/** Paper sizes **/
		body.A3               .sheet { width: 297mm; height: 419mm }
		body.A3.landscape     .sheet { width: 420mm; height: 296mm }
		body.A4               .sheet { width: 210mm; height: 296mm }
		body.A4.landscape     .sheet { width: 297mm; height: 209mm }
		body.A5               .sheet { width: 148mm; height: 209mm }
		body.A5.landscape     .sheet { width: 210mm; height: 147mm }

		body.A6               .sheet { width: 105mm; height: 147mm }
		body.A6.landscape     .sheet { width: 147mm; height: 105mm }

		/** Padding area **/
		.sheet.padding-5mm  { padding: 5mm }
		.sheet.padding-10mm { padding: 10mm }
		.sheet.padding-15mm { padding: 15mm }
		.sheet.padding-20mm { padding: 20mm }
		.sheet.padding-25mm { padding: 25mm }

		/** For screen preview **/
		@media screen {
			body { background: white; }
			.sheet {
				background: white;
				margin: 5mm auto;
			}
		}

		/** Fix for Chrome issue #273306 **/
		@media print {
			body.A3.landscape { width: 420mm }
			body.A3, body.A4.landscape { width: 297mm }
			body.A4, body.A5.landscape { width: 210mm }
			body.A5, body.A6.landscape { width: 148mm }
			body.letter, body.legal    { width: 216mm }
			body.letter.landscape      { width: 280mm }
			body.legal.landscape       { width: 357mm }
		}

		.rotate-90 {
			-moz-transform: rotate(90deg);
			-webkit-transform: rotate(90deg);
			-o-transform: rotate(90deg);
			-ms-transform: rotate(90deg);
			transform: rotate(90deg);
		}

		.rotate-180 {
			-moz-transform: rotate(180deg);
			-webkit-transform: rotate(180deg);
			-o-transform: rotate(180deg);
			-ms-transform: rotate(180deg);
			transform: rotate(180deg);
		}

		.rotate-270 {
			-moz-transform: rotate(270deg);
			-webkit-transform: rotate(270deg);
			-o-transform: rotate(270deg);
			-ms-transform: rotate(270deg);
			transform: rotate(270deg);
		}

		body {
			font: `+this.fontSize+` "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
		}

		h1,h2,h3,h4,h5 {
			display: block;
			margin: 0;
		}

		th { text-align: left;}
		td { padding-right: 5mm;}


		* {
			box-sizing: border-box;
			-moz-box-sizing: border-box;
			-webkit-box-sizing: border-box;
			-webkit-print-color-adjust: exact;
		}

		.pnrow {
			display: flex;
			flex-wrap: wrap;
		}

		.pncol {
			overflow-x: hidden;
			overflow-y: auto;
		}

		.debug-true div {
			-webkit-box-shadow:inset 0px 0px 0px 1px #f00;
	    	-moz-box-shadow:inset 0px 0px 0px 1px #f00;
	    	box-shadow:inset 0px 0px 0px 1px #f00;
	    }

		`+this.css;
  }

  private createPageBody(content: string, paperSize: PaperSize): string {

    return '<body class="'+ paperSize.type+` `+this.orientation+' debug-'+this.debug+' rotate-'+this.rotation+'" >'+content+'</body>'
  }

  private htmlPageEnd(): string {
    return '</html>'
  }

  private createPage(margins: Margins) {
    let newPage = document.createElement('div');
    newPage.classList.add('sheet');
    newPage = this.createWrapInPage(newPage, margins);
    return newPage;
  }

  private convertPagesToHtml(pages: any, paperSize: PaperSize): string {
    let html = '';
    let pdfBody = '';

    for (let p = 0; p < pages.length; p++ ) {
      if (this.isDefined(pages[p].childNodes[0].childNodes[0])) {
        pdfBody += pages[p].outerHTML;
      }
    }
    html += this.htmlPageHead(paperSize)
    html += this.createPageBody(pdfBody, paperSize);
    html += this.htmlPageEnd();

    return html;
  }

  private htmlPageHead(paperSize: PaperSize): string {
    const title = this.createRandomString(10);
    let html = `
		<!DOCTYPE html><html lang="en">
		<head>
			<meta charset="utf-8">
			<title>`+title+`</title>
			<style>`+this.htmlDefaultStyling()+`</style>`;

    if (paperSize.type === 'custom-papersize') {
      html += '<style>' + this.htmlCustomPaperSize(paperSize) + '</style>';
    }

    html += '</head>';

    return html;
  }

  private htmlCustomPaperSize(paperSize: PaperSize): string {
    return `
			body.custom-papersize               .sheet { width: `+paperSize.width+`mm; height: `+paperSize.height+`mm }
			body.custom-papersize.landscape     .sheet { width: `+paperSize.height+`mm; height: `+paperSize.width+`mm }

			@media print {
				body.custom-papersize.landscape { width: `+paperSize.height+`mm }
				body.custom-papersize           { width: `+paperSize.width+`mm }
			}
		`;
  }

  private convertSpacingArrayToObject(margins: number[]): Margins {
    let calculatedSpace = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    }
    switch(margins.length) {
      case 0:
        break;
      case 1:
        calculatedSpace = {
          top: margins[0],
          right: margins[0],
          bottom: margins[0],
          left: margins[0],
        }
        break;
      case 2:
        calculatedSpace = {
          top: margins[0],
          right: margins[1],
          bottom: margins[0],
          left: margins[1],
        }
        break;
      case 4:
        calculatedSpace = {
          top: margins[0],
          right: margins[1],
          bottom: margins[2],
          left: margins[3],
        }
        break;
      default:
        break;
    }

    return calculatedSpace;
  }

  private definePaperSize(paperSize: string | PaperSize, margins: number[]): PaperSize {
    let definedPaperSize: any
    if(typeof paperSize === 'string') {
      definedPaperSize = this.staticPaperSize.find( (size) => {
        return size.type === paperSize
      })
    } else if (typeof paperSize === 'object') {
      let pageWidth = paperSize.width
      let pageHeight = paperSize.height

      let totalHorizontalMargin = 0, totalVerticalMargin = 0

      if (margins.length > 0) {
        const definedMargins = this.convertSpacingArrayToObject(margins);
        totalHorizontalMargin = (definedMargins.left + definedMargins.right);
        totalVerticalMargin = (definedMargins.top + definedMargins.bottom);
      }

      if ( (pageWidth - totalHorizontalMargin) < 100) {
        console.error("Paper size is too low, we changed it from " + (pageWidth-totalHorizontalMargin) + ' to ' + (100+totalHorizontalMargin))
        pageWidth = 100
      }

      if( (pageHeight - totalVerticalMargin) < 100) {
        console.error("Paper height is too low, we changed it from " + (pageHeight) + " to 100");
        pageHeight = 100
      }

      definedPaperSize = {
        type: "custom-papersize",
        width: pageWidth,
        height: pageHeight
      }
    }
    return definedPaperSize
  }

  private setProperties(template: any, data: any): void {
    if (data) {
      this.data = data;
    }
    if (template.css) {
      this.css = template.css
    }
    if (template.currency) {
      this.currency = template.currency
    }
    if (template.defaultElement) {
      this.defaultElement = template.defaultElement
    }
    if (template.fontSize) {
      this.fontSize = template.fontSize
    }
    if (template.layout) {
      this.layout = template.layout
    }
    if (template.margins) {
      this.margins = template.margins
    }
    if (template.dateFormat) {
      this.dateFormat = template.dateFormat
    }
    if (template.orientation) {
      this.orientation = template.orientation
    }
    if (template.paperSize) {
      this.paperSize = template.paperSize
    }
    if (template.pixelsPerMm) {
      this.pixelsPerMm = template.pixelsPerMm
    }
    if (template.rotation) {
      this.rotation = template.rotation
    }
    if (template.debug) {
      this.debug = template.debug
    }
    if (this.barcodeOptions) {
      this.barcodeOptions = template.barcodeOptions
    }
  }

  private createRows(cols: any, currentRow: any, printableArea: any, gutter: any) {
    let rowsToBeCreated = 1;
    let dataSourceObject = this.data;
    let createdRows = [];
    let foreachActive = false;

    if (this.isDefined(currentRow.forEach)) {
      foreachActive = true;
      dataSourceObject = this.defineDataSource(currentRow.forEach);

      rowsToBeCreated = dataSourceObject.length;
    }

    for (let r = 0; r < rowsToBeCreated; r++) {
      let finalDataSourceObject = dataSourceObject;
      
      if (typeof dataSourceObject.length === 'number') {
        finalDataSourceObject = Object.values(dataSourceObject)[r];
      }

      let rowElement = (this.isDefined(currentRow.element)) ? currentRow.element : 'div';
      let newRow = document.createElement(rowElement);
      newRow.classList.add('pnrow');

      newRow.dataset.inForeach = foreachActive;

      if (this.isDefined(currentRow.section)) {
        newRow.dataset.section = String(currentRow.section);
      }

      if (currentRow.htmlBefore) {
        newRow.appendChild(this.convertHtmlToElement(String(currentRow.htmlBefore)));
      }

      for (let i = 0; i < cols.length; i++) {
        const col = cols[i];
        let colsize = col.size;
        let gutterSize = this.calcColumnGutter(colsize, gutter);
        let newRowWidth = this.calcRowWidth(printableArea.width, colsize, gutterSize);
        let newCol = this.createCol(i, cols.length, newRowWidth, gutter, col, finalDataSourceObject);

        if (this.isDefined(col.css)) {
          newCol = this.applyCss(newCol, col.css);
        }

        if (this.isDefined(newCol.newContent)) {
          for (let c = 0; c < newCol.newContent.length; c++) {
            let newData = newCol.newContent[c];
            let oldData = newCol.innerHTML;
            let newString = oldData.replace(newData[0], newData[1]);
            newCol.innerHTML = newString;
          }
        }

        newRow.appendChild(newCol);

        if (col.break) {
          const clearBoth = document.createElement('div');
          clearBoth.style.clear = 'both';
          newRow.appendChild(clearBoth);
        }
      }

      if(currentRow.htmlAfter) {
        newRow.appendChild(this.convertHtmlToElement(String(currentRow.htmlAfter)));
      }

      createdRows.push(newRow);
    }

    if(currentRow.container) {
      const container = document.createElement(currentRow.container)
      for (let r = 0; r < createdRows.length; r++) {
        const row = createdRows[r];
      }
      createdRows = [container]
    }
    return createdRows;
  }

  private createRowsFromLayout(paperSize: PaperSize): any {
    let margins = this.convertSpacingArrayToObject(this.margins);

    const printableWidth = (paperSize.width - (margins.left + margins.right));
    const printableHeight = (paperSize.height - (margins.top + margins.bottom));

    const printableArea = {
      x: margins.left,
      y: margins.top,
      width: printableWidth,
      height: printableHeight,
      maxHeight: Math.floor(printableHeight * this.pixelsPerMm)
    };

    this.pdfContainer = document.getElementById('pdfGenerator');
    let newContentHeight = 0;
    let maxContentHeight = printableArea.maxHeight;
    let pageNumber = 1;
    let rows = [];
    let rowCounter = 1;
    let currentSection = "";
    let currentSectionHeight = 0;
    let previousSection = "";
    let sectionRemainingSpace = 0;

    for(let r = 0; r < this.layout.length; r++) {
      const currentRow = this.layout[r];

      currentSection = currentRow.section;
      let newSection = false;
      if (this.isDefined(currentRow.section)) {
        if (currentSection !== previousSection) {
          newSection = true;
          sectionRemainingSpace = 0;
          currentSectionHeight = 0;
        }
      } else {
        sectionRemainingSpace = 0;
        currentSectionHeight = 0;
      }

      rowCounter++

      const cols = currentRow['row'];
      const gutterSize = 2;
      let totalRowHeight = 0;

      let newRows = this.createRows(cols, currentRow, printableArea, gutterSize);

      for (let i = 0; i < newRows.length; i++) {
        let newRow = newRows[i];

        if (this.isDefined(currentRow.css)) {
          newRow = this.applyCss(newRow, currentRow.css);
        }

        this.pdfContainer.innerHTML += newRow.outerHTML;
        newContentHeight = this.pdfContainer.clientHeight;
        totalRowHeight = newContentHeight;

        let remainingSpace = (maxContentHeight - newContentHeight);

        if (newContentHeight >= maxContentHeight) {
          newRow.contentHeight = newContentHeight;

          if (newContentHeight > remainingSpace) {
            pageNumber++;
            newRow.pageNumber = pageNumber;
          } else {
            newRow.pageNumber = pageNumber;
            pageNumber++;
          }

          newContentHeight = 0;
          this.pdfContainer.innerHTML = "";
        } else if (newSection && newContentHeight >= (maxContentHeight * 0.075)) {
          pageNumber++;
          newRow.pageNumber = pageNumber;
          newContentHeight = 0;
          this.pdfContainer.innerHTML = "";
        } else {
          newRow.pageNumber = pageNumber;
        }

        newRow.section = currentRow.section;
        newRow.rowHeight = totalRowHeight;

        if (newSection) {
          sectionRemainingSpace = remainingSpace;
        }

        newRow.dataset.sectionRemainingSpace = sectionRemainingSpace;
        newRow.dataset.sectionHeight = currentSectionHeight;
        newRow.dataset.contentHeight = totalRowHeight;
        newRow.dataset.maxContentHeight = maxContentHeight;

        currentSectionHeight = totalRowHeight;
        totalRowHeight = 0;
        previousSection = currentSection;

        rows.push(newRow)
      }
    }

    this.totalPageCount = pageNumber;
    rows = this.calcSectionPage(rows);

    return rows;
  }

  private checkConditions(conditions: any, dataSourceObject: any): boolean{
    let counter =0;
    let inverted = false;
    let result = false;

    if(typeof conditions === 'object') {
      for(let c = 0; c < conditions.length; c++) {
        let condition = conditions[c];

        if(condition.indexOf('!') > -1) {
          inverted = true;
          condition = condition.replace('!', '')
        }

        let dataValue = dataSourceObject[condition];

        if(inverted) {
          if(dataValue === false || dataValue === 0 || dataValue === '') {
            counter++
          }
        } else {
          if(dataValue) {
            counter++
          }
        }
      }
    }

    return counter === conditions.length ? true : false
  }

  private getVariables(text: string): RegExpMatchArray | null {
    return text.match(/\[\[(.*?)]]/ig) || null
  }

  private removeBrackets(textWithBrackets: string): string {
    return textWithBrackets.replace(/\s/g, '').replace(' ', '').replace('[[', '').replace(']]', '');
  }

  private replaceVariables(originalText: string, dataSourceObject: any) {
    if (!this.isDefined(originalText)) {
      return;
    }

    let extractedVariables = this.getVariables(originalText);
    let providedData = dataSourceObject;
    let finalString = originalText;

    if(extractedVariables) {
      for (let a = 0; a < extractedVariables.length; a++) {
        let currentMatch = extractedVariables[a];


        const matchedMatch = currentMatch.match(/\[/g)

        if(matchedMatch && matchedMatch.length === 2) {
          let currentMatchClean = this.removeBrackets(currentMatch);

          let variableStringFiltered = currentMatchClean
          let format = '';

          if(currentMatchClean.match(/\|/g) !== null) {
            let stringAndFormat = currentMatchClean.split('|');
            variableStringFiltered = stringAndFormat[0];
            format = stringAndFormat[1];
          }

          if (variableStringFiltered.match(/\./g)) {
            let layer1
            let layer2
            const filterMatches = variableStringFiltered.match(/\./g);
            let nrOfLevels = filterMatches ? filterMatches.length : 0;
            let parts = variableStringFiltered.split('.');
            switch (nrOfLevels) {
              case 1:
                providedData = this.data[parts[0]];
                variableStringFiltered = parts[1];

                break;
              case 2:
                layer1 = this.data[parts[0]];
                providedData = layer1[parts[1]];
                variableStringFiltered = parts[2];

                if(!this.isDefined(providedData[variableStringFiltered])) {
                  providedData = providedData[0];
                }
                break;
              case 3:
                layer1 = this.data[parts[0]];
                layer2 = layer1[parts[2]];
                providedData = layer2[parts[2]];
                variableStringFiltered = parts[3];
                break;
              default:
                providedData = '';
                variableStringFiltered = 'no match';
                break;
            }
          } else {
            // variableStringFiltered = currentMatchClean
          }

          let matched = false;
          let newText = '';

          if(this.isDefined(providedData)) {
            Object.keys(providedData).forEach( (key, index) => {
              if (key === variableStringFiltered) {
                if (String(providedData[variableStringFiltered]).length > 0) {
                  matched = true;
                  newText = String(providedData[variableStringFiltered]);

                  if (this.isDefined(format) && format !== '') {
                    newText = this.formatContent(newText, format);
                  }
                }
              }
            });
          } else {
            console.warn('No match found for', currentMatch)
          }

          if(matched) {
            finalString = finalString.replace(currentMatch, newText);
            // console.log(finalString)
          } else {
            console.warn(finalString + " could not be matched with the provided data.", currentMatch)
            finalString = '';
          }
        } else {
          console.error('A variable in "' + currentMatch + '" is not closed properly', currentMatch)
        }
      }
    }
    return finalString;
  }

  private applyCss(obj: any, css: string): any {
    let extractedCss = Object.entries(css);
    for(let r = 0; r < extractedCss.length; r++) {
      const rule = extractedCss[r];

      if (rule[0] === 'padding' || rule[0] === 'margin') {
        let convertedValues;
        if (typeof rule[1] === 'object') {

          var containsInvalidValues = Object.values(rule[1]).filter(function(item:any,index) {
            return isNaN(item) // || (item % 1 != 0)
          })

          if(containsInvalidValues.length > 0) {
            console.error('The '+ rule[0]+' array can only contain numeric values (millimeters)');
          }

          convertedValues = this.convertSpacingArrayToObject(rule[1]);
  
        } else {
          convertedValues = this.convertSpacingArrayToObject([parseInt(rule[1])]);
        }

        obj.style[rule[0].toLowerCase() + '-top'] = String(convertedValues.top) + 'mm';
        obj.style[rule[0].toLowerCase() + '-right'] = String(convertedValues.right) + 'mm';
        obj.style[rule[0].toLowerCase() + '-bottom'] = String(convertedValues.bottom) + 'mm';
        obj.style[rule[0].toLowerCase() + '-left'] = String(convertedValues.left) + 'mm';
      } else {
        obj.style[rule[0]] = rule[1];
      }
    }
    return obj;
  }

  private defineVisibility(elementIndex: number, element: any, template: any, newContent: any): any {
    for (let c = 0; c < newContent.length; c++) {
      let contentIndex = c;
      if (template.content === newContent[c][0] && elementIndex === contentIndex) {
        const visibility = newContent[c][2];
        if (this.isDefined(visibility)) {
          if (!visibility) {
            element.style.display = 'none';
          }
        }
      }
    }
    return element;
  }

  private insertElementsInCol(col: any, html: any, newContent: any): any {
    for (let a = 0; a < html.length; a++) {
      const part = html[a];
      if (!this.isDefined(part.element)) {
        part.element = this.defaultElement;
      }

      let element = document.createElement(part.element);

      if (this.isDefined(newContent)) {
        element = this.defineVisibility(a, element, part, newContent);
      }
      if (this.isDefined(part.css)) {
        element = this.applyCss(element, part.css);
      }
      if (this.isDefined(part.content)) {
        if (part.element === 'img') {
          element.src = part.content;
        } else {
          element.innerHTML = part.content;
        }
      }

      col.appendChild(element);

      if (part.break) {
        let clearBoth = document.createElement('div');
        clearBoth.style.clear = 'both';
        col.appendChild(clearBoth);
      }
    }
    return col;
  }

  private defineDataSource(key: string): any {
    let dataSourceObject = key;

    if(dataSourceObject.match(/\./g)) {
      const filterMatches = dataSourceObject.match(/\./g)
      let nrOfLevels = filterMatches ? filterMatches.length : 0;
      let parts = dataSourceObject.split('.');
      let layer1, layer2, layer3;

      switch (nrOfLevels) {
        case 1:
          layer1 = this.data[parts[0]];
          dataSourceObject = layer1[parts[1]];
          break;
        case 2:
          layer1 = this.data[parts[0]];
          layer2 = layer1[parts[1]];
          dataSourceObject = layer2[parts[2]];
          break;
        case 3:
          layer1 = this.data[parts[0]];
          layer2 = layer1[parts[1]];
          layer3 = layer2[parts[2]];
          dataSourceObject = layer3[parts[3]];
          break;
        default:
          break;
      }
    } else {
      dataSourceObject = this.data;
    }

    return dataSourceObject;
  }

  private calcColumnWidth(size: number, rowWidth: number): number {
    size = (size === null || size > 12 || size === undefined) ? 12 : size;
    return (size * (rowWidth / 12)) * 0.996;
  }

  private calcRowWidth(printableAreaWidth: any, currentSize: any, gutter: any) {
    let newRowWidth;
    if(currentSize < 12 && currentSize > 1) {
      newRowWidth= printableAreaWidth-gutter;
    } else {
      newRowWidth = printableAreaWidth;
    }
    return newRowWidth;
  }

  private calcColumnGutter(currentSize: any, gutter: any) {
    return ((12 - currentSize) * gutter) / currentSize;
  }

  private createCol(i: number, nrOfCols: number, newRowWidth: number, gutterSize: string, colObject: any, dataSourceObject: any = null, currentSize: number = 12) {
    let html = (colObject.html || '');
    let element = (colObject.element || 'div');
    let forEach = (colObject.forEach || '');
    let htmlBefore = (colObject.htmlBefore || '');
    let htmlAfter = (colObject.htmlAfter || '');

    let col = document.createElement(element);
    let newContent = [];

    if (html.length > 0) {
      if (typeof html[0] === 'object') {
        for( let e = 0; e < html.length; e++) {
          html[e].content = html[e].content.replace('/>', '>');

          if (this.isDefined(html[e].if)) {
            newContent.push([
              html[e].content,
              this.replaceVariables(html[e].content, dataSourceObject),
              this.checkConditions(html[e].if, dataSourceObject)
            ]);
          } else {
            newContent.push([
              html[e].content,
              this.replaceVariables(html[e].content, dataSourceObject)
            ])
          }
        }
        col = this.insertElementsInCol(col, html, newContent);
      } else {
        let template = html.replace('/>', '>');
        html = '';
        if (forEach !== '') {

          dataSourceObject = this.defineDataSource(forEach);

          for(let d = 0; d < dataSourceObject.length; d++) {
            let entry = dataSourceObject[d];
            let extractedVariables = this.getVariables(template);
            let htmlConcept = '';

            if(extractedVariables) {
              for (let v = 0; v < extractedVariables.length; v++) {
                let matched = false;
                let oldText = extractedVariables[v];
                let newText = '';

                let searchFor = this.removeBrackets(extractedVariables[v]);

                let variableStringFiltered = searchFor;
                let format = ''

                if (searchFor.match(/\|/g) !== null) {
                  let stringAndFormat = searchFor.split('|');
                  variableStringFiltered = stringAndFormat[0];
                  format = stringAndFormat[1]
                }

                Object.keys(entry).forEach((key, index) => {
                  if (key === variableStringFiltered) {
                    if (String(entry[variableStringFiltered]).length > 0) {
                      matched = true;
                      newText = String(entry[variableStringFiltered]);

                      if (this.isDefined(format) && format !== 'null') {
                        newText += this.formatContent(newText, format);
                      }
                    }
                  }
                });

                if (matched) {
                  htmlConcept = htmlConcept.replace(oldText, newText);
                }
              }
            }
            html += htmlConcept
          }
        } else {
          html += this.replaceVariables(template, dataSourceObject);
        }
        col.innerHTML = html;
      }
    }

    col.classList.add('pncol');
    col.classList.add('pncol-' + currentSize);

    let thisColWidth = this.calcColumnWidth(currentSize, newRowWidth);

    if( (i+1) < nrOfCols) {
      col.style.marginRight = gutterSize + 'mm';
    }

    col.style.width = String(thisColWidth) + 'mm';
    col.newContent = newContent;

    if (colObject.htmlBefore) {
      col.innerHTML = htmlBefore + col.innerHTML + htmlAfter;
    }

    return col;
  }

  private makePdf(templateString: string, dataString: string): Promise<string> {
    if (!this.isValidJson(templateString)) {
      console.error('Template is geen geldige JSON');
      return Promise.reject('TEMPLATE_NOT_VALID');
    }
    if (!this.isValidJson(dataString)) {
      console.error('Data is geen geldige JSON');
      return Promise.reject('DATA_NOT_VALID');
    }

    const template = JSON.parse(templateString);
    const dataObject = JSON.parse(dataString);

    console.log('template', template)
    console.log('dataObject', dataObject)

    this.setProperties(template, dataObject);
    this.paperSize = this.definePaperSize(this.paperSize, this.margins);
    this.parsedPaperSize = this.paperSize;

    if (template.orientation !== 'portrait') {
      if (this.paperSize.width > this.paperSize.height) {
        console.error('The paper height is already in landscape. Decrease the paper or change orientation to "portrait"');
        return Promise.reject('INVALID_PAPER_SIZE');
      }
      // Flip page sizes to make it landscape
      this.paperSize.height = this.paperSize.width;
      this.paperSize.width = this.paperSize.height;
    }

    let margins = this.convertSpacingArrayToObject(this.margins);
    let rows = this.createRowsFromLayout(this.paperSize);

    this.pdfContainer.innerHTML = "";

    let pages = [];
    let page = this.createPage(margins);
    let lastPageNumber = 1;
    let foreachStarted = false;

    for (let r = 0; r < rows.length; r++) {
      let row = rows[r];

      if (row.dataset.inForeach === 'true') {
        if (!foreachStarted) {
          foreachStarted = true
        }
      } else {
        foreachStarted = false
      }

      let nextRow = rows[r+1];
      if (this.isDefined(nextRow)) {
        if (foreachStarted && nextRow.outerHTML.indexOf('in-foreach') < 1) {
          if (row.pageNumber < this.totalPageCount) {
            if (row.dataset.currentContentHeight > (row.dataset.maxContentHeight * 0.085)) {
              row.pageNumber++
            }
          }
        }
      }

      if (row.pageNumber === lastPageNumber) {
        page = this.addRowToPageWrap(page, row);
      } else {
        pages.push(page);
        page = this.createPage(margins);
        page = this.addRowToPageWrap(page, row);
      }

      lastPageNumber = row.pageNumber;
    }

    pages.push(page)

    return Promise.resolve(this.convertPagesToHtml(pages, this.paperSize));
  }

  createPdf(templateString: string, dataString: string, viewContainerRef: ViewContainerRef, fileName: string): void {
    // Remove eventually existing component
    viewContainerRef.detach()

    // Step 2: Create element in DOM to generate correct styling
    const factory = this.factoryResolver.resolveComponentFactory(PdfComponent);
    const component = factory.create(viewContainerRef.parentInjector)
    component.instance.pdfString = 'TEST'
    // console.log('component', component)
    viewContainerRef.insert(component.hostView)


    setTimeout( () => {
      this.makePdf(templateString, dataString)
        .then( (htmlString: string) => {
          // console.log('PDFSTRING', htmlString)
          //component.instance.pdfString = htmlString
          component.instance.setStyle(this.parsedPaperSize)
          component.instance.setHtmlContent(htmlString)


          // html2canvas(component.location.nativeElement).then( (canvas) => {
          //   const imgData = canvas.toDataURL("image/jpg")
          //   const pdfDoc = new jsPDF({
          //     orientation: this.orientation === 'landscape' ? 'landscape' : 'portrait', //direct passing variable it not allowed due to variabele types
          //     unit: 'mm',
          //     format: [this.parsedPaperSize.width, this.parsedPaperSize.height]
          //   })
          //   const imageProps = pdfDoc.getImageProperties(imgData);
          //   const pdfw = pdfDoc.internal.pageSize.getWidth();
          //   const pdfh = (imageProps.height * pdfw) / imageProps.width;
          //   pdfDoc.addImage(imgData, 'PNG', 0,0, pdfw, pdfh)
          //
          //   pdfDoc.save("test.pdf")
          //
          // })
          // console.log('paperSize', this.paperSize)

          let pdfDoc = new jsPDF({
            orientation: this.orientation === 'landscape' ? 'landscape' : 'portrait', //direct passing variable it not allowed due to variabele types
            unit: 'mm',
            format: [this.parsedPaperSize.width, this.parsedPaperSize.height]
          }).html(htmlString)
          // pdfDoc.html(htmlString)
          // pdfDoc.setProperties({
          //   title: fileName,
          //   author: 'PrismaNote Software',
          //   creator: 'PrismaNote Software'
          // })

          pdfDoc.save(fileName + '.pdf')
            .then( () => {

            })
            .catch((e) => {
              console.error('PDF Error', e)
            })


        })
        .catch( (e) => {
          console.error(e)
        })


    }, 1000)

  }
}
