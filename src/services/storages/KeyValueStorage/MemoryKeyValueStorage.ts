import { KeyValue } from '../../../types'
import { IKeyValueStorage } from './IKeyValueStorage'

export default  class MemoryKeyValueStorage implements IKeyValueStorage {
  private storage: Record<string, string> = {};

  async get(key: string) {
    return this.storage[key] || null
  }
  async set(key: string, value: any): Promise<void> {
    this.storage[key] = value.toString()
  }
  async del(key: string): Promise<void> {
    delete this.storage[key]
  }
  async getRecords(query: string): Promise<KeyValue<string>[]> {
    const records = Object.entries(this.storage).map(([key, value]) => ({
      key,
      value,
    }))

    return records.filter((record) => record.key.includes(query))
  }
}
