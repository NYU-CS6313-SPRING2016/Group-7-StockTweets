
var settings;

function render_stocklist_realtime(data, isRealtime) {
    console.log("render_stocklist >>");

    if (isRealtime) {
      redrawChart(settings, data);
      return;
    }
    var setup = function(targetID){
        //Set size of svg element and chart
        var margin = {top: 0, right: 0, bottom: 0, left: 0},
            width = $(".leftpart").width() - margin.left - margin.right,
            height = $(".leftpart").height() - $(".search").height() - $(".filter").height() - margin.top - margin.bottom,
            categoryIndent = 42,    // by hand
            defaultBarWidth = 2000;

        //Set up scales
        var x = d3.scale.linear()
          .domain([0,defaultBarWidth])
          .range([0,width]);
        var y = d3.scale.ordinal()
          .rangeRoundBands([0, height], 0.1, 0);

        //Create SVG element
        d3.select(targetID).selectAll("svg").remove()
        var svg = d3.select(targetID).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        //Package and export settings
        var settings = {
          margin:margin, width:width, height:height, categoryIndent:categoryIndent,
          svg:svg, x:x, y:y
        }
        return settings;
    }

    function redrawChart(targetID, newdata) {

        //Import settings
        var margin=settings.margin, width=settings.width, height=settings.height, categoryIndent=settings.categoryIndent, 
        svg=settings.svg, x=settings.x, y=settings.y;

        //Reset domains
        y.domain(newdata.sort(function(a,b){
          return b.s_count - a.s_count;
        })
          .map(function(d) { return d.s_symbol; }));
        var barmax = d3.max(newdata, function(e) {
          return e.s_count;
        });
        x.domain([0,barmax]);

        /////////
        //ENTER//
        /////////

        //Bind new data to chart rows 

        //Create chart row and move to below the bottom of the chart
        var chartRow = svg.selectAll("g.chartRow")
          .data(newdata, function(d){ return d.s_symbol});
        var newRow = chartRow
          .enter()
          .append("g")
          .attr("class", "chartRow")
          .attr("id", function(d){ return d.message_id; })
          .attr("transform", "translate(0," + height + margin.top + margin.bottom + ")")
          .on("mousemove", function(d) {
              $("#stocklist #" + d.s_id).closest(".chartRow").find(".barr").attr("opacity", "1");
              $("#treemap #" + d.s_id).closest(".child").find(".foreignObject").css("box-shadow", "0px 0px 0px 3px #FF9800 inset");                 
              tooltips_mousemove(
                  "<span class='tipsname'>" + 
                      d.s_symbol + 
                  "</span>\
                  <br>\
                  <span class='tipstitle'>Name: </span><span>" + 
                      d.s_title + 
                  "</span>\
                  <br>\
                  <span class='tipstitle'>Sector: </span><span>" + 
                      d.s_sector + 
                  "</span>\
                  <br>\
                  <span class='tipstitle'>Volume: </span><span>" + 
                      d.s_count + 
                  "</span>"                  
              );
          })
          .on("mouseout", function(d) {
              $("#stocklist #" + d.s_id).closest(".chartRow").find(".barr").attr("opacity", "0");
              $("#treemap #" + d.s_id).closest(".child").find(".foreignObject").css("box-shadow", "initial"); 
              tooltips_mouseout();
          })          
          ;

        //Add rectangles
        newRow.insert("rect")
          .attr("class","bar")
          .attr("x", 0)
          .attr("opacity",0)
          .attr("height", y.rangeBand())
          .attr("width", function(d) { return x(d.s_count);})           

        newRow.insert("rect")
          .attr("class","barr")
          .attr("x", 0)
          .attr("opacity",0)
          // .attr("fill", "none")
          .attr("stroke", "#FF9800")
          .attr("stroke-width", "2px")
          .attr("height", y.rangeBand())
          .attr("width", width)          

        //Add s_count labels
        newRow.append("text")
          .attr("class","label")
          .attr("y", y.rangeBand()/2)
          .attr("x",6)
          .attr("opacity",0)
          .attr("dy",".35em")
          .attr("dx","0.5em")
          .text(function(d){return d.s_count;}); 
        
        //Add Headlines
        newRow.append("text")
          .attr("id", function(d){ return d.s_id; })
          .attr("class","category")
          .attr("text-overflow","ellipsis")
          .attr("y", y.rangeBand()/2)
          .attr("x",categoryIndent)
          .attr("opacity",0)
          .attr("dy",".35em")
          .attr("dx","0.5em")
          .text(function(d){return d.s_symbol})
          .on("click", function(d) {
              call_api_symbol(d.s_symbol);
          })           
          ;

        //////////
        //UPDATE//
        //////////
        
        //Update bar widths
        chartRow.select(".barr").transition()
          .duration(300)
          .attr("opacity",0);         
        chartRow.select(".bar").transition()
          .duration(300)
          .attr("width", function(d) { return x(d.s_count);})
          .attr("opacity",1);
         

        //Update data labels
        chartRow.select(".label").transition()
          .duration(300)
          .attr("opacity",1)
          .tween("text", function(d) { 
            var i = d3.interpolate(+this.textContent.replace(/\,/g,''), +d.s_count);
            return function(t) {
              this.textContent = Math.round(i(t));
            };
          });

        //Fade in categories
        chartRow.select(".category").transition()
          .duration(300)
          .attr("opacity",1);


        ////////
        //EXIT//
        ////////

        //Fade out and remove exit elements
        chartRow.exit().transition()
          .style("opacity","0")
          .attr("transform", "translate(0," + (height + margin.top + margin.bottom) + ")")
          .remove();


        ////////////////
        //REORDER ROWS//
        ////////////////

        var delay = function(d, i) { return 200 + i * 30; };

        chartRow.transition()
            .delay(delay)
            .duration(900)
            .attr("transform", function(d){ return "translate(0," + y(d.s_symbol) + ")"; });
    };
 
    //Pulls data
    //Since our data is fake, adds some random changes to simulate a data stream.
    //Uses a callback because d3.json loading is asynchronous
    var pullData = function(settings,callback){
        // d3.json("/static/data/fakeData.json", function (err, data){
            // if (err) return console.warn(err);

            var newData = data;
            // data.forEach(function(d,i){
            //     var news_count = d.s_count + Math.floor((Math.random()*10) - 5)
            //     newData[i].s_count = news_count <= 0 ? 10 : news_count
            // })

            newData = formatData(newData);

            callback(settings,newData);
        // })
    }

    //Sort data in descending order and take the top 10 s_counts
    var formatData = function(data){
        return data.sort(function (a, b) {
            return b.s_count - a.s_count;
          })
          .slice(0, 30);
    }

    //I like to call it what it does
    var redraw = function(settings){
        pullData(settings,redrawChart)
    }

    //setup (includes first draw)
    settings = setup('#stocklist');
    redraw(settings)

    //Repeat every 3 seconds
    // setInterval(function(){
    //     redraw(settings)
    // }, 5000);



}


