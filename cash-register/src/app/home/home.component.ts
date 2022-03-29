import { Component, EventEmitter, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

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
  ) { }


  ngOnChanges(changes?: SimpleChanges): void {
  }

  ngOnInit(): void {
  }

  redirectToPage(page : any){
    this.router.navigate(['/'+ page]);
  }

  openModal(){
    this.checkUpdate.emit("Modal opened");
  }


}
