'use strict';
class VisitNetwork {

    constructor(divId, width, height, options) {

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
        
        this.init();
    }
    
    init() {
        this.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(10).strength(0.6))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(this.width / 2, this.height / 2))
            .force("collide",d3.forceCollide( function(d){return d.r + 5; }).iterations(16))
        ;

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

        let getNodeName = function (cp, index) {
            let mp = cp.getMapPoint();
            let nodeName = mp.getShortName();
            if (mp.isRangerBase()) {
                nodeName = nodeName + (((index + 1) % 2 == 0) ? '-1' : '-2');
            }
            else if (mp.isEntrance()) {
                nodeName = nodeName + (((index + 1) % 2 == 0) ? '-1' : '-2');
            }

            return nodeName;
        };

        visits.forEach(function (line) {
            paths = line.path;

            paths.forEach(function (cp, index) {

                gate = cp.getGate();

                nodeName = getNodeName(cp, index);

                if (!addedNodes.hasOwnProperty(nodeName)) {
                    tmpNode = new SimpleNode(self.nodes.length, cp.getMapPoint(), nodeName);
                    self.nodes.push(tmpNode);

                    addedNodes[nodeName] = tmpNode;
                }

                tmpNode = addedNodes[nodeName];
                tmpNode.increaseCount();

                if (index < 1) {
                    preCp = cp;

                    return;
                }

                if (preCp.getGate() == gate) {
                   preCp = cp;
                   return; // enter and exit immediately
                }

                preNodeName = getNodeName(preCp, index-1);
                preNode = addedNodes[preNodeName];

                linkName = preNodeName + '-' + nodeName;
                if (!addedLinks.hasOwnProperty(linkName)) {
                    tmpLink = new SimpleLink(self.links.length, preNode.getId(), tmpNode.getId(), linkName);
                    self.links.push(tmpLink);

                    addedLinks[linkName] = tmpLink;
                }

                tmpLink = addedLinks[linkName];
                tmpLink.increaseCount();

                preCp = cp;

            });
        });


        let radiusExtent = d3.extent(this.nodes, function (d) {
            return d.getCount();
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
            .attr('class', 'link')
            .style('stroke-width', function (d) {
                return self.linkThicknessScale(d.getCount());
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
                let r =  self.radiusScale(d.getCount());
                return d.r = r;
            })
            .style("fill", function (d) {
                return d.getData().getColor();
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
                .style("stroke-width", "1px")
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

class SimpleNode {
    constructor(id, data, name) {
        this.id = id;
        this.data = data;
        this.name = name;
        this.count = 0;
    }

    increaseCount() {
        this.count ++;
    }

    getCount() {
        return this.count;
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getData() {
        return this.data;
    }

    isStartingGate() {

        let isEntranceOrRangerBase = this.data.isEntrance() || this.data.isRangerBase();

        return isEntranceOrRangerBase && (this.name.charAt(this.name.length-1) == '1');
    }

    isEndingGate() {

        let isEntranceOrRangerBase = this.data.isEntrance() || this.data.isRangerBase();

        return isEntranceOrRangerBase && (this.name.charAt(this.name.length-1) == '2');
    }
}

class SimpleLink {
    constructor(id, source, target, name) {
        this.id = id;
        this.source = source;
        this.target = target;
        this.name = name;
        this.count = 0;
    }

    increaseCount() {
        this.count ++;
    }

    getCount() {
        return this.count;
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }
}