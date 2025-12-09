import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  HttpException,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BaiduOcrService, BaiduOcrOptions } from './baidu-ocr.service';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';

@ApiTags('百度OCR')
@Controller('api/ai-tools/baidu-ocr')
export class BaiduOcrController {
  constructor(private readonly baiduOcrService: BaiduOcrService) {}

  @Get('config/validate')
  @ApiOperation({ summary: '验证百度OCR配置' })
  @ApiResponse({ status: 200, description: '配置验证结果' })
  async validateConfig() {
    return await this.baiduOcrService.validateConfig();
  }

  @Post('recognize')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/ocr';
          if (!require('fs').existsSync(uploadPath)) {
            require('fs').mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const randomName = uuidv4();
          const fileExtName = extname(file.originalname);
          cb(null, `${randomName}${fileExtName}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|bmp|pdf/;
        const extname = allowedTypes.test(file.originalname.toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
          return cb(null, true);
        } else {
          return cb(new Error('只支持图片文件 (jpg, png, bmp, pdf)'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  @ApiOperation({ summary: '百度OCR文字识别（高精度版）' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: '识别成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async recognizeText(
    @UploadedFile() file: Express.Multer.File,
    @Body() options: BaiduOcrOptions,
  ) {
    if (!file) {
      throw new HttpException('请上传图片文件', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.baiduOcrService.recognizeText(file.path, options);

      return {
        success: true,
        data: {
          ...result,
          extractedText: this.baiduOcrService.extractText(result),
        },
        message: 'OCR识别完成',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'OCR识别失败',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('recognize/basic')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/ocr';
          if (!require('fs').existsSync(uploadPath)) {
            require('fs').mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const randomName = uuidv4();
          const fileExtName = extname(file.originalname);
          cb(null, `${randomName}${fileExtName}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|bmp|pdf/;
        const extname = allowedTypes.test(file.originalname.toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
          return cb(null, true);
        } else {
          return cb(new Error('只支持图片文件 (jpg, png, bmp, pdf)'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  @ApiOperation({ summary: '百度OCR文字识别（标准版）' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: '识别成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  async recognizeTextBasic(
    @UploadedFile() file: Express.Multer.File,
    @Body() options: BaiduOcrOptions,
  ) {
    if (!file) {
      throw new HttpException('请上传图片文件', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.baiduOcrService.recognizeTextBasic(file.path, options);

      return {
        success: true,
        data: {
          ...result,
          extractedText: this.baiduOcrService.extractText(result),
        },
        message: 'OCR识别完成（标准版）',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'OCR识别失败',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}