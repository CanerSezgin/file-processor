import { mainDB, tempDB } from '../dbs'
import CountWordsService from './CountWordsService'
import ProcessorStorage from '../services/storages/ProcessorStorage'

import RedisDBModel from '../databases/RedisDBModel'
import MemoryDBModel from '../databases/MemoryDBModel'

// Export All Service Instance and Import these from other files.
export const countWordsService = new CountWordsService(
  new RedisDBModel(mainDB, 'countwords')
)

/**
 * Fully extendable | You can easily change the database/storage type
 * 
 * use: new MemoryDBModel() 
 * instead: new RedisDBModel(tempDB)
 */
export const tempProcessorStorage = new ProcessorStorage(
  new RedisDBModel(tempDB)
)

mainDB.getKeyValues('').then((r) => console.log('main db records', { r }))
tempDB.getKeyValues('').then((r) => console.log('temp db records', { r }))

/* mainDB.flushDbAsync()
tempDB.flushDbAsync() */
