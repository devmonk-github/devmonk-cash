import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Transaction} from "./models/transaction.model";

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
  selectedTransaction = null;
  customer: any;
  constructor() { }


  ngOnChanges(changes: SimpleChanges) {

  }

  ngOnInit(): void {
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

}
