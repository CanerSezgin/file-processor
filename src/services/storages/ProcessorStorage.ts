import { KeyValue, IKeyValueStorage, IDatabaseModel  } from '../../types'

export enum UpsertionType {
  ADD_UP,
  CHANGE,
}

export default class ProcessorStorage {
  constructor(private _client: IDatabaseModel<KeyValue<string>>) {}

  async upsertOne(
    key: string,
    newValue: any,
    upsertionType: UpsertionType = UpsertionType.CHANGE
  ) {
    if (upsertionType === UpsertionType.ADD_UP) {
      const record = await this._client.findOne(key)

      if (record) {
        await this._client.update(
          key,
          parseFloat(record.value) + parseFloat(newValue)
        )
      } else {
        await this._client.create(key, newValue)
      }
    } else if (upsertionType === UpsertionType.CHANGE) {
      await this._client.update(key, newValue)
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
    return this._client.findMany(query)
  }

  async deleteByQuery(query: string) {
    const records = await this._client.findMany(query)
    for (const record of records) {
      await this._client.delete(record.key)
    }
  }
}
