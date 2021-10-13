import os from 'os'
import app from './app'
import { config, checkEnvVars } from './config'

import { registerQueues, unregisterQueues } from './services/queues'

checkEnvVars([])
registerQueues()

const shutdown = () => {
  console.info('SIGTERM | SIGINT signal received.')

  unregisterQueues()

  process.exit(0)
}

const server = app.listen(config.port, () => {
  console.log(
    `✓ SERVER: Listening at http://${os.hostname()}:${config.port} in ${
      config.env
    } environment.`
  )
})

server.timeout = 25000 // sets timeout to 25 seconds

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
