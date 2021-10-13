import { Queue } from 'bull'
import { createBullBoard } from '@bull-board/api'
import { BullAdapter } from '@bull-board/api/bullAdapter'
import { ExpressAdapter } from '@bull-board/express'

import { createQueue } from '../../lib/bull'

import countWordQueueProcessor from '../queues/processors/countWord'

class QueueInstance {
  public queue: Queue;

  constructor(
    public name: string,
    public processor: any,
    public concurrency: number = 5
  ) {
    this.queue = createQueue(this.name)
  }
  register() {
    this.queue.process(this.concurrency, this.processor)
  }
  unregister() {
    this.queue.close()
  }
}

export const Queues = {
  countWords: new QueueInstance(
    'count-word-processor',
    countWordQueueProcessor,
    2
  ),
}

export const queueServerAdapter = new ExpressAdapter()

createBullBoard({
  queues: Object.values(Queues).map((queueInstance) => new BullAdapter(queueInstance.queue)),
  serverAdapter: queueServerAdapter,
})

export const registerQueues = () => {
  Object.values(Queues).forEach((queueInstance) => queueInstance.register())
}

export const unregisterQueues = () => {
  Object.values(Queues).forEach((queueInstance) => queueInstance.unregister())
}
