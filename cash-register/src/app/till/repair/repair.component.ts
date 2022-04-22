import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { faTimes, faPlus, faMinus, faM } from "@fortawesome/free-solid-svg-icons";

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[till-repair]',
  templateUrl: './repair.component.html',
  styleUrls: ['./repair.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class RepairComponent implements OnInit {
  @Input() item: any
  @Input() taxes: any
  @Output() itemChanged = new EventEmitter<any>();

  faTimes = faTimes
  faPlus = faPlus
  faMinus = faMinus

  constructor() { }

  ngOnInit(): void {
  }

  updatePayments(): void {
    this.itemChanged.emit('update');
  }
  deleteItem(): void {
    this.itemChanged.emit('delete')
  }

}
