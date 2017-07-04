'use strict';
class CarTraceNetwork extends BaseNetwork {

    constructor(divId, width, height, options) {
        super(divId, width, height, options);

        this.parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");

        this.graphs = [];
    }

    handleOptions(options) {

        options = super.handleOptions(options);

        options.margin.top = 5;
        options.margin.left = 100;
        options.margin.right = 50;
        options.graphDistance = 22;
        options.graphOffsetY = 20;
        options.graphOffsetX = 10;

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

            if (index < 1 || !preCp) {
                preCp = cp;
                preNode = tmpNode;

                return;
            }


            if (preCp.getGate() != cp.getGate()) {
                graph.addLink(preNode, tmpNode);

                if (mp.isEntrance() || mp.isRangerBase()) {
                    self.graphs.push(graph);
                    graph = new SimpleGraph();
                    preNode = null;
                    preCp = null;
                    specialGateCount = 0;
                    return;
                }
            }


            if (preCp.getGate() == cp.getGate() && ( (mp.isEntrance() || mp.isRangerBase()) && specialGateCount % 2 == 0)) {

                graph.addLink(preNode, tmpNode);

                self.graphs.push(graph);

                graph = new SimpleGraph();
            }
            else if (preCp.getGate() != cp.getGate() || (preCp.getGate() == cp.getGate() && !mp.isRangerBase() && !mp.isEntrance())) {
                graph.addLink(preNode, tmpNode);
            }

            preNode = tmpNode;
            preCp = cp;

        });


        if (graph.countNodes() > 0) { // for ones who never exit
            self.graphs.push(graph);
        }

        let maxNodeCount = d3.max(self.graphs, function (g) {
           return g.countNodes();
        });

        if (maxNodeCount < 1) {
            maxNodeCount = 1;
        }

        let nodeDistance = this.width / maxNodeCount;
        if (nodeDistance > 130) {
            nodeDistance = 130;
        }
        this.options.nodeDistance = nodeDistance;

        // let graphCount = this.graphs.length < 1 ? 1 : this.graphs.length;
        // let graphDistance = this.height / graphCount;



        this.line = line;
    }

    handleMouseOverNode(d) {

        let self = this;
        let cp = d.getData();

        self.tooltip.render("Gate: " + cp.getGate() + "</br>Time: " + formatDateTime(cp.getTime()));
    }

    handleMouseOverLink(link) {

        let self = this;
        let sourceTime = link.getSource().getData().getTime();
        let targetTime = link.getTarget().getData().getTime();

        let duration = (targetTime.getTime() - sourceTime.getTime()) / 3600000
        let formatTime = d3.format(',.3f');

        self.tooltip.render("Duration: " + formatTime(duration));
    }

    render() {

        this.clear();

        let self = this;
        let nodeDistance = this.options.nodeDistance;
        let graphDistance = this.options.graphDistance;
        let graphOffsetY = self.options.margin.top + this.options.graphOffsetY;
        let graphOffsetX = this.options.graphOffsetX;

        let visitSelection = self.svg.selectAll('.visit').data(this.graphs);

        let visits = visitSelection.enter().append('g').attr('class', 'graph');

        this.svg.append('text')
            .text('Car: ' + this.line.carId + ' (Type: ' + this.line.carType + ')')
            .attr("x", 0)
            .attr("y", self.options.margin.top + 2)
            .style("font-size", "14px")
        ;
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
                .style("stroke-dasharray", function (l) {

                    let sourceMp = l.getSource().getData().getMapPoint();
                    let targetMp = l.getTarget().getData().getMapPoint();

                    return sourceMp.getName() == targetMp.getName() && !sourceMp.isRangerBase() && !sourceMp.isEntrance() ? ("3, 3") : null;
                })
                .on('mouseover', function (l) {
                    self.handleMouseOverLink(l);
                })
                .on('mouseout', function (d) {
                    self.tooltip.hide();
                })
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
                .on('mouseover', function (d) {
                    self.handleMouseOverNode(d);
                })
                .on('mouseout', function (d) {
                    self.tooltip.hide();
                })

            ;

            visitGroupSelection.exit().remove();


            let firstNode = graph.getFirstNode();
            let firstNodeTime = firstNode.getData().getTime();

            visitGroup.append('text')
                    .text( formatDateTime(firstNodeTime, '%a %b %d'))
                    .attr("x", firstNode.x - 13)
                    .attr("y", firstNode.y - 4)
                    .style("font-size", "12px")
                    .style("text-anchor", "end")
                .attr('class', isWeekend(firstNodeTime) ? 'weekend-text' : '')

            ;
            visitGroup.append('text')
                .text( formatDateTime(firstNodeTime, '%H:%M:%S'))
                .attr("x", firstNode.x - 13)
                .attr("y", firstNode.y + 7)
                .style("font-size", "12px")
                .style("text-anchor", "end")
                .attr('class', isWeekend(firstNodeTime) ? 'weekend-text' : '')

            ;
            firstNode = null;
            firstNodeTime = null;

            let lastNode = graph.getLastNode();
            let lastNodeTime = lastNode.getData().getTime();

            visitGroup.append('text')
                .text( formatDateTime(lastNodeTime, '%a %b %d'))
                .attr("x", lastNode.x + 13)
                .attr("y", lastNode.y - 4)
                .style("font-size", "12px")
                .attr('class', isWeekend(lastNodeTime) ? 'weekend-text' : '')
            ;
            visitGroup.append('text')
                .text( formatDateTime(lastNodeTime, '%H:%M:%S'))
                .attr("x", lastNode.x + 13)
                .attr("y", lastNode.y + 7)
                .style("font-size", "12px")
                .attr('class', isWeekend(lastNodeTime) ? 'weekend-text' : '')
            ;

            lastNode = null;
            lastNodeTime = null;


            let gateSelection =  visitGroup.selectAll('.node-label').data(graph.getNodes());
            gateSelection.enter().append('text')
                .attr('class', 'node-label')
                .text(function (d) {
                    let cp = d.getData();
                    return cp.getMapPoint().getShortName();
                })
                .attr("x", function(d) { return d.x - 6; })
                .attr("y", function (d) { return d.y + 3; })
                .style("font-size", "11px")
                .on('mouseover', function (d) {
                    self.handleMouseOverNode(d);
                })
                .on('mouseout', function (d) {
                    self.tooltip.hide();
                })


            ;

            gateSelection.exit().remove();


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
