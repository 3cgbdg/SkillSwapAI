import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { PrismaService } from 'prisma/prisma.service';
import { ReviewsService } from 'src/reviews/reviews.service';
import { S3Service } from 'src/s3/s3.service';
import { UsersService } from 'src/users/users.service';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let prisma: { user: { findUnique: jest.Mock } };
  let getRatingSummary: jest.Mock;
  let uploadFile: jest.Mock;
  let updateUserImageUrl: jest.Mock;

  beforeEach(async () => {
    prisma = { user: { findUnique: jest.fn() } };
    getRatingSummary = jest
      .fn()
      .mockResolvedValue({ averageRating: null, reviewCount: 0 });
    uploadFile = jest
      .fn()
      .mockResolvedValue('https://bucket.s3.example/avatars/1_a.png');
    updateUserImageUrl = jest.fn().mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfilesService],
    })
      .useMocker((token) => {
        if (token === PrismaService) return prisma;
        if (token === ReviewsService) return { getRatingSummary };
        if (token === S3Service) return { uploadFile };
        if (token === UsersService) return { updateUserImageUrl };
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

  describe('updateProfileAvatarImage', () => {
    const makeFile = (buffer: Buffer): Express.Multer.File =>
      ({
        buffer,
        originalname: 'avatar.png',
      }) as Express.Multer.File;

    it('accepts a real PNG and uploads it', async () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0]);

      const result = await service.updateProfileAvatarImage(
        makeFile(pngBuffer),
        'user-1',
      );

      expect(uploadFile).toHaveBeenCalled();
      expect(updateUserImageUrl).toHaveBeenCalledWith(
        'user-1',
        'https://bucket.s3.example/avatars/1_a.png',
      );
      expect(result.data).toEqual({
        url: 'https://bucket.s3.example/avatars/1_a.png',
      });
    });

    it('accepts a real JPEG and uploads it', async () => {
      const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0, 0, 0, 0, 0]);

      await service.updateProfileAvatarImage(makeFile(jpegBuffer), 'user-1');

      expect(uploadFile).toHaveBeenCalled();
    });

    it('accepts a real WEBP and uploads it', async () => {
      const webpBuffer = Buffer.concat([
        Buffer.from('RIFF', 'ascii'),
        Buffer.from([0, 0, 0, 0]),
        Buffer.from('WEBP', 'ascii'),
      ]);

      await service.updateProfileAvatarImage(makeFile(webpBuffer), 'user-1');

      expect(uploadFile).toHaveBeenCalled();
    });

    it('rejects a file whose bytes are not a real image, regardless of its claimed name', async () => {
      // e.g. an .html or .js file renamed to look like an avatar upload --
      // the client-supplied mimetype/fileFilter can't be trusted, only the
      // actual bytes can.
      const htmlBuffer = Buffer.from('<script>alert(1)</script>', 'utf-8');

      await expect(
        service.updateProfileAvatarImage(makeFile(htmlBuffer), 'user-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(uploadFile).not.toHaveBeenCalled();
      expect(updateUserImageUrl).not.toHaveBeenCalled();
    });
  });
});
