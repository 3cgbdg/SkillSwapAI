import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AiService } from './ai.service';
import type { RequestWithUser } from 'types/auth';
import type { ReturnDataType } from 'types/general';

@Controller('ai')
@UseGuards(AuthGuard('jwt'))
export class AiController {
  constructor(private readonly aiService: AiService) { }

  @Post('profile/skills')
  async getPlan(
    @Req() req: RequestWithUser,
  ): Promise<ReturnDataType<string[]> | null> {
    return this.aiService.getAiSuggestionSkills(req.user.id);
  }
}
