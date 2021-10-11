import os from 'os'
import app from './app'
import { config, checkEnvVars } from './config'

checkEnvVars([])

const server = app.listen(config.port, () => {
  console.log(
    `✓ SERVER: Listening at http://${os.hostname()}:${config.port} in ${
      config.env
    } environment.`
  )
})

server.timeout = 25000 // sets timeout to 25 seconds
