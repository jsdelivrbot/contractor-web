'use strict'

module.exports = (function() {

    /**
     * Fetch Data Generic
     */
    var fetchDataInner = function(query, data) {
        var q     = require('q');
        var defer = q.defer();

        if(!query || !data)
            return undefined;

        var connection = getConnectionInner();

        connection.connect();

        connection.query(query, data, function(err, rows, fields) {
            if (err) throw err;
            if( rows.length > 0 ) {
                var data = [];
                for (var i in rows) {
                    data.push(rows[i]);
                }
                defer.resolve(data);
            } else {
                defer.reject(new Error("Empty result."));
            }
        });

        connection.end();

        return defer.promise;
    }

    var executeQuery = function(queryStr, params){
      var q     = require('q');
      var defer = q.defer();
      var constants  = require('./../routes/constants.js');

      if(!queryStr)
          return undefined;

      const { Client } = require('pg')
      var client = new Client({ connectionString: constants.DB_CONNECT_URI });

      const query = {
        text: queryStr,
        values: params,
        types: {getTypeParser: () => (val) => val}
      };

      client.connect();
      client.query(query)
            .then(data => {
              client.end()
              defer.resolve(data);
            })
            .catch(e => defer.reject(new Error(e.stack)));

      return defer.promise;
    }

    return {
        fetchData : fetchDataInner,
        executeQuery : executeQuery
    };
})();
