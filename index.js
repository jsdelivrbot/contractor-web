#!/usr/bin/env node

//var connString = 'postgres://hnuegxefpebghz:6f06966334822738d634b26337ea8aba8362d91f4088db2f6e9951ca4a6bdc6b@ec2-54-243-185-123.compute-1.amazonaws.com:5432/d6itatao1468j?ssl=true';
//var connString = 'postgres://ec2-54-243-185-123.compute-1.amazonaws.com:5432/d6itatao1468j?sslmode=require&user=hnuegxefpebghz&password=6f06966334822738d634b26337ea8aba8362d91f4088db2f6e9951ca4a6bdc6b';
//var connString = 'postgres://ec2-54-243-185-123.compute-1.amazonaws.com:5432/d6itatao1468j?user=hnuegxefpebghz&password=6f06966334822738d634b26337ea8aba8362d91f4088db2f6e9951ca4a6bdc6b&ssl=true';
//var connString = 'postgres://hxippjwm:tdzmbJfzaSOePGaIKvJWe_FjM6BcqmNk@elmer.db.elephantsql.com:5432/hxippjwm';
//var connString = "postgres://hxippjwm:tdzmbJfzaSOePGaIKvJWe_FjM6BcqmNk@elmer.db.elephantsql.com:5432/hxippjwm";

var connString = "postgres://hxippjwm:tdzmbJfzaSOePGaIKvJWe_FjM6BcqmNk@elmer.db.elephantsql.com:5432/hxippjwm";
var express    = require('express');
var bodyParser = require('body-parser');
var pg         = require('pg');
var app        = express();
var Sequelize  = require("sequelize");

//var router = express.Router();

//console.log('DB Connection - ' + connString);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.set('port', (process.env.PORT || 5000));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('index');
});

// TODO: temp GET api
app.get('/api/auth', function (req, response) {
  // Or you can simply use a connection uri
    /*
    const sequelize = new Sequelize('postgres://hxippjwm:tdzmbJfzaSOePGaIKvJWe_FjM6BcqmNk@elmer.db.elephantsql.com:5432/hxippjwm');

    sequelize
    .authenticate()
    .then(() => {
      console.log('Connection has been established successfully.');
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
    });
    */

    console.log('DB Connection - ' + connString);
    /*
    var client = new pg.Client(connString);

    client.connect();

    var query = client.query("select * from AUTH_USER");

    const results = [];

    query.on("row", function (row, result) {
        results.addRow(row);
    });

    query.on("end", function (result) {
        client.end();
        response.send(results.rows);
    });
    */


    pg.connect(connString, function(err, client, done) {
  		if(err) {
        response.send("Could not connect to DB: " + err);
        return;
      }

  		client.query('SELECT * FROM AUTH_USER', function(err, result) {
  			done();
  			if(err) return response.send(err);
  			response.send(result.rows);
  		});
  	});
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
