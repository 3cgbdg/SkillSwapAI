import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AiService } from './ai.service';

@Controller('ai')
@UseGuards(AuthGuard("jwt"))
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('profile/skills')
    async getPlan(@Req() req: Request): Promise<{ skills: string[], message: string } | null> {
        return this.aiService.getAiSuggestionSkills((req as any).user.id);
    }
}
