import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common'
import { RoleService } from './role.service'
import { CreateRoleDto } from './dto/create-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger'

@ApiTags('角色管理')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({ summary: '创建角色' })
  @ApiOkResponse({
    description: '角色创建成功',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '角色ID' },
        name: { type: 'string', description: '角色名称' },
        permissions: { type: 'array', items: { type: 'string' }, description: '权限列表' }
      }
    }
  })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto)
  }

  @Get()
  @ApiOperation({ summary: '获取所有角色' })
  @ApiOkResponse({
    description: '成功获取所有角色列表',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '角色ID' },
          name: { type: 'string', description: '角色名称' },
          permissions: { type: 'array', items: { type: 'string' }, description: '权限列表' }
        }
      }
    }
  })
  findAll() {
    return this.roleService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: '获取指定角色' })
  @ApiOkResponse({
    description: '成功获取角色信息',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '角色ID' },
        name: { type: 'string', description: '角色名称' },
        permissions: { type: 'array', items: { type: 'string' }, description: '权限列表' }
      }
    }
  })
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新角色信息' })
  @ApiOkResponse({
    description: '角色信息更新成功',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '角色ID' },
        name: { type: 'string', description: '角色名称' },
        permissions: { type: 'array', items: { type: 'string' }, description: '权限列表' }
      }
    }
  })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除角色' })
  @ApiOkResponse({
    description: '角色删除成功',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: '操作结果信息' }
      }
    }
  })
  remove(@Param('id') id: string) {
    return this.roleService.remove(id)
  }

  @Post(':id/users')
  @ApiOperation({ summary: '为角色分配用户' })
  @ApiOkResponse({
    description: '用户分配成功',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: '操作结果信息' }
      }
    }
  })
  assignUsers(@Param('id') id: string, @Body() data: { userIds: string[] }) {
    return this.roleService.assignUsersToRole(id, data.userIds)
  }

  @Delete(':id/users')
  @ApiOperation({ summary: '从角色中移除用户' })
  @ApiOkResponse({
    description: '用户移除成功',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: '操作结果信息' }
      }
    }
  })
  removeUsers(@Param('id') id: string, @Body() data: { userIds: string[] }) {
    return this.roleService.removeUsersFromRole(id, data.userIds)
  }
}
