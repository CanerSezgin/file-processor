import { KeyValue, IKeyValueStorage  } from '../../types'

export enum UpsertionType {
  ADD_UP,
  CHANGE,
}

export default class ProcessorStorage {
  constructor(private _keyValueStorage: IKeyValueStorage) {}

  async upsertOne(
    key: string,
    newValue: any,
    upsertionType: UpsertionType = UpsertionType.CHANGE
  ) {
    if (upsertionType === UpsertionType.ADD_UP) {
      const currentValue = await this._keyValueStorage.get(key)

      if (currentValue) {
        await this._keyValueStorage.set(
          key,
          parseFloat(currentValue) + parseFloat(newValue)
        )
      } else {
        await this._keyValueStorage.set(key, newValue)
      }
    } else if (upsertionType === UpsertionType.CHANGE) {
      await this._keyValueStorage.set(key, newValue)
    }
  }

  async upsertBulkFromObject(records: KeyValue<any>) {
    const entries = Object.entries(records)
    for (const entry of entries) {
      const [key, value] = entry
      await this.upsertOne(key, value)
    }
  }

  async getRecords(query: string) {
    return this._keyValueStorage.getRecords(query)
  }

  async deleteByQuery(query: string) {
    const records = await this._keyValueStorage.getRecords(query)
    for (const record of records) {
      await this._keyValueStorage.del(record.key)
    }
  }
}
