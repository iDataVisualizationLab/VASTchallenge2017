/**
 * Object represents for each point in the map. It includes index position, R,G, B, alpha and label. The label is optional
 *
 * @param pos
 * @param r
 * @param g
 * @param b
 * @param alpha
 * @param label
 * @constructor
 */
var MapPoint = function MapPoint(pos, r, g, b, alpha, label) {
    this.pos = pos;
    this.r = r;
    this.g = g;
    this.b = b;
    this.alpha = alpha;
    this.isRoad = false;
    this.row = Math.floor(pos / 200);
    this.column = Math.ceil(pos % 200);

    let componentToHex = function(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    };


    this.color =  "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    if (r == 255 && g == 255 && b == 255) {
        this.isRoad = true;
    }

    if (!!label) {
        this.label = label;
    }
};

MapPoint.prototype.getR = function getR() {
    return this.r;
};

MapPoint.prototype.getG = function getG() {
    return this.g;
};

MapPoint.prototype.getB = function getB() {
    return this.b;
};

MapPoint.prototype.getColor = function getColor() {
    return this.color;
};

MapPoint.prototype.getLabel = function getLabel() {
    return this.label;
};

MapPoint.prototype.getPos = function getPos() {
    return this.pos;
};

MapPoint.prototype.getIsRoad = function getIsRoad() {
    return this.isRoad == true;
};

MapPoint.prototype.getRow = function getRow() {
    return this.row;
};

MapPoint.prototype.getColumn = function getColumn() {
    return this.column;
};

MapPoint.prototype.isGate = function isGate() {
    return this.color == '#ff0000';
};

MapPoint.prototype.isEntrance = function isEntrance() {
    return this.color == '#4cff00';
};

MapPoint.prototype.isGeneralGate = function isGeneralGate() {
    return this.color == '#00ffff';
};

MapPoint.prototype.isRangerStop = function isRangerStop() {
    return this.color == '#ffd800';
};

MapPoint.prototype.isCamping= function isCamping() {
    return this.color == '#ff6a00';
};

MapPoint.prototype.setLabel= function setLabel(entranceIdx, gateIdx, generalGateIdx, rangeStopIdx, campingIdx) {

    let l = '';
    if (this.isGate()) {
        l = 'gate' + gateIdx;

    }
    else if (this.isEntrance()) {
        l = 'entrance' + entranceIdx;
    }
    else if (this.isGeneralGate()) {
        l = 'general-gate' + generalGateIdx;

    }
    else if (this.isRangerStop()) {
        l = 'ranger-stop' + rangeStopIdx;
    }
    else if (this.isCamping()) {
        l = 'camping' + campingIdx;
    }

    if (!this.label) {
        this.label = l;
    }
    else {
        console.error('label has been assigned manually');
    }
};

var ParkMap = function ParkMap (byteData) {
    if (byteData.length % 4 != 0) {
        console.error("Invalid input data. Expect number of bytes divisible to 4");
        throw new Error('Invalid map byte data input');
    }

    this.mapPoints = []; // two dimensional array after the setup complete
    this.rawData = byteData;

    let tmpPoint;
    let pos = 0;
    let rowItems = [];
    let entranceIdx = 0,
        gateIdx = 0,
        generalGateIdx = 0,
        rangerStopIdx = 0,
        campingIdx = 0
        ;

    for(let i=0; i< byteData.length; i+=4) {
        tmpPoint = new MapPoint(pos, byteData[i], byteData[i+1], byteData[i+2], byteData[i+3]);
        tmpPoint.setLabel(entranceIdx, gateIdx, generalGateIdx, rangerStopIdx, campingIdx);
        if (tmpPoint.isEntrance()) {
            entranceIdx ++;
        }
        else if (tmpPoint.isGate()) {
            gateIdx ++;
        }
        else if (tmpPoint.isGeneralGate()) {
            generalGateIdx ++;
        }
        else if (tmpPoint.isRangerStop()) {
            rangerStopIdx ++;
        }
        else if (tmpPoint.isCamping()) {
            campingIdx ++;
        }

        pos ++;
        rowItems.push(tmpPoint);

        if (rowItems.length == 200) {
            this.mapPoints.push(rowItems);
            rowItems = [];
        }
    }

    if (this.mapPoints.length != 200) {
        console.error("Invalid input map data. Expect 200x200 grid pixel in the map");
        throw new Error("Invalid input map data. Expect 200x200 grid pixel in the map");
    }

    this.grid = new PF.Grid(200, 200);
    let self = this;
    this.mapPoints.forEach(function (cols, row) {
       cols.forEach(function (mp, col) {
           self.grid.setWalkableAt(row, col, mp.getIsRoad());
       })
    });

    this.finder = new PF.AStarFinder();

    this.labelMapping = {};
};

ParkMap.CELL_WIDTH = 5;
ParkMap.CELL_HEIGHT = 5;

ParkMap.prototype.getRawData = function () {
   return this.rawData;
};

/**
 * Find path from mapPoint1 to mapPoint2. It is considered no path found if there are more than one path exists in the solution.
 * @param row1
 * @param col1
 * @param row2
 * @param col2
 * @return {Array.<Array.<number>>}
 */
ParkMap.prototype.findSinglePath = function findSinglePath(row1, col1, row2, col2) {
    let myGrid = this.grid.clone();

    return this.finder.findPath(row1, col1, row2, col2, myGrid);
};

ParkMap.prototype.findAllPaths = function findAllPaths(mapPoint1, mapPoint2) {

};

ParkMap.prototype.render = function render(svg) {

    let self = this;
   svg.selectAll('.grid-row').data(this.mapPoints).enter()
        .append('g')
        .attr("class", "grid-row")
            .each(function (rowItems, row_i) {
                d3.select(this).selectAll('.grid-cell').data(rowItems).enter()
                    .append('rect')
                    .attr('class', 'grid-cell')
                    .attr("x", function (item, col) {
                        return ParkMap.CELL_WIDTH + ParkMap.CELL_WIDTH * col;
                    })
                    .attr("y", function (item, col) {
                        return ParkMap.CELL_HEIGHT + ParkMap.CELL_HEIGHT * row_i;
                    })
                    .attr("width", ParkMap.CELL_WIDTH)
                    .attr("height", ParkMap.CELL_HEIGHT)
                    .attr('fill', function (item) {
                        return item.getColor();
                    })
                    .on('click', function (cell) {

                        self.labelMapping[cell.getPos()] = "";
                        debugger;
                    })
                ;
            })

    ;
};