import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {faMinus, faPlus} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-dialer',
  templateUrl: './dialer.component.html',
  styleUrls: ['./dialer.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialerComponent implements OnChanges, OnInit {

  @Input()
  set quantity(value: number) {
    console.log('value', value)
    this.qty = value
  }
  get quantity() {
    return this.qty
  }
  @Output() quantityChange = new EventEmitter<number>()

  faPlus = faPlus
  faMinus = faMinus
  qty = 0

  constructor() { }

  ngOnChanges(changes:SimpleChanges): void {
    console.log('changes', changes)
  }
  ngOnInit() {
    // this.qty = JSON.parse(JSON.stringify(this.quantity))
  }

  increase(): void {
    this.qty++
    this.quantityChange.emit(this.qty)
  }

  decrease(): void {
    this.qty--
    this.quantityChange.emit(this.qty)
  }

  change(oldValue: any, newValue: any): void {
    console.log('oldValue', oldValue)
    console.log('newValue', newValue)
  }
}
