import redis from 'redis'
import { promisify } from 'util'
import { KeyValue } from '../types'

export const createRedisClient = (config: any = {}) => {
  const client = redis.createClient(config)

  client.on('error', function (error: any) {
    console.error(error)
  })

  const getAsync = promisify(client.get).bind(client)
  const setAsync = promisify(client.set).bind(client)
  const keysAsync = promisify(client.keys).bind(client)
  const delAsync = promisify<string | string[]>(client.del).bind(client)
  const flushDbAsync = promisify(client.flushdb).bind(client)

  const getKeyValues = async (
    query: string = ''
  ): Promise<KeyValue<any>[]> => {
    const keys = (await keysAsync(`${query}*`)) as string[]
    return Promise.all(
      keys.map(async (key) => {
        const value = await getAsync(key)
        return { key, value }
      })
    )
  }

  const delAsyncWithQuery = async (query: string): Promise<void> => {
    const keys = await keysAsync(`${query}*`)
    await delAsync(keys)
  }

  return {
    client,
    getAsync,
    setAsync,
    delAsync,
    flushDbAsync,
    getKeyValues,
    delAsyncWithQuery,
  }
}
