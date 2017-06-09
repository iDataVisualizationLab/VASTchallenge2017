var CarPoint = function (mapPoint, time, velocity, path) {
  this.mapPoint = mapPoint;
  this.time = time;
  this.velocity = +velocity;
  this.path = path;
};

CarPoint.prototype.getMapPoint = function getMapPoint() {
    return this.mapPoint;
};

CarPoint.prototype.getTime = function getTime() {
    return this.time;
};

CarPoint.prototype.getGate = function getGate() {

    if (!!this.mapPoint) {
        return this.mapPoint.getName();
    }

    return '';
};

CarPoint.prototype.getVelocity = function getVelocity() {
    return this.velocity;
};

CarPoint.prototype.getPath = function getPath() {
    return this.path;
};


CarPoint.prototype.getColor = function getColor() {
    if (!!this.mapPoint) {
        return this.mapPoint.getColor();
    }

    return '#000';
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
    return new CarPoint(this.mapPoint, this.time, this.velocity, this.path);
};

