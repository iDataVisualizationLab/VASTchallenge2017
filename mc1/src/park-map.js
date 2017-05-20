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

MapPoint.prototype.getLabel = function getLabel() {
    return this.label;
};

MapPoint.prototype.getPos = function getPos() {
    return this.pos;
};


var ParkMap = function ParkMap (byteData) {


    if (byteData.length % 4 != 0) {
        console.error("Invalid input data. Expect number of bytes divisible to 4");
        throw new Error('Invalid map byte data input');
    }

    this.mapPoints = [];

    let tmpPoint;
    let pos = 0;
    for(let i=0; i< byteData.length; i+=4) {
        tmpPoint = new MapPoint(pos, byteData[i], byteData[i+1], byteData[i+2], byteData[i+3]);
        this.mapPoints.push(tmpPoint);
        pos ++;
    }
};
