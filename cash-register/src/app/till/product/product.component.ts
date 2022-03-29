import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {faTimes} from '@fortawesome/free-solid-svg-icons'
import {DialogService} from "../../shared/service/dialog";
import {DiscountDialogComponent} from "../dialogs/discount-dialog/discount-dialog.component";
import {PriceService} from "../../shared/service/price.service";

@Component({
  selector: '[till-product]',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.sass'],
})
export class ProductComponent implements OnInit {
  @Input() item: any
  @Input() taxes: any
  @Output() itemChanged = new EventEmitter<any>();

  faTimes = faTimes

  constructor(private dialogService: DialogService, private priceService: PriceService) { }

  ngOnInit(): void {
    this.item.articleNumber = '0001234567'
  }

  deleteItem(): void {
    this.itemChanged.emit('delete')
  }

  getDiscount(): any {
    return this.priceService.getDiscount(this.item.discount)
  }

  openDiscountDialog(): void {
    this.dialogService.openModal(DiscountDialogComponent, {context: {item: this.item}})
      .instance.close.subscribe( (data) => {
        console.log('discountdialog ', data)

    })
  }
}
