'use strict';
class VisitNetwork extends BaseNetwork {

    constructor(divId, width, height, options, eventHandler) {

        super(divId, width, height, options, eventHandler);


        this.setupEvent();

    }

    setupEvent() {
        this.eventHandler.addEvent('brushEnd', this.refreshNetwork, this); // brush end then update this network
        this.eventHandler.addEvent('timeChange', this.refreshNetwork, this); // time change from everyday selection

    }

    setData(visits) {
        let self = this;
        let paths;

        this.nodes = [];
        this.links = [];

        let addedNodes = {};
        let addedLinks = {};

        let gate, nodeName, preNodeName, linkName;

        let preNode, tmpNode, tmpLink;
        let preCp;
        let tmpDuration;

        let passingCount;

        let getNodeName = function (cp, count) {
            let mp = cp.getMapPoint();
            let nodeName = mp.getShortName();
            if (mp.isRangerBase()) {
                nodeName = nodeName + ((count % 2 != 0) ? '1' : '2');
            }
            else if (mp.isEntrance()) {
                nodeName = nodeName + ((count % 2 != 0) ? '-1' : '-2');
            }

            return nodeName;
        };

        let tl;
        visits.forEach(function (line) {
            paths = line.path;

            passingCount = 0;

            paths.forEach(function (cp, index) {

                gate = cp.getGate();
                tl = line;
                if (cp.getMapPoint().isRangerBase() || cp.getMapPoint().isEntrance()) {
                    passingCount ++;
                }

                nodeName = getNodeName(cp, passingCount);

                if (!addedNodes.hasOwnProperty(nodeName)) {
                    tmpNode = new SimpleNode(self.nodes.length, cp.getMapPoint(), nodeName);
                    self.nodes.push(tmpNode);

                    addedNodes[nodeName] = tmpNode;
                }

                tmpNode = addedNodes[nodeName];
                tmpNode.increaseCount();

                if (index < 1) {
                    preCp = cp;
                    preNode = tmpNode;
                    return;
                }

                if (preCp.getGate() == gate) {
                    tmpDuration = cp.getTime().getTime() - preCp.getTime().getTime();
                    preCp = cp;

                    if (!preCp.getMapPoint().isEntrance() && !preCp.getMapPoint().isRangerBase() || ((preCp.getMapPoint().isEntrance() || preCp.getMapPoint().isRangerBase()) && passingCount % 2 == 0)) { // count duration if same gate. if entrance, must make sure it is from enter to exit; not from "away" period which is from exit to enter
                        tmpNode.addDuration(tmpDuration/ 3600000);

                        if (preCp.getMapPoint().isEntrance() || preCp.getMapPoint().isRangerBase()) {
                            preNode.setDuration(tmpNode.getDuration());
                        }

                    }

                    if (!preCp.getMapPoint().isEntrance() && !preCp.getMapPoint().isRangerBase() || ((preCp.getMapPoint().isEntrance() || preCp.getMapPoint().isRangerBase()) && passingCount == 1)) {
                        tmpDuration = 0;
                        preNode = tmpNode;

                        return; // enter and exit immediately; there is no link if inside the Preserve or this is "away" period
                    }
                    // add a link if this is entrance or ranger base
                }

                preNodeName = preNode.getName();
                // preNode = addedNodes[preNodeName];

                linkName = preNodeName + '-' + nodeName;
                if (!addedLinks.hasOwnProperty(linkName)) {
                    tmpLink = new SimpleLink(self.links.length, preNode.getId(), tmpNode.getId(), linkName);
                    self.links.push(tmpLink);

                    addedLinks[linkName] = tmpLink;
                }

                tmpLink = addedLinks[linkName];
                tmpLink.increaseCount();

                preCp = cp;
                preNode = tmpNode;

            });
        });


        let radiusExtent = d3.extent(this.nodes, function (d) {
            return d.getDuration();
        });

        this.radiusScale = d3.scaleLinear()
            .domain(radiusExtent)
            .range([self.options.nodeRadius, self.options.nodeRadius + 15])
        ;

        let thicknessExtent = d3.extent(this.links, function (d) {
            return d.getCount();
        });
        this.linkThicknessScale = d3.scaleLinear()
            .domain(thicknessExtent)
            .range([self.options.linkThickness, self.options.linkThickness + 10])
        ;

        let strokeExtent = d3.extent(this.nodes, function (d) {
            return d.getCount();
        });

        this.strokeWidthScale = d3.scaleLinear()
            .domain(strokeExtent)
            .range([0.5, self.options.nodeRadius/2])
        ;

    }

    refreshNetwork(e) {

        this.clear();
        this.createSimulation();

        let lines = mc1.parallel.getVisibleLines();

        this.setData(lines);

        this.render();
    }


    generateTooltipForNode(d) {
        return 'Pass Count: ' + d3.format(',')(d.getCount()) + '<br/> Stay Duration: ' + d3.format(',.3f')(d.getDuration()) + ' (hrs)';
    }

    generateTooltipForLink(link) {
        return "Count: " + link.getCount();
    }

    render() {
        let self=  this;
        let radius = self.options.nodeRadius;
        let startArea = 40;
        let endingArea = 40;

        // render link
        let linkSelection = this.linkGroup
            .selectAll(".link")
            .data(this.links)
            ;
        let link = linkSelection
            .enter().append("line")
            .attr('class', function (d) {
                return "link link-" + d.getName();
            })
            .style('stroke-width', function (d) {
                return self.linkThicknessScale(d.getCount());
            })
            .on('mouseover', function (d) {
                self.tooltip.render(self.generateTooltipForLink(d));
            })

            .on('mouseout', function (d) {
                self.tooltip.hide();
            })
        ;

        linkSelection.exit().remove();

        // render node - after link to make sure nodes ontop of links
        let nodeSelection = this.nodeGroup
            .selectAll(".node")
            .data(this.nodes)
            ;
        let node = nodeSelection
            .enter().append("circle")
            .attr('class', 'node')
            .attr("r", function (d) {
                return d.r = self.radiusScale(d.getDuration());
            })
            .style("stroke-width", function (d) {
                return self.strokeWidthScale(d.getCount());
            })
            .style("fill", function (d) {
                return d.getData().getColor();
            })
            .on('mouseover', function (d) {
                self.tooltip.render(self.generateTooltipForNode(d));
            })
            .on('mouseout', function (d) {
                self.tooltip.hide();
            })
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
        ;

        nodeSelection.exit().remove();

        // label nodes
        let labelSelection = this.nodeLabelGroup
            .selectAll(".node-label")
            .data(this.nodes)
        ;

        let label = labelSelection
            .enter().append("text")
            .attr('class', 'node-label')
            .text(function(d) {
                return d.getName();
            })
            .on('mouseover', function (d) {
                self.tooltip.render(self.generateTooltipForNode(d));
            })
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
        ;


        labelSelection.exit().remove();

        this.simulation
            .nodes(this.nodes)
            .on("tick", ticked);

        this.simulation.force("link")
            .links(this.links);

        function ticked() {

            node
            // .attr("r", 6)
            //     .style("fill", function (d) {
            //         return d.getData().getColor();
            //     })
                .style("stroke", "#969696")
                // .style("stroke-width", "1px")
                .attr("cx", function(d) {
                    let maxX = self.width - endingArea;
                    let minX = startArea;
                    if (d.isStartingGate()) {
                        maxX = startArea - radius;
                        minX = 0;
                    }
                    else if (d.isEndingGate()) {
                        maxX = self.width;
                        minX = self.width - endingArea;
                    }

                    return d.x = Math.max(minX + radius, Math.min(maxX - radius, d.x));
                })
                .attr("cy", function(d) {
                    return d.y = Math.max(radius, Math.min(self.height - radius, d.y));
                });

            link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });



            label
                .attr("x", function(d) { return d.x - self.options.nodeRadius / 2; })
                .attr("y", function (d) { return d.y + self.options.nodeRadius / 4; })
                .style("font-size", "12px").style("fill", "#4393c3");
        }

        function dragstarted(d) {
            if (!d3.event.active) self.simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) self.simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }

}