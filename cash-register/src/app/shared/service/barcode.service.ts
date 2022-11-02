import { EventEmitter, Injectable } from '@angular/core';
declare const onScan: any;

@Injectable()
export class BarcodeService {

  barcodeScanned = new EventEmitter<String>()

  constructor() {
    console.log('barcode scanner service initialized');
    // see full doc at https://github.com/axenox/onscan.js
    onScan.attachTo(document, {
      suffixKeyCodes: [13], // after sending a key 13 (enter) always stop collecting data
      reactToPaste: false, // react to scanner which has a copy/past function
      avgTimeByChar: 20, // time between chars in ms, higher value make slower scanners compatible, but also higher the risk that a fast typing human will be detected as scanner
      // I tested this value after 20 is the highest at this moment
      onScan: (code: any) => {
        // console.log(19, code);
        this.barcodeScanned.emit(code);
      },
      keyCodeMapper: (oEvent: any) => {
        if (oEvent.key === '-') {
          return '-'
        }
        // console.log(oEvent);
        return onScan.decodeKeyEvent(oEvent);
      }
    });
  }
}
