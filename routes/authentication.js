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
     * Validate token by secret.
     */
    self.isValidTokenPromise = function(token) {
        var defer = self.Q.defer();

        if(!token) {
          defer.reject(new Error("Error.Token is null."));
          return;
        }

        self.jwt.verify(token, self.const.JWT_ACCESS_TOKEN_SECRET, function(err, decoded) {
           if(!err){
             defer.resolve(true);
           } else {
             defer.reject(new Error("Error has occured while processing the token:-" + err));
           }
        });

        return defer.promise;
    };

    /**
     *
     */
    self.authenticateUserPromise = function(email, password) {
      var defer = self.Q.defer();

      self.pg.connect(self.const.DB_CONNECT_URI, function(err, client, done) {
          console.log('authenticateUserPromise')
          if(err) {
            //response.send("Could not connect to DB: " + err);
            defer.reject(new Error( "Could not connect to DB: " + err ));
            return;
          }

          const query = client.query('SELECT id, user_name FROM AUTH_USER where email = $1 LIMIT 1',[email]);
          const results = [];
          var jsonData = {};
          query.on('row', (row) => {
            //console.log('Row data - ' + row.id);
            //results.push(JSON.stringify(row));
            jsonData = {id:row.id, userName:row.user_name}
          });

          query.on('end', () => {
            done();
            var jsonResult = {status: self.const.SUCCESS, data: jsonData};

            //return response.status(201).json(jsonResult);
            defer.resolve(jsonResult);
          });
       });

       return defer.promise;
    }

    /**
     * Generate token.
     */
    self.generateTokens = function(data) {
      var defer = self.Q.defer();
      console.log('generateTokens - data' + data);
      if(data.status === self.const.SUCCESS) {
          var user = data.data;
          console.log(user.id + '-' + user.userName);
          var cTimeStamp  = Date.now();
          var accessToken = self.jwt.sign({username:user.id + '_' + cTimeStamp},
                            self.const.JWT_ACCESS_TOKEN_SECRET,
                            //self.const.JWT_ACCESS_TOKEN_SECRET + '_' + cTimeStamp,
                            {expiresIn: self.const.ACCESS_TOKEN_EXPIRY_TIME_IN_SEC});

          var refreshToken = self.jwt.sign({username:user.id + '_' + user.userName + '_' + cTimeStamp},
                             self.const.JWT_REFRESH_TOKEN_SECRET,
                             //self.const.JWT_REFRESH_TOKEN_SECRET + '_' + cTimeStamp,
                             {expiresIn: self.const.REFRESH_TOKEN_EXPIRY_TIME_IN_HOURS});

          console.log('generateTokens accessToken - ' + accessToken + ' refreshToken - ' + refreshToken);

          var userToken = {user: data.data, accessToken:accessToken, refreshToken:refreshToken, appType:'web'}

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
     * Logout user router.
     */
    self.logoutRouter = function(){
      self.router.post('/logout', function(req, response){
          var token = req.body.token;
          if(token) {
            self.isValidTokenPromise(token)
                .then(function(successResult){
                  response.status(201)
                          .json({status: self.const.SUCCESS});
                }, function(error){
                  response.status(201)
                          .json({status: self.const.FAILED,
                                 error_code: self.const.ERROR_CODE.IVALID_TOKEN,
                                 error:error});
                });
          } else {
            response.status(201)
                    .json({status: self.const.FAILED, error_code: self.const.ERROR_CODE.REFRESH_TOKEN_IS_REQUIRED});
          }
      });
    }

    /**
     * Listen for messages
     */
    self.listen = function() {
    	console.log('Listening auth api calls...');
      self.authenticateRouter();
      self.logoutRouter();
      //self.generateAccessTokenRouter();
    };
};

/**
 *  main():  Main code.
 */
var authRouter = new AuthRouter();
authRouter.initialize();
authRouter.listen();
