#!/bin/env node

/**
 *  Define the auth router.
 */
var AuthRouter = function() {
    var self = this;

    /**
     * Initialize router
     */
    self.initialize = function() {
    	var express = require('express');
    	self.router = express.Router();
      self.jwt    = require('jsonwebtoken');
      self.const  = require('./constants.js');
      self.md5    = require('md5');
      self.pg     = require('pg');

    	module.exports = self.router;

      self._      = require("underscore");
      self.Q      = require('q');
      self.base   = require('./../modules/base.js');
    };

    self.testRouter = function() {
      var connString = 'postgres://hnuegxefpebghz:6f06966334822738d634b26337ea8aba8362d91f4088db2f6e9951ca4a6bdc6b@ec2-54-243-185-123.compute-1.amazonaws.com:5432/d6itatao1468j?ssl=true';
      var pg         = require('pg');

      self.router.get('/', function (req, response) {
        pg.connect(connString, function(err, client, done) {
    		    if(err) response.send("Could not connect to DB: " + err);

        		client.query('SELECT * FROM test', function(err, result) {
        			done();
        			if(err) return response.send(err);
        			response.send(result.rows);
        		});
    	  });
      });
    };

    /**
     * Fetch projects router.
     */
    self.authenticateRouter = function() {
        self.router.post('/', function(req, response) {
            var email = req.body.email;
            var password = req.body.password;

            var code = email;
            if(email && password) {
              console.log("DB URI - " + self.const.DB_CONNECT_URI);

              self.pg.connect(self.const.DB_CONNECT_URI, function(err, client, done) {
  		            if(err) {
                    response.send("Could not connect to DB: " + err);
                    return;
                  }

                  const query = client.query('SELECT firstname FROM test where email = $1',[email]);
                  const results = [];

                  query.on('row', (row) => {
                    results.push(row);
                  });

                  query.on('end', () => {
                    done();
                    return response.status(201).json({status: self.const.SUCCESS, data: results});
                  });

                  /*
  		            client.query('SELECT firstname FROM test where email = $1', function(err, result) {
  			               done();
  			               if(err) return response.send(err);
  			               //response.send(result.rows);
                       response.status(201).json({status: self.const.SUCCESS, data: result.rows});
  		            });
                  */
  	           });
            } else {
                response.send({status: self.const.FAILED, error_code: self.const.ERROR_CODE.LOGIN_FORM_INVALID});
            }
        });
    };

    /**
     * Listen for messages
     */
    self.listen = function() {
    	console.log('Listening auth api calls...');
      self.authenticateRouter();
      self.testRouter();
      //self.generateAccessTokenRouter();
    };
};

/**
 *  main():  Main code.
 */
var authRouter = new AuthRouter();
authRouter.initialize();
authRouter.listen();
