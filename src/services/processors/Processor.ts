import fs from 'fs'
import { join } from 'path'
import request from 'request'
import { Stream, Readable } from 'stream'
import NotFoundError from '../../utils/errors/not-found-error'
import ProcessorStorage from '../storages/ProcessorStorage'

interface IProcessor {
  createReadStream(input: string): Stream;
}

export enum ProcessType {
  Text = 'text',
  URI = 'uri',
  FS = 'fs',
}

class TextProcessor implements IProcessor {
  createReadStream(text: string) {
    return Readable.from([text])
  }
}

class FSProcessor implements IProcessor {
  createReadStream(path: string) {
    const filePath = join(__dirname, '../../data', path)
    const isExist = fs.existsSync(filePath)
    if (!isExist)
      throw new NotFoundError(
        `Resource Not Found in File System. Path: ${filePath}`
      )
    return fs.createReadStream(filePath)
  }
}

class URIProcessor implements IProcessor {
  createReadStream(uri: string) {
    return request(uri)
  }
}

export abstract class Processor {
  protected _processor: IProcessor;

  constructor(
    protected input: string,
    private _processType: ProcessType,
    protected tempStorage: ProcessorStorage,
  ) {
    this._processor = this.getProcessor()
  }

  private getProcessor() {
    switch (this._processType) {
      case ProcessType.Text:
        return new TextProcessor()
      case ProcessType.FS:
        return new FSProcessor()
      case ProcessType.URI:
        return new URIProcessor()
    }
  }

  async getTempRecords(processKey: string) {
    return this.tempStorage.getRecords(`${processKey}_`)
  }

  async deleteTempRecords(processKey: string) {
    return this.tempStorage.deleteByQuery(`${processKey}_`)
  }

  abstract process(): Promise<any>;
}
