#!/bin/env node

/**
 *  Define the project router.
 */
var ProjectRouter = function() {
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
     * Fetch projects per token.
     */
    self.fetchProjects = function(token){
        var defer = self.Q.defer();
        self.pg.connect(self.const.DB_CONNECT_URI, function(err, client, done) {
            if(err) {
              defer.reject(new Error( "Could not connect to DB: " + err ));
              return;
            }

            client.query( self.const.QUERY.FETCH_PROJECTS, [''],
                         function(err, result) {
                            if (err) {
                              defer.reject(self.const.ERROR_CODE.LOGIN_FORM_INVALID);
                            } else {
                              defer.resolve(result);
                            }
            });
        });
        return defer.promise;
    }

    /**
     * Search projects.
     */
    self.fetchProjectRouter = function() {
      self.router.get('/', function(req, response) {
        var token = req.token;
        if(token) {
          self.token.isValidToken(token)
              .then(function(successResult){
                self.fetchProjects(token)
                    .then(function(projects){
                        response.status(201).json({data:projects});
                    });
              }, function(error){
                response.status(201)
                        .json({status: self.const.FAILED,
                               error_code: error.error_code,
                               error:error});
              });
        } else {
          response.status(201)
                  .json({status: self.const.FAILED, error_code: self.const.ERROR_CODE.REFRESH_TOKEN_IS_REQUIRED});
        }
      });
    };

    /**
     * Create projects.
     */
    self.createProjectRouter = function() {
      self.router.post('/', function(req, response) {
      });
    };

    /**
     * Update projects.
     */
    self.updateProjectRouter = function() {
      self.router.put('/', function(req, response) {
      });
    };

    /**
     * Delete projects.
     */
    self.deleteProjectRouter = function() {
      self.router.delete('/', function(req, response) {
      });
    };

    /**
     * Listen for messages
     */
    self.listen = function() {
    	console.log('Listening project api calls...');

      self.fetchProjectRouter();
      self.createProjectRouter();
      self.updateProjectRouter();
      self.deleteProjectRouter();
    };
};

/**
 *  main():  Main code.
 */
var projectRouter = new ProjectRouter();
projectRouter.initialize();
projectRouter.listen();
