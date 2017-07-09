'use strict';
class SensorReadingParser {

    constructor(data) {
        let sensorReadings = [];
        let tmp;

        let dataMonths = {};

        let singleMonth, month;
        data.forEach(function (d) {
            tmp = new SensorReading(d["Chemical"], d["Monitor"], d["Date Time "], d["Reading"]);
            sensorReadings.push(tmp);
            month = tmp.getTime().getMonth();

            if (!dataMonths.hasOwnProperty(month)) {
                dataMonths[month] = [];
            }

            singleMonth = dataMonths[month];
            singleMonth.push(tmp);

        });

        this.sensorReadings = sensorReadings;
        this.dataMonths = dataMonths;

    }

    getSensorReadings() {
        return this.sensorReadings;
    }

    getDataMonths() {
        return this.dataMonths;
    }

    getOneMonthData(month) {
        return this.dataMonths[month];
    }
}