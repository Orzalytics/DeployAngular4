import { compact } from 'lodash';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { ServiceComponent } from '../../service/service.component';
import * as Globals from './../../globals/globals.component';
import * as MainOpr from './../../mainoperation/mainoperation.component';

// flex-layout
// import { ObservableMedia } from '@angular/flex-layout';

// material
// import {Observable} from 'rxjs/Observable';
import {CustomValidators} from './CustomValidators';

import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import { ObservableMedia } from '@angular/flex-layout';
import { Observable } from 'rxjs/Observable';
import {FormControl, FormGroup, Validators} from '@angular/forms';

let HttpService: any;
let self: any;

@Component({
  selector: 'app-trade',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.css'],
  providers: [ServiceComponent]
})
export class TradeComponent implements OnInit, OnDestroy {
    ngPortIndex: number = -1;

    // Chart Input Values //
    // ngPortfolioName: any;
    ngSelFondosValue: any;
    ngWidth: any;
    fondos: any;


    // slider and datepicker attr
    public ngSliderIndex = 0;
    public disabled = false;
    public maxVal = 0;
    public minVal = 0;
    public ng_strDate = Globals.convertDate(Globals.g_GlobalStatic.startDate);
    public ngDatepicker = new Date(Globals.g_GlobalStatic.startDate);
    // ngAllRefresh: number = 0;
    // ngFileUploadPath: any;
    public nTimerId: any;

    ngScopeFanData: any;

    // transaction table //
    // values for icon information on table header
    tbHeader = [
        // {index : 0, title : 'portafolio', icon : ''},
        {index : 1, title : 'fecha', icon : ''},
        {index : 2, title : 'fondo', icon : ''},
        {index : 3, title : 'compra o venta', icon : ''},
        {index : 4, title : 'unidades', icon : ''},
        {index : 5, title : 'precio unidad', icon : ''},
        {index : 6, title : 'total pesos', icon : ''},
    ];

    tableInfo = [];
    tableStore = {};

    // my refactoring;
    private routeName: string;
    private sub: any;

    public isValid: boolean = false;
    public cols:  Observable<number>;

    public ngPortfolioName: string;
    public ngFondoName: string;

    public portfolioList = [];
    public fondosList = [];
    public fondoList: any;

    public tradeForm = new FormGroup({
        portfolio: new FormControl('test'),
        fondo: new FormControl(),
        date: new FormControl(new Date(Globals.g_GlobalStatic.startDate)),
        trade: new FormControl('comprar'),
        pesos: new FormControl(null, [
            Validators.required,
            // CustomValidators.number,
            // CustomValidators.numberq({max: 12})
        ]),
        unidades: new FormControl(null, [
            Validators.required,
        ]),
    });

    constructor( private route: ActivatedRoute,
                 private service:ServiceComponent,
                 private observableMedia: ObservableMedia ) {
        self = this;
        HttpService = this.service;

        this.sub = route.params.subscribe(params => {
            this.routeName = params['name'];
            this.ngPortfolioName = params['name'];
            this.tradeForm.controls['portfolio'].setValue(params['name']);
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

        // Rerender graph after changes portfolio or fondo
        this.tradeForm.controls['portfolio'].valueChanges.subscribe((value) => {
            this.ngPortfolioName = value;
            this.onRefreshTable();
        });
        this.tradeForm.controls['fondo'].valueChanges.subscribe((value) => {
            this.ngFondoName = value;
            const indexValue = this.fondosList.findIndex((obj) => {
                return obj.name === value;
            });
            this.ngScopeFanData = MainOpr.calculateFanChartData(indexValue);
        });

        this.resetForm();
        // this.tradeForm.controls['pesos'].valueChanges.subscribe((value) => {
        //     this.calculateUnidades(value);
        // });
        // this.tradeForm.controls['unidades'].valueChanges.subscribe((value) => {
        //     this.calculatePesos(value);
        // });
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

                    this.setSlider();
                    this.onRefreshTable();
                    this.isValid = true;





                    // Set portfolio list with transform array
                    this.portfolioList = Globals.g_Portfolios.arrDataByPortfolio.map((obj) => {
                        return { ...obj, name: obj.portname};
                    });
                    // Set fondos list
                    this.fondosList = Globals.g_DatabaseInfo.ListofPriceFund;
                    this.ngFondoName = this.fondosList[0]['name'];
                    this.tradeForm.controls['fondo'].setValue(this.fondosList[0]['name']);
                });
        }
    }

    setSlider() {
        this.minVal = 0;
        this.maxVal = Globals.g_DatabaseInfo.ListofPriceFund[0].ulen - 1;
    }

    onInputChange(event: any) {
        const updatedDate = new Date(Globals.g_GlobalStatic.startDate);
        const selectedDate = updatedDate.setDate(updatedDate.getDate() + event.value);
        this.ng_strDate = Globals.convertDate(selectedDate);
        Globals.g_Portfolios.nSliderIndex = event.value;
        this.tradeForm.controls['date'].setValue(new Date(selectedDate));
        // this.ngDatepicker = new Date(selectedDate);

        this.ngSliderIndex = event.value;
    }

    onInputDatepicker(event: any) {
        const diffDate = moment(event.value).diff(moment(Globals.g_GlobalStatic.startDate), 'days');
        this.ng_strDate = Globals.convertDate(moment(event.value).format('YYYY-DD-MM'));
        this.tradeForm.controls['date'].setValue(new Date(event.value));
        Globals.g_Portfolios.nSliderIndex = diffDate;

        this.ngSliderIndex = diffDate;
    }

    onRefreshTable() {
        const transactions = Globals.g_FundParent.arrAllTransaction;
        this.fondoList = {};

        const transactionsByPort = transactions.filter((obj) => {
            return obj.strPortID === this.ngPortfolioName &&
                   moment(obj.tDate).isSameOrBefore(moment(this.tradeForm.controls['date'].value));
        });
        this.fondoList = {
            'PortIndex': 0,
            'PortStatus': 'Show',
            'PortIcon': 'add',
            'Portname': transactionsByPort[0] && transactionsByPort[0].strPortID || [],
            'Portarray': transactionsByPort
        };

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
        this.fondoList.Portarray.sort(function(a, b){
            const keyA = a[Object.keys(a)[index]],
                keyB = b[Object.keys(a)[index]];

            if(keyA < keyB) return (strOrderCmd === 'down') ? -1 : 1;
            if(keyA > keyB) return (strOrderCmd === 'down') ? 1 : -1;
            return 0;
        });
    }

    calculateUnidades(value) {
        const indexFondosValue = this.fondosList.findIndex((obj) => {
            return obj.name === this.ngFondoName;
        });
        const Unidades = value / Globals.g_DatabaseInfo.ListofPriceFund[indexFondosValue].u[this.ngSliderIndex];
        this.tradeForm.controls['unidades'].setValue(Globals.toFixedDecimal(Unidades, 6));
    }

    calculatePesos(value) {
        const indexFondosValue = this.fondosList.findIndex((obj) => {
            return obj.name === this.ngFondoName;
        });
        const Pesos = Math.floor(Globals.g_DatabaseInfo.ListofPriceFund[indexFondosValue].u[this.ngSliderIndex] * value * 10000) / 10000;
        this.tradeForm.controls['pesos'].setValue(Globals.toFixedDecimal(Pesos, 6));
    }

    resetForm() {
        console.log('Reset form',);
        this.tradeForm.controls['date'].valueChanges.subscribe(() => {
            this.tradeForm.controls['pesos'].setValue(null);
            this.tradeForm.controls['unidades'].setValue(null);
            this.onRefreshTable();
        });
        this.tradeForm.controls['fondo'].valueChanges.subscribe(() => {
            this.tradeForm.controls['pesos'].setValue(null);
            this.tradeForm.controls['unidades'].setValue(null);
        });
    }

    formChange() {
        console.log('Change form',);
    }

    onBuy(valuesForm) {
        if (this.tradeForm.valid === false) return false;

        const indexFondosValue = this.fondosList.findIndex((obj) => {
            return obj.name === this.ngFondoName;
        });

        let url = '/buy';
        if(valuesForm.trade === 'comprar') {
            // buy item
            url = url + '/' + Globals.g_DatabaseInfo.ListofPriceFund[indexFondosValue].index;
            url = url + '/' + valuesForm.unidades;
            url = url + '/' + 999;
            url = url + '/' + valuesForm.pesos;
            url = url + '/' + moment(valuesForm.date).format('YYYY-MM-DD');
            url = url + '/' + valuesForm.portfolio;
            url = url + '/' + 'deploy_user';
            url = url + '/' + Globals.convertDate(new Date());
            console.log('BUY URL', url);
        } else {
            // sell item
            url = url + '/' + 999;
            url = url + '/' + Math.abs(valuesForm.unidades);
            url = url + '/' + Globals.g_DatabaseInfo.ListofPriceFund[indexFondosValue].index;
            url = url + '/' + Math.abs(valuesForm.pesos);
            url = url + '/' + moment(valuesForm.date).format('YYYY-MM-DD');
            url = url + '/' + valuesForm.portfolio;
            url = url + '/' + 'deploy_user';
            url = url + '/' + Globals.convertDate(new Date());
            console.log('SELL URL', url);
        }

        // HttpService.getBuyResponse(url).subscribe(
        //     response => {
        //         HttpService.getTransactionList().subscribe(
        //             response => {
        //                 MainOpr.getTransactionData(response);
        //                 MainOpr.CalculatePortfolioData();
        //                 this.onRefreshTable();
        //                 this.checkTable();
        //
        //                 this.disabled = false;
        //             });
        //     });
    }

    checkTable() {
        for (let i = 0; i < this.tableInfo.length; i ++) {
            for (let j = 0; j < Globals.g_DatabaseInfo.ListofPriceFund.length; j ++) {
                const eachArray = [];
                for (let k = 0; k < this.tableInfo[i].Portarray.length; k ++) {
                    if (this.tableInfo[i].Portarray[k].nFundIndex == j) eachArray.push(this.tableInfo[i].Portarray[k]);
                }
                if (eachArray.length > 0){
                    for (let k = 0; k < eachArray.length; k ++) {
                        eachArray[k].deletable = false;
                        let sum = 0;
                        for (let n = 0; n < eachArray.length; n ++) {
                            if (k == n) continue;
                            const ItemCnt = eachArray[n].nItemCnt;
                            sum = sum + ItemCnt;
                            if (sum < 0) {
                                eachArray[k].deletable = true;
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
}
