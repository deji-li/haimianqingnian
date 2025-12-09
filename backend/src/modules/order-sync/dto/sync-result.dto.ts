import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class SyncResultDto {
  @IsString()
  syncBatchId: string;

  @IsNumber()
  totalProcessed: number;

  @IsNumber()
  successCount: number;

  @IsNumber()
  failedCount: number;

  @IsNumber()
  skippedCount: number;

  @IsNumber()
  createdCount: number;

  @IsNumber()
  updatedCount: number;

  @IsNumber()
  deletedCount: number;

  @IsNumber()
  executionTime: number;

  @IsOptional()
  errors?: Array<{
    orderNo: string;
    message: string;
  }>;
}

export class SyncLogQueryDto {
  @IsOptional()
  @IsString()
  syncBatchId?: string;

  @IsOptional()
  @IsString()
  orderNo?: string;

  @IsOptional()
  @IsString()
  syncType?: string;

  @IsOptional()
  @IsString()
  result?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  pageSize?: number;
}
