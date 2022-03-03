import { Component, EventEmitter, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { NbDialogService } from '@nebular/theme';
import { DialogsComponent } from '../dialogs/dialogs.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit, OnChanges {
  title = 'Cash register home page';
  localData : any;
  @Output() checkUpdate : EventEmitter<any> = new EventEmitter();
  constructor(
    private router: Router,
    private dialogService: NbDialogService
  ) { }


  ngOnChanges(changes?: SimpleChanges): void {
    // console.log(changes);
  }

  ngOnInit(): void {
  }

  redirectToPage(page : any){
    this.router.navigate(['/'+ page]);
  }

  openModal(){
    this.checkUpdate.emit("Modal opened");
    this.dialogService.open(DialogsComponent)
      .onClose.subscribe(res => {
        console.log(res);
        this.checkUpdate.emit("Modal closed");
      });
  }


}
