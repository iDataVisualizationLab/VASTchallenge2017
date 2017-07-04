'use strict';
class BaseNetwork {
    constructor(divId, width, height, options, eventHandler) {

        this.originalWidth = width;
        this.originalHeight = height;

        this.options = this.handleOptions(options);

        this.nativeSvg = d3.select("#" + divId).append("svg")
            .attr("width", this.originalWidth)
            .attr("height", this.originalHeight)
        ;

        let margin = this.options.margin;
        this.width = width - margin.left - margin.right;
        this.height = height - margin.top - margin.bottom;

        var svg = this.nativeSvg
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            ;
        this.svg = svg;

        this.nodes = [];
        this.links = [];

        this.eventHandler = eventHandler;


        this.init();

        this.tooltip = new TooltipHelper('tooltip');

    }

    init() {


        this.createSimulation();

        this.linkGroup = this.svg.append("g")
            .attr('class', 'link-group')
            .style("stroke", "#aaa")
        ;

        this.nodeGroup = this.svg.append('g')
            .attr('class', 'node-group')
        ;

        this.nodeLabelGroup = this.svg.append('g')
            .attr('class', 'node-label-group')
        ;
    }

    handleOptions(options) {
        if (!options) {
            options = {};
        }

        if (!options.margin) {
            options.margin = {};
        }

        let margin = options.margin;
        if (!margin.top) {
            margin.top = 0;
        }

        if (!margin.right) {
            margin.right = 0;
        }

        if (!margin.bottom) {
            margin.bottom = 0;
        }

        if (!margin.left) {
            margin.left = 0;
        }

        if (!options.offSetX) {
            options.offSetX = 0;
        }

        if (!options.offSetY) {
            options.offSetY = 0;
        }

        if (!options.nodeRadius) {
            options.nodeRadius = 12;
        }

        if (!options.linkThickness) {
            options.linkThickness = 1;
        }

        return options;
    }

    createSimulation() {
        this.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(10).strength(0.6))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(this.width / 2, this.height / 2))
            .force("collide",d3.forceCollide( function(d){return d.r + 5; }).iterations(16))
        ;
    }

    clear() {
        this.nodeGroup.selectAll('*').remove();
        this.linkGroup.selectAll('*').remove();
        this.nodeLabelGroup.selectAll('*').remove();
    }
}
