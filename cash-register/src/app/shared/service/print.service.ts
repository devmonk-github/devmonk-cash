import { Injectable } from '@angular/core';
import {ApiService} from "./api.service";

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
    return new Promise( (onSuccess, onError) => {
      this.apiService.getNew('cashregistry', '/api/v1/printnode/computers?id=' + businessId).subscribe(
        (computers : any) => {
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
    return new Promise( (onSuccess, onError) => {
      this.apiService.postNew('cashregistry', 'api/v1/printnode/register', {data}).subscribe(
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
  getPrinters(businessId: string, deviceId: string|null, printerId: string|null) {
    return new Promise( (onSuccess, onError) => {
      this.apiService.getNew('cashregistry', '/api/v1/printnode/printers?id=' + businessId + '&deviceId=' + deviceId + '&printerId=' +  printerId, ).subscribe(
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
   * @param {Object|null} options
   */
  printPDF(businessId: string, doc: string, printer: string, computer: string, qty: number, options: any|null) {
    return new Promise( (onSuccess, onError) => {
      this.apiService.postNew('cashregistry', '/api/v1/printnode/', {
        id: businessId,
        contentType: 'pdf_base64',
        content: doc,
        printerId: printer,
        computerId: computer,
        quantity: qty,
        options: options
      }).subscribe(
        (result: any) => {
          if(result.data.deviceStatus === 'disconnected') {
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
  printRawContent(businessId: string, doc: any, printer: string, computer: string, qty: number, options: any|null) {
    return new Promise( (onSuccess, onError) => {
      this.apiService.postNew('cashregistry', '/api/v1/printnode', {
        id: businessId,
        contentType: 'raw_base64',
        printerId: printer,
        computerId: computer,
        quantity: qty,
        options: options
      }).subscribe( (result: any) => {
        if(result.data.deviceStatus === 'disconnected') {
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
  openDrawer(businessId: string, command: string, printer: string, computer: string) {
    return this.printRawContent(businessId, command, printer, computer, 1, {title: 'Open drawer'})
  }
}
