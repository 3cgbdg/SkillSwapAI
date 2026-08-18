import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { PrismaService } from 'prisma/prisma.service';
import { RequestsService } from 'src/requests/requests.service';
import { RequestGateway } from 'src/webSockets/request.gateway';

describe('SessionsService', () => {
  let service: SessionsService;
  let prisma: {
    session: { findFirst: jest.Mock; update: jest.Mock; delete: jest.Mock };
    request: { findUnique: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      session: {
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      request: { findUnique: jest.fn() },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionsService],
    })
      .useMocker((token) => {
        if (token === PrismaService) return prisma;
        if (token === RequestsService)
          return { getBasicRequestInclude: jest.fn().mockReturnValue({}) };
        if (token === RequestGateway)
          return {
            notifyUserAcceptedSession: jest.fn(),
            notifyUserRejectedSession: jest.fn(),
          };
        return {};
      })
      .compile();

    service = module.get<SessionsService>(SessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('acceptSessionRequest', () => {
    it('rejects a caller who is not a participant of the session', async () => {
      prisma.session.findFirst.mockResolvedValue(null);

      await expect(
        service.acceptSessionRequest(
          { requestId: 'req-1', friendId: 'friend' },
          'stranger',
          'session-1',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects a requestId that belongs to a different session', async () => {
      prisma.session.findFirst.mockResolvedValue({ id: 'session-1' });
      // A real request, just not addressed for *this* session — e.g. a
      // pending friend request or a request tied to some other session.
      prisma.request.findUnique.mockResolvedValue({
        id: 'req-1',
        sessionId: 'some-other-session',
        toId: 'me',
        fromId: 'friend',
      });

      await expect(
        service.acceptSessionRequest(
          { requestId: 'req-1', friendId: 'friend' },
          'me',
          'session-1',
        ),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('rejects a requestId that was not addressed to the caller', async () => {
      prisma.session.findFirst.mockResolvedValue({ id: 'session-1' });
      prisma.request.findUnique.mockResolvedValue({
        id: 'req-1',
        sessionId: 'session-1',
        toId: 'someone-else',
        fromId: 'friend',
      });

      await expect(
        service.acceptSessionRequest(
          { requestId: 'req-1', friendId: 'friend' },
          'me',
          'session-1',
        ),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });
});
