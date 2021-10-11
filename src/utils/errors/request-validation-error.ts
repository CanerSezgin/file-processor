import { ValidationError } from 'express-validator';
import CustomError from './custom-error';

export default class RequestValidationError extends CustomError {
  statusCode = 422;

  constructor(private errors: ValidationError[]) {
    super('Invalid Request Parameters');
  }

  serializeErrors = () =>
    this.errors.map((err) => ({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      message: err.msg,
      field: err.param,
    }));
}
