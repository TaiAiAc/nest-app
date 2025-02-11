import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserModule } from './user/user.module'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 8889,
      username: 'root',
      password: 'root',
      database: 'nest_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true // 开发环境使用，生产环境建议关闭
    }),
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
