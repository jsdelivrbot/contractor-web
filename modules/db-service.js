'use strict'

module.exports = (function() {
    var self = this;

    /**
     * Token clean up job.
     */
    var startJobTokenCleanUp = function() {
        var appConst = require('./../routes/constants.js');
        var TimerJob = require('timer-jobs');
        var _        = require("underscore");
        var pgDb     = require('pg');
        var tokenModule = require('./token.js');

        var dbCleanUpTimer = new TimerJob({interval: appConst.TIMER.DB_CLEAN_UP},
          function(done) {
            done();
            pgDb.connect(appConst.DB_CONNECT_URI, function(err, client, done) {
                if(err) {
                  return;
                }

                client.query( appConst.QUERY.FIND_USER_TOKEN, ['N'],
                             function(err, result) {
                               _.each(result.rows, function(row){
                                 var id    = row.id;
                                 var token = row.token;

                                 tokenModule.isValidToken(token)
                                      .then(function(){
                                        // DO NOTHING
                                      }, function(error){
                                        console.log('Token is expired. Deleting this token with ID:' + id + ' - token:' + token);
                                        deleteUserTokenRecord(id);
                                      });
                               });
                             });
            });
          });

        dbCleanUpTimer.start();
    }

    var deleteUserTokenRecord = function(userTokenID) {
      var appConst = require('./../routes/constants.js');
      var pgDb     = require('pg');

      pgDb.connect(appConst.DB_CONNECT_URI, function(err, client, done) {
          if(err) {
            return;
          }

          client.query( appConst.QUERY.DELETE_USER_TOKEN,
                       [userTokenID],
                       function(err, result) {
                         if(err) {
                           console.log('Error has occured while deleting user token with ID:' + userTokenID);
                         } else {
                           console.log('User Token with ID:' + userTokenID + ' has been deleted successfully!');
                         }
                       });
      });
    }

    return {
        startJobTokenCleanUp : startJobTokenCleanUp
    };
})();
