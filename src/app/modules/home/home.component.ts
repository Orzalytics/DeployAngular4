import { compact } from 'lodash';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ServiceComponent } from '../../service/service.component';
import * as Globals from '../../globals/globals.component';
import * as MainOpr from '../../mainoperation/mainoperation.component';

// flex-layout
import { ObservableMedia } from '@angular/flex-layout';

// material
import { Observable } from 'rxjs/Observable';

import * as moment from 'moment';

let HttpService: any;
let self: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [ServiceComponent]
})
export class HomeComponent implements OnInit, OnDestroy {
    @ViewChild('selectPortfolio', {read: ElementRef}) selectPortfolio: ElementRef;
    @ViewChild('resizableEl', {read: ElementRef}) resizableEl: ElementRef;

    public fullscreen: boolean = false;

    public PortfolioList = [];

    public cols: Observable<number>;
    public width: number;
    public ngPortIndex: number = -1;

    // Chart Input Values //
    public ngPortfolioName: any;
    public ngSelFondosValue = 0;
    // ngWidth: any;
    // fondos: any;

    // escoje portafolio //
    public ngScopeVoP: any;
    public ngScopeRate: any;
    // ngScopeGoL: any;
    // ngScopeMax: any;
    // ngScopeMin: any;

    // escoje fondo //
    // ngScopeDay91: any;
    // ngScopeDay182: any;
    // ngScopeDay365: any;
    // ngScopeYear: any;

    // ngScopeFanData: any;

    // comprar o vender //
    public ngSecondGraphModel = 0;
    // ngScopeUnidades: any;
    // ngScopeTranPrice: any;
    // ngSecondGraphAmount: any;

    // transaction table //
    public tableInfo = [];
    // values for icon information on table header
    // tbHeader = [
    //     {index : 0, title : 'portafolio', icon : ''},
    //     {index : 1, title : 'fecha', icon : ''},
    //     {index : 2, title : 'fondo', icon : ''},
    //     {index : 3, title : 'compra o venta', icon : ''},
    //     {index : 4, title : 'unidades', icon : ''},
    //     {index : 5, title : 'precio unidad', icon : ''},
    //     {index : 6, title : 'total pesos', icon : ''},
    // ];
    notMovedToTooltip: boolean = true;
    // tableStore = [];

    // Slider //
    public ngSliderIndex = 0;
    // disabled = false;
    public maxVal = 0;
    public minVal = 0;
    public minDate = moment().format('YYYY-MM-DD');
    public maxDate = moment().format('YYYY-MM-DD');
    public ng_strDate = Globals.convertDate(Globals.g_GlobalStatic.startDate);
    // ngAllRefresh: number = 0;
    // ngFileUploadPath: any;
    public isValid: boolean = false;
    public nTimerId: any;
    // public ngDatepicker = new Date(Globals.g_GlobalStatic.startDate);
    public ngDate = moment(Globals.g_GlobalStatic.startDate).format('YYYY-MM-DD');

    constructor( private service: ServiceComponent,
                 private observableMedia: ObservableMedia ) {
        self = this;
        HttpService = this.service;
    }

    ngOnInit() {
        HttpService.getDatabaseInfo();
        this.nTimerId = setInterval(() => {
            this.checkStart();
        }, 100);

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
    }

    ngOnDestroy() {
        if (this.nTimerId) {
            clearInterval(this.nTimerId);
        }
    }

    checkStart() {
        if (Globals.g_DatabaseInfo.bIsStartCalc) {
            clearInterval(this.nTimerId);
            this.PortfolioList = Globals.g_DatabaseInfo.PortfolioList;
            MainOpr.onCalculateData();
            HttpService.getTransactionList().subscribe(
                response => {
                    MainOpr.getTransactionData(response);
                    MainOpr.CalculatePortfolioData();

                    this.ngPortfolioName = Globals.g_DatabaseInfo.PortfolioList[0].portfolio_id;
                    this.setSlider();
                    // this.onInitSelect();
                    this.onRefreshTable();
                    this.onPfnameChanged();
                    // this.setEscojePortafolio();
                    // this.setEscojeFondo();
                    // this.setComprarVender();
                    // this.onInitGraphData();
                    // this.checkTable();
                    this.isValid = true;
            });
        }
    }

    setSlider() {
        this.minVal = 0;
        this.maxVal = Globals.g_DatabaseInfo.ListofPriceFund[0].ulen - 1;

        this.ngSliderIndex = this.maxVal;

        const updatedDate = moment(Globals.g_GlobalStatic.startDate);
        this.minDate = updatedDate.format('YYYY-MM-DD');
        this.maxDate = updatedDate.add(this.ngSliderIndex, 'day').format('YYYY-MM-DD');

        // this.ng_strDate = Globals.convertDate(selectedDate);
        // this.maxDate = Globals.convertDate(selectedDate);
        this.ngDate = moment(this.maxDate).format('YYYY-MM-DD');
    }

    setEscojePortafolio() {
        if (this.ngPortIndex > -1) {
            const VoP = Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].stairArray[this.ngSliderIndex];
            // let Max = 0;
            // let Min = 999999;
            // let GoL = 0;

            // for (let i = 0; i <= this.ngSliderIndex; i ++) {
            //     if (Max < Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].portArray[i])
            //         Max = Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].portArray[i];
            //
            //     if (Min > Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].portArray[i])
            //         Min = Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].portArray[i];
            // }
            // if (VoP > 0) GoL = Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].portArray[this.ngSliderIndex] / VoP * 100;

            this.ngScopeVoP = (VoP !== undefined) ? Globals.numberWithCommas(VoP.toFixed(2)) : 0;
            // this.ngScopeGoL = (GoL != undefined) ? Globals.numberWithCommas(GoL.toFixed(2)) : 0;
            // this.ngScopeMax = Globals.numberWithCommas(Max.toFixed(2));
            // this.ngScopeMin = (Min != 999999) ? Globals.numberWithCommas(Min.toFixed(2)) : 0;
            this.ngScopeRate = Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].yearRateArray[this.ngSliderIndex];
        }else {
            this.ngScopeVoP = '0.00';
            // this.ngScopeGoL = '0.00';
            // this.ngScopeMax = '0.00';
            // this.ngScopeMin = '0.00';
            this.ngScopeRate = '0.00';
        }
    }

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

    setComprarVender() {
        // this.ngSecondGraphModel = 0;
        // this.ngSecondGraphAmount  = 0;
        // this.ngScopeUnidades = 0;
        // this.ngScopeTranPrice = 0;

        for (let i = 0; i < Globals.g_Portfolios.arrDataByPortfolio.length; i ++) {
            console.log('this.ngSelFondosValue', this.ngSelFondosValue);
            if (this.ngPortfolioName === Globals.g_Portfolios.arrDataByPortfolio[i].portname){
                let sum = 0;
                for (let j = 0; j <= this.ngSliderIndex; j ++) {
                    sum = sum + Globals.g_Portfolios.arrDataByPortfolio[i].arrPurchase[this.ngSelFondosValue][j].unidades;
                }
                // this.ngScopeUnidades = Globals.numberWithCommas(sum.toFixed(6));
                // this.ngScopeTranPrice = Globals.numberWithCommas(Globals.g_Portfolios.arrDataByPortfolio[i].staircase[this.ngSelFondosValue][this.ngSliderIndex].toFixed(2));
                this.ngSecondGraphModel = Globals.g_Portfolios.arrDataByPortfolio[i].arrPurchase[this.ngSelFondosValue][this.ngSliderIndex].unidades;
                // this.ngSecondGraphAmount = Globals.g_Portfolios.arrDataByPortfolio[i].arrPurchase[this.ngSelFondosValue][this.ngSliderIndex].pesos;
                break;
            }
        }
    }

    onInputChange(event: any) {
        const updatedDate = moment(Globals.g_GlobalStatic.startDate);
        const selectedDate = updatedDate.add(event.value, 'days');

        this.ng_strDate = Globals.convertDate(selectedDate);
        Globals.g_Portfolios.nSliderIndex = event.value;
        this.ngDate = moment(selectedDate).format('YYYY-MM-DD');

        // Update Slider Index for send Event
        this.ngSliderIndex = event.value;

        // Update Escoje Fondo&Portafolio
        this.setEscojePortafolio();
        // this.setEscojeFondo();
        this.setComprarVender();
    }

    onInputDatepicker(event: any) {
        const diffDate = moment(event.value).diff(moment(Globals.g_GlobalStatic.startDate), 'days');
        this.ng_strDate = Globals.convertDate(moment(event.value).format('YYYY-DD-MM'));
        Globals.g_Portfolios.nSliderIndex = diffDate;

        // Update Slider Index for send Event
        this.ngSliderIndex = diffDate;

        // Update Escoje Fondo&Portafolio
        this.setEscojePortafolio();
        // this.setEscojeFondo();
        this.setComprarVender();
    }

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

    onInitGraphData() {
        const arrOtherNew999Price = [];
        const arrOtherStaircase = [];

        for (let i = 0; i < Globals.g_DatabaseInfo.ListofPriceFund.length; i ++) {
            arrOtherNew999Price[i] = [];
            arrOtherStaircase[i] = [];
            for (let j = 0; j < Globals.g_DatabaseInfo.ListofPriceFund[i].ulen; j ++) {
                arrOtherNew999Price[i][j] = 0;
                arrOtherStaircase[i][j] = 0;
                if (this.ngPortIndex > -1) arrOtherNew999Price[i][j] = Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].arrPurchase[i][j].unidades;
                if ((i === this.ngSelFondosValue) && (j == this.ngSliderIndex)) {
                    arrOtherNew999Price[i][j] = this.ngSecondGraphModel;
                }
            }
        }

        for (let i = 0; i < Globals.g_DatabaseInfo.ListofPriceFund.length; i ++) {
            let temp = 0;
            let new999Price = 0;
            for (let j = 0; j < Globals.g_DatabaseInfo.ListofPriceFund[i].ulen; j ++) {
                if (arrOtherNew999Price[i][j] !== 0) {
                    temp = temp + arrOtherNew999Price[i][j];
                    new999Price = new999Price + Globals.g_DatabaseInfo.ListofPriceFund[i].u[j] * arrOtherNew999Price[i][j];
                }
                arrOtherNew999Price[i][j] = temp * Globals.g_DatabaseInfo.ListofPriceFund[i].u[j] - new999Price;
                arrOtherStaircase[i][j] = temp * Globals.g_DatabaseInfo.ListofPriceFund[i].u[j];
            }
        }

        const arrPortSum = [];
        const arrStairSum = [];
        for (let i = 0; i < Globals.g_DatabaseInfo.ListofPriceFund[0].ulen; i++) {
            let sum1 = 0;
            let sum2 = 0;

            for (let j = 0; j < Globals.g_DatabaseInfo.ListofPriceFund.length; j ++) {
                sum1 = sum1 + arrOtherNew999Price[j][i];
                sum2 = sum2 + arrOtherStaircase[j][i];
            }

            arrPortSum.push(sum1);
            arrStairSum.push(sum2);
        }

        Globals.g_AllStatus.arrPortfolioData = arrPortSum;
        Globals.g_AllStatus.arrStaircaseData = arrStairSum;
    }

    onPfnameChanged() {
        setTimeout(() => {
            this.width = this.selectPortfolio.nativeElement.querySelector('.mat-select-value-text span').offsetWidth + 22;
        });

        Globals.g_AllStatus.strPfName = this.ngPortfolioName;

        this.ngPortIndex = -1;
        for (let i = 0; i < Globals.g_Portfolios.arrDataByPortfolio.length; i ++) {
            if (Globals.g_Portfolios.arrDataByPortfolio[i].portname === this.ngPortfolioName) {
                this.ngPortIndex = i;
                break;
            }
        }

        this.setEscojePortafolio();
        this.setComprarVender();
        this.onInitGraphData();
    }

    tranformFunc(resizableEl) {
        if(this.fullscreen) {
            resizableEl._element.nativeElement.classList.remove('full-size');
        } else {
            resizableEl._element.nativeElement.classList.add('full-size');
        }

        this.fullscreen = !this.fullscreen;
    }

    // onUnidadesChange() {
    //     this.disabled = true;
    //
    //     let sum = 0;
    //     let min = 0;
    //     let curItemCnt = 0;
    //
    //     if (this.ngPortIndex > -1) {
    //         let nItemByDate = 0;
    //         for (let j = 0; j <= this.ngSliderIndex; j ++){
    //             sum = sum + Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].arrPurchase[this.ngSelFondosValue][j].unidades;
    //         }
    //         sum = Globals.toFixedDecimal(sum, 6);
    //
    //         curItemCnt = sum;
    //         min = sum;
    //         nItemByDate = sum;
    //
    //         for (let j = this.ngSliderIndex + 1; j < Globals.g_DatabaseInfo.ListofPriceFund[0].ulen; j ++) {
    //             nItemByDate = nItemByDate + Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].arrPurchase[this.ngSelFondosValue][j].unidades;
    //             if (min > nItemByDate){
    //                 min = nItemByDate;
    //             }
    //         }
    //     }
    //
    //     if (this.ngSecondGraphModel >= 0) {
    //     } else {
    //         if (this.ngSecondGraphModel + curItemCnt < 0) {
    //             this.ngSecondGraphModel = -curItemCnt;
    //         }
    //
    //         if (this.ngSecondGraphModel + min < 0) {
    //             this.ngSecondGraphModel = -min;
    //         }
    //
    //         if (this.ngSecondGraphModel == 0) { this.ngSecondGraphModel = 0; }
    //     }
    //
    //     const Pesos = Math.floor(Globals.g_DatabaseInfo.ListofPriceFund[this.ngSelFondosValue].u[this.ngSliderIndex] * this.ngSecondGraphModel * 10000) / 10000;
    //     this.ngSecondGraphAmount = Globals.toFixedDecimal(Pesos, 6);
    //
    //     this.ngScopeUnidades = Globals.numberWithCommas(Globals.toFixedDecimal(sum + this.ngSecondGraphModel, 6));
    //
    //     if (this.ngPortIndex > -1) {
    //         this.ngScopeTranPrice = Globals.numberWithCommas(Globals.toFixedDecimal((Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].staircase[this.ngSelFondosValue][this.ngSliderIndex] + this.ngSecondGraphAmount), 2));
    //     } else {
    //         this.ngScopeTranPrice = this.ngSecondGraphAmount;
    //     }
    //
    //     this.onInitGraphData();
    // }

    // onPesosChange() {
    //     this.disabled = true;
    //
    //     let sum = 0;
    //     let min = 0;
    //     let curItemCnt = 0;
    //
    //     if (this.ngPortIndex > -1) {
    //         let nItemByDate = 0;
    //         for (let j = 0; j <= this.ngSliderIndex; j ++){
    //             sum = sum + Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].arrPurchase[this.ngSelFondosValue][j].unidades;
    //         }
    //         sum = Globals.toFixedDecimal(sum, 6);
    //
    //         curItemCnt = Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].staircase[this.ngSelFondosValue][this.ngSliderIndex];
    //         min = Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].staircase[this.ngSelFondosValue][this.ngSliderIndex];
    //         nItemByDate = Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].staircase[this.ngSelFondosValue][this.ngSliderIndex];
    //
    //         for (let j = this.ngSliderIndex + 1; j < Globals.g_DatabaseInfo.ListofPriceFund[0].ulen; j ++) {
    //             if (min > Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].staircase[this.ngSelFondosValue][j]){
    //                 min = Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].staircase[this.ngSelFondosValue][j];
    //             }
    //         }
    //     }
    //
    //     if (this.ngSecondGraphAmount >= 0) {
    //     } else {
    //         if (this.ngSecondGraphAmount + curItemCnt < 0) {
    //             this.ngSecondGraphAmount = -curItemCnt;
    //         }
    //
    //         if (this.ngSecondGraphAmount + min < 0){
    //             this.ngSecondGraphAmount = -min;
    //         }
    //
    //         if (this.ngSecondGraphAmount == 0) this.ngSecondGraphAmount = 0;
    //
    //         this.ngSecondGraphAmount = Globals.toFixedDecimal(this.ngSecondGraphAmount, 6);
    //     }
    //
    //     const Unidades = this.ngSecondGraphAmount / Globals.g_DatabaseInfo.ListofPriceFund[this.ngSelFondosValue].u[this.ngSliderIndex];
    //     this.ngSecondGraphModel = Globals.toFixedDecimal(Unidades, 6);
    //
    //     this.ngScopeUnidades = Globals.numberWithCommas(Globals.toFixedDecimal(sum + this.ngSecondGraphModel, 6));
    //
    //     if (this.ngPortIndex > -1) {
    //         this.ngScopeTranPrice = Globals.numberWithCommas(Globals.toFixedDecimal((Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].staircase[this.ngSelFondosValue][this.ngSliderIndex] + this.ngSecondGraphAmount), 2));
    //     } else {
    //         this.ngScopeTranPrice = this.ngSecondGraphAmount;
    //     }
    //
    //     this.onInitGraphData();
    // }

    onRefreshTable() {
        const transactions = Globals.g_FundParent.arrAllTransaction;
        this.tableInfo = [];

        for (let i = 0; i < Globals.g_DatabaseInfo.PortfolioList.length; i ++) {
            const listOfSaverTransaction = [];
            for (let j = 0; j < transactions.length; j ++) {
                if (Globals.g_DatabaseInfo.PortfolioList[i].portfolio_id !== transactions[j].strPortID) continue;
                listOfSaverTransaction.push(transactions[j]);
            }

            if (listOfSaverTransaction.length > 0) {
                const eachObj = {
                    'PortIndex' : 0,
                    'PortStatus' : 'Show',
                    'PortIcon' : 'add',
                    'Portname' : listOfSaverTransaction[0].strPortID,
                    'Portarray' : listOfSaverTransaction
                };
                this.tableInfo.push(eachObj);
            }
        }
    }

    toltipMouseLeave() {
        this.notMovedToTooltip = true;
        document.getElementById('scatter_tooltip').style.display = 'none';
    }

    toltipMouseEnter() {
        this.notMovedToTooltip = false;
    }

    // onShowHide(index, bIsDraw) {
    //     console.log('on show hide',);
    //     this.tableInfo = [];
    //     this.tableStore[index].PortStatus = (this.tableStore[index].PortStatus == 'Show') ? 'Hide' : 'Show';
    //     this.tableStore[index].PortIcon = (this.tableStore[index].PortStatus == 'Show') ? 'add' : 'remove';
    //
    //     for (var i = 0; i < this.tableStore.length; i ++) {
    //         this.tableInfo.push(Object.assign({}, this.tableStore[i]));
    //         if (this.tableStore[i].PortStatus != 'Show') {
    //             Globals.g_Portfolios.arrDataByPortfolio[i].showhide = 0;
    //             this.tableInfo[i].Portarray = [];
    //         }else{
    //             Globals.g_Portfolios.arrDataByPortfolio[i].showhide = 1;
    //         }
    //     }
    //     if(bIsDraw == 1) this.ngAllRefresh = this.ngAllRefresh + 1;
    // }

    // parsing excel data
    // onParsing(data) {
    //     let postData = [];
    //     for (let i = 0; i < data.length; i ++) {
    //         const fundObj = data[i]['fondo'];
    //
    //         if ((data[i]['año'] == undefined) || (data[i]['año'] == '')) break;
    //         if ((data[i]['mes'] == undefined) || (data[i]['mes'] == '')) break;
    //         if ((data[i]['día'] == undefined) || (data[i]['día'] == '')) break;
    //         if ((data[i]['fondo'] == undefined) || (data[i]['fondo'] == '')) break;
    //         if ((data[i]['compra/-venta'] == undefined) || (data[i]['compra/-venta'] == '')) break;
    //         if ((data[i]['portafolio'] == undefined) || (data[i]['portafolio'] == '')) break;
    //
    //         const strFundName = Globals.GetFundIndexByKey(fundObj);
    //         if (strFundName == undefined) break;
    //
    //         const nFundID = Globals.GetFundIndex(strFundName);
    //         const strDate = Globals.convertDate(new Date(data[i]['año'] + '-' + data[i]['mes'] + '-' + data[i]['día']));
    //         const strPortName = data[i]['portafolio'];
    //         const nItemCnt = data[i]['compra/-venta']*1;
    //         const nSliderIndex = Globals.GetDateIndex(Globals.g_DatabaseInfo.ListofPriceFund[0].udate, strDate);
    //         const nItemValue = Globals.g_DatabaseInfo.ListofPriceFund[nFundID].u[nSliderIndex];
    //         const strCurDate = Globals.convertDate(new Date());
    //         const nTotal = Globals.multiple(Math.abs(nItemCnt), nItemValue);
    //
    //         const objParam = {'fund_id_bought' : 0, 'units_bought' : 0, 'fund_id_sold' : 0, 'units_sold' : 0, 'date_value_transaction' : '', 'portfolio_id' : 0, 'saver_id' : '', 'nowDate' : ''};
    //         objParam.fund_id_bought = (nItemCnt >= 0) ? Globals.g_DatabaseInfo.ListofPriceFund[nFundID].index : 999;
    //         objParam.units_bought = Math.abs(nItemCnt);
    //         objParam.fund_id_sold = (nItemCnt >= 0) ? '999' : Globals.g_DatabaseInfo.ListofPriceFund[nFundID].index;
    //         objParam.units_sold = nTotal;
    //         objParam.date_value_transaction = strDate;
    //         objParam.portfolio_id = strPortName;
    //         objParam.saver_id = 'deploy_user';
    //         objParam.nowDate = strCurDate;
    //
    //         let url = '/buy/';
    //         const cond1 = (nItemCnt >= 0) ? Globals.g_DatabaseInfo.ListofPriceFund[nFundID].index : 999;
    //         url = url + cond1 + '/';
    //         url = url + Math.abs(nItemCnt) + '/';
    //         const cond2 = (nItemCnt >= 0) ? '999' : Globals.g_DatabaseInfo.ListofPriceFund[nFundID].index;
    //         url = url + cond2 + '/';
    //         url = url + nTotal + '/';
    //         url = url + strDate + '/';
    //         url = url + this.ngPortfolioName + '/';
    //         url = url + 'deploy_user' + '/';
    //         url = url + strCurDate;
    //
    //         postData.push(objParam);
    //     }
    //
    //     if (postData.length > 0){
    //         HttpService.uploadBuyData(postData).subscribe(
    //             response => {
    //                 HttpService.getPortfolioList().subscribe(
    //                     response => {
    //                         HttpService.getTransactionList().subscribe(
    //                             response => {
    //                                 MainOpr.getTransactionData(response);
    //                                 MainOpr.CalculatePortfolioData();
    //                                 this.onPfnameChanged();
    //                                 this.setEscojeFondo();
    //                                 this.onRefreshTable();
    //                                 this.checkTable();
    //                                 this.disabled = false;
    //                         });
    //                 });
    //         });
    //         this.tableInfo = [];
    //     }
    // }

    // onChangeFilePath($event): void {
    //     this.readCSVFile($event.target);
    // }

    // readCSVFile(inputValue: any): void {
    //     const file:File = inputValue.files[0];
    //     const myReader:FileReader = new FileReader();
    //     myReader.onloadend = function(e){
    //         // you can perform an action with readed data here
    //         HttpService.sendExcelData(myReader.result).subscribe(
    //             response => {
    //                 self.onParsing(response);
    //         });
    //     }
    //     myReader.readAsText(file);
    // }

    // upload transaction
    // onUpload() {
    //     document.getElementById('file').click();
    // }

    // download transaction
    // onDownload() {
    //     document.getElementById('download').click();
    // }
}
