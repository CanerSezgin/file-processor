import { createRedisClient } from '../lib/redis'
import CountWordsService from './CountWordsService'
import ProcessorStorage from '../services/storages/ProcessorStorage'

import RedisDBModel from './databases/RedisDBModel'
import MemoryDBModel from './databases/MemoryDBModel'

const redisMainDB = createRedisClient({ db: 1 })
const redisTempDB = createRedisClient({ db: 2 })

// Export All Service Instance and Import these from other files.
export const countWordsService = new CountWordsService(
  new RedisDBModel(redisMainDB, 'countwords')
)


/**
 * Fully extendable | You can easily change the database/storage type
 * 
 * use: new MemoryDBModel() 
 * instead: new RedisDBModel(redisTempDB)
 */
export const tempProcessorStorage = new ProcessorStorage(
  new RedisDBModel(redisTempDB)
)

redisMainDB.getKeyValues('').then((r) => console.log('main db records', { r }))
redisTempDB.getKeyValues('').then((r) => console.log('temp db records', { r }))

/* redisMainDB.flushDbAsync()
redisTempDB.flushDbAsync() */
