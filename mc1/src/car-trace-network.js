'use strict';
class CarTraceNetwork extends BaseNetwork {

    constructor(divId, width, height, options) {
        super(divId, width, height, options);

        this.parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");

        this.graphs = [];
    }

    setData(line) {

        let self = this;
        let paths = line.path;
        let preCp;

        let graph = new SimpleGraph();

        let mp;

        let specialGateCount = 0;
        let preNode, tmpNode;

        paths.forEach(function (cp, index) {


            tmpNode = new SimpleNode(visit.length, cp, cp.getGate());
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

            if (preCp.getGate() == cp.getGate() && ( (cp.isEntrance() || cp.isRangerBase()) && specialGateCount % 2 == 0)) {

                graph.addLink(preNode, tmpNode);

                self.graphs.push(graph);

                graph = new SimpleGraph();
            }

            preNode = tmpNode;
        });


        if (graph.countNodes() > 0) { // for ones who never exit
            self.visits.push(graph);
        }
    }

    render() {
        let self = this;

        let visitSelection = self.svg.selectAll('.visit').data(this.graphs);

        let visits = visitSelection.enter().append('g');

        visits.each(function (graph, index) {

            let visitGroup = d3.select(this);

            // render links for graph
            let linkSelection = visitGroup.selectAll('.link-point').data(graph.getLinks());

            linkSelection.enter().append('line');

            linkSelection.exit().remove();

            // render nodes for graph
            let visitGroupSelection = visitGroup.selectAll('.car-point').data(graph.getNodes());

            visitGroupSelection.enter().append('circle');

            visitGroupSelection.exit().remove();

        });
    }
}
