import dotenv from 'dotenv';
import assert from 'assert';

dotenv.config();

const { PORT, SQL_USER, SQL_PWD, SQL_DB, SQL_SERVER, SQL_PORT, JWT_SECRET } = process.env;

// Ensure required environment variables are set
assert(PORT, 'PORT is required');
assert(SQL_USER, 'SQL_USER is required');
assert(SQL_DB, 'SQL_DB is required');
assert(SQL_SERVER, 'SQL_SERVER is required');
assert(SQL_PORT, 'SQL_PORT is required');
assert(JWT_SECRET, 'JWT_SECRET is required');

const config = {
    port: PORT,
    jwt_secret: JWT_SECRET,
    sql: {
        host: SQL_SERVER,
        user: SQL_USER,
        password: SQL_PWD || "", // Use empty string if no password
        database: SQL_DB,
        port: Number(SQL_PORT), // Ensure port is a number
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    }
};

export default config;
