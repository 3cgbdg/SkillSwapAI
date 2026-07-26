import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { circuitBreaker, ConsecutiveBreaker, handleAll, wrap } from 'cockatiel';
import { IGeneratedActiveMatch } from './ai.interface';
import { PrismaService } from 'prisma/prisma.service';
import { ReturnDataType } from 'types/general';
import { User } from '../prisma/prisma-exports.js';
import { AxiosResponse } from 'axios';
import { RequestGateway } from 'src/webSockets/request.gateway';
import { AiUtils } from 'src/utils/ai.utils';

interface FastApiResponse {
  AIReport: string | object;
}

@Injectable()
export class AiService {
  private readonly fastApiPolicy = wrap(
    circuitBreaker(handleAll, {
      halfOpenAfter: 30_000,
      breaker: new ConsecutiveBreaker(5),
    }),
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly requestGateway: RequestGateway,
  ) {}

  private get fastApiUrl(): string {
    return this.configService
      .getOrThrow<string>('FASTAPI_URL')
      .replace(/\/$/, '');
  }

  private get fastApiHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Service-Token': this.configService.getOrThrow<string>(
        'FASTAPI_SERVICE_TOKEN',
      ),
    };
  }

  private postFastApi<T>(path: string, body: unknown) {
    return this.fastApiPolicy.execute(() =>
      firstValueFrom(
        this.httpService.post<T>(`${this.fastApiUrl}${path}`, body, {
          headers: this.fastApiHeaders,
        }),
      ),
    );
  }

  async generateBodyForActiveMatch(
    myId: string,
    otherId: string,
  ): Promise<{ generatedData: IGeneratedActiveMatch; other: User } | null> {
    if (!myId || !otherId) {
      throw new BadRequestException('User IDs are required');
    }

    const users = await this.prisma.user.findMany({
      where: { id: { in: [myId, otherId] } },
      include: { skillsToLearn: true, knownSkills: true },
    });

    if (users.length !== 2) {
      throw new BadRequestException('Two users must be found');
    }

    const u1 = users.find((u) => u.id === myId)!;
    const u2 = users.find((u) => u.id !== myId)!;

    const fastApiResponse: AxiosResponse<FastApiResponse> =
      await this.postFastApi('/match/active', {
        user1: AiUtils.formatUserForAi(u1),
        user2: AiUtils.formatUserForAi(u2),
      });

    const readyAiArray = AiUtils.parseAiResponse<IGeneratedActiveMatch>(
      fastApiResponse.data.AIReport,
    );

    return readyAiArray ? { generatedData: readyAiArray, other: u2 } : null;
  }

  async getAiSuggestionSkills(
    myId: string,
  ): Promise<ReturnDataType<string[]> | null> {
    if (!myId) throw new BadRequestException('User ID is required');

    const user = await this.prisma.user.findUnique({
      where: { id: myId },
      include: { skillsToLearn: true, knownSkills: true },
    });

    if (!user) throw new UnauthorizedException();

    this.validateRegenerationDate(user.lastSkillsGenerationDate);

    const fastApiResponse: AxiosResponse<FastApiResponse> =
      await this.postFastApi('/profile/skills', {
        skillsToLearn: user.skillsToLearn.map((s) => s.title),
        knownSkills: user.knownSkills.map((s) => s.title),
      });

    const readyAiArray = AiUtils.parseAiResponse<string[]>(
      fastApiResponse.data.AIReport,
    );

    if (readyAiArray && readyAiArray.length > 0) {
      await this.saveAiSuggestions(myId, readyAiArray);
      void this.requestGateway.notifyAiSuggestions(myId, readyAiArray);
    }

    return readyAiArray
      ? { data: readyAiArray, message: 'Skills successfully generated!' }
      : null;
  }

  private validateRegenerationDate(lastDate: Date | null) {
    if (!lastDate) return;

    const hoursDiff =
      (new Date().getTime() - lastDate.getTime()) / (1000 * 3600);
    if (hoursDiff < 24) {
      throw new ForbiddenException('Wait 24 hours to regenerate skills.');
    }
  }

  private async saveAiSuggestions(userId: string, skills: string[]) {
    await this.prisma.skill.createMany({
      data: skills.map((title) => ({ title })),
      skipDuplicates: true,
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        aiSuggestionSkills: skills,
        lastSkillsGenerationDate: new Date(),
      },
    });
  }
}
