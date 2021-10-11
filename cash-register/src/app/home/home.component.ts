import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbDialogService } from '@nebular/theme';
import { DialogsComponent } from '../dialogs/dialogs.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit {

  constructor(
    private router: Router,
    private dialogService: NbDialogService
  ) { }

  ngOnInit(): void {
  }

  redirectToPage(page : any){
    this.router.navigate(['/'+ page]);
  }

  openModal(){
    this.dialogService.open(DialogsComponent)
      .onClose.subscribe(res => console.log(res))
  }
}
