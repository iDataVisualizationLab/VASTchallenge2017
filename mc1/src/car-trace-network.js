'use strict';
class CarTraceNetwork extends BaseNetwork {

    constructor(divId, width, height, options) {
        super(divId, width, height, options);

        this.parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");

        this.graphs = [];
    }

    handleOptions(options) {

        options = super.handleOptions(options);

        options.margin.top = 80;

        return options;
    }

    setData(line) {

        this.graphs = [];

        let self = this;
        let paths = line.path;
        let preCp;

        let graph = new SimpleGraph();

        let mp;

        let specialGateCount = 0;
        let preNode, tmpNode;

        paths.forEach(function (cp, index) {


            tmpNode = new SimpleNode(graph.countNodes(), cp, cp.getGate());
            graph.addNode(tmpNode);

            mp = cp.getMapPoint();

            if (mp.isEntrance() || mp.isRangerBase()) {
                specialGateCount ++;
            }

            if (index < 1) {
                preCp = cp;
                preNode = tmpNode;

                return;
            }


            if (preCp.getGate() != cp.getGate()) {
                graph.addLink(preNode, tmpNode);
            }

            if (preCp.getGate() == cp.getGate() && ( (mp.isEntrance() || mp.isRangerBase()) && specialGateCount % 2 == 0)) {

                graph.addLink(preNode, tmpNode);

                self.graphs.push(graph);

                graph = new SimpleGraph();
            }

            preNode = tmpNode;
        });


        if (graph.countNodes() > 0) { // for ones who never exit
            self.visits.push(graph);
        }

        let maxNodeCount = d3.max(self.graphs, function (g) {
           return g.countNodes();
        });

        if (maxNodeCount < 1) {
            maxNodeCount = 1;
        }

        this.options.nodeDistance = this.width / maxNodeCount;

        let graphCount = this.graphs.length < 1 ? 1 : this.graphs.length;

        this.options.graphDistance = this.height / graphCount;
        this.options.graphOffsetY = 20;
        this.options.graphOffsetX = 10;

        this.line = line;
    }



    render() {

        this.clear();

        let self = this;
        let nodeDistance = this.options.nodeDistance;
        let graphDistance = this.options.graphDistance;
        let graphOffsetY = this.options.graphOffsetY;
        let graphOffsetX = this.options.graphOffsetX;

        let visitSelection = self.svg.selectAll('.visit').data(this.graphs);

        let visits = visitSelection.enter().append('g').attr('class', 'graph');

        // setup position
        this.graphs.forEach(function (graph, gIndex) {
            let nodes = graph.getNodes();
            nodes.forEach(function (node, nIndex) {
                node.x = nIndex * nodeDistance + graphOffsetX;
                node.y = gIndex * graphDistance + graphOffsetY;
            });
        });

        visits.each(function (graph, gIndex) {

            let visitGroup = d3.select(this);



            // render links for graph
            let linkSelection = visitGroup.selectAll('.link-point').data(graph.getLinks());

            linkSelection.enter().append('line')
                .style('stroke-width', function (d) {
                    return 1;
                })
                .style("stroke", "black")
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; })
            ;

            linkSelection.exit().remove();

            // render nodes for graph
            let visitGroupSelection = visitGroup.selectAll('.node-point').data(graph.getNodes());

            visitGroupSelection.enter().append('circle')
                .attr('class', 'node-point')
                .attr("r", 10)
                .style("stroke-width", 1)
                .style("fill", function (d) {
                    return d.getData().getColor();
                })
                .attr("cx", function(d, nIndex) {
                    return d.x;
                })
                .attr("cy", function(d, nIndex) {
                    return d.y;
                })
            ;

            visitGroupSelection.exit().remove();

            let yearSelection =  visitGroup.selectAll('.node-time-label-year').data(graph.getNodes());

            yearSelection.enter().append('text')
                .attr('class', 'node-time-label-hour')
                .text(function (d) {
                    let cp = d.getData();
                    return formatDate(cp.getTime());
                })
                .attr("x", function(d) { return d.y - 130 ; })
                .attr("y", function (d, index) { return d.x + 5; })
                .attr("transform", "rotate(-90)")

            ;

            yearSelection.exit().remove();


            let timeSelection =  visitGroup.selectAll('.node-time-label-time').data(graph.getNodes());

            timeSelection.enter().append('text')
                .attr('class', 'node-time-label-hour')
                .text(function (d) {
                    let cp = d.getData();
                    return formatDateTime(cp.getTime(), '%H:%M:%S');
                })
                .attr("x", function(d) { return d.y - 23 ; })
                .attr("y", function (d, index) { return d.x + 5; })
                .attr("transform", "rotate(-90)")

            ;

            timeSelection.exit().remove();

        });
    }

    getCarId() {
        if (!!this.line) {
            return this.line.carId;
        }
    }

    hide() {

        mc1.controller.viewDivOption('heatMapStats');

    }

    show() {
        mc1.controller.viewDivOption('mySingleVisit');
    }

    clear() {
        this.svg.selectAll('*').remove();
    }
}
