import { KeyValue } from '../../../types'
import { createRedisClient } from '../../../lib/redis'
import { IKeyValueStorage } from './IKeyValueStorage'

export default class RedisKeyValueStorage implements IKeyValueStorage {
  private client = createRedisClient({ db: 2 });
  async get(key: string) {
    const value = await this.client.getAsync(key)
    return value
  }
  async set(key: string, value: any): Promise<void> {
    await this.client.setAsync(key, value)
  }

  async del(key: string): Promise<void> {
    await this.client.delAsync(key)
  }
  async getRecords(query: string): Promise<KeyValue<string>[]> {
    const records = await this.client.getKeyValues(query)
    return records
  }
}
