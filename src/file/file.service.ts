import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { promises as fs } from 'fs'
import { join } from 'path'
import { createWriteStream, createReadStream } from 'fs'
import { pipeline } from 'stream/promises'

export interface FileInfo {
  filename: string
  originalname: string
  mimetype: string
  size: number
  path: string
  md5?: string
}

export interface ChunkInfo {
  fileId: string
  chunkIndex: number
  totalChunks: number
  totalSize: number
  originalname: string
  mimetype: string
  md5?: string
}

@Injectable()
export class FileService {
  private readonly uploadsDir = join(process.cwd(), 'uploads')
  private readonly chunksDir = join(this.uploadsDir, 'chunks')
  private readonly fileInfoPath = join(this.uploadsDir, 'file-info.json')

  constructor() {
    this.initializeUploadsDirectory()
  }

  private async initializeUploadsDirectory() {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true, mode: 0o755 })
      await fs.mkdir(this.chunksDir, { recursive: true, mode: 0o755 })
      try {
        await fs.access(this.fileInfoPath)
      } catch {
        await fs.writeFile(this.fileInfoPath, JSON.stringify([]), { mode: 0o644 })
      }
    } catch (error) {
      console.error('初始化上传目录失败:', error)
      throw new HttpException('无法初始化上传目录', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async saveChunk(fileId: string, chunkIndex: number, buffer: Buffer, chunkInfo: ChunkInfo): Promise<void> {
    const chunkDir = join(this.chunksDir, fileId)
    await fs.mkdir(chunkDir, { recursive: true })
    const chunkPath = join(chunkDir, `${chunkIndex}`)
    await fs.writeFile(chunkPath, buffer)

    const chunkInfoPath = join(chunkDir, 'info.json')
    await fs.writeFile(chunkInfoPath, JSON.stringify(chunkInfo))
  }

  async mergeChunks(fileId: string): Promise<FileInfo> {
    const chunkDir = join(this.chunksDir, fileId)
    const chunkInfoPath = join(chunkDir, 'info.json')

    try {
      const chunkInfoContent = await fs.readFile(chunkInfoPath, 'utf-8')
      const chunkInfo: ChunkInfo = JSON.parse(chunkInfoContent)

      const filename = `${fileId}-${Date.now()}-${chunkInfo.originalname}`
      const filePath = join(this.uploadsDir, filename)
      const writeStream = createWriteStream(filePath)

      for (let i = 0; i < chunkInfo.totalChunks; i++) {
        const chunkPath = join(chunkDir, `${i}`)
        const chunkStream = createReadStream(chunkPath)
        await pipeline(chunkStream, writeStream, { end: false })
      }

      writeStream.end()

      // 清理分片文件
      await fs.rm(chunkDir, { recursive: true })

      const fileInfo: FileInfo = {
        filename,
        originalname: chunkInfo.originalname,
        mimetype: chunkInfo.mimetype,
        size: chunkInfo.totalSize,
        path: filePath,
        md5: chunkInfo.md5
      }

      return await this.saveFileInfo(fileInfo)
    } catch (error) {
      throw new HttpException('合并文件失败', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getChunkInfo(fileId: string): Promise<ChunkInfo | null> {
    try {
      const chunkInfoPath = join(this.chunksDir, fileId, 'info.json')
      const content = await fs.readFile(chunkInfoPath, 'utf-8')
      return JSON.parse(content)
    } catch {
      return null
    }
  }

  async streamFile(filePath: string, start?: number, end?: number): Promise<NodeJS.ReadableStream> {
    const options: any = {}
    if (typeof start === 'number' && typeof end === 'number') {
      options.start = start
      options.end = end
    }
    return createReadStream(filePath, options)
  }

  async saveFileInfo(fileInfo: FileInfo): Promise<FileInfo> {
    try {
      const fileInfos = await this.getAllFileInfos()
      fileInfos.push(fileInfo)
      await fs.writeFile(this.fileInfoPath, JSON.stringify(fileInfos, null, 2))
      return fileInfo
    } catch (error) {
      throw new HttpException('保存文件信息失败', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getFileInfo(filename: string): Promise<FileInfo | null> {
    try {
      const fileInfos = await this.getAllFileInfos()
      return fileInfos.find(info => info.filename === filename) || null
    } catch (error) {
      throw new HttpException('获取文件信息失败', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  private async getAllFileInfos(): Promise<FileInfo[]> {
    try {
      const content = await fs.readFile(this.fileInfoPath, 'utf-8')
      return JSON.parse(content)
    } catch (error) {
      return []
    }
  }

  async deleteFile(filename: string): Promise<void> {
    try {
      const fileInfo = await this.getFileInfo(filename)
      if (!fileInfo) {
        throw new HttpException('文件不存在', HttpStatus.NOT_FOUND)
      }

      await fs.unlink(join(process.cwd(), fileInfo.path))
      const fileInfos = await this.getAllFileInfos()
      const updatedFileInfos = fileInfos.filter(info => info.filename !== filename)
      await fs.writeFile(this.fileInfoPath, JSON.stringify(updatedFileInfos, null, 2))
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException('删除文件失败', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
