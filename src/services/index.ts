import { createRedisClient } from '../lib/redis'
import RedisDBModel from './databases/RedisDBModel'
import CountWordsService from './CountWordsService'

const RedisMainDB = createRedisClient({ db: 1 })

// Export All Service Instance and Import these from other files.
export const countWordsService = new CountWordsService(new RedisDBModel(RedisMainDB, 'countwords'))

RedisMainDB.getKeyValues('').then(r => console.log('main db records', {r}))