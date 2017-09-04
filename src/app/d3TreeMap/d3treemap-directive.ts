import { Directive, ElementRef, Input, SimpleChanges } from '@angular/core';
import * as Globals from '../globals/globals.component';
import * as d3 from 'd3';

var listofTreeMap : any;

var nSliderIndex : number;
var strPfName : string;

var testJSON = {
    "name": "flare",
    "children": [
     {
      "name": "analytics",
      "children": [
       {
        "name": "cluster",
        "children": [
         {"name": "AgglomerativeCluster", "size": 3938},
         {"name": "CommunityStructure", "size": 3812},
         {"name": "HierarchicalCluster", "size": 6714},
         {"name": "MergeEdge", "size": 743}
        ]
       }
      ]
     }
    ]
   }
   
@Directive({
    selector : '[d3treemap]'    
})

export class D3TreeMap {
    private chartElement : any;

    @Input('SliderIndex') SliderIndex : number;
    @Input('PfName') PfName : string;
    @Input('WindowSize') WindowSize : number;
    @Input('SliderDisable') SliderDisable : any;

    constructor (private el : ElementRef) {
        this.chartElement = el.nativeElement;
    }

    ngOnInit() {
        this.createData();
        this.createChart();
    }

    ngOnChanges(changes: SimpleChanges) {
        nSliderIndex = this.SliderIndex;
        strPfName = this.PfName;

        this.createData();
        this.createChart();
    }

    createData(){
        listofTreeMap = {"name" : "tree", "children" : []};

        for (var i = 0; i < Globals.g_Portfolios.arrDataByPortfolio.length; i ++){
            if (Globals.g_Portfolios.arrDataByPortfolio[i].portname != strPfName) continue;
            var eachTree = {"name" : "", "children" : []};
            eachTree.name = Globals.g_Portfolios.arrDataByPortfolio[i].portname;
            for (var j = 0; j < Globals.g_DatabaseInfo.ListofPriceFund.length; j ++){
              var children = {"name" : "", "size" : 0};
              children.name = Globals.g_DatabaseInfo.ListofPriceFund[j].name;
              children.size = Globals.g_Portfolios.arrDataByPortfolio[i].weightArray[j][nSliderIndex];
              eachTree.children[j] = children;
            }
            listofTreeMap.children.push(eachTree);
        }

        if (listofTreeMap.children.length == 0) listofTreeMap.children.push({"name" : "", "children" : []});
    }

    createChart(){
        var elements = document.querySelectorAll('.treemap');
        for (var i = 0; i < elements.length; i ++){
            elements[i].parentNode.removeChild(elements[i]);
        }

        if (listofTreeMap.children.length > 0){
            var width = window.innerWidth;
            var height = 500;
            var margin = {top: 20, right: 40, bottom: 40, left: 40};
            
            if (width >= 1280){
                // document.getElementById("tree_house").style.height = "160px";
                width = width / 100 * 25;
                height = 150;
            }else if ((width < 1280) && (width >= 900)){
                // document.getElementById("tree_house").style.height = "300px";
                height = 150;
            }else if ((width < 900) && (width >= 600)){
                // document.getElementById("tree_house").style.height = "200px";
                height = 150;
            }else{
                // document.getElementById("tree_house").style.height = "150px";
                height = 130;
            }
            width = width - margin.right - margin.left;
            // creating a div to contain line charts.
            var color = d3.scaleOrdinal().range(d3.schemeCategory20c);
      
            const treemap = d3.treemap().size([width, height]);
            
            const div = d3.select(this.chartElement).append("div")
                .attr("class", "treemap")
                .style("position", "relative")                
                .style("width", (width) + "px")
                .style("height", (height) + "px")
                .style("left", "0px")
                .style("top", "0px")
                .style("background", "rgb(49, 130, 189)");

            const root = d3.hierarchy(listofTreeMap, (d) => d.children)
                .sum((d) => d.size);
            
            const tree = treemap(root);

            const node = div.datum(root).selectAll(".node")
                .data(tree.leaves())
            .enter().append("div")
                .attr("class", "node")
                .style("left", (d) => d.x0 + "px")
                .style("top", (d) => d.y0 + "px")
                .style("width", (d) => Math.max(0, d.x1 - d.x0 - 1) + "px")
                .style("height", (d) => Math.max(0, d.y1 - d.y0  - 1) + "px")
                .style("background", function(d){var colorObj : any = d.parent.data; return "" + color(colorObj.name)})
                .text(function(d){ var txtObj : any = d.data; return txtObj.name; });
        }
    }
}

