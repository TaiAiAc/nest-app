import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, Repository } from 'typeorm'
import { Route } from './entities/route.entity'
import { CreateRouteDto } from './dto/create-route.dto'
import { UpdateRouteDto } from './dto/update-route.dto'

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private routeRepository: Repository<Route>
  ) {}

  /**
   * 创建新路由
   * @param createRouteDto - 创建路由的数据传输对象
   * @returns Promise<Route> 返回创建的路由实例
   */
  async create(createRouteDto: CreateRouteDto) {
    const newRoute = this.routeRepository.create(createRouteDto)
    return this.routeRepository.save(newRoute)
  }

  /**
   * 获取所有路由列表
   * @returns Promise<Route[]> 返回路由列表
   */
  async findAll() {
    return this.routeRepository.find()
  }

  /**
   * 根据ID查找路由
   * @param id - 路由ID
   * @returns Promise<Route> 返回找到的路由实例
   * @throws NotFoundException 当路由不存在时抛出异常
   */
  async findOne(id: string) {
    const route = await this.routeRepository.findOne({
      where: { id } as FindOptionsWhere<Route>
    })
    if (!route) {
      throw new NotFoundException(`路由 ID ${id} 不存在`)
    }
    return route
  }

  /**
   * 更新路由信息
   * @param id - 路由ID
   * @param updateRouteDto - 更新路由的数据传输对象
   * @returns Promise<Route> 返回更新后的路由实例
   */
  async update(id: string, updateRouteDto: UpdateRouteDto) {
    const route = await this.findOne(id)
    Object.assign(route, updateRouteDto)
    return this.routeRepository.save(route)
  }

  /**
   * 删除路由
   * @param id - 路由ID
   * @returns Promise<{message: string}> 返回删除成功的消息
   */
  async remove(id: string) {
    const route = await this.findOne(id)
    await this.routeRepository.remove(route)
    return { message: '路由删除成功' }
  }

  /**
   * 根据路由ID列表获取路由信息
   * @param ids - 路由ID数组
   * @returns Promise<Route[]> 返回路由列表
   */
  async findByIds(ids: string[]) {
    return this.routeRepository.findByIds(ids)
  }
}
