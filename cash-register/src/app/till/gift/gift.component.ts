import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
  selector: '[till-gift]',
  templateUrl: './gift.component.html',
  styleUrls: ['./gift.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class GiftComponent implements OnInit {
  @Input() item: any
  constructor() { }

  ngOnInit(): void {
  }

}
