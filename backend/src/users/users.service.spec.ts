import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'prisma/prisma.service';
import { User } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('update', () => {
    const userId = 'user-123';
    const updateData = { name: 'New Name' };

    it('should successfully update user', async () => {
      const updatedUser = { id: userId, ...updateData };
      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateData);

      expect(result).toEqual(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
      });
    });

    it('should throw NotFoundException when prisma returns P2025 error', async () => {
      const error = new Error('Record not found');
      (error as { code?: string }).code = 'P2025';
      (prisma.user.update as jest.Mock).mockRejectedValue(error);

      await expect(service.update(userId, updateData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateUserImageUrl', () => {
    const userId = 'user-123';
    const imageUrl = 'http://example.com/image.jpg';

    it('should successfully update user image url by calling update', async () => {
      const updatedUser = { id: userId, imageUrl } as User;
      jest.spyOn(service, 'update').mockResolvedValue(updatedUser);

      const result = await service.updateUserImageUrl(userId, imageUrl);

      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith(userId, { imageUrl });
    });
  });
});
