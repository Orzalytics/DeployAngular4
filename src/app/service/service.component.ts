import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs';

import * as Globals from '../globals/globals.component';
import { Input } from '@angular/core';

import { environment } from '../../environments/environment';

let urlHeader = Globals.urlHeader.development;

if (environment.production) {
    urlHeader = Globals.urlHeader.production;
}

@Injectable()
export class ServiceComponent {
    n_ResponseSuccess: any;
    user: any;
    onUserChanged: BehaviorSubject<any> = new BehaviorSubject({});

    constructor(private http: Http) {
        this.user = Object.assign({}, JSON.parse(localStorage.getItem('user')));
        this.onUserChanged = new BehaviorSubject(this.user);
    }

    @Input() set b_IsGetSuccess(newValue: any) {
        if (newValue) {
            this.n_ResponseSuccess ++;
            if (this.n_ResponseSuccess === 4) {
                Globals.g_DatabaseInfo.bIsStartCalc = true;
            }
        }
    }

    // Get Database Information
    getDatabaseInfo() {
        this.n_ResponseSuccess = 0;
        this.getFundHeader().subscribe(
            response => {
                Globals.g_DatabaseInfo.FundHeader = response;
                this.b_IsGetSuccess = true;
            }
        );
        this.getPortfolioList().subscribe(
            response => {
                Globals.g_DatabaseInfo.PortfolioList = response;
                this.b_IsGetSuccess = true;
            }
        );
        this.getTransactionList().subscribe(
            response => {
                Globals.g_DatabaseInfo.TransactionList = response;
                this.b_IsGetSuccess = true;
            }
        );

        let LastAvailableDate = localStorage.getItem('LastAvailableDate');
        this.getFundPriceList(Globals.g_GlobalStatic.startDate, LastAvailableDate).subscribe(
            response => {
                if (response.isThereNewData) {
                    Globals.g_DatabaseInfo.RawFundPriceList = response.data;
                    try {
                        localStorage.setItem('RawFundPriceList', JSON.stringify(response.data));
                        localStorage.setItem('LastAvailableDate', JSON.stringify(response.maxDate));
                    } catch (e) {
                        console.warn('LocalStorage error. Error code -', e.code, e.name);
                    }
                }
                else {
                    Globals.g_DatabaseInfo.RawFundPriceList = JSON.parse(localStorage.getItem('RawFundPriceList'));
                }
                this.b_IsGetSuccess = true;
            }
        );
    }

    // Get Fund Names and IDs
    getFundHeader() {
        return this.http.get(urlHeader + '/fundheader').map(res => res.json());
    }

    // Get Price Fund List
    getFundPriceList(startDate, lastDate) {
        let params = startDate + (lastDate ? ('/' + lastDate) : '');
        return this.http.get(urlHeader + '/ret/' + params).map(res => res.json());
    }

    // Get Portfolio List
    getPortfolioList() {
        return this.http.get(urlHeader + '/userPortList').map(res => res.json());
    }

    // Get Transaction List
    getTransactionList() {
        return this.http.get(urlHeader + '/transaction/all').map(res => res.json());
    }

    // Get Buy Response
    getBuyResponse(buyUrl) {
        return this.http.get(urlHeader + buyUrl).map(res => res.json());
    }

    // Get Delete Response
    getDeleteResponse(deleteID) {
        return this.http.get(urlHeader + '/delete/' + deleteID).map(res => res.json());
    }

    // Get Delete Response
    getDeletePortResponse(deleteID) {
        return this.http.get(urlHeader + '/deleteport/' + deleteID).map(res => res.json());
    }

    // Login
    login(form) {
        return this.http.get(`${urlHeader}/login/${form.username}/${form.phone}/${form.rand}`).map(res => res.json());
    }

    setSettings(settings) {
        // this.user = Object.assign({}, this.user, settings);
        this.user = Object.assign({}, settings);
        this.onUserChanged.next(this.user);
    }

    // Send Excel Data
    sendExcelData(data) {
        return this.http.post(urlHeader + '/getExcel', {user: data}).map(res => res.json());
    }

    uploadBuyData(data) {
        return this.http.post(urlHeader + '/buy', {user: data}).map(res => res.json());
    }

    signIn(data) {
        return this.http.post(urlHeader + '/signIn', {user: data}).map(res => res.json());
    }

// ============================================================================================

    setFundNames(data) {
        return this.http.post(urlHeader + '/setFundNames', {data: data}).map(res => res.json());
    }

    setPriceFunds(data) {
        return this.http.get(urlHeader + '/setPriceFunds').map(res => res.json());
    }
}
