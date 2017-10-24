import { Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';

import { ResizeService } from '../../../service/resize.service';

let nSliderIndex: number;

@Directive({
    selector: '[d3fanchart]'
})

export class D3FanchartDirective implements OnInit, OnDestroy, OnChanges {
    @Input('SliderIndex') SliderIndex: number;
    @Input('Data') Data: any;

    private chartElement: any;
    private margin: any = {top: 20, bottom: 20, left: 20, right: 20};

    constructor( private el: ElementRef,
                 private resizeService: ResizeService ) {
        this.chartElement = el.nativeElement;
    }

    ngOnInit() {
        const parsedData = this.createData(this.Data);
        this.resizeService.addResizeEventListener(this.el.nativeElement, (elem) => {
            this.createChart(parsedData);
        });
    }

    ngOnDestroy() {
        this.resizeService.removeResizeEventListener(this.el.nativeElement);
    }

    ngOnChanges(changes: SimpleChanges) {
        nSliderIndex = this.SliderIndex;
        const parsedData = this.createData(this.Data);
        setTimeout(() => {
            this.createChart(parsedData);
        });
    }

    createData(rawData = []) {
        return rawData
            .map((d) => ({
                date: d.date,
                fundPrice: (d.fundPrice || 0),
                worstScenario: (d.worstScenario || 0),
                bestScenario: (d.bestScenario || 0)
            }));
    }

    createChart(data: { date: Date, bestScenario: number, fundPrice: number }[]) {
        const SVG_CLASSNAME = 'data-fan';
        if (!data.length) {
            return null;
        }
        const elements = document.querySelectorAll(`.${SVG_CLASSNAME}`);
        for (let i = 0; i < elements.length; i++) {
            elements[i].parentNode.removeChild(elements[i]);
        }

        // let svgWidth = window.innerWidth;
        // const svgHeight = 190;
        const margin = {top: 0, right: 10, bottom: 20, left: 10};
        // if (window.innerWidth >= 1280) svgWidth = window.innerWidth / 100 * 25 - margin.left - margin.right;
        // else svgWidth = window.innerWidth - margin.left - margin.right;
        // const chartWidth = svgWidth - margin.left - margin.right;
        // const chartHeight = svgHeight - margin.top - margin.bottom;
        const element = this.chartElement;

        const widthContainer = element.parentNode.parentNode.parentNode.clientWidth;
        const chartWidth = widthContainer - margin.right - margin.left - 50;
        const chartHeight = 270 - element.parentNode.parentNode.querySelector('.mat-card-title').clientHeight;

        let worstScenario: number = 0;
        data.forEach( (val: any, index, array) => {
            if ( (worstScenario === 0 && val.worstScenario !== 0) ||
                 (val.worstScenario !== 0 && val.worstScenario < worstScenario) ) {
                worstScenario = val.worstScenario;
            }
        });

        const x: any = d3
            .scaleTime()
            .range([0, chartWidth])
            .domain(d3.extent(data, (d) => d.date));

        const y = d3
            .scaleLinear()
            .range([chartHeight, 0])
            .domain([
                Math.floor(worstScenario),
                d3.max(data, (d: any) => d.bestScenario)
            ]);

        const xAxis = d3
                .axisBottom(x)
                .tickSizeInner(-chartHeight)
                .tickSizeOuter(0)
                .tickPadding(10),
            yAxis = d3
                .axisLeft(y)
                .tickSizeInner(-chartWidth)
                .tickSizeOuter(0)
                .tickPadding(10);

        const svg = d3
            .select(this.chartElement)
            .append('svg')
            .attr('class', SVG_CLASSNAME)
            .attr('width', chartWidth)
            .attr('height', chartHeight)
            .append('g')
            .attr('transform', 'translate(0,' + margin.top + ')');

        // const axes = svg.append('g')
        //     .attr('clip-path', 'url(#axes-clip)');

        // axes.append('g')
        //     .attr('class', 'x axis')
        //     .attr('transform', 'translate(0,' + chartHeight + ')')
        //     .call(xAxis);

        // axes.append('g')
        //     .attr('class', 'y axis')
        //     .call(yAxis)
        //     .append('text')
        //     .attr('transform', 'rotate(-90)')
        //     .attr('y', 6)
        //     .attr('dy', '.71em')
        //     .style('text-anchor', 'end');

        const funArea = d3.area()
            .x(function (d: any) {
                return x(d.date);
            })
            .y0(function (d: any) {
                return y(d.bestScenario);
            })
            .defined(function (d: any) {
                return d.bestScenario;
            })
            .y1(function (d: any) {
                return y(d.worstScenario);
            })
            .defined(function (d: any) {
                return d.worstScenario;
            })
            .curve(d3.curveBasis);

        const medianLine = d3.line()
            .x(function (d: any) {
                return x(d.date);
            })
            .y(function (d: any) {
                return y(d.fundPrice);
            })
            .defined(function (d: any) {
                return d.fundPrice;
            })
            .curve(d3.curveBasis);

        svg.datum(data);

        svg.append('path')
            .attr('class', 'area upper inner')
            .attr('d', funArea)
            .attr('clip-path', 'url(#rect-clip)');

        svg.append('path')
            .attr('class', 'median-line')
            .attr('d', medianLine)
            .attr('clip-path', 'url(#rect-clip)');

        var verticalLine = svg.append('line')
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", chartHeight)
            .attr("stroke", "black")
            .attr('class', 'verticalLine')
            .style('stroke-width', 2)
            .attr('transform', function () {
                var xPosition = x(data[nSliderIndex].date);
                return 'translate(' + xPosition + ',0)';
            });

        var toolTipValue = svg.append('text')
            .text(function(d) { return d3.format('$0,.06f')(data[nSliderIndex].fundPrice); })
            .attr('text-anchor', 'start')
            .attr('class', 'line_extoolTipValue')
            .attr('dy', '20')
            .attr('dx', '8');
        
        toolTipValue.attr('transform', function () {
            var xPosition = x(data[nSliderIndex].date);
            var node: SVGTSpanElement = <SVGTSpanElement>toolTipValue.node(); 
            var thisWidth = node.getComputedTextLength();
            if (thisWidth + xPosition + 20 > chartWidth){
              xPosition = xPosition - thisWidth - 15;
            }
            return 'translate(' + xPosition + ',0)';
        });
    }
}

const parseDate = d3.timeParse('%Y-%m-%d');
