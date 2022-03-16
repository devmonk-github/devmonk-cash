import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {faTimes, faPlus, faMinus} from "@fortawesome/free-solid-svg-icons";
import {TaxService} from "../../shared/service/tax.service";

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



  constructor() { }

  ngOnInit(): void {

  }

  deleteItem(): void {
    this.itemChanged.emit('delete')
  }
}
