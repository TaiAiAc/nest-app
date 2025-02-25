import { Entity, Column, PrimaryColumn, BeforeInsert } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { v4 as uuidv4 } from 'uuid'

interface RouteMeta {
  /** 路由标题，可用于文档标题中 */
  title: string
  /** 路由的国际化键值，如果设置，将用于i18n，此时title将被忽略 */
  i18nKey?: string
  /** 路由的角色列表，当前用户拥有至少一个角色时，允许访问该路由，角色列表为空时，表示无需权限 */
  roles?: string[]
  /** 是否缓存该路由 */
  keepAlive?: boolean
  /** 是否为常量路由，无需登录，并且该路由在前端定义 */
  constant?: boolean
  /** Iconify 图标，可用于菜单或面包屑中 */
  icon?: string
  /** 本地图标，存在于 "src/assets/svg-icon" 目录下，如果设置，将忽略icon属性 */
  localIcon?: string
  /** 路由排序顺序 */
  order?: number
  /** 路由的外部链接 */
  href?: string
  /** 是否在菜单中隐藏该路由 */
  hideInMenu?: boolean
  /** 进入该路由时激活的菜单键，该路由不在菜单中 */
  activeMenu?: string
  /** 默认情况下，相同路径的路由会共享一个标签页，若设置为true，则使用多个标签页 */
  multiTab?: boolean
  /** 若设置，路由将在标签页中固定显示，其值表示固定标签页的顺序（首页是特殊的，它将自动保持fixed） */
  fixedIndexInTab?: number
  /** 路由查询参数，如果设置的话，点击菜单进入该路由时会自动携带的query参数 */
  query?: { key: string; value: string }[] | null
}

@Entity()
export class Route {
  @ApiProperty({ description: '路由 ID' })
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string

  @ApiProperty({ description: '路由路径', example: '/dashboard' })
  @Column({ unique: true })
  path: string

  @ApiProperty({ description: '路由名称', example: '仪表盘' })
  @Column()
  name: string

  @ApiProperty({ description: '路由描述', example: '系统仪表盘页面' })
  @Column({ nullable: true })
  description: string

  @ApiProperty({ description: '路由图标', example: 'dashboard' })
  @Column({ nullable: true })
  icon: string

  @ApiProperty({ description: '父路由ID', example: null })
  @Column({ type: 'char', length: 36, nullable: true })
  parentId: string

  @ApiProperty({ description: '排序序号', example: 1 })
  @Column({ default: 0 })
  orderNum: number

  @ApiProperty({ description: '是否隐藏', example: false })
  @Column({ default: false })
  hidden: boolean

  @ApiProperty({ description: '访问该路由所需权限', example: ['dashboard:view'] })
  @Column('simple-array', { nullable: true })
  permissions: string[]

  @ApiProperty({ description: '路由元信息' })
  @Column('json', { nullable: true })
  meta?: RouteMeta

  @ApiProperty({ description: '是否启用', example: true })
  @Column({ default: true })
  enabled: boolean

  @BeforeInsert()
  generateId() {
    this.id = uuidv4()
  }
}
