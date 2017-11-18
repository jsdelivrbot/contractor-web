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
     * Search projects.
     */
    self.fetchProjectRouter = function() {
      self.router.get('/', function(req, response) {
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
