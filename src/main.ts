import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { writeFileSync } from 'fs'
import { ResponseInterceptor } from './common/response.interceptor'
import { HttpExceptionFilter } from './common/http-exception.filter'
import { ValidationExceptionFilter } from './common/validation-exception.filter'
import { ValidateExcessFieldsPipe } from './common/validate-excess-fields.pipe'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const config = new DocumentBuilder()
    .setTitle('用户管理 API')
    .setDescription('用户管理系统的 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)

  writeFileSync('openapi.json', JSON.stringify(document, null, 2))

  SwaggerModule.setup('api', app, document)

  console.log('http://127.0.0.1:3000/api')

  const logger = app.get(WINSTON_MODULE_PROVIDER)
  app.useGlobalInterceptors(new ResponseInterceptor(logger))
  app.useGlobalFilters(new HttpExceptionFilter(logger))

  app.useGlobalFilters(new ValidationExceptionFilter())
  app.useGlobalPipes(new ValidateExcessFieldsPipe())

  await app.listen(3000)
}
bootstrap()
