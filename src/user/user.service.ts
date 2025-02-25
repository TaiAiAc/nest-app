import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, Like, Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { RoleService } from '../role/role.service'
import { QueryUserDto } from './dto/query-user.dto'
import { ToolsService } from '../tools/tools.service'

/**
 * 用户服务类
 * 处理所有与用户相关的业务逻辑
 */
@Injectable()
export class UserService {
  /**
   * 构造函数
   * @param userRepository 用户仓库实例，用于数据库操作
   */
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private roleService: RoleService,
    private toolsService: ToolsService
  ) {}

  /**
   * 获取所有用户
   * @returns Promise<User[]> 返回用户列表
   */
  async findAll() {
    return this.userRepository.find()
  }

  /**
   * 根据条件查找单个用户
   * @param options 查询选项
   * @returns Promise<User | null> 返回找到的用户或 null
   */
  async findOne(options: any) {
    return this.userRepository.findOne(options)
  }

  /**
   * 创建新用户
   * @param user - 用户创建数据传输对象
   * @returns Promise<User> 返回创建的用户实例
   * @throws ConflictException 当邮箱或手机号已被注册时抛出异常
   */
  async create(user: CreateUserDto) {
    // 检查邮箱是否已存在
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email: user.email } as FindOptionsWhere<User>
    })
    if (existingUserByEmail) {
      throw new ConflictException('该邮箱已被注册')
    }

    // 检查手机号是否已存在
    const existingUserByPhone = await this.userRepository.findOne({
      where: { phone: user.phone } as FindOptionsWhere<User>
    })
    if (existingUserByPhone) {
      throw new ConflictException('该手机号已被注册')
    }

    // 获取默认只读角色
    const defaultRole = await this.roleService.getDefaultReadOnlyRole()
    if (!defaultRole) {
      throw new NotFoundException('默认只读角色不存在')
    }

    // 加密用户密码
    const { encryptedText: encryptedPassword, iv } = this.toolsService.encryptText(user.password)

    // 设置用户的默认角色和加密后的密码
    const newUser = this.userRepository.create({
      ...user,
      password: encryptedPassword,
      passwordIv: iv,
      roleId: defaultRole.id
    })
    const savedUser = await this.userRepository.save(newUser)
    return savedUser
  }

  /**
   * 根据条件查询用户
   * @param conditions 查询条件，可以是用户对象的任意属性组合
   * @returns Promise<User[]> 返回符合条件的用户列表
   */
  async findUsersByConditions(conditions: QueryUserDto) {
    const whereConditions: any = {}
    for (const [key, value] of Object.entries(conditions)) {
      if (value) {
        // 对字符串类型的字段使用模糊查询
        if (typeof value === 'string') {
          whereConditions[key] = Like(`%${value}%`)
        } else {
          whereConditions[key] = value
        }
      }
    }
    return this.userRepository.find({ where: whereConditions })
  }

  /**
   * 更新用户信息
   * @param id 要更新的用户ID
   * @param updateData 要更新的用户数据
   * @returns Promise<User> 返回更新后的用户信息
   * @throws NotFoundException 当用户不存在时抛出异常
   */
  async updateUser(id: string, updateData: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } as FindOptionsWhere<User> })
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`)
    }

    Object.assign(user, updateData)
    return this.userRepository.save(user)
  }

  /**
   * 删除用户
   * @param id 要删除的用户ID
   * @returns Promise<string> 返回删除成功的消息
   * @throws NotFoundException 当用户不存在时抛出异常
   */
  async deleteUser(id: string) {
    const result = await this.userRepository.delete({ id } as FindOptionsWhere<User>)
    if (result.affected === 0) {
      throw new NotFoundException(`User with id ${id} not found`)
    }

    return '删除成功'
  }
}
