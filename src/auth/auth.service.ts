import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UserService } from '../user/user.service'
import { RoleService } from '../role/role.service'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../user/entities/user.entity'
import { RefreshToken } from './entities/refresh-token.entity'
import { v4 as uuidv4 } from 'uuid'

/**
 * 认证服务类
 * 处理用户认证相关的业务逻辑，包括用户验证、登录、注册和密码修改等操作
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>
  ) {}

  /**
   * 验证用户凭证
   * @param credential - 用户的登录凭证（邮箱或手机号）
   * @param password - 用户密码
   * @returns Promise<any> 如果验证成功返回用户信息（不含密码），验证失败返回 null
   */
  async validateUser(credential: string, password: string) {
    let user

    // 判断是邮箱还是手机号
    if (credential.includes('@')) {
      // 使用邮箱查找用户
      user = await this.userService.findOne({ where: { email: credential } })
    } else if (/^\d+$/.test(credential)) {
      // 使用手机号查找用户
      user = await this.userService.findOne({ where: { phone: credential } })
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user
      return result
    }
    return null
  }

  /**
   * 用户登录
   * @param user - 用户信息对象
   * @returns Promise<{access_token: string, user: any, role: {name: string, permissions: string[]}}>
   *          返回包含访问令牌、用户信息和角色信息的对象
   */
  async login(user: any) {
    // 获取用户的角色信息
    const role = await this.roleService.findOne(user.roleId)

    // 生成访问令牌
    const access_token = this.jwtService.sign({ username: user.username, sub: user.id }, { expiresIn: '1h' })

    // 生成刷新令牌
    const refresh_token = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30天后过期

    // 保存刷新令牌
    await this.refreshTokenRepository.save({
      token: refresh_token,
      userId: user.id,
      expiresAt
    })

    return {
      access_token,
      refresh_token,
      user,
      role: {
        name: role.name,
        permissions: role.permissions
      }
    }
  }

  /**
   * 用户注册
   * @param userData - 用户注册数据
   * @returns Promise<User> 返回创建的用户实例
   */
  async register(userData: any) {
    return this.userService.create(userData)
  }

  /**
   * 修改用户密码
   * @param username - 用户名
   * @param oldPassword - 旧密码
   * @param newPassword - 新密码
   * @returns Promise<{message: string}> 返回密码修改成功的消息
   * @throws UnauthorizedException 当前密码错误时抛出异常
   */
  async refreshToken(refreshToken: string) {
    const token = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken, isRevoked: false },
      relations: ['user']
    })

    if (!token || token.expiresAt < new Date()) {
      throw new UnauthorizedException('刷新令牌无效或已过期')
    }

    // 生成新的访问令牌
    const access_token = this.jwtService.sign(
      { username: token.user.username, sub: token.user.id },
      { expiresIn: '1h' }
    )

    return { access_token }
  }

  async revokeRefreshToken(refreshToken: string) {
    await this.refreshTokenRepository.update({ token: refreshToken }, { isRevoked: true })
  }

  async changePassword(username: string, oldPassword: string, newPassword: string) {
    const user = await this.validateUser(username, oldPassword)
    if (!user) {
      throw new UnauthorizedException('当前密码错误')
    }

    // 对新密码进行加密
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    // 直接使用 Repository 更新密码
    await this.userRepository.update(user.id, { password: hashedPassword })
    return { message: '密码修改成功' }
  }
}
