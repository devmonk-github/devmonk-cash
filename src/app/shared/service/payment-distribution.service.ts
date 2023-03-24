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
  
  distributeAmount(transactionItems: any[], availableAmount: any, nGiftcardAmount:any = 0, nRedeemedLoyaltyPoints:any = 0): any[] {
    const bTesting = false;
    if (bTesting) console.log('distributeAmount', { availableAmount, nGiftcardAmount, nRedeemedLoyaltyPoints })
    
    transactionItems = transactionItems.filter((i:any) => i.type !== 'empty-line')
    transactionItems.forEach((i: any) => {
      if (bTesting) console.log(31, i, i.nTotal);
      
      let _nDiscount = 0;
      if (i.nDiscount > 0 && !i.bDiscountOnPercentage) _nDiscount = i.nDiscount
      else if (i.nDiscount > 0 && i.bDiscountOnPercentage) _nDiscount = i.price * (i.nDiscount / 100)
      
      if (bTesting)  console.log(26, i.price, i.prePaidAmount)
      
      i.amountToBePaid = ((typeof i.price === 'string') ? i.price.replace(',','.') : i.price) * i.quantity - (i.prePaidAmount || 0) - (_nDiscount * i.quantity || 0);
      if (bTesting)  console.log(28, 'amountToBePaid', i.amountToBePaid)
      
      if (i.type === 'gold-purchase') i.amountToBePaid = -(i.amountToBePaid);

      if (i?.tType && i.tType === 'refund'){
        i.amountToBePaid = (i?.new) ? -(i.price) : -(i.nRefundAmount);
        availableAmount += i.price;
        if (bTesting) console.log('item type is refund, increased available amount =  ', availableAmount, 'i.price=', i.price, 'setting giftcard discount to 0')
        i.nGiftcardDiscount = 0;
      } 
      
      if (bTesting)  console.log('46 paymentAmount', i.paymentAmount, 'amountToBePaid', i.amountToBePaid);
      if (i.paymentAmount > i.amountToBePaid) i.paymentAmount = i.amountToBePaid;
      if (bTesting) console.log('48 paymentAmount', i.paymentAmount)

      
    });
    // const setAmount = transactionItems.filter(item => item.isExclude).map(i => (i.paymentAmount = 0));
    
    const arrToUpdate = transactionItems.filter(item => !item?.manualUpdate && !item?.isExclude);
    const arrNotToUpdate = transactionItems.filter(item => item?.manualUpdate || item?.isExclude);
    
    if (bTesting)  console.log({update: arrToUpdate, notToUpdate: arrNotToUpdate})
    
    const assignedAmountToManual = arrNotToUpdate.reduce((n, { paymentAmount }) => n + paymentAmount, 0);
    availableAmount -= assignedAmountToManual
    
    if (bTesting) console.log('assignedAmountToManual', assignedAmountToManual, 'availableAmount', availableAmount)

    if (arrToUpdate?.length) {
      let totalAmountToBePaid = arrToUpdate.filter(el => el.amountToBePaid > 0).reduce((n, { amountToBePaid }) => n + amountToBePaid, 0); // + assignedAmountToManual
      if (bTesting)  console.log('totalAmountToBePaid', totalAmountToBePaid)
      
      if (totalAmountToBePaid !== 0) {
        
        arrToUpdate.forEach(i => {
          if (i.type !== 'giftcard' && nGiftcardAmount > 0 && i?.tType !== 'refund') {
            i.nGiftcardDiscount = +((i.amountToBePaid * nGiftcardAmount / totalAmountToBePaid).toFixed(2));
            if (bTesting) console.log('nGiftcardDiscount', i.nGiftcardDiscount)

            i.amountToBePaid -= i.nGiftcardDiscount;
            if (bTesting) console.log('reduced amountToBePaid', i.amountToBePaid);
          }

          if (i?.tType === 'refund') i.nGiftcardDiscount = 0;
        });
        
        if(nGiftcardAmount > 0){
          totalAmountToBePaid = arrToUpdate.reduce((n, { amountToBePaid }) => n + amountToBePaid, 0);
          if (bTesting) console.log('new totalAmountToBePaid', totalAmountToBePaid)
        } 

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
          if (bTesting) console.log(107, 'i.tType',i.tType);
          if (i.type !== 'giftcard' && i.amountToBePaid && (!i?.tType || i.tType !== 'refund')) {
            const a = +((i.amountToBePaid * availableAmount / totalAmountToBePaid).toFixed(2));
            if (bTesting) console.log('set to payment',a)
            i.paymentAmount = a;
          }
        });
      }
      
      availableAmount -= arrToUpdate.reduce((n, { paymentAmount }) => n + paymentAmount, 0);
      if (bTesting) console.log('after assigning amounts, remaining availableAmount is', availableAmount);

      let assignedAmount = arrToUpdate.reduce((n, { paymentAmount }) => n + paymentAmount, 0);
      if (bTesting) console.log('assignedAmount', assignedAmount, 'availableAmount', availableAmount)
      if(availableAmount > 0 && assignedAmount != 0) {
        if (bTesting) console.log('availableAmount > 0', availableAmount)
        if(assignedAmount > 0) {
          if (bTesting) console.log('assignedAmount > 0', assignedAmount)
          arrToUpdate[arrToUpdate.length - 1].paymentAmount += (availableAmount - assignedAmount);
          if (bTesting) console.log("updated last item's paymentAmount to ", (availableAmount - assignedAmount))
        } else {
          if (bTesting) console.log('assignedAmount < 0', assignedAmount)
          assignedAmount = -assignedAmount;
          arrToUpdate.map(i => {
            if (i.type !== 'giftcard' && i.tType !== 'refund') {
              const a = +((i.amountToBePaid * availableAmount / assignedAmount).toFixed(2));
              if (bTesting) console.log('125 set to payment', a)
              i.paymentAmount = a;
            }
          });
        }
      } 
      // console.log('last item is ', arrToUpdate[arrToUpdate.length - 1])
    }
    arrToUpdate.forEach(element => {
      // if (bTesting)  console.log(109, { paymentAmount : element.paymentAmount, nTotal: element.nTotal})
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
    if(bTesting) console.log('final',transactionItems)
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
