import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Transaction} from "./models/transaction.model";
import {TransactionItem} from "./models/transaction-item.model";

@Component({
  selector: 'app-till',
  templateUrl: './till.component.html',
  styleUrls: ['./till.component.sass']
})
export class TillComponent implements OnInit, OnChanges {

  //Dummy data'
  parkedTransactions: Transaction[] = [
    new Transaction('1', '1', '1', '2022030301',  'shoppurchase', 'concept', '1', '1'),
    new Transaction('2', '1', '1', '2022030302',  'shoppurchase', 'concept', '1', '1'),
    new Transaction('3', '1', '1', '2022030303',  'shoppurchase', 'concept', '1', '1'),
    new Transaction('4', '1', '1', '2022030304',  'shoppurchase', 'concept', '1', '1'),
    new Transaction('5', '1', '1', '2022030305',  'shoppurchase', 'concept', '1', '1'),
  ]
  quickButtons: any[] = [
    {name: 'Waterdicht', price: 10},
    {name: 'Batterij', price: 7.50},
    {name: 'Band verstellen', price: 15},
    {name: 'Oude cadeaubon', price: 0},
    {name: 'Schiet oorbel', price: 20},
    {name: 'Reparatie', price: 25},
    {name: 'IXXI', price: 15},
    {name: 'KARMA', price: 24.95},
    {name: 'KARMA', price: 24.95},
    {name: 'KARMA', price: 24.95},
    {name: 'KARMA', price: 24.95},
    {name: 'KARMA', price: 24.95},
    {name: 'KARMA', price: 24.95},
    {name: 'KARMA', price: 24.95},
    {name: 'KARMA', price: 24.95},
  ]

  payMethods = [
    "GIFTCARD",
    "CASH",
    "CARD",
    "BANK"
  ]

  transactionItems: any[] = [
  ]

  selectedTransaction = null;
  customer: any;
  constructor() { }


  ngOnChanges(changes: SimpleChanges) {

  }

  ngOnInit(): void {
  }

  addItemToTransaction(item: any): void {
    let article = item
    article.quantity = 1;
    article.discount = 0;
    article.tax = 21;

    this.transactionItems.push(article)
  }

  clearTransaction(): void {
    this.selectedTransaction = null
  }

  addCustomer(): void {
    this.customer = {
      number: '45663',
      counter: false,
      name: 'Christy van Woudenberg',
      email: 'CristyvanWoudenberg@armyspy.com',
      address: {
        street: 'Slatuinenweg',
        number: 24,
        zip: '1057 KB',
        city: 'Amsterdam'
      }
    }
  }
  removeCustomer(): void {
    this.customer = null
  }

  getTotals(type: string): number {
    if(!type) {
      return 0
    }
    let result = 0
    this.transactionItems.forEach( (i) => {

      result += type === 'price' ? i.quantity * i.price : i[type]
    })

    return result
  }

}
