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
    //average win = [by runs, by wickets, max by runs, max by wickets]
    this.averageRunMargin = [0, 0];
    this.averageWicketMargin = [0,0]
    //maxMargin = [max by runs, max by wickets]
    this.maxRunMargin = 0;
    this.maxWicketMargin = 0;
    this.numberOfAbandonedMatches = 0;
}

function team(teamName){
    this.teamName = teamName;
    this.squad = [];
    this.matches = [];
}

function match(matchNumber){
    this.matchNumber = matchNumber;
    this.homeGame = null;
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
    for (var i = 0; i < ipl[currentSeason-1].teams.length; i++){
        if (ipl[currentSeason-1].teams[i].teamName == team) return i;
    }
}

//our JavaScript objects
var currentSeason = 1;
var ipl = [];
ipl.push(new season(currentSeason));
ipl.push(new season(currentSeason + 1));

var matchIndicies = [];

app.get('/scrape', function(req, res){
    //*************************************************************************
    //Scraping Team Data
    //*************************************************************************
    var teamStart = 338082,
        matchStart = 335982;

    var teamURL = 'http://www.espncricinfo.com/ipl/content/squad/',
        url = 'http://www.espncricinfo.com/ipl/engine/match/',
        matchIndexURL = 'http://www.espncricinfo.com/ipl/engine/series/313494.html';

    scrapeMatchIndex(startTeamScrape);

    function scrapeMatchIndex (callbackInit){
        if (matchIndicies.length == 0) { //to fix bug that reloads the page and restarts the web scrapping session
            request(matchIndexURL, function (error, response, html) {
                $ = cheerio.load(html);

                $('span.potMatchLink').filter(function () {
                    d = $(this).children()[0].attribs.href;
                    tokens = d.split('/');
                    d = tokens[tokens.length - 1]; //last element
                    d = Number(d.split('.')[0])

                    matchIndicies.push(d);
                })
                //matchIndicies.sort();
                console.log(matchIndicies.length);
                console.log(matchIndicies);
                callbackInit(0, teamURL, makeTeam);
            })
        }

    }

    function startTeamScrape (number, teamURL, callback){
        var newURL = teamURL + (teamStart + number) + '.html';
        var teamName = null;
        //get team name
        request(newURL, function(error, response, html){
            $ = cheerio.load(html);

            $('h1').filter(function(){
                teamName = $(this).text();
                teamName = teamName.split(" Squad")[0].trim()
                if (teamName === "Bangalore Royal Challengers"){
                    teamName = 'Royal Challengers Bangalore'
                }
                ipl[currentSeason - 1].teams[number] = new team(teamName);
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
                ipl[currentSeason - 1].teams[number].squad.push(d);
            })

            //*****print statement to check current team's season squad
            console.log(ipl[currentSeason - 1].teams[number].squad);

            number++;
            if (number < 8){
                callback2(number, teamURL, makeTeam)
            }
            else {
                console.log("***********finished team squad scraping***********");
                console.log(ipl[currentSeason - 1]);
                callback3(url, 0, findHomeAwayTeam)
            }
        })
    }

    function startMatchScrape(url, number, callback){
        console.log('##########################Scraping a new match!!##########################')
        console.log('this is match number: ' + (number + 1));
        console.log(matchIndicies[number])
        var newURL = url + (matchIndicies[number]) + '.html?innings=1;view=commentary';
        console.log('Match URL: ' + newURL);
        request(newURL, function(error, response, html) {
            $ = cheerio.load(html);
            $('ul.tabs-block').filter(function () {
                var d = $(this).children().text();
                d = d.trim();
                d = d.replace(/ innings/g, '*');
                var tokens = d.split('*');

                for (var i = 0; i < tokens.length-1; i++){
                    if (tokens[i].indexOf('...') > -1){
                        //get rid of the ... in the team name
                        tokens[i] = tokens[i].split('...')[1].trim();
                    }
                }

                if (tokens[0] !== undefined && tokens[1] !== undefined){
                    var team1 = tokens[0].trim();
                    var team2 = tokens[1].trim();

                    console.log("Team 1 is: " + team1);
                    console.log("Team 2 is: " + team2);

                    callback(newURL, number, team1, team2, decideWinner)
                }
                else{
                    console.log('%%%%%%%%%% Match Abandoned %%%%%%%%%%')
                    callback(newURL, number, undefined, undefined, startMatchScrape)
                }
            })
        })
    }

    function findHomeAwayTeam(newURL, number, team1, team2, callback2){
        request(newURL, function(error, response, html) {
            $ = cheerio.load(html);
            var homeTeam = null;
            $('div.team-1-name').filter(function () {
                homeTeam = $(this).children().first().text();
            })

            if (team1 !== undefined){
                var matchForTeam1,
                    matchForTeam2,
                    firstInnings,
                    secondInnings;

                matchForTeam1 = new match(number+1, true);
                matchForTeam2 = new match(number+1, false);

                firstInnings = new innings();
                secondInnings = new innings();

                firstInnings.battingTeam = team1;
                firstInnings.bowlingTeam = team2;
                secondInnings.battingTeam = team2;
                secondInnings.bowlingTeam = team1;

                if (team1 == homeTeam){
                    matchForTeam1.homeGame = true;
                    matchForTeam2.homeGame = false;
                }
                else if (team2 == homeTeam) {
                    matchForTeam1.homeGame = false;
                    matchForTeam2.homeGame = true;
                }
                else{
                    console.log("FATAL ERROR")
                }

                callback2(newURL, matchForTeam1, matchForTeam2, firstInnings, secondInnings, team1, team2,  matchSquad1)
            }
            else {
                var counter = 0
                var awayTeam;
                $('div.team-1-name').filter(function () {
                    awayTeam = $(this).children().last().text();
                })
                var match1 = new match(number+1);
                match1.homeGame = true;

                var match2 = new match(number+1);
                match2.homeGame = false;

                ipl[currentSeason-1].teams[teamIndex(homeTeam)].matches.push(match1);
                ipl[currentSeason-1].teams[teamIndex(awayTeam)].matches.push(match2);

                ipl[currentSeason-1].numberOfAbandonedMatches++; //increment number of abandoned matches

                number = match1.matchNumber;
                if (number < matchIndicies.length){
                    callback2(url, number, findHomeAwayTeam)
                }
                else{
                    console.log(JSON.stringify(ipl));
                }


            }
        })
    }

    function decideWinner(newURL, matchForTeam1, matchForTeam2, firstInnings, secondInnings, team1, team2, callback3){
        var winner = [],
            margin;
        request(newURL, function(error, response, html) {
            $ = cheerio.load(html);
            $('div.innings-requirement').filter(function () {
                var d = $(this).text();
                d = d.split(' won')
                console.log(d)
                winner = d[0].trim();

                margin = Number(d[1].trim().split(' ')[1]);

                if (d[1].indexOf("run") >= 0){
                    ipl[currentSeason-1].averageRunMargin[0] += margin;
                    ipl[currentSeason-1].averageRunMargin[1]++;
                    console.log("the margin by runs is: " + margin);

                    //check if this is the max margin
                    if (ipl[currentSeason-1].maxRunMargin < margin) ipl[currentSeason-1].maxRunMargin = margin;
                }
                else{
                    ipl[currentSeason-1].averageWicketMargin[0] += margin;
                    ipl[currentSeason-1].averageWicketMargin[1]++;
                    console.log("the margin by wickets is: " + margin);
                    //check if this is the max margin
                    if (ipl[currentSeason-1].maxWicketMargin < margin) ipl[currentSeason-1].maxWicketMargin = margin;
                }

            });

            if (winner === team1){
                matchForTeam1.winner = true;
                matchForTeam2.winner = false;
            }
            else {
                matchForTeam1.winner = false;
                matchForTeam2.winner = true;
            }
            callback3(newURL, matchForTeam1, matchForTeam2, firstInnings, secondInnings, team1, team2, firstInningCommentary)
        });
    }

    function matchSquad1(newURL, matchForTeam1, matchForTeam2, firstInnings, secondInnings, team1, team2, callback4){
        request(newURL, function(error, response, html) {
            $ = cheerio.load(html);
            $('li.commsMenuNonSelected').filter(function () {
                var d = $(this).children().text().trim();
                if (d !== "Fours" && d !== "Sixes" && d !== "Wickets") {
                    if (d.indexOf('/') > 0) {
                        //means its a bowler
                        var tokens = d.split(' ');

                        //console.log('Preprocessed bowler info: ' + tokens);
                        //get rid of empty strings in tokens
                        var temp = [];
                        for (var k = 0; k < tokens.length; k++){
                            if (tokens[k] !== '') temp.push(tokens[k]);
                        }
                        tokens = temp;
                        if (tokens.length > 3) tokens.splice(0,1);
                        //console.log('Processed bowler info: ' + tokens);

                        if (tokens.length == 2) d = tokens[0];
                        else d = tokens[0].charAt(0) + tokens[1];

                        var d2;
                        if (tokens[0].length > 1) d2 = tokens[0].charAt(1) + tokens[1];

                        //console.log('$$ Our bowler candidate: ' + d);

                        var squad = ipl[currentSeason-1].teams[teamIndex(firstInnings.bowlingTeam)].squad;
                        for (var i = 0; i < squad.length; i++) {
                            var curr = squad[i].split(' ');

                            //sometimes have trailing spaces
                            if (curr.indexOf('') >= 0){
                                curr.splice(curr.indexOf(''),1);
                            }
                            //console.log('Processed curr: ' + curr);

                            //check length to see if it just last name
                            if (curr.length > 1 && (curr[0].charAt(0) + curr[1] === d || (d2 !== undefined && curr[0].charAt(0) + curr[1] === d2))){
                                firstInnings.bowlers.push(squad[i]);
                                break;
                            }
                            else if (curr.length == 1 && curr[0] === d.substr(1, d.length-1)){
                                firstInnings.bowlers.push(squad[i]);
                                break;
                            }
                        }
                        //console.log();
                    }
                    else {
                        var tokens = d.split(' ');

                        //get rid of empty strings in tokens
                        var temp = [];
                        for (var k = 0; k < tokens.length; k++){
                            if (tokens[k] !== '') temp.push(tokens[k]);
                        }
                        tokens = temp;
                        if (tokens.length > 3) tokens.splice(0,1);

                        if (tokens.length == 2) d = tokens[0];
                        else d = tokens[0].charAt(0) + tokens[1];

                        var d2;
                        if (tokens[0].length > 1) d2 = tokens[0].charAt(1) + tokens[1];

                        var squad = ipl[currentSeason-1].teams[teamIndex(firstInnings.battingTeam)].squad;
                        for (var i = 0; i < squad.length; i++) {
                            var curr = squad[i].split(' ');

                            //sometimes have trailing spaces
                            if (curr.indexOf('') >= 0){
                                curr.splice(curr.indexOf(''),1);
                            }

                            //check length to see if it just last name
                            if (curr.length > 1 && (curr[0].charAt(0) + curr[1] === d || (d2 !== undefined && curr[0].charAt(0) + curr[1] === d2))){
                                firstInnings.batsmen.push(squad[i]);
                                break;
                            }
                            else if (curr.length == 1 && curr[0] === d.substr(1, d.length-1)){
                                firstInnings.batsmen.push(squad[i]);
                                break;
                            }
                        }
                    }
                }

            });
            console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
            console.log("finsihed scrapping match squad for first innings");
            console.log(firstInnings.batsmen);
            console.log(firstInnings.bowlers);
            console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');

            callback4(newURL, matchForTeam1, matchForTeam2, firstInnings, secondInnings, team1, team2, matchSquad2);
        });
    }

    function firstInningCommentary(newURL, matchForTeam1, matchForTeam2, firstInnings, secondInnings, team1, team2, callback5){
        request(newURL, function(error, response, html) {
            $ = cheerio.load(html);
            $('div.commentary-event').filter(function(){
                var d = $(this).text().split("\t");
                var l = d.length;
                //remove the 0th, 2nd, 3rd, n-2th, n-1th, nth items
                d.splice(l-3,3);
                d.splice(0,1);
                d.splice(1,2);

                //getting rid of line breaks
                for (var i = 0; i < d.length; i++) d[i] = d[i].replace(/(?:\r\n|\r|\n)/g, '');

                //getting rid of extra space:
                if (d.length > 1){
                    d[0] = d[0].trim();
                    var overInfo = d[0].split('.');
                    var ballInfo = d[1].split(',');
                    var playerInfo = ballInfo[0].split(' ');
                    var run;

                    if (ballInfo[1].indexOf('no') >= 0) run = 0;
                    else if (ballInfo[1].indexOf('OUT') >= 0) run = 'W';
                    else if (ballInfo[1].indexOf('FOUR') >= 0) run = 4;
                    else if (ballInfo[1].indexOf('SIX') >= 0) run = 6;
                    else run = Number(ballInfo[1].charAt(0));

                    var bat;
                    var bowl;

                    //console.log('Pre-Processed Player Info: ' + playerInfo);
                    //preprocessing player info
                    if (playerInfo.length > 3){
                        if (playerInfo[1] === 'to'){
                            //splice 2nd index (3rd element)
                            playerInfo.splice(2,1);
                        }
                        else if (playerInfo[2] === 'to'){
                            //splice 1st index (2nd element)
                            playerInfo.splice(1,1);
                        }
                    }
                    //console.log('Processed Player Info: ' + playerInfo);


                    //console.log('&& Looking for batsman: ' + playerInfo[2]);
                    for (var i = 0; i < firstInnings.batsmen.length; i++){
                        //console.log('comparing against: ' + firstInnings.batsmen[i]);
                        if (firstInnings.batsmen[i].indexOf(playerInfo[2]) >= 0){
                            bat = firstInnings.batsmen[i];
                            break;
                        }
                    }

                    //console.log('&& Looking for bowler: ' + playerInfo[0]);
                    for (var j = 0; j < firstInnings.bowlers.length; j++){
                        //console.log('comparing against: ' + firstInnings.bowlers[j]);
                        if (firstInnings.bowlers[j].indexOf(playerInfo[0]) >= 0){
                            bowl = firstInnings.bowlers[j];
                            break;
                        }
                    }

                    //console.log('batsmen: ' + bat);
                    //console.log('bowler: ' + bowl);
                    //console.log();

                    var newBall = new ball(overInfo[0], overInfo[1], run, bat, bowl);
                    firstInnings.commentary.push(newBall);
                }
            })
            callback5(newURL, matchForTeam1, matchForTeam2, firstInnings, secondInnings, team1, team2, secondInningsCommentary)
        });

    }

    function matchSquad2(newURL, matchForTeam1, matchForTeam2, firstInnings, secondInnings, team1, team2, callback6){
        newURL = newURL.replace('innings=1', 'innings=2');
        request(newURL, function(error, response, html) {
            $ = cheerio.load(html);
            $('li.commsMenuNonSelected').filter(function () {
                var d = $(this).children().text().trim();
                if (d !== "Fours" && d !== "Sixes" && d !== "Wickets") {
                    if (d.indexOf('/') > 0) {
                        //means its a bowler
                        var tokens = d.split(' ');

                        //get rid of empty strings in tokens
                        var temp = [];
                        for (var k = 0; k < tokens.length; k++){
                            if (tokens[k] !== '') temp.push(tokens[k]);
                        }
                        tokens = temp;
                        if (tokens.length > 3) tokens.splice(0,1);

                        if (tokens.length == 2) d = tokens[0];
                        else d = tokens[0].charAt(0) + tokens[1];

                        var d2;
                        if (tokens[0].length > 1) d2 = tokens[0].charAt(1) + tokens[1];

                        var squad = ipl[currentSeason-1].teams[teamIndex(secondInnings.bowlingTeam)].squad;
                        for (var i = 0; i < squad.length; i++) {
                            var curr = squad[i].split(' ');

                            //sometimes have trailing spaces
                            if (curr.indexOf('') >= 0){
                                curr.splice(curr.indexOf(''),1);
                            }

                            //check length to see if it just last name
                            if (curr.length > 1 && (curr[0].charAt(0) + curr[1] === d || (d2 !== undefined && curr[0].charAt(0) + curr[1] === d2))){
                                secondInnings.bowlers.push(squad[i]);
                                break;
                            }
                            else if (curr.length == 1 && curr[0] === d.substr(1, d.length-1)){
                                secondInnings.bowlers.push(squad[i]);
                                break;
                            }
                        }
                    }
                    else {
                        var tokens = d.split(' ');


                        //get rid of empty strings in tokens
                        var temp = [];
                        for (var k = 0; k < tokens.length; k++){
                            if (tokens[k] !== '') temp.push(tokens[k]);
                        }
                        tokens = temp;
                        if (tokens.length > 3) tokens.splice(0,1);

                        if (tokens.length == 2) d = tokens[0];
                        else d = tokens[0].charAt(0) + tokens[1];

                        var d2;
                        if (tokens[0].length > 1) d2 = tokens[0].charAt(1) + tokens[1];

                        var squad = ipl[currentSeason-1].teams[teamIndex(secondInnings.battingTeam)].squad;
                        for (var i = 0; i < squad.length; i++) {
                            var curr = squad[i].split(' ');

                            //sometimes have trailing spaces
                            if (curr.indexOf('') >= 0){
                                curr.splice(curr.indexOf(''),1);
                            }

                            //check length to see if it just last name
                            if (curr.length > 1 && (curr[0].charAt(0) + curr[1] === d || (d2 !== undefined && curr[0].charAt(0) + curr[1] === d2))){
                                secondInnings.batsmen.push(squad[i]);
                                break;
                            }
                            else if (curr.length == 1 && curr[0] === d.substr(1, d.length-1)){
                                secondInnings.batsmen.push(squad[i]);
                                break;
                            }
                        }
                    }
                }

            })
            console.log("finsihed scrapping match squad for second innings");
            console.log(secondInnings.batsmen);
            console.log(secondInnings.bowlers);
            console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
            callback6(newURL, matchForTeam1, matchForTeam2, firstInnings, secondInnings, team1, team2, startMatchScrape)
        });
    }

    function secondInningsCommentary(newURL, matchForTeam1, matchForTeam2, firstInnings, secondInnings, team1, team2, callback7){
        request(newURL, function(error, response, html) {
            $ = cheerio.load(html);
            $('div.commentary-event').filter(function(){
                var d = $(this).text().split("\t");
                var l = d.length;
                //remove the 0th, 2nd, 3rd, n-2th, n-1th, nth items
                d.splice(l-3,3);
                d.splice(0,1);
                d.splice(1,2);

                //getting rid of line breaks
                for (var i = 0; i < d.length; i++) d[i] = d[i].replace(/(?:\r\n|\r|\n)/g, '');

                //getting rid of extra space:
                if (d.length > 1){
                    d[0] = d[0].trim();
                    var overInfo = d[0].split('.');
                    var ballInfo = d[1].split(',');
                    var playerInfo = ballInfo[0].split(' ');
                    var run;

                    if (ballInfo[1].indexOf('no') >= 0) run = 0;
                    else if (ballInfo[1].indexOf('OUT') >= 0) run = 'W';
                    else if (ballInfo[1].indexOf('FOUR') >= 0) run = 4;
                    else if (ballInfo[1].indexOf('SIX') >= 0) run = 6;
                    else run = Number(ballInfo[1].charAt(0));

                    var bat;
                    var bowl;

                    //preprocessing player info
                    if (playerInfo.length > 3){
                        if (playerInfo[1] === 'to'){
                            //splice 2nd index (3rd element)
                            playerInfo.splice(2,1);
                        }
                        else if (playerInfo[2] === 'to'){
                            //splice 1st index (2nd element)
                            playerInfo.splice(1,1);
                        }
                    }

                    for (var i = 0; i < secondInnings.batsmen.length; i++){
                        if (secondInnings.batsmen[i].indexOf(playerInfo[2]) >= 0){
                            bat = secondInnings.batsmen[i];
                            break;
                        }
                    }

                    for (var j = 0; j < secondInnings.bowlers.length; j++){
                        if (secondInnings.bowlers[j].indexOf(playerInfo[0]) >= 0){
                            bowl = secondInnings.bowlers[j];
                            break;
                        }
                    }

                    var newBall = new ball(overInfo[0], overInfo[1], run, bat, bowl);
                    secondInnings.commentary.push(newBall);
                }
            })
            matchForTeam1.firstInnings = firstInnings;
            matchForTeam1.secondInnings = secondInnings;

            matchForTeam2.firstInnings = firstInnings;
            matchForTeam2.secondInnings = secondInnings;

            ipl[currentSeason-1].teams[teamIndex(team1)].matches.push(matchForTeam1);
            ipl[currentSeason-1].teams[teamIndex(team2)].matches.push(matchForTeam2);

            var number = matchForTeam1.matchNumber;
            //if (number < 2){ //USE FOR TESTING PURPOSES
            //    callback7(url, number, findHomeAwayTeam)
            //}
            if (number < matchIndicies.length){ //matchIndicies.length
                callback7(url, number, findHomeAwayTeam)
            }
            else{
                console.log("Before calculating average!!")
                console.log(ipl[currentSeason-1].averageRunMargin);
                console.log(ipl[currentSeason-1].averageWicketMargin)

                //calculate the average margin by dividing by total number of matches
                ipl[currentSeason-1].averageRunMargin[0] /= (ipl[currentSeason-1].averageRunMargin[1]);
                ipl[currentSeason-1].averageWicketMargin[0] /= (ipl[currentSeason-1].averageWicketMargin[1]);

                console.log(ipl[currentSeason-1].averageRunMargin);
                console.log(ipl[currentSeason-1].averageWicketMargin)
                console.log("Max wins: " + ipl[currentSeason-1].maxRunMargin + ", " + ipl[currentSeason-1].maxWicketMargin);

                console.log(JSON.stringify(ipl)); //prints out the JSON to the console
            }


        });
    }
})

app.listen('8081')
exports = module.exports = app
