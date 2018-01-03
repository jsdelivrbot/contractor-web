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
      self.token  = require('./../modules/token.js');
    };

    /**
     * Validate token by secret.
     */
    self.isValidTokenPromise = function(token) {
        return self.token.isValidToken(token);
    };

    /**
     * Authenticate User.
     */
    self.authenticateUserPromise = function(email, password) {
      var defer = self.Q.defer();
      self.base.executeQuery(self.const.QUERY.AUTH_USER, [email, password])
               .then(function(data){
                 if(data.rowCount == 1){
                   defer.resolve({data:data.rows[0], status: self.const.SUCCESS});
                 } else {
                   defer.reject(new Error("Authenticate error."));
                 }
               }, function(error){
                 defer.reject(new Error(error));
               });

      return defer.promise;
    }

    /**
     * Generate token.
     */
    self.generateTokens = function(data) {
      var defer = self.Q.defer();

      if(data.status === self.const.SUCCESS) {
          var user = data.data;
          //console.log(user.id + '-' + user.user_name);
          var cTimeStamp  = Date.now();
          var accessToken = self.jwt.sign({username:user.id + '_' + cTimeStamp},
                            self.const.JWT_ACCESS_TOKEN_SECRET,
                            //self.const.JWT_ACCESS_TOKEN_SECRET + '_' + cTimeStamp,
                            {expiresIn: self.const.ACCESS_TOKEN_EXPIRY_TIME_IN_SEC});

          var refreshToken = self.jwt.sign({username:user.id + '_' + user.user_name + '_' + cTimeStamp},
                             self.const.JWT_REFRESH_TOKEN_SECRET,
                             //self.const.JWT_REFRESH_TOKEN_SECRET + '_' + cTimeStamp,
                             {expiresIn: self.const.REFRESH_TOKEN_EXPIRY_TIME_IN_HOURS});

          console.log('generateTokens accessToken - ' + accessToken + ' refreshToken - ' + refreshToken);

          var userToken = {user: user, accessToken:accessToken, refreshToken:refreshToken, appType:'web'}

          console.log('generateTokens user  - ' + user);

          self.isValidTokenPromise(accessToken)
              .then(function(successResult){
                console.log(successResult);
                defer.resolve(userToken);
              }, function(error) {
                console.log(error);
              });

          //defer.resolve(userToken);
      } else {
          defer.reject(self.const.ERROR_CODE.LOGIN_FORM_INVALID);
      }

      return defer.promise;
    }

    /**
     * Save generated token into user_token table
     */
    self.saveGeneratedTokens = function(token) {
      var defer = self.Q.defer();

      if(token.user != undefined){
        self.base.executeQuery(self.const.QUERY.NEW_USER_TOKEN,
                  ['user_token_seq', token.user.id, token.accessToken, 'Y'])
                 .then(function(data){
                   defer.resolve(token);
                 }, function(error){
                   defer.reject(new Error(error));
                 });
      }

      return defer.promise;
    }

    /**
     * Login router.
     */
    self.loginRouter = function() {
        self.router.post('/login', function(req, response) {
            var email    = req.body.email;
            var password = req.body.password;

            if(email && password) {
              //console.log('Calling Login function (authenticateUserPromise)...');
              self.authenticateUserPromise(email, password)
                  .then(function(data){
                    //console.log('Calling Login function (generateTokens)...');
                    self.generateTokens(data)
                        .then(function(token){
                          //console.log('Calling Login function (saveGeneratedTokens)...');
                          self.saveGeneratedTokens(token)
                              .then(function(token){
                                response.status(201).json({token:token});
                              }, function (error) {
                                   response.status(201).json({status: self.const.FAILED, code: self.const.ERROR_CODE.LOGIN_FORM_INVALID});
                              });
                        });
                  }, function (error) {
                       response.status(201).json({status: self.const.FAILED, code: self.const.ERROR_CODE.LOGIN_FORM_INVALID});
                  }, function (error) {
                       response.status(201).json({status: self.const.FAILED, code: self.const.ERROR_CODE.LOGIN_FORM_INVALID});
                  });
            } else {
                response.send({status: self.const.FAILED, error_code: self.const.ERROR_CODE.LOGIN_FORM_INVALID});
            }
        });
    };

    /**
     * Is valid token in DB
     */
    self.isValidTokenInDBPromise = function(token, successResult){
      var defer = self.Q.defer();

      if(token) {
        self.base.executeQuery(self.const.QUERY.CHECK_USER_TOKEN, [token, 'Y'])
                 .then(function(data){
                   if(data.rowCount == 1) {
                     defer.resolve();
                   } else if (data.rowCount > 1) {
                     defer.reject({error_code:self.const.ERROR_CODE.DUPLICATE_DB_DATA});
                   } else  {
                     defer.reject({error_code:self.const.ERROR_CODE.NO_RECORDS});
                   }
                 }, function(error){
                   defer.reject(new Error(error));
                 });
      } else {
        defer.reject(self.const.ERROR_CODE.LOGIN_FORM_INVALID);
      }

      return defer.promise;
    }

    /*
     * Invalidate token in DB.
     */
    self.invalidateTokenInDBPromise = function(token){
      var defer = self.Q.defer();

      if(token != undefined) {
        self.base.executeQuery(self.const.QUERY.AUTH_UPDATE_USER_TOKEN, ['N', token])
                 .then(function(data) {
                   defer.resolve();
                 }, function(error){
                   defer.reject(new Error(error));
                 });
      } else {
        defer.reject({error_code:self.const.ERROR_CODE.IVALID_TOKEN});
      }

      return defer.promise;
    }


    /**
     * Logout user router.
     */
    self.logoutRouter = function(){
      self.router.post('/logout', function(req, response){
          var token = req.body.token;
          if(token) {
            console.log("Calling logoutRouter...");
            self.isValidTokenPromise(token)
                .then(function(successResult){
                  console.log("Calling logoutRouter(isValidTokenInDBPromise)...");
                  self.isValidTokenInDBPromise(token, successResult)
                      .then(function(){
                        console.log("Calling logoutRouter(invalidateTokenInDBPromise)...");
                        self.invalidateTokenInDBPromise(token)
                            .then(function(){
                              response.status(201)
                                      .json({status: self.const.SUCCESS});
                            }, function(error){
                              response.status(201)
                                      .json({status: self.const.FAILED,
                                             error_code: error.error_code,
                                             error:error});
                            });
                      }, function(error){
                        response.status(201)
                                .json({status: self.const.FAILED,
                                       error_code: error.error_code,
                                       error:error});
                      });
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
      self.loginRouter();
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
