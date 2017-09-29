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

    /**
     * Fetch projects router.
     */
    self.authenticateRouter = function() {
        self.router.post('/', function(req, response) {
            var email    = req.body.email;
            var password = req.body.password;

            var code = email;
            if(email && password) {
              self.pg.connect(self.const.DB_CONNECT_URI, function(err, client, done) {
  		            if(err) {
                    response.send("Could not connect to DB: " + err);
                    return;
                  }

                  const query = client.query('SELECT id FROM AUTH_USER where email = $1',[email]);
                  const results = [];

                  query.on('row', (row) => {
                    results.push(row);
                  });

                  query.on('end', () => {
                    done();
                    var jsonResult = results.length > 0 ?
                          {status: self.const.SUCCESS, data: results} :
                            {status: self.const.FAILED, error_code: self.const.ERROR_CODE.LOGIN_FORM_INVALID};

                    return response.status(201).json(jsonResult);
                  });
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
      //self.generateAccessTokenRouter();
    };
};

/**
 *  main():  Main code.
 */
var authRouter = new AuthRouter();
authRouter.initialize();
authRouter.listen();
