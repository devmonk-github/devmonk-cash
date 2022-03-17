import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {faTimes, faPlus, faMinus, faM} from "@fortawesome/free-solid-svg-icons";

@Component({
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

  deleteItem(): void {
    this.itemChanged.emit('delete')
  }

}
