import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {faTimes, faPlus, faMinus, faCheck, faSpinner} from "@fortawesome/free-solid-svg-icons";
import {TaxService} from "../../shared/service/tax.service";
import {timeout} from "rxjs/operators";

@Component({
  selector: '[till-gift]',
  templateUrl: './gift.component.html',
  styleUrls: ['./gift.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class GiftComponent implements OnInit {
  @Input() item: any
  @Input() taxes: any
  @Output() itemChanged = new EventEmitter<any>();

  faTimes = faTimes
  faPlus = faPlus
  faMinus = faMinus
  numberIcon = faSpinner
  checkingNumber:boolean = false




  constructor() { }

  ngOnInit(): void {
    this.checkNumber()
  }

  deleteItem(): void {
    this.itemChanged.emit('delete')
  }

  checkNumber(): void {
    //Dummy code to show loading icon for checking giftcard number
    this.numberIcon = faSpinner
    this.checkingNumber = true
    setTimeout(() => {
      this.numberIcon = faCheck
      this.checkingNumber = false
    }, 1500)
  }
}
