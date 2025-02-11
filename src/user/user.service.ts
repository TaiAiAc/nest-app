import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find()
  }

  async create(user: CreateUserDto): Promise<User> {
    const newUser = this.userRepository.create(user)
    return this.userRepository.save(newUser)
  }

  async findUsersByConditions(conditions: Partial<User>): Promise<User[]> {
    const whereConditions: FindOptionsWhere<User> = conditions as FindOptionsWhere<User>
    return this.userRepository.find({ where: whereConditions })
  }

  // 修改用户信息方法
  async updateUser(id: string, updateData: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } as FindOptionsWhere<User> })
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`)
    }

    Object.assign(user, updateData)
    return this.userRepository.save(user)
  }
}
