// src/server/utils/envLoader.ts
import dotenv from 'dotenv';
import path from 'path';

console.log('[envLoader] Pre-loading environment variables...');
const envPath = path.resolve(process.cwd(), '.env.development');
console.log('[envLoader] Attempting to load .env file from:', envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('[envLoader] FATAL: Error loading .env.development file. Server cannot start.', result.error);
  process.exit(1);
}

if (result.parsed) {
  console.log('[envLoader] Successfully loaded variables from .env.development:', Object.keys(result.parsed));
} else {
  console.warn('[envLoader] .env.development file was loaded, but no variables were parsed. Ensure it is correctly formatted and not empty if variables are expected.');
}

if (!process.env.DATABASE_URL) {
  console.error('[envLoader] FATAL: DATABASE_URL is not defined after attempting to load .env.development. Server cannot start.');
  process.exit(1);
}

console.log('[envLoader] DATABASE_URL after load:', process.env.DATABASE_URL);
console.log('[envLoader] Pre-loading complete.');

// Now that the environment is loaded, import and run the main server application
import '../index';
