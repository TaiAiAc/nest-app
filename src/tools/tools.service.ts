import { Injectable } from '@nestjs/common'
import * as crypto from 'crypto'

@Injectable()
export class ToolsService {
  private readonly algorithm = 'aes-256-cbc'
  private readonly key = crypto.scryptSync('your-secret-password', 'salt', 32)
  private readonly iv = crypto.randomBytes(16)

  /**
   * 加密字符串
   * @param text 需要加密的字符串
   * @returns 加密后的结果
   */
  encryptText(text: string) {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    return {
      encryptedText: encrypted,
      iv: this.iv.toString('hex')
    }
  }

  /**
   * 解密字符串
   * @param encryptedText 加密后的字符串
   * @param iv 初始化向量
   * @returns 解密后的结果
   */
  decryptText(encryptedText: string, iv: string) {
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, Buffer.from(iv, 'hex'))
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return {
      decryptedText: decrypted
    }
  }
}
