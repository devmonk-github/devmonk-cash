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


  loginToFiskaly() {
    console.log('login to fiskaly');
    this.apiService.postNew('auth', '/api/v1/fiskaly/login', {})
      .subscribe((result: any) => {
        localStorage.setItem('fiskalyAuth', JSON.stringify(result.data));
      }, error => {
        console.log(error);
      });
  }

  startTransaction(): Observable<any> {
    let fiskalyAuth: any = localStorage.getItem('fiskalyAuth');
    fiskalyAuth = JSON.parse(fiskalyAuth);

    const guid = uuidv4();
    const body = {
      'state': 'ACTIVE',
      'client_id': '6d87dbd2-020b-4f0f-9973-2bff24811e05'
    };
    const tssId = 'a3b275d4-0c70-418c-a06f-efebdebb79b3';
    const finalUrl = `${this.fiskalyURL}/tss/${tssId}/tx/${guid}?tx_revision=1`;
    let httpHeaders = {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${fiskalyAuth.access_token}` }
    }
    return this.httpClient.put<any>(finalUrl, body, httpHeaders)
      .pipe(retry(1));
  }

  roundToXDigits(value: number) {
    const digits = 2;
    value = value * Math.pow(10, digits);
    value = Math.round(value);
    value = value / Math.pow(10, digits);
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
    let fiskalyAuth: any = localStorage.getItem('fiskalyAuth');
    fiskalyAuth = JSON.parse(fiskalyAuth);

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
    const finalUrl = `${this.fiskalyURL}/tss/${tssId}/tx/${fiskalyTransaction._id}?tx_revision=${fiskalyTransaction.revision + 1}`;
    let httpHeaders = {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${fiskalyAuth.access_token}` }
    }
    return this.httpClient.put<any>(finalUrl, body, httpHeaders)
      .pipe(retry(1));
  }

  async fetchTSS() {
    const guid = uuidv4();
    let fiskalyAuth: any = localStorage.getItem('fiskalyAuth');

    fiskalyAuth = JSON.parse(fiskalyAuth);
    const location = localStorage.getItem('currentLocation') || 'asperen'

    // const body = {
    //   metadata: {
    //     location: localStorage.getItem('currentLocation') || 'asperen',
    //   },
    // };

    const finalUrl = `${this.fiskalyURL}/tss`;
    let httpHeaders = {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${fiskalyAuth.access_token}` }
    };
    const result = await this.httpClient.get<any>(finalUrl, httpHeaders).toPromise();
    const tss = result.find((o: any) => o.metadata.location === location);
    console.log(tss);
    console.log(result);
  }

  createTSS(): Observable<any> {
    const guid = uuidv4();
    let fiskalyAuth: any = localStorage.getItem('fiskalyAuth');

    fiskalyAuth = JSON.parse(fiskalyAuth);

    const body = {
      metadata: {
        location: localStorage.getItem('currentLocation') || 'asperen',
      },
    };

    const finalUrl = `${this.fiskalyURL}/tss/${guid}`;
    let httpHeaders = {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${fiskalyAuth.access_token}` }
    };
    return this.httpClient.put<any>(finalUrl, body, httpHeaders).pipe(retry(1));
  }

  // finishTransaction(cardDetails: any): Observable<any> {
  //   const iBusinessId = localStorage.getItem('currentBusiness');
  //   // {{baseUrl}}/tss/{{tssId}}/tx/{{txId}}?tx_revision=4
  //   // cardDetails.iBusinessId = iBusinessId;
  //   // return this.apiService.postNew('cashregistry', `/api/v1/pin-terminal/get-giftcard`, cardDetails).pipe(retry(1));
  // }
}