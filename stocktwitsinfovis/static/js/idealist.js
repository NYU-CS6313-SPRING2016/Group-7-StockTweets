


function render_idealist(data) {
    console.log("render_idealist >>");

    idealist = d3.select("#idealist");
    ideas = data;
    idealist_data = idealist.selectAll("div")
                            .data(ideas, function(d) { return d.m_body });
    idealist_data.enter()
                .append("div")
                .classed("list-group-item", true)
                .html(function(d) {

                	if (d.m_sentiment == "Positive") {
                		return ('<span class="username">' + d.username + '</span>' +
                                    '<span class=messagetime> - ' + d.created_at + '</span>' +
                                    '<span class="sentiment bullidea">Bull</span></br>' + d.m_body);
                	} else if (d.m_sentiment == "Negative") {
                		return ('<span class="username">' + d.username + '</span>' + 
                                    '<span class=messagetime> - ' + d.created_at + '</span>' +
                                    '<span class="sentiment bearidea">Bear</span></br>' + d.m_body)
                	} else {
                        return ('<span class="username">' + d.username + '</span>' +
                                    '<span class=messagetime> - ' + d.created_at + '</span>' +
                                    '<span class="sentiment neutralidea">Neutral</span></br>' + d.m_body)
                    }                    
                	
                });
}