import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-print-settings',
  templateUrl: './print-settings.component.html',
  styleUrls: ['./print-settings.component.sass']
})
export class PrintSettingsComponent implements OnInit {

  loading: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
