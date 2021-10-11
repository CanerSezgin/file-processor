import fs from 'fs'
import { join } from 'path'
import request from 'request'
import { Stream } from 'stream'
import ReadableStringStream from '../utils/ReadableStringStream'

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
    return new ReadableStringStream(text)
  }
}

class FSProcessor implements IProcessor {
  createReadStream(path: string) {
    const rs = fs.createReadStream(join(__dirname, '../../data', path))
    return rs
  }
}

class URIProcessor implements IProcessor {
  createReadStream(uri: string) {
    return request(uri)
  }
}

export abstract class Processor {
  protected _processor: IProcessor;

  constructor(protected _input: string, private _processType: ProcessType) {
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

  abstract process(): Promise<any>;
}
