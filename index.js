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
app.get('/api/auth', function (req, res) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  });

  client.connect();

  client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
    if (err) throw err;
    var res = undefined;
    for (let row of res.rows) {
      res = JSON.stringify(row);
    }
    client.end();

    res.status(200).json({message:res});
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
