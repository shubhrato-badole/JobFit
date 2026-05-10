import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  lazyConnect: true,     // don't crash on startup if Redis unavailable
  tls: {
    rejectUnauthorized: false  // required for Upstash
  }
})

// THIS IS THE CRITICAL LINE
// Without this, Redis error kills the entire Node process
redis.on('error', (err) => {
  console.error('Redis error:', err.message)
  // just log it — don't crash the server
})