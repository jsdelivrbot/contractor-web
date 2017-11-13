'use strict'

module.exports = (function() {

    /**
     *
     */
    var startJobTokenCleanUp = function() {
        var TimerJob = require('timer-jobs');
        var dbCleanUpTimer = new TimerJob({interval: 5000}, function(done) {
          console.log('timer job');
          done();
        });
        dbCleanUpTimer.start();
    }

    return {
        startJobTokenCleanUp : startJobTokenCleanUp
    };
})();
