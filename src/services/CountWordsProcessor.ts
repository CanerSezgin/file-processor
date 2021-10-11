import stream, { TransformCallback } from 'stream'
import memoryUsageLogger from '../utils/memoryUsageLogger'
import { Processor, ProcessType } from './Processor'

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

  constructor(options = {}) {
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
    this.noOfChunks++

    if (Buffer.isBuffer(chunk)) {
      chunk = chunk.toString('utf8')
    }

    const stats = countWords(chunk)

    for (const record of Object.entries(stats)) {
      const [key, value] = record
      console.log(record)
      //await processRedisService.countwords.upsertTempRecord('www', key, value);
    }

    const { rss, log: logMemoryUsage } = memoryUsageLogger()
    //logMemoryUsage();

    if (this.maxRSS < rss) {
      this.maxRSS = rss
    }

    done()
  }

  end() {
    console.log(`Entire file was processed.
    Total Chunks: ${this.noOfChunks}
    Max RSS: ${memoryUsageLogger().format(this.maxRSS)}`)
  }
}

export class CountWordsProcessor extends Processor {
  process() {
    const readstream = this._processor.createReadStream(this._input)
    console.log(readstream)

    return new Promise((resolve, reject) => {
      readstream.pipe(new CountWordsTransformer()).pipe(process.stdout)
      readstream.on('end', () => {
        console.log('end of countwords stream')
        resolve(true)
      })
    })
  }
}
