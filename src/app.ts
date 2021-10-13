import express, { Request, Response } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { json } from 'body-parser'
import apiRoutesV1 from './routes'
import errorHandler from './utils/errorHandler'
import NotFoundError from './utils/errors/not-found-error'

import { queueServerAdapter } from './services/queues'


const app = express()

app.use(json())

app.use(morgan('dev'))

// enable cors
app.use(cors())

app.get('/status', (_: Request, res: Response) => {
  res.status(200).json({ status: 'ok', envs: process.env })
})

app.get('/favicon.ico', (_: Request, res: Response) => {
  res.sendStatus(204)
})

// Routes
app.use('/api/v1', apiRoutesV1)

// Bull Admin Dashboard [No Auth Applied]
const queueAdminRoute = '/admin/queues'
queueServerAdapter.setBasePath(queueAdminRoute)
app.use(queueAdminRoute, queueServerAdapter.getRouter())

app.all('*', () => {
  throw new NotFoundError()
})

app.use(errorHandler)

export default app
