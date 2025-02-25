import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, Repository } from 'typeorm'
import { Role } from './entities/role.entity'
import { CreateRoleDto } from './dto/create-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { User } from '../user/entities/user.entity'

/**
 * 角色服务类
 * 处理所有与角色相关的业务逻辑，包括角色的创建、查询、更新、删除以及用户角色分配等操作
 */
@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  /**
   * 默认只读角色配置
   * 系统初始化时会自动创建这个角色
   */
  private readonly DEFAULT_READONLY_ROLE = {
    name: 'readonly',
    description: '只读用户',
    permissions: ['user:read']
  }

  /**
   * 创建新角色
   * @param createRoleDto - 创建角色的数据传输对象
   * @returns Promise<Role> 返回创建的角色实例
   */
  async create(createRoleDto: CreateRoleDto) {
    const newRole = this.roleRepository.create(createRoleDto)
    return this.roleRepository.save(newRole)
  }

  /**
   * 模块初始化时的钩子方法
   * 检查并确保默认只读角色存在
   */
  async onModuleInit() {
    // 检查并创建默认只读角色
    const existingRole = await this.roleRepository.findOne({
      where: { name: this.DEFAULT_READONLY_ROLE.name }
    })
    if (!existingRole) {
      await this.create(this.DEFAULT_READONLY_ROLE)
    }
  }

  /**
   * 获取默认只读角色
   * @returns Promise<Role | null> 返回默认只读角色，如果不存在则返回 null
   */
  async getDefaultReadOnlyRole() {
    return this.roleRepository.findOne({
      where: { name: this.DEFAULT_READONLY_ROLE.name }
    })
  }

  /**
   * 为用户分配默认只读角色
   * @param userId - 用户ID
   * @returns Promise<Role> 返回分配的角色
   * @throws NotFoundException 当默认只读角色不存在时抛出异常
   */
  async assignDefaultRoleToUser(userId: string) {
    const role = await this.getDefaultReadOnlyRole()
    if (!role) {
      throw new NotFoundException('默认只读角色不存在')
    }
    const user = await this.userRepository.findOne({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException(`用户 ID ${userId} 不存在`)
    }
    user.roleId = role.id
    await this.userRepository.save(user)
    return role
  }

  /**
   * 获取所有角色列表
   * @returns Promise<Role[]> 返回包含用户关联信息的角色列表
   */
  async findAll() {
    return this.roleRepository.find()
  }

  /**
   * 根据ID查找角色
   * @param id - 角色ID
   * @returns Promise<Role> 返回找到的角色实例
   * @throws NotFoundException 当角色不存在时抛出异常
   */
  async findOne(id: string) {
    const role = await this.roleRepository.findOne({
      where: { id } as FindOptionsWhere<Role>
    })
    if (!role) {
      throw new NotFoundException(`角色 ID ${id} 不存在`)
    }
    return role
  }

  /**
   * 更新角色信息
   * @param id - 角色ID
   * @param updateRoleDto - 更新角色的数据传输对象
   * @returns Promise<Role> 返回更新后的角色实例
   */
  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.findOne(id)
    Object.assign(role, updateRoleDto)
    return this.roleRepository.save(role)
  }

  /**
   * 删除角色
   * @param id - 角色ID
   * @returns Promise<{message: string}> 返回删除成功的消息
   */
  async remove(id: string) {
    const role = await this.findOne(id)
    await this.roleRepository.remove(role)
    return { message: '角色删除成功' }
  }

  /**
   * 为角色分配用户
   * @param roleId - 角色ID
   * @param userIds - 用户ID数组
   * @returns Promise<{message: string}> 返回分配成功的消息
   */
  async assignUsersToRole(roleId: string, userIds: string[]) {
    const role = await this.findOne(roleId)
    const users = await this.userRepository.findByIds(userIds)
    for (const user of users) {
      user.roleId = role.id
      await this.userRepository.save(user)
    }
    return { message: '用户分配成功' }
  }

  /**
   * 从角色中移除用户
   * @param roleId - 角色ID
   * @param userIds - 要移除的用户ID数组
   * @returns Promise<{message: string}> 返回移除成功的消息
   */
  async removeUsersFromRole(roleId: string, userIds: string[]) {
    const users = await this.userRepository.findByIds(userIds)
    for (const user of users) {
      user.roleId = null
      await this.userRepository.save(user)
    }
    return { message: '用户移除成功' }
  }
}
