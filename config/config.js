
"use strict";

var os = require('os');
var _ = require('underscore');
var util = require('util');
var path = require('path');

var strftime = require('strftime');
var sprintf = require('sprintf');

var rootPath = path.normalize(path.join(__dirname, '..'));

var orig_console_log;

module.exports = {
	development: {
		root: rootPath,
		app: {
			name: 'blackmagic-hyperdeck-ctl (development mode)'
		}
	},
	test: {
		root: rootPath,
		app: {
			name: 'blackmagic-hyperdeck-ctl (test mode)'
		}
	},
	production: {
		root: rootPath,
		app: {
			name: 'blackmagic-hyperdeck-ctl'
		}
	}
};

function console_log() {
	var now = new Date();
	var strTs = strftime('%d %b %Y %T.%L %Z', now);
//	var hname = (os.hostname() || process.env.HOSTNAME || 'localhost'),
	var pname = path.basename(require.main.filename, '.js');
	var prefix = [ '%s %s[%s]: ', strTs, pname, process.pid ];
	var args = _(arguments).chain().values().map(function (el) {
		var toExpose = el && 'object' === typeof el;
		return toExpose ? util.inspect(el) : el;
	}).value();
	orig_console_log(sprintf.apply(this, prefix) + sprintf.apply(this, args));
}

if (console.log !== console_log) {
	orig_console_log = console.log;
	console.log = console_log;
}
