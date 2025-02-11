import { ApiProperty, OmitType } from '@nestjs/swagger'
import { IsNotEmpty, IsEmail } from 'class-validator'
import { UserInfo } from '../entities/user.entity'

export class CreateUserDto extends UserInfo {
  @IsNotEmpty({ message: '用户名不能为空' })
  name: string

  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string
}
