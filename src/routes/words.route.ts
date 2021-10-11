import express, { Request, Response, NextFunction } from 'express'
import { body } from 'express-validator'
import validationMiddleware from '../middlewares/validation.middleware'

const router = express.Router()

const validations = {
  repo: body('repo').trim().notEmpty().withMessage('You must supply a repo handle'),
  email: body('email').isEmail().withMessage('Email must be valid'),
}

router.post(
  '/',
  [validations.email, validations.repo, validationMiddleware],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
     
      res.status(200).json({ status: 'ok' })
    } catch (error) {
      next(error)
    }
  },
)

export default router
