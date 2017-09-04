import { Directive, ElementRef, Input, SimpleChanges } from '@angular/core';
import * as Globals from '../globals/globals.component';
import * as d3 from 'd3';

var y_Day91Return : any;
var x_Day7LossMin : any;

var nSliderIndex : number;

@Directive({
    selector : '[d3Scatter]'    
})

export class D3ScatterPlot {
    private chartElement : any;
    private margin: any = { top: 20, bottom: 20, left: 20, right: 20};
    private width: number;
    private height: number;   

    @Input('SliderIndex') SliderIndex : number;
    @Input('WindowSize') WindowSize : number;
    @Input('SliderDisable') SliderDisable : any;
    @Input('RefreshAll') RefreshAll : any;    
    

    constructor (private el : ElementRef) {
        this.chartElement = el.nativeElement;
    }

    ngOnInit() {
        x_Day7LossMin = [];
        y_Day91Return = [];
        this.createData();
        this.createChart();
    }

    ngOnChanges(changes: SimpleChanges) {
        nSliderIndex = this.SliderIndex;
        x_Day7LossMin = [];
        y_Day91Return = [];
        this.createData();
        this.createChart();
    }
    
    createData() {
        // calculate for funds
        for (var i = 0; i < Globals.g_FundParent.arrAllReturns.day91_return.length; i ++){
          y_Day91Return[i] = Globals.g_FundParent.arrAllReturns.day91_return[i][this.SliderIndex];

          var min = 99999;
          for (var j = 0; j <= this.SliderIndex; j ++){
            if (min > Globals.g_FundParent.arrAllReturns.day7_loss[i][j]) min = Globals.g_FundParent.arrAllReturns.day7_loss[i][j];
          }
          x_Day7LossMin[i] = 0-min;
        }
        // calculate for portfolio
        for (var i = 0; i < Globals.g_Portfolios.arrDataByPortfolio.length; i ++){
          if (Globals.g_Portfolios.arrDataByPortfolio[i] == undefined) continue;
          y_Day91Return.push(Globals.g_Portfolios.arrDataByPortfolio[i].day91Array[this.SliderIndex]);
          var min = 99999;
          for (var j = 0; j <= this.SliderIndex; j ++){
            if (min > Globals.g_Portfolios.arrDataByPortfolio[i].day7Array[j]) min = Globals.g_Portfolios.arrDataByPortfolio[i].day7Array[j];
          }
          x_Day7LossMin.push(0-min);
        }

        // console.log(x_Day7LossMin);
        // console.log(y_Day91Return);
    }

    createChart() {
        var elements = document.querySelectorAll('.data-scattergraph');
        for (var i = 0; i < elements.length; i ++){
            elements[i].parentNode.removeChild(elements[i]);
        }

        let element = this.chartElement;
        var margin = {top: 20, right: 10, bottom: 40, left: 40};

        this.width = window.innerWidth - margin.right - margin.left - 20;
        this.height = (window.innerWidth > 650) ? window.innerWidth / 4 : window.innerWidth / 2;

        let svg = d3.select(element).append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr("transform", "translate(0, 0)")
            .attr('class', 'data-scattergraph');

        // setup variables
        var y = d3.scaleLinear()
            .domain([-0.15, 0.3])
            .range([this.height - margin.top,  0 + margin.bottom]);
        var x = d3.scaleLinear()
            .domain([0, 0.25])
            .range([ 0 + margin.left, this.width - margin.right ]);

        var g = svg.append("svg:g")
            .style('stroke', '#F44336')
            .style('fill', 'none');

        g.append('g')
            .attr("class", "x_axis")
            .attr("transform", "translate(0 , " + (this.height - margin.top) + ")")
            .call(d3.axisBottom(x));

        g.append("g")
            .attr("class", "y_axis")
            .attr("transform", "translate(" + (margin.left) + ", 0)")
            .call(d3.axisLeft(y));

        d3.selectAll(".tick > text")
            .style("font-size", "12px");

        d3.selectAll(".x_axis > path")
            .style("stroke-dasharray", ("3, 3"))
            .style('stroke', '#F44336')
            .attr("transform", "translate(0 , " + (-this.height+y(0)+margin.top) + ")");
        
        d3.selectAll(".y_axis > path")
            .style('stroke', '#F44336');

        var clip = svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("id", "clip-rect")
            .attr("x", margin.left - 8)
            .attr("y", margin.bottom - 8)
            .attr("width", this.width - margin.left - margin.right + 16)
            .attr("height", this.height - margin.top - margin.bottom + 16);

        svg.append("rect")
            .attr("class", "rect_circle")
            .attr("id", "rect_circle")
            .attr("x", 100)
            .attr("y", 100)
            .attr("width", 74)
            .attr("height", 60)
            .attr("clip-path", "url(#clip)")
            .style('fill', 'grey')
            .style('stroke-width', 1)
            .style('stroke', 'grey')
            .style("opacity", 0);

        // Add title
        svg.selectAll(".dot")
            .data(y_Day91Return)
        .enter().append("text")
            .attr("x", function(d, i) { 
                var xValue = x_Day7LossMin[i];
                if (xValue > 0.25) xValue = 0.25;
                if (xValue < 0) xValue = 0;
                return x(xValue) - 6;
            })
            .attr("y", function(d, i) { 
                var yValue = y_Day91Return[i];
                if (yValue > 0.3) yValue = 0.3;
                if (yValue < -0.15) yValue = -0.15;
                return y(yValue) - 10; 
            })
            .text( function (d, i) {
                if (i >= Globals.g_DatabaseInfo.ListofPriceFund.length) return Globals.g_Portfolios.arrDataByPortfolio[i-Globals.g_DatabaseInfo.ListofPriceFund.length].portname;
                else return "";
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "12px")
            .style("fill", function(d, i){
                var cntFund = Globals.g_DatabaseInfo.ListofPriceFund.length;
                var isPort = (i < cntFund) ? 0 : 1;
                var color = d3.rgb(isPort * (100 + 150/(i-cntFund+1)), (100 + 100/(i+1)) * (1-isPort), 0);
                return color + "";
            })
            .style("opacity", function(d, i){
                var cntFund = Globals.g_DatabaseInfo.ListofPriceFund.length;
                if (i >= cntFund){
                    if (Globals.g_Portfolios.arrDataByPortfolio[i - cntFund].showhide == 0) return 0;
                }
            return 0.7;
            });
        
        // Add dot
        svg.selectAll(".dot")
            .data(y_Day91Return)
          .enter().append("circle")
            .attr("class", function(d, i){
                var classname = "";
                if (i >= Globals.g_DatabaseInfo.ListofPriceFund.length) classname = "dot_" + Globals.g_Portfolios.arrDataByPortfolio[i - Globals.g_DatabaseInfo.ListofPriceFund.length].portname;
                else classname = "dot_" + Globals.g_DatabaseInfo.ListofPriceFund[i].name;
                return classname;
            })
            .attr("id", function(d, i){
                var classname = "";
                if (i >= Globals.g_DatabaseInfo.ListofPriceFund.length) classname = "dot_" + Globals.g_Portfolios.arrDataByPortfolio[i - Globals.g_DatabaseInfo.ListofPriceFund.length].portname;
                else classname = "dot_" + Globals.g_DatabaseInfo.ListofPriceFund[i].name;
                return classname;
            })
            .attr("r", 8)
            .attr("cx", function(d, i) {
                var xValue = x_Day7LossMin[i];
                if (xValue > 0.25) xValue = 0.25;
                if (xValue < 0) xValue = 0;
                return x(xValue);
            })
            .attr("cy", function(d, i) {
                var yValue = y_Day91Return[i];
                if (yValue > 0.3) yValue = 0.3;
                if (yValue < -0.15) yValue = -0.15;
                return y(yValue); 
            })
            .attr("clip-path", "url(#clip)")
            .style("fill", function(d, i){
                var cntFund = Globals.g_DatabaseInfo.ListofPriceFund.length;
                var isPort = (i < cntFund) ? 0 : 1;
                var color = d3.rgb(isPort * (100 + 150/(i-cntFund+1)), (100 + 100/(i+1)) * (1-isPort), 0);
                return color + "";
            })
            .style("opacity", function(d, i){
                var cntFund = Globals.g_DatabaseInfo.ListofPriceFund.length;
                if (i >= cntFund){
                    if (Globals.g_Portfolios.arrDataByPortfolio[i - cntFund].showhide == 0) return 0;
                }
                return 0.7;
            })
            .style("display", function(d, i){
                var cntFund = Globals.g_DatabaseInfo.ListofPriceFund.length;
                if (i >= cntFund){
                    if (Globals.g_Portfolios.arrDataByPortfolio[i - cntFund].showhide == 0) return "none";
                }
                return "block";
            })
            .on("mouseover",  function(d, i){onMouseOver(i)})
            .on("mouseout",  onMouseOut);

            function onMouseOver(index){
                var xData = x_Day7LossMin[index];
                var yData = y_Day91Return[index];

                if (xData > 0.25) xData = 0.25;
                if (xData < 0) xData = 0;
                if (yData > 0.3) yData = 0.3;
                if (yData < -0.15) yData = -0.15;

                if (index >= Globals.g_DatabaseInfo.ListofPriceFund.length){
                    if (Globals.g_Portfolios.arrDataByPortfolio[index-Globals.g_DatabaseInfo.ListofPriceFund.length].showhide == 0) return;
                    document.getElementById("scatter_title").innerHTML = Globals.g_Portfolios.arrDataByPortfolio[index-Globals.g_DatabaseInfo.ListofPriceFund.length].portname;
                    document.getElementById("scatter_port").innerHTML = (Globals.g_Portfolios.arrDataByPortfolio[index-Globals.g_DatabaseInfo.ListofPriceFund.length].yearRateArray[nSliderIndex] > 0)? "+" + Globals.g_Portfolios.arrDataByPortfolio[index-Globals.g_DatabaseInfo.ListofPriceFund.length].yearRateArray[nSliderIndex] + "% desde inicio, tasa periodo o annual" : Globals.g_Portfolios.arrDataByPortfolio[index-Globals.g_DatabaseInfo.ListofPriceFund.length].yearRateArray[nSliderIndex] + "% desde inicio, tasa periodo o annual";
                }else{
                    document.getElementById("scatter_title").innerHTML = Globals.g_DatabaseInfo.ListofPriceFund[index].name;
                    document.getElementById("scatter_port").innerHTML = (Globals.g_FundParent.arrAllReturns.newstart_return[index][nSliderIndex] > 0) ? "+" + Globals.g_FundParent.arrAllReturns.newstart_return[index][nSliderIndex] + "% desde inicio, tasa periodo o annual" : Globals.g_FundParent.arrAllReturns.newstart_return[index][nSliderIndex] + "% desde inicio, tasa periodo o annual";
                }
                
                document.getElementById("scatter_x").innerHTML = Globals.toFixedDecimal(xData * 100, 1) + "% caída máxima en 7 días ";
                document.getElementById("scatter_y").innerHTML = (Globals.toFixedDecimal(yData * 100, 1) >= 0) ? "+"+ Globals.toFixedDecimal(yData * 100, 1) + "% en 91 días" : Globals.toFixedDecimal(yData * 100, 1) + "% en 91 días";                      

                var tooltip = document.getElementById("scatter_tooltip");
                var width = window.innerWidth - margin.right - margin.left;
                var height = (window.innerWidth > 650) ? window.innerWidth / 4 : window.innerWidth / 2;

                tooltip.style.left = (x(xData)+310 < width) ? ((x(xData) + 30).toFixed() + "px") : ((width-310) + "px");
                tooltip.style.top = (y(yData)+50).toFixed() + "px";
                tooltip.style.display = "block";
              }

            function onMouseOut(){
                document.getElementById("scatter_tooltip").style.display = "none";
            }
    }    
}