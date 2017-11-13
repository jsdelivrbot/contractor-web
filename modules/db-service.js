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
        var self._        = require("underscore");

        var dbCleanUpTimer = new TimerJob({interval: appConst.TIMER.DB_CLEAN_UP},
          function(done) {
            done();
            pgDb.connect(appConst.DB_CONNECT_URI, function(err, client, done) {
                if(err) {
                  return;
                }

                client.query( appConst.QUERY.FIND_USER_TOKEN, [],
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
