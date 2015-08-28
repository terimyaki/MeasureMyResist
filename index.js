var childProcess = require('child_process'),
	fs = require('fs'),
	d3 = require('d3');

var max = 0,
	header,
	points = [],
	file = 'arduinoTest.txt',
	fileStream = require('./fileStream')();

//Arduino start it up
var arduinoProcess = childProcess.exec('node arduino.js -f:' + file + ' -v:' + 5 + ' -r:' + 1000);

arduinoProcess.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});

arduinoProcess.on('close', function (code) {
  console.log('child process exited with code ' + code);
});

//Reading the file that is generated from the Arduino Process
fileStream.on('data', function(data){
	if(!header) {
		header = data;
		createSpecs(header);
	}
	else {
		updateTable(data.Time, data.Voltage2_AR_Value, data.Voltage2_Calc, data.Resistance_Calc);
		if(data.Resistance_Calc > max) {
			fileStream.pause();
			max = data.Resistance_Calc;
			d3.select('#max-container .resistance > p').text(max);
			d3.select('#max-container .voltage > p').text(data.Voltage2_Calc);
			// fileStream.resume();
			setTimeout(function(){
				fileStream.resume();
			}, 1000);
		}
		points.push(data);
	}
});

fs.watchFile(file, function(){
	fileStream.resume();
});
function createSpecs(specs){
	var header = d3.select('#header');
	Object.keys(specs).forEach(function(key){
		var info = header.append('div'),
			title = info.append('h5'),
			value = info.append('p');
		title.text(key);
		value.text(specs[key]);
	});
}

function updateTable(time, ar, voltage, resistance){
	var table = d3.select('#readings table'),
		row = table.append('tr');
	[].slice.call(arguments).forEach(function(text){
		row.append('td').text(text);
	});
}

function createGraph(){
	
}