var express    = require('express');
var bodyParser = require('body-parser');

var app = express();
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

const { Client } = require('pg');

// TODO: temp GET api
app.get('/api/auth', function (req, response) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  });

  client.connect();

  client.query('SELECT first_name FROM test', (err, res) => {
    if (err) throw err;
    var data = undefined;
    for (let row of res.rows) {
      data = JSON.stringify(row);
    }
    client.end();

    response.status(200).json({message:data});
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
