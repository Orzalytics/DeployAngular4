import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs';
import * as Globals from '../globals/globals.component';
import { Input } from '@angular/core';

var urlHeader = "";

@Injectable()
export class ServiceComponent{
  n_ResponseSuccess : any;

  constructor(private http : Http) { } 

  @Input() set b_IsGetSuccess(newValue: any) {
    if (newValue == true){
      this.n_ResponseSuccess ++;
      if (this.n_ResponseSuccess == 4){
        Globals.g_DatabaseInfo.bIsStartCalc = true;
      }
    }
  }

  // Get Database Information
  getDatabaseInfo(){
    this.n_ResponseSuccess = 0;
    this.getFundHeader().subscribe(
      response => {
        Globals.g_DatabaseInfo.FundHeader = response;
        this.b_IsGetSuccess = true;
      }
    );
    this.getFundPriceList(Globals.g_GlobalStatic.startDate).subscribe(
      response => {
        Globals.g_DatabaseInfo.RawFundPriceList = response;
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
  }

  // Get Fund Names and IDs
  getFundHeader() {
    return this.http.get(urlHeader + '/fundheader').map(res => res.json());
  }

  // Get Price Fund List
  getFundPriceList(startDate){
    return this.http.get(urlHeader + '/ret/' + startDate).map(res => res.json());
  }

  // Get Portfolio List
  getPortfolioList(){
    return this.http.get(urlHeader + '/userPortList').map(res => res.json());
  }

  // Get Transaction List
  getTransactionList(){
    return this.http.get(urlHeader + '/transaction/all').map(res => res.json());
  }

  // Get Buy Response
  getBuyResponse(buyUrl){
    return this.http.get(urlHeader + buyUrl).map(res => res.json());
  }

  // Get Delete Response
  getDeleteResponse(deleteID){
    return this.http.get(urlHeader + '/delete/' + deleteID).map(res => res.json());
  }

  // Send Excel Data
  sendExcelData(data){
    return this.http.post(urlHeader + '/getExcel', {user: data}).map(res => res.json());
  }

  uploadBuyData(data){
    return this.http.post(urlHeader + '/buy', {user: data}).map(res => res.json());
  }
}
