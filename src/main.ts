import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { writeFileSync } from 'fs'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const config = new DocumentBuilder()
    .setTitle('用户管理 API')
    .setDescription('用户管理系统的 API 文档')
    .setVersion('1.0')
    .addTag('用户')
    .build()

  const document = SwaggerModule.createDocument(app, config)

  writeFileSync('openapi.json', JSON.stringify(document, null, 2))

  SwaggerModule.setup('api', app, document)

  console.log('http://127.0.0.1:3000/api')
  await app.listen(3000)
}
bootstrap()
