import { IsNotEmpty, IsEmail, MinLength, Matches, MaxLength } from 'class-validator'
import { UserInfo } from '../entities/user.entity'

export class CreateUserDto extends UserInfo {
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string

  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string

  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度不能小于6位' })
  @MaxLength(20, { message: '密码长度不能大于20位' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{6,20}$/, {
    message: '密码必须包含至少一个字母、一个数字和一个特殊字符'
  })
  password: string

  @IsNotEmpty({ message: '手机号码不能为空' })
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入有效的手机号码' })
  phone: string

  roleId?: string
}
