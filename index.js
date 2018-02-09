var MainApp = function() {
    //  Scope.
    var self = this;

    /**
     * Initialize libraries
     */
    self.initLibs = function() {
    	self.express      = require('express');
    	self.bodyParser   = require('body-parser');
    	self.cookieParser = require('cookie-parser');
    	self.path         = require('path');
    	self.fs           = require('fs');
    };

    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initServer = function() {
        self.app = self.express();

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }

        self.app.set('views', self.path.join(__dirname, 'views'));
        self.app.set('view engine', 'ejs');

        self.app.use(self.express.static(self.path.join(__dirname, 'public')));
        self.app.use(self.bodyParser.json());
        self.app.use(self.bodyParser.urlencoded());
        self.app.use(self.cookieParser());

        self.createRoutes();
    };

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
    	console.log('Creating routes...');

    	//var index   = require('./routes/index');
      var project = require('./routes/project');
      var auth    = require('./routes/authentication');
      //var user    = require('./routes/api/user');

      self.app.get('/', function(request, response) {
        response.render('index');
      });

      self.app.use('/api/project', project);
      self.app.use('/api/auth', auth);
      //self.app.use('/api/user', user);
    };

    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        self.port = (process.env.PORT || 5000);

        self.app.set('port', self.port);
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, function() {
            console.log('%s: Node server started on %d ...',
                        Date(Date.now() ), self.port);
        });
    };

    /**
     * Services
     */
    self.initServices = function() {
      self.dbService  = require('./modules/db-service.js');
      self.dbService.startJobTokenCleanUp();
    }

    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
    	self.initLibs();
      self.initServer();
      self.initServices();
    };
};

/**
 *  main():  Main code.
 */
var app = new MainApp();
app.initialize();
app.start();
