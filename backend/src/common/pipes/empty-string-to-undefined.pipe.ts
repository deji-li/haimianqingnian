import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class EmptyStringToUndefinedPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'query' || metadata.type === 'body') {
      return this.transformObject(value);
    }
    return value;
  }

  private transformObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.transformObject(item));
    }

    const result = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        // 将空字符串转换为 undefined
        result[key] = value === '' ? undefined : this.transformObject(value);
      }
    }
    return result;
  }
}
