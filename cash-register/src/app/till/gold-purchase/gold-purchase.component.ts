import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
  selector: '[till-goldpurchase]',
  templateUrl: './gold-purchase.component.html',
  styleUrls: ['./gold-purchase.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class GoldPurchaseComponent implements OnInit {
  @Input() item: any
  constructor() { }

  ngOnInit(): void {
  }

}
