window.onload = function() {

    window.onresize = function() { location.reload(); }

    var w = window.innerWidth;
    var h = window.innerHeight;

    var margin = {top: 40, right: 10, bottom: 10, left: 10},
      width = (w * .9),
      height = (h * .9);

    var treemap = d3.layout.treemap()
      .size([width, height])
      .sticky(true)
      .value(function(d) { return d.points; });

    var svg = d3.select(".figure").append("div")
      .style("position", "relative")
      .style("width", (width + margin.left + margin.right) + "px")
      .style("height", (height + margin.top + margin.bottom) + "px")
      .style("left", margin.left + "px")
      .style("top", margin.top + "px");

    var tooltip = d3.select("body").append("rect")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

    d3.json("points.json", function(error, root) {
    if (error) throw error;

    var node = svg.datum(root).selectAll(".node")
        .data(treemap.nodes)
      .enter().append("div")
        .attr("class", "node")
        .call(position)
        .style("background", function(d) { return "url('img/" + d.logo + "') center no-repeat"; })
        .style("background-size", "contain")
        .style("background-color", function(d){ return d.color1; })
        .on("mouseover", function(d) {
            tooltip.style("opacity", .9);
            tooltip.html("<span style='font-size: 110%;'>" + d["team"] + "</span><br>" + "Points: " + d["points"])
                 .style("left", d3.event.pageX + 5 + "px")
                 .style("top", d3.event.pageY + 5 + "px");
        })
        .on("mouseout", function(d) {
          tooltip.style("opacity", 0);
        });

    });

    function position() {
    this.style("left", function(d) { return d.x + "px"; })
        .style("top", function(d) { return d.y + "px"; })
        .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
        .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
    }

}