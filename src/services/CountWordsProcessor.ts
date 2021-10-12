import stream, { Readable, TransformCallback } from 'stream';
import memoryUsageLogger from '../utils/memoryUsageLogger';
import { Processor } from './Processor';

import RedisKeyValueStorage from './storages/KeyValueStorage/RedisKeyValueStorage';
import MemoryKeyValueStorage from './storages/KeyValueStorage/MemoryKeyValueStorage';
import ProcessorStorage, { UpsertionType } from './storages/ProcessorStorage';

const countWordsProcessorStorage = new ProcessorStorage(
  new MemoryKeyValueStorage()
);

const countWords = (input: string) => {
  const regexPattern = /\w+/g;
  const words = input.match(regexPattern) || [];

  return words.reduce((aggregated, word) => {
    const lowercaseWord = word.toLowerCase();

    if (aggregated.hasOwnProperty(lowercaseWord)) {
      aggregated[lowercaseWord] += 1;
    } else {
      aggregated[lowercaseWord] = 1;
    }
    return aggregated;
  }, {} as Record<string, number>);
};

export default class CountWordsTransformer extends stream.Transform {
  noOfChunks = 0;
  maxRSS = 0;

  constructor(options = {}) {
    super({
      ...options,
      objectMode: true,
      readableObjectMode: true,
      writableObjectMode: true,
    });
  }

  async _transform(
    chunk: any,
    encoding: BufferEncoding,
    done: TransformCallback
  ) {
    console.log('transform init');
    this.noOfChunks++;

    if (Buffer.isBuffer(chunk)) {
      chunk = chunk.toString('utf8');
    }

    const stats = countWords(chunk);

    for (const record of Object.entries(stats)) {
      const [key, value] = record;
      await countWordsProcessorStorage.upsertOne(
        `caner_${key}`,
        value,
        UpsertionType.ADD_UP
      );
    }

    const { rss, log: logMemoryUsage } = memoryUsageLogger();
    //logMemoryUsage();

    if (this.maxRSS < rss) {
      this.maxRSS = rss;
    }

    const r = await countWordsProcessorStorage.getRecords('');
    console.log({ r });
    done(null, JSON.stringify(stats));
  }

  end() {
    console.log(`Entire file was processed.
    Total Chunks: ${this.noOfChunks}
    Max RSS: ${memoryUsageLogger().format(this.maxRSS)}`);
  }
}

export class CountWordsProcessor extends Processor {
  process() {
    return new Promise((resolve, reject) => {
      try {
        const readstream = this._processor.createReadStream(this._input);
        readstream.pipe(new CountWordsTransformer(), {
          end: true,
        });

        /* transformStream.on('data', (chunk) => {
          console.log("......................... DATA ................")
        }) */

        readstream.on('close', async () => {
          console.log('@>>> end');
          const records = await this.getRecords();
          console.log('RECORDS GOT');
          console.log({ records });
          resolve(true);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  async getRecords() {
    console.log('getting records ....');
    return countWordsProcessorStorage.getRecords('');
  }
}
