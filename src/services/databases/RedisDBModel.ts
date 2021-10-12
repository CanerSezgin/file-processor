import { KeyValue, IDatabaseModel } from '../../types'
import { IRedisClient } from '../../lib/redis'

export default class RedisDBModel implements IDatabaseModel<KeyValue<string>> {
  constructor(private _client: IRedisClient, public collection?: string) {
  }

  private getLocalKey(key: string){
    return this.collection ? `${this.collection}_${key}` : key
  }

  async findOne(key: string): Promise<KeyValue<string> | null> {
    const value = await this._client.getAsync(this.getLocalKey(key))
    return value ? { key, value } : null
  }
  async findMany(query: string): Promise<KeyValue<string>[]> {
    const records = await this._client.getKeyValues(this.getLocalKey(query))
    return records
  }
  async create(key: string, value: any): Promise<any> {
    console.log(this.getLocalKey(key))
    await this._client.setAsync(this.getLocalKey(key), value)
  }
  async update(key: string, value: any): Promise<any> {
    await this._client.setAsync(this.getLocalKey(key), value)
  }
  async delete(key: string): Promise<void> {
    await this._client.delAsync(this.getLocalKey(key))
  }
}
