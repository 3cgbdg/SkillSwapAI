import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { PrismaService } from 'prisma/prisma.service';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prisma: {
    session: { findUnique: jest.Mock; findMany: jest.Mock };
    review: {
      findUnique: jest.Mock;
      create: jest.Mock;
      aggregate: jest.Mock;
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      session: { findUnique: jest.fn(), findMany: jest.fn() },
      review: {
        findUnique: jest.fn(),
        create: jest.fn(),
        aggregate: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewsService],
    })
      .useMocker((token) => (token === PrismaService ? prisma : {}))
      .compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const pastEndsAt = new Date(Date.now() - 60_000);
    const futureEndsAt = new Date(Date.now() + 60_000);

    it('throws NotFoundException for a nonexistent session', async () => {
      prisma.session.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ sessionId: 'missing', rating: 5 }, 'me'),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects a caller who is not a participant of the session', async () => {
      prisma.session.findUnique.mockResolvedValue({
        status: 'AGREED',
        endsAt: pastEndsAt,
        users: [{ id: 'a' }, { id: 'b' }],
      });

      await expect(
        service.create({ sessionId: 's1', rating: 5 }, 'stranger'),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.review.create).not.toHaveBeenCalled();
    });

    it('rejects a session that was never confirmed (still PENDING)', async () => {
      prisma.session.findUnique.mockResolvedValue({
        status: 'PENDING',
        endsAt: pastEndsAt,
        users: [{ id: 'me' }, { id: 'friend' }],
      });

      await expect(
        service.create({ sessionId: 's1', rating: 5 }, 'me'),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a session that has not ended yet', async () => {
      prisma.session.findUnique.mockResolvedValue({
        status: 'AGREED',
        endsAt: futureEndsAt,
        users: [{ id: 'me' }, { id: 'friend' }],
      });

      await expect(
        service.create({ sessionId: 's1', rating: 5 }, 'me'),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a duplicate review for the same session by the same reviewer', async () => {
      prisma.session.findUnique.mockResolvedValue({
        status: 'AGREED',
        endsAt: pastEndsAt,
        users: [{ id: 'me' }, { id: 'friend' }],
      });
      prisma.review.findUnique.mockResolvedValue({ id: 'existing-review' });

      await expect(
        service.create({ sessionId: 's1', rating: 5 }, 'me'),
      ).rejects.toThrow(ConflictException);
      expect(prisma.review.create).not.toHaveBeenCalled();
    });

    it('creates a review for an eligible, unreviewed, ended session', async () => {
      prisma.session.findUnique.mockResolvedValue({
        status: 'AGREED',
        endsAt: pastEndsAt,
        users: [{ id: 'me' }, { id: 'friend' }],
      });
      prisma.review.findUnique.mockResolvedValue(null);
      prisma.review.create.mockResolvedValue({
        id: 'review-1',
        sessionId: 's1',
        reviewerId: 'me',
        revieweeId: 'friend',
        rating: 5,
      });

      await service.create(
        { sessionId: 's1', rating: 5, comment: 'Great!' },
        'me',
      );

      expect(prisma.review.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            sessionId: 's1',
            reviewerId: 'me',
            revieweeId: 'friend',
            rating: 5,
            comment: 'Great!',
          },
        }),
      );
    });
  });

  describe('getRatingSummary / getUserReviews', () => {
    it('returns averageRating null and reviewCount 0 when the user has no reviews', async () => {
      prisma.review.aggregate.mockResolvedValue({
        _avg: { rating: null },
        _count: 0,
      });
      prisma.review.findMany.mockResolvedValue([]);

      const result = await service.getUserReviews('user-with-no-reviews');

      expect(result.data.averageRating).toBeNull();
      expect(result.data.reviewCount).toBe(0);
      expect(result.data.reviews).toEqual([]);
    });
  });

  describe('getReviewableSessions', () => {
    it('scopes the query to ended, agreed sessions the caller has not yet reviewed', async () => {
      prisma.session.findMany.mockResolvedValue([]);

      await service.getReviewableSessions('me');

      expect(prisma.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'AGREED',
            users: { some: { id: 'me' } },
            reviews: { none: { reviewerId: 'me' } },
          }) as unknown,
        }),
      );
    });
  });
});
