import { Injectable } from '@angular/core';

@Injectable()
export class StorageService {
    constructor() {
    }

    public saveToken(token) {
        localStorage['userToken'] = token;
    }

    public getToken() {
        return localStorage['userToken'];
    }

    public removeToken() {
        localStorage.removeItem('userToken');
    }

    public saveUser(user) {
        localStorage['userData'] = JSON.stringify(user);
    }

    public getUser() {
        return JSON.parse(localStorage['userData']);
    }

    public removeUser() {
        localStorage.removeItem('userData');
    }
}