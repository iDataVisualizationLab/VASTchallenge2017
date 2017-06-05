var EntranceGraph = function EntranceGraph (svg) {
    this.svg = svg;
};

EntranceGraph.prototype.render = function render (exitEntrance) {
    this.svg.selectAll('*').remove();

    this.svg.append('circle')
        .attr('cx', 20)
        .attr('cy', 20)
        .attr('r', 20)
        .attr('fill', '#FFF000')
    ;

};