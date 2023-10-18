import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'body[root]',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent implements OnInit {

  ngOnInit() {
    localStorage.setItem('currentBusiness', '6182a52f1949ab0a59ff4e7b')
    localStorage.setItem('currentLocation', '623b6d840ed1002890334456')
    localStorage.setItem('org', '{"aLanguage":["en","nl","fr","es","de","da","ar","da","sv","nb","fi","pl","it","ms"],"_id":"62defbfc9585fbe5d0fbba6c","sName":"Prismanote2","sIndustry":"jewellery_and_watches","sBackgroundColor":"#b45f5f","bDisableFreeTier":true,"bEnableFrontendCodeAccess":true,"sLogo":"https://prismanote.s3.amazonaws.com/prismanote-logo-groen.png","ssupportemail":"info@prismanote2.com"}')
    localStorage.setItem('currentWorkstation', '62cfa01063953715a759acbd')
    localStorage.setItem('currentUser', '{"userId":"61a48b1d7f39a87d3576c5f0","userName":"New Org","aRights":["OWNER"],"bHomeWorker":true}')
    localStorage.setItem('aRights', '[{"sControllerName":"transaction","sEndPoint":"create","isAccessible":true},{"sControllerName":"transaction","sEndPoint":"createPurchaseOrder","isAccessible":true},{"sControllerName":"transaction","sEndPoint":"cashRegister","isAccessible":true},{"sControllerName":"activities","sEndPoint":"itemsList","isAccessible":true},{"sControllerName":"businessPartner","sEndPoint":"create","isAccessible":true},{"sControllerName":"businessPartner","sEndPoint":"supplierList","isAccessible":true},{"sControllerName":"statistics","sEndPoint":"get","isAccessible":true},{"sControllerName":"users","sEndPoint":"create","isAccessible":true},{"sControllerName":"business","sEndPoint":"update","isAccessible":true}]')
    localStorage.setItem('authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MmI1NjA4NzYzZjE0YzNjNWIzZGUyODQiLCJlVXNlclR5cGUiOiJyZXRhaWxlciIsImFSaWdodHMiOlsiT1dORVIiXSwiaU9yZ2FuaXphdGlvbklkIjoiNjJkZWZiZmM5NTg1ZmJlNWQwZmJiYTZjIiwiaWF0IjoxNjk3NTM0NjM3LCJleHAiOjE2OTc3OTM4Mzd9.H69-MOBwpjgj9ALKjCK1oXOOOS9uu2h4f3JxnUhKFyw')
    localStorage.setItem('language', 'en')
  }

}
