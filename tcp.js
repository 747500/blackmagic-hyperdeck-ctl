

process.on('recorder:connect', function (data) {

	console.log('CONNECT\n%s\n', data);

});

process.on('recorder:disconnect', function (data) {

	console.log('DISCONNECT\n%s\n', data);

});


