import stream, { Readable, TransformCallback } from 'stream'
import memoryUsageLogger from '../utils/memoryUsageLogger'
import { Processor } from './Processor'

import ProcessorStorage, { UpsertionType } from './storages/ProcessorStorage'

const countWords = (input: string) => {
  const regexPattern = /\w+/g
  const words = input.match(regexPattern) || []

  return words.reduce((aggregated, word) => {
    const lowercaseWord = word.toLowerCase()

    if (aggregated.hasOwnProperty(lowercaseWord)) {
      aggregated[lowercaseWord] += 1
    } else {
      aggregated[lowercaseWord] = 1
    }
    return aggregated
  }, {} as Record<string, number>)
}

export default class CountWordsTransformer extends stream.Transform {
  noOfChunks = 0;
  maxRSS = 0;

  constructor(
    options = {},
    private _processKey: string,
    private _tempStorage: ProcessorStorage
  ) {
    super({
      ...options,
      objectMode: true,
      readableObjectMode: true,
      writableObjectMode: true,
    })
  }

  async _transform(
    chunk: any,
    encoding: BufferEncoding,
    done: TransformCallback
  ) {
    console.log('transform init')
    this.noOfChunks++

    if (Buffer.isBuffer(chunk)) {
      chunk = chunk.toString('utf8')
    }

    const stats = countWords(chunk)

    for (const record of Object.entries(stats)) {
      const [key, value] = record
      await this._tempStorage.upsertOne(
        `${this._processKey}_${key}`,
        value,
        UpsertionType.ADD_UP
      )
    }

    const { rss, log: logMemoryUsage } = memoryUsageLogger()
    //logMemoryUsage();

    if (this.maxRSS < rss) {
      this.maxRSS = rss
    }

    done(null, JSON.stringify(stats))
  }

  end() {
    console.log(`Entire file was processed.
    Total Chunks: ${this.noOfChunks}
    Max RSS: ${memoryUsageLogger().format(this.maxRSS)}`)
  }
}

export class CountWordsProcessor extends Processor {
  process(): Promise<{ processKey: string }> {
    const processKey = new Date().getTime().toString()

    return new Promise((resolve, reject) => {
      try {
        const readstream = this._processor.createReadStream(this.input)
        readstream.pipe(
          new CountWordsTransformer({}, processKey, this.tempStorage),
          {
            end: true,
          }
        )

        readstream.on('close', async () => {
          console.log('@>>> end')
          //await this.deleteTempRecords(processKey)
          const allrecords = await this.tempStorage.getRecords('')
          console.log({ allrecords })

          const records = await this.getTempRecords(processKey)
          console.log('RECORDS GOT')
          console.log({ records })
          resolve({ processKey })
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  async getTempRecords(processKey: string) {
    return this.tempStorage.getRecords(`${processKey}_`)
  }

  async deleteTempRecords(processKey: string) {
    return this.tempStorage.deleteByQuery(`${processKey}_`)
  }

  async saveToDB() {}
}
