'use strict';
class SensorReadingParser {
    constructor(data) {
        let sensorReadings = [];
        let tmp;
        data.forEach(function (d) {
            tmp = new SensorReading(d["Chemical"], d["Monitor"], d["Date Time "], d["Reading"]);
            sensorReadings.push(tmp);
        });

        this.sensorReadings = sensorReadings;

    }

    getSensorReadings() {
        return this.sensorReadings;
    }
}