import { Entity, Column, PrimaryColumn, BeforeInsert } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { v4 as uuidv4 } from 'uuid'

export class UserInfo {
  @ApiProperty({ description: '用户名', example: 'johndoe' })
  @Column()
  username: string

  @ApiProperty({ description: '用户邮箱', example: 'johndoe@example.com' })
  @Column()
  email: string

  @ApiProperty({
    description: '用户密码',
    example: 'password123',
    minLength: 6,
    maxLength: 20
  })
  @Column()
  password: string

  @ApiProperty({ description: '手机号码', example: '13800138000' })
  @Column()
  phone: string
}

@Entity()
export class User extends UserInfo {
  @ApiProperty({ description: '用户 ID' })
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string

  @ApiProperty({ description: '角色 ID' })
  @Column({ type: 'char', length: 36, nullable: true })
  roleId: string

  @ApiProperty({ description: '是否启用', example: true })
  @Column({ default: true })
  enabled: boolean

  @BeforeInsert()
  generateId() {
    this.id = uuidv4()
  }
}
