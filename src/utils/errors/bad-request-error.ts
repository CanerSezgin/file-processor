import CustomError from './custom-error'

export default class BadRequestError extends CustomError {
  statusCode = 400;

  constructor(message: string, statusCode?: number) {
    super(message)
    if (statusCode) this.statusCode = statusCode

    Object.setPrototypeOf(this, BadRequestError.prototype)
  }

  serializeErrors = () => [{ message: this.message }];
}
