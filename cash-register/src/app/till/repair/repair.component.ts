import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
  selector: '[till-repair]',
  templateUrl: './repair.component.html',
  styleUrls: ['./repair.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class RepairComponent implements OnInit {
  @Input() item: any
  constructor() { }

  ngOnInit(): void {
  }

}
