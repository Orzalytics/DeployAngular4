import { Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import * as Globals from '../../../globals/globals.component';
import * as d3 from 'd3';

import { ResizeService } from '../../../service/resize.service';

let listofTreeMap: any;

let nSliderIndex: number;
let strPfName: string;

@Directive({
    selector : '[d3treemap]'
})

export class D3TreeMap implements OnInit, OnDestroy, OnChanges {
    @Input('SliderIndex') SliderIndex: number;
    @Input('PfName') PfName: string;

    private chartElement: any;
    private width: number;
    private height: number;
    private margin: any = { top: 17, bottom: 20, left: 20, right: 0};

    constructor (private el: ElementRef,
                 private resizeService: ResizeService ) {
        this.chartElement = el.nativeElement;
    }

    ngOnInit() {
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
        strPfName = this.PfName;

        this.createData();
        this.createChart();
    }

    createData() {
        listofTreeMap = {'name' : 'tree', 'children' : []};

        for (let i = 0; i < Globals.g_Portfolios.arrDataByPortfolio.length; i ++) {
            if (Globals.g_Portfolios.arrDataByPortfolio[i].portname != strPfName) continue;
            const eachTree = {'name' : '', 'children' : []};
            eachTree.name = Globals.g_Portfolios.arrDataByPortfolio[i].portname;
            for (let j = 0; j < Globals.g_DatabaseInfo.ListofPriceFund.length; j ++) {
              const children = {'name' : '', 'size' : 0};
              children.name = Globals.g_DatabaseInfo.ListofPriceFund[j].name;
              children.size = Globals.g_Portfolios.arrDataByPortfolio[i].weightArray[j+1][nSliderIndex];
              eachTree.children[j] = children;
            }
            listofTreeMap.children.push(eachTree);
        }

        if (listofTreeMap.children.length == 0) listofTreeMap.children.push({'name' : '', 'children' : []});
    }

    createChart() {
        const elements = document.querySelectorAll('.treemap');
        for (let i = 0; i < elements.length; i ++) {
            elements[i].parentNode.removeChild(elements[i]);
        }

        if (listofTreeMap.children.length > 0) {
            // let width = window.innerWidth;
            // let height = 500;
            // const margin = {top: 20, right: 40, bottom: 40, left: 40};

            // if (width >= 1280) {
            //     // document.getElementById('tree_house').style.height = '160px';
            //     width = width / 100 * 25;
            //     height = 150;
            // }else if ((width < 1280) && (width >= 900)) {
            //     // document.getElementById('tree_house').style.height = '300px';
            //     height = 150;
            // }else if ((width < 900) && (width >= 600)) {
            //     // document.getElementById('tree_house').style.height = '200px';
            //     height = 150;
            // }else {
            //     // document.getElementById('tree_house').style.height = '150px';
            //     height = 130;
            // }
            // width = width - margin.right - margin.left;

            const element = this.chartElement;

            const widthContainer = element.parentNode.parentNode.parentNode.clientWidth;
            this.width = widthContainer - this.margin.right - this.margin.left - 50;
            this.height = 270 - element.parentNode.parentNode.querySelector('.mat-card-title').clientHeight;

            // creating a div to contain line charts.
            const color = d3.scaleOrdinal().range(d3.schemeCategory20c);

            const treemap = d3.treemap().size([this.width, this.height]);

            const div = d3.select(this.chartElement).append('div')
                .attr('class', 'treemap')
                .style('position', 'relative')
                .style('width', (this.width) + 'px')
                .style('height', (this.height) + 'px')
                .style('left', '0px')
                .style('top', '0px')
                .style('background', 'rgb(49, 130, 189)');

            const root = d3.hierarchy(listofTreeMap, (d) => d.children)
                .sum((d) => d.size);

            const tree = treemap(root);

            const node = div.datum(root).selectAll('.node')
                .data(tree.leaves())
            .enter().append('div')
                .attr('class', 'node')
                .style('left', (d) => d.x0 + 'px')
                .style('top', (d) => d.y0 + 'px')
                .style('width', (d) => Math.max(0, d.x1 - d.x0 - 1) + 'px')
                .style('height', (d) => Math.max(0, d.y1 - d.y0  - 1) + 'px')
                .style('background', function(d){const colorObj: any = d.parent.data; return '' + color(colorObj.name);})
                .text(function(d){ const txtObj: any = d.data; return txtObj.name; });
        }
    }
}

