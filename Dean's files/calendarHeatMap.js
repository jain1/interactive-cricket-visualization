function launchCalendarHeatMap(seasonNum, teamN) {

	var widthCHM = 900;
  	var heightCHM = 150;
	
	var treemapSelected = document.querySelector(".treemap");
	//treemapSelected.style.visibility = "hidden";
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
	        /*
	        for(i=0; i<matches.length; i++) {
	        	matchN[i] = matches[i].matchNumber;
	        	venue[i] = matches[i].homeGame;
	        	results[i] = matches[i].winner;
	        	if(matches[i].firstInnings.battingTeam == teamN) {
	        		opponents[i] = matches[i].firstInnings.bowlingTeam;
	        	} else {
	        		opponents[i] = matches[i].firstInnings.battingTeam;
	        	}
	        }
	        teamInfo.teamName = teamN;
	        teamInfo.matchNumbers = matchN;
	        teamInfo.opponents = opponents;
	        teamInfo.venue = venue;
	        teamInfo.teamName = teamN;
	        teamInfo.results = results;

	        generatedData = teamInfo;
	        */
	        generatedData = matches;
	        for(i=0; i<matches.length; i++) {
	        	if(matches[i].firstInnings.battingTeam == teamN) {
	        		generatedData[i].opponent = matches[i].firstInnings.bowlingTeam;
	        	} else {
	        		generatedData[i].opponent = matches[i].firstInnings.battingTeam;
	        	}
	        }

	        //generatedData = matches;
	        
	        /*
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
	        */
	        //generatedJSON = {name: "tree", children: teamInfoArray};
	      }

    	});
		console.log(generatedData);
		console.log(generatedData.length);
		var sizeOfRects = (widthCHM / generatedData.length);
		var sizeOfRects = sizeOfRects * .90;
		console.log(sizeOfRects);

		var tooltip = d3.select(".calendar-heat-map").append("div")
                  .attr("class", "tooltip")
                  .style("opacity", 0);

		var calendarHeatMap = d3.select(".calendar-heat-map")
								.append("svg")
								.attr("width", widthCHM)
								.attr("height", heightCHM)
								.append("g")
								.attr("transform", "translate(50,50)");

		var bars = calendarHeatMap.selectAll("rect")
								  .data(generatedData)
								  .enter()
								  	.append("rect")
								  	.attr("class", "form-square")
								  	.attr("width", sizeOfRects * .85)
								  	.attr("height", sizeOfRects * .85)
								  	.attr("x", function(d, i) {
									  		if (i>13) {
									  			return ((i*sizeOfRects) + (sizeOfRects*.75));
									  		} else {
									  			return ((i*sizeOfRects) + 12);
									  		}
								  		})
								  	.attr("y", 5)
								  	.attr("fill", function(d) {
								  			if (d.winner==true) {
								  				return "green";
								  			} else if (d.winner==null) {
								  				return "gray";
								  			} else if (d.winner==false) {
								  				return "red";
								  			}
								  		})
								  	.attr("rx", 5)
								  	.on("mouseover", function(d, i) {
								  			//tooltip.style("opacity", .9);
								  			tooltip.html(teamN + " vs. " + d.opponent + "<br>match number: " + d.matchNumber)
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
								  		});
		var homeLabels = calendarHeatMap.selectAll("g")
										.data(generatedData)
										.enter()
										.append('text')
										.attr("x", function(d, i) {
										  		if (i>13) {
										  			return ((i*sizeOfRects) + (sizeOfRects*.75) + 18);
										  		} else {
										  			return ((i*sizeOfRects) + 30);
										  		}
									  		})
										.attr("y", sizeOfRects/3)
									  	.text(function(d) {
									  			if(d.homeGame==true) {
									  				return "(H)";
									  			} else {
									  				return "";
									  			}
									  			

									  		})
									  	.attr("fill", "white")
									  	.attr("stroke", "none");
	
	});
	

}