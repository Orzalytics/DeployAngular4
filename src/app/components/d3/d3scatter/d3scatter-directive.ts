import {Directive, ElementRef, Input, OnChanges, OnInit, DoCheck, SimpleChanges, OnDestroy} from '@angular/core';
import * as Globals from '../../../globals/globals.component';
import * as d3 from 'd3';

import { ResizeService } from '../../../service/resize.service';

let y_Day91Return: any;
let x_Day7LossMin: any;

let nSliderIndex: number;
let nPortfolioName: string;
let nNotMovedToTooltip: boolean;

let portСompositionObj: Array<any>;

@Directive({
    selector: '[d3Scatter]'
})

export class D3ScatterPlot implements OnInit, OnDestroy, OnChanges, DoCheck {
    private chartElement: any;
    private ticks: number;

    private width: number;
    private height: number;

    @Input('SliderIndex') SliderIndex: number;
    @Input('PortfolioName') PortfolioName: any;
    @Input('TableInfo') TableInfo: any;
    @Input('NotMovedToTooltip') NotMovedToTooltip: any;

    constructor ( private el: ElementRef,
                  private resizeService: ResizeService ) {
        this.chartElement = el.nativeElement;
    }

    ngOnInit() {
        x_Day7LossMin = [];
        y_Day91Return = [];
        this.prepareData();
        this.createData();
        this.resizeService.addResizeEventListener(this.el.nativeElement, (elem) => {
            this.createChart();
        });
    }

    ngDoCheck() {
        nNotMovedToTooltip = this.NotMovedToTooltip;
    }

    ngOnDestroy() {
        this.resizeService.removeResizeEventListener(this.el.nativeElement);
    }

    ngOnChanges(changes: SimpleChanges) {
        nSliderIndex = this.SliderIndex;
        nPortfolioName = this.PortfolioName;
        x_Day7LossMin = [];
        y_Day91Return = [];
        this.createData();
        setTimeout(() => {
            this.createChart();
        });
    }

    prepareData() {
        portСompositionObj = [];
        for (const portfolio of this.TableInfo) {
            portСompositionObj[portfolio.Portname] = [];
            for (const port of portfolio.Portarray) {
                portСompositionObj[portfolio.Portname].push(port.strFundName);
            }
        }
    }

    createData() {
        // calculate for funds
        for (let i = 0; i < Globals.g_FundParent.arrAllReturns.day91_return.length; i ++) {
          y_Day91Return[i] = Globals.g_FundParent.arrAllReturns.day91_return[i][this.SliderIndex];
          let min = 99999;
          for (let j = 0; j <= this.SliderIndex; j ++) {
            if (min > Globals.g_FundParent.arrAllReturns.day7_loss[i][j]) min = Globals.g_FundParent.arrAllReturns.day7_loss[i][j];
          }
          x_Day7LossMin[i] = 0-min;
        }
        // calculate for portfolio
        for (let i = 0; i < Globals.g_Portfolios.arrDataByPortfolio.length; i ++) {
          if (Globals.g_Portfolios.arrDataByPortfolio[i] === undefined) continue;
          y_Day91Return.push(Globals.g_Portfolios.arrDataByPortfolio[i].day91Array[this.SliderIndex]);
          let min = 99999;
          for (let j = 0; j <= this.SliderIndex; j ++) {
            if (min > Globals.g_Portfolios.arrDataByPortfolio[i].day7Array[j])
                min = Globals.g_Portfolios.arrDataByPortfolio[i].day7Array[j];
          }
          x_Day7LossMin.push(0-min);
        }
    }

    createChart() {
        const elements = document.querySelectorAll('.data-scattergraph');
        for (let i = 0; i < elements.length; i ++) {
            elements[i].parentNode.removeChild(elements[i]);
        }

        const element = this.chartElement;
        const margin = {top: 20, right: 10, bottom: 40, left: 40};

        // Calculate width and heigth for graph
        const widthContainer = this.chartElement.parentNode.parentNode.parentNode.clientWidth;
        this.width = widthContainer - margin.right - margin.left - 20;
        const height = this.chartElement.parentNode.parentNode.querySelector('.mat-card-title').clientHeight;
        this.height = 296 - this.chartElement.parentNode.parentNode.querySelector('.mat-card-title').clientHeight;

        if (this.width < 400) this.ticks = 5;
        else this.ticks = 12;

        const svg = d3.select(element).append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('transform', 'translate(0, 0)')
            .attr('class', 'data-scattergraph');

        // setup variables
        const y = d3.scaleLinear()
                // .domain([-0.15, 0.3])
                .domain([-0.5, 2])
                .range([this.height - margin.top,  0 + margin.bottom]);
        const x = d3.scaleLinear()
                // .domain([0, 0.25])
                .domain([0, 0.5])
                .range([ 0 + margin.left, this.width - margin.right ]);

        const g = svg.append('svg:g')
                .style('stroke', '#F44336')
                .style('fill', 'none');

        g.append('g')
            .attr('class', 'x_axis')
            .attr('transform', 'translate(0 , ' + (this.height - margin.top) + ')')
            .call(d3.axisBottom(x).ticks(this.ticks));

        g.append('g')
            .attr('class', 'y_axis')
            .attr('transform', 'translate(' + (margin.left) + ', 0)')
            .call(d3.axisLeft(y));

        svg.selectAll('.tick > text')
            .style('font-size', '12px');

        svg.selectAll('.x_axis > path')
            .style('stroke-dasharray', ('3, 3'))
            .style('stroke', '#F44336')
            .attr('transform', 'translate(0 , ' + (-this.height+y(0)+margin.top) + ')');
        svg.selectAll('.y_axis > path')
            .style('stroke', '#F44336');

        const clip = svg.append('defs').append('svg:clipPath')
            .attr('id', 'clip')
            .append('svg:rect')
            .attr('id', 'clip-rect')
            .attr('x', margin.left - 8)
            .attr('y', margin.bottom - 8)
            .attr('width', this.width - margin.left - margin.right + 16)
            .attr('height', this.height - margin.top - margin.bottom + 16);

        svg.append('rect')
            .attr('class', 'rect_circle')
            .attr('id', 'rect_circle')
            .attr('x', 100)
            .attr('y', 100)
            .attr('width', 74)
            .attr('height', 60)
            .attr('clip-path', 'url(#clip)')
            .style('fill', 'grey')
            .style('stroke-width', 1)
            .style('stroke', 'grey')
            .style('opacity', 0);

        // Add title
        svg.selectAll('.dot')
            .data(y_Day91Return)
        .enter().append('text')
            .attr('x', function(d, i) {
                let xValue = x_Day7LossMin[i];
                // if (xValue > 0.25) xValue = 0.25;
                // if (xValue < 0) xValue = 0;
                if (xValue > 0.5) xValue = 0.5;
                if (xValue < 0) xValue = 0;
                return x(xValue) - 6;
            })
            .attr('y', function(d, i) {
                let yValue = y_Day91Return[i];
                // if (yValue > 0.3) yValue = 0.3;
                // if (yValue < -0.15) yValue = -0.15;
                if (yValue > 2) yValue = 0.2;
                if (yValue < -0.5) yValue = -0.5;
                return y(yValue) - 10;
            })
            .text( function (d, i) {
                if (i >= Globals.g_DatabaseInfo.ListofPriceFund.length) {
                    const portName = Globals.g_Portfolios.arrDataByPortfolio[i-Globals.g_DatabaseInfo.ListofPriceFund.length].portname;
                    if (nPortfolioName === portName) {
                        return portName;
                    }
                    else return '';
                }
                else return '';
            })
            .attr('font-family', 'sans-serif')
            .attr('font-size', '12px')
            .style('fill', function(d, i){
                const cntFund = Globals.g_DatabaseInfo.ListofPriceFund.length;
                const isPort = (i < cntFund) ? 0 : 1;
                const color = d3.rgb(isPort * (100 + 150/(i-cntFund+1)), (100 + 100/(i+1)) * (1-isPort), 0);
                return color + '';
            })
            .style('opacity', function(d, i){
                const cntFund = Globals.g_DatabaseInfo.ListofPriceFund.length;
                if (i >= cntFund) {
                    if (Globals.g_Portfolios.arrDataByPortfolio[i - cntFund].showhide === 0) return 0;
                }
                return 0.7;
            });
        // Add dot
        svg.selectAll('.dot')
            .data(y_Day91Return)
            .enter().append('circle')
            .attr('class', function(d, i){
                let classname = '';
                if (i >= Globals.g_DatabaseInfo.ListofPriceFund.length) classname = 'dot_' + Globals.g_Portfolios.arrDataByPortfolio[i - Globals.g_DatabaseInfo.ListofPriceFund.length].portname;
                else classname = 'dot_' + Globals.g_DatabaseInfo.ListofPriceFund[i].name;
                return classname;
            })
            .attr('id', function(d, i){
                let classname = '';
                if (i >= Globals.g_DatabaseInfo.ListofPriceFund.length) classname = 'dot_' + Globals.g_Portfolios.arrDataByPortfolio[i - Globals.g_DatabaseInfo.ListofPriceFund.length].portname;
                else classname = 'dot_' + Globals.g_DatabaseInfo.ListofPriceFund[i].name;
                return classname;
            })
            .attr('r', 8)
            .attr('cx', function(d, i) {
                let xValue = x_Day7LossMin[i];
                // if (xValue > 0.25) xValue = 0.25;
                // if (xValue < 0) xValue = 0;
                if (xValue > 0.5) xValue = 0.5;
                if (xValue < 0) xValue = 0;
                return x(xValue);
            })
            .attr('cy', function(d, i) {
                let yValue = y_Day91Return[i];
                // if (yValue > 0.3) yValue = 0.3;
                // if (yValue < -0.15) yValue = -0.15;
                if (yValue > 2) yValue = 0.2;
                if (yValue < -0.5) yValue = -0.5;
                return y(yValue);
            })
            .attr('clip-path', 'url(#clip)')
            .style('fill', function(d, i){
                if (portСompositionObj !== undefined) {
                    if ( i < Globals.g_DatabaseInfo.ListofPriceFund.length &&
                        portСompositionObj[nPortfolioName] &&
                        portСompositionObj[nPortfolioName].indexOf( Globals.g_DatabaseInfo.ListofPriceFund[i].name ) !== -1 ) {
                        return '#ff5800';
                    }
                    else if (i >= Globals.g_DatabaseInfo.ListofPriceFund.length) {
                        const portName = Globals.g_Portfolios.arrDataByPortfolio[i-Globals.g_DatabaseInfo.ListofPriceFund.length].portname;
                        if (nPortfolioName === portName) {
                            return '#ff0000';
                        }
                        else return '#006e00';
                    }
                    else return '#006e00';
                }
            })
            .style('opacity', function(d, i){
                const cntFund = Globals.g_DatabaseInfo.ListofPriceFund.length;
                if (i >= cntFund) {
                    if (Globals.g_Portfolios.arrDataByPortfolio[i - cntFund].showhide === 0) return 0;
                }
                return 0.7;
            })
            .style('display', function(d, i){
                const cntFund = Globals.g_DatabaseInfo.ListofPriceFund.length;
                if (i >= cntFund) {
                    if (Globals.g_Portfolios.arrDataByPortfolio[i - cntFund].showhide === 0) return 'none';
                }
                return 'block';
            })
            .on('mouseover',  function(d, i){onMouseOver(i);})
            .on('mouseout',  onMouseOut);

            function onMouseOver(index) {
                let xData = x_Day7LossMin[index];
                let yData = y_Day91Return[index];
                let scatterTitle = '';
                let scatterPort = '';

                // if (xData > 0.25) xData = 0.25;
                // if (xData < 0) xData = 0;
                // if (yData > 0.3) yData = 0.3;
                // if (yData < -0.15) yData = -0.15;
                if (xData > 0.5) xData = 0.5;
                if (xData < 0) xData = 0;
                if (yData > 2) yData = 2;
                if (yData < -0.5) yData = -0.5;


                if (index >= Globals.g_DatabaseInfo.ListofPriceFund.length) {
                    if (Globals.g_Portfolios.arrDataByPortfolio[index-Globals.g_DatabaseInfo.ListofPriceFund.length].showhide === 0) return;
                    scatterTitle = Globals.g_Portfolios.arrDataByPortfolio[index-Globals.g_DatabaseInfo.ListofPriceFund.length].portname;
                    scatterPort = (Globals.g_Portfolios.arrDataByPortfolio[index-Globals.g_DatabaseInfo.ListofPriceFund.length].yearRateArray[nSliderIndex] > 0)? '+' + Globals.g_Portfolios.arrDataByPortfolio[index-Globals.g_DatabaseInfo.ListofPriceFund.length].yearRateArray[nSliderIndex] + '% desde inicio, tasa periodo o annual' : Globals.g_Portfolios.arrDataByPortfolio[index-Globals.g_DatabaseInfo.ListofPriceFund.length].yearRateArray[nSliderIndex] + '% desde inicio, tasa periodo o annual';
                } else {
                    scatterTitle = Globals.g_DatabaseInfo.ListofPriceFund[index].name;
                    scatterPort = (Globals.g_FundParent.arrAllReturns.newstart_return[index][nSliderIndex] > 0) ? '+' + Globals.g_FundParent.arrAllReturns.newstart_return[index][nSliderIndex] + '% desde inicio, tasa periodo o annual' : Globals.g_FundParent.arrAllReturns.newstart_return[index][nSliderIndex] + '% desde inicio, tasa periodo o annual';
                }

                document.getElementById('scatter_title').innerHTML = scatterTitle;
                document.getElementById('scatter_port').innerHTML = scatterPort;

                document.getElementById('scatter_x').innerHTML = Globals.toFixedDecimal(xData * 100, 1) + '% caída máxima en 7 días ';
                document.getElementById('scatter_y').innerHTML = (Globals.toFixedDecimal(yData * 100, 1) >= 0) ? '+'+ Globals.toFixedDecimal(yData * 100, 1) + '% en 91 días' : Globals.toFixedDecimal(yData * 100, 1) + '% en 91 días';

                const tooltip = document.getElementById('scatter_tooltip');
                const width = widthContainer - margin.right - margin.left;
                // const height = (widthContainer > 650) ? window.innerWidth / 4 : window.innerWidth / 2;

                tooltip.style.left = (x(xData)+310 < width) ? ((x(xData) + 30).toFixed() + 'px') : ((width-310) + 'px');
                tooltip.style.top = (y(yData)+50).toFixed() + 'px';
                tooltip.style.display = 'block';
            }

            function onMouseOut() {
                setTimeout(() => {
                    if (nNotMovedToTooltip) {
                        let title = document.getElementById('scatter_tooltip').getAttribute("title");
                        // if (title = ) {}
                        document.getElementById('scatter_tooltip').style.display = 'none';
                    }
                }, 500);
            }
    }
}
