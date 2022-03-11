import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
  selector: '[till-order]',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class OrderComponent implements OnInit {
  @Input() item: any
  constructor() { }

  ngOnInit(): void {
  }

}
