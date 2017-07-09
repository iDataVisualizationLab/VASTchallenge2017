'use strict';
class Controller {

    constructor(parser) {
        this.parser = parser;
    }

    viewMonth(month) {
        let data = this.parser.getOneMonthDataForChemical(month, 'Methylosmolene');

        let monthView = new ChemicalChart2D('sensorHeatMap', 720, 480, {timeChart: true});
        monthView.setData('Methylosmolene', data);
        monthView.render();
    }
}