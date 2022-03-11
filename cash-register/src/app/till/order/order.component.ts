import {Component, EventEmitter, HostListener, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {faTimesCircle} from '@fortawesome/free-solid-svg-icons'


@Component({
  selector: '[till-order]',
  templateUrl: './order.component.html',
  encapsulation: ViewEncapsulation.None
})
export class OrderComponent implements OnInit {
  @Input() item: any
  @Output() itemChanged = new EventEmitter<any>();

  faTimesCircle = faTimesCircle

  open: boolean = false

  @HostListener("click", ['$event.target'])
  onClick(target: any) {
    if (target.localName === 'td' && target.className.indexOf('click-listen') >= 0 || (target.parentElement && target.parentElement.className.indexOf('click-listen') >= 0)) {
      this.open = !this.open
    }
  }

  constructor() { }

  ngOnInit(): void {
  }

  deleteItem(): void {
    this.itemChanged.emit('delete')
  }

}
