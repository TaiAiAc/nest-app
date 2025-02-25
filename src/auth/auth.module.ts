import { Module } from '@nestjs/common'
import { UserModule } from '../user/user.module'
import { RoleModule } from '../role/role.module'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from './jwt.strategy'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../user/entities/user.entity'
import { RefreshToken } from './entities/refresh-token.entity'
import { ToolsModule } from '../tools/tools.module'

@Module({
  imports: [
    UserModule,
    RoleModule,
    ToolsModule,
    TypeOrmModule.forFeature([User, RefreshToken]),
    JwtModule.register({
      secret: 'your-secret-key', // 在生产环境中应该使用环境变量
      signOptions: { expiresIn: '60m' }
    })
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}
