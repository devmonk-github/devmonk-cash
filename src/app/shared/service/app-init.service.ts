import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})

export class AppInitService {

    constructor() { }

    showError(dynamicMessage?: string) {
        const initializationError = document.querySelector('#initializationError');
        const message = 'Aw, something went wrong';
        if (initializationError) initializationError.textContent = dynamicMessage || message;
    }

    initCsp() {
        const headCsp = document.querySelector('head');
        if (headCsp) headCsp.innerHTML += `<meta http-equiv="Content-Security-Policy" content="${environment.csp}">`;
        else this.showError(`Something went wrong. Contact to RetailGear Team.`);
    }
}
