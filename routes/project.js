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
    self.fetchProjects = function(queryParams){
        var defer = self.Q.defer();

        var params = [];
        var query  = self.const.QUERY.FETCH_PROJECTS_ALL;

        if(queryParams.id != undefined) {
          query = self.const.QUERY.FETCH_PROJECTS_BY_ID;
          params = [queryParams.id];
        } else if(queryParams.name != undefined) {
          query = self.const.QUERY.FETCH_PROJECTS_BY_NAME;
          params = ["%" + queryParams.name + "%"];
        }

        self.base.executeQuery(query, params)
                         .then(function(data){
                             console.log(data)
                             defer.resolve({data:data.rows, status: self.const.SUCCESS});
                         }, function(error){
                           defer.reject(new Error(error));
                         });

        return defer.promise;
    }

    /**
     * Create a new project record.
     */
    self.createProject = function(){
      var defer = self.Q.defer();
      self.base.executeQuery(query, params)
               .then(function(data){
                     defer.resolve({status: self.const.SUCCESS});
               }, function(error){
                     defer.reject(new Error(error));
               }
      );

      return defer.promise;
    }

    /**
     * Search projects.
     */
    self.fetchProjectRouter = function() {
      self.router.get('/', self.checkToken, function(req, response) {
        var token = req.query.token;
        if(token) {
          self.token.isValidToken(token)
              .then(function(successResult){
                self.fetchProjects(req.query)
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
     * Check token if exist.
     */
    self.checkToken = function(req, res, next) {
        console.log('The response will be sent by the next function ...');

        var token = req.query.token;

        token = (token == null ? req.body.toke : token);

        if(token) {
          self.token.isValidToken(token)
              .then(function(successResult){
                next();
              }, function(error){
                res.status(201)
                        .json({status: self.const.FAILED,
                               error_code: error.error_code,
                               error:error});
              });
        } else {
          res.status(201)
                  .json({status: self.const.FAILED,
                         error_code: 8888,
                         error:"Token is not valid."});
        }
    }

    /**
     * Create projects.
     */
    self.createProjectRouter = function() {
      self.router.post('/', self.checkToken, function(req, response) {
        var token = req.body.token;
        if(token) {
          self.token.isValidToken(token)
              .then(function(successResult){
                self.createProject(req.body)
                    .then(function(status){
                        response.status(201).json({status: status});
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
