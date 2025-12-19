import { IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateFeedbackDto {
  @IsNotEmpty({ message: '消息ID不能为空' })
  messageId: number;

  @IsNotEmpty({ message: '反馈类型不能为空' })
  @IsEnum(['like', 'dislike'])
  feedbackType: 'like' | 'dislike';

  @IsOptional()
  @IsString({ message: '反馈原因必须是字符串' })
  feedbackReason?: string;
}