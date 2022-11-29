import { Injectable } from '@angular/core';
import { ApiService } from "./api.service";

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  constructor(private apiService: ApiService) { }

  /**
   * Get all connected devices for this printNode account
   * @param {String} businessId
   */
  getConnectedDevices(businessId: string) {
    return new Promise((onSuccess, onError) => {
      this.apiService.getNew('cashregistry', '/api/v1/printnode/computers?id=' + businessId).subscribe(
        (computers: any) => {
          return onSuccess(computers)
        },
        (error: any) => {
          console.error(error)
          return onError(error)
        }
      );
    })
  }

  /**
   * Register a new child account
   * @param {Object} data
   */
  createChildAccount(data: any) {
    return new Promise((onSuccess, onError) => {
      this.apiService.postNew('cashregistry', 'api/v1/printnode/register', { data }).subscribe(
        (result: any) => {
          return onSuccess(result)
        }, (error: any) => {
          console.error(error)
          return onError(error)
        }
      )
    })
  }

  /**
   * Get all connected printers for an account or computer
   * @param {String} businessId
   * @param {String} deviceId
   * @param {String} printerId
   */
  getPrinters(businessId: string, deviceId: string | null, printerId: string | null) {
    return new Promise((onSuccess, onError) => {
      this.apiService.getNew('cashregistry', '/api/v1/printnode/printers?id=' + businessId + '&deviceId=' + deviceId + '&printerId=' + printerId,).subscribe(
        (printers: any) => {
          return onSuccess(printers)
        }, (error: any) => {
          console.error(error)
          return onError(error)
        }
      )
    })
  }

  /**
   * Prints a PDF File
   * @param {String} businessId
   * @param {String} doc
   * @param {String} printer
   * @param {String} computer
   * @param {Number} qty
   * @param {String|null} transactionId
   * @param {Object|null} options
   */
  printPDF(businessId: string, doc: string, printer: string, computer: string, qty: number, transactionId: string | null, options: any | null) {
    return new Promise((onSuccess, onError) => {
      this.apiService.postNew('cashregistry', '/api/v1/printnode/', {
        iBusinessId: businessId,
        transactionId: transactionId,
        contentType: 'pdf_base64',
        content: doc,
        printerId: printer,
        computerId: computer,
        quantity: qty,
        options: options
      }).subscribe(
        (result: any) => {
          if (result?.data?.deviceStatus === 'disconnected') {
            //TODO: make warning about offline device
            console.warn('DEVICE OFFLINE')
            return onSuccess(result)
          } else {
            return onSuccess(result)
          }
        }, (error: any) => {
          console.error(error)
          return onError(error)
        }
      )
    })
  }

  /**
   * Prints a raw command used for thermal prints or product labels
   * @param {String} businessId
   * @param {String} doc
   * @param {String} printer
   * @param {String} computer
   * @param {Number} qty
   * @param {Object|null} options
   */
  printRawContent(businessId: string, doc: any, printer: any, computer: any, qty: number, options: any | null) {
    return new Promise((onSuccess, onError) => {
      this.apiService.postNew('cashregistry', '/api/v1/printnode', {
        id: businessId,
        iBusinessId: businessId,
        contentType: 'raw_base64',
        //content: doc,
        "content": "\u001b@\u001bt\u0010\n\n\n\n\u001ba\u0001\u001d(L\u0006\u00000E  \u0001\u0001\n\u001ba\u0000\n\u001ba\u0001\u001bE\u0001Juwelier Bos - Test shop\n\u001bE\u0000    __________________________________    \n\n\u001ba\u000028-11-2022 03:00:46       Bonnr:   0000766\n\n\u001b@\u001ba\u0001\u001dh@\u001dw\u0002\u001dH\u0000\u001dkH\u0013T-T0148-281122-1400\u0000\u001ba\u0000\n\u001bt\u0010    __________________________________    \n\n\u001bE\u00011 x Prisma P1177 P1177 \n00017020036                            250\n\u001bE\u0000 \n    __________________________________    \n\nSUBTOTAAL                              250\n\u001bE\u0001TOTAAL                                 250\n\u001bE\u0000\n\u001bE\u0001BETAALMETHODES\n\u001bE\u0000maestro                                250\n\n\u001bE\u0001          Netto     BTW       Totaal\n\u001bE\u0000\nU bent geholpen door:\nbalieklant@prismanote.com\n    __________________________________    \n\u001ba\u0001\nHartelijk dank en graag tot ziens.\nKijk voor onze voorwaarden op\nhttps://www.sluijsmans.eu\n\u001bE\u0001Ruilen binnen 14 dagen met kassabon\n\u001bE\u0000\n\n\u0010\u0014\u0001\u0000\u0005\n\n\n\n\n\n\u001dV\u0000",
        //content: "G0AbdBAKCgoKG2EBHShMBgAwRSAgAQEKG2EAChthAUVyaWtzIFRlc3QgU2hvcApUZXN0c3RyYWF0IDEgCjEyMzRBQiBUZXN0c3RhZCAKMTIzMTIzMjEzMjEKZV9rbG9wQGxpdmUubmwKChthACAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICAgIApEYXR1bTogICAgICAgICAgICAgICAgICAgIDE2LTExLTIwMjIgMTA6NTEKVHJhbnNhY3RpZTogICAgICAgICAgICAgMTA0NjkyLTE2MTEyMi0xMDUxCkJvbm51bW1lcjogICAgICAgICAgICAgICAgICAgICAgICAgIDEwMDI2NgoKG0UBG0UAMDcyNTgxMzA2MCAgCgpHZWFkdmlzZWVyZCBkb29yOiAgICAgICAgICAgICAgICAgICAgIEVyaWsKICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gICAgChtFATEgeCBCZXRhbGluZyB2b29yIGNhZGVhdWthYXJ0IAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIBt0E9UgMjUsMDAKG0UANUdFQjI3NTcKIAogICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAgICAKU1VCVE9UQUFMICAgICAgICAgICAgICAgICAgICAgICAgICAbdBPVIDI1LDAwChtFAVRPVEFBTCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgG3QT1SAyNSwwMAobRQAKG0UBQmV0YWFsbWV0aG9kZXMKG0UAQ29udGFudCAgICAgICAgICAgICAgICAgICAgICAgICAgICAbdBPVIDI1LDAwCgobRQEgICAgICAgICAgTmV0dG8gICAgIEJUVyAgICAgICBUb3RhYWwKG0UAMjEgJSB2YW4gICAgG3QT1SAyMCw2NiAgIBt0E9UgNCwzNCAgICAbdBPVIDI1LDAwICAgICAgCgoKQmVkYW5rdCB2b29yIHV3IGFhbmtvb3AgZW4gZ3JhYWcgdG90CnppZW5zIQoKG0AbYQEdaEAddwIdSAAda0gUVC0xMDQ2OTItMTYxMTIyLTEwNTEAG2EACht0EAoKCgoKCh1WAA==",
        printerId: printer,
        //computerId: computer,
        qty: qty,
        options: {
          title: "test title"
        },
        "expireAfter": 1800,
        "source": "PrismaNote",
        "title": "Aankoop 104692-161122-1051",
      }).subscribe((result: any) => {
        if (result?.data?.deviceStatus === 'disconnected') {
          //TODO: make warning about offline device
          console.warn('DEVICE OFFLINE')
          return onSuccess(result)
        } else {
          return onSuccess(result)
        }
      }, (error: any) => {
        console.error(error)
        return onError(error)
      })
    })
  }

  /**
   * Open the drawer which is connected to a thermal printer
   * @param {String} businessId
   * @param {String} command
   * @param {String} printer
   * @param {String} computer
   */
  openDrawer(businessId: string, command: any, printer: any, computer: any) {
    return this.printRawContent(businessId, command, printer, computer, 1, { title: 'Open drawer' })
  }
}
