'use strict'

module.exports = (function() {
    /**
     *
     */
    var isValidToken = function(token) {
        var appConst = require('./../routes/constants.js');
        var jwt      = require('jsonwebtoken');
        var pgDb     = require('pg');
        var _        = require("underscore");
        var q        = require('q');

        var defer = q.defer();

        if(!token) {
          defer.reject(new Error("Error.Token is null."));
          return;
        }

        console.log("isValidToken - " + token);
        jwt.verify(token, appConst.JWT_ACCESS_TOKEN_SECRET, function(err, decoded) {
          console.log("isValidToken result - " + err);
           if(!err){
             defer.resolve(true);
           } else {
             defer.reject(new Error("Token is expired/invalid: - " + err));
           }
        });

        return defer.promise;
    }

    return {
        isValidToken : isValidToken
    };
})();
