


var settingss;

function render_idealist_realtime(data, isRealtime) {
    console.log("render_idealist >>");

    if (isRealtime) {
      redraw(settingss,data);
      return;
    }
    var setup = function(targetID){
        //Set size of svg element and chart
        var margin = {top: 0, right: 0, bottom: 0, left: 0},
            width = $(".rightpart").width() - margin.left - margin.right,
            height = $(".rightpart").height() - margin.top - margin.bottom,
            categoryIndent = 0,    // by hand
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
        
        //Package and export settingss
        var settingss = {
          margin:margin, width:width, height:height, categoryIndent:categoryIndent,
          svg:svg, x:x, y:y
        }
        return settingss;
    }

    function redrawChart(targetID, newdata) {

        //Import settingss
        var margin=settingss.margin, width=settingss.width, height=settingss.height, categoryIndent=settingss.categoryIndent, 
        svg=settingss.svg, x=settingss.x, y=settingss.y;

        //Reset domains
        y.domain(newdata.sort(function(a,b){
          return b.message_id - a.message_id;
        })
          .map(function(d) { return d.message_id; }));
        var barmax = d3.max(newdata, function(e) {
          return e.message_id;
        });
        x.domain([0,barmax]);

        /////////
        //ENTER//
        /////////

        //Bind new data to chart rows 

        //Create chart row and move to below the bottom of the chart
        var chartRow = svg.selectAll("g.chartRow")
          .data(newdata, function(d){ return d.message_id});
        var newRow = chartRow
          .enter()
          .append("g")
          .attr("class", "chartRow")
          .attr("id",function(d) {return d.message_id})
          .attr("transform", "translate(0," + height + margin.top + margin.bottom + ")")
          .on("mouseover", function(d) {
              $("#idealist #" + d.message_id + " .bar").css("fill", "#424242");               
          })
          .on("click", function(d) {
            $("#myModalLabel").text("@" + d.username);
            $("#myModalLabel2").text(" - " + d.created_at);
            if (d.m_sentiment == "Bullish") {
              $(".modal-body").html("<span class='mbull'>Bullish</span> " + d.m_body);
            } else if (d.m_sentiment == "Bearish") {
              $(".modal-body").html("<span class='mbear'>Bearish</span> " + d.m_body);
            } else {
              $(".modal-body").html("<span class='mneutral'>Neutral</span> " + d.m_body);
            }             
            
            $('#myModal').modal('show');
          })          
          .on("mouseout", function(d) {
              $("#idealist #" + d.message_id + " .bar").css("fill", "#212121");               
          })
          ;

        // Add rectangles
        newRow.insert("rect")
          .attr("class","bar")
          .attr("x",0)
          .attr("opacity",0)
          .attr("height", y.rangeBand())
          .attr("width", width)
          ;

        // Add message_id labels
        newRow.append("text")
          .attr("class","label minfo")
          .attr("y", y.rangeBand()/2)
          .attr("x",1)
          .attr("opacity",0)
          .attr("dy","-0.5em")
          .attr("dx","0.5em")
          .text(function(d){return (d.username + " - " + d.created_at);}); 
        // Add message_id labels
        newRow.append("text")
          .attr("class",function(d) {
            if (d.m_sentiment == "Bullish") {
              return "label mbull";
            } else if (d.m_sentiment == "Bearish") {
              return "label mbear";
            } else {
              return "label mneutral";
            }            
          })
          .attr("y", y.rangeBand()/2)
          .attr("x",0)
          .attr("opacity",1)
          .attr("dy","-0.5em")
          .attr("dx","85%")
          .text(function(d){return d.m_sentiment;});           
        
        //Add Headlines
        newRow.append("text")
          .attr("class","category")
          .attr("text-overflow","ellipsis")
          .attr("y", y.rangeBand()/2)
          .attr("x",0)
          .attr("opacity",0)
          .attr("dy","0.75em")
          .attr("dx","0.5em")
          .text(function(d) {
            return d.m_body;            
          });


        //////////
        //UPDATE//
        //////////
        
        // Update bar widths
        chartRow.select(".bar").transition()
          .duration(1000)
          .attr("width", width)
          .attr("opacity",1);

        //Update data labels
        chartRow.select(".label").transition()
          .duration(1000)
          .attr("opacity",1);         

        //Fade in categories
        chartRow.select(".category").transition()
          .duration(1000)
          .attr("opacity",1);


        ////////
        //EXIT//
        ////////

        //Fade out and remove exit elements
        chartRow.exit().transition()
          .duration(1000)
          .style("opacity","0")
          .attr("transform", "translate(0," + (height + margin.top + margin.bottom) + ")")
          .remove();


        ////////////////
        //REORDER ROWS//
        ////////////////

        var delay = function(d, i) { return 200 + i * 30; };

        chartRow.transition()
            .delay(delay)
            .duration(2000)
            .attr("transform", function(d){ return "translate(0," + y(d.message_id) + ")"; });
    };



    //Pulls data
    //Since our data is fake, adds some random changes to simulate a data stream.
    //Uses a callback because d3.json loading is asynchronous
    function pullData(settingss,callback,data){
        // d3.json("/static/data/fakeData.json", function (err, data){
            // if (err) return console.warn(err);

            var newData = data;
            // data.forEach(function(d,i){
            //     var newmessage_id = d.message_id + Math.floor((Math.random()*10) - 5)
            //     newData[i].message_id = newmessage_id <= 0 ? 10 : newmessage_id
            // })

            newData = formatData(newData);

            callback(settingss,newData);
        // })
    }

    //Sort data in descending order and take the top 10 message_ids
    function formatData(data){
        return data.sort(function (a, b) {
            return b.message_id - a.message_id;
          })
          .slice(0, 15);
    }

    //I like to call it what it does
    function redraw(settingss,data) {
        pullData(settingss,redrawChart,data)
    }

    //setup (includes first draw)
    settingss = setup('#idealist');
    redraw(settingss,data)

    //Repeat every 3 seconds
    // setInterval(function(){
    //     redraw(settingss)
    // }, 5000);



}





// function render_idealist_realtime(data, isRealtime) {
//     console.log("render_idealist >>");

//     var idealist = d3.select("#idealist");
//     var ideas = data;
//     var idealist_data = idealist.selectAll("div")
//                             .data(ideas, function(d) { return d.m_body })
//                             .sort(function(a, b) {
//                                 return a.message_id - b.message_id;
//                             });
//     idealist_data.enter()
//                 .append("div")
//                 .classed("list-group-item", true)
//                 .html(function(d) {

//                 	if (d.m_sentiment == "Positive") {
//                 		return ('<span class="message_id">' + d.message_id + '</span>' +
//                                     '<span class=messagetime> - ' + d.created_at + '</span>' +
//                                     '<span class="sentiment bullidea">Bull</span></br>' + d.m_body);
//                 	} else if (d.m_sentiment == "Negative") {
//                 		return ('<span class="message_id">' + d.message_id + '</span>' + 
//                                     '<span class=messagetime> - ' + d.created_at + '</span>' +
//                                     '<span class="sentiment bearidea">Bear</span></br>' + d.m_body)
//                 	} else {
//                         return ('<span class="message_id">' + d.message_id + '</span>' +
//                                     '<span class=messagetime> - ' + d.created_at + '</span>' +
//                                     '<span class="sentiment neutralidea">Neutral</span></br>' + d.m_body)
//                     }                    
                	
//                 });



// }