import { Entity, Column, PrimaryColumn, BeforeInsert, ManyToMany, JoinTable } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { v4 as uuidv4 } from 'uuid'
import { Route } from '../../routes/entities/route.entity'

@Entity()
export class Role {
  @ApiProperty({ description: '角色 ID' })
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string

  @ApiProperty({ description: '角色名称', example: 'admin' })
  @Column({ unique: true })
  name: string

  @ApiProperty({ description: '角色描述', example: '系统管理员' })
  @Column({ nullable: true })
  description: string

  @ApiProperty({ description: '角色权限列表', example: ['user:create', 'user:read'] })
  @Column('simple-array')
  permissions: string[]

  @ApiProperty({ description: '可访问的路由列表' })
  @ManyToMany(() => Route)
  @JoinTable()
  routes: Route[]

  @ApiProperty({ description: '是否启用', example: true })
  @Column({ default: true })
  enabled: boolean

  @BeforeInsert()
  generateId() {
    this.id = uuidv4()
  }
}
