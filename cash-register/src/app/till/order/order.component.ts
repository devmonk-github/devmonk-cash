import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {faTimes, faPlus, faMinus} from '@fortawesome/free-solid-svg-icons'

@Component({
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

  constructor() { }

  ngOnInit(): void {}

  deleteItem(): void {
    this.itemChanged.emit('delete')
  }

}
