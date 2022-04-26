import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { faTimes, faPlus, faMinus, faM } from "@fortawesome/free-solid-svg-icons";
import { PriceService } from 'src/app/shared/service/price.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[till-repair]',
  templateUrl: './repair.component.html',
  styleUrls: ['./repair.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class RepairComponent {
  @Input() item: any
  @Input() taxes: any
  @Output() itemChanged = new EventEmitter<any>();

  faTimes = faTimes
  faPlus = faPlus
  faMinus = faMinus

  typeArray = ['regular', 'broken', 'return'];

  constructor(private priceService: PriceService) { }

  updatePayments(): void {
    this.itemChanged.emit('update');
  }
  deleteItem(): void {
    this.itemChanged.emit('delete')
  }


  getTotalPrice(item: any): void {
    return this.priceService.calculateItemPrice(item)
  }
}
