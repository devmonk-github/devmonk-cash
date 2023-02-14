import { Injectable } from '@angular/core';
import { ToastService } from '../components/toast';

@Injectable({
  providedIn: 'root'
})
export class PaymentDistributionService {
  
  toastService: ToastService;

  constructor() { }

  roundToXDigits(value: number) {
    const digits = 2;
    value = value * Math.pow(10, digits);
    value = Math.round(value);
    value = value / Math.pow(10, digits);
    return value;
  }

  setToastService(toastService: ToastService) {
    this.toastService = toastService;
  }
  
  distributeAmount(transactionItems: any[], availableAmount: any): any[] {
    const bTesting = false;
    if(bTesting) console.log('distributeAmount',{availableAmount})
    
    transactionItems = transactionItems.filter((i:any) => i.type !== 'empty-line')
    transactionItems.forEach((i: any) => {
      if (bTesting) console.log(i);
      
      let _nDiscount = 0;
      if (i.nDiscount > 0 && !i.bDiscountOnPercentage) _nDiscount = i.nDiscount
      else if (i.nDiscount > 0 && i.bDiscountOnPercentage) _nDiscount = i.price * (i.nDiscount / 100)
      
      if (bTesting)  console.log(26, i.price, i.prePaidAmount)
      
      i.amountToBePaid = i.price * i.quantity - (i.prePaidAmount || 0) - (_nDiscount * i.quantity || 0);
      if (bTesting)  console.log(28, 'amountToBePaid', i.amountToBePaid)
      
      if (i.type === 'gold-purchase') i.amountToBePaid = -(i.amountToBePaid);

      if (i.tType && i.tType === 'refund') i.amountToBePaid = -(i.prePaidAmount);
      
      if (bTesting)  console.log('paymentAmount', i.paymentAmount)
      if (i.paymentAmount > i.amountToBePaid) i.paymentAmount = i.amountToBePaid;

      
    });
    // const setAmount = transactionItems.filter(item => item.isExclude).map(i => (i.paymentAmount = 0));
    
    const arrToUpdate = transactionItems.filter(item => !item?.manualUpdate && !item?.isExclude);
    const arrNotToUpdate = transactionItems.filter(item => item?.manualUpdate || item?.isExclude);
    
    if (bTesting)  console.log({update: arrToUpdate, notToUpdate: arrNotToUpdate})
    
    const assignedAmountToManual = arrNotToUpdate.reduce((n, { paymentAmount }) => n + paymentAmount, 0);
    availableAmount -= assignedAmountToManual
    
    if (bTesting) console.log('assignedAmountToManual', assignedAmountToManual, 'availableAmount', availableAmount)

    if (arrToUpdate?.length) {
      let totalAmountToBePaid = arrToUpdate.reduce((n, { amountToBePaid }) => n + amountToBePaid, 0); // + assignedAmountToManual
      if (bTesting)  console.log('totalAmountToBePaid', totalAmountToBePaid)
      if (totalAmountToBePaid !== 0) {

        const aGiftcard = arrToUpdate.filter((el:any) => el.type === 'giftcard');

        if(aGiftcard?.length) {
          aGiftcard.forEach((i:any) => {
            if (availableAmount >= i.amountToBePaid) {
              // console.log('if 64')
              i.paymentAmount = i.amountToBePaid;
              availableAmount -= i.amountToBePaid;
              totalAmountToBePaid -= i.amountToBePaid;
              if (bTesting)  console.log('giftcard full payment amount', i.paymentAmount);
            } else {
              // console.log('else 68')
              i.paymentAmount = availableAmount;
              availableAmount -= i.paymentAmount;
              if (bTesting)  console.log('73 giftcard part payment amount', i.paymentAmount);
            };
          })
        }
        arrToUpdate.map(i => {
          if(i.type !== 'giftcard') {
            const a = this.roundToXDigits(i.amountToBePaid * availableAmount / totalAmountToBePaid);
            i.paymentAmount = a;
          }
        });
      }
      // const assignedAmount = arrToUpdate.reduce((n, { paymentAmount }) => n + paymentAmount, 0);
      // if (bTesting) console.log('assignedAmount', assignedAmount, 'availableAmount', availableAmount)
      // if(availableAmount > 0) arrToUpdate[arrToUpdate.length - 1].paymentAmount += (availableAmount - assignedAmount);
      // console.log("updated last item's paymentAmount to ", (availableAmount - assignedAmount))
      // console.log('last item is ', arrToUpdate[arrToUpdate.length - 1])
    }
    arrToUpdate.forEach(element => {
      if (bTesting)  console.log(69, { paymentAmount : element.paymentAmount, nTotal: element.nTotal})
      // if (availableAmount === 0) {
      //   console.log('setting payment amount to 0')
      //   element.paymentAmount = 0;
      //   return;
      // }

      if (element.paymentAmount >= element.nTotal){
        element.paymentAmount = element.nTotal;
        element.oType.bPrepayment = false;
      } else if (element.paymentAmount < element.nTotal){
        element.oType.bPrepayment = true;
      }

    });
    return transactionItems;
  }

  updateAmount(transactionItems: any[], availableAmount: any, index: number): any[] {
    transactionItems.map((i: any) => {
      // i.amountToBePaid = i.price * i.quantity - (i.prePaidAmount || 0);
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
    transactionItems[index].manualUpdate = true;
    const arrNotToUpdate = transactionItems.filter(item => item.manualUpdate && !item.isExclude);
    const assignedAmountToManual = arrNotToUpdate.reduce((n, { paymentAmount }) => n + paymentAmount, 0);
    availableAmount -= assignedAmountToManual;
    const arrToUpdate = transactionItems.filter(item => !item.manualUpdate && !item.isExclude);

    if (arrToUpdate.length > 0) {
      const totalAmountToBePaid = arrToUpdate.reduce((n, { amountToBePaid }) => n + amountToBePaid, 0);
      arrToUpdate.map(i => (i.paymentAmount = this.roundToXDigits(i.amountToBePaid * availableAmount / Math.abs(totalAmountToBePaid))));
      const assignedAmount = arrToUpdate.reduce((n, { paymentAmount }) => n + paymentAmount, 0);
      arrToUpdate[arrToUpdate.length - 1].paymentAmount += (availableAmount - assignedAmount);
    }
    arrToUpdate.forEach(element => {
      if (element.paymentAmount > element.nTotal) {
        element.paymentAmount = element.nTotal;
      }
    });
    return transactionItems;
  }
}
