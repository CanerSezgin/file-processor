import stream, { Readable, TransformCallback } from 'stream'
import memoryUsageLogger from '../../utils/memoryUsageLogger'
import { Processor } from './Processor'

import ProcessorStorage, { UpsertionType } from '../storages/ProcessorStorage'

const countWords = (input: string) => {
  const regexPattern = /\b[^\d\W]+\b/g
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

  constructor(
    options = {},
    private readonly _processKey: string,
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
    _encoding: BufferEncoding,
    done: TransformCallback
  ) {
    this.noOfChunks++

    if (Buffer.isBuffer(chunk)) {
      chunk = chunk.toString('utf8')
    }

    const stats = countWords(chunk)

    for (const record of Object.entries(stats)) {
      const [key, value] = record

      /**
       * At this point there are 3 options 
       * 1. Directly Update Database 
       * --- Downside is that during processing, some errors may occur and processing may be interrupted.
       * --- This cause inconsistency because processed chunks already updated the db however there are some missing chunks because process is interrupted.
       * 
       * 2. Create an object in memory, hold it until whole file is processed (update each chunk is processed) then update db. 
       * --- Downside is that for large files memory limitations can exceed, processing will fail
       * 
       * 3. Create a temporary storage (db), write everything into this db, when processing is done, move everything into Main DB. Clean up temp data.
       * --- If some error happens during the processing, main db won't be affected. (No need to rollback)
       * --- If processing fails at some point, it can be run again from queue system. 
       */
      await this._tempStorage.upsertOne(
        `${this._processKey}_${key}`,
        value,
        UpsertionType.ADD_UP
      )
    }

    done(null, JSON.stringify(stats))
  }

  end() {
    console.log('Entire file has been processed.')
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
          resolve({ processKey })
        })
      } catch (error) {
        this.deleteTempRecords(processKey).then(() => {
          reject(error)
        })
      }
    })
  }
}
