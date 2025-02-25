import { Controller, Post, Body, UnauthorizedException, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger'
import { JwtAuthGuard } from './jwt-auth.guard'

@ApiTags('认证')
@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  @Post('refresh')
  @ApiOperation({
    summary: '刷新访问令牌',
    description: '使用刷新令牌获取新的访问令牌'
  })
  @ApiOkResponse({
    description: '刷新成功',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string', description: '新的访问令牌' }
      }
    }
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refresh_token: { type: 'string', description: '刷新令牌' }
      },
      required: ['refresh_token']
    }
  })
  async refresh(@Body('refresh_token') refreshToken: string) {
    return this.authService.refreshToken(refreshToken)
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '用户登出',
    description: '撤销用户的刷新令牌'
  })
  @ApiOkResponse({
    description: '登出成功',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: '登出成功消息' }
      }
    }
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refresh_token: { type: 'string', description: '刷新令牌' }
      },
      required: ['refresh_token']
    }
  })
  async logout(@Body('refresh_token') refreshToken: string) {
    await this.authService.revokeRefreshToken(refreshToken)
    return { message: '登出成功' }
  }
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: '用户登录',
    description: '用户可以使用用户名、邮箱或手机号码登录系统'
  })
  @ApiOkResponse({
    description: '登录成功',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string', description: '访问令牌' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '用户ID' },
            username: { type: 'string', description: '用户名' },
            email: { type: 'string', description: '邮箱' },
            phone: { type: 'string', description: '手机号' }
          }
        },
        role: {
          type: 'object',
          properties: {
            name: { type: 'string', description: '角色名称' },
            permissions: { type: 'array', items: { type: 'string' }, description: '权限列表' }
          }
        }
      }
    }
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        credential: {
          type: 'string',
          example: 'johndoe@example.com',
          description: '登录凭证（邮箱/手机号）'
        },
        password: { type: 'string', example: 'password123' }
      },
      required: ['credential', 'password']
    }
  })
  async login(@Body() loginData: { credential: string; password: string }) {
    const user = await this.authService.validateUser(loginData.credential, loginData.password)
    if (!user) {
      throw new UnauthorizedException('登录凭证或密码错误')
    }
    return this.authService.login(user)
  }

  @Post('register')
  @ApiOperation({
    summary: '用户注册',
    description: '创建新用户账号'
  })
  @ApiOkResponse({
    description: '注册成功',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '用户ID' },
        username: { type: 'string', description: '用户名' },
        email: { type: 'string', description: '邮箱' },
        phone: { type: 'string', description: '手机号' }
      }
    }
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'johndoe' },
        password: { type: 'string', example: 'password123' },
        email: { type: 'string', example: 'john@example.com' },
        phone: { type: 'string', example: '13800138000' }
      },
      required: ['username', 'password', 'email', 'phone']
    }
  })
  async register(@Body() userData: any) {
    return this.authService.register(userData)
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '修改密码',
    description: '用户修改自己的密码'
  })
  @ApiOkResponse({
    description: '密码修改成功',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: '操作结果信息' }
      }
    }
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'johndoe' },
        oldPassword: { type: 'string', example: 'oldpass123' },
        newPassword: { type: 'string', example: 'newpass123' }
      },
      required: ['username', 'oldPassword', 'newPassword']
    }
  })
  async changePassword(@Body() passwordData: { username: string; oldPassword: string; newPassword: string }) {
    return this.authService.changePassword(
      passwordData.username,
      passwordData.oldPassword,
      passwordData.newPassword
    )
  }
}
