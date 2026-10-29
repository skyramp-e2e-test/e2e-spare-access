'use strict';

const { Pool } = require('pg');
const { hashPassword } = require('./passwords');

const TEST_USER = { email: 'test@example.com', password: 'password123' };

function createPool(databaseUrl) {
  return new Pool({ connectionString: databaseUrl });
}

async function waitForDatabase(pool, { attempts = 30, delayMs = 1000 } = {}) {
  for (let i = 1; i <= attempts; i++) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (err) {
      if (i === attempts) throw err;
      console.log(`Waiting for database (attempt ${i}/${attempts})...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function migrate(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

// Insert the test user, or reset its password so the documented
// credentials always work.
async function seedTestUser(pool) {
  await pool.query(
    `INSERT INTO users (email, password_hash) VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [TEST_USER.email, hashPassword(TEST_USER.password)]
  );
  console.log(`Seeded test user ${TEST_USER.email}`);
}

module.exports = { createPool, waitForDatabase, migrate, seedTestUser, TEST_USER };
