import { Controller, Get, Post, Body, Query, Put, Param } from '@nestjs/common'
import { UserService } from './user.service'
import { User } from './entities/user.entity'
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { QueryUserDto } from './dto/query-user.dto'

@ApiTags('用户')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '获取所有用户' })
  @ApiResponse({ status: 200, description: '成功获取所有用户', type: [User] })
  @Get('findAll')
  async findAll(): Promise<User[]> {
    return this.userService.findAll()
  }

  @ApiOperation({ summary: '创建新用户' })
  @ApiResponse({ status: 201, description: '用户创建成功', type: User })
  @ApiBody({ type: CreateUserDto, description: '创建用户所需的数据' })
  @Post('create')
  async create(@Body() user: CreateUserDto): Promise<User> {
    return this.userService.create(user)
  }

  @ApiOperation({ summary: '条件搜索用户' })
  @ApiResponse({ status: 201, description: '搜索成功', type: [User] })
  @ApiQuery({ type: QueryUserDto, description: '条件搜索用户' })
  @Get('find')
  async findUsers(@Query() conditions: Partial<User>): Promise<User[]> {
    return this.userService.findUsersByConditions(conditions)
  }

  @ApiOperation({ summary: '修改用户信息' })
  @ApiResponse({ status: 201, description: '修改成功', type: User })
  @ApiBody({ type: UpdateUserDto, description: '修改用户信息所需的数据' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: UpdateUserDto): Promise<User> {
    return this.userService.updateUser(id, updateData)
  }
}
