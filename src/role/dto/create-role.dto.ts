import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsArray, IsOptional } from 'class-validator'
import { Route } from '../../routes/entities/route.entity'

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称', example: 'admin' })
  @IsString()
  name: string

  @ApiProperty({ description: '角色描述', example: '系统管理员' })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ description: '角色权限列表', example: ['user:create', 'user:read'] })
  @IsArray()
  @IsString({ each: true })
  permissions: string[]

  @ApiProperty({ description: '可访问的路由列表' })
  @IsArray()
  @IsOptional()
  routes?: Route[]
}
