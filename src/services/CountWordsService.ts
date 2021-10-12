import { IDatabaseModel, KeyValue } from '../types'

interface ICountWordsService {
  getCounts(word: string): Promise<number>;
  upsertCounts(word: string, counts: number): Promise<void>;
}

export default class CountWordsService implements ICountWordsService {
  constructor(private _DBModel: IDatabaseModel<KeyValue<string>>) {}

  async getCounts(word: string): Promise<number> {
    const doc = await this._DBModel.findOne(word)
    return doc ? parseInt(doc.value) : 0
  }

  async upsertCounts(word: string, counts: number) {
    const currentCounts = await this.getCounts(word)
    if (currentCounts) {
      return this._DBModel.update(word, counts + currentCounts)
    } else {
      return this._DBModel.create(word, counts)
    }
  }
}
