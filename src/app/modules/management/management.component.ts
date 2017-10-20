import { compact } from 'lodash';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { ServiceComponent } from '../../service/service.component';
import * as Globals from './../../globals/globals.component';
import * as MainOpr from './../../mainoperation/mainoperation.component';

import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import { ObservableMedia } from '@angular/flex-layout';
import {FormControl, FormGroup} from "@angular/forms";
// import { Observable } from 'rxjs/Observable';
// import {FormControl, FormGroup, Validators} from '@angular/forms';

let HttpService: any;
let self: any;

@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.css'],
  providers: [ServiceComponent]
})
export class ManagementComponent implements OnInit, OnDestroy {
    public isValid = false;
    public disabled = false;

    private sub: any;
    public cols: any;
    private nTimerId: any;

    public routeName: any;
    public PortfolioList  = [];

    // Portfolio table //
    // values for icon information on table header
    tbHeader = [
        {index : 1, title : 'Nombre Portafolio', icon : ''},
        {index : 2, title : 'Valor Meta', icon : ''},
        {index : 3, title : 'Moneda', icon : ''},
    ];

    public portfolioForm = new FormGroup({
        portfolio_id: new FormControl(null),
        valor: new FormControl(0),
        moneda: new FormControl(0),
    });

    constructor( private service:ServiceComponent,
                 private observableMedia: ObservableMedia ) {
        self = this;
        HttpService = this.service;
    }

    ngOnInit() {
        HttpService.getDatabaseInfo();
        this.nTimerId = setInterval(() => {
            this.checkStart();
        }, 100);

        // this.isValid = true;
        const grid = new Map([
            ['xs', 1],
            ['sm', 1],
            ['md', 1],
            ['lg', 3],
            ['xl', 3]
        ]);
        let start: number;
        grid.forEach((cols, mqAlias) => {
            if (this.observableMedia.isActive(mqAlias)) {
                start = cols;
            }
        });
        this.cols = this.observableMedia.asObservable()
            .map(change => grid.get(change.mqAlias))
            .startWith(start);

        this.resetForm();
    }

    ngOnDestroy() {
        // this.sub.unsubscribe();
    }

    checkStart() {
        if (Globals.g_DatabaseInfo.bIsStartCalc) {
            clearInterval(this.nTimerId);
            MainOpr.onCalculateData();
            HttpService.getTransactionList().subscribe(
                response => {
                    MainOpr.getTransactionData(response);
                    MainOpr.CalculatePortfolioData();

                    this.onRefreshTable();
                    this.isValid = true;
                    console.log('Test ',Globals.g_DatabaseInfo.PortfolioList);
                    console.log('Test ', Globals.g_Portfolios);
                });
        }
    }

    onRefreshTable() {
        console.log('Test',);
        let newObj = null;
        this.PortfolioList = Globals.g_DatabaseInfo.PortfolioList;
        // this.PortfolioList = this.PortfolioList.map((obj) => {
        //     newObj = Globals.g_Portfolios.arrDataByPortfolio.filter((el) => {
        //         return el.portname === obj.portfolio_id;
        //     });
        //     return {
        //         ...obj,
        //         valor: newObj[0] && Globals.numberWithCommas(newObj[0].stairArray[Globals.g_DatabaseInfo.ListofPriceFund[0].ulen - 1]) || 0
        //     };
        //     // return obj.strPortID === this.ngPortfolioName &&
        //     //     moment(obj.tDate).isSameOrBefore(moment(this.tradeForm.controls['date'].value));
        // });
        console.log('obj   ', this.PortfolioList);
        console.log('arrDataByPortfolio ', Globals.g_Portfolios.arrDataByPortfolio);

        this.tbHeader[0].icon = '';
        this.onTableReorder(0);
    }

    onTableReorder(index) {
        const strIconName = this.tbHeader[index].icon;
        for (let i = 0; i < this.tbHeader.length; i ++) {
            this.tbHeader[i].icon = '';
        }

        let strOrderCmd = '';
        switch (strIconName) {
            case '':
                this.tbHeader[index].icon = 'arrow_drop_down';
                strOrderCmd = 'down';
                break;
            case 'arrow_drop_down':
                this.tbHeader[index].icon = 'arrow_drop_up';
                strOrderCmd = 'up';
                break;
            case 'arrow_drop_up':
                this.tbHeader[index].icon = 'arrow_drop_down';
                strOrderCmd = 'down';
                break;
        }
        this.sortTable(this.tbHeader[index].index, strOrderCmd);
    }

    sortTable(index, strOrderCmd) {
        // this.fondoList.Portarray.sort(function(a, b){
        //     const keyA = a[Object.keys(a)[index]],
        //         keyB = b[Object.keys(a)[index]];
        //
        //     if(keyA < keyB) return (strOrderCmd === 'down') ? -1 : 1;
        //     if(keyA > keyB) return (strOrderCmd === 'down') ? 1 : -1;
        //     return 0;
        // });
    }

    submitForm(valuesForm) {
        let url = '/addport';

        url = url + '/' + valuesForm.portfolio_id;
        url = url + '/' + valuesForm.valor;
        url = url + '/' + valuesForm.moneda;
        console.log('BUY URL', url);

        HttpService.getBuyResponse(url).subscribe(
            response => {
                console.log('Test',response);
                HttpService.getPortfolioList().subscribe(
                    response => {
                        this.PortfolioList.push(valuesForm);
                        this.onRefreshTable();
                        // this.checkTable();

                        this.resetForm();

                        this.disabled = false;
                    });
            });

    }

    // checkTable() {
    //     for (let i = 0; i < this.PortfolioList.length; i ++) {
    //         for (let j = 0; j < Globals.g_DatabaseInfo.ListofPriceFund.length; j ++) {
    //             const eachArray = [];
    //             for (let k = 0; k < this.PortfolioList.length; k ++) {
    //                 if (this.PortfolioList[i].Portarray[k].nFundIndex == j) eachArray.push(this.PortfolioList[i].Portarray[k]);
    //             }
    //             if (eachArray.length > 0){
    //                 for (let k = 0; k < eachArray.length; k ++) {
    //                     eachArray[k].deletable = false;
    //                     let sum = 0;
    //                     for (let n = 0; n < eachArray.length; n ++) {
    //                         if (k == n) continue;
    //                         const ItemCnt = eachArray[n].nItemCnt;
    //                         sum = sum + ItemCnt;
    //                         if (sum < 0) {
    //                             eachArray[k].deletable = true;
    //                             break;
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }

    resetForm() {
        this.portfolioForm.reset();
    }

}
