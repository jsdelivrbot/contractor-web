#!/bin/env node

/**
 *  Define the project router class.
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

        self.base.executeQuery(self.const.QUERY.FETCH_PROJECTS, [])
                         .then(function(data){
                             defer.resolve({data:data.rows.data[0], status: self.const.SUCCESS});
                         }, function(error){
                           defer.reject(new Error(error));
                         });

        return defer.promise;
    }

    /**
     * Search projects.
     */
    self.fetchProjectRouter = function() {
      self.router.get('/', function(req, response) {
        var token = req.query.token;
        console.log("Token - " + token);
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
                  .json({status: self.const.FAILED,
                         error_code: self.const.ERROR_CODE.REFRESH_TOKEN_IS_REQUIRED});
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
