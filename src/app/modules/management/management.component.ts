import { compact } from 'lodash';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ServiceComponent } from '../../service/service.component';
import { StorageService } from '../../service/storage.service';

import * as Globals from './../../globals/globals.component';
import * as MainOpr from './../../mainoperation/mainoperation.component';

import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import { ObservableMedia } from '@angular/flex-layout';
import {FormControl, FormGroup, Validators} from "@angular/forms";
// import { Observable } from 'rxjs/Observable';
// import {FormControl, FormGroup, Validators} from '@angular/forms';
import { MdSnackBar } from '@angular/material';

import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import {SnackBarComponent} from '../../components/SnackBar/snackbar.component';

let HttpService: any;
let self: any;

@Component({
	selector: 'app-management',
	templateUrl: './management.component.html',
	styleUrls: ['./management.component.css'],
	providers: [ServiceComponent]
})

export class ManagementComponent implements OnInit, OnDestroy {
	public isValid = false;
	public disabled = false;

	private sub: any;
	public cols: any;
	private nTimerId: any;

	public routeName: any;
	public PortfolioList  = [];

	public numberMask = createNumberMask({
		prefix: '',
		suffix: '',
		allowDecimal: false
	});

	// Portfolio table //
	// values for icon information on table header
	tbHeader = [
		{index : 1, title : 'Nombre Portafolio', icon : ''},
		{index : 2, title : 'Valor Meta', icon : ''},
		{index : 3, title : 'Moneda', icon : ''},
	];

	public portfolioForm = new FormGroup({
		portfolio_id: new FormControl(null, Validators.required),
		valor: new FormControl(0, Validators.required),
		moneda: new FormControl(0, Validators.required),
	});

	constructor( private service: ServiceComponent,
				 public snackBar: MdSnackBar,
				 private observableMedia: ObservableMedia,
				 private storageService: StorageService ) {
		self = this;
		HttpService = this.service;
	}

	ngOnInit() {
		HttpService.getDatabaseInfo();
		this.nTimerId = setInterval(() => {
			this.checkStart();
		}, 100);

		// this.isValid = true;
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

		this.resetForm();
	}

	ngOnDestroy() {
		// this.sub.unsubscribe();
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

					this.onRefreshTable(this.PortfolioList);
					this.isValid = true;
				});
		}
	}

	onRefreshTable(portfolioList) {
		this.PortfolioList = portfolioList;
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
		// this.fondoList.Portarray.sort(function(a, b){
		//     const keyA = a[Object.keys(a)[index]],
		//         keyB = b[Object.keys(a)[index]];
		//
		//     if(keyA < keyB) return (strOrderCmd === 'down') ? -1 : 1;
		//     if(keyA > keyB) return (strOrderCmd === 'down') ? 1 : -1;
		//     return 0;
		// });
	}

	submitForm(valuesForm) {
		if (this.portfolioForm.valid === false) return false;

		let url = '/addport';

		url = url + '/' + valuesForm.portfolio_id;
		url = url + '/' + valuesForm.valor.replace(/,/g, '');
		url = url + '/' + valuesForm.moneda;
		url = url + '/' + Globals.convertDate(new Date());
		url = url + '/' + this.storageService.getToken() || null;

		HttpService.getBuyResponse(url).subscribe(
			response => {
				HttpService.getPortfolioList().subscribe(
					res => {
						this.snackBar.openFromComponent(SnackBarComponent, {
							duration: 100000,
							data: {
								message: 'Message',
								action: ''
							}
						});
						this.onRefreshTable(res);
						this.resetForm();
					});
			});
	}

	// delete transaction
	onDelete(portfolio) {
		HttpService.getDeletePortResponse(portfolio.portfolio_id).subscribe(
			response => {
				HttpService.getPortfolioList().subscribe(
					res => {
						this.onRefreshTable(res);
					});
			});
	}

	resetForm() {
		this.portfolioForm.reset();
	}
}
