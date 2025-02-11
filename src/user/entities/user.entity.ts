import { Entity, Column, PrimaryColumn, BeforeInsert, PrimaryGeneratedColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { v4 as uuidv4 } from 'uuid'

export class UserInfo {
  @ApiProperty({ description: '用户姓名', example: '张三' })
  @Column()
  name: string

  @ApiProperty({ description: '用户邮箱', example: 'johndoe@example.com' })
  @Column()
  email: string
}

@Entity()
export class User extends UserInfo {
  @ApiProperty({ description: '用户 ID', example: 1 })
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string

  @BeforeInsert()
  generateId() {
    this.id = uuidv4()
  }
}
