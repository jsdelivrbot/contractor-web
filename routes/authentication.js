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

    	module.exports = self.router;

      self._      = require("underscore");
      self.Q      = require('q');
    };

    /**
     * Create connection
     */
    self.createConnection = function() {
    }

    /**
     * Fetch projects router.
     */
    self.authenticateRouter = function() {
        self.router.post('/', function(req, res) {
            var userName = req.body.username;
            var password = req.body.password;

            var code = userName;
            if(userName && password) {
                res.status(201).json({status: self.const.SUCCESS, code: self.const.ERROR_CODE.LOGIN_FORM_INVALID});
            } else {
                res.send({status: self.const.FAILED, code: self.const.ERROR_CODE.LOGIN_FORM_INVALID});
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
