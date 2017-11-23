import { compact } from 'lodash';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ServiceComponent } from '../../service/service.component';
import { trigger, style, animate, transition, state } from '@angular/animations';

import * as Globals from './../../globals/globals.component';
import * as MainOpr from './../../mainoperation/mainoperation.component';

import * as moment from 'moment';
import { ObservableMedia } from '@angular/flex-layout';
import { Observable } from 'rxjs/Observable';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import createNumberMask from 'text-mask-addons/dist/createNumberMask';

let HttpService: any;
let self: any;

@Component({
	selector: 'app-trade',
	templateUrl: './trade.component.html',
	styleUrls: ['./trade.component.css'],
	providers: [ ServiceComponent ],
	animations: [
		trigger('enterAnimation', [
			state('false', style({ zIndex: 1 })),
			state('true', style({ zIndex: 900 })),
			transition('0 => 1', animate('10ms ease')),
			transition('1 => 0', animate('600ms ease', style({ zIndex: 900 })))
		])
	],
})

export class TradeComponent implements OnInit, OnDestroy {
	public PortfolioList = [];

	public numberMask = createNumberMask({
		prefix: '',
		suffix: '',
		allowDecimal: true,
		decimalLimit: 6
	});

	// Chart Input Values //
	ngSelFondosValue: any;
	ngWidth: any;
	fondos: any;

	// slider and datepicker attr
	public ngSliderIndex = 0;
	public disabled = false;
	public maxVal = 0;
	public minVal = 0;
	public minDate = moment().format('YYYY-MM-DD');
	public maxDate = moment().format('YYYY-MM-DD');
	public ngDate = moment(Globals.g_GlobalStatic.startDate).format('YYYY-MM-DD');
	public ng_strDate = Globals.convertDate(Globals.g_GlobalStatic.startDate);
	// public ngDatepicker = new Date(Globals.g_GlobalStatic.startDate);
	public nTimerId: any;

	ngScopeFanData: any;

	// transaction table //
	// values for icon information on table header
	tbHeader = [
		// {index : 0, title : 'portafolio', icon : ''},
		{index : 1, title : 'fecha', icon : ''},
		{index : 2, title : 'fondo', icon : ''},
		{index : 3, title : 'compra o venta', icon : ''},
		{index : 4, title : 'unidades', icon : ''},
		{index : 5, title : 'precio unidad', icon : ''},
		{index : 6, title : 'total pesos', icon : ''},
	];

	tableInfo = [];
	// tableStore = {};

	// escoje fondo //
	public ngScopeDay91: any;
	public ngScopeDay182: any;
	public ngScopeDay365: any;
	public ngScopeYear: any;

	// my refactoring;
	public fullscreen: Array<boolean> = [false, false, false];
	private sub: any;

	public isValid: boolean = false;
	public cols:  Observable<number>;
	public cols_2:  Observable<number>;
	public colsValue:  Observable<number>;
	public tabelCols:  Observable<number>;

	public ngPortfolioName: string;
	public ngFondoName: string;

	// public portfolioList = [];
	public fondosList = [];
	public fondoList: any;

	public tradeForm = new FormGroup({
		portfolio: new FormControl(null),
		fondo: new FormControl(),
		date: new FormControl(new Date(Globals.g_GlobalStatic.startDate)),
		trade: new FormControl('comprar'),
		pesos: new FormControl(null, Validators.required),
		unidades: new FormControl(null, Validators.required),
	});

	constructor( private service:ServiceComponent,
				 private observableMedia: ObservableMedia ) {
		self = this;
		HttpService = this.service;
	}

	ngOnInit() {
		HttpService.getDatabaseInfo();
		this.nTimerId = setInterval(() => {
			this.checkStart();
		}, 100);

		// this.isValid = true;
		this.onResizeWindow();
		// Rerender graph after changes portfolio or fondo
		this.tradeForm.controls['portfolio'].valueChanges.subscribe((value) => {
			this.ngPortfolioName = value;
			this.onRefreshTable();
		});
		this.tradeForm.controls['fondo'].valueChanges.subscribe((value) => {
			this.ngFondoName = value;
			const indexValue = this.fondosList.findIndex((obj) => {
				return obj.name === value;
			});
			this.ngScopeFanData = MainOpr.calculateFanChartData(indexValue);
			this.setEscojeFondo();
		});

		this.resetForm();
	}

	ngOnDestroy() {
		if (this.nTimerId) {
			clearInterval(this.nTimerId);
		}
	}

	onResizeWindow() {
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

		const tabelGrid = new Map([
			['xs', 10],
			['sm', 10],
			['md', 13],
			['lg', 15],
			['xl', 15]
		]);
		let tabelStart: number;
		tabelGrid.forEach((cols, mqAlias) => {
			if (this.observableMedia.isActive(mqAlias)) {
				tabelStart = cols;
			}
		});
		this.tabelCols = this.observableMedia.asObservable()
			.map(change => tabelGrid.get(change.mqAlias))
			.startWith(tabelStart);

		const gridValue = new Map([
			['xs', 1],
			['sm', 2],
			['md', 4],
			['lg', 4],
			['xl', 4]
		]);
		let startValue: number;
		gridValue.forEach((cols, mqAlias) => {
			if (this.observableMedia.isActive(mqAlias)) {
				startValue = cols;
			}
		});
		this.colsValue = this.observableMedia.asObservable()
			.map(change => gridValue.get(change.mqAlias))
			.startWith(startValue);

	}

	checkStart() {
		if (Globals.g_DatabaseInfo.bIsStartCalc) {
			clearInterval(this.nTimerId);
			this.ngPortfolioName = Globals.g_DatabaseInfo.PortfolioList[0].portfolio_id;
			this.tradeForm.controls['portfolio'].setValue(this.ngPortfolioName);

			MainOpr.onCalculateData();
			HttpService.getTransactionList().subscribe(
				response => {
					MainOpr.getTransactionData(response);
					MainOpr.CalculatePortfolioData();

					this.setSlider();
					this.onRefreshTable();
					this.isValid = true;

					// Set portfolio list with transform array
					this.PortfolioList = Globals.g_DatabaseInfo.PortfolioList.map((obj) => {
						return { ...obj, name: obj.portfolio_id};
					});
					// Set fondos list
					this.fondosList = Globals.g_DatabaseInfo.ListofPriceFund;
					this.ngFondoName = this.fondosList[0]['name'];
					this.tradeForm.controls['fondo'].setValue(this.fondosList[0]['name']);

					this.setEscojeFondo();
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
		this.tradeForm.controls['date'].setValue(this.ngDate);
		// this.minVal = 0;
		// this.maxVal = Globals.g_DatabaseInfo.ListofPriceFund[0].ulen - 1;
		//
		// this.ngSliderIndex = this.maxVal;
		// const updatedDate = new Date(Globals.g_GlobalStatic.startDate);
		// const selectedDate = updatedDate.setDate(updatedDate.getDate() + this.ngSliderIndex);
		//
		// this.ng_strDate = this.maxDate = Globals.convertDate(selectedDate);
		// this.tradeForm.controls['date'].setValue(new Date(selectedDate));
	}

	onInputChange(event: any) {
		const updatedDate = moment(Globals.g_GlobalStatic.startDate);
		const selectedDate = updatedDate.add(event.value, 'days');

		this.ng_strDate = Globals.convertDate(selectedDate);
		Globals.g_Portfolios.nSliderIndex = event.value;
		this.ngDate = moment(selectedDate).format('YYYY-MM-DD');

		// Update Slider Index for send Event
		this.ngSliderIndex = event.value;
		this.tradeForm.controls['date'].setValue(this.ngDate);
		// const updatedDate = new Date(Globals.g_GlobalStatic.startDate);
		// const selectedDate = updatedDate.setDate(updatedDate.getDate() + event.value);
		// this.ng_strDate = Globals.convertDate(selectedDate);
		// Globals.g_Portfolios.nSliderIndex = event.value;
		// this.tradeForm.controls['date'].setValue(new Date(selectedDate));
		//
		// this.ngSliderIndex = event.value;
		this.setEscojeFondo();
	}

	onInputDatepicker(event: any) {
		const diffDate = moment(event.value).diff(moment(Globals.g_GlobalStatic.startDate), 'days');
		this.ng_strDate = Globals.convertDate(moment(event.value).format('YYYY-DD-MM'));
		Globals.g_Portfolios.nSliderIndex = diffDate;

		// Update Slider Index for send Event
		this.ngSliderIndex = diffDate;
		this.tradeForm.controls['date'].setValue(moment(event.value).format('YYYY-MM-DD'));
		// const diffDate = moment(event.value).diff(moment(Globals.g_GlobalStatic.startDate), 'days');
		// this.ng_strDate = Globals.convertDate(moment(event.value).format('YYYY-DD-MM'));
		// this.tradeForm.controls['date'].setValue(new Date(event.value));
		// Globals.g_Portfolios.nSliderIndex = diffDate;
		//
		// this.ngSliderIndex = diffDate;
		this.setEscojeFondo();
	}

	onRefreshTable() {
		const transactions = Globals.g_FundParent.arrAllTransaction;
		this.fondoList = {};

		const transactionsByPort = transactions.filter((obj) => {
			return obj.strPortID === this.ngPortfolioName &&
				   moment(obj.tDate).isSameOrBefore(moment(this.tradeForm.controls['date'].value));
		});
		this.fondoList = {
			'PortIndex': 0,
			'PortStatus': 'Show',
			'PortIcon': 'add',
			'Portname': transactionsByPort[0] && transactionsByPort[0].strPortID || [],
			'Portarray': transactionsByPort
		};

		this.tbHeader[0].icon = '';
		this.onTableReorder(0);
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
		this.sortTable(this.tbHeader[index].index, strOrderCmd);
	}

	sortTable(index, strOrderCmd) {
		this.fondoList.Portarray.sort(function(a, b){
			const keyA = a[Object.keys(a)[index]],
				keyB = b[Object.keys(a)[index]];

			if(keyA < keyB) return (strOrderCmd === 'down') ? -1 : 1;
			if(keyA > keyB) return (strOrderCmd === 'down') ? 1 : -1;
			return 0;
		});
	}

	setEscojeFondo() {
		const indexFondosValue = this.fondosList.findIndex((obj) => {
			return obj.name === this.ngFondoName;
		});

		const day91 = Globals.g_FundParent.arrAllReturns.day91_return[indexFondosValue][this.ngSliderIndex]*100;
		const day182 = Globals.g_FundParent.arrAllReturns.day182_return[indexFondosValue][this.ngSliderIndex]*100;
		const day365 = Globals.g_FundParent.arrAllReturns.day365_return[indexFondosValue][this.ngSliderIndex]*100;
		const year = Globals.g_FundParent.arrAllReturns.newstart_return[indexFondosValue][this.ngSliderIndex] * 1;

		this.ngScopeDay91 = (day91 !== undefined) ? Globals.numberWithCommas(day91.toFixed(1)) : 0;
		this.ngScopeDay182 = (day182 !== undefined) ? Globals.numberWithCommas(day182.toFixed(1)) : 0;
		this.ngScopeDay365 = (day365 !== undefined) ? Globals.numberWithCommas(day365.toFixed(1)) : 0;
		this.ngScopeYear = (year !== undefined) ? Globals.numberWithCommas(year.toFixed(1)) : 0;

		if (this.ngScopeDay91 > 0) { this.ngScopeDay91 = '+'+this.ngScopeDay91; }
		if (this.ngScopeDay182 > 0) { this.ngScopeDay182 = '+'+this.ngScopeDay182; }
		if (this.ngScopeDay365 > 0) { this.ngScopeDay365 = '+'+this.ngScopeDay365; }
		if (this.ngScopeYear > 0) { this.ngScopeYear = '+'+this.ngScopeYear; }
	}

	calculateUnidades(value) {
		const indexFondosValue = this.fondosList.findIndex((obj) => {
			return obj.name === this.ngFondoName;
		});
		const Unidades = value.replace(/,/g, '') / Globals.g_DatabaseInfo.ListofPriceFund[indexFondosValue].u[this.ngSliderIndex];
		this.tradeForm.controls['unidades'].setValue(Globals.toFixedDecimal(Unidades, 6));
	}

	calculatePesos(value) {
		const indexFondosValue = this.fondosList.findIndex((obj) => {
			return obj.name === this.ngFondoName;
		});
		const Pesos = Math.floor(Globals.g_DatabaseInfo.ListofPriceFund[indexFondosValue].u[this.ngSliderIndex] * value.replace(/,/g, '') * 10000) / 10000;
		this.tradeForm.controls['pesos'].setValue(Globals.toFixedDecimal(Pesos, 6));
	}

	resetForm() {
		this.tradeForm.controls['date'].valueChanges.subscribe(() => {
			this.tradeForm.controls['pesos'].setValue(null);
			this.tradeForm.controls['unidades'].setValue(null);
			this.onRefreshTable();
		});
		this.tradeForm.controls['fondo'].valueChanges.subscribe(() => {
			this.tradeForm.controls['pesos'].setValue(null);
			this.tradeForm.controls['unidades'].setValue(null);
		});
	}

	onBuy(valuesForm) {
		if (this.tradeForm.valid === false) { return false; }

		const indexFondosValue = this.fondosList.findIndex((obj) => {
			return obj.name === this.ngFondoName;
		});

		let url = '/buy';
		if(valuesForm.trade === 'comprar') {
			// buy item
			url = url + '/' + Globals.g_DatabaseInfo.ListofPriceFund[indexFondosValue].index;
			url = url + '/' + valuesForm.unidades.toString().replace(/,/g, '');
			url = url + '/' + 999;
			url = url + '/' + valuesForm.pesos.toString().replace(/,/g, '');
			url = url + '/' + moment(valuesForm.date).format('YYYY-MM-DD');
			url = url + '/' + valuesForm.portfolio;
			url = url + '/' + '2';
			url = url + '/' + Globals.convertDate(new Date());
			console.log('BUY URL', url);
		} else {
			// sell item
			url = url + '/' + 999;
			url = url + '/' + Math.abs(valuesForm.unidades.toString().replace(/,/g, ''));
			url = url + '/' + Globals.g_DatabaseInfo.ListofPriceFund[indexFondosValue].index;
			url = url + '/' + Math.abs(valuesForm.pesos.toString().replace(/,/g, ''));
			url = url + '/' + moment(valuesForm.date).format('YYYY-MM-DD');
			url = url + '/' + valuesForm.portfolio;
			url = url + '/' + '2';
			url = url + '/' + Globals.convertDate(new Date());
			console.log('SELL URL', url);
		}

		HttpService.getBuyResponse(url).subscribe(
			response => {
				HttpService.getTransactionList().subscribe(
					res => {
						MainOpr.getTransactionData(res);
						MainOpr.CalculatePortfolioData();
						this.onRefreshTable();
						this.checkTable();

						this.disabled = false;
					});
			});
	}

	// delete transaction
	onDelete(transaction) {
		if (transaction.nFundIndex > -1) {
			HttpService.getDeleteResponse(transaction.id).subscribe(
				response => {
					HttpService.getTransactionList().subscribe(
						res => {
							MainOpr.getTransactionData(res);
							MainOpr.CalculatePortfolioData();
							this.onRefreshTable();
							this.checkTable();

							this.disabled = false;
						});
				}
			);
			this.tableInfo = [];
		}
	}

	checkTable() {
		for (let i = 0; i < this.tableInfo.length; i ++) {
			for (let j = 0; j < Globals.g_DatabaseInfo.ListofPriceFund.length; j ++) {
				const eachArray = [];
				for (let k = 0; k < this.tableInfo[i].Portarray.length; k ++) {
					if (this.tableInfo[i].Portarray[k].nFundIndex === j) { eachArray.push(this.tableInfo[i].Portarray[k]); }
				}
				if (eachArray.length > 0) {
					for (let k = 0; k < eachArray.length; k ++) {
						eachArray[k].deletable = false;
						let sum = 0;
						for (let n = 0; n < eachArray.length; n ++) {
							if (k === n) { continue; }
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

	tranformFunc(resizableEl, index) {
		if(this.fullscreen[index]) {
			resizableEl._element.nativeElement.classList.remove('full-size');
		} else {
			resizableEl._element.nativeElement.classList.add('full-size');
		}

		this.fullscreen[index] = !this.fullscreen[index];
	}
}
