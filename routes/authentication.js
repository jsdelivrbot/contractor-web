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
     *
     */
    self.authenticateUserPromise = function(email, password) {
      var defer = self.Q.defer();

      self.pg.connect(self.const.DB_CONNECT_URI, function(err, client, done) {
          if(err) {
            //response.send("Could not connect to DB: " + err);
            defer.reject(new Error( "Could not connect to DB: " + err ));
            return;
          }

          const query = client.query('SELECT id FROM AUTH_USER where email = $1 LIMIT 1',[email]);
          const results = [];

          query.on('row', (row) => {
            results.push(row);
          });

          query.on('end', () => {
            done();
            var jsonResult = results.length > 0 ?
                  {status: self.const.SUCCESS, data: results} :
                    {status: self.const.FAILED, error_code: self.const.ERROR_CODE.LOGIN_FORM_INVALID};

            //return response.status(201).json(jsonResult);
            defer.resolve(jsonResult);
          });
       });

       return defer.promise;
    }

    self.generateTokens = function(user) {
      var defer = self.Q.defer();

      console.log('generateTokens user - ' + user);

      if(user) {
          var cTimeStamp  = Date.now();
          var accessToken = self.jwt.sign({username:user.userName + '_' + cTimeStamp},
                            self.const.JWT_ACCESS_TOKEN_SECRET,
                            //self.const.JWT_ACCESS_TOKEN_SECRET + '_' + cTimeStamp,
                            {expiresIn: self.const.ACCESS_TOKEN_EXPIRY_TIME_IN_SEC});

          var refreshToken = self.jwt.sign({username:user.id + '_' + cTimeStamp},
                             self.const.JWT_REFRESH_TOKEN_SECRET,
                             //self.const.JWT_REFRESH_TOKEN_SECRET + '_' + cTimeStamp,
                             {expiresIn: self.const.REFRESH_TOKEN_EXPIRY_TIME_IN_HOURS});

          console.log('generateTokens accessToken - ' + accessToken + ' refreshToken - ' + refreshToken);

          var userToken = {user: user, accessToken:accessToken, refreshToken:refreshToken, appType:'web'}

          defer.resolve(userToken);
      } else {
          defer.reject(self.const.ERROR_CODE.LOGIN_FORM_INVALID);
      }

      return defer.promise;
    }

    /**
     * Fetch projects router.
     */
    self.authenticateRouter = function() {
        self.router.post('/', function(req, response) {
            var email    = req.body.email;
            var password = req.body.password;

            if(email && password) {
              self.authenticateUserPromise(email, password)
                  .then(function(data){
                    self.generateTokens(data)
                        .then(function(token){
                          response.status(201).json({token:token});
                        });
                  }, function (error) {
                       response.status(201).json({status: self.const.FAILED, code: self.const.ERROR_CODE.LOGIN_FORM_INVALID});
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
