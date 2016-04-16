function treemap(seasonNum) {

  var sliderPosition = 16;
  var treemapDiv = document.querySelector(".treemap-container");
  treemapDiv.innerHTML = "";

  var sliderContainer = document.querySelector("#slider-container");
  sliderContainer.style.visibility = "visible";

  document.querySelector("nav").style.zIndex = "25";

  var w = window.innerWidth;
  var h = window.innerHeight;

  var margin = {top: 40, right: 10, bottom: 10, left: 10},
    widthTM = (w * .9),
    heightTM = (h * .76);



  var tooltip = d3.select(".treemap").append("div")
                  .attr("class", "tooltip")
                  .style("opacity", 0);

  d3.json("data.json", function(error, data) {
    if (error) throw error;
    
    var generatedJSON = {};
    data.forEach(function(d) {
      var seasonTeams;
      if (d.seasonNumber == seasonNum) {
        seasonTeams = d.teams;
        var teamInfoArray = [];
        var noOfLeagueStageMatches = calcNoOfLeagueStageMatches(2*(seasonTeams.length-1));
        var leagueStageMatchesPerTeam = calcLeagueStageMatchesPerTeam(seasonTeams.length);
        var maxNoOfMatches = 16;
        for (i=0; i<seasonTeams.length; i++) {
          var team = seasonTeams[i];
          var teamInfo = {name: team.teamName, size: 0, progressionArray: [], topRank: ""};
          teamInfo.name = team.teamName;
          teamInfo.progressionArray = new Array(14);
          var totalLeagueStagePoints = 0;
          var matches = team.matches;
          var noOfMatchesPlayedByEachTeamAtLeagueStage = (2*(seasonTeams.length-1));
          for (j=0; j<maxNoOfMatches; j++) {
            if (typeof matches[j] != "undefined") {
              if(matches[j].winner == true) {
                if(j>13) {
                  totalLeagueStagePoints += 4;
                } else {
                  totalLeagueStagePoints += 2;
                }
              } else if (matches[j].winner == null) {
                totalLeagueStagePoints++;
              } else if (matches[j].winner == false) {
                if(j>13) {
                  totalLeagueStagePoints += 2;
                } else {
                  totalLeagueStagePoints = totalLeagueStagePoints;
                }
              }
            }
            teamInfo.progressionArray[j] = totalLeagueStagePoints;
          }
          if(matches.length > leagueStageMatchesPerTeam) {
            console.log(team.teamName);
            for(j=noOfMatchesPlayedByEachTeamAtLeagueStage; j<matches.length; j++) {

              if(j == maxNoOfMatches-1) {
                if(matches[j].winner == true) {
                  teamInfo.topRank = "(C)";
                } else {
                  teamInfo.topRank = "(R)";
                }
              }

            }
          }
          
          teamInfo.size = teamInfo.progressionArray[sliderPosition-1] + 2;
          teamInfoArray[i] = teamInfo;
        }
        generatedJSON = {name: "tree", children: teamInfoArray};
      }

    });
        
    console.log(generatedJSON);


    var div = d3.select(".treemap-container").append("div")
                .style("position", "relative")
                .style("display", "inline-block")
                //.attr("class", "divi")
                .style("width", (widthTM + margin.left + margin.right) + "px")
                .style("height", (heightTM + margin.top + margin.bottom) + "px")
                .style("left", margin.left + "px")
                .style("top", margin.top + "px");

    var treemap = d3.layout.treemap()
        .size([widthTM, heightTM])
        .sticky(true)
        .value(function(d) { return d.size; });
    
    var node = div.datum(generatedJSON).selectAll(".node")
          .data(treemap.nodes)
        .enter().append("div")
          .attr("class", "node")
          .attr("id", function(d) {
            return d.name;
          })
          .call(position)
          .style("font-size", function(d) {
              // compute font size based on sqrt(area)
              return Math.max(20, 0.10*Math.sqrt(d.area))+'px'; })
          .style("color", function(d) {
              if(d.topRank=="(C)") { 
                return "gold"; 
              } else if(d.topRank=="(R)") { 
                return "silver"; 
              } else {
                return "black";
              }

            })
          .style("text-align", "left")
          .style("background-image", function(d) { return d.name == "tree" ? "" : "url('img/" + d.name + ".png')" })
          .style("background-color", function(d) {
                  return pickColor(d.name);
              })
          .on("click", function(d) { 
              tooltip.style("opacity", 0);
              launchCalendarHeatMap(seasonNum, d.name); 
            })
          .on("mouseover", function(d) {
              tooltip.style("opacity", .9);
              tooltip.html("<span style='font-size: 110%;'>" + d["name"] + "</span><br>" + "League-stage points: " + ((sliderPosition > 14) ? (d.progressionArray[sliderPosition-sliderPosition+13]) : (d.progressionArray[sliderPosition-1])))
                   .style("left", d3.event.pageX + 5 + "px")
                   .style("top", d3.event.pageY + 5 + "px");
          
              d3.selectAll(".node").transition().duration(300)
                .style("border", function(e) {
                  if (d["name"] == e["name"]) {
                    return "1px solid " + pickColor(d.name) + "";
                  }
                  return "none";
                })
                .style("z-index", function(e) {
                  if (d["name"] == e["name"]) {
                    return 3;
                  }
                  return 0;
                });
          })
          .on("mouseout", function(d) {
            tooltip.style("opacity", 0);
            d3.selectAll(".node").transition().duration(300)
              .style("border", "none")
              .style("z-index", "initial");
          })
          .text(function(d) { return d.topRank; });

    document.getElementById('slider').max = sliderPosition;

    d3.select("#slider").on("input", function() {
      //updateSliderLabel(+this.value);
      //setValue(16);
      sliderPosition = +this.value;
      var value = function(d) { return d.progressionArray[sliderPosition-1] + 2; };

      node.data(treemap.value(value).nodes)
        .transition()
          .duration(500)
          .call(position);

    });

  });
   
}  


function position() {
    this.style("left", function(d) { return d.x + "px"; })
        .style("top", function(d) { return d.y + "px"; })
        .style("width", function(d) { return Math.max(0, d.dx - 2) + "px"; })
        .style("height", function(d) { return Math.max(0, d.dy - 2) + "px"; });
}

/*
 * The following function recursively caculates the number of league stage matches. 
 * Doesn't work for seasons where there are Groups in League stage, i.e. IPL 2011 (season 4).
 */
function calcNoOfLeagueStageMatches(n) { // n passed in is always even
  if (n>2) {
    return (n+calcNoOfLeagueStageMatches(n-2));
  } else {
    return n;
  }
}

function calcLeagueStageMatchesPerTeam(n) { // n passed in is always even
  if (n==8 || n==10) {
    return 14;
  } else if (n==9){
    return 16;
  }
}

function pickColor(str) {
  if(str != null) {
    if (str == 'Chennai Super Kings') {
      return "yellow";
    } else if (str == 'Deccan Chargers') {
      return "silver";
    } else if (str == 'Delhi Daredevils') {
      return "navy";
    } else if (str == 'Kings XI Punjab') {
      return "red";
    } else if (str == 'Kolkata Knight Riders') {
      return "purple";
    } else if (str == 'Mumbai Indians') {
      return "blue";
    } else if (str == 'Rajasthan Royals') {
      return "RoyalBlue";
    } else if (str == 'Royal Challengers Bangalore') {
      return "gold";
    } else if (str == 'Sunrisers Hyderabad') {
      return "orange";
    } else if (str == 'Rising Pune Supergiants') {
      return "pink";
    } else if (str == 'Gujarat Lions') {
      return "orange";
    } else if (str == 'Pune Warriors India') {
      return "LightSkyBlue";
    }
  }
  return "inherit";
}
/*
function updateSliderLabel(slider) {
  // adjust the text on the range slider
  sliderPosition = +slider;
  if (slider==16) {
    d3.select("#slider-value").text("Final");
    d3.select("#slider").property("value", slider);
  } else if (slider==15) {
    d3.select("#slider-value").text("Semi-finals");
    d3.select("#slider").property("value", slider);
  } else {
    d3.select("#slider-value").text("Match " + slider);
    d3.select("#slider").property("value", slider);
  }
  var rangeLength = slider/16;
  rangeLength = rangeLength*100;
  console.log(rangeLength);
  var sliderObj = document.querySelector("#slider");
  sliderObj.style.background = "white";
}

*/



/* Code by Steven Estrella. http://www.shearspiremedia.com */
/* we need to change slider appearance oninput and onchange */
window.onload = function() {
  setValue(16);
}

function showValue(val) {
  /* setup variables for the elements of our slider */
  var thumb = document.getElementById("sliderthumb");
  var shell = document.getElementById("slidershell");
  var track = document.getElementById("slidertrack");
  var fill = document.getElementById("sliderfill");
  var rangevalue = document.getElementById("slidervalue");
  var slider = document.getElementById("slider");
  
  var pc = val/(slider.max - slider.min); /* the percentage slider value */
  var thumbsize = 53; /* must match the thumb size in your css */
  var bigval = 450; /* widest or tallest value depending on orientation */
  var smallval = 40; /* narrowest or shortest value depending on orientation */
  var tracksize = bigval - thumbsize;
  var fillsize = 6;
  var filloffset = 10;
  var bordersize = 0;
  var loc = pc * tracksize;
  if(val == slider.max) {
    rangevalue.innerHTML = "Final";
  } else if(val == slider.max - 1) {
    rangevalue.innerHTML = "Semi-finals";
  } else {
    rangevalue.innerHTML = "Match " + val;
  }
  //rangevalue.style.top = 30 + "px";
  //rangevalue.style.left = (loc - 35) + "px";
  rangevalue.style.top = (0) + "px";
  rangevalue.style.left = (450) + "px";
  thumb.style.top =  (3) + "px";
  thumb.style.left = (loc) + "px";
  fill.style.top = (filloffset + bordersize + 4) + "px";
  fill.style.left = (0) + "px";
  fill.style.width = (loc + (thumbsize/2)) + "px";
  fill.style.height = (fillsize) + "px";
  shell.style.height = (smallval) + "px";
  shell.style.width = (bigval) + "px";
  track.style.height = (fillsize) + "px"; /* adjust for border */
  track.style.width = (bigval) + "px"; /* adjust for border */
  track.style.left = (0) + "px";
  track.style.top = (filloffset + bordersize + 4) + "px";
}
/* we often need a function to set the slider values on page load */
function setValue(val) {
  document.getElementById("slider").value = val;
  showValue(val);
}
