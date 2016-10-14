var timecounter = 1;
var isRendered = false;

var apiurl = "/infovis/api";
var selectedSector = "Overview";


$( document ).ready(function() {
    call_api(false, true);

    var elem = document.querySelector('.js-switch');
    var init = new Switchery(elem, { color: '#424242', secondaryColor: '#323232', jackColor: '#BDBDBD', jackSecondaryColor: '#424242' }, { size: 'small' });

    $('[data-toggle="tooltip"]').tooltip();

    // $('.clockpicker').clockpicker({
    //     autoclose: true,
    // });  

    setInterval(function(){
        if (document.querySelector('.js-switch').checked && isRendered) {
            isRendered = false;
            if (timecounter >= 6) {
                timecounter = 1;
            } else {
                timecounter++;
            } 
            call_api(true, false);
        } else if (!document.querySelector('.js-switch').checked) {
            console.log("off");
        } else {
            console.log("...");
        }
    }, 10000);  

    
});

$(".refresh").click(function() {
    console.log("refresh >>>>>>");
    $(".selectedname").text("...");
    apiurl = "/infovis/api";
    call_api(false, false);
});

function call_api(isRealtime, redrawTreemap) {
    dataString = "";
    console.log("api " + "[" + isRealtime + ", " + redrawTreemap + ", " + timecounter + "]: " +apiurl);
    $.ajax({
        method: "GET",
        contentType: "json",
        url:apiurl,
        data: dataString,
        success: function(result){
            // result = $.parseJSON(result);    not use since changes in backend return type
            // console.log(result);

            $(".visname span").css("opacity", 1);
            $(".treemapname").css("border-color", "#212121")
            $(".toptools").css("opacity", 1);
            $(".lefttools").css("opacity", 1);
            $(".sentiment_colors").css("opacity", 1);
            
            // render_chart(result["chart_data"]);
            // render_area_chart(result["chart_data"]);
            render_chart_realtime(result["chart_data"], isRealtime);

            // render_stocklist(result["top_symbols"]);
            render_stocklist_realtime(result["top_symbols"], isRealtime);
            // render_idealist(result["latest_messages"]);
            render_idealist_realtime(result["latest_messages"], isRealtime);

            if (redrawTreemap) {
                render_treemap_realtime(result["treemap"], false);
            // } else if (timecounter >= 6) {
            } else {
                render_treemap_realtime(result["treemap"], true, selectedSector);
            }

            initial_searchstock();
            initial_filtersector();                                  
        },
        error: function(result){
            console.log(result);
        },
        complete:function(result){
            // console.log(result);
            console.log("completed! " + apiurl);
            var n = apiurl.indexOf("=");
            if (n < 0) {
                $(".selectedname").text("Overview");
            } else {
                $(".selectedname").text(apiurl.substring(n+1));
            }
            isRendered = true;
        }
    });    
}

// search stock
$(".glyphicon-search").click(function() {
    $("#searchstock").focus();
})
function initial_searchstock() {
    var stocks = [];
    $(".cell.child").each(function(index, velement) {
        stocks.push(
            { value: $(this).find(".label").text(), data: $(this).find(".label").attr("id")}
        );
    });
    $('#searchstock').autocompletee({
        lookup: stocks,
        lookupLimit: 10,
        autoSelectFirst: true,
        onSelect: function (suggestion) {
            console.log('You selected (stock): ' + suggestion.value + ', ' + suggestion.data);
            call_api_symbol(suggestion.value);
        }
    });
}

// filter by sector
$(".glyphicon-filter").click(function() {
    $("#filtersector").focus();
})
function initial_filtersector() {
    var sectors = [
        "Overview",
        "Technology",
        "Services",
        "Financial",
        "Industrial_Goods",
        "Healthcare",
        "Utilities",
        "Basic_Materials",
        "Consumer_Goods",
        "Conglomerates"
    ];
    $( "#filtersector" ).autocomplete({
        source: sectors,
        minLength:0,
        select: function( event, ui ) {
            console.log('You selected (sector): ' + ui.item.value);
            if (ui.item.value == "Overview") {
                selectedSector = "Overview";
                $(".selectedname").text("...");
                apiurl = "/infovis/api";
                call_api(false, false);
            } else {
                call_api_sector(ui.item.value);
            }
        }
    }).bind('focus', function(){ $(this).autocomplete("search"); } );
}

// tooltips mouse events
function tooltips_mousemove(html) {
    var xPosition = d3.event.pageX + 10;
    var yPosition = d3.event.pageY - 60;
    d3.select("#tooltip")
        .style("left", xPosition + "px")
        .style("top", yPosition + "px");    
    d3.select("#tooltip")
        .html(html);
    d3.select("#tooltip").classed("hidden", false);
}
// why 2? pass x,y
function tooltips_mousemove2(x, y, html) {
    var xPosition = x + $(".leftpart").width() + 80;
    var yPosition = y + $(".navbar").height();
    d3.select("#tooltip")
        .style("left", xPosition + "px")
        .style("top", yPosition + "px");    
    d3.select("#tooltip")
        .html(html);
    d3.select("#tooltip").classed("hidden", false);

    d3.select("line.xx")
            .style("opacity", 1)
            .attr("transform",
                  "translate(" + x + "," +
                                 0 + ")");        
}
function tooltips_mouseout() {
    d3.select("#tooltip").classed("hidden", true);
    d3.select("line.xx").style("opacity", 0);
}



// call cpi by selected symbol
function call_api_symbol(symbol) {
    selectedSector = "Overview";
    $(".selectedname").text("...");
    apiurl = "/infovis/api?symbol=" + symbol.substring(1);
    call_api(false, false);
}
// call cpi by selected sector
function call_api_sector(sector) {
    selectedSector = sector;
    $(".selectedname").text("...");
    apiurl = "/infovis/api?sector=" + sector;
    call_api(false, false);
}



