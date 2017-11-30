import { Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import * as Globals from '../../../globals/globals.component';
import * as d3 from 'd3';

import { ResizeService } from '../../../service/resize.service';

let chartData: Array<any>;

@Directive({
    selector: '[d3ScatterCompare]'
})

export class D3ScatterPlotCompare implements OnInit, OnDestroy, OnChanges {
    @Input('PfName') PfName: string;
    @Input('SliderIndex') SliderIndex: number;
    @Input('fondoSelected') fondoSelected: any;
    @Input('fondosList') fondosList: any;

    private chartElement: any;
    private width: number;
    private height: number;
    private day91ReturnPortfolio: Array<any>;
    private crossFundPortfolioScatterData: Array<any>;
    private FondIndex: number;

    constructor (private el: ElementRef,
                 private resizeService: ResizeService ) {
        this.chartElement = el.nativeElement;
    }

    ngOnInit() {
        this.day91ReturnPortfolio = [];
        this.crossFundPortfolioScatterData = [];
        this.createData();
        this.resizeService.addResizeEventListener(this.el.nativeElement, (elem) => {
            this.createChart();
        });
    }

    ngOnDestroy() {
        this.resizeService.removeResizeEventListener(this.el.nativeElement);
    }

    ngOnChanges(changes: SimpleChanges) {
        this.day91ReturnPortfolio = [];
        this.crossFundPortfolioScatterData = [];
        this.createData();

        setTimeout(() => {
            this.createChart();
        });
    }

    createData() {
        for (var i = 0; i < this.fondosList.length; ++i) {
            if (this.fondosList[i].name === this.fondoSelected) {
                this.FondIndex = i;
                break;
            }
        }

        for (let i = 0; i < Globals.g_Portfolios.arrDataByPortfolio.length; i ++) {
            if (Globals.g_Portfolios.arrDataByPortfolio[i].portname === this.PfName) {
                this.day91ReturnPortfolio = Globals.g_Portfolios.arrDataByPortfolio[i].day91Array;
            }
        }

        const selectedFundReturn = Globals.g_FundParent.arrAllReturns.day91_return[this.FondIndex];
        if (this.day91ReturnPortfolio && selectedFundReturn) {
            for (let i = 0; i < selectedFundReturn.length; i+=7) {
                if (this.day91ReturnPortfolio.length && this.day91ReturnPortfolio[i] !== 0) {
                    this.crossFundPortfolioScatterData.push([this.day91ReturnPortfolio[i], selectedFundReturn[i]]);
                }
                else {
                    this.crossFundPortfolioScatterData.push([0, -1]);
                }
            }
        }

        if (this.crossFundPortfolioScatterData && this.crossFundPortfolioScatterData.length) {
            const index = Math.floor(this.SliderIndex/7);
            chartData = this.crossFundPortfolioScatterData.slice(0, index+1);
        }
    }

    createChart() {
        const elements = document.querySelectorAll('.data-scattercompare');
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
        const svg = d3.select(element).append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('transform', 'translate(0, 0)')
            .attr('class', 'data-scattercompare');

        // setup variables
        const y = d3.scaleLinear()
                // .domain([-0.15, 0.3])
                .domain([-0.5, 2])
                .range([this.height - margin.top,  0 + margin.bottom]);
        const x = d3.scaleLinear()
                // .domain([-0.15, 0.3])
                .domain([-0.5, 2])
                .range([ 0 + margin.left, this.width - margin.right ]);

        const g = svg.append('svg:g')
                .style('stroke', '#F44336')
                .style('fill', 'none');

        g.append('g')
            .attr('class', 'x_axis')
            .attr('transform', 'translate(0 , ' + (this.height - margin.top) + ')')
            .call(d3.axisBottom(x));

        g.append('g')
            .attr('class', 'y_axis')
            .attr('transform', 'translate(' + (margin.left) + ', 0)')
            .call(d3.axisLeft(y));

        svg.selectAll('.tick > text')
            .style('font-size', '12px');

        // Add dot
        svg.selectAll('.dot')
            .data(chartData)
            .enter().append('circle')
            .attr('r', 8)
            .attr('cx', function(d, i) {
                let xValue = d[0];
                // if (xValue > 0.3) xValue = 0.3;
                // if (xValue < -0.15) xValue = -0.15;
                if (xValue > 2) xValue = 2;
                if (xValue < -0.5) xValue = -0.5;
                return x(xValue);
            })
            .attr('cy', function(d, i) {
                let yValue = d[1];
                if (yValue !== -1) {
                    // if (yValue > 0.3) yValue = 0.3;
                    // if (yValue < -0.15) yValue = -0.15;
                    if (yValue > 2) yValue = 2;
                    if (yValue < -0.5) yValue = -0.5;
                }
                return y(yValue);
            })
            .style('fill', 'rgb(0, 116, 0)')
            .style('opacity', 0.4);

        svg.select('.x_axis .tick').style('display', 'none');
        svg.select('.x_axis .tick:last-child').style('display', 'none');
        svg.select('.y_axis .tick').style('display', 'none');
        svg.select('.y_axis .tick:last-child').style('display', 'none');
    }
}
