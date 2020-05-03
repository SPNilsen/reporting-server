var port = Number(process.env.PORT|| 3000);
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

var app = express();
 
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

var reportingApp = express();

app.use('/reporting', reportingApp);

const jsreport = require('jsreport')({
  extensions: {
    express: { app: reportingApp },
  },
  appPath: "/reporting",
  tempDirectory: "temp",
  assets: {
    allowedFiles: '**/*.*', // this is important because here you pass what types files (or even inside directories) do you allow, in this case i'm allowing everything
    publicAccessEnabled: true,
    searchOnDiskIfNotFoundInStore: true
  }
  // configFile: __dirname + "/jsrconfig/jsreport.config.json"
});

//start the reporting server instance; There's a minor async concern if the server isn't fully started when the route is called.
jsreport.init();

app.get('/my', function (req, res) {
	var theData = {foo: "world", startDate: "2020-01-01", endDate: "2020-06-30"}; //populate the handlebars data

	jsreport.render({
		template: {
		  content: fs.readFileSync(
		    path.resolve(__dirname, 'views', 'report.handlebars'),
		  'utf8'
		  ), //this is any handlebars template
		  engine: 'handlebars',
		  recipe: 'chrome-pdf'

	    },
	    data: theData
	}).then((resp) => {
	// write report buffer to a file
	fs.writeFileSync('./public/report/report.pdf', resp.content)
	// res.send(resp.content); 
	res.sendFile('./public/report/report.pdf', {root: __dirname});
  });
});

app.post('/rptGen', function (req, res) {
	console.log('got post');
	console.log('req body: ' + JSON.stringify(req.body));
	var theData = {foo: "world", startDate: req.body.startDate, endDate: req.body.endDate}; //populate the handlebars data

	jsreport.render({
		template: {
		  content: fs.readFileSync(
		    path.resolve(__dirname, 'views', 'report.handlebars'),
		  'utf8'
		  ), //this is any handlebars template
		  engine: 'handlebars',
		  recipe: 'chrome-pdf'
		  
	    },
	    data: theData
	}).then((resp) => {
	// write report buffer to a file
	fs.writeFileSync('./public/report/report.pdf', resp.content)
	// res.send(resp.content); 
	res.sendFile('./public/report/report.pdf', {root: __dirname});
  });
});
 
// jsreport.init().then(() => {
//   console.log('jsreport server started')
// }).catch((e) => {
//   console.error(e);
// });

app.listen(3000); 

// creating a jsreport instance
// const jsreport = require('jsreport')({ httpPort: 2000})

// if (process.env.JSREPORT_CLI) {
//  // when the file is required by jsreport-cli, export
//  // jsreport instance to make it possible the usage of jsreport-cli
//  module.exports = jsreport
// } else {
//  // when the file is started with node.js, start the jsreport server normally
//  jsreport.init().then(() => {
//    console.log('server started..')
//  }).catch((e) => {
//    // error during startup
//    console.error(e.stack)
//    process.exit(1)
//  })
// }