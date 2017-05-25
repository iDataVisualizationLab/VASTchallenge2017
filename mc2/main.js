var svg = d3.select("svg"),
    margin = {top: 20, right: 150, bottom: 30, left: 50},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var parseTime = d3.timeParse("%m/%d/%Y %H:%M");

var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

var line = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return xx(d.date); })
    .y(function(d) { 
        if(d.Reading<1.5){
           var val  = d.Reading * 1;
            return y(val);
        }
        else
        return y(d.Reading);
     });
var chems = ["Appluimonia","Chlorodinine","Methylosmolene","AGOC-3A"];

var varChems = [];
for(i=1;i<10;i++){
  for(j=0;j<4;j++){
    var id = chems[j]+ "_sensor" + i;
    varChems.push(id);
  }
}
var minDate = parseTime("4/1/16 00:00");
var maxDate = parseTime("3/31/17 00:00");

var chemicalsData = [];
d3.csv("data/sensorData.csv", function(error, data) {
  if (error) throw error;

   data.forEach(function(d) {
      d.date = parseTime(d["Date Time "]);
  });

  console.log(data);

  var chemicals = varChems.map(function(id) {
    return {
      id: id,
      values: data.map(function(d) {
         // && d.date.getMonth() == 3
         var n = id.indexOf("_");
         var l = id.length;
         // console.log(id.substring(l-1, l))
        if(d.Chemical == id.substring(0, n) && d.Monitor == id.substring(l-1, l))
            return {date: d.date, Reading: d.Reading};
        else
            return 0;
      })
    };
  });
console.log(chemicals)
 for(i=0;i<chemicals.length;i++){
    var obj = {};
    obj.id = chemicals[i].id;
    obj.values = chemicals[i].values.filter(function(d){
        if(d!=0){
            return d;
        }
    });
    chemicalsData.push(obj);
}
console.log(chemicalsData)
console.log([minDate, maxDate])
  // x.domain(d3.extent(data, function(d) { return d.date; }));
  x.domain([minDate, maxDate]);
  console.log(d3.extent(data, function(d) { return d.date; }))

  y.domain([
    d3.min(chemicalsData, function(c) { return d3.min(c.values, function(d) { return d.Reading; }); }),
    d3.max(chemicalsData, function(c) { return d3.max(c.values, function(d) { return d.Reading; }); })
  ]);

  z.domain(chemicalsData.map(function(c) { return c.id; }));

var tickLabels = ["April","","","","August","","","","December"];
  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(12).tickFormat(function(d,i){ return tickLabels[i] }));

  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("Reading");

  var chemical = g.selectAll(".chemical")
    .data(chemicalsData)
    .enter().append("g")
      .attr("class", "chemical")
      .attr("id", function(d,i){
        // console.log(d);
        return d.id;
      })



   
console.log(parseTime("8/01/16 01:00") +" here "+ x(parseTime("8/1/16 01:00")));
      
    chemical.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d,i) { return z(i); })
      .style("stroke-width", 1);

  chemical.append("text")
      .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + xx(d.value.date) + "," + y(d.value.Reading) + ")"; })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .text(function(d) { return d.id; })
      .style("fill", function(d,i) { return z(i); });

      d3.selectAll(".sensor_selection").on("change",sensorData);
      d3.selectAll(".chemical_selection").on("change",sensorData);
});

function xx(date2){
    var m = date2.getMonth();
    if (m==3)
        return x(date2)*4;  
    else if (m==4 || m==5 || m==6){
        return x(parseTime("7/31/16 23:00"));
    }
    else if (m==7)
        return x(parseTime("8/01/16 00:00"))+ (x(date2)-x(parseTime("8/01/16 00:00")))*4;
    else if (m==8 || m==9 || m==10){
        return x(parseTime("11/30/16 23:00"));
    }
    else if (m==11)
        return x(parseTime("12/01/16 00:00"))+ (x(date2)-x(parseTime("12/01/16 00:00")))*4;

    return x(date2);
}
function sensorData(d){  
  var id = this.id.substring(1,2);
  for(i=0;i<36;i++){
    var l = varChems[i].length;
    var sensorId = varChems[i].substring(l-1,l);
    var n = varChems[i].indexOf("_");
    // console.log(varChems[i].substring(0,n))
      if(document.getElementById("S"+sensorId).checked && document.getElementById(varChems[i].substring(0,n)).checked){
        // console.log(document.getElementById("S"+sensorId) + " " + varChems[i].substring(0,n))
        document.getElementById(varChems[i]).style.display = "";
      }
      else
        document.getElementById(varChems[i]).style.display = "none";

  }
}

$(document).ready(function() {
  $('#checkall').click(function() {
    var checked = $(this).prop('checked');
    $('#sensorOptions').find('input:checkbox').prop('checked', checked);
  });
})
$(document).ready(function() {
  $('#checkallChems').click(function() {
    var checked = $(this).prop('checked');
    $('#chemicalOptions').find('input:checkbox').prop('checked', checked);
  });
})
