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
    body('text').optional().isString().withMessage('TEXT should be STRING'),
    body('path').optional().isString().withMessage('PATH should be STRING'),
    body('uri').optional().isDataURI().withMessage('URI should be STRING & URI'),
    validationMiddleware,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const { text = '', path = '', uri = '' } = req.body

    try {
      if (!text && !path && !uri) {
        throw new ValidationError(
          'You need to provide one of them in request body. >>> text | path | uri'
        )
      }

      console.log('starting to processing...')
      const textInput = 'dsaf dsaf dsaf dsaf dsaf dsagfsd hgfdh dfsg'
      const fsInput = 'test.txt'
      const uriInput = 'https://raw.githubusercontent.com/CanerSezgin/reky/master/README.md'

      await new CountWordsProcessor(textInput, ProcessType.Text).process()
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
