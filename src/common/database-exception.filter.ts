import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common'
import { QueryFailedError, TypeORMError, EntityNotFoundError } from 'typeorm'
import { Response } from 'express'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Inject } from '@nestjs/common'
import { Logger } from 'winston'

@Catch(QueryFailedError, TypeORMError, EntityNotFoundError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

  catch(exception: TypeORMError | any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest()

    // 记录详细的错误信息
    this.logger.error('数据库操作错误', {
      error: {
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
        driverError: exception['driverError'], // 添加驱动层错误信息
        query: exception['query'], // 添加查询语句（如果存在）
        parameters: exception['parameters'] // 添加查询参数（如果存在）
      },
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      body: request.body,
      query: request.query,
      params: request.params,
      headers: request.headers,
      ip: request.ip
    })

    // 格式化错误响应
    const errorResponse = {
      statusCode: 500,
      message: '数据库操作失败',
      error: {
        type: exception.name,
        detail: exception.message
      },
      timestamp: new Date().toISOString(),
      path: request.url
    }

    // 在开发环境下可以返回更多调试信息
    if (process.env.NODE_ENV === 'development') {
      errorResponse.error['stack'] = exception.stack
      errorResponse.error['driverError'] = exception['driverError']
      errorResponse.error['query'] = exception['query']
    }

    response.status(500).json(errorResponse)
  }
}
