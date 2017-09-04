import { Directive, ElementRef, Input, SimpleChanges } from '@angular/core';
import * as Globals from '../globals/globals.component';
import * as d3 from 'd3';

var x_Data : any;
var y_Data : any;

var nSliderIndex : number;

@Directive({
    selector : '[d3portline]'    
})

export class D3PortLine {
    private chartElement : any;
    private margin: any = { top: 20, bottom: 20, left: 20, right: 20};

    @Input('SliderIndex') SliderIndex : number;
    @Input('PfName') PfName : string;
    @Input('WindowSize') WindowSize : number;
    @Input('SliderDisable') SliderDisable : any;
    @Input('RefreshStatus') RefreshStatus : any;    

    constructor (private el : ElementRef) {
        this.chartElement = el.nativeElement;
    }

    ngOnInit() {
        x_Data = [];
        y_Data = [];
        this.createData();
        this.createChart();
    }

    ngOnChanges(changes: SimpleChanges) {
        nSliderIndex = this.SliderIndex;

        x_Data = [];
        y_Data = [];
        this.createData();
        this.createChart();
    }

    createData(){
        // portfolio array
        x_Data = Globals.g_DatabaseInfo.ListofPriceFund[0].udate;
        y_Data = Globals.g_AllStatus.arrPortfolioData;
    }

    createChart(){
        var elements = document.querySelectorAll('.data-port');
        for (var i = 0; i < elements.length; i ++){
            elements[i].parentNode.removeChild(elements[i]);
        }

        let element = this.chartElement;
        var margin = {top: 20, right: 10, bottom: 40, left: 40};

        var width = window.innerWidth;
        var height = 150;
        var margin = {top: 20, right: 11, bottom: 20, left: 10};
        if (window.innerWidth >= 1280) width = window.innerWidth / 100 * 50 - margin.left - margin.right;
        else width = window.innerWidth - margin.left - margin.right;

        width = width - 16 * 2 - 20; // card content

        // creating a div to contain fund line chart
        var div = d3.select(element);
        var svg = div.append('svg:svg')
            .attr('width', width)
            .attr('height',	height)
            .attr('class', 'data-port');

        var xStart = d3.extent(y_Data)[0];
        var xEnd = d3.extent(y_Data)[1];

        // setup variables
        var x = d3.scaleTime()
            .domain(d3.extent(x_Data, function(d) { return d as Date }))
            .range([ 0 + margin.left, width - margin.right ]);
        var y = d3.scaleLinear()
            .domain(d3.extent(y_Data, function(d) { return Number(d); }))
            .range([ 0 + margin.bottom, height - margin.top ]);

        var g = svg.append("svg:g")
            .style('stroke', '#9E9E9E')
            .style('fill', 'none');

        var lineGraph = d3.line()
            .x(function(d, i){ return x(x_Data[i]); })
            .y(function(d, i) { return height - y(y_Data[i]); });

        g.append("svg:path")
            .attr("d",lineGraph(y_Data))
            .style('stroke-width', 2)
            .style('stroke', '#3663d5')
            .style('fill', 'none');

        var verticalLine = svg.append('line')
            .attr("x1", 0)
            .attr("y1", 8)
            .attr("x2", 0)
            .attr("y2", height - 8)
            .attr("stroke", "black")
            .attr('class', 'verticalLine')
            .style('stroke-width', 2)
            .attr("transform", function () {
                var xPosition = x(x_Data[nSliderIndex]);
                return "translate(" + xPosition + ",0)";
            });

        var toolTipValue = svg.append('text')
            .text(function(d) { return d3.format("$0,.02f")(y_Data[nSliderIndex]); })
            .attr('text-anchor', 'start')
            .attr('class', 'toolTipValue')
            .attr('dy', '20')
            .attr('dx', '8');
        
        toolTipValue.attr("transform", function () {
            var xPosition = x(x_Data[nSliderIndex]);
            var node: SVGTSpanElement = <SVGTSpanElement>toolTipValue.node(); 
            var thisWidth = node.getComputedTextLength();
            if (thisWidth + xPosition + 20 > width){
              xPosition = xPosition - thisWidth - 15;
            }
            return "translate(" + xPosition + ",0)";
        });
    }
}