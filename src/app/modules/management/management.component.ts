import { compact } from 'lodash';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { ServiceComponent } from '../../service/service.component';
import * as Globals from './../../globals/globals.component';
import * as MainOpr from './../../mainoperation/mainoperation.component';

import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import { ObservableMedia } from '@angular/flex-layout';
import {FormGroup} from "@angular/forms";
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

    private sub: any;
    public cols: any;
    private nTimerId: any;

    public routeName: any;
    public fondoList = {};

    // Portfolio table //
    // values for icon information on table header
    tbHeader = [
        {index : 1, title : 'Nombre Portafolio', icon : ''},
        {index : 2, title : 'Valor Meta', icon : ''},
        {index : 3, title : 'Moneda', icon : ''},
    ];

    public portfolioForm = new FormGroup({

    });

    constructor( private route: ActivatedRoute,
                 private service:ServiceComponent,
                 private observableMedia: ObservableMedia ) {
        self = this;
        HttpService = this.service;

        this.sub = route.params.subscribe(params => {
            this.routeName = params['name'];
            // this.ngPortfolioName = params['name'];
            // this.tradeForm.controls['portfolio'].setValue(params['name']);
        });
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
        this.sub.unsubscribe();
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
                });
        }
    }

    onRefreshTable() {
        // const transactions = Globals.g_FundParent.arrAllTransaction;
        // this.fondoList = {};
        //
        // const transactionsByPort = transactions.filter((obj) => {
        //     return obj.strPortID === this.ngPortfolioName &&
        //            moment(obj.tDate).isSameOrBefore(moment(this.tradeForm.controls['date'].value));
        // });
        // this.fondoList = {
        //     'PortIndex': 0,
        //     'PortStatus': 'Show',
        //     'PortIcon': 'add',
        //     'Portname': transactionsByPort[0] && transactionsByPort[0].strPortID || [],
        //     'Portarray': transactionsByPort
        // };

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

    submitForm() {

    }

    resetForm() {
        console.log('Reset form',);
        // this.tradeForm.controls['date'].valueChanges.subscribe(() => {
        //     this.tradeForm.controls['pesos'].setValue(null);
        //     this.tradeForm.controls['unidades'].setValue(null);
        //     this.onRefreshTable();
        // });
        // this.tradeForm.controls['fondo'].valueChanges.subscribe(() => {
        //     this.tradeForm.controls['pesos'].setValue(null);
        //     this.tradeForm.controls['unidades'].setValue(null);
        // });
    }

}
