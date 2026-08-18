import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReturnDataType } from 'types/general';
import {
  IRatingSummary,
  IReviewWithReviewer,
  IUserReviewsResult,
} from 'types/reviews';
import { ISessionWithFriend, ISessionPrismaResult } from 'types/sessions';
import { SessionsUtils } from 'src/sessions/utils/sessions.utils';

const REVIEWER_SELECT = { id: true, name: true, imageUrl: true } as const;
const DEFAULT_TAKE = 10;
const MAX_TAKE = 20;

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateReviewDto,
    myId: string,
  ): Promise<ReturnDataType<IReviewWithReviewer>> {
    const session = await this.prisma.session.findUnique({
      where: { id: dto.sessionId },
      select: {
        status: true,
        endsAt: true,
        users: { select: { id: true } },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (!session.users.some((u) => u.id === myId)) {
      throw new ForbiddenException('You are not a participant of this session');
    }

    const revieweeId = session.users.find((u) => u.id !== myId)?.id;
    if (!revieweeId) {
      throw new BadRequestException(
        'Session has no other participant to review',
      );
    }

    if (session.status !== 'AGREED') {
      throw new BadRequestException('This session was never confirmed');
    }
    if (session.endsAt >= new Date()) {
      throw new BadRequestException('This session has not ended yet');
    }

    const existing = await this.prisma.review.findUnique({
      where: {
        sessionId_reviewerId: { sessionId: dto.sessionId, reviewerId: myId },
      },
    });
    if (existing) {
      throw new ConflictException('You have already reviewed this session');
    }

    const review = await this.prisma.review.create({
      data: {
        sessionId: dto.sessionId,
        reviewerId: myId,
        revieweeId,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: { reviewer: { select: REVIEWER_SELECT } },
    });

    return { message: 'Review submitted', data: review };
  }

  async getRatingSummary(userId: string): Promise<IRatingSummary> {
    const aggregate = await this.prisma.review.aggregate({
      where: { revieweeId: userId },
      _avg: { rating: true },
      _count: true,
    });

    return {
      averageRating: aggregate._avg.rating,
      reviewCount: aggregate._count,
    };
  }

  async getUserReviews(
    userId: string,
    take = DEFAULT_TAKE,
    skip = 0,
  ): Promise<ReturnDataType<IUserReviewsResult>> {
    const clampedTake = Math.min(Math.max(take, 1), MAX_TAKE);

    const [{ averageRating, reviewCount }, reviews] = await Promise.all([
      this.getRatingSummary(userId),
      this.prisma.review.findMany({
        where: { revieweeId: userId },
        orderBy: { createdAt: 'desc' },
        take: clampedTake,
        skip,
        include: { reviewer: { select: REVIEWER_SELECT } },
      }),
    ]);

    return { data: { averageRating, reviewCount, reviews } };
  }

  async getReviewableSessions(
    myId: string,
  ): Promise<ReturnDataType<ISessionWithFriend[]>> {
    const sessions = (await this.prisma.session.findMany({
      where: {
        status: 'AGREED',
        endsAt: { lt: new Date() },
        users: { some: { id: myId } },
        reviews: { none: { reviewerId: myId } },
      },
      include: {
        users: { select: { id: true, name: true, imageUrl: true } },
      },
      orderBy: { endsAt: 'desc' },
      take: 20,
    })) as unknown as ISessionPrismaResult[];

    return {
      data: sessions.map((s) => SessionsUtils.mapSessionWithFriend(s, myId)),
    };
  }
}
