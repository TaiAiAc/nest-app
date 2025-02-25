import { Controller, Post, Body } from '@nestjs/common'
import { ToolsService } from './tools.service'
import { ApiTags, ApiOperation, ApiBody, ApiOkResponse } from '@nestjs/swagger'

@ApiTags('工具')
@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Post('encrypt')
  @ApiOperation({
    summary: '字符串加密',
    description: '使用 AES-256-CBC 算法对输入的字符串进行加密'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: '需要加密的字符串' }
      },
      required: ['text']
    }
  })
  @ApiOkResponse({
    description: '加密成功',
    schema: {
      type: 'object',
      properties: {
        encryptedText: { type: 'string', description: '加密后的字符串' },
        iv: { type: 'string', description: '初始化向量' }
      }
    }
  })
  encrypt(@Body('text') text: string) {
    return this.toolsService.encryptText(text)
  }

  @Post('decrypt')
  @ApiOperation({
    summary: '字符串解密',
    description: '使用 AES-256-CBC 算法对加密的字符串进行解密'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        encryptedText: { type: 'string', description: '加密后的字符串' },
        iv: { type: 'string', description: '初始化向量' }
      },
      required: ['encryptedText', 'iv']
    }
  })
  @ApiOkResponse({
    description: '解密成功',
    schema: {
      type: 'object',
      properties: {
        decryptedText: { type: 'string', description: '解密后的字符串' }
      }
    }
  })
  decrypt(@Body('encryptedText') encryptedText: string, @Body('iv') iv: string) {
    return this.toolsService.decryptText(encryptedText, iv)
  }
}
