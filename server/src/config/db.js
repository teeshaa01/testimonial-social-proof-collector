const mongoose = require('mongoose');
const dns = require('dns');

// On Windows local development, ISP DNS servers frequently fail SRV lookups (querySrv ECONNREFUSED).
// On Linux / production containers (Render), preserve the native system resolver from /etc/resolv.conf.
if (process.platform === 'win32' && process.env.MONGODB_URI && process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (err) {
    // Ignore if environment restricts custom DNS servers
  }
}

const maskUri = (uri) => {
  if (!uri) return 'NOT_CONFIGURED';
  try {
    return uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  } catch {
    return 'MASKED_URI';
  }
};

let isConnecting = false;

const connectDB = async (retryCount = 0) => {
  if (isConnecting) return;
  isConnecting = true;

  const isProduction = process.env.NODE_ENV === 'production';
  const uri = process.env.MONGODB_URI;

  if (!uri && isProduction) {
    console.error('[MongoDB] CRITICAL: MONGODB_URI environment variable is missing in production.');
    console.error('[MongoDB] Action Required: Add MONGODB_URI to Render Dashboard -> Environment.');
    isConnecting = false;
    return;
  }

  const connectionUri = uri || 'mongodb://127.0.0.1:27017/testimonial_collector';
  const isAtlas = connectionUri.includes('mongodb.net') || connectionUri.startsWith('mongodb+srv://');

  console.log(`[MongoDB] Initializing connection (Target: ${isAtlas ? 'MongoDB Atlas' : 'Local MongoDB'})...`);
  console.log(`[MongoDB] Connection URI: ${maskUri(connectionUri)}`);

  try {
    const conn = await mongoose.connect(connectionUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });

    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    isConnecting = false;
  } catch (error) {
    isConnecting = false;
    console.error(`[MongoDB] Connection error: ${error.message}`);

    if (
      error.name === 'MongoServerSelectionError' ||
      error.message.includes('whitelist') ||
      error.message.includes('Could not connect to any servers')
    ) {
      console.warn('[MongoDB] Diagnosis: MongoDB Atlas blocked the connection. Render uses dynamic IP addresses.');
      console.warn('[MongoDB] Fix: In MongoDB Atlas -> Network Access -> Add IP Address -> Select "Allow Access from Anywhere" (0.0.0.0/0).');
    }

    if (isProduction) {
      const retryDelay = Math.min(5000 * Math.pow(1.5, retryCount), 30000);
      console.log(`[MongoDB] Retry scheduled in ${Math.round(retryDelay / 1000)}s (attempt ${retryCount + 1}). Server remains running for health checks.`);
      setTimeout(() => connectDB(retryCount + 1), retryDelay);
    } else {
      console.warn('[MongoDB] Running in local development mode without active database connection.');
    }
  }
};

// Monitor Mongoose connection events
mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Disconnected from database.');
});
mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB] Reconnected to database.');
});

module.exports = connectDB;
