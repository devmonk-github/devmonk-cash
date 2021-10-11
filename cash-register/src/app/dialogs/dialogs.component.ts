import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'app-dialogs',
  templateUrl: './dialogs.component.html',
  styleUrls: ['./dialogs.component.sass']
})
export class DialogsComponent implements OnInit {

  constructor(
    protected ref: NbDialogRef<DialogsComponent>
  ) { }

  ngOnInit(): void {
  }

  close(){
    this.ref.close();
  }
}
