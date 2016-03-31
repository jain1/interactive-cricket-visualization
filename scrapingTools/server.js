var express = require('express');
var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();


//variables
var matchNumber = 1;
var startingMatch = 335981;


//constructors
function match(){
    this.result = null;
    this.firstInnings = new innings();
    this.secondInnings = new innings();
}

function innings(){
    this.batsmen = [];
    this.bowlers = [];
    this.commentary = [];
    //bowling team
    //batting team
}

function ball(over, ball, run, batsman, bowler){
    this.over = over;
    this.ball = ball;
    this.run = run;
    this.batsman = batsman;
    this.bowler = bowler;
}

//our JavaScript objects
var match = new match();

app.get('/scrape', function(req, res){
    //*************************************************************************
    //Scraping Team Data
    //*************************************************************************
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



    //Let's scrape match data!!
    var url = 'http://www.espncricinfo.com/ipl/engine/match/' + (startingMatch + matchNumber) + '.html';
    console.log(url);

    //*************************************************************************
    //This part collects all the batsmen's name
    //*************************************************************************
    request(url, function(error, response, html){
        console.log("Starting scraping batsman: **************************************");
        $ = cheerio.load(html);
        //try using .each instead of .filter
        $('td.batsman-name').filter(function(){
            var d = $(this).text();
            d = d.replace('*','');


            //print statements
            console.log(d);


        })

        console.log("Finished scraping batsman: **************************************");

    })
    //*************************************************************************
    //This part collects all the bowler's name
    //*************************************************************************
    request(url, function(error, response, html){
        console.log("Starting scraping bowler: **************************************");
        $ = cheerio.load(html);

        $('td.bowler-name').filter(function(){
            var d = $(this).text();
            d = d.replace('*','');


            //print statements
            console.log(d);


        })

        console.log("Finished scraping bowler: **************************************");

    })





    //*************************************************************************
    //Changing the URL to access the commentary/getting batting/bowling teams
    //*************************************************************************
    url = url.concat('?innings=1;view=commentary');
    console.log("commentary url: " + url);
    //getting the team names and which batted first
    request(url, function(error, response, html){
        console.log("Starting scraping commentary: **************************************");
        $ = cheerio.load(html);

        $('ul.tabs-block').filter(function(){
            var d = $(this).children().text();
            d = d.trim();
            d = d.replace(/ innings/g, '*');
            var tokens = d.split('*');

            match.firstInnings.battingTeam = tokens[0].trim();
            match.firstInnings.bowlingTeam = tokens[1].trim();

            match.secondInnings.battingTeam = tokens[1].trim();
            match.secondInnings.bowlingTeam = tokens[0].trim();

            //print statements
            console.log(match.firstInnings.battingTeam + ', ' + match.secondInnings.battingTeam);


        })

        console.log("Finished scraping commentary: **************************************");

    })

    //*************************************************************************
    //This part deals with collecting the commentary data
    //*************************************************************************
    //first innings
    request(url, function(error, response, html){
        console.log("Starting scraping first innings: **************************************");
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
                //console.log(ballInfo[1]);
                if (ballInfo[1].indexOf('no') >= 0) run = 0;
                else if (ballInfo[1].indexOf('OUT') >= 0) run = 'W';
                else if (ballInfo[1].indexOf('FOUR') >= 0) run = 4;
                else if (ballInfo[1].indexOf('SIX') >= 0) run = 6;
                else run = ballInfo[1].charAt(0);

                var newBall = new ball(overInfo[0], overInfo[1], run, playerInfo[2], playerInfo[1]);
                match.firstInnings.commentary.push(newBall)

                //print statements
                console.log("Element Begin: **************************************");
                console.log(d);
                console.log("the ball object: ");
                console.log(newBall);
                console.log("Element End: **************************************");
            }
        })

        console.log("Finished scraping first innings: **************************************");
    })
    //secondInnings
    url = url.replace('innings=1', 'innings=2');
    request(url, function(error, response, html){
        console.log("Starting scraping second innings: **************************************");
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
                //console.log(ballInfo[1]);
                if (ballInfo[1].indexOf('no') >= 0) run = 0;
                else if (ballInfo[1].indexOf('OUT') >= 0) run = 'W';
                else if (ballInfo[1].indexOf('FOUR') >= 0) run = 4;
                else if (ballInfo[1].indexOf('SIX') >= 0) run = 6;
                else run = ballInfo[1].charAt(0);

                var newBall = new ball(overInfo[0], overInfo[1], run, playerInfo[2], playerInfo[1]);
                match.secondInnings.commentary.push(newBall)

                //print statements
                console.log("Element Begin: **************************************");
                console.log(d);
                console.log("the ball object: ");
                console.log(newBall);
                console.log("Element End: **************************************");
            }
        })

        console.log("Finished scraping second innings: **************************************");
    })

    setTimeout(function(){
        console.log(JSON.stringify(match));
    }, 8000)
})

app.listen('8081')
//console.log('Magic happens on port 8081');
exports = module.exports = app
