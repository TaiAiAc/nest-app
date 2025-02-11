import { PartialType } from '@nestjs/swagger'
import { User } from '../entities/user.entity'

export class QueryUserDto extends PartialType(User) {}
