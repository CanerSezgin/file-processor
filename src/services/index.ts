import { createRedisClient } from '../lib/redis'
import RedisDBModel from './databases/RedisDBModel'
import CountWordsService from './CountWordsService'

const DB = createRedisClient({ db: 1 })
const DBModel = new RedisDBModel(DB)

// Export All Service Instance and Import these from other files.
export const countWordsService = new CountWordsService(DBModel)