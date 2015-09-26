var margin_timeline = {top: 20, right: 20, bottom: 30, left: 60},
    width_timeline = 1010 - margin_timeline.left - margin_timeline.right,
    height_timeline = 90 - margin_timeline.top - margin_timeline.bottom;

// var formatPercent = d3.format(".0%");

// var color = d3.scale.linear()
//   .range(["#ca0020","#f4a582","#f7f7f7","#92c5de","#0571b0"])
//   .domain([0,0.2,0.4,0.6,0.8]);
var y0 = d3.scale.ordinal()
    .rangeRoundBands([height_timeline, 0], .2);

var x_timeline = d3.scale.ordinal()
  .rangeRoundBands([0, width_timeline], 0.1);

var y_timeline = d3.scale.linear()
    .range([height_timeline, 0]);

var xAxis_timeline = d3.svg.axis()
    .scale(x_timeline)
    .orient("bottom");

var yAxis_timeline = d3.svg.axis()
    .scale(y_timeline)
    .orient("left")
    .tickFormat(d3.format(".0%"));

// csv loaded asynchronously
d3.csv("data/foods_t.csv", type, function(data) {

  // Data is nested by season
  var foods = d3.nest()
      .key(function(d) { return d.season; })
      .entries(data);

  y0.domain(foods.map(function(d) { return d.key; }));

  // Compute the minimum and maximum year and percent across symbols.
  x_timeline.domain(data.map(function(d) { return d.year; }));
  y_timeline.domain([0, d3.max(foods, function(s) { return s.values[0].percent; })]);

  // Add an svg_timeline element for each season, with the desired dimensions and margin_timeline.
  var svg_timeline = d3.select("#seasonal").append("svg")
    .data(foods)
  .enter().append("svg")
    .attr("width", width_timeline + margin_timeline.left + margin_timeline.right)
    .attr("height", height_timeline + margin_timeline.top + margin_timeline.bottom)
  .append("g")
    .attr("transform", "translate(" + margin_timeline.left + "," + margin_timeline.top + ")");

  svg_timeline.filter(function(d, i) { return !i; }).append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + y0.rangeBand() + ")")
      .call(xAxis_timeline)
    .selectAll("text")
      .attr("y", 0)
      .attr("x", 9)
      .attr("dy", ".35em")
      .attr("transform", "rotate(65)")
      .style("text-anchor", "start");

  // svg_timeline.append("g")
  //   .attr("class", "y axis")
  //   .call(yAxis);

  svg_timeline.append("g")
    .append("text")
    .attr("x", width_timeline - 10)
    .attr("y", height_timeline - 12)
    .attr("dy", ".71em")
    .attr("text-anchor", "end")
    .attr("font-size", "1.1em")
    .text(function(d) { return d.key; });

  svg_timeline.selectAll(".bar")
      .data(function(d) {return d.values;})
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x_timeline(d.year); })
      .attr("width", x_timeline.rangeBand())
      .attr("y", function(d) { return y_timeline(d.percent); })
      .attr("height", function(d) { return height_timeline - y_timeline(d.percent); })
      .attr("fill", "steelblue");

  svg_timeline.selectAll(".bar")
    .append("text")
    .attr("class","bar-label")
    .text(function(d) { return d.percent; });

});

function type(d) {
  d.percent = +d.percent;
  return d;
}
