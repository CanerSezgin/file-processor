import express, { Request, Response, NextFunction } from 'express'
import { body } from 'express-validator'
import validationMiddleware from '../middlewares/validation.middleware'
import wait from '../utils/wait'
import ValidationError from '../utils/errors/validation-error'

import { ProcessType } from '../services/processors/Processor'
import { CountWordsProcessor } from '../services/processors/CountWordsProcessor'

import MemoryKeyValueStorage from '../services/storages/KeyValueStorage/MemoryKeyValueStorage'
import ProcessorStorage from '../services/storages/ProcessorStorage'

import { countWordsService, tempProcessorStorage } from '../services'

const router = express.Router()


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
      await wait(100) // [This is a hacky solution] adding extra 100 ms just for redis client latency between write and read request.
      const records = await countWordProcessor.getTempRecords(processKey)
      console.log({ processKey, records })

      // Add All Records of ProcessKey Into Main DB
      await Promise.all(
        records.map((record) =>
          countWordsService.upsertCounts(
            record.key.split(`${processKey}_`)[1],
            parseInt(record.value)
          )
        )
      )

      // Clean Temp DB of ProcessKey
      await countWordProcessor.deleteTempRecords(processKey)

      const records2 = await countWordProcessor.getTempRecords(processKey)
      console.log({ processKey, records2 })

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

router.get(
  '/stats/:word',
  async (req: Request, res: Response, next: NextFunction) => {
    const { word } = req.params

    try {
      const counts = await countWordsService.getCounts(word)
      res.status(200).json({ word, counts })
    } catch (error) {
      next(error)
    }
  }
)

export default router
