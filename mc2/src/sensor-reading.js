'use strict';
class SensorReading {
    constructor(chemical, sensor, time, reading) {

        let parseTime = d3.timeParse("%m/%d/%y %H:%M");
        this.chemical = chemical;
        this.sensor = +sensor;
        this.time = parseTime(time);
        this.reading = +reading;
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

}