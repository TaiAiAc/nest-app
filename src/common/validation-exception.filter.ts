import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { Request, Response } from 'express'
import { ValidationError } from 'class-validator'

@Catch()
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      if (status === HttpStatus.BAD_REQUEST && exception.getResponse()['message'] instanceof Array) {
        const validationErrors = exception.getResponse()['message'] as ValidationError[]
        const errorMessages = validationErrors.map(error => {
          return Object.values(error.constraints).join(', ')
        })
        return response.status(status).json({
          statusCode: status,
          message: errorMessages.join('; '),
          error: 'Bad Request'
        })
      }
      return response.status(status).json(exception.getResponse())
    }

    const status = HttpStatus.INTERNAL_SERVER_ERROR
    return response.status(status).json({
      statusCode: status,
      message: 'Internal server error',
      error: 'Internal Server Error'
    })
  }
}
