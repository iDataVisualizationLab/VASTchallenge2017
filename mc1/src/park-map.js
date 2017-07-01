/**
 * Object represents for each point in the map. It includes index position, R,G, B, alpha and label. The label is optional
 *
 * @param pos
 * @param r
 * @param g
 * @param b
 * @param alpha
 * @param name
 * @constructor
 */
var MapPoint = function MapPoint(pos, r, g, b, alpha, name) {
    this.pos = pos;
    this.r = r;
    this.g = g;
    this.b = b;

    if (!alpha && alpha != 0) {
        alpha = 1;
    }

    if (alpha > 1) {
        alpha = 1;
    }

    this.alpha = alpha;
    this.isRoad = false;
    this.row = Math.floor(pos / 200);
    this.column = Math.ceil(pos % 200);

   this.setColor();

    if (r == 255 && g == 255 && b == 255) {
        this.isRoad = true;
        this.color = MapPoint.ROAD_COLOR;
    }
    else if (!this.isRangerBase() && !this.isGate() && !this.isRangerStop() && !this.isCamping() && !this.isGeneralGate() && !this.getIsRoad() && !this.isEntrance()) {
        this.color = MapPoint.BACKGROUND;
    }

    if (!!name) {
        this.name = name;
    }

    this.stopCount = 0;
};

MapPoint.ROAD_COLOR = '#DDDDDD';
MapPoint.BACKGROUND = '#FFFFFF';

MapPoint.prototype.getR = function getR() {
    return this.r;
};

MapPoint.prototype.increaseStopCount = function increaseStopCount() {

    this.stopCount ++;

    return this;
};

MapPoint.prototype.resetStopCount = function resetStopCount() {

    this.stopCount = 0;

    return this;
};

MapPoint.prototype.getStopCount = function getStopCount() {

    return this.stopCount;
};


MapPoint.prototype.setR = function setR(r) {
    this.r = r;
};

MapPoint.prototype.getG = function getG() {
    return this.g;
};

MapPoint.prototype.setG = function setG(g) {
    this.g = g;
};

MapPoint.prototype.getB = function getB() {
    return this.b;
};

MapPoint.prototype.setB = function setB(b) {
    this.b = b;
};

MapPoint.prototype.getAlpha = function getAlpha() {
    return this.alpha;
};

MapPoint.prototype.setAlpha = function setAlpha(alpha) {
    this.alpha = alpha;
};

MapPoint.prototype.getColor = function getColor() {

    return this.color;
};

MapPoint.prototype.setColor = function setColor() {

    let componentToHex = function(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    };


    this.color =  "#" + componentToHex(this.r) + componentToHex(this.g) + componentToHex(this.b);
};

MapPoint.prototype.getLabel = function getLabel() {
    return this.label;
};

MapPoint.prototype.getName = function getName() {
    return this.name;
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

MapPoint.prototype.isRangerBase= function isRangerBase() {
    return this.color == '#ff00dc';
};

MapPoint.prototype.hasSensorLocated = function hasSensorLocated() {
    return this.isCamping() || this.isEntrance() || this.isRangerStop() || this.isGate() || this.isGeneralGate() || this.isRangerBase();
};

MapPoint.prototype.isVisiblePoint = function isVisiblePoint() {
    return this.hasSensorLocated() || this.getIsRoad();
};

MapPoint.prototype.setName = function setName(entranceIdx, gateIdx, generalGateIdx, rangeStopIdx, campingIdx) {

    let n = '';
    let l = '';
    if (this.isGate()) {
        n = 'gate' + gateIdx;
        l = 'Gate ' + gateIdx;

    }
    else if (this.isEntrance()) {
        n = 'entrance' + entranceIdx;
        l = 'entrance ' + entranceIdx;
    }
    else if (this.isGeneralGate()) {
        n = 'general-gate' + generalGateIdx;
        l = 'General-gate ' + generalGateIdx;

    }
    else if (this.isRangerStop()) {
        n = 'ranger-stop' + rangeStopIdx;
        l = 'Ranger-stop ' + rangeStopIdx;
    }
    else if (this.isCamping()) {
         let trueIndex;
        switch (campingIdx) {
            case 1:
                trueIndex = 8;
                break;
            case 2:
                trueIndex = 1;
                break;
            case 3:
                trueIndex = 2;
                break;
            case 4:
                trueIndex = 3;
                break;
            case 5:
                trueIndex = 4;
                break;
            case 6:
                trueIndex = 5;
                break;
            case 8:
                trueIndex = 6;
                break;
            default:
                trueIndex = campingIdx;
        }



        n = 'camping' + trueIndex;
        l = 'Camping ' + trueIndex;
    }
    else if (this.isRangerBase()) {
        n = 'ranger-base';
        l = 'Ranger-base ';
    }

    this.label = l;
    if (!this.name) {
        this.name = n;
    }
    else {
        console.error('name has been assigned manually');
    }
};

MapPoint.prototype.getLabel = function getLabel() {
    return this.label;
};

var ParkMap = function ParkMap (byteData, svg) {
    if (byteData.length % 4 != 0) {
        console.error("Invalid input data. Expect number of bytes divisible to 4");
        throw new Error('Invalid map byte data input');
    }

    this.mapPoints = []; // two dimensional array after the setup complete
    this.rawData = byteData;
    this.pointNameMapping = {};
    this.roadPoints = {};

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
        tmpPoint.setName(entranceIdx, gateIdx, generalGateIdx, rangerStopIdx, campingIdx);

        if (!!tmpPoint.getName()) {
            this.pointNameMapping[tmpPoint.getName()] = tmpPoint;
        }

        if (tmpPoint.getIsRoad()) {
            this.roadPoints[tmpPoint.getPos()] = tmpPoint;
        }

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

    this.svg = svg;
    this.carTrace = this.svg.append('g')
        .attr('class', 'car-trace-group')
        .attr('transform', 'translate(620, 15)')
    ;

    this.singleVisit = d3.select("#singleVisit")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
    ;

    this.tooltipGraph = this.singleVisit.append('svg')
        .attr('class', 'singleVisit-diagram')
        .attr('width', 200)
        .attr('height', 150)
    ;

    this.tooltip = new TooltipHelper('tooltip');

    // this.entranceGraph = new EntranceGraph(this.tooltipGraph);
};

ParkMap.CELL_WIDTH = 2;
ParkMap.CELL_HEIGHT = 2;
ParkMap.SPEED_LIMIT = 25;
ParkMap.CELL_WIDTH_IN_MILE = 0.06; // mile
ParkMap.SPEED_LIMIT_EXTRA_10 = 27.5;
ParkMap.TIME_RATIO = 10; // time in simulation multiplies with this number will get actual time


ParkMap.prototype.getSvg = function getSvg() {
    return this.svg;
};

ParkMap.prototype.getCarTraceContainer = function getCarTraceContainer() {
    return this.carTrace;
};

ParkMap.prototype.setupStopCountDomain = function setupStopCountDomain() {
    let mp;
    let min =100000, max = 0;
    let tmpStopCount;
    for(let k in this.pointNameMapping) {
        if (!this.pointNameMapping.hasOwnProperty(k)) {
            continue;
        }

        mp = this.pointNameMapping[k];
        tmpStopCount = mp.getStopCount();
        if (min > tmpStopCount) {
            min = tmpStopCount;
        }

        if (max < tmpStopCount) {
            max = tmpStopCount;
        }

    }
    this.cellScale = d3.scaleLinear()
        .range([ParkMap.CELL_WIDTH, 4*ParkMap.CELL_WIDTH])
        .domain([min, max])
    ;

    console.log("Min-Max cell visit count: min=" + min + ";max=" + max);
};

ParkMap.prototype.clearCarTrace = function clearCarTrace() {
    this.carTrace.selectAll('*').remove();
};


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

ParkMap.prototype.findSinglePathByName = function findSinglePath(fromName, toName) {
    let myGrid = this.grid.clone();

    let fromPoint = this.pointNameMapping[fromName];
    let toPoint = this.pointNameMapping[toName];

    if (!fromPoint || !toPoint) {
        throw new Error('Invalid name');
    }

    myGrid.setWalkableAt(fromPoint.getRow(), fromPoint.getColumn(), true);
    myGrid.setWalkableAt(toPoint.getRow(), toPoint.getColumn(), true);

    let paths = this.finder.findPath(fromPoint.getRow(), fromPoint.getColumn(), toPoint.getRow(), toPoint.getColumn(), myGrid);

    return this.convertPathToMapPoint(paths);
};

/**
 *
 * @param myPath array of MapPoint
 * @param color
 */
ParkMap.prototype.findThenHighLightPath = function findThenHighLightPath(myPath, color) {

    let startPoint;
    let endPoint;
    let steps;

    for(let i=0; i< myPath.length-1; i++) {
        startPoint = myPath[i];
        endPoint = myPath[i+1];

        steps = self.parkMap.findSinglePathByName(startPoint.getName(), endPoint.getName());
        this.highLightPath(steps, color);
    }
};

ParkMap.prototype.highLightPath = function highLightPath(myPath, color) {
    if (myPath.length < 1) {
        return;
    }

    this.svg.selectAll('.road-cell')
        .filter(function(cell) {
            let item;
            for(let i=1; i < myPath.length-1; i++) {
                item = myPath[i];
                if (cell.getPos() == item.getPos() && cell.getIsRoad()) {
                    return true;
                }
            }

            return false ;
        })
        .attr('fill', !!color ? color : '#990099')
    ;
};

ParkMap.prototype.highLightOneCell = function highLightOneCell(mapPoint, color) {
    if (!mapPoint.getIsRoad()) {
        return;
    }

    this.svg.select('.road-cell-' + mapPoint.getPos())
        .attr('fill', color)
    ;
};

ParkMap.prototype.clearRoad = function clearRoad() {

    this.svg.selectAll('.road-cell')
        .attr('fill', MapPoint.ROAD_COLOR)
    ;
};

/**
 * Highlight road point with merge color option if previously the point is filled with other color
 *
 * @param pos
 * @param color
 * @param alpha
 * @param mergedColor: true if we want to merge color
 */
ParkMap.prototype.highLightOneCellAtPos = function highLightOneCell(pos, color, alpha, mergedColor) {

    let roadPoint = this.roadPoints[pos];

    if (!roadPoint) {
        console.error('not a road point at: ' + pos);
        return;
    }

    if (alpha != 0 && !alpha) {
        alpha = 1;
    }

    let rgb2 = hexToRgb(color, alpha);

    if (!!mergedColor) {
        let rgb1 = [roadPoint.getR(), roadPoint.getG(), roadPoint.getB(), roadPoint.getAlpha()];
        let merged = mergeTwoRGBs(rgb1, rgb2);

        roadPoint.setR(merged[0]);
        roadPoint.setG(merged[1]);
        roadPoint.setB(merged[2]);
        roadPoint.setAlpha(merged[3]);
    }
    else {
        roadPoint.setR(rgb2[0]);
        roadPoint.setG(rgb2[1]);
        roadPoint.setB(rgb2[2]);
        roadPoint.setAlpha(alpha);

    }

    roadPoint.setColor();

    this.svg.select('.road-cell-' + pos)
        .attr('fill', roadPoint.getColor())
        .style('opacity', roadPoint.getAlpha())
    ;
};

ParkMap.prototype.clearOneCell = function clearOneCell(mapPoint) {
    if (!mapPoint.getIsRoad()) {
        return;
    }

    this.svg.select('.road-cell-' + mapPoint.getPos())
        .attr('fill', ParkMap.ROAD_COLOR)
    ;
};

/**
 * Clear a highlighted path to a road
 *
 * @param myPath
 */
ParkMap.prototype.clearPath = function highLightPath(myPath) {
    this.highLightPath(myPath, ParkMap.ROAD_COLOR);
};


ParkMap.prototype.getMapPoint = function getMapPoint(row, col) {

    if (row < 0 || row >= this.mapPoints.length) {
        throw new Error('Invalid row index');
    }

    let rowItems = this.mapPoints[row];
    if (col < 0 || col >= rowItems.length) {
        throw new Error('Invalid col index');
    }

    return rowItems[col];
};

ParkMap.prototype.getMapPointByName = function getMapPointByName(name) {
    return this.pointNameMapping[name];
};


ParkMap.prototype.convertPathToMapPoint = function getMapPoint(path) {

    let self = this;
    return path.map(function (coords) {
        if (coords.length != 2) {
            throw new Error('Invalid point coordinate. Require row amd col vaue');
        }
        return self.getMapPoint(coords[0], coords[1]);
    })
};

ParkMap.prototype.render = function render(showLabel) {

    if (showLabel) {
        let mySensorPlaces = [];
        this.mapPoints.forEach(function (rowItems) {
            rowItems.forEach(function (item) {
                if (item.hasSensorLocated()) {
                    mySensorPlaces.push(item);
                }
            })

        });

        this.svg.selectAll('.grid-label').data(mySensorPlaces).enter()
            .append('text')
            .attr('class', 'grid-label')
            .text(function (cell) {
                return cell.getLabel();
            })
            .attr('x', function (cell) {
                return ParkMap.CELL_WIDTH + ParkMap.CELL_WIDTH * cell.getColumn() - 25;

            })
            .attr("y", function (cell) {
                return ParkMap.CELL_HEIGHT + ParkMap.CELL_HEIGHT * cell.getRow() - 3;
            })
            .attr('fill', function (cell) {
                return cell.getColor();
            })
            .style("font-size", "9px")
        ;
    }

    let self = this;
   this.svg.selectAll('.grid-row').data(this.mapPoints).enter()
        .append('g')
        .attr("class", "grid-row")
            .each(function (rowItems, row_i) {

                rowItems = rowItems.filter(function (cell) {
                    return cell.isVisiblePoint();
                });
                d3.select(this).selectAll('.grid-cell').data(rowItems).enter()
                    .append('rect')
                    .attr('class', function (cell) {
                        let cls = 'grid-cell';
                        if (cell.getIsRoad()) {
                            cls += ' road-cell road-cell-' + cell.getPos();
                        }

                        if (cell.hasSensorLocated()) {
                            cls += ' sensor-cell sensor-cell-' + cell.getPos();
                        }

                        return cls;
                    })
                    .attr("x", function (item) {
                        return item.x = ParkMap.CELL_WIDTH + ParkMap.CELL_WIDTH * item.getColumn();
                    })
                    .attr("y", function (item) {
                        return item.y = ParkMap.CELL_HEIGHT + ParkMap.CELL_HEIGHT * row_i;
                    })
                    .attr("width", ParkMap.CELL_WIDTH)
                    .attr("height", ParkMap.CELL_HEIGHT)
                    .attr('fill', function (item) {
                        return item.getColor();
                    })
                    .on('mouseover', function (cell) {
                        self.tooltip.render(renderVisitCount(cell.getStopCount()), -15, 15);
                    })
                    .on('mouseout', function (cell) {
                        self.tooltip.hide();
                    })
                ;
            })

    ;

    // this.svg.selectAll('.sensor-cell')
    //     .filter(function (d) {
    //         return d.isEntrance();
    //     })
    //     .on("mouseover", function(d) {
    //
    //         // 1. Generate tree map
    //         self.entranceGraph.render(d);
    //
    //         // 2. Setting position of the visualization
    //         self.singleVisit.style("top", (event.pageY+10)+"px").style("left",(event.pageX+10)+"px");
    //
    //         // 3. Set visibility
    //         return self.singleVisit.style("visibility", "visible");
    //     })
    //     .on("mouseout", function(d) {
    //         return self.singleVisit.style("visibility", "hidden");
    //     })
    // ;
};

ParkMap.prototype.renderStopHeatMap = function renderStopHeatMap() {
    let self = this;
    this.svg.selectAll('.sensor-cell')
        // .filter(function (d) {
        //     return d.isEntrance();
        // })
        .attr("width", function (d) {

            let w = self.cellScale(d.getStopCount());
            return self.cellScale(d.getStopCount());
        })
        .attr("height", function (d) {
            return self.cellScale(d.getStopCount());
        })
    ;
};

ParkMap.prototype.resetStopCount = function resetStopCount() {

    let mp;
    for(let name in this.pointNameMapping) {
        if (!this.pointNameMapping.hasOwnProperty(name)) {
            continue;
        }

        mp = this.pointNameMapping[name];

        mp.resetStopCount();
    }
};

ParkMap.prototype.increaseStopCount = function increaseStopCount(gate) {

    let mp = this.pointNameMapping[gate];
    if (!!mp) {
        mp.increaseStopCount();

    }
};

ParkMap.prototype.resetStopCountForGate = function resetStopCountForGate(gate) {

    let mp = this.pointNameMapping[gate];
    if (!!mp) {
        mp.resetStopCount();
    }
};