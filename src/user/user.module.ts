import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { RoleModule } from '../role/role.module'
import { ToolsModule } from '../tools/tools.module'

@Module({
  imports: [TypeOrmModule.forFeature([User]), RoleModule, ToolsModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
