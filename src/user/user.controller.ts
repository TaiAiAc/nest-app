import { Controller, Get, Post, Body, Query, Put, Param, Delete } from '@nestjs/common'
import { UserService } from './user.service'
import { User } from './entities/user.entity'
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiOkResponse,
  getSchemaPath,
  ApiResponse
} from '@nestjs/swagger'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { QueryUserDto } from './dto/query-user.dto'

@ApiTags('用户')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 获取所有用户
   * @returns 返回所有用户列表
   */
  @ApiOperation({
    summary: '获取所有用户',
    description: '该接口用于获取系统中所有用户的信息。'
  })
  @ApiOkResponse({
    description: '成功获取所有用户',
    type: () => User
  })
  @Get('findAll')
  async findAll() {
    return this.userService.findAll()
  }

  /**
   * 创建新用户
   * @param user 创建用户所需的数据
   * @returns 创建成功后的用户信息
   */
  @ApiOperation({
    summary: '创建新用户',
    description: '该接口用于在系统中创建一个新的用户。'
  })
  @ApiOkResponse({
    description: '用户创建成功，返回创建的用户信息。',
    type: () => User,
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: {
              $ref: getSchemaPath(User)
            }
          }
        }
      ]
    }
  })
  @ApiBody({ type: CreateUserDto, description: '创建用户所需的数据' })
  @Post('create')
  async create(@Body() user: CreateUserDto) {
    return this.userService.create(user)
  }

  /**
   * 条件搜索用户
   * @param conditions 搜索用户的条件
   * @returns 符合条件的用户列表
   */
  @ApiOperation({
    summary: '条件搜索用户',
    description: '该接口用于根据指定的条件搜索系统中的用户。'
  })
  @ApiOkResponse({
    description: '搜索成功',
    type: () => [QueryUserDto]
  })
  @ApiQuery({
    type: QueryUserDto,
    description: '条件搜索用户的参数',
    examples: {
      按姓名搜索示例: {
        value: {
          name: 'John'
        }
      },
      按邮箱搜索示例: {
        value: {
          email: 'johndoe@example.com'
        }
      }
    }
  })
  @Get('find')
  async findUsers(@Query() conditions: QueryUserDto): Promise<User[]> {
    return this.userService.findUsersByConditions(conditions)
  }

  /**
   * 修改用户信息
   * @param id 要修改的用户 ID
   * @param updateData 修改用户信息所需的数据
   * @returns 修改后的用户信息
   */
  @ApiOperation({
    summary: '修改用户信息',
    description: '该接口用于修改系统中指定用户的信息。'
  })
  @ApiOkResponse({
    description: '修改成功',
    type: () => User
  })
  @ApiBody({
    type: UpdateUserDto,
    description: '修改用户信息所需的数据',
    examples: {
      修改用户姓名示例: {
        value: {
          name: 'Jane Doe'
        }
      },
      修改用户邮箱示例: {
        value: {
          email: 'janedoe@example.com'
        }
      }
    }
  })
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: UpdateUserDto) {
    return this.userService.updateUser(id, updateData)
  }

  /**
   * 删除用户
   * @param id 要删除的用户 ID
   * @returns 删除操作的结果信息
   */
  @ApiOperation({
    summary: '删除用户',
    description: '该接口用于从系统中删除指定 ID 的用户。'
  })
  @ApiOkResponse({ description: '删除成功' })
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<string> {
    await this.userService.deleteUser(id)
    return '删除成功'
  }
}
