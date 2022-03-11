import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {faMinus, faPlus} from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: '[till-product]',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.sass'],
  encapsulation: ViewEncapsulation.None // Get styles from till component
})
export class ProductComponent implements OnInit {
  @Input() item: any

  faPlus = faPlus
  faMinus = faMinus
  constructor() { }

  ngOnInit(): void {
  }

}
