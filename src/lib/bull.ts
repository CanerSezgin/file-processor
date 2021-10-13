import Queue from 'bull'
import { queueRedisDBConfig } from '../dbs'

export const createQueue = (key: string) => {
  const queue = new Queue(key, {
    redis: queueRedisDBConfig
  })

  queue.on('completed', (job) => {
    console.log('>>> Queue Completed', job.id)
  })

  queue.on('error', (error) => {
    console.log('>>> Queue Error Log', error)
  })

  queue.on('failed', (job, error) => {
    console.log('>>> Queue Failed Log', job.id)
  })

  return queue
}
