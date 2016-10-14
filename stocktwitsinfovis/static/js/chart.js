


function render_chart(data) {
  console.log("render_chart >>");
  d3.select("#line_chart svg").remove();

  line_data = d3.select("#line_chart");

  // Set the dimensions of the canvas / graph
  var margin = {top: 10, right: 0, bottom: 10, left: 30},
      width = $(".middlepart").width() - margin.left - margin.right,
      height =  $(".middlepart").height() * 0.3 - margin.top - margin.bottom;

  // Parse the date  time
  var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

  // Set the ranges
  var x = d3.time.scale()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0]);

  // Define the axes
  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .innerTickSize(-height)
    .outerTickSize(0)
    .tickPadding(10);

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .innerTickSize(-width)
    .outerTickSize(0)
    .tickPadding(10);

  // Define the line
  var valueline = d3.svg.line()
      .x(function(d) { return x(d.end_time); })
      .y(function(d) { return y(d.sentiment); });
      
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
          d.end_time = parseDate(d.end_time);
          d.sentiment = +d.sentiment;
      });

      // Scale the range of the data
      x.domain(d3.extent(data, function(d) { return d.end_time; }));
      y.domain([0, d3.max(data, function(d) { return d.sentiment; })]);

      // Add the valueline path.
      svg.append("path")
          .attr("class", "line")
          .attr("d", valueline(data));

      // Add the X Axis
      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          // .call(xAxis)
          ;

      // Add the Y Axis
      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
          ;

  // });

}

function render_area_chart(data) {
  console.log("render_area_chart >>");
  d3.select("#area_chart svg").remove();

  area_data = d3.select("#area_chart");

  var margin = {top: 0, right: 0, bottom: 30, left: 30},
    width = $(".middlepart").width() - margin.left - margin.right,
      height = $(".middlepart").height() * 0.1 - margin.top - margin.bottom;

  var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

  var x = d3.time.scale()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis().scale(x)
      .orient("bottom")
      .innerTickSize(0)
      .tickPadding(10)
      .ticks(d3.time.minutes, 15)
      .tickFormat(d3.time.format("%H:%M"));

  var yAxis = d3.svg.axis().scale(y)
      .orient("left")
      .innerTickSize(0)
      .tickPadding(10)
      .ticks(2);

  var area = d3.svg.area()
      .x(function(d) { return x(d.start_time); })
      .y0(height)
      .y1(function(d) { return y(d.volume); });

  var svg = d3.select("#area_chart")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  // d3.json("/static/data/line_area_chart2.json", function(error, data) {
    data.forEach(function(d) {
      d.start_time = parseDate(d.start_time);
      d.volume = +d.volume;
    });

    x.domain(d3.extent(data, function(d) { return d.start_time; }));
    y.domain([0, d3.max(data, function(d) { return d.volume; })]);

    svg.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg.append("line")
       .attr("y1", y(50))        
  // });
}