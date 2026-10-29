'use strict';

// Read and validate configuration. The signing secret is required and its
// value must never be printed or logged.
function loadConfig(env = process.env) {
  const secret = env.APP_SIGNING_SECRET;
  if (!secret || secret.trim() === '') {
    throw new Error('Missing required environment variable APP_SIGNING_SECRET');
  }
  return {
    port: Number(env.PORT) || 3000,
    databaseUrl: env.DATABASE_URL || 'postgres://app:app@localhost:5432/app',
    signingSecret: secret,
  };
}

module.exports = { loadConfig };
