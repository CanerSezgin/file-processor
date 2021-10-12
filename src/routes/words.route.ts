import express, { Request, Response, NextFunction } from 'express'
import { body } from 'express-validator'
import validationMiddleware from '../middlewares/validation.middleware'
import ValidationError from '../utils/errors/validation-error'

import { ProcessType } from '../services/Processor'
import { CountWordsProcessor } from '../services/CountWordsProcessor'

import RedisKeyValueStorage from '../services/storages/KeyValueStorage/RedisKeyValueStorage'
import MemoryKeyValueStorage from '../services/storages/KeyValueStorage/MemoryKeyValueStorage'
import ProcessorStorage, {
  UpsertionType,
} from '../services/storages/ProcessorStorage'

const router = express.Router()

// todo: move somewhere else
const tempProcessorStorage = new ProcessorStorage(new RedisKeyValueStorage())
//const db = new Database(new RedisDB())

router.post(
  '/count',
  [
    body('resourceType')
      .notEmpty()
      .withMessage('Resource Type is Missing')
      .isIn(['text', 'fs', 'uri'])
      .withMessage('Resource Type should be one of them. [ text | fs | uri ]'),
    body('resourceValue')
      .notEmpty()
      .withMessage('Resource Value is Missing')
      .isString()
      .withMessage('Resource Value has to be STRING'),
    validationMiddleware,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const { resourceValue, resourceType } = req.body

    try {
      console.log('starting to processing...')

      const countWordProcessor = new CountWordsProcessor(
        resourceValue,
        resourceType,
        tempProcessorStorage
      )
      const { processKey } = await countWordProcessor.process()
      const records = await countWordProcessor.getTempRecords(processKey)

      console.log({ processKey, records })

      /* Queues.trialQueue.add(
        { text, path, uri },
        {
          ...defaultQueueOpts,
        }
      ) */

      console.log('added to queue')

      res.status(200).json({ status: 'ok' })
    } catch (error) {
      next(error)
    }
  }
)

export default router
