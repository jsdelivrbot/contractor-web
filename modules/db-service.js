'use strict'

module.exports = (function() {
    var self = this;

    /**
     *
     */
    var startJobTokenCleanUp = function() {
        var appConst = require('./../routes/constants.js');
        var TimerJob = require('timer-jobs');
        var pgDb     = require('pg');
        var _        = require("underscore");
        var token    = require('./token.js');

        var dbCleanUpTimer = new TimerJob({interval: appConst.TIMER.DB_CLEAN_UP},
          function(done) {
            done();
            pgDb.connect(appConst.DB_CONNECT_URI, function(err, client, done) {
                if(err) {
                  return;
                }

                client.query( appConst.QUERY.FIND_USER_TOKEN, ['Y'],
                             function(err, result) {
                               _.each(result.rows, function(row){
                                 var id    = row.id;
                                 var token = row.token;
                                 
                                 token.isValidToken(token)
                                      .then(function(){
                                        // DO NOTHING
                                      }, function(error){
                                        console.log('Token is expired. Deleting this token - ' + token);
                                      });
                               });
                             });
            });
          });

        dbCleanUpTimer.start();
    }

    return {
        startJobTokenCleanUp : startJobTokenCleanUp
    };
})();
