import * as Globals from '../globals/globals.component';

export function onCalculateData(){
    ///////////////////////////////////////////////////////////////////
    //////////////////////// Filter Fund Names ////////////////////////
    ///////////////////////////////////////////////////////////////////
    var n = []; n.push([]);

    var fundnames = Globals.g_DatabaseInfo.FundHeader;
    for (var i = 0; i < fundnames.length; i ++){
    fundnames[i].fund_id_alias_fund = fundnames[i].fund_id_alias_fund * 1;
    }

    for (var i=0; i < Globals.g_GlobalStatic.arrPortIndex.length; i++){
    n[Globals.g_GlobalStatic.arrPortIndex[i]] = [];
    for (var j = 0; j < fundnames.length; j ++){
        if (fundnames[j].fund_id_alias_fund == Globals.g_GlobalStatic.arrPortIndex[i]){
        n[Globals.g_GlobalStatic.arrPortIndex[i]][0] = fundnames[j];
        break;
        }
    }
    };
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////


    ///////////////////////////////////////////////////////////////////
    ////////////////////// Filter Fund Pricess ////////////////////////
    ///////////////////////////////////////////////////////////////////
    var f = [];
    var rows = Globals.g_DatabaseInfo.RawFundPriceList;

    for (var i = 0; i < rows.length; i ++){
    rows[i].fund_id_pr_fund = rows[i].fund_id_pr_fund * 1;
    rows[i].pr_fund = rows[i].pr_fund * 1;
    }
    
    // loop to create fund-filtered arrays
    for (var i=0; i<Globals.g_GlobalStatic.arrPortIndex.length; i++){
        f[Globals.g_GlobalStatic.arrPortIndex[i]] = [];
        for (var j = 0; j < rows.length; j ++){
            if (rows[j].fund_id_pr_fund == Globals.g_GlobalStatic.arrPortIndex[i]){
            f[Globals.g_GlobalStatic.arrPortIndex[i]].push(rows[j]);
            }
        }
    }
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////

    var arru =[];
    var arrudate =[];
    var u=0;
    var dt : any;
    
    // nested loop to create array of funds and fund calculations
    for (var j=0; j<Globals.g_GlobalStatic.arrPortIndex.length; j++){
    arru.push([]);
    arrudate.push([]);
    for (var i = 0; i < f[Globals.g_GlobalStatic.arrPortIndex[j]].length; i++) {
        u = f[Globals.g_GlobalStatic.arrPortIndex[j]][i].pr_fund;
        dt = new Date(f[Globals.g_GlobalStatic.arrPortIndex[j]][i].date_value_pr_fund.replace(/-/g, '\/'));
        arru[j].push(u);
        arrudate[j].push(dt);
    }
    }

    // filling listOfPriceFund array with each fund
    var maxDate = new Date('2000-01-01');
    for (var i = 0; i < Globals.g_GlobalStatic.arrPortIndex.length; i ++){
    var item = {'name' : '', 'u' : '', 'udate':'', 'ulen' : 0, 'index' : 0, 'dict' : []};
    item.name = n[Globals.g_GlobalStatic.arrPortIndex[i]][0].alias;              
    item.u = arru[i];
    item.udate = arrudate[i];
    item.ulen = item.u.length;
    item.index = Globals.g_GlobalStatic.arrPortIndex[i];
    if ((n[Globals.g_GlobalStatic.arrPortIndex[i]][0].alias_match_1 != null) && (n[Globals.g_GlobalStatic.arrPortIndex[i]][0].alias_match_1 != "")) item.dict.push(n[Globals.g_GlobalStatic.arrPortIndex[i]][0].alias_match_1);
    if ((n[Globals.g_GlobalStatic.arrPortIndex[i]][0].alias_match_2 != null) && (n[Globals.g_GlobalStatic.arrPortIndex[i]][0].alias_match_2 != "")) item.dict.push(n[Globals.g_GlobalStatic.arrPortIndex[i]][0].alias_match_2);
    if ((n[Globals.g_GlobalStatic.arrPortIndex[i]][0].alias_match_3 != null) && (n[Globals.g_GlobalStatic.arrPortIndex[i]][0].alias_match_3 != "")) item.dict.push(n[Globals.g_GlobalStatic.arrPortIndex[i]][0].alias_match_3);
    Globals.g_DatabaseInfo.ListofPriceFund[i] = item;

    // get last date of the array
    var tmpDate = new Date(Globals.g_DatabaseInfo.ListofPriceFund[i].udate[Globals.g_DatabaseInfo.ListofPriceFund[i].udate.length - 1]);
    if (tmpDate.getTime() - maxDate.getTime() > 0) maxDate = tmpDate;
    }

    // Create longest date array
    var maxArray = [];
    var firstDate = new Date(Globals.g_GlobalStatic.startDate.replace(/-/g, '\/'));
    for (var i = 0; i < 99999; i ++){
        var seqDate = new Date(firstDate.getTime() + i * 60*60*24*1000);
        if (seqDate > maxDate) break;
        maxArray[i] = seqDate;
    }

    for (var i = 0; i < Globals.g_GlobalStatic.arrPortIndex.length; i ++){
        var dataArr = [];
        var orgDataIndex = 0;
        for (var j = 0; j < maxArray.length; j ++){
            var orgDate = new Date(maxArray[j]);
            var curDate = new Date(Globals.g_DatabaseInfo.ListofPriceFund[i].udate[orgDataIndex]);
            if (Globals.isSameDate(orgDate, curDate) == true){
                dataArr[j] = Globals.g_DatabaseInfo.ListofPriceFund[i].u[orgDataIndex];
                orgDataIndex ++;
            }else{
                dataArr[j] = 0;
            }                    
        }
        Globals.g_DatabaseInfo.ListofPriceFund[i].udate = maxArray;
        Globals.g_DatabaseInfo.ListofPriceFund[i].ulen = maxArray.length;
        Globals.g_DatabaseInfo.ListofPriceFund[i].u = dataArr;
    }

    // calculate gain or less
    var arr1dr = []; var arr1dl = []; var arr7dl = []; var arr91dr = []; var arr182dr = []; var arr365dr = []; var arryr = []; var arrisr = [];var arresr = [];
    var arr1drdate = []; var arr1dldate = []; var arr7dldate = []; var arr91drdate = []; var arr182drdate = []; var arr365drdate = []; var arryrdate = []; var arrisrdate = [];var arresrdate = [];
    var arrStartValue = [];
    for (var i = 0; i < Globals.g_GlobalStatic.arrPortIndex.length; i ++) arrStartValue[i] = 0;
    for (var i = 0; i < Globals.g_GlobalStatic.arrPortIndex.length; i ++){                        
        arr1drdate[i] = (maxArray);
        arr1dldate[i] = (maxArray);
        arr7dldate[i] = (maxArray);
        arr91drdate[i] = (maxArray);
        arr182drdate[i] = (maxArray);
        arr365drdate[i] = (maxArray);
        arryrdate[i] = (maxArray);
        arrisrdate[i] = (maxArray);
        arresrdate[i] = (maxArray);
        arr1dr[i] = []; arr1dl[i] = []; arr7dl[i] = []; arr91dr[i] = []; arr182dr[i] = []; arr365dr[i] = []; arryr[i] = []; arrisr[i] = []; arresr[i] = [];
        var day1_return=0; var day1_loss=0; var day7_loss=0; var day91_return=0; var day182_return=0; var day365_return=0; var year_return=0; var start_return=0;
        for (var j = 0; j < Globals.g_DatabaseInfo.ListofPriceFund[i].u.length; j ++){
            if (arrStartValue[i] == 0){
                if (Globals.g_DatabaseInfo.ListofPriceFund[i].u[j] != 0) arrStartValue[i] = Globals.g_DatabaseInfo.ListofPriceFund[i].u[j];
            }
            var curVal = Globals.g_DatabaseInfo.ListofPriceFund[i].u[j];
            if (j == 0) { day1_return = 0 } else { day1_return = (Globals.g_DatabaseInfo.ListofPriceFund[i].u[j-1] == 0) ? 0 : (curVal / Globals.g_DatabaseInfo.ListofPriceFund[i].u[j-1]) - 1 };
            if (j == 0) { day1_loss = 0 } else { day1_loss = (Globals.g_DatabaseInfo.ListofPriceFund[i].u[j-1] == 0) ? 0 : Math.min((curVal / Globals.g_DatabaseInfo.ListofPriceFund[i].u[j-1]) - 1, 0) };
            if (j < 7) { day7_loss = 0 } else { day7_loss = (Globals.g_DatabaseInfo.ListofPriceFund[i].u[j-7] == 0) ? 0 : Math.min((curVal / Globals.g_DatabaseInfo.ListofPriceFund[i].u[j-7]) - 1,0) };
            if (j < 91) { day91_return = 0 } else { day91_return = (Globals.g_DatabaseInfo.ListofPriceFund[i].u[j-91] == 0) ? 0 : (curVal / Globals.g_DatabaseInfo.ListofPriceFund[i].u[j-91]) - 1 };
            if (j < 182) { day182_return = 0 } else { day182_return = (Globals.g_DatabaseInfo.ListofPriceFund[i].u[j-182] == 0) ? 0 : (curVal / Globals.g_DatabaseInfo.ListofPriceFund[i].u[j-182]) - 1 };
            if (j < 365) { day365_return = 0 } else { day365_return = (Globals.g_DatabaseInfo.ListofPriceFund[i].u[j-365] == 0) ? 0 : (curVal / Globals.g_DatabaseInfo.ListofPriceFund[i].u[j-365]) - 1 };
            if (j == 0) { year_return = 0 } else { year_return = (arrStartValue[i] == 0) ? 0 : (curVal / arrStartValue[i]) - 1 };
            if (j == 0) { start_return = (arrStartValue[i] != 0) ? 0 : -1 } else { start_return = (arrStartValue[i] == 0) ? -1 : (curVal / arrStartValue[i]) - 1 };

            arr1dr[i][j] = (day1_return);
            arr1dl[i][j] = (day1_loss);
            arr7dl[i][j] = (day7_loss);
            arr91dr[i][j] = (day91_return);
            arr182dr[i][j] = (day182_return);
            arr365dr[i][j] = (day365_return);
            arryr[i][j] = (year_return);
            arrisr[i][j] = (start_return + 1);
            arresr[i][j] = (start_return);
        }
    }

    // fill day return arrays
    Globals.g_FundParent.arrAllReturns.day1_return = arr1dr;
    Globals.g_FundParent.arrAllReturns.day1_loss = arr1dl;
    Globals.g_FundParent.arrAllReturns.day7_loss = arr7dl;
    Globals.g_FundParent.arrAllReturns.day91_return = arr91dr;
    Globals.g_FundParent.arrAllReturns.day182_return = arr182dr;
    Globals.g_FundParent.arrAllReturns.day365_return = arr365dr;
    Globals.g_FundParent.arrAllReturns.year_return = arryr;
    Globals.g_FundParent.arrAllReturns.start_return = arrisr;

    var tmpArr = [];
    for (var i = 0; i < Globals.g_FundParent.arrAllReturns.start_return.length; i ++){
        Globals.g_FundParent.arrAllReturns.newstart_return[i] = [];
        tmpArr[i] = [];
        var cnt = 0;
        for (var j = 0; j < Globals.g_FundParent.arrAllReturns.start_return[i].length; j ++){
            tmpArr[i][j] = cnt;
            if (Globals.g_FundParent.arrAllReturns.start_return[i][j] != 0) cnt++

            if (Globals.g_FundParent.arrAllReturns.start_return[i][j] == 0){
                Globals.g_FundParent.arrAllReturns.newstart_return[i][j] = 0;
            }else{
                if (tmpArr[i][j] < 366){
                    Globals.g_FundParent.arrAllReturns.newstart_return[i][j] = Globals.g_FundParent.arrAllReturns.start_return[i][j] - 1;
                }else{
                    Globals.g_FundParent.arrAllReturns.newstart_return[i][j] = Math.pow(Globals.g_FundParent.arrAllReturns.start_return[i][j], (365.25 / tmpArr[i][j])) - 1;
                }
            }

            Globals.g_FundParent.arrAllReturns.newstart_return[i][j] = Globals.toFixedDecimal(Globals.g_FundParent.arrAllReturns.newstart_return[i][j] * 100, 2);
            if (Globals.g_FundParent.arrAllReturns.newstart_return[i][j] == "-0.00") Globals.g_FundParent.arrAllReturns.newstart_return[i][j] = "0.00";
        }
    }
}

export function  getTransactionData(response){
    Globals.g_DatabaseInfo.TransactionList = [];
    Globals.g_DatabaseInfo.TransactionList = response;
    var TransactionList = Globals.g_DatabaseInfo.TransactionList;
    
    for (var i = 0; i < TransactionList.length; i ++){
    TransactionList[i].fund_id_bought = TransactionList[i].fund_id_bought * 1;
    TransactionList[i].fund_id_sold = TransactionList[i].fund_id_sold * 1;
    TransactionList[i].transaction_id = TransactionList[i].transaction_id * 1;
    TransactionList[i].units_bought = TransactionList[i].units_bought * 1;
    }
    
    Globals.g_FundParent.arrAllTransaction = [];
    for (var i = 0; i < TransactionList.length; i ++){
        var transDate = new Date(TransactionList[i].date_value_transaction.replace(/-/g, '\/'));
        var startDate = new Date(Globals.g_GlobalStatic.startDate);

        if (startDate.getTime() - transDate.getTime() > 0) continue;

        var tempArr = {'strPortID' : '', 'tDate' : '', 'strFundName' : '', 'strBoS' : '', 'nItemCnt' : 0, 'fItemValue' : 0, 'fTotal' : 0, 'id' : '', 'strSaverID':'', 'nFundIndex' : -1, 'str_nItemCnt' : '0', 'str_fItemValue' : '0', 'str_fTotal' : '0'}; 
        var transactionID = TransactionList[i].transaction_id;
        var strFundName = "";
        var nFundIndex = -1;
        for (var j = 0; j < Globals.g_GlobalStatic.arrPortIndex.length; j ++){
            var fundID = (TransactionList[i].fund_id_bought == 999) ? TransactionList[i].fund_id_sold : TransactionList[i].fund_id_bought;
            if (Globals.g_GlobalStatic.arrPortIndex[j] == fundID){
                strFundName = Globals.g_DatabaseInfo.ListofPriceFund[j].name;
                nFundIndex = j;
                break;
            }
        }
        tempArr.id = transactionID;
        tempArr.strSaverID = TransactionList[i].transaction_saver_id;
        tempArr.strPortID = TransactionList[i].transaction_portfolio_id;
        tempArr.strFundName = strFundName;
        tempArr.nFundIndex = nFundIndex;
        tempArr.tDate = Globals.convertDate(TransactionList[i].date_value_transaction.replace(/-/g, '\/'));
        tempArr.strBoS = (TransactionList[i].fund_id_bought == 999) ? "Venta" : "Compra";
        tempArr.nItemCnt = TransactionList[i].units_bought;
        tempArr.fItemValue = Globals.toFixedDecimal((TransactionList[i].units_sold / TransactionList[i].units_bought), 6);
        tempArr.fTotal = parseFloat(TransactionList[i].units_sold);
        tempArr.str_nItemCnt = Globals.numberWithCommas(tempArr.nItemCnt);
        tempArr.str_fItemValue = Globals.numberWithCommas(tempArr.fItemValue);
        tempArr.str_fTotal = Globals.numberWithCommas(Globals.toFixedDecimal(tempArr.fTotal, 2));
        Globals.g_FundParent.arrAllTransaction.push(tempArr);
    }
}

export function  CalculatePortfolioData(){
    Globals.g_Portfolios.arrDataByPortfolio = [];
    for (var n = 0; n < Globals.g_DatabaseInfo.PortfolioList.length; n ++){
        var PortfolioID = Globals.g_DatabaseInfo.PortfolioList[n].portfolio_id;

        var response = [];
        for (var i = 0; i < Globals.g_FundParent.arrAllTransaction.length; i ++){
            if (Globals.g_FundParent.arrAllTransaction[i].strPortID == PortfolioID) response.push(Globals.g_FundParent.arrAllTransaction[i]);
        }

        if (response.length == 0) continue;
        // init array
        var arrOtherNew999Price = [];
        var arrOtherStaircase = [];
        var arrOtherWeight = [];
        var arrOtherIndex = [];
        var arrItemCnt = [];

        for (var i = 0; i < Globals.g_DatabaseInfo.ListofPriceFund.length; i ++){
            arrOtherNew999Price[i] = [];
            arrOtherStaircase[i] = [];
            arrOtherWeight[i] = [];
            arrOtherIndex[i] = [];
            arrItemCnt[i] = [];
            for (var j = 0; j < Globals.g_DatabaseInfo.ListofPriceFund[i].u.length; j ++){
                arrOtherNew999Price[i][j] = 0;
                arrOtherStaircase[i][j] = 0;
                arrOtherWeight[i][j] = 0;
                arrOtherIndex[i][j] = 0;
                arrItemCnt[i][j] = 0;
            }
        }   

        // sorting by date_value_transactio field of the database
        response.sort(function(a, b){
            var keyA = new Date(a.tDate),
                keyB = new Date(b.tDate);
            // Compare the 2 dates
            if(keyA < keyB) return -1;
            if(keyA > keyB) return 1;
            return 0;
        });
        
        // calculate data and store into arrOtherNew999Price
        for (var i = 0; i < response.length; i ++){
            if (response[i].strBoS == "Venta"){
                response[i].nItemCnt = -response[i].nItemCnt;
            }

            var fundIndex = response[i].nFundIndex;
            var transactionDate = new Date(response[i].tDate.replace(/-/g, '\/'));
            var dateIndex = -1;
            for (var j = 0; j < Globals.g_DatabaseInfo.ListofPriceFund[0].ulen; j ++){
                var curDate = new Date(Globals.g_DatabaseInfo.ListofPriceFund[0].udate[j]);
                if (Globals.isSameDate(curDate, transactionDate) == true){
                    dateIndex = j;
                    break;
                }
            }
            arrOtherNew999Price[fundIndex][dateIndex] = response[i].nItemCnt;
            // console.log("index = " + fundIndex);
            // console.log("date index = " + dateIndex);
            // console.log(response[i]);
        }

        for (var i = 0; i < arrOtherNew999Price.length; i ++){
            var temp = 0;
            var new999Price = 0;
            for (var j = 0; j < arrOtherNew999Price[i].length; j ++){
                if (arrOtherNew999Price[i][j] != 0){
                    temp = temp + arrOtherNew999Price[i][j];
                    new999Price = new999Price + Globals.g_DatabaseInfo.ListofPriceFund[i].u[j] * arrOtherNew999Price[i][j];                        
                }
                arrItemCnt[i][j] = temp;
                arrOtherNew999Price[i][j] = temp * Globals.g_DatabaseInfo.ListofPriceFund[i].u[j] - new999Price;
                arrOtherStaircase[i][j] = temp * Globals.g_DatabaseInfo.ListofPriceFund[i].u[j];
            }
        }

        var arrPortSum = [];
        var arrStairSum = [];
        for (var i = 0; i < Globals.g_DatabaseInfo.ListofPriceFund[0].ulen; i++){
            var sum = 0;
            var sum1 = 0;
            for (var j = 0; j < Globals.g_DatabaseInfo.ListofPriceFund.length; j ++){
                sum = sum + arrOtherNew999Price[j][i];
                sum1 = sum1 + arrOtherStaircase[j][i];
            }
            arrPortSum.push(sum);
            arrStairSum.push(sum1);
        }

        // calculate weight
        for (var i = 0; i < Globals.g_DatabaseInfo.ListofPriceFund[0].ulen; i ++){
            for (var j = 0; j < Globals.g_DatabaseInfo.ListofPriceFund.length; j ++){
                arrOtherWeight[j][i] = (arrOtherStaircase[j][i] == 0) ? 0 : arrOtherStaircase[j][i] / arrStairSum[i];
                arrOtherWeight[j][i] = arrOtherWeight[j][i];
            }
        }

        // calculate each index
        for (var i = 0; i < Globals.g_DatabaseInfo.ListofPriceFund.length; i ++){
            for (var j = 0; j < Globals.g_DatabaseInfo.ListofPriceFund[i].ulen; j ++){
                if (j > 0){
                    if ((arrOtherStaircase[i][j-1] == 0) && (arrOtherStaircase[i][j] == 0)){
                        arrOtherIndex[i][j] = 0
                    }else{
                        if ((arrOtherStaircase[i][j-1] == 0) && (arrOtherStaircase[i][j] != 0)){
                            arrOtherIndex[i][j] = 1
                        }else{
                            arrOtherIndex[i][j] = Globals.g_DatabaseInfo.ListofPriceFund[i].u[j] / Globals.g_DatabaseInfo.ListofPriceFund[i].u[j-1];
                        }
                    }
                }else{
                    arrOtherIndex[i][j] = (arrOtherStaircase[i][j] != 0) ? 1 : 0;
                }
            }
        }

        // calculate index total
        var indexArray = [];
        var indexTmpArray = [];
        for (var i = 0; i < Globals.g_DatabaseInfo.ListofPriceFund[0].ulen; i++){
            var sum = 0;

            if (i > 0){
                if ((arrStairSum[i] == 0) && (arrStairSum[i-1] == 0)){
                    sum = 0;
                }else{
                    if ((arrStairSum[i] != 0) && (arrStairSum[i-1] == 0)){
                        sum = 1;
                    }else{
                        for (var j = 0; j < Globals.g_DatabaseInfo.ListofPriceFund.length; j ++){
                            // console.log("p1 : " + arrOtherIndex[j][i] + " p2 : " + arrOtherWeight[j][i-1] + " p3 : " + indexTmpArray[indexTmpArray.length - 1]);
                            sum = sum + arrOtherIndex[j][i] * arrOtherWeight[j][i-1] * indexTmpArray[indexTmpArray.length - 1];
                        }
                    }
                }
            }else{
                sum = (arrStairSum[i] == 0) ? 0 : 1;
            }
            indexTmpArray.push(sum);
            indexArray.push(sum);
        }

        // console.log(indexArray);
        // console.log(arrOtherWeight);

        // calculate days from total
        var daysArray = [];
        var incDepth = 0;
        for (var i = 0; i < indexArray.length; i ++){
            daysArray[i] = (i > 0) ? daysArray[i - 1] + incDepth : 0;
            if ((incDepth == 0) && (indexArray[i] == 1)) incDepth = 1;            
        }

        // calculate yearly rate
        var yearRateArray = [];
        for (var i = 0; i < indexArray.length; i ++){
            if (i == 0) yearRateArray[i] = 0;
            else{
                if (indexArray[i - 1] == 0) yearRateArray[i] = 0;
                else{
                    if (daysArray[i] < 365) yearRateArray[i] = indexArray[i] - 1;
                    else{
                        yearRateArray[i] = Math.pow(indexArray[i], (365.25 / daysArray[i])) - 1;
                    }
                }
            }
            yearRateArray[i] = (yearRateArray[i] * 100).toFixed(2);
            if (yearRateArray[i] == "-0.00") yearRateArray[i] = "0.00";
        }

        // console.log(arrOtherStaircase);
        // console.log(indexArray);
        // console.log(arrOtherWeight);
        // console.log(arrOtherIndex);

        // for (var i = 0; i < indexArray.length; i ++){
        //     console.log((i+3) + " : " + arrOtherIndex[3][i] + " : " + arrOtherIndex[4][i] + " : " + arrOtherIndex[5][i] + " : " + arrOtherIndex[9][i] + " :: " + indexArray[i]);
        //     console.log((i+3) + " : " + arrOtherWeight[3][i] + " : " + arrOtherWeight[4][i] + " : " + arrOtherWeight[5][i] + " : " + arrOtherWeight[9][i]);
        // }

        // calculate 91DayReturn and min7DayLoss for portfolio array
        var day91Arr = [];
        var day7LossArr = [];
            for (var i = 0; i < indexArray.length; i ++){
            if (i < 7) { day7LossArr[i] = 0 } else { day7LossArr[i] = (indexArray[i-7] == 0) ? 0 : Math.min((indexArray[i] / indexArray[i-7]) - 1,0);};
            if (i < 91) { day91Arr[i] = 0 } else { day91Arr[i] = (indexArray[i-91] == 0) ? 0 : (indexArray[i] / indexArray[i-91]) - 1 };
        }

        var arrPurchase = [];
        for (var i = 0; i < Globals.g_DatabaseInfo.ListofPriceFund.length; i ++){
            arrPurchase[i] = [];
            for (var j = 0; j < Globals.g_DatabaseInfo.ListofPriceFund[0].ulen; j ++){
                arrPurchase[i][j] = {"unidades" : 0, "pesos" : 0};
            }
        }

        for (var i = 0; i < response.length; i ++){
            for (var j = 0; j < Globals.g_DatabaseInfo.ListofPriceFund[0].ulen; j ++){
                var orgDate = new Date(response[i].tDate.replace(/-/g, '\/'));
                if (Globals.isSameDate(orgDate, Globals.g_DatabaseInfo.ListofPriceFund[0].udate[j])){
                    arrPurchase[response[i].nFundIndex][j].unidades = response[i].nItemCnt;
                    arrPurchase[response[i].nFundIndex][j].pesos = (response[i].strBoS == "Venta") ? -parseFloat(response[i].fTotal) : parseFloat(response[i].fTotal);
                }
            }
        }

        var objOther = {"portname" : "", "new999Price" : [], "staircase" : [], "portArray" : [], "stairArray" : [], "itemArray" : [], "indexArray" : [], "weightArray" : [], "arrPurchase" : [], "day91Array" : [], "day7Array" : [], "yearRateArray" : [], "showhide" : 1};
        objOther.portname = PortfolioID;
        objOther.new999Price = arrOtherNew999Price;
        objOther.staircase = arrOtherStaircase;
        objOther.portArray = arrPortSum;
        objOther.stairArray = arrStairSum;
        objOther.itemArray = arrItemCnt;
        objOther.indexArray = indexArray;
        objOther.weightArray = arrOtherWeight;
        objOther.arrPurchase = arrPurchase;
        objOther.day91Array = day91Arr;
        objOther.day7Array = day7LossArr;
        objOther.yearRateArray = yearRateArray;

        Globals.g_Portfolios.arrDataByPortfolio.push(objOther);
    }
}