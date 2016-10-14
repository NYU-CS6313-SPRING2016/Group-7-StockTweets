

var parseDate1;
var xx1;
var yy1;
var xAxis1;
var yAxis1;
var valueline1;

var bisectDate;

var parseDate2;
var xx2;
var yy2;
var xAxis2;
var yAxis2;
var area2;

var data_for_tip;

function render_chart_realtime(data, isRealtime) {
  console.log("render_charts >>");
  data_for_tip = data;
  if (isRealtime) {
    updateLineData(data);
    updateAreaData(data);
    return;
  }

  d3.select("#line_chart svg").remove();
  d3.select("#area_chart svg").remove();
  render_line_chart(data);
  render_area_chart(data);

  function updateLineData(data) {
      // Get the data again
      // d3.csv("simple-alt.csv", function(error, data) {
          data.forEach(function(d) {
            d.end_time = parseDate1(d.end_time);
            d.sentiment = +d.sentiment;
          });

          // Scale the range of the data again
          xx1.domain(d3.extent(data, function(d) { return d.end_time; }));
          yy1.domain([0, d3.max(data, function(d) { return 100; })]);

      // Select the section we want to apply our changes to
      var svg = d3.select("#line_chart").transition();

      // Make the changes
      svg.select(".x.axis.linechart") // change the x axis
          .duration(900)
          // .call(xAxis1)
          ;
      svg.select(".y.axis.linechart") // change the y axis
          .duration(900)
          // .call(yAxis1)
          ;
      svg.select(".line.linechart")   // change the line
          .duration(900)
          .attr("d", valueline1(data));          

      // });

  }

  function updateAreaData(data) {
      // Get the data again
      // d3.csv("simple-alt.csv", function(error, data) {
          data.forEach(function(d) {
            d.start_time = parseDate2(d.start_time);
            d.volume = +d.volume;            
          });

          // Scale the range of the data again
          xx2.domain(d3.extent(data, function(d) { return d.start_time; }));
          yy2.domain([0, d3.max(data, function(d) { return d.volume; })]);

      // Select the section we want to apply our changes to
      var svg = d3.select("#area_chart").transition();

      // Make the changes
      svg.select(".area.areachart")   // change the line
          .duration(900)
          .attr("d", area2(data))
      svg.select(".x.axis.areachart") // change the x axis
          .duration(900)
          .call(xAxis2)
          ;
      svg.select(".y.axis.areachart") // change the y axis
          .duration(900)
          .call(yAxis2)
          ;          

      // });
  }

  function render_line_chart(data) {
    console.log("render_line_chart >>");
    // d3.select("#line_chart svg").remove();

    line_data = d3.select("#line_chart");

    // Set the dimensions of the canvas / graph
    var margin = {top: 8, right: 0, bottom: 8, left: 35},
        width = $(".middlepart").width() - margin.left - margin.right,
        height =  $(".middlepart").height() * 0.3 - margin.top - margin.bottom;

    // Parse the date  time
    parseDate1 = d3.time.format("%Y-%m-%d %H:%M:%S").parse;
    bisectDate = d3.bisector(function(d) { return d.end_time; }).left;
    formatDate_tip = d3.time.format("%H:%M:%S");

    // Set the ranges
    xx1 = d3.time.scale()
        .range([0, width]);

    yy1 = d3.scale.linear()
        .range([height, 0]);

    // Define the axes
    xAxis1 = d3.svg.axis()
      .scale(xx1)
      .orient("bottom")
      .innerTickSize(-height)
      .outerTickSize(0)
      .tickPadding(10);

    yAxis1 = d3.svg.axis()
      .scale(yy1)
      .orient("left")
      .innerTickSize(-width)
      .outerTickSize(0)
      .tickPadding(10)
      .tickFormat(function(d) { return d + "%"; })
      ;

    // Define the line
    valueline1 = d3.svg.line()
        .x(function(d) { return xx1(d.end_time); })
        .y(function(d) { return yy1(d.sentiment); });
        
    // Adds the svg canvas
    var svg = d3.select("#line_chart")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", 
                  "translate(" + margin.left + "," + margin.top + ")");

    // Get the data
    // d3.json("/static/data/line_area_chart2.json", function(error, data) {
        data.forEach(function(d) {
            d.end_time = parseDate1(d.end_time);
            d.sentiment = +d.sentiment;
        });

        // Scale the range of the data
        xx1.domain(d3.extent(data, function(d) { return d.end_time; }));
        yy1.domain([0, d3.max(data, function(d) { return 100; })]);

        // Add the X Axis
        svg.append("g")
            .attr("class", "x axis linechart")
            .attr("transform", "translate(0," + height + ")")
            // .call(xAxis1)
            ;

        // Add the Y Axis
        svg.append("g")
            .attr("class", "y axis linechart")
            .call(yAxis1)
            ;
        
        // Add 50 reference line
        svg.append("line")
            .style("stroke", "#BDBDBD")
            .style("stroke-dasharray", "4,4")
            .attr("x1", 0)
            .attr("y1", yy1(50))
            .attr("x2", width)
            .attr("y2", yy1(50));
        
        // Add the valueline path.
        svg.append("path")
            .attr("class", "line linechart")
            .attr("d", valueline1(data));

    // });
/* ==========================================================================
   Tooltip for line chart
*  ========================================================================== */
    // Tooltip
    // bisectDate = d3.bisector(function(d) { return d.end_time; }).left;
    var lineSvg = svg.append("g");
    var focus = svg.append("g")
        .style("display", "none");
    
      // append the x line
    focus.append("line")
        .attr("class", "x")
        .style("stroke", "rgba(256,256,256,0.8)")
        .style("stroke-dasharray", "3,3")
        .style("stroke-width", "2px")
        .style("opacity", 1)
        .attr("y1", 0)
        .attr("y2", height);

    // append the y line
    focus.append("line")
        .attr("class", "y")
        .style("stroke", "rgba(256,256,256,0.8)")
        .style("stroke-dasharray", "3,3")
        .style("stroke-width", "2px")
        .style("opacity", 1)
        .attr("x1", 0)
        .attr("x2", width);

    // append the circle at the intersection
    focus.append("circle")
        .attr("class", "c")
        .style("fill", "none")
        .style("stroke", "#CE93D8")
        .style("stroke-width", "4px")
        .attr("r", 4);

    // place the value at the intersection
    // focus.append("text")
    //     .attr("class", "y1")
    //     .style("stroke", "white")
    //     .style("stroke-width", "3.5px")
    //     .style("opacity", 0.8)
    //     .attr("dx", 8)
    //     .attr("dy", "-1.7em");
    // focus.append("text")
    //     .attr("class", "y2")
    //     .attr("dx", 8)
    //     .attr("dy", "-1.7em");

    // focus.append("text")
    //     .attr("class", "y3")
    //     .style("stroke", "white")
    //     .style("stroke-width", "3.5px")
    //     .style("opacity", 0.8)
    //     .attr("dx", 8)
    //     .attr("dy", "-.7em");
    // focus.append("text")
    //     .attr("class", "y4")
    //     .attr("dx", 8)
    //     .attr("dy", "-.7em");

    // place the date at the intersection
    // focus.append("text")
    //     .attr("class", "y5")
    //     .style("stroke", "white")
    //     .style("stroke-width", "3.5px")
    //     .style("opacity", 0.8)
    //     .attr("dx", 8)
    //     .attr("dy", ".3em");
    // focus.append("text")
    //     .attr("class", "y6")
    //     .attr("dx", 8)
    //     .attr("dy", ".3em");

    // append the rectangle to capture mouse
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); tooltips_mouseout(); })
        .on("mousemove", mousemove);

    function mousemove() {
        var x0 = xx1.invert(d3.mouse(this)[0]),
            
            i = bisectDate(data_for_tip, x0, 1),
            d0 = data_for_tip[i - 1],
            d1 = data_for_tip[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        // console.log(x0);
        
        focus.select("circle.c")
            .attr("transform",
                  "translate(" + xx1(d.end_time) + "," +
                                 yy1(d.sentiment) + ")");
        
        // focus.select("text.y1")
        //   .attr("transform",
        //         "translate(" + xx1(d.end_time) + "," +
        //                        yy1(d.sentiment) + ")")
        //   .text("Sentiment: " + d.sentiment);

        // focus.select("text.y2")
        //   .attr("transform",
        //         "translate(" + xx1(d.end_time) + "," +
        //                        yy1(d.sentiment) + ")")
        //   .text("Sentiment: " + d.sentiment);
        
        // focus.select("text.y3")
        //   .attr("transform",
        //         "translate(" + xx1(d.end_time) + "," +
        //                        yy1(d.sentiment) + ")")
        //   .text("Volume: " + d.volume);

        // focus.select("text.y4")
        //   .attr("transform",
        //         "translate(" + xx1(d.end_time) + "," +
        //                        yy1(d.sentiment) + ")")
        //   .text("Volume: " + d.volume);
        
        // focus.select("text.y5")
        //   .attr("transform",
        //         "translate(" + xx1(d.end_time) + "," +
        //                        yy1(d.sentiment) + ")")
        //   .text("Time: " + formatDate_tip(d.start_time));

        // focus.select("text.y6")
        //   .attr("transform",
        //         "translate(" + xx1(d.end_time) + "," +
        //                        yy1(d.sentiment) + ")")
        //   .text("Time: " + formatDate_tip(d.start_time));
        
        focus.select("line.x")
          .attr("transform",
                "translate(" + xx1(d.end_time) + "," +
                               yy1(d.sentiment) + ")")
                     .attr("y2", height);
        focus.select("line.y")
          .attr("transform",
                "translate(" + xx1(d.end_time) + "," +
                               yy1(d.sentiment) + ")")
                     .attr("x2", -xx1(d.end_time));                         

        tooltips_mousemove2(xx1(d.end_time), yy1(d.sentiment), 
                    "<span class='tipsname'>" + 
                        $(".selectedname").text() + 
                    "</span>\
                    <br>\
                    <span class='tipstitle'>Sentiment: </span><span>" + 
                        d.sentiment + "%" + 
                    "</span>\
                    <br>\
                    <span class='tipstitle'>Volume:  </span><span>" + 
                        d.volume + 
                    "</span>\
                    <br>\
                    <span class='tipstitle'>Time:  </span><span>" + 
                        d.end_time + 
                    "</span>"
          );
    }
/* ==========================================================================
   End of Tooltip
*  ========================================================================== */    
  }

  function render_area_chart(data) {
    area_data = d3.select("#area_chart");

    var margin = {top: 0, right: 0, bottom: 20, left: 35},
        width = $(".middlepart").width() - margin.left - margin.right,
        height = $(".middlepart").height() * 0.1 - margin.top - margin.bottom;

    parseDate2 = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

    xx2 = d3.time.scale()
        .range([0, width]);

    yy2 = d3.scale.linear()
        .range([height, 0]);

    xAxis2 = d3.svg.axis().scale(xx2)
        .orient("bottom")
        .innerTickSize(0)
        .tickPadding(10)
        .ticks(d3.time.minutes, 15)
        .tickFormat(d3.time.format("%H:%M"));

    yAxis2 = d3.svg.axis().scale(yy2)
        .orient("left")
        .innerTickSize(0)
        .tickPadding(10)
        .ticks(2);

    area2 = d3.svg.area()
        .x(function(d) { return xx2(d.start_time); })
        .y0(height)
        .y1(function(d) { return yy2(d.volume); });

    var svg = d3.select("#area_chart")
      .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");
   

    // d3.json("/static/data/line_area_chart2.json", function(error, data) {
      data.forEach(function(d) {
        d.start_time = parseDate2(d.start_time);
        d.volume = +d.volume;
      });

      xx2.domain(d3.extent(data, function(d) { return d.start_time; }));
      yy2.domain([0, d3.max(data, function(d) { return d.volume; })]);

      svg.append("path")
          .attr("class", "area areachart")
          .attr("d", area2(data)); 

      svg.append("g")
          .attr("class", "x axis areachart")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis2);

      svg.append("g")
          .attr("class", "y axis areachart")
          .call(yAxis2);

    // tooltip lines
    svg.append("line")
        .attr("class", "xx")
        .style("stroke", "rgba(256,256,256,0.8)")
        .style("stroke-dasharray", "3,3")
        .style("stroke-width", "2px")
        .style("opacity", 0)
        .attr("y1", 0)
        .attr("y2", height);           
         
      
    // });
  }
}