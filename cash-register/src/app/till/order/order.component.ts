import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { faTimes, faPlus, faMinus, faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons'
import { PriceService } from 'src/app/shared/service/price.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[till-order]',
  templateUrl: './order.component.html',
  encapsulation: ViewEncapsulation.None
})
export class OrderComponent {
  @Input() item: any
  @Input() taxes: any
  @Output() itemChanged = new EventEmitter<any>();

  faTimes = faTimes
  faPlus = faPlus
  faMinus = faMinus
  faArrowDown = faArrowDown;
  faArrowUp = faArrowUp;
  typeArray = ['regular', 'return'];
  constructor(private priceService: PriceService) { }

  deleteItem(): void {
    this.itemChanged.emit('delete')
  }
  getDiscount(item: any): string {
    return this.priceService.getDiscount(item.discount)
  }

  getColorCode(item: any): string {
    const { eTransactionItemType } = item;
    switch (eTransactionItemType) {
      case 'regular':
        return '#4ab69c';
      case 'broken':
        return '#f0e959';
      case 'return':
        return '#f7422e';
      default:
        return '#4ab69c';
    }
  }

  changeInbrokenAmount(item: any) {
    if (item.nBrokenProduct < 0) {
      item.nBrokenProduct = 0;
    }
    if (item.quantity < item.nBrokenProduct) {
      item.nBrokenProduct = item.quantity;
    }
  }

  getTotalDiscount(item: any): string {
    return this.priceService.getDiscountValue(item);
  }

  getTotalPrice(item: any): string {
    return this.priceService.getArticlePrice(item)
  }
}
