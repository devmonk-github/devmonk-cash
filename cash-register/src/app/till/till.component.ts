import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-till',
  templateUrl: './till.component.html',
  styleUrls: ['./till.component.sass']
})
export class TillComponent implements OnInit, OnChanges {

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {

  }

  ngOnInit(): void {
  }

}
