import { compact } from 'lodash';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ServiceComponent } from '../../service/service.component';
import * as Globals from '../../globals/globals.component';
import * as MainOpr from '../../mainoperation/mainoperation.component';

import { trigger, style, animate, transition, state } from '@angular/animations';

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
	providers: [ServiceComponent],
	animations: [
		trigger('enterAnimation', [
			state('false', style({ zIndex: 1 })),
			state('true', style({ zIndex: 900 })),
			transition('0 => 1', animate('10ms ease')),
			transition('1 => 0', animate('600ms ease', style({ zIndex: 900 })))
		])
	],
})

export class HomeComponent implements OnInit, OnDestroy {
	@ViewChild('selectPortfolio', {read: ElementRef}) selectPortfolio: ElementRef;
	@ViewChild('resizableEl', {read: ElementRef}) resizableEl: ElementRef;

	public fullscreen: Array<boolean> = [false, false, false];

	public PortfolioList = [];

	public cols_1: Observable<number>;
	public cols_2: Observable<number>;
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
	public state = 'inactive';

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
	public chartWidth: any;
	private loggedIn: boolean;

	constructor( private service: ServiceComponent,
				 private observableMedia: ObservableMedia ) {
		self = this;
		HttpService = this.service;

		window.onresize = (e) => {
			this.setChartWidth();
		};
	}

	ngOnInit() {
		HttpService.getDatabaseInfo();
		this.nTimerId = setInterval(() => {
			this.checkStart();
		}, 100);

		this.onResizeWindow();
		this.setChartWidth();

		// this.getTop50Cryptos(); //import to crypto Names to DB
		// this.setPriceFunds(); //import initial currencies values to DB
	}

	ngOnDestroy() {
		if (this.nTimerId) {
			clearInterval(this.nTimerId);
		}
	}

	setChartWidth() {
		this.chartWidth = window.innerWidth - 70;
	}

	onResizeWindow() {
		const grid_1 = new Map([
			['xs', 1],
			['sm', 1],
			['md', 1],
			['lg', 3],
			['xl', 3]
		]);
		let start_1: number;
		grid_1.forEach((cols, mqAlias) => {
			if (this.observableMedia.isActive(mqAlias)) {
				start_1 = cols;
			}
		});
		this.cols_1 = this.observableMedia.asObservable()
			.map(change => grid_1.get(change.mqAlias))
			.startWith(start_1);

		const grid_2 = new Map([
			['xs', 1],
			['sm', 1],
			['md', 2],
			['lg', 2],
			['xl', 2]
		]);
		let start_2: number;
		grid_2.forEach((cols, mqAlias) => {
			if (this.observableMedia.isActive(mqAlias)) {
				start_2 = cols;
			}
		});
		this.cols_2 = this.observableMedia.asObservable()
			.map(change => grid_2.get(change.mqAlias))
			.startWith(start_2);
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
					this.onRefreshTable();
					this.onPfnameChanged();
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
			const VoP = Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].stairArray[this.ngSliderIndex]

			this.ngScopeVoP = (VoP !== undefined) ? Globals.numberWithCommas(VoP.toFixed(2)) : 0;
			this.ngScopeRate = Globals.g_Portfolios.arrDataByPortfolio[this.ngPortIndex].yearRateArray[this.ngSliderIndex];
		}else {
			this.ngScopeVoP = '0.00';
			this.ngScopeRate = '0.00';
		}
	}

	setComprarVender() {
		for (let i = 0; i < Globals.g_Portfolios.arrDataByPortfolio.length; i ++) {
			if (this.ngPortfolioName === Globals.g_Portfolios.arrDataByPortfolio[i].portname){
				let sum = 0;
				for (let j = 0; j <= this.ngSliderIndex; j ++) {
					sum = sum + Globals.g_Portfolios.arrDataByPortfolio[i].arrPurchase[this.ngSelFondosValue][j].unidades;
				}
				this.ngSecondGraphModel = Globals.g_Portfolios.arrDataByPortfolio[i].arrPurchase[this.ngSelFondosValue][this.ngSliderIndex].unidades;
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

	tranformFunc(resizableEl, index) {
		if(this.fullscreen[index]) {
			resizableEl._element.nativeElement.classList.remove('full-size');
		} else {
			resizableEl._element.nativeElement.classList.add('full-size');
		}

		this.fullscreen[index] = !this.fullscreen[index];
	}

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

	setFundNames(data){
	    HttpService.setFundNames(data).subscribe(
	        response => {
	          console.log(response);
	    });
	}

	setPriceFunds(){
	    HttpService.setPriceFunds().subscribe(
	        response => {
	          console.log(response);
	    });
	}

	getTop50Cryptos() {
		let arr: Array<any>;
		let arrFull: Array<any>;
		let arrShort: Array<any>;

		arrFull = [];
		arrShort = [];

		arr = [
			"Bitcoin BTC",
			"Ethereum ETH",
			"Bitcoin Cash BCH",
			"Ripple XRP",
			"Litecoin LTC",
			"IOTA IOT",
			"Dash DASH",
			"Bitcoin Gold BTG",
			"NEM XEM",
			"Monero XMR",
			"EOS EOS",
			"Cardano ADA",
			"NEO NEO",
			"Ethereum Classic ETC",
			"Stellar XLM",
			"BitConnect BCC",
			"Populous PPT",
			"Waves WAVES",
			"TRON TRX",
			"Lisk LSK",
			"OmiseGO OMG",
			"Qtum QTUM",
			"Zcash ZEC",
			"Stratis STRAT",
			"Ardor ARDR",
			"Ignis IGNIS",
			"Tether USDT",
			"MagicCoin MAGE",
			"MonaCoin MONA",
			"Hshare HSR",
			"Nxt NXT",
			"BitShares BTS",
			"Kyber Network KNC",
			"Veritaseum VERI",
			"Ark ARK",
			"Steem STEEM",
			"Augur REP",
			"RaiBlocks XRB",
			"SALT SALT",
			"Decred DCR",
			"Komodo KMD",
			"Dogecoin DOGE",
			"Einsteinium EMC2",
			"Vertcoin VTC",
			"Siacoin SC",
			"Walton WTC",
			"DigixDAO DGD",
			"Binance Coin BNB",
			"Decentraland MANA",
			"PIVX PIVX"
		];

		let tmpArr: Array<any>;
		tmpArr = [];

		for (var i = 0; i < arr.length; ++i) {
			tmpArr = arr[i].split(' ');
			let abbrId = tmpArr.length - 1;

			arrShort.push(tmpArr[abbrId]);

			let cryptoFullName = '';
			if (abbrId > 1) {
				for (var k = 0; k < abbrId; ++k) {
					let sep = k + 1 === abbrId ? '' : ' ';
					cryptoFullName += tmpArr[k] + sep;
				}
			}
			else {
				cryptoFullName += tmpArr[0];
			}
			arrFull.push(cryptoFullName);
		}

		this.setFundNames({arrFull: arrFull, arrShort: arrShort});
	}
}
