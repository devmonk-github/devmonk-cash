import {Component, OnChanges, OnInit} from '@angular/core';
import {Transaction} from "./models/transaction.model";
import {faScrewdriverWrench, faTruck, faBoxesStacked, faGifts,
  faUserPlus, faUser, faTimes, faTimesCircle, faTrashAlt, faRing,
  faCoins, faCalculator, faArrowRightFromBracket
} from "@fortawesome/free-solid-svg-icons";
import {TranslateService} from "@ngx-translate/core";
import {DialogService} from '../shared/service/dialog'
import {CustomerDialogComponent} from "../shared/components/customer-dialog/customer-dialog.component";
import {TaxService} from "../shared/service/tax.service";

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
  faUser = faUser
  faUserPlus = faUserPlus
  faTimes = faTimes
  faTimesCircle = faTimesCircle
  faTrashAlt = faTrashAlt
  faRing = faRing
  faCoins = faCoins
  faCalculator = faCalculator
  faArrowRightFromBracket = faArrowRightFromBracket

  taxes: any[] = []
  transactionItems: any[] = []
  selectedTransaction = null;
  customer: any

  // Dummy data
  parkedTransactions: Transaction[] = [
    new Transaction('1', '1', '1', '2022030301',  'shoppurchase', 'concept', '1', '1'),
    new Transaction('2', '1', '1', '2022030302',  'shoppurchase', 'concept', '1', '1'),
    new Transaction('3', '1', '1', '2022030303',  'shoppurchase', 'concept', '1', '1'),
    new Transaction('4', '1', '1', '2022030304',  'shoppurchase', 'concept', '1', '1'),
    new Transaction('5', '1', '1', '2022030305',  'shoppurchase', 'concept', '1', '1'),
  ]
  quickButtons: any[] = [
    {name: 'Waterdicht', price: this.randNumber(5, 30)},
    {name: 'Batterij', price: this.randNumber(5, 30)},
    {name: 'Band verstellen', price: this.randNumber(5, 20)},
    {name: 'Oude cadeaubon', price: this.randNumber(1, 50)},
    {name: 'Schiet oorbel', price: this.randNumber(1, 50)},
    {name: 'Reparatie', price: this.randNumber(1, 50)},
    {name: 'IXXI', price: this.randNumber(50, 100)},
    {name: 'KARMA', price: this.randNumber(50, 100)},
    {name: 'BUDDHA', price: this.randNumber(50, 100)},
    {name: 'P1500', price: this.randNumber(100, 150)},
    {name: 'Diversen', price: this.randNumber(30, 150)},
    {name: 'Stalen band', price: this.randNumber(25, 50)},
    {name: 'Leren band', price: this.randNumber(20, 45)},
    {name: 'Postzegels', price: this.randNumber(1, 10)},
    {name: 'Tassen', price: this.randNumber(50, 200)},
  ]
  payMethods = [
    "GIFTCARD",
    "CASH",
    "CARD",
    "BANK"
  ]
  // End dummy data


  /**
   * Temp function to generate random numbers for demo till
   * @param min - min number to generate
   * @param max - max number to generate
   */
  randNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min +1) + min);
  }

  constructor(private translateService: TranslateService, private dialogService: DialogService, private taxService: TaxService) { }

  ngOnChanges() {}

  ngOnInit(): void {
    this.taxes = this.taxService.getTaxRates()
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
    if(type === 'gift-sell') {
      type = 'giftcard-sell'
    }
    this.transactionItems.push({
      name: this.translateService.instant(type.toUpperCase()),
      type: type,
      quantity: this.randNumber(1, 10),
      price: this.randNumber(5, 200),
      discount: 0,
      tax: 21,
      description: '',
      open: true,
      ...(type === 'giftcard-sell') && {giftcardNumber: Date.now()},
      ...(type === 'giftcard-sell') && {taxHandling: 'true'},
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
