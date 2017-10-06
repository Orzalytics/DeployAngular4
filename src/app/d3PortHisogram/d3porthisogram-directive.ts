import { Directive, Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation } from '@angular/core';
import * as Globals from '../globals/globals.component';
import * as d3 from 'd3';

@Directive({
	selector : '[d3porthisogram]'    
})

export class D3PortHisogram{
	private margin: any = { top: 0, bottom: 20, left: 20, right: 0};
	private chart: any;
	private svg: any;
	private width: number;
	private height: number;
	private xScale: any;
	private yScale: any;
	private colors: any;
	private xAxis: any;
	private yAxis: any;
	private chartElement: any;
	private data: Array<any>;
	private day91ReturnPortfolio: Array<any>;
	private portfolioHistogramData: Array<any>;
	private histogramData: Array<any>;

	@Input('SliderIndex') SliderIndex : number;
	@Input('PfName') PfName : string;
	@Input('WindowSize') WindowSize : number;
	@Input('SliderDisable') SliderDisable : any;
	@Input('RefreshStatus') RefreshStatus : any;
	@Input('DataLength') DataLength : number;

	constructor (private el : ElementRef) {
		this.chartElement = el.nativeElement;
	}

	ngOnInit() {
		this.data = [];
		this.day91ReturnPortfolio = [];
		this.portfolioHistogramData = [];
		this.histogramData = [];
		this.data = [];
		this.createData();
		this.createChart();
		this.updateChart();
	}

	ngOnChanges() {
		this.day91ReturnPortfolio = [];
		this.portfolioHistogramData = [];
		this.histogramData = [];
		this.data = [];
		this.createData();
		if (this.chart) {
			this.updateChart();
		}
	}

	createData(){
		for (let i = 0; i < Globals.g_Portfolios.arrDataByPortfolio.length; i ++) {
				if (Globals.g_Portfolios.arrDataByPortfolio[i].portname === this.PfName) {
						this.day91ReturnPortfolio = Globals.g_Portfolios.arrDataByPortfolio[i].day91Array;
				}
		}

		let histogramRange = ['-0.10', '-0.05', '0.00', '0.05', '0.10', '0.15', '0.20', '0.25'];
		let dataMask = [0,0,0,0,0,0,0,0,0];
		if (!this.day91ReturnPortfolio.length) {
			for (let i = 0; i < this.DataLength; i++) {
				this.portfolioHistogramData.push(dataMask);
			}
		}
		else {
			for (let k = 0; k < this.day91ReturnPortfolio.length; k++) {
				for (let i = 0; i < histogramRange.length + 1; i++) {
					if (i === 0) {
						if ( this.day91ReturnPortfolio[k] < parseFloat(histogramRange[i]) ) {
							dataMask[i] += 1;
							break;
						}
					}
					else if (i == histogramRange.length) {
						if ( this.day91ReturnPortfolio[k] >= parseFloat(histogramRange[i-1]) ) {
							dataMask[i] += 1;
							break;
						}
					}
					else {
						if ( this.day91ReturnPortfolio[k] !== 0 && this.day91ReturnPortfolio[k] < parseFloat(histogramRange[i]) && this.day91ReturnPortfolio[k] >= parseFloat(histogramRange[i-1]) ) {
							dataMask[i] += 1;
							break;
						}
					}
				}
				this.portfolioHistogramData.push(dataMask.slice());
			}
		}

		this.histogramData.push({label:"", value:0});
		for (let i = 0; i < histogramRange.length; i++) {
			this.histogramData.push({label:histogramRange[i], value:0});
		}
		this.histogramData.push({label:" ", value:0});

		//data calculation for tooltips (the value of each column in percent)
		let histogramSumm = 0;
		for (let i = 0; i < this.portfolioHistogramData[this.SliderIndex].length; i++) {
			this.histogramData[i+1].value = this.portfolioHistogramData[this.SliderIndex][i];
			histogramSumm += this.portfolioHistogramData[this.SliderIndex][i];
		}

		let percentageSumm = 0;
		let maxValue = 0;
		for (let i = 0; i < this.histogramData.length; i++) {
			percentageSumm += Math.round(this.histogramData[i].value*100/histogramSumm);
			this.histogramData[i].percentage = Math.round(this.histogramData[i].value*100/histogramSumm);
			if (this.histogramData[i].value > this.histogramData[maxValue].value) {
				maxValue = i;
			}
		}
		
		//avoiding of 99% and 101% summ of tooltip values
		if (percentageSumm < 100) {
			this.histogramData[maxValue].percentage += 100 - percentageSumm;
		}
		else if (percentageSumm > 100) {
			this.histogramData[maxValue].percentage -= percentageSumm - 100;
		}
	}

	createChart() {
		const element = this.chartElement;
		this.width = window.innerWidth
		this.height = 150;
		if (window.innerWidth >= 1280) this.width = window.innerWidth / 100 * 25 - this.margin.left - this.margin.right;
		else this.width = window.innerWidth - this.margin.left - this.margin.right;
		this.width = this.width - 16 * 2 - 20;

		console.log(this.width, this.height);

		this.svg = d3.select(element).append('svg')
			.attr('width', this.width + 50)
			.attr('height', this.height + 50)
			.attr('class', "d3porthisogram");

		// chart plot area
		this.chart = this.svg.append('g')
			.attr('class', 'bars')
			.attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

		// define X & Y domains
		const xDomain = this.histogramData.map(d => d.label);
		const yDomain = [0, d3.max(this.histogramData, d => d.value)];

		// create scales
		this.xScale = d3.scaleBand().padding(0.1).domain(xDomain).rangeRound([0, this.width+50]);
		this.yScale = d3.scaleLinear().domain(yDomain).range([this.height, 0]);

		// bar colors
		this.colors = d3.scaleLinear().domain([0, this.histogramData.length]).range(<any[]>['red', 'blue']);

		// x & y axis
		this.xAxis = this.svg.append('g')
			.attr('class', 'axis axis-x')
			.attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.height})`)
			.call(d3.axisBottom(this.xScale));
		this.yAxis = this.svg.append('g')
			.attr('class', 'axis axis-y')
			.attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
			.call(d3.axisLeft(this.yScale));
	}

	updateChart() {
		// update scales & axis
		this.xScale.domain(this.histogramData.map(d => d.label));
		this.yScale.domain([0, d3.max(this.histogramData, d => d.value)]);
		this.colors.domain([0, this.histogramData.length]);
		this.xAxis.transition().call(d3.axisBottom(this.xScale));
		this.yAxis.transition().call(d3.axisLeft(this.yScale));

		const update = this.chart.selectAll('.bar')
			.data(this.histogramData);

		// remove exiting bars
		update.exit().remove();

		// update existing bars
		this.chart.selectAll('.bar').transition()
			.attr('x', d => this.xScale(d.label))
			.attr('y', d => this.yScale(d.value))
			.attr('width', d => this.xScale.bandwidth())
			.attr('height', d => this.height - this.yScale(d.value))
			.style('fill', '#f7732d');

		// add new bars
		update
			.enter()
			.append('rect')
			.attr('class', 'bar')
			.attr('x', d => this.xScale(d.label))
			.attr('y', d => this.yScale(0))
			.attr('width', this.xScale.bandwidth())
			.attr('height', 0)
			// .style('fill', (d, i) => this.colors(i))		
			.style('fill', '#f7732d')
			.transition()
			.delay((d, i) => i * 10)
			.attr('y', d => this.yScale(d.value))
			.attr('height', d => this.height - this.yScale(d.value));

		//move x-axis left on half the width of the column to to display intervals
		let g = this.svg.select(".axis-x")
				.attr("transform", "translate(2," + (this.height + this.margin.top) + ")");
		let shift = g.select('.tick').attr('transform').match(/\((.*)\,/);
		g.select("path").remove();
		g.insert("path")
				.attr("d", "M0.0,0V0.5H315V0")
				.attr("transform", shift.input);
	}
}