import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import type { UpdateProfileDto } from './dto/update-profile.dto';
import type { RequestWithUser } from 'types/auth';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  let updateProfile: jest.Mock;

  beforeEach(async () => {
    updateProfile = jest
      .fn()
      .mockResolvedValue({ message: 'Successfully updated!' });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
    })
      .useMocker((token) => {
        if (token === ProfilesService) return { updateProfile };
        return {};
      })
      .compile();

    controller = module.get<ProfilesController>(ProfilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateProfile', () => {
    it('rejects a URL id that does not match the authenticated user', async () => {
      const req = {
        user: { id: 'user-1' },
      } as unknown as RequestWithUser;

      await expect(
        controller.updateProfile(
          'someone-elses-id',
          {} as UpdateProfileDto,
          req,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(updateProfile).not.toHaveBeenCalled();
    });

    it('proceeds when the URL id matches the authenticated user', async () => {
      const req = {
        user: { id: 'user-1' },
      } as unknown as RequestWithUser;
      const dto = { bio: 'hello' } as UpdateProfileDto;

      const result = await controller.updateProfile('user-1', dto, req);

      expect(updateProfile).toHaveBeenCalledWith(dto, req.user);
      expect(result).toEqual({ message: 'Successfully updated!' });
    });
  });
});
