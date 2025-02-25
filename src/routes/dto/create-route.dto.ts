import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsObject } from 'class-validator'
import { Type } from 'class-transformer'

export class RouteMeta {
  @ApiProperty({ description: '路由标题', example: 'Dashboard' })
  @IsString()
  title: string
}

export class CreateRouteDto {
  @ApiProperty({ description: '路由路径', example: '/dashboard' })
  @IsString()
  path: string

  @ApiProperty({ description: '路由名称', example: 'dashboard' })
  @IsString()
  name: string

  @ApiProperty({ description: '路由组件', example: 'layout.base', required: false })
  @IsString()
  @IsOptional()
  component?: string

  @ApiProperty({ description: '路由描述', example: '系统仪表盘页面' })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ description: '路由图标', example: 'dashboard' })
  @IsString()
  @IsOptional()
  icon?: string

  @ApiProperty({ description: '父路由ID', example: null })
  @IsString()
  @IsOptional()
  parentId?: string

  @ApiProperty({ description: '排序序号', example: 1 })
  @IsNumber()
  @IsOptional()
  orderNum?: number

  @ApiProperty({ description: '是否隐藏', example: false })
  @IsBoolean()
  @IsOptional()
  hidden?: boolean

  @ApiProperty({ description: '访问该路由所需权限', example: ['dashboard:view'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[]

  @ApiProperty({ description: '路由元数据', type: RouteMeta })
  @IsObject()
  @ValidateNested()
  @Type(() => RouteMeta)
  meta: RouteMeta

  @ApiProperty({ description: '子路由', type: [CreateRouteDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRouteDto)
  @IsOptional()
  children?: CreateRouteDto[]
}
