import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
  HttpException
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse as SwaggerApiResponse
} from '@nestjs/swagger'
import { ApiResponse } from '../common/response.dto'
import { FileService, FileInfo, ChunkInfo } from './file.service'

@ApiTags('文件切片上传')
@Controller('chunk')
export class ChunkController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @ApiOperation({ summary: '上传文件切片' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary'
        },
        fileId: {
          type: 'string',
          description: '文件唯一标识'
        },
        chunkIndex: {
          type: 'number',
          description: '当前切片索引'
        },
        totalChunks: {
          type: 'number',
          description: '总切片数'
        },
        totalSize: {
          type: 'number',
          description: '文件总大小'
        },
        originalname: {
          type: 'string',
          description: '原始文件名'
        },
        mimetype: {
          type: 'string',
          description: '文件类型'
        },
        md5: {
          type: 'string',
          description: '文件MD5值'
        }
      }
    }
  })
  @SwaggerApiResponse({
    status: HttpStatus.CREATED,
    description: '切片上传成功',
    type: ApiResponse
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadChunk(
    @UploadedFile() file: Express.Multer.File,
    @Body() chunkInfo: ChunkInfo
  ): Promise<ApiResponse<void>> {
    if (!file) {
      throw new HttpException('请选择要上传的文件切片', HttpStatus.BAD_REQUEST)
    }

    await this.fileService.saveChunk(chunkInfo.fileId, chunkInfo.chunkIndex, file.buffer, chunkInfo)

    return new ApiResponse(HttpStatus.CREATED, '切片上传成功', null)
  }

  @Post('merge')
  @ApiOperation({ summary: '合并文件切片' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fileId: {
          type: 'string',
          description: '文件唯一标识'
        }
      }
    }
  })
  @SwaggerApiResponse({
    status: HttpStatus.CREATED,
    description: '文件合并成功',
    type: ApiResponse
  })
  async mergeChunks(@Body('fileId') fileId: string): Promise<ApiResponse<FileInfo>> {
    if (!fileId) {
      throw new HttpException('文件ID不能为空', HttpStatus.BAD_REQUEST)
    }

    const chunkInfo = await this.fileService.getChunkInfo(fileId)
    if (!chunkInfo) {
      throw new HttpException('未找到文件切片信息', HttpStatus.NOT_FOUND)
    }

    const fileInfo = await this.fileService.mergeChunks(fileId)
    return new ApiResponse(HttpStatus.CREATED, '文件合并成功', fileInfo)
  }
}
