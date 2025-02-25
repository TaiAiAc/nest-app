import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Inject } from '@nestjs/common'
import { Request, Response } from 'express'
import { ApiResponse } from './response.dto'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = exception.getStatus()

    // 记录错误日志
    this.logger.error('HTTP Exception', {
      status,
      message: exception.message,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      query: request.query,
      body: request.body
    })

    response.status(status).json(new ApiResponse(status, exception.message, null))
  }
}
