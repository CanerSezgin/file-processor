import { NextFunction, Request, Response } from 'express'
import CustomError from './errors/custom-error'

export default (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof CustomError) {
    res.status(err.statusCode).json({ errors: err.serializeErrors() })
    return
  }

  res.status(400).json({
    errors: [{ message: 'Something went wrong' }],
  })
}
