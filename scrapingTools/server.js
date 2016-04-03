var express = require('express');
var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

//loading JSON files
var teams = require('./teams.json');


//constructors
function season(seasonNumber){
    this.seasonNumber = seasonNumber;
    this.teams = [];
}

function team(teamName){
    this.teamName = teamName;
    this.squad = []
    this.matches = [];
}

function match(matchNumber){
    this.matchNumber = matchNumber
    this.winner = null;
    this.firstInnings = new innings();
    this.secondInnings = new innings();
}

function innings(){
    this.batsmen = [];
    this.bowlers = [];
    this.commentary = [];
    this.battingTeam = null;
    this.bowlingTeam = null;
}

function ball(over, ball, run, batsman, bowler){
    this.over = over;
    this.ball = ball;
    this.run = run;
    this.batsman = batsman;
    this.bowler = bowler;
}

//helper function
function teamIndex(team){
    if (team === 'Mumbai Indians') return 0;
    else if (team === 'Kings XI Punjab') return 1;
    else if (team === 'Rajasthan Royals') return 2;
    else if (team === 'Chennai Super Kings') return 3;
    else if (team === 'Royal Challengers Bangalore') return 4;
    else if (team === 'Deccan Chargers') return 5;
    else if (team === 'Kolkata Knight Riders') return 6;
    else if (team === 'Delhi Daredevils') return 7;
    else return -1;
}

//our JavaScript objects
var ipl = [];
ipl.push(new season(1));

app.get('/scrape', function(req, res){
    //*************************************************************************
    //Scraping Team Data
    //*************************************************************************
    var teamStart = 338082,
        matchStart = 335982;

    var teamURL = 'http://www.espncricinfo.com/ipl/content/squad/',
        url = 'http://www.espncricinfo.com/ipl/engine/match/';

    startTeamScrape(0,teamURL, makeTeam)


    function startTeamScrape (number, teamURL, callback){
        var newURL = teamURL + (teamStart + number) + '.html';
        var teamName = null;
        //get team name
        request(newURL, function(error, response, html){
            $ = cheerio.load(html);
            $('h1').filter(function(){
                teamName = $(this).text();
                teamName = teamName.split(" / ")[0].trim()
                ipl[0].teams[number] = new team(teamName);
            })
            callback(number, newURL, startTeamScrape, startMatchScrape)
        })

    }

    function makeTeam(number, newURL, callback2, callback3){
        request(newURL, function(error, response, html){
            $ = cheerio.load(html);
            $('h3').filter(function(){
                var d = String($(this).children().text());
                d = d.trim();
                if (d.indexOf('\r') > 0) d = d.slice(0, d.indexOf('\r'));
                ipl[0].teams[number].squad.push(d);
            })
            console.log(ipl[0].teams[number].squad);
            number++;
            if (number < 8){
                callback2(number, teamURL, makeTeam)
            }
            else {
                console.log("***********finished team squad scraping***********");
                console.log(ipl[0]);
                callback3(url, 0)
            }
        })
    }

    function startMatchScrape(url, number){
        var newURL = url + (matchStart + number) + '.html?innings=1;view=commentary';
        console.log(newURL);
    }

    //var teamStart = 338082,
    //    teamNumber = 0;
    //
    //var teamURL = 'http://www.espncricinfo.com/ipl/content/squad/'
    //
    //teams[0] = new team("Mumbai Indians")
    //var url0 = teamURL + (teamStart) + '.html';
    //
    //teams[1] = new team("Kings XI Punjab")
    //var url1 = teamURL + (teamStart + 1) + '.html';
    //
    //teams[2] = new team("Rajasthan Royals")
    //var url2 = teamURL + (teamStart + 2) + '.html';
    //
    //teams[3] = new team("Chennai Super Kings")
    //var url3 = teamURL + (teamStart + 3) + '.html';
    //
    //teams[4] = new team("Royal Challengers Bangalore")
    //var url4 = teamURL + (teamStart + 4) + '.html';
    //
    //teams[5] = new team("Deccan Chargers")
    //var url5 = teamURL + (teamStart + 5) + '.html';
    //
    //teams[6] = new team("Kolkata Knight Riders")
    //var url6 = teamURL + (teamStart + 6) + '.html';
    //
    //teams[7] = new team("Delhi Daredevils")
    //var url7 = teamURL + (teamStart + 7) + '.html';
    //
    //request(url0, function(error, response, html){
    //    $ = cheerio.load(html);
    //    $('h3').filter(function(){
    //        var d = String($(this).children().text());
    //        d = d.trim();
    //        if (d.indexOf('\r') > 0) d = d.slice(0, d.indexOf('\r'));
    //        teams[0].squad.push(d);
    //    })
    //})
    //
    //request(url1, function(error, response, html){
    //    $ = cheerio.load(html);
    //    $('h3').filter(function(){
    //        var d = String($(this).children().text());
    //        d = d.trim();
    //        if (d.indexOf('\r') > 0) d = d.slice(0, d.indexOf('\r'));
    //        teams[1].squad.push(d);
    //    })
    //})
    //
    //request(url2, function(error, response, html){
    //    $ = cheerio.load(html);
    //    $('h3').filter(function(){
    //        var d = String($(this).children().text());
    //        d = d.trim();
    //        if (d.indexOf('\r') > 0) d = d.slice(0, d.indexOf('\r'));
    //        teams[2].squad.push(d);
    //    })
    //})
    //
    //request(url3, function(error, response, html){
    //    $ = cheerio.load(html);
    //    $('h3').filter(function(){
    //        var d = String($(this).children().text());
    //        d = d.trim();
    //        if (d.indexOf('\r') > 0) d = d.slice(0, d.indexOf('\r'));
    //        teams[3].squad.push(d);
    //    })
    //})
    //
    //request(url4, function(error, response, html){
    //    $ = cheerio.load(html);
    //    $('h3').filter(function(){
    //        var d = String($(this).children().text());
    //        d = d.trim();
    //        if (d.indexOf('\r') > 0) d = d.slice(0, d.indexOf('\r'));
    //        teams[4].squad.push(d);
    //    })
    //})
    //
    //request(url5, function(error, response, html){
    //    $ = cheerio.load(html);
    //    $('h3').filter(function(){
    //        var d = String($(this).children().text());
    //        d = d.trim();
    //        if (d.indexOf('\r') > 0) d = d.slice(0, d.indexOf('\r'));
    //        teams[5].squad.push(d);
    //    })
    //})
    //
    //request(url6, function(error, response, html){
    //    $ = cheerio.load(html);
    //    $('h3').filter(function(){
    //        var d = String($(this).children().text());
    //        d = d.trim();
    //        if (d.indexOf('\r') > 0) d = d.slice(0, d.indexOf('\r'));
    //        teams[6].squad.push(d);
    //    })
    //})
    //
    //request(url7, function(error, response, html){
    //    $ = cheerio.load(html);
    //    $('h3').filter(function(){
    //        var d = String($(this).children().text());
    //        d = d.trim();
    //        if (d.indexOf('\r') > 0) d = d.slice(0, d.indexOf('\r'));
    //        teams[7].squad.push(d);
    //    })
    //})
    //
    //setTimeout(function(){
    //    //console.log("our list of URL's:")
    //    //console.log(teams);
    //    //console.log("Finished scraping team: **************************************");
    //    console.log(JSON.stringify(teams))
    //}, 5000)



    ////Let's scrape match data!!
    //var url = 'http://www.espncricinfo.com/ipl/engine/match/' + (startingMatch + matchNumber) + '.html';
    //
    ////*************************************************************************
    ////Collecting Data about the matches
    ////*************************************************************************
    //url = url.concat('?innings=1;view=commentary');
    //request(url, function(error, response, html){
    //    $ = cheerio.load(html);
    //
    //    $('ul.tabs-block').filter(function(){
    //        var d = $(this).children().text();
    //        d = d.trim();
    //        d = d.replace(/ innings/g, '*');
    //        var tokens = d.split('*');
    //
    //        match.firstInnings.battingTeam = tokens[0].trim();
    //        match.firstInnings.bowlingTeam = tokens[1].trim();
    //
    //        match.secondInnings.battingTeam = tokens[1].trim();
    //        match.secondInnings.bowlingTeam = tokens[0].trim();
    //    })
    //
    //    $('div.innings-requirement').filter(function(){
    //        var d = $(this).text();
    //        d = d.split(' won')
    //        d = d[0].trim();
    //
    //        match.winner = d;
    //    })
    //
    //    $('li.commsMenuNonSelected').filter(function() {
    //        var d = $(this).children().text().trim();
    //
    //        if (d !== "Fours" && d !== "Sixes" && d !== "Wickets"){
    //            if (d.indexOf('/') > 0){
    //                //means its a bowler
    //                var tokens = d.split(' ');
    //                d = tokens[0].charAt(0) + tokens[1];
    //                var squad = teams[teamIndex(match.firstInnings.bowlingTeam)].squad;
    //                for (var i = 0; i < squad.length; i ++){
    //                    var curr = squad[i].split(' ');
    //                    curr = curr[0].charAt(0) + curr[1];
    //                    if (curr === d){
    //                        match.firstInnings.bowlers.push(squad[i]);
    //                        break;
    //                    }
    //                }
    //            }
    //            else {
    //                var tokens = d.split(' ');
    //                d = tokens[0].charAt(0) + tokens[1];
    //                var squad = teams[teamIndex(match.firstInnings.battingTeam)].squad;
    //                for (var i = 0; i < squad.length; i ++){
    //                    var curr = squad[i].split(' ');
    //                    curr = curr[0].charAt(0) + curr[1];
    //                    if (curr === d){
    //                        match.firstInnings.batsmen.push(squad[i]);
    //                        break;
    //                    }
    //                }
    //            }
    //        }
    //
    //    })
    //
    //    $('div.commentary-event').filter(function(){
    //        var d = $(this).text().split("\t");
    //        var l = d.length;
    //        //remove the 0th, 2nd, 3rd, n-2th, n-1th, nth items
    //        d.splice(l-3,3);
    //        d.splice(0,1);
    //        d.splice(1,2);
    //
    //        //getting rid of line breaks
    //        for (var i = 0; i < d.length; i++) d[i] = d[i].replace(/(?:\r\n|\r|\n)/g, '');
    //
    //        //getting rid of extra space:
    //        if (d.length > 1){
    //            d[0] = d[0].trim();
    //            var overInfo = d[0].split('.');
    //            var ballInfo = d[1].split(',');
    //            var playerInfo = ballInfo[0].split(' ');
    //            var run;
    //
    //            if (ballInfo[1].indexOf('no') >= 0) run = 0;
    //            else if (ballInfo[1].indexOf('OUT') >= 0) run = 'W';
    //            else if (ballInfo[1].indexOf('FOUR') >= 0) run = 4;
    //            else if (ballInfo[1].indexOf('SIX') >= 0) run = 6;
    //            else run = Number(ballInfo[1].charAt(0));
    //
    //            var bat;
    //            var bowl;
    //
    //            for (var i = 0; i < match.firstInnings.batsmen.length; i++){
    //                if (match.firstInnings.batsmen[i].indexOf(playerInfo[2]) >= 0){
    //                    bat = match.firstInnings.batsmen[i];
    //                    break;
    //                }
    //            }
    //
    //            for (var j = 0; j < match.firstInnings.bowlers.length; j++){
    //                if (match.firstInnings.bowlers[j].indexOf(playerInfo[0]) >= 0){
    //                    bowl = match.firstInnings.bowlers[j];
    //                    break;
    //                }
    //            }
    //
    //            var newBall = new ball(overInfo[0], overInfo[1], run, bat, bowl);
    //            match.firstInnings.commentary.push(newBall);
    //        }
    //    })
    //})
    //
    ////secondInnings
    //url = url.replace('innings=1', 'innings=2');
    //request(url, function(error, response, html){
    //    $ = cheerio.load(html);
    //    $('li.commsMenuNonSelected').filter(function() {
    //        var d = $(this).children().text().trim();
    //        if (d !== "Fours" && d !== "Sixes" && d !== "Wickets"){
    //            if (d.indexOf('/') > 0){
    //                //means its a bowler
    //                var tokens = d.split(' ');
    //                d = tokens[0].charAt(0) + tokens[1];
    //                var squad = teams[teamIndex(match.secondInnings.bowlingTeam)].squad;
    //                for (var i = 0; i < squad.length; i ++){
    //                    var curr = squad[i].split(' ');
    //                    curr = curr[0].charAt(0) + curr[1];
    //                    if (curr === d){
    //                        match.secondInnings.bowlers.push(squad[i]);
    //                        break;
    //                    }
    //                }
    //            }
    //            else {
    //                var tokens = d.split(' ');
    //                d = tokens[0].charAt(0) + tokens[1];
    //                var squad = teams[teamIndex(match.secondInnings.battingTeam)].squad;
    //                for (var i = 0; i < squad.length; i ++){
    //                    var curr = squad[i].split(' ');
    //                    curr = curr[0].charAt(0) + curr[1];
    //                    if (curr === d){
    //                        match.secondInnings.batsmen.push(squad[i]);
    //                        break;
    //                    }
    //                }
    //            }
    //        }
    //
    //    })
    //
    //    $('div.commentary-event').filter(function(){
    //        var d = $(this).text().split("\t");
    //        var l = d.length;
    //        //remove the 0th, 2nd, 3rd, n-2th, n-1th, nth items
    //        d.splice(l-3,3);
    //        d.splice(0,1);
    //        d.splice(1,2);
    //
    //        //getting rid of line breaks
    //        for (var i = 0; i < d.length; i++) d[i] = d[i].replace(/(?:\r\n|\r|\n)/g, '');
    //
    //        //getting rid of extra space:
    //        if (d.length > 1){
    //            d[0] = d[0].trim();
    //            var overInfo = d[0].split('.');
    //            var ballInfo = d[1].split(',');
    //            var playerInfo = ballInfo[0].split(' ');
    //            var run;
    //
    //            if (ballInfo[1].indexOf('no') >= 0) run = 0;
    //            else if (ballInfo[1].indexOf('OUT') >= 0) run = 'W';
    //            else if (ballInfo[1].indexOf('FOUR') >= 0) run = 4;
    //            else if (ballInfo[1].indexOf('SIX') >= 0) run = 6;
    //            else run = Number(ballInfo[1].charAt(0));
    //
    //            var bat;
    //            var bowl;
    //
    //            for (var i = 0; i < match.secondInnings.batsmen.length; i++){
    //                if (match.secondInnings.batsmen[i].indexOf(playerInfo[2]) >= 0){
    //                    bat = match.secondInnings.batsmen[i];
    //                    break;
    //                }
    //            }
    //
    //            for (var j = 0; j < match.secondInnings.bowlers.length; j++){
    //                if (match.secondInnings.bowlers[j].indexOf(playerInfo[0]) >= 0){
    //                    bowl = match.secondInnings.bowlers[j];
    //                    break;
    //                }
    //            }
    //
    //            var newBall = new ball(overInfo[0], overInfo[1], run, bat, bowl);
    //            match.secondInnings.commentary.push(newBall)
    //        }
    //    })
    //})
    //
    //setTimeout(function(){
    //    season.matches.push(match);
    //    console.log(JSON.stringify(season));
    //}, 5000)
})

app.listen('8081')
exports = module.exports = app
