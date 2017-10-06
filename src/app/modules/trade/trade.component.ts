import { compact } from 'lodash';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { ServiceComponent } from '../../service/service.component';
import * as Globals from '../../globals/globals.component';
// import * as MainOpr from '../mainoperation/mainoperation.component';

// flex-layout
// import { ObservableMedia } from '@angular/flex-layout';

// material
// import {Observable} from 'rxjs/Observable';

import * as moment from 'moment';
import {ActivatedRoute} from '@angular/router';
import {ObservableMedia} from "@angular/flex-layout";
import {Observable} from "rxjs/Observable";

let HttpService: any;
let self: any;

@Component({
  selector: 'app-trade',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.css'],
  providers: [ServiceComponent]
})
export class TradeComponent implements OnInit, OnDestroy {
    private routeName: string;
    private sub: any;

    public isValid: boolean = false;
    public cols:  Observable<number>;

    public ngPortfolioName: string;

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

    constructor( private route: ActivatedRoute,
                 private service:ServiceComponent,
                 private observableMedia: ObservableMedia ) {
        self = this;
        HttpService = this.service;

        this.sub = route.params.subscribe(params => {
            this.routeName = params['name'];
            this.ngPortfolioName = params['name'];
        });
    }

    ngOnInit() {
        HttpService.getDatabaseInfo();
        this.nTimerId = setInterval(() => {
            console.log('Test ', Globals.g_DatabaseInfo);
            //this.checkStart();
        }, 100);

        this.isValid = true;
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

        console.log('Test ', Globals.g_DatabaseInfo);
        // this.setSlider();
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    // checkStart() {
    //     if (Globals.g_DatabaseInfo.bIsStartCalc){
    //         clearInterval(this.nTimerId);
    //         MainOpr.onCalculateData();
    //         HttpService.getTransactionList().subscribe(
    //             response => {
    //                 MainOpr.getTransactionData(response);
    //                 MainOpr.CalculatePortfolioData();
    //
    //                 this.setSlider();
    //                 this.onInitSelect();
    //                 this.onPfnameChanged();
    //                 this.setEscojePortafolio();
    //                 this.setEscojeFondo();
    //                 this.setComprarVender();
    //                 this.onInitGraphData();
    //                 this.onRefreshTable();
    //                 this.checkTable();
    //                 this.isValid = true;
    //             });
    //     }
    // };

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

        // Update Slider Index for send Event
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
}
