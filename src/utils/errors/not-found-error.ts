import CustomError from './custom-error'

export default class NotFoundError extends CustomError {
  statusCode = 422;

  constructor(message: string = 'Not Found') {
    super(message)

    Object.setPrototypeOf(this, NotFoundError.prototype)
  }

  serializeErrors = () => [{ message: this.message }];
}
