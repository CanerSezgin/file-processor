import { KeyValue, IDatabaseModel } from '../types'

export default class MemoryDBModel
  implements IDatabaseModel<KeyValue<any>>
{
  private storage: Record<string, any> = {};

  async findOne(key: string): Promise<KeyValue<any> | null> {
    const value = this.storage[key]
    return value ? { key, value } : null
  }
  async findMany(query: string): Promise<KeyValue<any>[]> {
    const records = Object.entries(this.storage).map(([key, value]) => ({
      key,
      value,
    }))

    return records.filter((record) => record.key.includes(query))
  }
  async create(key: string, value: any): Promise<any> {
    this.storage[key] = value
  }
  async update(key: string, value: any): Promise<any> {
    this.storage[key] = value
  }
  async delete(key: string): Promise<void> {
    delete this.storage[key]
  }
}
