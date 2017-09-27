module.exports = Object.freeze({
    SUCCESS: 'SUCCESS',
    FAILED : 'FAILED',
    DB_CONNECT_URI: process.env.DATABASE_URL || 'postgres://hnuegxefpebghz:6f06966334822738d634b26337ea8aba8362d91f4088db2f6e9951ca4a6bdc6b@ec2-54-243-185-123.compute-1.amazonaws.com:5432/d6itatao1468j?&ssl=true',
    JWT_ACCESS_TOKEN_SECRET: 'supersecret_access_token',
    JWT_REFRESH_TOKEN_SECRET: 'supersecret_refresh_token',
    REFRESH_TOKEN_EXPIRY_TIME_IN_HOURS: 60*60*3, // 3 hours expiry time
    ACCESS_TOKEN_EXPIRY_TIME_IN_SEC: 300, // 5 min expiry time
    ERROR_CODE: {
    	LOGIN_INVALID: 10, // User login failed
    	LOGIN_FORM_INVALID: 11, // Login form invalid
    	REFRESH_TOKEN_IS_REQUIRED: 12, // Refresh token is required.
      DB_SAVE_RECORD_ERROR: 13 // Save record error
    },
    QUERY: {
        FETCH_USERS: 'SELECT * FROM users'
    }
});