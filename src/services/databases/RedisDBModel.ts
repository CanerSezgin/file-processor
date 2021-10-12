import { KeyValue, IDatabaseModel } from '../../types'
import { IRedisClient } from '../../lib/redis'

export default class RedisDBModel implements IDatabaseModel<KeyValue<string>> {
  constructor(private _client: IRedisClient) {}

  async findOne(key: string): Promise<KeyValue<string> | null> {
    const value = await this._client.getAsync(key)
    return value ? { key, value } : null
  }
  async findMany(query: string): Promise<KeyValue<string>[]> {
    const records = await this._client.getKeyValues(query)
    return records
  }
  async create(key: string, value: any): Promise<any> {
    await this._client.setAsync(key, value)
  }
  async update(key: string, value: any): Promise<any> {
    await this._client.setAsync(key, value)
  }
  async delete(key: string): Promise<void> {
    await this._client.delAsync(key)
  }
}
