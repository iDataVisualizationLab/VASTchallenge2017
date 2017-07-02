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
            .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(30).strength(1))
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

        return options;
    }

    setData(visits) {
        let self = this;
        let paths;

        this.nodes = [];
        this.links = [];

        let addedNodes = {};
        let addedLinks = {};

        let gate, linkName;

        let preNode, tmpNode, tmpLink;
        let preCp;
        let maxRepeatedNode = 0, maxRepeatedLink = 0;

        visits.forEach(function (line) {
            paths = line.path;

            paths.forEach(function (cp, index) {

                gate = cp.getGate();

                if (!addedNodes.hasOwnProperty(gate)) {
                    tmpNode = new SimpleNode(self.nodes.length, cp.getMapPoint(), cp.getMapPoint().getShortName());
                    self.nodes.push(tmpNode);

                    addedNodes[gate] = tmpNode;
                }

                tmpNode = addedNodes[gate];
                tmpNode.increaseCount();

                if (tmpNode.getCount() > maxRepeatedNode) {
                    maxRepeatedNode = tmpNode.getCount();
                }

                if (index < 1) {
                    preCp = cp;

                    return;
                }

                if (preCp.getGate() == gate) {
                   if (!cp.getMapPoint().isEntrance()) {
                       tmpNode.increaseCount();
                   }

                   preCp = cp;
                    return; // enter and exit immediately
                }

                preNode = addedNodes[preCp.getGate()];

                linkName = preCp.getGate() + '-' + cp.getGate();
                if (!addedLinks.hasOwnProperty(linkName)) {
                    tmpLink = new SimpleLink(self.links.length, preNode.getId(), tmpNode.getId(), linkName);
                    self.links.push(tmpLink);

                    addedLinks[linkName] = tmpLink;
                }

                tmpLink = addedLinks[linkName];
                tmpLink.increaseCount();
                if (tmpLink.getCount() > maxRepeatedLink) {
                    maxRepeatedLink = tmpLink.getCount();
                }

                preCp = cp;

            });
        });

        this.maxRepeatedNodeCount = maxRepeatedNode;
        this.maxRepeatedLinkCount = maxRepeatedLink;

    }

    render() {
        let self=  this;
        // render link
        let link = this.linkGroup
            .selectAll(".link")
            .data(this.links)
            .enter().append("line")
            .attr('class', 'link')
        ;

        // render node - after link to make sure nodes ontop of links
        let node = this.nodeGroup
            .selectAll(".node")
            .data(this.nodes)
            .enter().append("circle")
            .attr('class', 'node')
            .attr("r", function (d) {
                return d.r = self.options.nodeRadius;
            })
        ;

        // label nodes
        let label = this.nodeLabelGroup
            .selectAll(".node-label")
            .data(this.nodes)
            .enter().append("text")
            .attr('class', 'node-label')
            .text(function(d) {
                return d.getName();
            });


        this.simulation
            .nodes(this.nodes)
            .on("tick", ticked);

        this.simulation.force("link")
            .links(this.links);

        function ticked() {
            link
                .attr("x1", function(d) { return d.source.cx; })
                .attr("y1", function(d) { return d.source.cy; })
                .attr("x2", function(d) { return d.target.cx; })
                .attr("y2", function(d) { return d.target.cy; });

            node
                // .attr("r", 6)
                .style("fill", function (d) {
                    return d.getData().getColor();
                })
                .style("stroke", "#969696")
                .style("stroke-width", "1px")
                .attr("cx", function (d) {
                    return d.cx = d.x + self.options.nodeRadius;
                })
                .attr("cy", function(d) {
                    return d.cy = d.y -self.options.nodeRadius;
                });

            label
                .attr("x", function(d) { return d.cx - self.options.nodeRadius / 2; })
                .attr("y", function (d) { return d.cy + self.options.nodeRadius / 4; })
                .style("font-size", "12px").style("fill", "#4393c3");
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