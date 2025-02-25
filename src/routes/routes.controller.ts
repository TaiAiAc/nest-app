import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common'
import { RoutesService } from './routes.service'
import { CreateRouteDto } from './dto/create-route.dto'
import { UpdateRouteDto } from './dto/update-route.dto'
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger'

@ApiTags('路由管理')
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  @ApiOperation({ summary: '创建路由' })
  @ApiOkResponse({
    description: '路由创建成功',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '路由ID' },
        path: { type: 'string', description: '路由路径' },
        name: { type: 'string', description: '路由名称' }
      }
    }
  })
  create(@Body() createRouteDto: CreateRouteDto) {
    return this.routesService.create(createRouteDto)
  }

  @Get()
  @ApiOperation({ summary: '获取所有路由' })
  @ApiOkResponse({
    description: '成功获取所有路由列表',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '路由ID' },
          path: { type: 'string', description: '路由路径' },
          name: { type: 'string', description: '路由名称' }
        }
      }
    }
  })
  findAll() {
    return this.routesService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: '获取指定路由' })
  @ApiOkResponse({
    description: '成功获取路由信息',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '路由ID' },
        path: { type: 'string', description: '路由路径' },
        name: { type: 'string', description: '路由名称' }
      }
    }
  })
  findOne(@Param('id') id: string) {
    return this.routesService.findOne(id)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新路由信息' })
  @ApiOkResponse({
    description: '路由信息更新成功',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '路由ID' },
        path: { type: 'string', description: '路由路径' },
        name: { type: 'string', description: '路由名称' }
      }
    }
  })
  update(@Param('id') id: string, @Body() updateRouteDto: UpdateRouteDto) {
    return this.routesService.update(id, updateRouteDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除路由' })
  @ApiOkResponse({
    description: '路由删除成功',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: '操作结果信息' }
      }
    }
  })
  remove(@Param('id') id: string) {
    return this.routesService.remove(id)
  }
}
