'use strict';
class SensorReadingParser {

    constructor(data) {
        let sensorReadings = [];
        let tmp;

        let dataMonths = {};

        let singleMonth, month, chemical, monthChemical;
        data.forEach(function (d) {
            tmp = new SensorReading(d["Chemical"], d["Monitor"], d["Date Time "], d["Reading"]);
            sensorReadings.push(tmp);
            month = tmp.getTime().getMonth();

            if (!dataMonths.hasOwnProperty(month)) {
                dataMonths[month] = {};
            }

            singleMonth = dataMonths[month];

            chemical = tmp.getChamical();
            if (!singleMonth.hasOwnProperty(chemical)) {
                singleMonth[chemical] = [];
            }

            monthChemical = singleMonth[chemical];

            monthChemical.push(tmp);

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

    getOneMonthDataForChemical(month, chemicalName) {
        let monthData =  this.dataMonths[month];
        if (!monthData) {
            return [];
        }

        return monthData[chemicalName];
    }
}