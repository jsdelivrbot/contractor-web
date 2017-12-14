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
     *
     */
    self.authenticateUserPromise = function(email, password) {
      var defer = self.Q.defer();

      self.pg.connect(self.const.DB_CONNECT_URI, function(err, client, done) {
          if(err) {
            //response.send("Could not connect to DB: " + err);
            defer.reject(new Error( "Could not connect to DB: " + err ));
            self.pg.end();
            return;
          }

          const query = client.query('SELECT id, user_name FROM AUTH_USER where email = $1 AND password = $2 LIMIT 1',[email, password]);
          const results = [];
          var jsonData = {};
          query.on('row', (row) => {
            //console.log('Row data - ' + row.id);
            //results.push(JSON.stringify(row));
            jsonData = {id:row.id, userName:row.user_name}
          });

          query.on('end', () => {
            done();
            if(self._.size(jsonData) == 0) {
              defer.reject(self.const.ERROR_CODE.LOGIN_FORM_INVALID);
            } else {
              var jsonResult = {status: self.const.SUCCESS, data: jsonData};
              defer.resolve(jsonResult);
            }

            self.pg.end();
          });
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
     * Save generated token into user_token table
     */
    self.saveGeneratedTokens = function(token) {
      var defer = self.Q.defer();
      if(token.user != undefined){
        self.pg.connect(self.const.DB_CONNECT_URI, function(err, client, done) {
            if(err) {
              defer.reject(new Error( "Could not connect to DB: " + err ));
              self.pg.end();
              return;
            }

            client.query( self.const.QUERY.NEW_USER_TOKEN,
                         ['user_token_seq', token.user.id, token.accessToken, 'Y'],
                         function(err, result) {
                            if (err) {
                              defer.reject(self.const.ERROR_CODE.LOGIN_FORM_INVALID);
                            } else {
                              defer.resolve(token);
                            }

                            self.pg.end();
                         });
        });
      } else {
        defer.reject(self.const.ERROR_CODE.LOGIN_FORM_INVALID);
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
              console.log('Calling Login function (authenticateUserPromise)...');
              self.authenticateUserPromise(email, password)
                  .then(function(data){
                    console.log('Calling Login function (generateTokens)...');
                    self.generateTokens(data)
                        .then(function(token){
                          console.log('Calling Login function (saveGeneratedTokens)...');
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

      if(token){
        self.pg.connect(self.const.DB_CONNECT_URI, function(err, client, done) {
            if(err) {
              defer.reject(new Error( "Could not connect to DB: " + err ));
              self.pg.end();
              return;
            }

            console.log("Calling isValidTokenInDBPromise");
            client.query( self.const.QUERY.CHECK_USER_TOKEN,
                         [token, 'Y'],
                         function(err, result) {
                           if(err) {
                             defer.reject({error_code:self.const.ERROR_CODE.DB_CONNECTION});
                           } else {
                             if(result.rows.length == 1) {
                               defer.resolve();
                             } else if (result.rows.length > 1) {
                               defer.reject({error_code:self.const.ERROR_CODE.DUPLICATE_DB_DATA});
                             } else  {
                               defer.reject({error_code:self.const.ERROR_CODE.NO_RECORDS});
                             }
                           }
                           self.pg.end();
                         }
                       );
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
        self.pg.connect(self.const.DB_CONNECT_URI, function(err, client, done) {
            if(err) {
              defer.reject(new Error( "Could not connect to DB: " + err ));
              self.pg.end();
              return;
            }

            client.query( self.const.QUERY.AUTH_UPDATE_USER_TOKEN,
                         ['N', token],
                         function(err, result) {
                           if(err) {
                             defer.reject({error_code:self.const.ERROR_CODE.DB_CONNECTION});
                           } else {
                             defer.resolve();
                           }
                           self.pg.end();
                         });
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

    self.testListener = function(){
      self.router.post('/test', function(req, response){
        console.log("Received POST test call...");
        const { Client } = require('pg')
        const client = new Client({
          connectionString: self.const.DB_CONNECT_URI,
        })

        console.log("Connecting...");

        client.connect();

        console.log("Query...");

        const query = {
          name: 'fetch-projects',
          text: self.const.QUERY.FETCH_PROJECTS,
          types: {
              getTypeParser: () => (val) => val
          }
        };

        //
        client.query(query)
              .then(res => {
                console.log(res.rows)
                response.status(201)
                        .json({status: self.const.SUCCESS, data: res.rows});
                client.end()
              })
              .catch(e => console.error(e.stack))
        /*
        client.query(self.const.QUERY.FETCH_PROJECTS, [], (err, res) => {
            console.log("Result...");
            console.log("FETCH_PROJECTS result-");
            console.log(err ? err.stack : res.rows[0].name)
            client.end()
          })
          */

      });
    }
};

/**
 *  main():  Main code.
 */
var authRouter = new AuthRouter();
authRouter.initialize();
authRouter.testListener();
//authRouter.listen();
