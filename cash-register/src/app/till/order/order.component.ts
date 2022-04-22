import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { faTimes, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import { PriceService } from 'src/app/shared/service/price.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[till-order]',
  templateUrl: './order.component.html',
  encapsulation: ViewEncapsulation.None
})
export class OrderComponent implements OnInit {
  @Input() item: any
  @Input() taxes: any
  @Output() itemChanged = new EventEmitter<any>();

  faTimes = faTimes
  faPlus = faPlus
  faMinus = faMinus

  constructor(private priceService: PriceService) { }

  ngOnInit(): void { }

  deleteItem(): void {
    this.itemChanged.emit('delete')
  }
  getDiscount(item: any): string {
    return this.priceService.getDiscount(item.discount)
  }

  getTotalDiscount(item: any): string {
    return this.priceService.getDiscountValue(item);
  }

  getTotalPrice(item: any): string {
    return this.priceService.getArticlePrice(item)
  }
}
