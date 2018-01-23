module.exports = Object.freeze({
    SUCCESS: 'SUCCESS',
    FAILED : 'FAILED',
    DB_CONNECT_URI: process.env.DATABASE_URL,
    JWT_ACCESS_TOKEN_SECRET: 'supersecret_access_token',
    JWT_REFRESH_TOKEN_SECRET: 'supersecret_refresh_token',
    REFRESH_TOKEN_EXPIRY_TIME_IN_HOURS: 60*60*3, // 3 hours expiry time
    ACCESS_TOKEN_EXPIRY_TIME_IN_SEC: 300, // 5 min expiry time
    TIMER:{
      DB_CLEAN_UP: 50000
    },
    ERROR_CODE: {
    	LOGIN_INVALID: 10, // User login failed
    	LOGIN_FORM_INVALID: 11, // Login form invalid
    	REFRESH_TOKEN_IS_REQUIRED: 12, // Refresh token is required.
      DB_SAVE_RECORD_ERROR: 13, // Save record error
      IVALID_TOKEN: 14, // Invalid token
      DUPLICATE_DB_DATA: 15, // Duplicate DB data
      DB_CONNECTION: 16, // Invalid DB connection
      NO_RECORDS: 17 // No records found
    },
    QUERY: {
        FETCH_USERS: 'SELECT * FROM auth_user',
        AUTH_UPDATE_USER_TOKEN: 'UPDATE user_token SET is_active = $1 WHERE token = $2',
        NEW_USER_TOKEN: 'INSERT INTO user_token (id, user_id, token, is_active) VALUES (nextval($1), $2, $3, $4)',
        FIND_USER_TOKEN: 'SELECT id, token FROM user_token WHERE is_active = $1',
        DELETE_USER_TOKEN: 'DELETE FROM user_token WHERE ID = $1',
        FETCH_PROJECTS: 'SELECT ID, NAME, CREATE_DATE from user_projects WHERE NAME LIKE $1',
        CHECK_USER_TOKEN: 'SELECT id FROM user_token WHERE token = $1 AND is_active = $2',
        AUTH_USER: 'SELECT id, user_name FROM AUTH_USER where email = $1 AND password = $2 LIMIT 1'
    }
});
