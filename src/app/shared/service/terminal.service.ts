import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class TerminalService {
  iBusinessId = localStorage.getItem('currentBusiness');
  iWorkstationId = localStorage.getItem('currentWorkstation');
  
  constructor(private apiService: ApiService) { }

  getTerminals(): Observable<any> {
    return this.apiService.getNew('cashregistry', `/api/v1/pin-terminal/get-terminals?iBusinessId=${this.iBusinessId}`).pipe(retry(1));
  }

  startTerminalPayment(amount: number): Observable<any> {
    const oBody = {
      amount,
      iBusinessId: this.iBusinessId, 
      iWorkstationId: this.iWorkstationId 
    }
    return this.apiService.postNew('cashregistry', `/api/v1/pin-terminal/start-payment`, oBody).pipe(retry(1));
  }


  getGiftCardInformation(cardDetails: any): Observable<any> {
    cardDetails.iBusinessId = this.iBusinessId;
    return this.apiService.postNew('cashregistry', `/api/v1/pin-terminal/get-giftcard`, cardDetails).pipe(retry(1));
  }
}