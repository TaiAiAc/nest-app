import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Param,
  Res,
  HttpException,
  HttpStatus,
  Headers
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiResponse as SwaggerApiResponse
} from '@nestjs/swagger'
import { ApiResponse } from '../common/response.dto'
import { FileService, FileInfo } from './file.service'
import { Response } from 'express'
import { join } from 'path'

@ApiTags('文件管理')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @ApiOperation({ summary: '上传单个文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @SwaggerApiResponse({
    status: HttpStatus.CREATED,
    description: '文件上传成功',
    type: ApiResponse
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<ApiResponse<FileInfo>> {
    if (!file) {
      throw new HttpException('请选择要上传的文件', HttpStatus.BAD_REQUEST)
    }

    const fileInfo = await this.fileService.saveFileInfo({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    })

    return new ApiResponse(HttpStatus.CREATED, '文件上传成功', fileInfo)
  }

  @Post('uploads')
  @ApiOperation({ summary: '上传多个文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary'
          }
        }
      }
    }
  })
  @UseInterceptors(FilesInterceptor('files', 10)) // 最多允许上传10个文件
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]): Promise<ApiResponse<FileInfo[]>> {
    if (!files || files.length === 0) {
      throw new HttpException('请选择要上传的文件', HttpStatus.BAD_REQUEST)
    }

    const fileInfos = await Promise.all(
      files.map(file =>
        this.fileService.saveFileInfo({
          filename: file.filename,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path
        })
      )
    )

    return new ApiResponse(HttpStatus.CREATED, '文件上传成功', fileInfos)
  }

  @Get('download/:filename')
  @ApiOperation({ summary: '下载文件' })
  @ApiParam({ name: 'filename', description: '文件名' })
  async downloadFile(
    @Param('filename') filename: string,
    @Res() res: Response,
    @Headers('range') range?: string
  ): Promise<void> {
    const fileInfo = await this.fileService.getFileInfo(filename)
    if (!fileInfo) {
      throw new HttpException('文件不存在', HttpStatus.NOT_FOUND)
    }

    const filePath = join(process.cwd(), fileInfo.path)

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileInfo.size - 1

      if (start >= fileInfo.size || end >= fileInfo.size) {
        res.status(416).send('请求范围不符合要求')
        return
      }

      const stream = await this.fileService.streamFile(filePath, start, end)

      res.status(206).set({
        'Content-Range': `bytes ${start}-${end}/${fileInfo.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
        'Content-Type': fileInfo.mimetype,
        'Content-Disposition': `attachment; filename=${encodeURIComponent(fileInfo.originalname)}`
      })

      stream.pipe(res)
    } else {
      const stream = await this.fileService.streamFile(filePath)

      res.set({
        'Content-Type': fileInfo.mimetype,
        'Content-Disposition': `attachment; filename=${encodeURIComponent(fileInfo.originalname)}`,
        'Content-Length': fileInfo.size,
        'Accept-Ranges': 'bytes'
      })

      stream.pipe(res)
    }
  }
}
