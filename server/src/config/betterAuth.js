import { MongoClient } from 'mongodb';
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';

const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ticketbari');
let dbPromise;

async function getDatabase() {
  if (!dbPromise) {
    dbPromise = client.connect().then(() => client.db(process.env.BETTER_AUTH_DB || 'ticketbari'));
  }
  return dbPromise;
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:5000',
  database: mongodbAdapter(await getDatabase()),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },
  trustedOrigins: [process.env.CLIENT_URL || 'http://127.0.0.1:5173'],
});
