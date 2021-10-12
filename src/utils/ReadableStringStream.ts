import { Readable } from 'stream';

export default (str: string) => Readable.from([str]);

/* export default class ReadableString extends Readable {
  private sent = false;

  constructor(private str: string) {
    super()
  }

  async _read() {
    if (!this.sent) {
      this.push(Buffer.from(this.str))
      this.sent = true
    } else {
      this.push(null)
    }
  }
} */
