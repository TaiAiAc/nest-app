import { PartialType } from '@nestjs/swagger'
import { UserInfo } from '../entities/user.entity'

export class UpdateUserDto extends PartialType(UserInfo) {}
