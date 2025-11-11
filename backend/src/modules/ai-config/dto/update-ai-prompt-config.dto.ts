import { PartialType } from '@nestjs/swagger';
import { CreateAiPromptConfigDto } from './create-ai-prompt-config.dto';

export class UpdateAiPromptConfigDto extends PartialType(CreateAiPromptConfigDto) {}
