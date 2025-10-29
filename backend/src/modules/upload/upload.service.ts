import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import * as fs from 'fs';
import * as path from 'path';

export interface CreateFileDto {
  originalName: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  category: string;
  relatedId?: number;
  uploadUserId: number;
}

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) {}

  /**
   * 保存文件记录
   */
  async create(data: CreateFileDto): Promise<File> {
    const file = this.fileRepository.create(data);
    return await this.fileRepository.save(file);
  }

  /**
   * 根据ID查询文件
   */
  async findOne(id: number): Promise<File> {
    return await this.fileRepository.findOne({ where: { id } });
  }

  /**
   * 根据关联ID查询文件列表
   */
  async findByRelatedId(relatedId: number, category?: string): Promise<File[]> {
    const where: any = { relatedId };
    if (category) {
      where.category = category;
    }
    return await this.fileRepository.find({ where });
  }

  /**
   * 删除文件
   */
  async remove(id: number): Promise<void> {
    const file = await this.findOne(id);
    if (!file) {
      throw new Error('文件不存在');
    }

    // 删除物理文件
    try {
      if (fs.existsSync(file.filePath)) {
        fs.unlinkSync(file.filePath);
      }
    } catch (error) {
      console.error('删除物理文件失败:', error);
    }

    // 删除数据库记录
    await this.fileRepository.delete(id);
  }

  /**
   * 确保上传目录存在
   */
  ensureUploadDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * 生成文件名
   */
  generateFileName(originalName: string): string {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}_${random}${ext}`;
  }

  /**
   * 验证文件类型
   */
  validateFileType(mimeType: string, allowedTypes: string[]): boolean {
    return allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return mimeType.startsWith(type.replace('/*', ''));
      }
      return mimeType === type;
    });
  }

  /**
   * 验证文件大小
   */
  validateFileSize(size: number, maxSize: number): boolean {
    return size <= maxSize;
  }
}
