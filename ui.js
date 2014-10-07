
"use strict";

var env = process.env.NODE_ENV || 'development';
var config = require('./config/config')[env];

var util = require('util');
var fs = require('fs');
var http = require('http');

var _ = require('underscore');
var express = require('express');
var socketio = require('socket.io');

// --------------------------------------------------------------

var app = express();
var server = http.Server(app);
var io = socketio(server);

require('./config/express')(app, config);
require('./routes')(app, io);

var bindTo = {
	host: '0.0.0.0',
	port: 25006
};

server.listen(bindTo.port, bindTo.host, function () {
    console.log('listen %s:%s', bindTo.host, bindTo.port);
});

