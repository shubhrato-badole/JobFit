import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 1,
  enableReadyCheck: false,
  retryStrategy(times) {
    return Math.min(times * 200, 2000);
  },
     
  tls: {
    rejectUnauthorized: false  
  }
})


redis.on('error', (err) => {
  console.error('Redis error:', err.message)
  
})

export default redis