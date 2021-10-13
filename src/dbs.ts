import { createRedisClient } from './lib/redis'

export const mainDB = createRedisClient({ db: 1 })
export const tempDB = createRedisClient({ db: 2 })
export const queueRedisDBConfig = { db: 10 }
