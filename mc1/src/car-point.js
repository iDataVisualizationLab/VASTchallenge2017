var CarPoint = function (mapPoint, time) {
  this.mapPoint = mapPoint;
  this.time = time;
};

CarPoint.prototype.getMapPoint = function getMapPoint() {
    return this.mapPoint;
};

CarPoint.prototype.getTime = function getTime() {
    return this.time;
};

CarPoint.prototype.getGate = function getGate() {
    return this.mapPoint.getName();
};

CarPoint.prototype.getColor = function getColor() {
    return this.mapPoint.getColor();
};

CarPoint.prototype.getTimeInMiliseconds = function getTimeInMiliseconds() {
    return this.time.getTime();
};

CarPoint.prototype.getFormattedTime = function getFormattedTime(formatTemplate) {
    var format = d3.timeFormat(!!formatTemplate ? formatTemplate : "%Y-%m-%d %H:%M:%S");

    return format(this.time);
};
