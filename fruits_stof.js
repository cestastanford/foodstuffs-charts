var legend_width = 120;

var margin = {top: 20, right: 20, bottom: 30, left: 60},
    width = 860 - margin.left - margin.right+legend_width,
    height = 500 - margin.top - margin.bottom,
    time_chart_height = 150 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var yAbsolute = d3.scale.linear() // for absolute scale
    .rangeRound([height, 0]);

var yRelative = d3.scale.linear() // for absolute scale
      .rangeRound([height, 0]);

var color = d3.scale.ordinal()
    .range(["#1f77b4","#aec7e8","#ff7f0e","#ffbb78","#2ca02c","#98df8a","#d62728","#ff9896","#9467bd","#c5b0d5","#8c564b","#c49c94","#e377c2","#f7b6d2","#7f7f7f","#c7c7c7","#bcbd22","#dbdb8d","#17becf","#9edae5","#393b79","#5254a3","#6b6ecf","#9c9ede","#637939","#8ca252","#b5cf6b","#cedb9c","#8c6d31","#bd9e39","#e7ba52","#e7cb94","#843c39","#ad494a","#d6616b","#e7969c","#7b4173","#a55194","#ce6dbd","#de9ed6"]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxisRelative = d3.svg.axis()
    .scale(yRelative)
    .orient("left")
    .tickFormat(d3.format(".1%"));

var yAxisAbsolute = d3.svg.axis()
      .scale(yAbsolute)
      .orient("left")
      .tickFormat(d3.format(".2s"));


var svg = d3.select("#mainchart").append("svg")
    .attr("width", width + margin.left + margin.right+legend_width)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data/fruits_stof_transformed.csv", function(error, data) {
  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

  data.forEach(function(d) {
  var myfoods = d.date;
    var y0 = 0;
  d.foods = color.domain().map(function(name) { return {myfoods:myfoods, name: name, y0: y0, y1: y0 += +d[name]}; });

    d.total = d.foods[d.foods.length - 1].y1;// the last row
  d.pct = [];

  for (var i=0;i <d.foods.length;i ++ ){

    var y_coordinate = +d.foods[i].y1/d.total;
      var y_height1 = (d.foods[i].y1)/d.total;
    var y_height0 = (d.foods[i].y0)/d.total;
    var y_pct = y_height1 - y_height0;
    d.pct.push({
      y_coordinate: y_coordinate,
      y_height1: y_height1,
      y_height0: y_height0,
      name: d.foods[i].name,
      myfoods: d.date,
      y_pct: y_pct

    });


  }


  });



  data.sort(function(a, b) { return a.date - b.date; });


  x.domain(data.map(function(d) { return d.date; }));
  yAbsolute.domain([0, d3.max(data, function(d) { return d.total; })]);//Absolute View scale
  yRelative.domain([0,1])// Relative View domain

  var absoluteView = false // define a boolean variable, true is absolute view, false is relative view
                // Initial view is absolute

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll("text")
      .attr("y", 0)
      .attr("x", 9)
      .attr("dy", ".35em")
      .attr("transform", "rotate(90)")
      .style("text-anchor", "start");


//Define the rect of Relative


  var stateRelative = svg.selectAll(".relative")
      .data(data)
    .enter().append("g")
      .attr("class", "relative")
      .attr("transform", function(d) {
    return "translate(" + "0 "+ ",0)";

  });



  stateRelative.selectAll("rect")
  .data(function(d) {
    return d.pct;
  })
  .enter().append("rect")
  .attr("width", x.rangeBand())
  .attr("y", function(d) {
    return yRelative(d.y_coordinate);
  })
  .attr("x",function(d) {return x(d.myfoods)})
  .attr("height", function(d) {
    return yRelative(d.y_height0) - yRelative(d.y_height1); //distance
  })
  .attr("fill", function(d){return color(d.name)})
  .attr("stroke","pink")
  .attr("stroke-width",0.2)
  .attr("id",function(d) {return d.myfoods})
  .attr("class","relative")
  .attr("id",function(d) {return d.myfoods})
  .style("pointer-events","all");


  stateRelative.selectAll("rect")
    .on("mouseover", function(d){
       if(!absoluteView){
        var xPos = parseFloat(d3.select(this).attr("x"));
        var yPos = parseFloat(d3.select(this).attr("y"));
        var height = parseFloat(d3.select(this).attr("height"))

        d3.select(this).attr("stroke","blue").attr("stroke-width",0.8);

        svg.append("text")
          .attr("x",xPos)
          .attr("y",yPos +height/2)
          .attr("class","tooltip")
          .text(Math.floor(d.y_pct.toFixed(2)*100) + "% of " + d.myfoods );

      }
    })
    .on("mouseout",function(){
      svg.select(".tooltip").remove();
      d3.select(this).attr("stroke","pink").attr("stroke-width",0.2);

    })


// End of define rect of relative



// define rect for absolute


  var stateAbsolute= svg.selectAll(".absolute")
            .data(data)
              .enter().append("g")
              .attr("class", "absolute")
              .attr("transform", function(d) { return "translate(" + "0" + ",0)"; });



  stateAbsolute.selectAll("rect")
          .data(function(d) { return d.foods})
          .enter().append("rect")
          .attr("width", x.rangeBand())
          .attr("y", function(d) {

            return yAbsolute(d.y1);
        })
          .attr("x",function(d) {
            return x(d.myfoods)
        })
          .attr("height", function(d) {
            return yAbsolute(d.y0) - yAbsolute(d.y1);
            })
          .attr("fill", function(d){
            return color(d.name)
            })
        .attr("id",function(d) {
            return d.myfoods
        })
        .attr("class","absolute")
        .style("pointer-events","all")
        .attr("opacity",0); // initially it is invisible, i.e. start with Absolute View



  //define two different scales, but one of them will always be hidden.
         svg.append("g")
               .attr("class", "y axis absolute")
               .call(yAxisAbsolute)
             .append("text")
               .attr("transform", "rotate(-90)")
               .attr("y", 6)
               .attr("dy", ".71em")
               .style("text-anchor", "end")
               .text("Amount");

          svg.append("g")
              .attr("class", "y axis relative")
              .call(yAxisRelative)
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Amount");

      svg.select(".y.axis.absolute").style("opacity",0);


        // end of define absolute


// adding legend
        var legend = svg.selectAll(".legend")
                  .data(color.domain().slice().reverse())
                 .enter().append("g")
                  .attr("class", "legend")
                   .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      legend.append("rect")
              .attr("x", width - 18+legend_width)
          .attr("width", 18)
             .attr("height", 18)
             .attr("fill", color);

      legend.append("text")
          .attr("x", width - 24+legend_width)
           .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
           .text(function(d) { return d; });



  var clickButton = svg.selectAll(".clickButton")
              .data([30,30])
              .enter().append("g")
              .attr("class","clickButton")
               .attr("transform","translate(0," + 180 +")");


    clickButton.append("text")
                 .attr("x", width + 80)
              .attr("y", 290)
               .attr("dy", ".35em")
                .style("text-anchor", "end")
               .text("Switch View")
          .style("text-decoration", "underline")
          .style("font-size", "16px")
          .attr("fill","blue")
          .attr("id","clickChangeView") ;


    // start with relative view
    Transition2Relative();


    // Switch view on click the clickButton
    d3.selectAll("#"+ "clickChangeView")
    .on("click",function(){

      if(absoluteView){ // absolute, otherwise relative
        Transition2Relative();
      } else {
        Transition2Absolute();
      }
      absoluteView = !absoluteView // change the current view status
    });




    function Transition2Absolute(){
    //Currently it is Relative
    stateRelative.selectAll("rect").transition().duration(2000).style("opacity",0);
    stateAbsolute.selectAll("rect").transition().duration(2000).style("opacity",1);//show absolute view rectangles
    svg.select(".y.axis.relative").transition().duration(2000).style("opacity",0);
    svg.select(".y.axis.absolute").transition().duration(2000).style("opacity",1);// show absolute view axis

    }

    function Transition2Relative(){
    //Currently it is absolute
    stateAbsolute.selectAll("rect").transition().duration(2000).attr("fill",function(d) {return  color(d.name)})
      stateAbsolute.selectAll("rect").transition().duration(2000).style("opacity",0);//show absolute view rectangles
      stateRelative.selectAll("rect").transition().duration(2000).style("opacity",1);
      svg.select(".y.axis.relative").transition().duration(2000).style("opacity",1);
      svg.select(".y.axis.absolute").transition().duration(2000).style("opacity",0);// show absolute view axis

    }
});

/* *********************************************************************
 * Time chart
 */
 var time_scale_x = d3.scale.ordinal()
     .rangeRoundBands([0, width], .1);

 var time_scale_y = d3.scale.linear()
     .range([time_chart_height, 0]);

 var time_x_axis = d3.svg.axis()
     .scale(time_scale_x)
     .orient("bottom");

 var time_y_axis = d3.svg.axis()
     .scale(time_scale_y)
     .orient("left")
     .ticks(10, "%");

 var chart_svg = d3.select("#timechart").append("svg")
     .attr("width", width + margin.left + margin.right)
     .attr("height", time_chart_height + margin.top + margin.bottom)
   .append("g")
     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data/visit_percentage.csv", type, function(error, timechart) {
  time_scale_x.domain(timechart.map(function(d) { return d.year; }));
  time_scale_y.domain([0, d3.max(timechart, function(d) { return d.perc_year; })]);

  chart_svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + time_chart_height + ")")
      .call(time_x_axis)
    .selectAll("text")
      .attr("y", 0)
      .attr("x", 9)
      .attr("dy", ".35em")
      .attr("transform", "rotate(90)")
      .style("text-anchor", "start");

  chart_svg.append("g")
      .attr("class", "y axis")
      .call(time_y_axis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("% of time at court");

  chart_svg.selectAll(".bar")
      .data(timechart)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return time_scale_x(d.year); })
      .attr("width", time_scale_x.rangeBand())
      .attr("y", function(d) { return time_scale_y(d.perc_year); })
      .attr("height", function(d) { return time_chart_height - time_scale_y(d.perc_year); })
      .style("fill", "steelblue");

});

function type(d) {
  d.perc_year = +d.perc_year;
  return d;
}
