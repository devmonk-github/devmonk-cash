import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-login-cashregister',
    templateUrl: './login-cash-register.component.html',
    styleUrls: ['./login-cash-register.component.sass'],
})
export class LoginCashRegisterComponent implements OnInit {

    ngOnInit() {
        localStorage.setItem('currentBusiness', '6182a52f1949ab0a59ff4e7b')
        localStorage.setItem('currentLocation', '623b6d840ed1002890334456')
        localStorage.setItem('org', '{"aLanguage":["nl","fr","en","es","de","sv","da","ar","is","ms"],"_id":"617fac70d293c7829eceab0e","sName":"neworg9","sLogo":"https://prismanote.com/public/prismanote.png","bEnableFrontendCodeAccess":false,"sSupportEmail":"info@prismanote.com"}')
        localStorage.setItem('currentWorkstation', '62cfa01063953715a759acbd')
        localStorage.setItem('currentUser', '{"userId":"61a48b1d7f39a87d3576c5f0","userName":"New Org","aRights":["OWNER"],"bHomeWorker":true}')
        localStorage.setItem('aRights', '[{"sControllerName":"transaction","sEndPoint":"create","isAccessible":true},{"sControllerName":"transaction","sEndPoint":"createPurchaseOrder","isAccessible":true},{"sControllerName":"transaction","sEndPoint":"cashRegister","isAccessible":true},{"sControllerName":"activities","sEndPoint":"itemsList","isAccessible":true},{"sControllerName":"businessPartner","sEndPoint":"create","isAccessible":true},{"sControllerName":"businessPartner","sEndPoint":"supplierList","isAccessible":true},{"sControllerName":"statistics","sEndPoint":"get","isAccessible":true},{"sControllerName":"users","sEndPoint":"create","isAccessible":true},{"sControllerName":"business","sEndPoint":"update","isAccessible":true}]')
        localStorage.setItem('authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MWE0OGIxZDdmMzlhODdkMzU3NmM1ZjAiLCJlVXNlclR5cGUiOiJyZXRhaWxlciIsImFSaWdodHMiOlsiT1dORVIiXSwiaU9yZ2FuaXphdGlvbklkIjoiNjE3ZmFjNzBkMjkzYzc4MjllY2VhYjBlIiwiaWF0IjoxNjk3MDI4Mjk5LCJleHAiOjE2OTcyODc0OTl9.G325R3975lOWBFHmRRP1qRc672I-g4mQuIiaCfEvr1c')
        localStorage.setItem('language', 'en')
    }

}
