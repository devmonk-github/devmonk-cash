import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Transaction} from "./models/transaction.model";
import {TransactionItem} from "./models/transaction-item.model";
import {faScrewdriverWrench, faTruck, faBoxesStacked, faGifts,
  faMinus, faPlus, faUserPlus, faTimesCircle, faTrashAlt, faRing,
  faCoins, faCalculator, faArrowRightFromBracket
} from "@fortawesome/free-solid-svg-icons";
import {TranslateService} from "@ngx-translate/core";
import {DialogService} from '../shared/service/dialog'
import {CustomerDialogComponent} from "../shared/components/customer-dialog/customer-dialog.component";

@Component({
  selector: 'app-till',
  templateUrl: './till.component.html',
  styleUrls: ['./till.component.sass']
})
export class TillComponent implements OnInit, OnChanges {
  faScrewdriverWrench = faScrewdriverWrench
  faTruck = faTruck
  faBoxesStacked = faBoxesStacked
  faGifts = faGifts
  faMinus = faMinus
  faPlus = faPlus
  faUserPlus = faUserPlus
  faTimesCircle = faTimesCircle
  faTrashAlt = faTrashAlt
  faRing = faRing
  faCoins = faCoins
  faCalculator = faCalculator
  faArrowRightFromBracket = faArrowRightFromBracket
  //Dummy data'
  parkedTransactions: Transaction[] = [
    new Transaction('1', '1', '1', '2022030301',  'shoppurchase', 'concept', '1', '1'),
    new Transaction('2', '1', '1', '2022030302',  'shoppurchase', 'concept', '1', '1'),
    new Transaction('3', '1', '1', '2022030303',  'shoppurchase', 'concept', '1', '1'),
    new Transaction('4', '1', '1', '2022030304',  'shoppurchase', 'concept', '1', '1'),
    new Transaction('5', '1', '1', '2022030305',  'shoppurchase', 'concept', '1', '1'),
  ]
  quickButtons: any[] = [
    {name: 'Waterdicht', price: this.randNumber(1, 50)},
    {name: 'Batterij', price: this.randNumber(1, 50)},
    {name: 'Band verstellen', price: this.randNumber(1, 50)},
    {name: 'Oude cadeaubon', price: this.randNumber(1, 50)},
    {name: 'Schiet oorbel', price: this.randNumber(1, 50)},
    {name: 'Reparatie', price: this.randNumber(1, 50)},
    {name: 'IXXI', price: this.randNumber(1, 50)},
    {name: 'KARMA', price: this.randNumber(1, 50)},
    {name: 'BUDDHA', price: this.randNumber(1, 50)},
    {name: 'P1500', price: this.randNumber(1, 50)},
    {name: 'Diversen', price: this.randNumber(1, 50)},
    {name: 'Stalen band', price: this.randNumber(1, 50)},
    {name: 'Leren band', price: this.randNumber(1, 50)},
    {name: 'Postzegels', price: this.randNumber(1, 50)},
    {name: 'Tassen', price: this.randNumber(1, 50)},
  ]

  customer: any

  /**
   * Temp function to generate random numbers for demo till
   * @param min - min number to generate
   * @param max - max number to generate
   */
  randNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min +1) + min);
  }

  payMethods = [
    "GIFTCARD",
    "CASH",
    "CARD",
    "BANK"
  ]

  transactionItems: any[] = [
  ]

  selectedTransaction = null;

  constructor(private translateService: TranslateService, private dialogService: DialogService) { }


  ngOnChanges(changes: SimpleChanges) {

  }

  ngOnInit(): void {
  }

  addItemToTransaction(item: any): void {
    let article = item
    article.quantity = this.randNumber(1, 10);
    article.discount = 0;
    article.tax = 21;
    article.type = 'product'
    article.description = ''

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



  addItem(type: string): void {
    this.transactionItems.push({
      name: this.translateService.instant(type.toUpperCase()),
      type: type,
      quantity: this.randNumber(1, 10),
      price: this.randNumber(5, 200),
      discount: 0,
      tax: 21,
      description: ''
    })
  }

  cancelItems(): void {
    this.transactionItems = []
  }

  itemChanged(item: any, index: number): void {
    if(item === 'delete') {
      this.transactionItems.splice(index, 1);
    } else {
      this.transactionItems[index] = item
    }
  }

  openCustomerDialog(): void {
    this.dialogService.openModal(CustomerDialogComponent, {context: {customer: this.customer}})
      .instance.close.subscribe( (data) => {
        if(data.customer) {
          this.customer = data.customer
        }
    })


  }
}
