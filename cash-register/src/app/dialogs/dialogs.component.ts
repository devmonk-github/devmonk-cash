import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dialogs',
  templateUrl: './dialogs.component.html',
  styleUrls: ['./dialogs.component.sass']
})
export class DialogsComponent implements OnInit {

  constructor(
  ) { }

  ngOnInit(): void {
  }

  close(){
    //this.ref.close();
  }
}
