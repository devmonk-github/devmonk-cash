import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { ApiService } from './api.service';
import { StringService } from './string.service';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class FiskalyService {
  fiskalyURL = environment.fiskalyURL;
  constructor(
    private apiService: ApiService,
    private stringService: StringService,
    private httpClient: HttpClient) { }

  startTransaction(): Observable<any> {
    console.log('transaction started');
    // let myuuid = uuidv4();

    // console.log(myuuid);
    const iBusinessId = localStorage.getItem('currentBusiness');
    const guid = uuidv4();
    const body = {
      'state': 'ACTIVE',
      'client_id': '6d87dbd2-020b-4f0f-9973-2bff24811e05'
    };
    const tssId = 'a3b275d4-0c70-418c-a06f-efebdebb79b3';
    const token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJTTm5CU0hCTUljQUpBalczaUhDNFRWOTR4MFZCeU00S25LSFJ0eU8tdnBnIn0.eyJqdGkiOiI2MzNkM2UwYS1jNjdiLTRmZjktYWNiNS02NzdjYmFiOGY3ZDIiLCJleHAiOjE2NjAwMzYwMDksIm5iZiI6MCwiaWF0IjoxNjU5OTQ5NjA5LCJpc3MiOiJodHRwczovL2F1dGguZmlza2FseS5jb20vYXV0aC9yZWFsbXMvZmlza2FseSIsInN1YiI6IjM1Y2RjOTUzLWQwYTEtNGE1ZC1hYmU3LWJkMGE2NjI2YjZmZCIsInR5cCI6IkJlYXJlciIsImF6cCI6Imthc3NlbnNpY2h2LWFwaSIsImF1dGhfdGltZSI6MCwic2Vzc2lvbl9zdGF0ZSI6IjQ1MTYyNzJmLTY4YTgtNDdlMi04M2FkLTBjOWQ2NjhlYzJiOSIsImFjciI6IjEiLCJzY29wZSI6Im9yZ2FuaXphdGlvbiIsIm9yZ2FuaXphdGlvbiI6IjdkMTZjYzBmLWE1YjYtNDM0My1hNTA4LWVmYWMwYjY2NzhkZSIsInR5cGUiOiJBUElfS0VZIiwiZW52IjoiVEVTVCJ9.Z-1ANTpyWIjffyttJ5680sdzEK2v8Fa6FgAIDU3TgmsSHoGYWPAuQBsRj6N1WruFDU1p8P-H2OXzQ2hUxzc9b6WQAx83pcjO99QOHxFf-u41Xhi4XLnYEpq5yAHqOK9wOtaGLI1lbTxfX4AEU6aRuFiQzoyrRlZ0pdnBx33kNvqvupcrwuLaZWEEGThOjADf-rMc2CKYAr7ryJMYxCEyF3GqSABYIZxHTEP5Npo1132iJbHBzWKCBIvUKDfBc4S7PGuwQBFPYiOZ0kYnxzBBdKDybpluDJGyAmTTfsWhwcgWNwT10MSjpB6T_VhNkpE-ks0nTZL7pLPRGm6zHAb0Ww';
    const finalUrl = `${this.fiskalyURL}/tss/${tssId}/tx/${guid}?tx_revision=1`;
    let httpHeaders = {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    }
    return this.httpClient.put<any>(finalUrl, body, httpHeaders)
      .pipe(retry(1));
  }

  roundToXDigits(value: number) {
    const digits = 2;
    value = value * Math.pow(10, digits);
    value = Math.round(value);
    value = value / Math.pow(10, digits);
    console.log(value.toFixed(2));
    return value.toFixed(2);
  }

  transactionItemObject(transactionItems: any) {
    const amounts_per_vat_rate: any = [];
    transactionItems.forEach((element: any) => {
      const amount = (element.priceInclVat || element.price) - ((element.priceInclVat || element.price) / (1 + (element.tax / 100))) * element.quantity;
      amounts_per_vat_rate.push({
        vat_rate: 'NORMAL',
        amount: String(this.roundToXDigits(amount)),
      });
    });
    return amounts_per_vat_rate;
  }

  paymentObject(payment: any) {
    console.log(payment);
    const amounts_per_payment_type: any = [];
    const cashArr = payment.filter((o: any) => o.sName.toLowerCase() === 'cash');
    const nCashArr = payment.filter((o: any) => o.sName.toLowerCase() !== 'cash');
    amounts_per_payment_type.push({
      payment_type: 'CASH',
      amount: String(this.roundToXDigits(_.sumBy(cashArr, 'amount') || 0)),
    });
    amounts_per_payment_type.push({
      payment_type: 'NON_CASH',
      amount: String(this.roundToXDigits(_.sumBy(nCashArr, 'amount') || 0)),
    });
    return amounts_per_payment_type;
  }

  createSchema(transactionItems: any) {
    const amounts_per_vat_rate = this.transactionItemObject(transactionItems);
    console.log(amounts_per_vat_rate);
    const schema = {
      standard_v1: {
        receipt: {
          receipt_type: 'RECEIPT',
          amounts_per_vat_rate,
          amounts_per_payment_type: [
            {
              payment_type: 'NON_CASH',
              amount: '0.00'
            }, {
              payment_type: 'CASH',
              amount: '0.00'
            }
          ]
        }
      }
    }
    return schema;
  }
  updateFiskalyTransaction(transactionItems: any, payments: any, state: string): Observable<any> {
    const schema = this.createSchema(transactionItems);
    let fiskalyTransaction: any = localStorage.getItem('fiskalyTransaction');
    if (state === 'FINISHED') {
      const paymentObj = this.paymentObject(payments);
      schema.standard_v1.receipt.amounts_per_payment_type = paymentObj;
    }
    fiskalyTransaction = JSON.parse(fiskalyTransaction)
    const body = {
      state,
      client_id: '6d87dbd2-020b-4f0f-9973-2bff24811e05',
      schema
    };
    const tssId = 'a3b275d4-0c70-418c-a06f-efebdebb79b3';
    const token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJTTm5CU0hCTUljQUpBalczaUhDNFRWOTR4MFZCeU00S25LSFJ0eU8tdnBnIn0.eyJqdGkiOiI2MzNkM2UwYS1jNjdiLTRmZjktYWNiNS02NzdjYmFiOGY3ZDIiLCJleHAiOjE2NjAwMzYwMDksIm5iZiI6MCwiaWF0IjoxNjU5OTQ5NjA5LCJpc3MiOiJodHRwczovL2F1dGguZmlza2FseS5jb20vYXV0aC9yZWFsbXMvZmlza2FseSIsInN1YiI6IjM1Y2RjOTUzLWQwYTEtNGE1ZC1hYmU3LWJkMGE2NjI2YjZmZCIsInR5cCI6IkJlYXJlciIsImF6cCI6Imthc3NlbnNpY2h2LWFwaSIsImF1dGhfdGltZSI6MCwic2Vzc2lvbl9zdGF0ZSI6IjQ1MTYyNzJmLTY4YTgtNDdlMi04M2FkLTBjOWQ2NjhlYzJiOSIsImFjciI6IjEiLCJzY29wZSI6Im9yZ2FuaXphdGlvbiIsIm9yZ2FuaXphdGlvbiI6IjdkMTZjYzBmLWE1YjYtNDM0My1hNTA4LWVmYWMwYjY2NzhkZSIsInR5cGUiOiJBUElfS0VZIiwiZW52IjoiVEVTVCJ9.Z-1ANTpyWIjffyttJ5680sdzEK2v8Fa6FgAIDU3TgmsSHoGYWPAuQBsRj6N1WruFDU1p8P-H2OXzQ2hUxzc9b6WQAx83pcjO99QOHxFf-u41Xhi4XLnYEpq5yAHqOK9wOtaGLI1lbTxfX4AEU6aRuFiQzoyrRlZ0pdnBx33kNvqvupcrwuLaZWEEGThOjADf-rMc2CKYAr7ryJMYxCEyF3GqSABYIZxHTEP5Npo1132iJbHBzWKCBIvUKDfBc4S7PGuwQBFPYiOZ0kYnxzBBdKDybpluDJGyAmTTfsWhwcgWNwT10MSjpB6T_VhNkpE-ks0nTZL7pLPRGm6zHAb0Ww';
    const finalUrl = `${this.fiskalyURL}/tss/${tssId}/tx/${fiskalyTransaction._id}?tx_revision=${fiskalyTransaction.revision + 1}`;
    let httpHeaders = {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    }
    return this.httpClient.put<any>(finalUrl, body, httpHeaders)
      .pipe(retry(1));
  }


  // finishTransaction(cardDetails: any): Observable<any> {
  //   const iBusinessId = localStorage.getItem('currentBusiness');
  //   // {{baseUrl}}/tss/{{tssId}}/tx/{{txId}}?tx_revision=4
  //   // cardDetails.iBusinessId = iBusinessId;
  //   // return this.apiService.postNew('cashregistry', `/api/v1/pin-terminal/get-giftcard`, cardDetails).pipe(retry(1));
  // }
}