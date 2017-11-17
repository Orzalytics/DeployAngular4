// Global Variables

'use strict'

export const urlHeader = {
    production: 'http://orza.clockwisesoftware.com/api',
    development: 'http://localhost:9051'
};

export const g_DatabaseInfo = {
    bIsStartCalc : false,
    FundHeader : [],
    RawFundPriceList : [],
    PortfolioList : [],
    TransactionList : [],
    ListofPriceFund : []
};

export const g_GlobalStatic = {
    startDate : '2015-01-01 00:00:00',
    // arrPortIndex : [101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158]
    // arrPortIndex : [999, 3, 5, 6, 7, 8, 9, 60, 103, 113]
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

export function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

export function convertDate(paramDate) {
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