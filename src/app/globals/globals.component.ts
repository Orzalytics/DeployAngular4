// Global Variables

'use strict'

export const g_DatabaseInfo = {
    bIsStartCalc : false,
    FundHeader : [],
    RawFundPriceList : [],
    PortfolioList : [],
    TransactionList : [],
    ListofPriceFund : []
};

export const g_GlobalStatic = {
    startDate : '2013-01-01 00:00:00',
    arrPortIndex : [40,48,51,54,59,80,88,104,105,106,126,149,176,179,190]
};

export const g_FundParent = {
    arrAllReturns : {
        day1_return : [],
        day1_loss : [],
        day7_loss : [],
        day91_return : [],
        day182_return : [],
        day365_return : [],
        year_return : [],
        start_return : [],
        newstart_return : []
    },
    arrAllTransaction : []
};

export const g_Portfolios = {
    nSliderIndex : 0,
    arrDataByPortfolio : []
}

export const g_AllStatus = {
    strPfName : '',
    arrPortfolioData : [],
    arrStaircaseData : []
}

export function convertDate(paramDate){
    var date = new Date(paramDate);   
    var month = (date.getMonth()+1 < 10) ? '0'+(date.getMonth()+1) : (date.getMonth()+1);
    var day = (date.getDate()<10) ? '0'+date.getDate() : date.getDate();
    var strDate = date.getFullYear() + '-' + month + '-' + day;
    return strDate;
}

export function isSameDate(a, b){
    if (a.getFullYear() == b.getFullYear()){
        if (a.getMonth() == b.getMonth()){
            if (a.getDate() == b.getDate()){     
                return true;
            }
        }
    }
    return false;
}

export function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

export function toFixedDecimal(value, count){
    var decimal = Math.pow(10, count);
    return Math.round(value * decimal) / decimal;
}

export function GetDateIndex(arr, tdate){
    for (var i = 0; i < arr.length; i ++){
      var sourceDate = new Date(arr[i]);
      var strDate = convertDate(sourceDate);
      if (strDate == tdate) return i;
    }
    return -1;
}

// compare keys for long fund names
export function GetFundIndexByKey(strLongName){
    strLongName = strLongName.toLowerCase();
    for (var i = 0; i < g_DatabaseInfo.ListofPriceFund.length; i ++){
        for (var j = 0; j < g_DatabaseInfo.ListofPriceFund[i].dict.length; j ++){
            var nIndex = strLongName.indexOf(g_DatabaseInfo.ListofPriceFund[i].dict[j]);
            if (nIndex > -1){
                return g_DatabaseInfo.ListofPriceFund[i].name;
            }
        }
    }
    return undefined;
}

export function GetFundIndex(strFundName){
    for (var i = 0; i < g_DatabaseInfo.ListofPriceFund.length; i ++){
        if (g_DatabaseInfo.ListofPriceFund[i].name == strFundName){
            return i;
        }
    }
    return 0;
}

export function decimalPlaces(num) {
    var match = (''+num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    if (!match) { return 0; }
    return Math.max(
        0,
        // Number of digits right of decimal point.
        (match[1] ? match[1].length : 0)
        // Adjust for scientific notation.
        - (match[2] ? +match[2] : 0));
}

export function multiple(param1, param2){
    var len1 = decimalPlaces(param1);
    var len2 = decimalPlaces(param2);
    var len = (len1 >= len2) ? len1 : len2;
    var maxVal = Math.pow(10, len);
    var value1 = Math.round(param1 * maxVal);
    var value2 = Math.round(param2 * maxVal);
    return value1 * value2 / (maxVal * maxVal);
}