


function render_stocklist(data) {
    console.log("render_stocklist >>");

    stocklist = d3.select("#stocklist");
    stocks = data;
    stocklist_data = stocklist.selectAll("div")
                            .data(stocks, function(d) { 
                                if(typeof d != "undefined") {
                                    return d.s_id;
                                }
                            });
    stocklist_data.enter()
                .append("div")
                .classed("list-group-item", true)
                .attr("id", function(d){ return d.s_id })
                .attr("symbol", function(d){ return d.s_symbol })
                .html(function(d) {
                    var percentage = Math.abs(d.s_change) / 100 * 50;
                    if (d.s_change < 0) {
                        return ("<div class='stocklistitem'>" + d.s_symbol + 
                                                    "<div class='smallbar'> \
                                                        <div class='smallbarcontainer'> \
                                                            <div class='smallbarbar' style='background-color: #212121; width: 50%'></div> \
                                                            <div class='smallbarbar' style='background-color: #73ACE5; width:" + (percentage) + "%; left:" + ( 50 - percentage) + "%'></div> \
                                                        </div> \
                                                    <div> \
                                <div>")
                    } else if (d.s_change > 0) {
                        return ("<div class='stocklistitem'>" + d.s_symbol + 
                                                    "<div class='smallbar'>  \
                                                        <div class='smallbarcontainer'> \
                                                            <div class='smallbarbar' style='background-color: #73ACE5; width:" + (percentage) + "%; left: 50%'></div> \
                                                        </div> \
                                                    <div> \
                                <div>")
                    }
                })
                .on("mouseenter", function(d) {
                    $("#" + d.s_id).css("background", "#424242");
                    $("#treemap #" + d.s_id + " rect").css("stroke-width","6");
                })
                .on("mouseleave", function(d) {
                    $("#" + d.s_id).css("background", "#212121");
                    $("#treemap #" + d.s_id + " rect").css("stroke-width","1");
                })                
                ;

}


