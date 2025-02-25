import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserModule } from './user/user.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module'
import { RoleModule } from './role/role.module'
import { WinstonModule } from 'nest-winston'
import { loggerConfig } from './common/logger.config'
import { EventsModule } from './events/events.module'
import { FileModule } from './file/file.module'
import { ToolsModule } from './tools/tools.module'
import { APP_FILTER } from '@nestjs/core'
import { DatabaseExceptionFilter } from './common/database-exception.filter'

@Module({
  imports: [
    WinstonModule.forRoot(loggerConfig),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_DATABASE || 'nest_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true // 开发环境使用，生产环境建议关闭
    }),
    UserModule,
    AuthModule,
    RoleModule,
    EventsModule,
    FileModule,
    ToolsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: DatabaseExceptionFilter
    }
  ]
})
export class AppModule {}
