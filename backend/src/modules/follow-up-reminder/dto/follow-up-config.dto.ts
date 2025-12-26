import { IsBoolean, IsObject, IsOptional } from 'class-validator';

export class UpdateFollowUpConfigDto {
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsObject()
  @IsOptional()
  config?: Record<string, {
    rounds: Array<{
      intervalDays: number;
      message: string;
    }>;
    reminderMethods: string[];
  }>;
}

export class FollowUpLevelConfig {
  rounds: Array<{
    intervalDays: number;
    message: string;
  }>;
  reminderMethods: string[];
}

export class FollowUpConfigResponse {
  enabled: boolean;
  config: Record<string, FollowUpLevelConfig>;
}

export class TaskQueryDto {
  @IsOptional()
  status?: string;

  @IsOptional()
  startDate?: string;

  @IsOptional()
  endDate?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
