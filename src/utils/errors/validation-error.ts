import CustomError from './custom-error'

export default class ValidationError extends CustomError {
  statusCode = 422;

  constructor(message: string) {
    super(message)

    Object.setPrototypeOf(this, ValidationError.prototype)
  }

  serializeErrors = () => [{ message: this.message }];
}
