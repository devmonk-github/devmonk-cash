import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {faPlus, faMinus} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-dialer',
  templateUrl: './dialer.component.html',
  styleUrls: ['./dialer.component.sass']
})
export class DialerComponent implements OnInit {

  @Input() quantity : number = 0
  @Output() quantityChange = new EventEmitter<number>()

  faPlus = faPlus
  faMinus = faMinus

  constructor() { }

  ngOnInit(): void {
  }

  increase(): void {
    this.quantity++
    this.quantityChange.emit(this.quantity)
  }

  decrease(): void {
    this.quantity--
    this.quantityChange.emit(this.quantity)
  }
}
