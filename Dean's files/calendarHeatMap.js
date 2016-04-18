function launchCalendarHeatMap(seasonNum, teamN) {

	d3.select("#breadcrumb").append("text").text(" > " + teamN);

	var widthCHM = 960;
  	var heightCHM = 150;

	var treemapSelected = document.querySelector(".treemap");
	treemapSelected.innerHTML = "";

	d3.json("data.json", function(error, data) {
	    if (error) throw error;
	    
	    var generatedData = [];
	    data.forEach(function(d) {
	      var seasonTeams;
	      if (d.seasonNumber == seasonNum) {
	        seasonTeams = d.teams;
	        var teamInfoArray = [];
	        var noOfLeagueStageMatches = calcNoOfLeagueStageMatches(2*(seasonTeams.length-1));
	        var leagueStageMatchesPerTeam = calcLeagueStageMatchesPerTeam(seasonTeams.length);
	        var maxNoOfMatches = 16;
	        var team;
	        var teamInfo = {};
	        for (i=0; i<seasonTeams.length; i++) {
	        	if (seasonTeams[i].teamName == teamN) {
	        		team = seasonTeams[i]
	        	}
	        }
	        console.log(team.teamName);
	        teamInfo.teamName = team.teamName;
	        var matches = team.matches;
	        generatedData = matches;
	        for(i=0; i<matches.length; i++) {
	        	if(matches[i].firstInnings.battingTeam == teamN) {
	        		generatedData[i].opponent = matches[i].firstInnings.bowlingTeam;
	        	} else {
	        		generatedData[i].opponent = matches[i].firstInnings.battingTeam;
	        	}
	        }
	        generatedData.averageRunMargin = d.averageRunMargin;
	        generatedData.averageWicketMargin = d.averageWicketMargin;
	        generatedData.maxRunMargin = d.maxRunMargin;
	        generatedData.maxWicketMargin = d.maxWicketMargin;
	      }

    	});
		console.log(generatedData);
		var sizeOfRects = (widthCHM / generatedData.length);
		var sizeOfRects = sizeOfRects * .90;

//defining color scales: ----------
		var winByRunsScale = d3.scale.quantize()
						.domain([generatedData.maxRunMargin, 0])
						.range(["#13762e", "#178c37", "#1aa23f", "#1eb848", "#22ce51", "#42e06d"]);
						
		var winByWicketsScale = d3.scale.quantize()
						.domain([generatedData.maxWicketMargin, 0])
						.range(["#13762e", "#178c37", "#1aa23f", "#1eb848", "#22ce51", "#42e06d"]);
						

		var lossByRunsScale = d3.scale.quantize()
						.domain([generatedData.maxRunMargin, 0])
						.range(["#b30000", "#cc0000", "#e60000", "#ff0000", "#ff3333", "#ff4d4d"]);

		var lossByWicketsScale = d3.scale.quantize()
						.domain([generatedData.maxWicketMargin, 0])
						.range(["#b30000", "#cc0000", "#e60000", "#ff0000", "#ff3333", "#ff4d4d"]);
// ----------------------------------

		var tooltip = d3.select(".calendar-heat-map").append("div")
                  .attr("class", "tooltip")
                  .style("opacity", 0);

		var calendarHeatMap = d3.select(".calendar-heat-map")
								.append("svg")
								.attr("width", widthCHM)
								.attr("height", heightCHM)
								.append("g")
								.attr("transform", "translate(50,50)");

		var teamLogoSrc = "img/" + teamN + ".png";

		calendarHeatMap.append("svg:image")
					    .attr("xlink:href", teamLogoSrc)
					    .attr("x", "-50")
		                .attr("y", "-60")
		                .attr("width", "100")
		                .attr("height", "100");
	

		var bars = calendarHeatMap.selectAll("rect")
								  .data(generatedData)
								  .enter()
								  	.append("rect")
								  	.attr("class", "form-square")
								  	.attr("width", sizeOfRects * .75)
								  	.attr("height", sizeOfRects * .75)
								  	.attr("x", function(d, i) {
									  		if (i>13) {
									  			return ((i*sizeOfRects) + (sizeOfRects*.75));
									  		} else {
									  			return ((i*sizeOfRects) + 12);
									  		}
								  		})
								  	.attr("y", 15)
								  	.attr("fill", function(d) {
								  			if (d.winner[0]==true) {
								  				//return "green";
								  				if((d.winner[1][1] == "runs") || (d.winner[1][1] == "run")) {
								  					return winByRunsScale(d.winner[1][0]);
								  				} else if((d.winner[1][1] == "wickets") || (d.winner[1][1] == "wickets")) {
								  					return winByWicketsScale(d.winner[1][0]);
								  				}
								  			} else if (d.winner[0]==null) {
								  				return "gray";
								  			} else if (d.winner[0]==false) {
								  				//return "red";
								  				if((d.winner[1][1] == "runs") || (d.winner[1][1] == "run")) {
								  					return lossByRunsScale(d.winner[1][0]);
								  				} else if((d.winner[1][1] == "wickets") || (d.winner[1][1] == "wickets")) {
								  					return lossByWicketsScale(d.winner[1][0]);
								  				}
								  			}
								  		})
								  	.attr("rx", 4)
								  	.on("mouseover", function(d, i) {
								  			tooltip.html(function() { 
								  					var str = "";
								  					if (d.opponent!=null) {
								  						str = abbreviate(teamN) + " v " + d.opponent + "<br>";
								  						str += "match no: " + d.matchNumber + "<br>";
									  					if(d.winner[0]==true) {
									  						str += abbreviate(teamN) + " won by ";
									  					} else {
									  						str += abbreviate(d.opponent) + " won by ";
									  					}
									  					str += d.winner[1][0];
									  					if((d.winner[1][1]=="run") || (d.winner[1][1]=="runs")) {
									  						str += " run(s)";
									  					} else if((d.winner[1][1]=="wicket") || (d.winner[1][1]=="wickets")) {
									  						str += " wicket(s)";
									  					}
								  					}
								  					return str;
												})
								  				.style("opacity", .9)
									  			.style("left", d3.event.pageX - (sizeOfRects*1.41) + "px")
	                   							.style("top", d3.event.pageY + 5 + "px");
								  			d3.selectAll("rect").transition().duration(200)
								                .attr("stroke-width", function(e, j) {
								                	if (i == j) {
								                		return 2;
								                	} else {
								                		return 0;
								                	}
								                })
								                .attr("stroke", "black");
								  		})
								  	.on("mouseout", function(d) {
								  			tooltip.style("opacity", 0);
								  			d3.selectAll("rect").transition().duration(200)
								              .attr("stroke-width", 0);
								  		})
								  	.on("click", function(d, i) {
								  			d3.selectAll("polygon").remove().transition().duration(200);
								  			d3.selectAll("line").remove().transition().duration(200);
								  			d3.select("g").append("polygon").transition().duration(200)
								  			.attr("id", "triangle")
								  			.attr("points", function() {
								  					var width = sizeOfRects * .75;
												  	var height = sizeOfRects * .75;
												  	var xDetect;
											  		if (i>13) {
											  			xDetect = ((i*sizeOfRects) + (sizeOfRects*.75));
											  		} else {
											  			xDetect = ((i*sizeOfRects) + 12);
											  		}
												  	var y = 15;
												  	var x1 = (xDetect + xDetect + width) / 2;
												  	var y1 = (y + height) * .93;
												  	var x2 = (xDetect + x1) / 2;
												  	var y2 = y + (1.35 * height);
												  	var x3 = ((xDetect + width) + x1) / 2;
												  	var y3 = y + (1.35 * height);
												  	return "" + x1 + "," + y1 + "," + x2 + "," + y2 + "," + x3 + "," + y3;
								  				})
								  			.attr("fill", "white");
								  			d3.select("g").append("line").transition().duration(200)
											  			.attr("x1", -150)
											  			.attr("x2", function() {
											  					var xDetect;
														  		if (i>13) {
														  			xDetect = ((i*sizeOfRects) + (sizeOfRects*.75));
														  		} else {
														  			xDetect = ((i*sizeOfRects) + 12);
														  		}
														  		return (xDetect + (xDetect + (sizeOfRects * .375))) / 2;
											  				})
											  			.attr("y1", 15 + (1.35 * sizeOfRects * .75))
											  			.attr("y2", 15 + (1.35 * sizeOfRects * .75))
											  			.attr("stroke", "#616161")
											  			.attr("stroke-width", 1);
								  			d3.select("g").append("line").transition().duration(200)
											  			.attr("x1", function() {
											  					var xDetect;
														  		if (i>13) {
														  			xDetect = ((i*sizeOfRects) + (sizeOfRects*.75));
														  		} else {
														  			xDetect = ((i*sizeOfRects) + 12);
														  		}
														  		return ((xDetect + (sizeOfRects * .75)) + ((xDetect + xDetect + (sizeOfRects * .75)) / 2)) / 2;
											  				})
											  			.attr("x2", 1000)
											  			.attr("y1", 15 + (1.35 * sizeOfRects * .75))
											  			.attr("y2", 15 + (1.35 * sizeOfRects * .75))
											  			.attr("stroke", "#616161")
											  			.attr("stroke-width", 1);
								  			d3.select("g").append("line").transition().duration(200)
											  			.attr("x1", function() {
											  					var xDetect;
														  		if (i>13) {
														  			xDetect = ((i*sizeOfRects) + (sizeOfRects*.75));
														  		} else {
														  			xDetect = ((i*sizeOfRects) + 12);
														  		}
														  		return (xDetect + (xDetect + (sizeOfRects * .375))) / 2;
											  				})
											  			.attr("x2", function() {
											  					var xDetect;
														  		if (i>13) {
														  			xDetect = ((i*sizeOfRects) + (sizeOfRects*.75));
														  		} else {
														  			xDetect = ((i*sizeOfRects) + 12);
														  		}
														  		return ((xDetect + (sizeOfRects * .75)) + ((xDetect + xDetect + (sizeOfRects * .75)) / 2)) / 2;
											  				})
											  			.attr("y1", 15 + (1.35 * sizeOfRects * .75))
											  			.attr("y2", 15 + (1.35 * sizeOfRects * .75))
											  			.attr("stroke", "white")
											  			.attr("stroke-width", 2);
								  		});
				
		var homeIcons = calendarHeatMap.selectAll("image")
	  								.data(generatedData)
	  								.enter()
	  								.append("svg:image")
	  								.attr("xlink:href", function(d) {
									  			if(d.homeGame==true) {
									  				return "img/home2.png";
									  			} else {
									  				return "";
									  			}
									  		})
					                .attr("x", function(d, i) {
										  		if (i>13) {
										  			return ((i*sizeOfRects) + (sizeOfRects*.75) + 29);
										  		} else {
										  			return ((i*sizeOfRects) + 40);
										  		}
										  	})
									.attr("y", 13)
					                .attr("width", "16")
					                .attr("height", "16");

	});
	

}