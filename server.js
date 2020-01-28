#!/usr/bin/env node
var express = require('express');
var path = require('path');
var compression = require('compression');
var sslRedirect = require('heroku-ssl-redirect');
var bodyParser = require('body-parser');
var app = express();

app.use(compression());
app.use(sslRedirect());
app.use(bodyParser.json());
app.set('etag', false)

app.use(function(req, res, next) {
	res.header("Expires", new Date(Date.now() + 2592000000).toUTCString())
	next()
})

// Set static filess
app.use(express.static(__dirname + '/dist',{
    maxAge: "1d"
}))

app.get('*', function(req, res){
	res.sendFile('index.html', { root: __dirname + '/dist' });
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening at http://localhost:' + server.address().port);
});