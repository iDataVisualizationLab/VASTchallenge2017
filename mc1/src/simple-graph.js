'use strict';
class SimpleGraph {
    constructor() {
        this.nodeMap = {};
        this.linkMap = {};

        this.nodes = [];
        this.links = [];
    }

    /**
     *
     * @param node is a SimpleNode object
     */
    addNode(node) {

        let nodeId = node.getId();
        if ( !this.nodeMap.hasOwnProperty(nodeId)) {
            this.nodeMap[node.getId()] = node;
            this.nodes.push(node);
        }
    }

    /**
     *
     * @param fromNode is a SimpleNode object
     * @param toNode is a SimpleNode object
     */
    addLink(fromNode, toNode) {
        if (!this.nodeMap.hasOwnProperty(fromNode.getId()) || !this.nodeMap.hasOwnProperty(toNode.getId())) {
            throw new Error('Node has not been added');
        }

        let linkedId = fromNode.getId() + '-' + toNode.getId();
        let tmpLink;
        if (!this.linkMap.hasOwnProperty(linkedId)) {
            tmpLink =  new SimpleLink(this.links.length, fromNode, toNode, linkedId);
            this.linkMap[linkedId] = tmpLink;

            this.links.push(tmpLink);
        }

        tmpLink = this.linkMap[linkedId];
        tmpLink.increaseCount();

        return tmpLink;
    }

    getNodes() {
        return this.nodes;
    }

    getLinks() {
        return this.links;
    }

    countNodes() {
        return this.nodes.length;
    }
}


class SimpleNode {
    constructor(id, data, name) {
        this.id = id;
        this.data = data;
        this.name = name;
        this.count = 0;
        this.duration = 0; // hours
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

    getDuration() {
        return this.duration;
    }

    addDuration(duration) {
        this.duration += duration;

        return this;
    }

    setDuration(duration) {
        this.duration = duration;

        return this;
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

    getSource() {
        return this.source;
    }

    getTarget() {
        return this.target;
    }
}