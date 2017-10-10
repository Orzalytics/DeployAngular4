import { compact } from 'lodash';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { ServiceComponent } from '../../service/service.component';
import * as Globals from './../../globals/globals.component';
import * as MainOpr from './../../mainoperation/mainoperation.component';

// flex-layout
// import { ObservableMedia } from '@angular/flex-layout';

// material
// import {Observable} from 'rxjs/Observable';

import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import { ObservableMedia } from '@angular/flex-layout';
import { Observable } from 'rxjs/Observable';
import { FormControl, FormGroup } from '@angular/forms';

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

    // escoje portafolio //
    ngScopeVoP: any;
    ngScopeGoL: any;
    ngScopeMax: any;
    ngScopeMin: any;
    ngScopeRate: any;

    // escoje fondo //
    ngScopeDay91: any;
    ngScopeDay182: any;
    ngScopeDay365: any;
    ngScopeYear: any;

    ngScopeFanData: any;

    // comprar o vender //
    ngScopeUnidades: any;
    ngScopeTranPrice: any;
    ngSecondGraphModel: any;
    ngSecondGraphAmount: any;

    // transaction table //
    // values for icon information on table header
    tbHeader = [
        // {index : 0, title : 'portafolio', icon : ''},
        {index : 0, title : 'fecha', icon : ''},
        {index : 1, title : 'fondo', icon : ''},
        {index : 2, title : 'compra o venta', icon : ''},
        {index : 3, title : 'unidades', icon : ''},
        {index : 4, title : 'precio unidad', icon : ''},
        {index : 5, title : 'total pesos', icon : ''},
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
    public fondosList: Array<number>;
    public fondoList: any;

    public tradeForm = new FormGroup({
        portfolio: new FormControl('test'),
        fondo: new FormControl(),
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
        });
        this.tradeForm.controls['fondo'].valueChanges.subscribe((value) => {
            this.ngFondoName = value;
        });
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
                    // this.onInitSelect();
                    // this.onPfnameChanged();
                    // this.setEscojePortafolio();
                    // this.setEscojeFondo();
                    // this.setComprarVender();
                    // this.onInitGraphData();
                    this.onRefreshTable();
                    // this.checkTable();
                    this.isValid = true;





                    // Set portfolio list with transform array
                    this.portfolioList = Globals.g_Portfolios.arrDataByPortfolio.map((obj) => {
                        return { ...obj, name: obj.portname};
                    });
                    // Set fondos list
                    this.fondosList = Globals.g_DatabaseInfo.ListofPriceFund;
                    this.ngFondoName = this.fondosList[0]['name'];
                    this.tradeForm.controls['fondo'].setValue(this.fondosList[0]['name']);
                    console.log('Form ',this.fondosList[0]['name']);
                });
        }
    };

    setSlider() {
        this.minVal = 0;
        this.maxVal = Globals.g_DatabaseInfo.ListofPriceFund[0].ulen - 1;
    }

    onInputChange(event: any) {
        const updatedDate = new Date(Globals.g_GlobalStatic.startDate);
        const selectedDate = updatedDate.setDate(updatedDate.getDate() + event.value);
        this.ng_strDate = Globals.convertDate(selectedDate);
        Globals.g_Portfolios.nSliderIndex = event.value;
        this.ngDatepicker = new Date(selectedDate);

        this.ngSliderIndex = event.value;

        // Update Escoje Fondo&Portafolio
        // this.setEscojePortafolio();
        // this.setEscojeFondo();
        // this.setComprarVender();
    }

    onInputDatepicker(event: any) {
        const diffDate = moment(event.value).diff(moment(Globals.g_GlobalStatic.startDate), 'days');
        this.ng_strDate = Globals.convertDate(moment(event.value).format('YYYY-DD-MM'));
        Globals.g_Portfolios.nSliderIndex = diffDate;

        // Update Slider Index for send Event
        this.ngSliderIndex = diffDate;

        // Update Escoje Fondo&Portafolio
        // this.setEscojePortafolio();
        // this.setEscojeFondo();
        // this.setComprarVender();
    }
    // setEscojePortafolio() {
    //     if (this.ngPortIndex > -1) {
    //         let VoP = Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].stairArray[this.ngSliderIndex];
    //         let Max = 0;
    //         let Min = 999999;
    //         let GoL = 0;
    //
    //         for (let i = 0; i <= this.ngSliderIndex; i ++) {
    //             if (Max < Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].portArray[i]) Max = Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].portArray[i];
    //             if (Min > Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].portArray[i]) Min = Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].portArray[i];
    //         }
    //         if (VoP > 0) GoL = Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].portArray[this.ngSliderIndex] / VoP * 100;
    //
    //         this.ngScopeVoP = (VoP != undefined) ? Globals.numberWithCommas(VoP.toFixed(2)) : 0;
    //         this.ngScopeGoL = (GoL != undefined) ? Globals.numberWithCommas(GoL.toFixed(2)) : 0;
    //         this.ngScopeMax = Globals.numberWithCommas(Max.toFixed(2));
    //         this.ngScopeMin = (Min != 999999) ? Globals.numberWithCommas(Min.toFixed(2)) : 0;
    //         this.ngScopeRate = Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].yearRateArray[this.ngSliderIndex];
    //     }else{
    //         this.ngScopeVoP = '0.00';
    //         this.ngScopeGoL = '0.00';
    //         this.ngScopeMax = '0.00';
    //         this.ngScopeMin = '0.00';
    //         this.ngScopeRate = '0.00';
    //     }
    // }
    //
    // setEscojeFondo() {
    //     const day91 = Globals.g_FundParent.arrAllReturns.day91_return[this.ngSelFondosValue][this.ngSliderIndex]*100;
    //     const day182 = Globals.g_FundParent.arrAllReturns.day182_return[this.ngSelFondosValue][this.ngSliderIndex]*100;
    //     const day365 = Globals.g_FundParent.arrAllReturns.day365_return[this.ngSelFondosValue][this.ngSliderIndex]*100;
    //     const year = Globals.g_FundParent.arrAllReturns.newstart_return[this.ngSelFondosValue][this.ngSliderIndex] * 1;
    //     this.ngScopeDay91 = (day91 != undefined) ? Globals.numberWithCommas(day91.toFixed(1)) : 0;
    //     this.ngScopeDay182 = (day182 != undefined) ? Globals.numberWithCommas(day182.toFixed(1)) : 0;
    //     this.ngScopeDay365 = (day365 != undefined) ? Globals.numberWithCommas(day365.toFixed(1)) : 0;
    //     this.ngScopeYear = (year != undefined) ? Globals.numberWithCommas(year.toFixed(1)) : 0;
    //     if (this.ngScopeDay91 > 0) this.ngScopeDay91 = '+'+this.ngScopeDay91;
    //     if (this.ngScopeDay182 > 0) this.ngScopeDay182 = '+'+this.ngScopeDay182;
    //     if (this.ngScopeDay365 > 0) this.ngScopeDay365 = '+'+this.ngScopeDay365;
    //     if (this.ngScopeYear > 0) this.ngScopeYear = '+'+this.ngScopeYear;
    // }
    //
    // setComprarVender() {
    //     this.ngSecondGraphModel = 0;
    //     this.ngSecondGraphAmount  = 0;
    //     this.ngScopeUnidades = 0;
    //     this.ngScopeTranPrice = 0;
    //
    //     for (let i = 0; i < Globals.g_Portfolios.arrDataByPortfolio.length; i ++){
    //         if (this.ngPortfolioName == Globals.g_Portfolios.arrDataByPortfolio[i].portname){
    //             let sum = 0;
    //             for (let j = 0; j <= this.ngSliderIndex; j ++){
    //                 sum = sum + Globals.g_Portfolios.arrDataByPortfolio[i].arrPurchase[this.ngSelFondosValue][j].unidades;
    //             }
    //
    //             this.ngScopeUnidades = Globals.numberWithCommas(sum.toFixed(6));
    //             this.ngScopeTranPrice = Globals.numberWithCommas(Globals.g_Portfolios.arrDataByPortfolio[i].staircase[this.ngSelFondosValue][this.ngSliderIndex].toFixed(2));
    //             this.ngSecondGraphModel = Globals.g_Portfolios.arrDataByPortfolio[i].arrPurchase[this.ngSelFondosValue][this.ngSliderIndex].unidades;
    //             this.ngSecondGraphAmount = Globals.g_Portfolios.arrDataByPortfolio[i].arrPurchase[this.ngSelFondosValue][this.ngSliderIndex].pesos;
    //             break;
    //         }
    //     }
    // }
    //
    // onInitSelect() {
    //     this.fondos = [];
    //     for (let i = 0; i < Globals.g_DatabaseInfo.ListofPriceFund.length; i ++) {
    //         const fondoType = {value : 0, viewValue : ''};
    //         fondoType.value = i;
    //         fondoType.viewValue = Globals.g_DatabaseInfo.ListofPriceFund[i].name;
    //         this.fondos[i] = fondoType;
    //     }
    //     this.ngSelFondosValue = this.fondos[0].value;
    // }
    //
    // onInitGraphData() {
    //     const arrOtherNew999Price = [];
    //     const arrOtherStaircase = [];
    //
    //     for (let i = 0; i < Globals.g_DatabaseInfo.ListofPriceFund.length; i ++) {
    //         arrOtherNew999Price[i] = [];
    //         arrOtherStaircase[i] = [];
    //         for (let j = 0; j < Globals.g_DatabaseInfo.ListofPriceFund[i].ulen; j ++) {
    //             arrOtherNew999Price[i][j] = 0;
    //             arrOtherStaircase[i][j] = 0;
    //             if (this.ngPortIndex > -1) arrOtherNew999Price[i][j] = Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].arrPurchase[i][j].unidades;
    //             if ((i == this.ngSelFondosValue) && (j == this.ngSliderIndex)) {
    //                 arrOtherNew999Price[i][j] = this.ngSecondGraphModel;
    //             }
    //         }
    //     }
    //
    //     for (let i = 0; i < Globals.g_DatabaseInfo.ListofPriceFund.length; i ++){
    //         let temp = 0;
    //         let new999Price = 0;
    //         for (let j = 0; j < Globals.g_DatabaseInfo.ListofPriceFund[i].ulen; j ++){
    //             if (arrOtherNew999Price[i][j] != 0){
    //                 temp = temp + arrOtherNew999Price[i][j];
    //                 new999Price = new999Price + Globals.g_DatabaseInfo.ListofPriceFund[i].u[j] * arrOtherNew999Price[i][j];
    //             }
    //             arrOtherNew999Price[i][j] = temp * Globals.g_DatabaseInfo.ListofPriceFund[i].u[j] - new999Price;
    //             arrOtherStaircase[i][j] = temp * Globals.g_DatabaseInfo.ListofPriceFund[i].u[j];
    //         }
    //     }
    //
    //     const arrPortSum = [];
    //     const arrStairSum = [];
    //     for (let i = 0; i < Globals.g_DatabaseInfo.ListofPriceFund[0].ulen; i++) {
    //         let sum1 = 0;
    //         let sum2 = 0;
    //
    //         for (let j = 0; j < Globals.g_DatabaseInfo.ListofPriceFund.length; j ++){
    //             sum1 = sum1 + arrOtherNew999Price[j][i];
    //             sum2 = sum2 + arrOtherStaircase[j][i];
    //         }
    //
    //         arrPortSum.push(sum1);
    //         arrStairSum.push(sum2);
    //     }
    //
    //     Globals.g_AllStatus.arrPortfolioData = arrPortSum;
    //     Globals.g_AllStatus.arrStaircaseData = arrStairSum;
    // }

    onPfnameChanged() {
        console.log('Globals', Globals.g_Portfolios);
        console.log('this.ngPortfolioName', this.ngPortfolioName);
        Globals.g_AllStatus.strPfName = this.ngPortfolioName;

        this.ngPortIndex = -1;
        for (let i = 0; i < Globals.g_Portfolios.arrDataByPortfolio.length; i ++) {
            if (Globals.g_Portfolios.arrDataByPortfolio[i].portname === this.ngPortfolioName) {
                this.ngPortIndex = i;
                break;
            }
        }

        // this.setEscojePortafolio();
        // this.setComprarVender();
        // this.onInitGraphData();
    }

    onRefreshTable() {
        const transactions = Globals.g_FundParent.arrAllTransaction;
        // this.tableInfo = [];
        this.fondoList = {};

        const transactionsByPort = transactions.filter((obj) => {
            return obj.strPortID === this.ngPortfolioName;
        });
        this.fondoList = {
                'PortIndex': 0,
                'PortStatus': 'Show',
                'PortIcon': 'add',
                'Portname': transactionsByPort[0].strPortID,
                'Portarray': transactionsByPort
            };

        this.tbHeader[0].icon = '';
        this.onTableReorder(0);
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
        this.sortTable(index, strOrderCmd);
    }

    sortTable(index, strOrderCmd) {
        console.log('Prop', this.fondoList.Portarray);
        // this.fondoList.Portarray.sort(function(a, b){
        //     const keyA = a[Object.keys(a)[index]],
        //         keyB = b[Object.keys(a)[index]];
        //
        //     // Compare the 2 dates
        //     if(keyA < keyB) return (strOrderCmd === 'down') ? -1 : 1;
        //     if(keyA > keyB) return (strOrderCmd === 'down') ? 1 : -1;
        //     return 0;
        // });
    }



}
