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

    if (!!label) {
        this.label = label;
    }

    if (r == 255 && g == 255 && b == 255) {
        this.isRoad = true;
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

MapPoint.prototype.getLabel = function getLabel() {
    return this.label;
};

MapPoint.prototype.getPos = function getPos() {
    return this.pos;
};

MapPoint.prototype.getIsRoad = function getIsRoad() {
    return this.isRoad;
};

MapPoint.prototype.getRow = function getRow() {
    return this.row;
};

MapPoint.prototype.getColumn = function getColumn() {
    return this.column;
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
    for(let i=0; i< byteData.length; i+=4) {
        tmpPoint = new MapPoint(pos, byteData[i], byteData[i+1], byteData[i+2], byteData[i+3]);
        pos ++;
        rowItems.push(tmpPoint);

        if (rowItems.length == 200) {
            this.mapPoints.push(rowItems);
            rowItems = [];
        }
    }
};

MapPoint.prototype.getRawData = function () {
   return this.rawData;
};

/**
 * Find path from mapPoint1 to mapPoint2. It is considered no path found if there are more than one path exists in the solution.
 *
 * @param mapPoint1
 * @param mapPoint2
 */
MapPoint.prototype.findSinglePath = function findSinglePath(mapPoint1, mapPoint2) {

};

MapPoint.prototype.findAllPaths = function findAllPaths(mapPoint1, mapPoint2) {

};