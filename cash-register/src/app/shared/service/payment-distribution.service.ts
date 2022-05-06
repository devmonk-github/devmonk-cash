import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PaymentDistributionService {

  constructor() { }

  roundToXDigits(value: number) {
    const digits = 2;
    value = value * Math.pow(10, digits);
    value = Math.round(value);
    value = value / Math.pow(10, digits);
    return value;
  }

  distributeAmount(transactionItems: any[], availableAmount: any): any[] {
    transactionItems.map((i: any) => {
      i.amountToBePaid = i.price * i.quantity - (i.prePaidAmount || 0);
      if (i.tType && i.tType === 'refund') {
        availableAmount += i.prePaidAmount;
        if (i.amountToBePaid === 0) {
          i.amountToBePaid = -1 * i.prePaidAmount;
        }
      }
      if (i.paymentAmount > i.amountToBePaid) {
        i.paymentAmount = i.amountToBePaid;
      };
      return i;
    });
    const setAmount = transactionItems.filter(item => item.isExclude);
    setAmount.map(i => (i.paymentAmount = 0));

    // const arrToUpdate = transactionItems.filter(item => !item.isExclude);
    const arrToUpdate = transactionItems.filter(item => !item.manualUpdate && !item.isExclude);

    const arrNotToUpdate = transactionItems.filter(item => item.manualUpdate && !item.isExclude);
    const assignedAmountToManual = arrNotToUpdate.reduce((n, { paymentAmount }) => n + paymentAmount, 0);
    availableAmount -= assignedAmountToManual;

    const totalAmountToBePaid = arrToUpdate.reduce((n, { amountToBePaid }) => n + amountToBePaid, 0);
    arrToUpdate.map(i => (i.paymentAmount = this.roundToXDigits(i.amountToBePaid * availableAmount / Math.abs(totalAmountToBePaid))));
    const assignedAmount = arrToUpdate.reduce((n, { paymentAmount }) => n + paymentAmount, 0);
    arrToUpdate[arrToUpdate.length - 1].paymentAmount += (availableAmount - assignedAmount);
    return transactionItems;
  }

  updateAmount(transactionItems: any[], availableAmount: any, index: number): any[] {

    transactionItems.forEach(tItem => {
      if (tItem.paymentAmount > tItem.amountToBePaid) {
        tItem.paymentAmount = tItem.amountToBePaid;
      }
      if (tItem.tType && tItem.tType === 'refund') {
        availableAmount += tItem.prePaidAmount;
      }
    });
    transactionItems[index].manualUpdate = true;
    const arrNotToUpdate = transactionItems.filter(item => item.manualUpdate && !item.isExclude);
    const assignedAmountToManual = arrNotToUpdate.reduce((n, { paymentAmount }) => n + paymentAmount, 0);
    availableAmount -= assignedAmountToManual;
    const arrToUpdate = transactionItems.filter(item => !item.manualUpdate && !item.isExclude);
    const totalAmountToBePaid = arrToUpdate.reduce((n, { amountToBePaid }) => n + amountToBePaid, 0);
    arrToUpdate.map(i => (i.paymentAmount = this.roundToXDigits(i.amountToBePaid * availableAmount / Math.abs(totalAmountToBePaid))));
    const assignedAmount = arrToUpdate.reduce((n, { paymentAmount }) => n + paymentAmount, 0);
    arrToUpdate[arrToUpdate.length - 1].paymentAmount += (availableAmount - assignedAmount);
    return transactionItems;
  }
}