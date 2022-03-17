import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {faMinus, faPlus, faTimes} from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: '[till-product]',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.sass'],
})
export class ProductComponent implements OnInit {
  @Input() item: any
  @Input() taxes: any
  @Output() itemChanged = new EventEmitter<any>();

  faPlus = faPlus
  faMinus = faMinus
  faTimes = faTimes

  constructor() { }

  ngOnInit(): void { }

  deleteItem(): void {
    this.itemChanged.emit('delete')
  }
}
