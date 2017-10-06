import { compact } from 'lodash';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { ServiceComponent } from '../service/service.component';
// import * as Globals from '../globals/globals.component';
// import * as MainOpr from '../mainoperation/mainoperation.component';

// flex-layout
// import { ObservableMedia } from '@angular/flex-layout';

// material
// import {Observable} from 'rxjs/Observable';

import * as moment from 'moment';

// let HttpService: any;
// let self: any;

@Component({
  selector: 'app-trade',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.css'],
  providers: [ServiceComponent]
})
export class TradeComponent implements OnInit, OnDestroy {
    constructor() {}


    ngOnInit() {}

    ngOnDestroy() {}
}
