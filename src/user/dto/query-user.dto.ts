import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger'
import { UserInfo } from '../entities/user.entity'
import { IsOptional, IsString } from 'class-validator'

export class QueryUserDto extends PartialType(OmitType(UserInfo, ['password'])) {
  @ApiProperty({ description: '用户 ID', required: false })
  @IsOptional()
  @IsString()
  id?: string
}
