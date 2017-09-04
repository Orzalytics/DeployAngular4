import { Component, OnInit } from '@angular/core';
import { ServiceComponent } from '../service/service.component';
import * as Globals from '../globals/globals.component';
import * as MainOpr from '../mainoperation/mainoperation.component';

var HttpService : any;
var self : any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [ServiceComponent]
})
export class HomeComponent implements OnInit {
    ngPortIndex : number = -1;

    tile_Col : number = 4;
    tile_One : number = 1;
    tile_Two : number = 2;
    tile_Tre : number = 1;

    // Chart Input Values //
    ngPortfolioName : any;
    ngSelFondosValue : any;
    ngWidth : any;
    fondos : any;

    // escoje portafolio //
    ngScopeVoP : any;
    ngScopeGoL : any;
    ngScopeMax : any;
    ngScopeMin : any;
    ngScopeRate : any;

    // escoje fondo //
    ngScopeDay91 : any;
    ngScopeDay182 : any;
    ngScopeDay365 : any;
    ngScopeYear : any;

    // comprar o vender //
    ngScopeUnidades : any;
    ngScopeTranPrice : any;
    ngSecondGraphModel : any;
    ngSecondGraphAmount : any;

    // transaction table //
    // values for icon information on table header
    tbHeader = [        
        {index : 0, title : 'portafolio', icon : ''},
        {index : 1, title : 'fecha', icon : ''},
        {index : 2, title : 'fondo', icon : ''},
        {index : 3, title : 'compra o venta', icon : ''},
        {index : 4, title : 'unidades', icon : ''},
        {index : 5, title : 'precio unidad', icon : ''},
        {index : 6, title : 'total pesos', icon : ''},
    ];
    tableInfo = [];
    tableStore = [];

    // Slider //
    ngSliderIndex = 0;
    disabled = false;
    maxVal = 0;
    minVal = 0;    
    ng_strDate = Globals.convertDate(Globals.g_GlobalStatic.startDate);
    ////////////    

    ngAllRefresh : number = 0;
    ngFileUploadPath : any;
    isValid:boolean = false;
    nTimerId : any;

    constructor(private service : ServiceComponent) {
        self = this;
        HttpService = this.service;
    }

    checkStart(){
        if (Globals.g_DatabaseInfo.bIsStartCalc){
            clearInterval(this.nTimerId);
            MainOpr.onCalculateData();
            HttpService.getTransactionList().subscribe(
                response => {
                    MainOpr.getTransactionData(response);
                    MainOpr.CalculatePortfolioData();

                    this.setSlider();
                    this.onInitSelect();
                    this.onPfnameChanged();
                    this.setEscojePortafolio();
                    this.setEscojeFondo();       
                    this.setComprarVender();
                    this.onInitGraphData();
                    this.onRefreshTable();
                    this.checkTable();
                    this.isValid = true;
            });
        }
    };

    setSlider(){
        this.minVal = 0;
        this.maxVal = Globals.g_DatabaseInfo.ListofPriceFund[0].ulen - 1;
    }

    setEscojePortafolio(){
        if (this.ngPortIndex > -1){
            var VoP = Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].stairArray[this.ngSliderIndex];
            var Max = 0;
            var Min = 999999;
            var GoL = 0;

            for (var i = 0; i <= this.ngSliderIndex; i ++){
                if (Max < Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].portArray[i]) Max = Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].portArray[i];
                if (Min > Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].portArray[i]) Min = Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].portArray[i];
            }
            if (VoP > 0) GoL = Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].portArray[this.ngSliderIndex] / VoP * 100;  

            this.ngScopeVoP = (VoP != undefined) ? Globals.numberWithCommas(VoP.toFixed(2)) : 0;
            this.ngScopeGoL = (GoL != undefined) ? Globals.numberWithCommas(GoL.toFixed(2)) : 0;
            this.ngScopeMax = Globals.numberWithCommas(Max.toFixed(2));
            this.ngScopeMin = (Min != 999999) ? Globals.numberWithCommas(Min.toFixed(2)) : 0;
            this.ngScopeRate = Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].yearRateArray[this.ngSliderIndex];
        }else{
            this.ngScopeVoP = "0.00";
            this.ngScopeGoL = "0.00";
            this.ngScopeMax = "0.00";
            this.ngScopeMin = "0.00";
            this.ngScopeRate = "0.00";
        }        
    }

    setEscojeFondo(){
        var day91 = Globals.g_FundParent.arrAllReturns.day91_return[this.ngSelFondosValue][this.ngSliderIndex]*100;
        var day182 = Globals.g_FundParent.arrAllReturns.day182_return[this.ngSelFondosValue][this.ngSliderIndex]*100;
        var day365 = Globals.g_FundParent.arrAllReturns.day365_return[this.ngSelFondosValue][this.ngSliderIndex]*100;
        var year = Globals.g_FundParent.arrAllReturns.newstart_return[this.ngSelFondosValue][this.ngSliderIndex] * 1;
        this.ngScopeDay91 = (day91 != undefined) ? Globals.numberWithCommas(day91.toFixed(1)) : 0;
        this.ngScopeDay182 = (day182 != undefined) ? Globals.numberWithCommas(day182.toFixed(1)) : 0;
        this.ngScopeDay365 = (day365 != undefined) ? Globals.numberWithCommas(day365.toFixed(1)) : 0;
        this.ngScopeYear = (year != undefined) ? Globals.numberWithCommas(year.toFixed(1)) : 0;
        if (this.ngScopeDay91 > 0) this.ngScopeDay91 = "+"+this.ngScopeDay91;
        if (this.ngScopeDay182 > 0) this.ngScopeDay182 = "+"+this.ngScopeDay182;
        if (this.ngScopeDay365 > 0) this.ngScopeDay365 = "+"+this.ngScopeDay365;
        if (this.ngScopeYear > 0) this.ngScopeYear = "+"+this.ngScopeYear;
    }

    setComprarVender(){
        this.ngSecondGraphModel = 0;
        this.ngSecondGraphAmount  = 0;
        this.ngScopeUnidades = 0;
        this.ngScopeTranPrice = 0;

        for (var i = 0; i < Globals.g_Portfolios.arrDataByPortfolio.length; i ++){
            if (this.ngPortfolioName == Globals.g_Portfolios.arrDataByPortfolio[i].portname){
                var sum = 0;
                for (var j = 0; j <= this.ngSliderIndex; j ++){
                    sum = sum + Globals.g_Portfolios.arrDataByPortfolio[i].arrPurchase[this.ngSelFondosValue][j].unidades;
                }

                this.ngScopeUnidades = Globals.numberWithCommas(sum.toFixed(6));
                this.ngScopeTranPrice = Globals.numberWithCommas(Globals.g_Portfolios.arrDataByPortfolio[i].staircase[this.ngSelFondosValue][this.ngSliderIndex].toFixed(2));
                this.ngSecondGraphModel = Globals.g_Portfolios.arrDataByPortfolio[i].arrPurchase[this.ngSelFondosValue][this.ngSliderIndex].unidades;
                this.ngSecondGraphAmount = Globals.g_Portfolios.arrDataByPortfolio[i].arrPurchase[this.ngSelFondosValue][this.ngSliderIndex].pesos;
                break;
            }
        }
    }

    onInputChange(event: any) {
        var updatedDate = new Date(Globals.g_GlobalStatic.startDate);
        var selectedDate = updatedDate.setDate(updatedDate.getDate() + event.value);
        this.ng_strDate = Globals.convertDate(selectedDate);
        Globals.g_Portfolios.nSliderIndex = event.value;

        // Update Slider Index for send Event
        this.ngSliderIndex = event.value;

        // Update Escoje Fondo&Portafolio
        this.setEscojePortafolio();
        this.setEscojeFondo();
        this.setComprarVender();
    }

    onInitSelect(){
        this.fondos = [];
        for (var i = 0; i < Globals.g_DatabaseInfo.ListofPriceFund.length; i ++){
            var fondoType = {value : 0, viewValue : ''};
            fondoType.value = i;
            fondoType.viewValue = Globals.g_DatabaseInfo.ListofPriceFund[i].name;
            this.fondos[i] = fondoType;
        }
        this.ngSelFondosValue = this.fondos[0].value;
    }

    onInitGraphData(){
        var arrOtherNew999Price = [];
        var arrOtherStaircase = [];

        for (var i = 0; i < Globals.g_DatabaseInfo.ListofPriceFund.length; i ++){
            arrOtherNew999Price[i] = [];
            arrOtherStaircase[i] = [];
            for (var j = 0; j < Globals.g_DatabaseInfo.ListofPriceFund[i].ulen; j ++){
                arrOtherNew999Price[i][j] = 0;
                arrOtherStaircase[i][j] = 0;
                if (this.ngPortIndex > -1) arrOtherNew999Price[i][j] = Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].arrPurchase[i][j].unidades;
                if ((i == this.ngSelFondosValue) && (j == this.ngSliderIndex)){
                    arrOtherNew999Price[i][j] = this.ngSecondGraphModel;
                }
            }
        }

        for (var i = 0; i < Globals.g_DatabaseInfo.ListofPriceFund.length; i ++){
            var temp = 0;
            var new999Price = 0;
            for (var j = 0; j < Globals.g_DatabaseInfo.ListofPriceFund[i].ulen; j ++){
                if (arrOtherNew999Price[i][j] != 0){
                    temp = temp + arrOtherNew999Price[i][j];
                    new999Price = new999Price + Globals.g_DatabaseInfo.ListofPriceFund[i].u[j] * arrOtherNew999Price[i][j];                        
                }
                arrOtherNew999Price[i][j] = temp * Globals.g_DatabaseInfo.ListofPriceFund[i].u[j] - new999Price;
                arrOtherStaircase[i][j] = temp * Globals.g_DatabaseInfo.ListofPriceFund[i].u[j];
            }
            
        }

        var arrPortSum = [];
        var arrStairSum = [];
        for (var i = 0; i < Globals.g_DatabaseInfo.ListofPriceFund[0].ulen; i++) {
            var sum1 = 0;
            var sum2 = 0;

            for (var j = 0; j < Globals.g_DatabaseInfo.ListofPriceFund.length; j ++){
                sum1 = sum1 + arrOtherNew999Price[j][i];
                sum2 = sum2 + arrOtherStaircase[j][i];
            }   

            arrPortSum.push(sum1);
            arrStairSum.push(sum2);
        }

        Globals.g_AllStatus.arrPortfolioData = arrPortSum;
        Globals.g_AllStatus.arrStaircaseData = arrStairSum;
    }

    onPfnameChanged(){
        Globals.g_AllStatus.strPfName = this.ngPortfolioName;

        this.ngPortIndex = -1;
        for (var i = 0; i < Globals.g_Portfolios.arrDataByPortfolio.length; i ++){
            if (Globals.g_Portfolios.arrDataByPortfolio[i].portname == this.ngPortfolioName){
                this.ngPortIndex = i;
                break;
            }
        }

        this.setEscojePortafolio();
        this.setComprarVender();
        this.onInitGraphData();
    }
    onSelectFondos(){
        // console.log(this.ngSelFondosValue);
    }
    onUnidadesChange(){
        this.disabled = true;
        
        var sum = 0;
        var min = 0;
        var curItemCnt = 0;

        if (this.ngPortIndex > -1){
            var nItemByDate = 0;                
            for (var j = 0; j <= this.ngSliderIndex; j ++){
                sum = sum + Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].arrPurchase[this.ngSelFondosValue][j].unidades;
            }
            sum = Globals.toFixedDecimal(sum, 6);

            curItemCnt = sum;
            min = sum;
            nItemByDate = sum;

            for (var j = this.ngSliderIndex + 1; j < Globals.g_DatabaseInfo.ListofPriceFund[0].ulen; j ++){
                nItemByDate = nItemByDate + Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].arrPurchase[this.ngSelFondosValue][j].unidades;
                if (min > nItemByDate){
                    min = nItemByDate;
                }
            }
        }

        if (this.ngSecondGraphModel >= 0){            
        }else{
            if (this.ngSecondGraphModel + curItemCnt < 0){
                this.ngSecondGraphModel = -curItemCnt;
            }

            if (this.ngSecondGraphModel + min < 0){
                this.ngSecondGraphModel = -min;
            }

            if (this.ngSecondGraphModel == 0) this.ngSecondGraphModel = 0;
        }

        var Pesos = Math.floor(Globals.g_DatabaseInfo.ListofPriceFund[this.ngSelFondosValue].u[this.ngSliderIndex] * this.ngSecondGraphModel * 10000) / 10000;
        this.ngSecondGraphAmount = Globals.toFixedDecimal(Pesos, 6);
        
        this.ngScopeUnidades = Globals.numberWithCommas(Globals.toFixedDecimal(sum + this.ngSecondGraphModel, 6));

        if (this.ngPortIndex > -1){
            this.ngScopeTranPrice = Globals.numberWithCommas(Globals.toFixedDecimal((Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].staircase[this.ngSelFondosValue][this.ngSliderIndex] + this.ngSecondGraphAmount), 2));
        }else{
            this.ngScopeTranPrice = this.ngSecondGraphAmount;
        }

        this.onInitGraphData();
    }
    onPesosChange(){
        this.disabled = true;

        var sum = 0;
        var min = 0;
        var curItemCnt = 0;

        if (this.ngPortIndex > -1){
            var nItemByDate = 0;
            for (var j = 0; j <= this.ngSliderIndex; j ++){
                sum = sum + Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].arrPurchase[this.ngSelFondosValue][j].unidades;
            }
            sum = Globals.toFixedDecimal(sum, 6);

            curItemCnt = Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].staircase[this.ngSelFondosValue][this.ngSliderIndex];
            min = Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].staircase[this.ngSelFondosValue][this.ngSliderIndex];
            nItemByDate = Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].staircase[this.ngSelFondosValue][this.ngSliderIndex];

            for (var j = this.ngSliderIndex + 1; j < Globals.g_DatabaseInfo.ListofPriceFund[0].ulen; j ++){
                if (min > Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].staircase[this.ngSelFondosValue][j]){
                    min = Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].staircase[this.ngSelFondosValue][j];
                }
            }
        }

        if (this.ngSecondGraphAmount >= 0){            
        }else{
            if (this.ngSecondGraphAmount + curItemCnt < 0){
                this.ngSecondGraphAmount = -curItemCnt;
            }

            if (this.ngSecondGraphAmount + min < 0){
                this.ngSecondGraphAmount = -min;
            }

            if (this.ngSecondGraphAmount == 0) this.ngSecondGraphAmount = 0;

            this.ngSecondGraphAmount = Globals.toFixedDecimal(this.ngSecondGraphAmount, 6);
        }

        var Unidades = this.ngSecondGraphAmount / Globals.g_DatabaseInfo.ListofPriceFund[this.ngSelFondosValue].u[this.ngSliderIndex];
        this.ngSecondGraphModel = Globals.toFixedDecimal(Unidades, 6);

        this.ngScopeUnidades = Globals.numberWithCommas(Globals.toFixedDecimal(sum + this.ngSecondGraphModel, 6));
        
        if (this.ngPortIndex > -1){
            this.ngScopeTranPrice = Globals.numberWithCommas(Globals.toFixedDecimal((Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].staircase[this.ngSelFondosValue][this.ngSliderIndex] + this.ngSecondGraphAmount), 2));
        }else{
            this.ngScopeTranPrice = this.ngSecondGraphAmount;
        }

        this.onInitGraphData();
    }
    onBuy(){
        if (Math.abs(this.ngSecondGraphModel) == 0) return;
        if (this.ngPortfolioName.length < 1) return;

        var url = '/buy';
        if (this.ngSecondGraphModel >= 0){
            // buy item
            url = url + '/' + Globals.g_DatabaseInfo.ListofPriceFund[this.ngSelFondosValue].index;
            url = url + '/' + this.ngSecondGraphModel;
            url = url + '/' + 999;
            url = url + '/' + this.ngSecondGraphAmount;
            url = url + '/' + this.ng_strDate;
            url = url + '/' + this.ngPortfolioName;  
            url = url + '/' + "deploy_user";
            url = url + '/' + Globals.convertDate(new Date());
        }else{
            // sell item
            url = url + '/' + 999;
            url = url + '/' + Math.abs(this.ngSecondGraphModel);
            url = url + '/' + Globals.g_DatabaseInfo.ListofPriceFund[this.ngSelFondosValue].index;
            url = url + '/' + Math.abs(this.ngSecondGraphAmount);
            url = url + '/' + this.ng_strDate;
            url = url + '/' + this.ngPortfolioName;  
            url = url + '/' + "deploy_user";
            url = url + '/' + Globals.convertDate(new Date());
        }

        HttpService.getBuyResponse(url).subscribe(
            response => {
                HttpService.getTransactionList().subscribe(
                    response => {
                        MainOpr.getTransactionData(response);
                        MainOpr.CalculatePortfolioData();

                        this.onPfnameChanged();
                        this.setEscojeFondo();
                        this.onRefreshTable();
                        this.checkTable();

                        this.disabled = false;
                });
        });
    }
    onClose(){
        this.ngSecondGraphModel = 0;
        this.ngSecondGraphAmount = 0;
        this.onInitGraphData();

        this.disabled = false;
        this.setComprarVender();
    }
    // delete transaction
    onDelete(transaction){
        if (transaction.nFundIndex > -1){
            HttpService.getDeleteResponse(transaction.id).subscribe(
                response => {
                    HttpService.getTransactionList().subscribe(
                        response => {
                            MainOpr.getTransactionData(response);
                            MainOpr.CalculatePortfolioData();
    
                            this.onPfnameChanged();
                            this.setEscojeFondo();
                            this.onRefreshTable();
                            this.checkTable();
    
                            this.disabled = false;
                    });
                }
            );
            this.tableInfo = [];
        }       
    }
    onTableReorder(index){
        var strIconName = this.tbHeader[index].icon;
        for (var i = 0; i < this.tbHeader.length; i ++){
            this.tbHeader[i].icon = "";
        }
        var strOrderCmd = "";
        if (strIconName == ""){
            this.tbHeader[index].icon = "arrow_drop_down";
            strOrderCmd = "down";
        }else if(strIconName == "arrow_drop_down"){
            this.tbHeader[index].icon = "arrow_drop_up";
          strOrderCmd = "up";
        }else if(strIconName == "arrow_drop_up"){
            this.tbHeader[index].icon = "arrow_drop_down";
            strOrderCmd = "down";
        }
        this.sortTable(index, strOrderCmd);
    }
    sortTable(index, strOrderCmd){
        for (var i = 0; i < this.tableInfo.length; i ++){
            this.tableInfo[i].Portarray.sort(function(a, b){        
                var keyA = a[Object.keys(a)[index]],
                    keyB = b[Object.keys(a)[index]];
                    
                // Compare the 2 dates
                if(keyA < keyB) return (strOrderCmd == "down") ? -1 : 1;
                if(keyA > keyB) return (strOrderCmd == "down") ? 1 : -1;
                return 0;
            });
        }
    }
    onRefreshTable(){
        var transactions = Globals.g_FundParent.arrAllTransaction;
        this.tableInfo = [];
        this.tableStore = [];

        for (var i = 0; i < Globals.g_DatabaseInfo.PortfolioList.length; i ++){
            var listOfSaverTransaction = [];
            for (var j = 0; j < transactions.length; j ++){
                if (Globals.g_DatabaseInfo.PortfolioList[i].portfolio_id != transactions[j].strPortID) continue;
                listOfSaverTransaction.push(transactions[j]);
            }
  
            if (listOfSaverTransaction.length > 0){
                var eachObj = {"PortIndex" : 0, "PortStatus" : "Show", "PortIcon" : "add", "Portname" : listOfSaverTransaction[0].strPortID, "Portarray" : listOfSaverTransaction};
                this.tableInfo.push(eachObj);
                this.tableStore.push(eachObj);
            }
        }

        for (var i = 0; i < this.tableStore.length; i ++){
            this.tableInfo[i].PortIndex = i;
            this.tableStore[i].PortIndex = i;
        }

        this.tbHeader[1].icon = "";
        this.onTableReorder(1);
    }
    checkTable(){
        for (var i = 0; i < this.tableInfo.length; i ++){
            for (var j = 0; j < Globals.g_DatabaseInfo.ListofPriceFund.length; j ++){
                var eachArray = []
                for (var k = 0; k < this.tableInfo[i].Portarray.length; k ++){              
                    if (this.tableInfo[i].Portarray[k].nFundIndex == j) eachArray.push(this.tableInfo[i].Portarray[k]);
                }
                if (eachArray.length > 0){
                    for (var k = 0; k < eachArray.length; k ++){
                        eachArray[k].deletable = false;
                        var sum = 0;
                        for (var n = 0; n < eachArray.length; n ++){
                            if (k == n) continue;
                            var ItemCnt = eachArray[n].nItemCnt;
                            sum = sum + ItemCnt;
                            if (sum < 0){
                                eachArray[k].deletable = true;
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
    onShowHide(index, bIsDraw){
        this.tableInfo = [];
        this.tableStore[index].PortStatus = (this.tableStore[index].PortStatus == "Show") ? "Hide" : "Show";
        this.tableStore[index].PortIcon = (this.tableStore[index].PortStatus == "Show") ? "add" : "remove";
        
        for (var i = 0; i < this.tableStore.length; i ++){
            
            this.tableInfo.push(Object.assign({}, this.tableStore[i]));
            if (this.tableStore[i].PortStatus != "Show"){
                Globals.g_Portfolios.arrDataByPortfolio[i].showhide = 0;
                this.tableInfo[i].Portarray = [];
            }else{
                Globals.g_Portfolios.arrDataByPortfolio[i].showhide = 1;
            }
        }
        if(bIsDraw == 1) this.ngAllRefresh = this.ngAllRefresh + 1;
    }
    // parsing excel data
    onParsing(data){
        var postData = [];
        for (var i = 0; i < data.length; i ++){
            var fundObj = data[i]["fondo"];

            if ((data[i]["año"] == undefined) || (data[i]["año"] == "")) break;
            if ((data[i]["mes"] == undefined) || (data[i]["mes"] == "")) break;
            if ((data[i]["día"] == undefined) || (data[i]["día"] == "")) break;
            if ((data[i]["fondo"] == undefined) || (data[i]["fondo"] == "")) break;          
            if ((data[i]["compra/-venta"] == undefined) || (data[i]["compra/-venta"] == "")) break;
            if ((data[i]["portafolio"] == undefined) || (data[i]["portafolio"] == "")) break;

            var strFundName = Globals.GetFundIndexByKey(fundObj);
            if (strFundName == undefined) break;

            var nFundID = Globals.GetFundIndex(strFundName);
            var strDate = Globals.convertDate(new Date(data[i]["año"] + "-" + data[i]["mes"] + "-" + data[i]["día"]));
            var strPortName = data[i]["portafolio"];
            var nItemCnt = data[i]["compra/-venta"]*1;
            var nSliderIndex = Globals.GetDateIndex(Globals.g_DatabaseInfo.ListofPriceFund[0].udate, strDate);
            var nItemValue = Globals.g_DatabaseInfo.ListofPriceFund[nFundID].u[nSliderIndex];
            var strCurDate = Globals.convertDate(new Date());
            var nTotal = Globals.multiple(Math.abs(nItemCnt), nItemValue);

            var objParam = {"fund_id_bought" : 0, "units_bought" : 0, "fund_id_sold" : 0, "units_sold" : 0, "date_value_transaction" : "", "portfolio_id" : 0, "saver_id" : "", "nowDate" : ""};
            objParam.fund_id_bought = (nItemCnt >= 0) ? Globals.g_DatabaseInfo.ListofPriceFund[nFundID].index : 999;
            objParam.units_bought = Math.abs(nItemCnt);
            objParam.fund_id_sold = (nItemCnt >= 0) ? "999" : Globals.g_DatabaseInfo.ListofPriceFund[nFundID].index;
            objParam.units_sold = nTotal;
            objParam.date_value_transaction = strDate;
            objParam.portfolio_id = strPortName;
            objParam.saver_id = "deploy_user";
            objParam.nowDate = strCurDate;

            var url = "/buy/";
            var cond1 = (nItemCnt >= 0) ? Globals.g_DatabaseInfo.ListofPriceFund[nFundID].index : 999;
            url = url + cond1 + "/";
            url = url + Math.abs(nItemCnt) + "/";
            var cond2 = (nItemCnt >= 0) ? "999" : Globals.g_DatabaseInfo.ListofPriceFund[nFundID].index;
            url = url + cond2 + "/";
            url = url + nTotal + "/";
            url = url + strDate + "/";
            url = url + this.ngPortfolioName + "/";
            url = url + "deploy_user" + "/";
            url = url + strCurDate;

            postData.push(objParam);
        }

        if (postData.length > 0){
            HttpService.uploadBuyData(postData).subscribe(
                response => {
                    HttpService.getPortfolioList().subscribe(
                        response => {
                            HttpService.getTransactionList().subscribe(
                                response => {
                                    MainOpr.getTransactionData(response);
                                    MainOpr.CalculatePortfolioData();
            
                                    this.onPfnameChanged();
                                    this.setEscojeFondo();
                                    this.onRefreshTable();
                                    this.checkTable();
            
                                    this.disabled = false;
                            });
                    });
            });
            this.tableInfo = [];
        }
    }
    onChangeFilePath($event) : void {
        this.readCSVFile($event.target);
    }
    
    readCSVFile(inputValue: any) : void {
        var file:File = inputValue.files[0]; 
        var myReader:FileReader = new FileReader();
    
        myReader.onloadend = function(e){
            // you can perform an action with readed data here
            HttpService.sendExcelData(myReader.result).subscribe(
                response => {
                    self.onParsing(response);
            });
        }    
        myReader.readAsText(file);
    }
    // upload transaction
    onUpload(){
        document.getElementById("file").click();
    }
    // download transaction
    onDownload(){
        document.getElementById("download").click();
    }
    ngOnInit() {
        HttpService.getDatabaseInfo();
        this.nTimerId = setInterval(() => {
            this.checkStart(); 
        }, 100);
        this.onResize(null);
        
        this.ngScopeDay91 = "0.0";
        this.ngScopeDay182 = "0.0";
        this.ngScopeDay365 = "0.0";
        this.ngScopeYear = "0.0";
    }

    ngOnDestroy() {
        if (this.nTimerId) {
            clearInterval(this.nTimerId);
        }
    }

    onResize(event) {
        this.ngWidth = window.innerWidth;
        if (window.innerWidth > 1280){
            this.tile_Col = 4;
            this.tile_One = 1;
            this.tile_Two = 2;
            this.tile_Tre = 1;
        }else{
            this.tile_Col = 1;
            this.tile_One = 1;
            this.tile_Two = 1;
            this.tile_Tre = 1;
        }
    }
}
