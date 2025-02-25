import { Module } from '@nestjs/common'
import { FileController } from './file.controller'
import { ChunkController } from './chunk.controller'
import { FileService } from './file.service'
import { MulterModule } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
          const ext = extname(file.originalname).toLowerCase()
          callback(null, `${uniqueSuffix}${ext}`)
        }
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 1
      }
    })
  ],
  controllers: [FileController, ChunkController],
  providers: [FileService],
  exports: [FileService]
})
export class FileModule {}
