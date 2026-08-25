import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminController } from './admin.controller';
import { AdminSeedService } from './admin-seed.service';

// AdminSeedService pulls in @faker-js/faker (an ESM-only build) for its real
// seeding logic. This suite only needs it as a DI token, never its actual
// implementation, so mock the module outright rather than let ts-jest try
// (and fail) to load faker's dist through the CJS transform.
jest.mock('./admin-seed.service', () => ({
  AdminSeedService: jest.fn(),
}));

describe('AdminController', () => {
  let controller: AdminController;
  let seed: jest.Mock;

  const setup = async (adminSecret: string | undefined) => {
    seed = jest.fn().mockResolvedValue({ message: 'seeded' });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
    })
      .useMocker((token) => {
        if (token === ConfigService)
          return { get: jest.fn().mockReturnValue(adminSecret) };
        if (token === AdminSeedService) return { seed };
        return {};
      })
      .compile();

    controller = module.get<AdminController>(AdminController);
  };

  describe('seedBots', () => {
    it('runs the seed when the admin key matches exactly', async () => {
      await setup('correct-secret');

      const result = await controller.seedBots('correct-secret');

      expect(seed).toHaveBeenCalled();
      expect(result).toEqual({ message: 'seeded' });
    });

    it('rejects a wrong key of the same length', async () => {
      await setup('correct-secret');

      await expect(controller.seedBots('wrong--secret')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(seed).not.toHaveBeenCalled();
    });

    it('rejects a wrong key of a different length without throwing a raw TypeError', async () => {
      await setup('correct-secret');

      // A naive Buffer.from(a).equals(Buffer.from(b)) or a plain
      // timingSafeEqual on mismatched lengths would throw a TypeError
      // instead of a clean 403 -- hashing both sides first avoids that.
      await expect(controller.seedBots('short')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(seed).not.toHaveBeenCalled();
    });

    it('rejects a missing key header', async () => {
      await setup('correct-secret');

      await expect(controller.seedBots(undefined)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(seed).not.toHaveBeenCalled();
    });

    it('fails closed when ADMIN_SECRET is not configured', async () => {
      await setup(undefined);

      await expect(
        controller.seedBots('anything-at-all'),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(seed).not.toHaveBeenCalled();
    });
  });
});
