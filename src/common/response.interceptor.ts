import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { ApiResponse } from './api-response.dto'
import { Logger } from 'winston'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}
  // 拦截器的核心方法，用于处理控制器的响应
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest()
    const { method, url, body, query, params } = request

    // 记录请求信息
    this.logger.log({
      level: 'info',
      message: '收到请求',
      meta: {
        method,
        url,
        body: JSON.stringify(body),
        query: JSON.stringify(query),
        params: JSON.stringify(params)
      }
    })

    const now = Date.now()
    return next.handle().pipe(
      tap(data => {
        // 记录响应信息
        this.logger.log({
          level: 'info',
          message: '请求处理完成',
          meta: {
            method,
            url,
            processingTime: `${Date.now() - now}ms`,
            responseData: JSON.stringify(data)
          }
        })
      }),
      map(data => {
        // 检查返回的数据是否包含自定义的状态码和消息
        if (data && typeof data === 'object' && 'code' in data && 'msg' in data && 'data' in data) {
          // 如果包含，则使用自定义的值
          const { code, msg, data: responseData } = data
          return new ApiResponse(code, msg, responseData)
        }
        // 如果不包含，则使用默认值
        return new ApiResponse(200, '操作成功', data)
      })
    )
  }
}
