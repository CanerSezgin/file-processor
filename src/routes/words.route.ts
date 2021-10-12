import express, { Request, Response, NextFunction } from 'express'
import { body } from 'express-validator'
import validationMiddleware from '../middlewares/validation.middleware'
import ValidationError from '../utils/errors/validation-error'

import { ProcessType } from '../services/Processor'
import { CountWordsProcessor } from '../services/CountWordsProcessor'

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

      await new CountWordsProcessor(resourceValue, resourceType).process()
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
