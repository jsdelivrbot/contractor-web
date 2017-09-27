'use strict'

module.exports = (function() {

    /**
     *
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

    return {
        fetchData : fetchDataInner
    };
})();
