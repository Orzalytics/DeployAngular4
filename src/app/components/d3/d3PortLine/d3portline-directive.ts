import {Directive, DoCheck, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import * as Globals from '../../../globals/globals.component';
import * as d3 from 'd3';
import {ResizeService} from "../../../service/resize.service";

let x_Data: any;
let y_Data: any;

let nSliderIndex: number;

@Directive({
    selector : '[d3portline]'
})

export class D3PortLine implements OnInit, OnDestroy, OnChanges {
    private chartElement: any;

    @Input('SliderIndex') SliderIndex: number;
    @Input('PfName') PfName: string;
    @Input('WindowSize') WindowSize: number;
    @Input('SliderDisable') SliderDisable: any;
    @Input('RefreshStatus') RefreshStatus: any;

    constructor ( private el: ElementRef,
                  private resizeService: ResizeService ) {
        this.chartElement = el.nativeElement;
    }

    ngOnInit() {
        x_Data = [];
        y_Data = [];
        this.createData();
        this.resizeService.addResizeEventListener(this.el.nativeElement, (elem) => {
            this.createChart();
        });
    }

    ngOnDestroy() {
        this.resizeService.removeResizeEventListener(this.el.nativeElement);
    }

    ngOnChanges(changes: SimpleChanges) {
        nSliderIndex = this.SliderIndex;

        x_Data = [];
        y_Data = [];
        this.createData();
        setTimeout(() => {
            this.createChart();
        });
    }

    createData() {
        // portfolio array
        x_Data = Globals.g_DatabaseInfo.ListofPriceFund[0].udate;
        y_Data = Globals.g_AllStatus.arrPortfolioData;
    }

    createChart() {
        const elements = document.querySelectorAll('.data-port');
        for (let i = 0; i < elements.length; i ++) {
            elements[i].parentNode.removeChild(elements[i]);
        }

        const element = this.chartElement;
        const margin = {top: 20, right: 10, bottom: 40, left: 40};

        // var width = window.innerWidth;
        // var height = 250;
        // var margin = {top: 20, right: 11, bottom: 20, left: 10};
        // if (window.innerWidth >= 1280) width = window.innerWidth / 100 * 25 - margin.left - margin.right;
        // else width = window.innerWidth - margin.left - margin.right;

        // Calculate width and heigth for graph
        const widthContainer = this.chartElement.parentNode.parentNode.parentNode.clientWidth;
        const width = widthContainer - margin.right - margin.left - 18;
        let height = this.chartElement.parentNode.parentNode.querySelector('.mat-card-title').clientHeight;
        height = 296 - this.chartElement.parentNode.parentNode.querySelector('.mat-card-title').clientHeight;

         // width = width - 16 * 2 - 20; // card content

        // creating a div to contain fund line chart
        const div = d3.select(element);
        const svg = div.append('svg:svg')
            .attr('width', width)
            .attr('height',	height)
            .attr('class', 'data-port');

        const xStart = d3.extent(y_Data)[0];
        const xEnd = d3.extent(y_Data)[1];

        // setup variables
        const x = d3.scaleTime()
            .domain(d3.extent(x_Data, function(d) { return d as Date; }))
            .range([ 0 + margin.left, width - margin.right ]);
        const y = d3.scaleLinear()
            .domain(d3.extent(y_Data, function(d) { return Number(d); }))
            .range([ 0 + margin.bottom, height - margin.top ]);

        const g = svg.append('svg:g')
            .style('stroke', '#9E9E9E')
            .style('fill', 'none');

        const lineGraph = d3.line()
            .x(function(d, i){ return x(x_Data[i]); })
            .y(function(d, i) { return height - y(y_Data[i]); });

        g.append('svg:path')
            .attr('d',lineGraph(y_Data))
            .style('stroke-width', 2)
            .style('stroke', '#3663d5')
            .style('fill', 'none');

        const verticalLine = svg.append('line')
            .attr('x1', 0)
            .attr('y1', 8)
            .attr('x2', 0)
            .attr('y2', height - 8)
            .attr('stroke', 'black')
            .attr('class', 'verticalLine')
            .style('stroke-width', 2)
            .attr('transform', function () {
                const xPosition = x(x_Data[nSliderIndex]);
                return 'translate(' + xPosition + ',0)';
            });

        const toolTipValue = svg.append('text')
            .text(function(d) { return d3.format('$0,.02f')(y_Data[nSliderIndex]); })
            .attr('text-anchor', 'start')
            .attr('class', 'toolTipValue')
            .attr('dy', '20')
            .attr('dx', '8');

        toolTipValue.attr('transform', function () {
            let xPosition = x(x_Data[nSliderIndex]);
            const node: SVGTSpanElement = <SVGTSpanElement>toolTipValue.node();
            const thisWidth = node.getComputedTextLength();
            if (thisWidth + xPosition + 20 > width) {
              xPosition = xPosition - thisWidth - 15;
            }
            return 'translate(' + xPosition + ',0)';
        });
    }
}
