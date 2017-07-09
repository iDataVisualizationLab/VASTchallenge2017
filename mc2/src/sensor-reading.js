'use strict';
class SensorReading {
    constructor(chemical, sensor, time, reading) {

        let parseTime = d3.timeParse("%m/%d/%y %H:%M");
        let tmpTime;
        this.chemical = chemical;
        this.sensor = +sensor;

        tmpTime = parseTime(time);
        this.time = !!tmpTime ? tmpTime : time;
        this.reading = +reading;
        this.labelTime = formatDateTime(this.time);
    }

    getChamical() {
        return this.chemical;
    }

    getSensor() {
        return this.sensor;
    }

    getTime() {
        return this.time;
    }

    getReading() {
        return this.reading;
    }

    getLabelTime() {
        return this.labelTime;
    }

}