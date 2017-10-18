import { Directive, Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation } from '@angular/core';
import * as Globals from '../../../globals/globals.component';
import * as d3 from 'd3';

let hoverTooltipDiv: any;
let topChartTooltip: any;

@Directive({
	selector : '[d3porthisogram]'
})

export class D3PortHisogram{
	private margin: any = { top: 17, bottom: 20, left: 20, right: 0};
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
	private lastChanged: Array<any>;


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
		this.lastChanged = [];
		this.createData();
		this.createChart();
		this.updateChart();
	}

	ngOnChanges() {
		this.day91ReturnPortfolio = [];
		this.portfolioHistogramData = [];
		this.histogramData = [];
		this.data = [];
		this.lastChanged = [];
		this.createData();
		if (this.chart) {
			this.updateChart();
		}
	}

	createData() {
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
				let lastChangedBarIndex = -1;
				for (let i = 0; i < histogramRange.length + 1; i++) {
					if (i === 0) {
						if ( this.day91ReturnPortfolio[k] < parseFloat(histogramRange[i]) ) {
							dataMask[i] += 1;
							lastChangedBarIndex = i;
							break;
						}
					}
					else if (i == histogramRange.length) {
						if ( this.day91ReturnPortfolio[k] >= parseFloat(histogramRange[i-1]) ) {
							dataMask[i] += 1;
							lastChangedBarIndex = i;
							break;
						}
					}
					else {
						if ( this.day91ReturnPortfolio[k] !== 0 && this.day91ReturnPortfolio[k] < parseFloat(histogramRange[i]) && this.day91ReturnPortfolio[k] >= parseFloat(histogramRange[i-1]) ) {
							dataMask[i] += 1;
							lastChangedBarIndex = i;
							break;
						}
					}
				}
				this.portfolioHistogramData.push(dataMask.slice());
				this.lastChanged.push(lastChangedBarIndex);
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
			this.histogramData[i].value = this.portfolioHistogramData[this.SliderIndex][i];
			if (i === this.lastChanged[this.SliderIndex])
				this.histogramData[i].lastChanged = 1;
			else
				this.histogramData[i].lastChanged = 0;
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
		this.height = 250;
		if (window.innerWidth >= 1280) this.width = window.innerWidth / 100 * 33 - this.margin.left - this.margin.right;
		else this.width = window.innerWidth - this.margin.left - this.margin.right;
		this.width = this.width - 16 * 2 - 20;

		// Define the div for the tooltip
		hoverTooltipDiv = d3.select("body").append("div") 
			.attr("class", "hoverTooltip")
			.style("opacity", 0)
			.style("z-index", 999);

		this.svg = d3.select(element).append('svg')
			.attr('width', this.width + 50)
			.attr('height', this.height + 50)
			.attr('class', "d3porthisogram");

		// chart plot area
		this.chart = this.svg.append('g')
			.attr('class', 'bars')
			.attr('transform', `translate(${this.margin.left}, ${this.margin.top + 20})`);

		// define X & Y domains
		const xDomain = this.histogramData.map(d => d.label);
		const yDomain = [0, d3.max(this.histogramData, d => d.value)];

		// create scales
		this.xScale = d3.scaleBand().padding(0.02).domain(xDomain).rangeRound([0, this.width+50]);
		this.yScale = d3.scaleLinear().domain(yDomain).range([this.height, 0]);

		// bar colors
		this.colors = d3.scaleLinear().domain([0, this.histogramData.length]).range(<any[]>['red', 'blue']);

		// x & y axis
		this.xAxis = this.svg.append('g')
			.attr('class', 'axis axis-x')
			.attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.height + 20})`)
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
		this.chart.selectAll('.bar')//.transition()
			.attr('x', d => this.xScale(d.label))
			.attr('y', d => this.yScale(d.value))
			.attr('width', d => this.xScale.bandwidth())
			.attr('height', d => this.height - this.yScale(d.value))
			.style('fill', '#f7732d');

		// add new bars
		update
			.enter()
			.append('rect')
			.on("mouseover", function(d) {
				hoverTooltipDiv.transition()
					.duration(200)
					.style("opacity", .9);
				hoverTooltipDiv.html(d.percentage + "%")  
					.style("left", (d3.event.pageX-20) + "px")
					.style("top", (d3.event.pageY-30) + "px");  
				})
			.on("mouseout", function(d) {
				hoverTooltipDiv.transition()
					.duration(500)
					.style("opacity", 0);
			})
			.attr('class', 'bar')
			.attr('x', d => this.xScale(d.label))
			.attr('y', d => this.yScale(0))
			.attr('width', this.xScale.bandwidth())
			.attr('height', 0)
			.style('fill', '#f7732d')
			.transition()
			.delay((d, i) => i * 10)
			.attr('y', d => this.yScale(d.value))
			.attr('height', d => this.height - this.yScale(d.value));

		this.chart.selectAll('.topTooltip').remove();

		// Define the text for the top tooltip
		topChartTooltip = this.chart.append("text") 
			.attr("class", "topTooltip")
			.style("opacity", 1)
			.style("font-size", "12px");

		update.each(function(d, i) {
			if (d.lastChanged > 0) {
				let element = d3.select(this);
				let x = element.attr('x');
				let y = element.attr('y');
				topChartTooltip
					.text(d.percentage + "%")
					.attr('x', parseInt(x) + 12)
					.attr('y', parseInt(y) - 3);
			}
		});

		//move x-axis left on half the width of the column to to display intervals
		let bar = this.svg.select(".bars .bar").attr("width");

		this.svg.select(".bars")
					.attr("transform", "translate("+ Math.round(bar/2) +"," + this.margin.top + ")");

		let g = this.svg.select(".axis-x")
				.attr("transform", "translate(0," + (this.height + this.margin.top) + ")");
		
		g.select("path").remove();
		
		let xAxis = this.svg.select(".axis-x").node().getBBox().width;

		let shift = g.select('.tick').attr('transform').match(/\((.*)\,/);
		if (d3.select(".custom-axis-x").empty()) {
			g.insert("path")
					.attr("d", "M0.0,0V0.5H"+ xAxis +"V0")
					.attr("transform", shift.input)
					.attr('class', 'custom-axis-x');
		}
	}
}