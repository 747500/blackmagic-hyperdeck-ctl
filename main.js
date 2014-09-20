
"use strict";

var env = process.env.NODE_ENV || 'development';
var config = require('./config/config')[env];

var util = require('util');
var fs = require('fs');

var _ = require('underscore');

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

require('./tcp.js');

require('./config/express')(app, config);

require('./routes')(app);


var bindTo = {
	host: '0.0.0.0',
	port: 25006
};

server.listen(bindTo.port, bindTo.host, function () {
    console.log('http: listen %s:%s', bindTo.host, bindTo.port);
});


io.on('connection', function (socket) {

	socket.emit('recorder', { hello: 'world' });

	socket.on('my other event', function (data) {
		console.log(data);
	});

});

