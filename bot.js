require('newrelic');

var _ = require("underscore");

var Twit = require('twit'),
    debug = false;



// Express server page:
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});



// Work out whether a search term matches a given tweet
function hasKeyword(searchterms, text){
    return _.some(searchterms,function(d){
        return new RegExp(d, 'ig').test(text);
    });
}

var valid = function (tweet) {
    // Don't reply to tweets mentioning November 19th:
    var November = hasKeyword(['November','Nov','19','19th'], tweet.text);
    // Don't reply to Richard Herring
    var Richard = tweet.user.screen_name === 'Herring1967';
    // Don't reply to RTs
    var RT = tweet.retweeted_status !== undefined;

    return !November && !Richard && !RT;
};


// Matched array of keywords and corresponding replies:
var keywords = [
    "international men's day",
    "international man's day",
    "international mens day",
    "international mans day",
    "national men's day",
    "national man's day",
    "national mens day",
    "national mans day"
];
var reply = "It's November 19th.";

var backlog = [];
var auto = true;


// Start the twitter stream:
var T = new Twit({
    consumer_key: process.env.consumer_key,
    consumer_secret: process.env.consumer_secret,
    access_token: process.env.access_token,
    access_token_secret: process.env.access_token_secret
});


var stream = T.stream('statuses/filter', { track: keywords });

stream.on('tweet', function (tweet) {
    if (valid(tweet)) {
        if (auto) {
            // Reply:
            sendTweet(tweet);
        } else  {
            // Add tweet to backlog:
            backlog.push(tweet);
        }
    }
});

function sendTweet(tweet){
    var response = '@'+ tweet.user.screen_name + ' ' + reply;
    if (!debug) {
        var params = {
            status: response,
            in_reply_to_status_id: tweet.id_str
        };
        T.post('statuses/update', params, function (err, reply) {
            if (err) {
                console.log(err);
            } else {
                var now = new Date();
                console.log('[' + now.toJSON() + '] SENT: ' + response);
            }
        });
    } else {
        var now = new Date();
        console.log('[' + now.toJSON() + '] ' + response);
    }
}

stream.on('warning', function (item) { console.log('WARNING: ' + item); });
stream.on('disconnect', function (item) { console.log('Stream disconnected.'); });
stream.on('connect', function (item) { console.log('Stream connected.'); });
stream.on('reconnect', function (item) { console.log('Stream reconnected.'); });



// Handle AJAX requests
app.get('/query', function(req, res){
    var p = req.query;

    if (p.clear === 'clear') {
        backlog = [];
    }
    if (p.approve !== undefined) {
        var tweet = _.find(backlog,function(d){
            return +d.id === +p.id;
        });
        var now = new Date();
        if (p.approve === 'true' || p.approve === true) {
            console.log('[' + now.toJSON() + '] Approved tweet: @' + tweet.user.screen_name + ':' + tweet.text);
            sendTweet(tweet);
        } else {
            console.log('[' + now.toJSON() + '] Rejected tweet: @' + tweet.user.screen_name + ':' + tweet.text);
        }
        backlog = _.reject(backlog,function(d){
            return +d.id === +p.id;
        });
    }

    if (p.mode !== undefined) {
        // Toggle mode
        auto = p.mode !== 'Auto';
    }

    res.send({
        mode: auto ? 'Auto' : 'Manual',
        backlog: backlog
    });
});