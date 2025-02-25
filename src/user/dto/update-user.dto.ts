import { OmitType, PartialType } from '@nestjs/swagger'
import { UserInfo } from '../entities/user.entity'

export class UpdateUserDto extends PartialType(OmitType(UserInfo, ['password'])) {}
