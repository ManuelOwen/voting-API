import mysql from 'mysql2/promise';
import config from './model/config.js';

const pool = mysql.createPool(config.db);

export default pool;
