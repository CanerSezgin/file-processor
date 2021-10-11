import * as dotenv from 'dotenv'

dotenv.config()

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  meta: {
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production'
  }
}

export const checkEnvVars = (envVarsMustList: string[] = []) => {
  envVarsMustList.forEach((envVar) => {
    if (!process.env[envVar]) {
      throw new Error(`Env Vars Missing | ${envVar}`)
    }
  })
}
