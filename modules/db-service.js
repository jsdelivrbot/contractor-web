'use strict'

module.exports = (function() {

    /**
     *
     */
    var startJobTokenCleanUp = function() {
        var appConst = require('./constants.js');
        var TimerJob = require('timer-jobs');
        var pgDb     = require('pg');
        var _        = require("underscore");

        var dbCleanUpTimer = new TimerJob({interval: appConst.TIMER.DB_CLEAN_UP},
          function(done) {
            done();
            pgDb.connect(appConst.DB_CONNECT_URI, function(err, client, done) {
                if(err) {
                  return;
                }

                client.query( self.const.QUERY.FIND_USER_TOKEN, [],
                             function(err, result) {
                               self._.each(result.rows, function(row){
                                 console.log(row.id);
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
