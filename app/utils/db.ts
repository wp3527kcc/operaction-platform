import mysql2 from 'mysql2/promise';
const pool = mysql2.createPool({
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    port: +(process.env.DATABASE_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export { pool }