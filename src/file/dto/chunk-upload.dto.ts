import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNumber, IsOptional } from 'class-validator'

export class ChunkUploadDto {
  @ApiProperty({ description: '文件唯一标识' })
  @IsString()
  fileId: string

  @ApiProperty({ description: '分片索引' })
  @IsNumber()
  chunkIndex: number

  @ApiProperty({ description: '总分片数' })
  @IsNumber()
  totalChunks: number

  @ApiProperty({ description: '文件总大小（字节）' })
  @IsNumber()
  totalSize: number

  @ApiProperty({ description: '文件原始名称' })
  @IsString()
  originalname: string

  @ApiProperty({ description: '文件类型' })
  @IsString()
  mimetype: string

  @ApiProperty({ description: '文件MD5值', required: false })
  @IsString()
  @IsOptional()
  md5?: string
}
