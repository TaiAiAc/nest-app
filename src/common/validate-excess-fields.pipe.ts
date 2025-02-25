import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { validate, ValidationError } from 'class-validator'
import { getMetadataStorage } from 'class-validator'
import { ValidationMetadata } from 'class-validator/types/metadata/ValidationMetadata'

@Injectable()
export class ValidateExcessFieldsPipe implements PipeTransform<any> {
  async transform(value: Record<string, any>, { metatype }: ArgumentMetadata): Promise<any> {
    if (!metatype || !this.toValidate(metatype)) {
      return value
    }

    const object = plainToInstance(metatype, value)
    const errors: ValidationError[] = await validate(object)

    if (errors.length > 0) {
      throw new BadRequestException(this.formatErrors(errors))
    }

    const allowedKeys: string[] = this.getAllowedKeys(metatype)
    const receivedKeys: string[] = Object.keys(value)
    const excessKeys: string[] = receivedKeys.filter(key => !allowedKeys.includes(key))

    if (excessKeys.length > 0) {
      throw new BadRequestException(`请求中包含多余字段: ${excessKeys.join(', ')}`)
    }

    return object
  }

  private toValidate(metatype: any): boolean {
    const types = [String, Boolean, Number, Array, Object]
    return !types.includes(metatype)
  }

  private formatErrors(errors: ValidationError[]): string {
    return errors.map(error => Object.values(error.constraints || {}).join(', ')).join('; ')
  }

  private getAllowedKeys(metatype: any): string[] {
    const metadataStorage = getMetadataStorage()
    const validationMetadatas: ValidationMetadata[] = metadataStorage.getTargetValidationMetadatas(
      metatype,
      '',
      false,
      false
    )
    const properties: string[] = [...new Set(validationMetadatas.map(m => m.propertyName))]
    return properties
  }
}
