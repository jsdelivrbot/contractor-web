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

// TODO: temp GET api
app.get('/api/auth', function (req, res) {
  res.status(200).json({message:'Tes'});
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
