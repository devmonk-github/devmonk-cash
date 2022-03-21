import {Component, Input, OnInit, ViewContainerRef} from '@angular/core';
import {DialogComponent} from "../../../shared/service/dialog";
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import {PriceService} from "../../../shared/service/price.service";

@Component({
  selector: 'app-discount-dialog',
  templateUrl: './discount-dialog.component.html',
  styleUrls: ['./discount-dialog.component.sass']
})
export class DiscountDialogComponent implements OnInit {
  @Input() item: any
  faTimes = faTimes
  dialogRef: DialogComponent
  mode: string = 'fixed';

  selectedDiscount: number = 0;

  amounts: any = {
    fixed: [
      {
        amount: 5,
        disabled: false
      },{
        amount: 10,
        disabled: false
      },
      {
        amount: 20,
        disabled: false
      },
      {
        amount: 50,
        disabled: false
      }
    ],
    percent: [
      {
        amount: 10,
        disabled: false
      },{
        amount: 15,
        disabled: false
      },
      {
        amount: 20,
        disabled: false
      },
      {
        amount: 30,
        disabled: false
      },
      {
        amount: 50,
        disabled: false
      }
    ]
  }
  discounts: any = []


  constructor(private viewContainer: ViewContainerRef, private priceService: PriceService) {
    const _injector = this.viewContainer.parentInjector
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent)


  }

  close(): void {
    this.dialogRef.close.emit({action: false})
  }

  save(): void {
    this.item.discount = {
      percent: this.mode === 'percent',
      itemPrice: this.calculateDiscountPrice(),
      value: this.selectedDiscount
    }

    this.dialogRef.close.emit({action: true, item: this.item})
  }

  ngOnInit(): void {
    this.calculatePrices()
    this.switchMode('fixed')

  }

  switchMode(mode: string): void {
    this.mode = mode;
    this.calculatePrices();
    this.discounts = this.amounts[mode];
    this.selectedDiscount = 0;
  }

  calculateDiscountPrice(): number {
    if(this.mode === 'fixed') {
      return this.priceService.roundPrice(this.item.price - this.selectedDiscount)
    } else {
      return this.priceService.roundPrice(this.item.price - (this.item.price * (this.selectedDiscount / 100)))
    }
  }

  calculatePrices(): void {
      for(let i = 0; i < this.amounts[this.mode].length; i++) {
        if(this.mode === 'fixed') {
          if(this.amounts.fixed[i].amount > this.item.price ) {
            this.amounts.fixed[i].disabled = true
            this.amounts.fixed[i].price = null
          } else {
            this.amounts.fixed[i].price = this.priceService.roundPrice(this.item.price - this.amounts.fixed[i].amount)
          }
        } else {
          const itemPrice = this.item.price - (this.item.price * (this.amounts.percent[i].amount / 100))
          if(itemPrice < 0) {
            this.amounts.percent[i].disabled = true
            this.amounts.percent[i].price = null
          } else {
            this.amounts.percent[i].price = this.priceService.roundPrice(itemPrice)
          }
        }
      }
  }

}
