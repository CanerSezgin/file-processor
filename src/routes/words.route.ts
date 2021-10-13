import express, { Request, Response, NextFunction } from 'express'
import { body } from 'express-validator'
import validationMiddleware from '../middlewares/validation.middleware'

import { countWordsService } from '../services'
import { Queues } from '../services/queues'

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
      Queues.countWords.queue.add({ resourceValue, resourceType })

      res.status(202).json({ status: 'added_to_queue' })
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
