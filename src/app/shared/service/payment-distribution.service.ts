import { Injectable } from '@angular/core';
import { ToastService } from '../components/toast';
import { TillService } from './till.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentDistributionService {
  
  toastService: ToastService;

  constructor(private tillService:TillService) { }

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
    if (bTesting) console.log('distributeAmount before', { availableAmount, nGiftcardAmount, nRedeemedLoyaltyPoints, original: JSON.parse(JSON.stringify(transactionItems)) })
    transactionItems = transactionItems.filter((i: any) => !['empty-line', 'loyalty-points'].includes(i.type))
    transactionItems.forEach((i: any) => {
      // if (bTesting) console.log(31, i, i.nTotal);
      
      

      const nPrice = parseFloat((typeof i.price === 'string') ? i.price.replace(',', '.') : i.price);
      i.nTotal = nPrice * i.quantity;
      let nDiscount = (i.bDiscountOnPercentage ? this.tillService.getPercentOf(nPrice, i.nDiscount || 0) : i.nDiscount) * i.quantity;
      nDiscount = +(nDiscount.toFixed(2));
      i.amountToBePaid = i.nTotal - nDiscount - (i.prePaidAmount || 0);
      i.amountToBePaid = +(i.amountToBePaid.toFixed(2))
      if (bTesting) console.log(38, { nPrice, nDiscount, amountToBePaid: i.amountToBePaid, qty: i.quantity})
      
      if (i.type === 'gold-purchase') i.amountToBePaid = -(i.amountToBePaid) ;

      if (i?.tType && i.tType === 'refund'){
        
        if(i?.new) {
          if (bTesting) console.log('refund item is new')
          i.amountToBePaid = -(nPrice * i.quantity - nDiscount - (i?.nGiftcardDiscount || 0) - (i?.nRedeemedLoyaltyPoints || 0));
        } else {
          i.amountToBePaid = -(i.nRevenueAmount * i.quantity).toFixed(2);//-(i.nTotal);
        }
        if (bTesting) console.log('refund amountToBePaid', i.amountToBePaid)
        availableAmount += i.amountToBePaid;
      } 
      i.nGiftcardDiscount = 0;
      i.nRedeemedLoyaltyPoints = 0;
      
      if (bTesting) console.log({ nTotal: i.nTotal, i: JSON.parse(JSON.stringify(i)) }) 
      
      // if (bTesting)  console.log('46 paymentAmount before', i.paymentAmount, 'amountToBePaid', i.amountToBePaid);
      if (i.paymentAmount > i.amountToBePaid) i.paymentAmount = i.amountToBePaid;
      // if (bTesting) console.log('48 paymentAmount after', i.paymentAmount)
    });
    
    const arrToUpdate = transactionItems.filter(item => !item?.manualUpdate && !item?.isExclude);
    const arrNotToUpdate = transactionItems.filter(item => item?.manualUpdate || item?.isExclude);
    
    if (bTesting)  console.log({update: arrToUpdate, notToUpdate: arrNotToUpdate})
    
    const assignedAmountToManual = arrNotToUpdate.reduce((n, { paymentAmount }) => n + paymentAmount, 0);
    availableAmount -= assignedAmountToManual;
    
    if (bTesting) console.log('assignedAmountToManual', assignedAmountToManual, 'availableAmount', availableAmount)
    
    if (arrToUpdate?.length) {
      let totalAmountToBePaid = +(arrToUpdate.filter(el => el.amountToBePaid > 0).reduce((n, { amountToBePaid }) => n + amountToBePaid, 0).toFixed(2)); // + assignedAmountToManual
      if (bTesting) console.log({totalAmountToBePaid})

      const aGiftcards = arrToUpdate.filter((el: any) => el.type === 'giftcard');
      const aItems = arrToUpdate.filter((el: any) => el.type !== 'giftcard');

      if (bTesting) console.log({ aGiftcards })
      if (totalAmountToBePaid > 0 && aGiftcards?.length) {
        const { nAvailable, nPoints }:any = this.assignPaymentToGiftcardFirst(aGiftcards, availableAmount, totalAmountToBePaid, bTesting, nRedeemedLoyaltyPoints);
        if (bTesting) console.log({ nAvailable, nPoints })
        availableAmount = nAvailable;
        nRedeemedLoyaltyPoints = nPoints;

        totalAmountToBePaid = arrToUpdate.filter((el: any) => el.type !== 'giftcard').reduce((n, { amountToBePaid }) => n + amountToBePaid, 0);
        if (bTesting) console.log('now we have available', { availableAmount, totalAmountToBePaid, nRedeemedLoyaltyPoints })
      }
      
      if (totalAmountToBePaid > 0 && nGiftcardAmount > 0){
        this.handleGiftcardDiscount(totalAmountToBePaid, aItems, nGiftcardAmount, bTesting);
        totalAmountToBePaid = +(aItems.reduce((n, { amountToBePaid }) => n + amountToBePaid, 0).toFixed(2));
        if (bTesting) console.log('processed giftcard discount, new totalAmountToBePaid', totalAmountToBePaid)
      }
      
      if (totalAmountToBePaid > 0 && nRedeemedLoyaltyPoints > 0) {
        this.handleLoyaltyPointsDiscount(aItems, totalAmountToBePaid, nRedeemedLoyaltyPoints, bTesting);
        totalAmountToBePaid = aItems.reduce((n, { amountToBePaid }) => n + amountToBePaid, 0);
      }

      if (totalAmountToBePaid !== 0) {

        aItems.forEach(i => {
          if (bTesting) console.log(107, 'i.tType',i.tType);
          if (i.amountToBePaid && (!i?.tType || i.tType !== 'refund')) {
            const a = +((i.amountToBePaid * availableAmount / totalAmountToBePaid).toFixed(2));
            if (bTesting) console.log('set to payment',a)
            i.paymentAmount = a;
          }
        });
      }
      const nDistributedAmount = +(aItems.filter(el => el.amountToBePaid > 0).reduce((n, { paymentAmount }) => n + paymentAmount, 0).toFixed(2))
      availableAmount -= nDistributedAmount;
      if (bTesting) console.log('after assigning amounts, remaining availableAmount is', availableAmount);

      let assignedAmount = +(aItems.reduce((n, { paymentAmount }) => n + paymentAmount, 0).toFixed(2));
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
    const bShowGiftcardDiscountField = arrToUpdate.some(el => el.nGiftcardDiscount);
    const bShowLoyaltyPointsDiscountField = arrToUpdate.some(el => el.nRedeemedLoyaltyPoints);
    if (bTesting) console.log({ bShowGiftcardDiscountField, bShowLoyaltyPointsDiscountField })
    arrToUpdate.forEach(i => {
      i.bShowGiftcardDiscountField = bShowGiftcardDiscountField;
      i.bShowLoyaltyPointsDiscountField = bShowLoyaltyPointsDiscountField;
      
      if (i.paymentAmount >= i.nTotal){
        i.paymentAmount = i.nTotal;
        i.oType.bPrepayment = false;
      } else if (i.paymentAmount < i.nTotal){
        i.oType.bPrepayment = true;
      }
    });
    if(bTesting) console.log('final',transactionItems)
    return transactionItems;
  }
  
  assignPaymentToGiftcardFirst(aGiftcards: any, availableAmount: any, totalAmountToBePaid: any, bTesting: boolean, nRedeemedLoyaltyPoints:number) {
    if (bTesting) console.log('assignPaymentToGiftcardFirst', { availableAmount, nRedeemedLoyaltyPoints, aGiftcards })
    
    aGiftcards.forEach((i: any) => {
      if (bTesting) console.log({ i: i })
      
      if (nRedeemedLoyaltyPoints > 0) {
        
        if (bTesting) console.log('nRedeemedLoyaltyPoints > 0')
        
        if (nRedeemedLoyaltyPoints >= i.amountToBePaid) {
          if (bTesting) console.log('nRedeemedLoyaltyPoints >= i.amountToBePaid')
          i.nRedeemedLoyaltyPoints = i.amountToBePaid;
          nRedeemedLoyaltyPoints -= i.amountToBePaid;
          i.amountToBePaid = 0;
        } else {
          if (bTesting) console.log('else', { nRedeemedLoyaltyPoints })
          i.nRedeemedLoyaltyPoints = nRedeemedLoyaltyPoints;
          i.amountToBePaid -= nRedeemedLoyaltyPoints
          nRedeemedLoyaltyPoints = 0;
        }
        
        if (bTesting) console.log('after redeemed loyalty points', { main: nRedeemedLoyaltyPoints, paymentAmount: i.paymentAmount, amountToBePaid: i.amountToBePaid, nRedeemedLoyaltyPoints: i.nRedeemedLoyaltyPoints })
      } 
      // else {
      //   console.log('else 176 setting redeemed point to 0 for', i.name)
      //   i.nRedeemedLoyaltyPoints = 0;
      // }

      if(availableAmount > 0) {
        if (availableAmount >= i.amountToBePaid) {
          if (bTesting) console.log('if 156 availableAmount >= i.amountToBePaid', { availableAmount, amountToBePaid: i.amountToBePaid})
          i.paymentAmount = i.amountToBePaid;
          availableAmount -= i.amountToBePaid;
          // totalAmountToBePaid -= i.amountToBePaid;
          if (bTesting) console.log('giftcard full payment amount', i.paymentAmount);
        } else {
          if (bTesting) console.log('else 162')
          i.paymentAmount = availableAmount;
          availableAmount -= i.paymentAmount;
          if (bTesting) console.log('73 giftcard part payment amount', i.paymentAmount);
        };
      }
    })
    return { nAvailable: availableAmount, nPoints: nRedeemedLoyaltyPoints };
  }

  handleGiftcardDiscount(totalAmountToBePaid: any, arrToUpdate: any, nGiftcardAmount: any, bTesting: boolean) {
    if (bTesting) console.log('handling giftcard discount')
    let nRemaining = nGiftcardAmount;
    arrToUpdate.forEach((i: any) => {
      if (nGiftcardAmount > 0 && i?.tType !== 'refund') {
        const nAmount = +((i.amountToBePaid * nGiftcardAmount / totalAmountToBePaid).toFixed(3));
        i.nGiftcardDiscount = +(nAmount.toFixed(2));
        if (nRemaining < i.nGiftcardDiscount) {
          i.nGiftcardDiscount = +(nRemaining.toFixed(3).slice(0,-1));
        } else {
          nRemaining -= nAmount;
        }
       
        if (bTesting) console.log('nGiftcardDiscount', i.nGiftcardDiscount, nRemaining)

        i.amountToBePaid -= i.nGiftcardDiscount;
        if (bTesting) console.log('reduced amountToBePaid', i.amountToBePaid);
      }

      if (i?.tType === 'refund') i.nGiftcardDiscount = 0;
    });
  }

  handleLoyaltyPointsDiscount(arrToUpdate:any, totalAmountToBePaid:any, nRedeemedLoyaltyPoints:any, bTesting:boolean){
    if (bTesting) console.log('handleLoyaltyPointsDiscount', { totalAmountToBePaid, nRedeemedLoyaltyPoints, arrToUpdate: JSON.parse(JSON.stringify(arrToUpdate)) })
    arrToUpdate.forEach((i: any) => {
      if (nRedeemedLoyaltyPoints > 0 && i?.tType !== 'refund') {

        i.nRedeemedLoyaltyPoints = +((i.amountToBePaid * nRedeemedLoyaltyPoints / totalAmountToBePaid).toFixed(0));
        if (bTesting) console.log({ amountToBePaid : i.amountToBePaid })

        i.amountToBePaid -= i.nRedeemedLoyaltyPoints;
        i.amountToBePaid = +(i.amountToBePaid.toFixed(2))
        if (bTesting) console.log('reduced amountToBePaid', i.amountToBePaid);
      }

      if (i?.tType === 'refund') i.nRedeemedLoyaltyPoints = 0;
    });
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
