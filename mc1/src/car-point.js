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

CarPoint.prototype.getTimeInDayBySeconds = function getTimeInDayBySeconds() {
    return this.getHours()*3600 + this.getMinutes()*60 + this.getSeconds();
};

CarPoint.prototype.getTimeInDayAsString = function getTimeInDayAsString() {
    return this.getHours() + ':' + this.getMinutes() + ':' + this.getSeconds();
};

CarPoint.prototype.getHours = function getHours() {
    return this.time.getHours();
};

CarPoint.prototype.getMinutes = function getMinutes() {
    return this.time.getMinutes();
};

CarPoint.prototype.getSeconds = function getSeconds() {
    return this.time.getSeconds();
};

CarPoint.prototype.clone = function clone() {
    return new CarPoint(this.mapPoint, this.time);
};

