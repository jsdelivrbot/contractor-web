var connString = 'postgres://hnuegxefpebghz:6f06966334822738d634b26337ea8aba8362d91f4088db2f6e9951ca4a6bdc6b@ec2-54-243-185-123.compute-1.amazonaws.com:5432/d6itatao1468j?&ssl=true';
var express    = require('express');
var bodyParser = require('body-parser');
var pg         = require('pg');
var app        = express();

//var router = express.Router();

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
    pg.connect(connString, function(err, client, done) {
  		if(err) response.send("Could not connect to DB: " + err);

  		client.query('SELECT * FROM test', function(err, result) {
  			done();
  			if(err) return response.send(err);
  			response.send(result.rows);
  		});
  	});
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
