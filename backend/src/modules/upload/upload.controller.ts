import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  BadRequestException,
  NotFoundException,
  Res,
} from '@nestjs/common';
import {
  FileInterceptor,
} from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import { Log } from '../log/decorators/log.decorator';
import { Public } from '../../common/decorators/public.decorator';

// 上传目录配置
const UPLOAD_DIR = process.env.UPLOAD_PATH || './uploads';

// 文件大小限制（默认10MB）
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760');

// 允许的文件类型配置
const ALLOWED_TYPES = {
  avatar: ['image/jpeg', 'image/png', 'image/gif'],
  customer_attachment: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  order_contract: ['application/pdf', 'image/*'],
  other: ['*'],
};

@ApiTags('文件上传')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {
    // 确保上传目录存在
    this.uploadService.ensureUploadDir(UPLOAD_DIR);
  }

  /**
   * 上传文件
   */
  @Post()
  @Log('文件管理', '上传文件')
  @ApiOperation({ summary: '上传文件' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const category = req.body.category || 'other';
          const uploadPath = path.join(UPLOAD_DIR, category);

          // 确保分类目录存在
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }

          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          // 使用时间戳和随机字符串生成唯一文件名
          const ext = path.extname(file.originalname);
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(2, 15);
          const filename = `${timestamp}_${random}${ext}`;
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
      fileFilter: (req, file, cb) => {
        const category = req.body.category || 'other';
        const allowedTypes = ALLOWED_TYPES[category] || ALLOWED_TYPES.other;

        // 验证文件类型
        const isValid = allowedTypes.includes('*') || allowedTypes.some(type => {
          if (type.endsWith('/*')) {
            return file.mimetype.startsWith(type.replace('/*', ''));
          }
          return file.mimetype === type;
        });

        if (!isValid) {
          cb(new BadRequestException(`不支持的文件类型: ${file.mimetype}`), false);
          return;
        }

        cb(null, true);
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    const category = req.body.category || 'other';
    const relatedId = req.body.relatedId ? parseInt(req.body.relatedId) : undefined;

    // 保存文件记录到数据库
    const savedFile = await this.uploadService.create({
      originalName: file.originalname,
      fileName: file.filename,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      category,
      relatedId,
      uploadUserId: req.user.id,
    });

    return {
      id: savedFile.id,
      fileName: savedFile.fileName,
      originalName: savedFile.originalName,
      fileSize: savedFile.fileSize,
      url: `/api/upload/file/${savedFile.id}`,
    };
  }

  /**
   * 获取文件（用于下载或预览）
   */
  @Public()
  @Get('file/:id')
  @ApiOperation({ summary: '获取文件' })
  async getFile(@Param('id') id: number, @Res() res: Response) {
    const file = await this.uploadService.findOne(id);

    if (!file) {
      throw new NotFoundException('文件不存在');
    }

    if (!fs.existsSync(file.filePath)) {
      throw new NotFoundException('文件物理路径不存在');
    }

    // 设置响应头
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.originalName)}"`);

    // 读取文件并返回
    const fileStream = fs.createReadStream(file.filePath);
    fileStream.pipe(res);
  }

  /**
   * 下载文件
   */
  @Get('download/:id')
  @ApiOperation({ summary: '下载文件' })
  async downloadFile(@Param('id') id: number, @Res() res: Response) {
    const file = await this.uploadService.findOne(id);

    if (!file) {
      throw new NotFoundException('文件不存在');
    }

    if (!fs.existsSync(file.filePath)) {
      throw new NotFoundException('文件物理路径不存在');
    }

    // 设置响应头为下载
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);

    // 读取文件并返回
    const fileStream = fs.createReadStream(file.filePath);
    fileStream.pipe(res);
  }

  /**
   * 根据关联ID获取文件列表
   */
  @Get('related/:relatedId')
  @ApiOperation({ summary: '获取关联文件列表' })
  async getFilesByRelatedId(
    @Param('relatedId') relatedId: number,
    @Query('category') category?: string,
  ) {
    const files = await this.uploadService.findByRelatedId(relatedId, category);

    return files.map(file => ({
      id: file.id,
      fileName: file.fileName,
      originalName: file.originalName,
      fileSize: file.fileSize,
      category: file.category,
      createTime: file.createTime,
      url: `/api/upload/file/${file.id}`,
      downloadUrl: `/api/upload/download/${file.id}`,
    }));
  }

  /**
   * 删除文件
   */
  @Delete(':id')
  @Log('文件管理', '删除文件')
  @ApiOperation({ summary: '删除文件' })
  async removeFile(@Param('id') id: number) {
    await this.uploadService.remove(id);
    return { message: '文件删除成功' };
  }
}
