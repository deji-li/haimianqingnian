import { PartialType } from '@nestjs/swagger';
import { CreateAiPromptVariableDto } from './create-ai-prompt-variable.dto';

export class UpdateAiPromptVariableDto extends PartialType(CreateAiPromptVariableDto) {}
