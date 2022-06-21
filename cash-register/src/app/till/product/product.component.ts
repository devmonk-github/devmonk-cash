import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faTimes, faArrowDown, faArrowUp, faMinus } from '@fortawesome/free-solid-svg-icons'
import { DialogService } from "../../shared/service/dialog";
import { DiscountDialogComponent } from "../dialogs/discount-dialog/discount-dialog.component";
import { PriceService } from "../../shared/service/price.service";

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[till-product]',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.sass'],
})
export class ProductComponent {
  @Input() item: any
  @Input() taxes: any
  @Output() itemChanged = new EventEmitter<any>();

  faMinus = faMinus;
  faArrowDown = faArrowDown;
  faArrowUp = faArrowUp;
  typeArray = ['regular', 'return'];

  constructor(private dialogService: DialogService, private priceService: PriceService) { }

  // ngOnInit(): void {
  //   // this.item.sArticleNumber = '0001234567'
  // }

  deleteItem(): void {
    this.itemChanged.emit('delete')
  }

  getDiscount(item: any): string {
    return this.priceService.getDiscount(item.nDiscount || 0);
  }

  getTotalDiscount(item: any): string {
    return this.priceService.getDiscountValue(item);
  }

  getTotalPrice(item: any): string {
    return this.priceService.getArticlePrice(item)
  }

  changeInbrokenAmount(item: any) {
    if (item.nBrokenProduct < 0) {
      item.nBrokenProduct = 0;
    }
    if (item.quantity < item.nBrokenProduct) {
      item.nBrokenProduct = item.quantity;
    }
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

  openDiscountDialog(): void {
    this.dialogService.openModal(DiscountDialogComponent, { context: { item: JSON.parse(JSON.stringify(this.item)) } })
      .instance.close.subscribe((data) => {
        if (data.item && data.item.nDiscount) {
          console.log('discount dialog closed', data.item)
          this.item.nDiscount = data.item.nDiscount
        }
      })
  }

  updatePayments(): void {
    this.itemChanged.emit('update');
  }
}
