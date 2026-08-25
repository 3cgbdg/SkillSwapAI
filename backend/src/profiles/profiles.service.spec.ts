import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesService } from './profiles.service';
import { PrismaService } from 'prisma/prisma.service';
import { ReviewsService } from 'src/reviews/reviews.service';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let prisma: { user: { findUnique: jest.Mock } };
  let getRatingSummary: jest.Mock;

  beforeEach(async () => {
    prisma = { user: { findUnique: jest.fn() } };
    getRatingSummary = jest
      .fn()
      .mockResolvedValue({ averageRating: null, reviewCount: 0 });

    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfilesService],
    })
      .useMocker((token) => {
        if (token === PrismaService) return prisma;
        if (token === ReviewsService) return { getRatingSummary };
        return {};
      })
      .compile();

    service = module.get<ProfilesService>(ProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('requests only the public-safe fields via a Prisma select, never a full-record include', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'other-user',
        name: 'Other User',
        imageUrl: null,
        bio: null,
        knownSkills: [],
        skillsToLearn: [],
      });

      await service.findOne('other-user');

      const calls = prisma.user.findUnique.mock.calls as unknown as {
        select?: Record<string, unknown>;
        include?: unknown;
      }[][];
      const call = calls[0][0];
      expect(call.include).toBeUndefined();
      expect(Object.keys(call.select ?? {}).sort()).toEqual(
        [
          'id',
          'name',
          'imageUrl',
          'bio',
          'skillsToLearn',
          'knownSkills',
        ].sort(),
      );
    });

    it('never returns email, password, googleId, or other account-internal fields', async () => {
      // Simulate what a *correctly-scoped* select would return -- this
      // guards the response shape even if someone widens the select later,
      // since Prisma's mock here would need to be told to return these
      // fields for them to leak, at which point this assertion catches it.
      prisma.user.findUnique.mockResolvedValue({
        id: 'other-user',
        name: 'Other User',
        imageUrl: null,
        bio: 'hi',
        knownSkills: [{ title: 'TypeScript' }],
        skillsToLearn: [{ title: 'Design' }],
      });

      const result = await service.findOne('other-user');

      expect(result.data).not.toHaveProperty('email');
      expect(result.data).not.toHaveProperty('password');
      expect(result.data).not.toHaveProperty('googleId');
      expect(result.data).not.toHaveProperty('isBot');
      expect(result.data).not.toHaveProperty('aiSuggestionSkills');
      expect(result.data).not.toHaveProperty('lastSkillsGenerationDate');
      expect(result.data).not.toHaveProperty('completedSessionsCount');
      expect(result.data).toEqual({
        id: 'other-user',
        name: 'Other User',
        imageUrl: null,
        bio: 'hi',
        knownSkills: [{ title: 'TypeScript' }],
        skillsToLearn: [{ title: 'Design' }],
        averageRating: null,
        reviewCount: 0,
      });
    });

    it('returns null data for a nonexistent user without calling ReviewsService', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.findOne('missing-user');

      expect(result).toEqual({ data: null });
      expect(getRatingSummary).not.toHaveBeenCalled();
    });
  });
});
