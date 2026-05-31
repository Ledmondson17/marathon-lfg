import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

// pg.Pool manages a set of database connections so we don't open a new one
// on every request. The connection string is read from the .env file.
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

export default pool
