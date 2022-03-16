import {Component, EventEmitter, HostListener, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {faMinus, faPlus, faTimes} from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: '[till-product]',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.sass'],
  encapsulation: ViewEncapsulation.None // Get styles from till component
})
export class ProductComponent implements OnInit {
  @Input() item: any
  @Output() itemChanged = new EventEmitter<any>();

  faPlus = faPlus
  faMinus = faMinus
  faTimes = faTimes


  constructor() { }

  ngOnInit(): void {

  }

  deleteItem(): void {
    this.itemChanged.emit('delete')
  }
}
