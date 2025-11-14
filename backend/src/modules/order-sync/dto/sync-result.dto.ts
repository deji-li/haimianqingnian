export class SyncResultDto {
  syncBatchId: string;
  totalProcessed: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  createdCount: number;
  updatedCount: number;
  deletedCount: number;
  executionTime: number;
  errors?: Array<{
    orderNo: string;
    message: string;
  }>;
}

export class SyncLogQueryDto {
  syncBatchId?: string;
  orderNo?: string;
  syncType?: string;
  result?: string;
  startTime?: string;
  endTime?: string;
  page?: number;
  pageSize?: number;
}
