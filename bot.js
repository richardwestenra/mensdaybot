require('newrelic');

var _ = require("underscore");

var Twit = require('twit'),
    debug = false;
debug = true;

var valid = function (tweet) {
    return true;
};


// Matched array of keywords and corresponding replies:
var keyword = ["international men's day", "international mens day"];
var reply = "It's November 19th.";


// Start the twitter stream:
var T = new Twit({
    consumer_key: process.env.consumer_key,
    consumer_secret: process.env.consumer_secret,
    access_token: process.env.access_token,
    access_token_secret: process.env.access_token_secret
});

var stream = T.stream('statuses/filter', { track: keyword });
stream.on('tweet', function (tweet) {

    if (valid(tweet)) {
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
    } else {
        var now = new Date();
        console.log('[' + now.toJSON() + '] INVALID: @' + tweet.user.screen_name + ':' + tweet.text);
    }
});

stream.on('warning', function (item) { console.log('WARNING: ' + item); });
stream.on('disconnect', function (item) { console.log('Stream disconnected.'); });
stream.on('connect', function (item) { console.log('Stream connected.'); });
stream.on('reconnect', function (item) { console.log('Stream reconnected.'); });



// Express server page:
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
    var result = 'Hello world!';
    response.send(result);
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

