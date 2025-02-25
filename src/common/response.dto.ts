import { ApiProperty } from '@nestjs/swagger'

// 定义一个泛型类 ApiResponse，用于统一接口的返回格式
export class ApiResponse<T> {
  // 使用 @ApiProperty 装饰器为 code 属性添加文档描述
  @ApiProperty({
    type: Number, // 属性类型为数字
    description: '响应状态码，200 表示成功，其他表示异常', // 属性描述
    example: 200 // 属性示例值
  })
  code: number

  // 使用 @ApiProperty 装饰器为 msg 属性添加文档描述
  @ApiProperty({
    type: String, // 属性类型为字符串
    description: '响应消息，用于描述操作结果', // 属性描述
    example: '操作成功' // 属性示例值
  })
  msg: string

  // 使用 @ApiProperty 装饰器为 data 属性添加文档描述
  @ApiProperty({
    description: '响应数据，具体类型根据接口而定', // 属性描述
    example: null // 属性示例值
  })
  data: T

  // 构造函数，用于初始化 ApiResponse 实例
  constructor(code: number, msg: string, data: T) {
    this.code = code
    this.msg = msg
    this.data = data
  }
}
