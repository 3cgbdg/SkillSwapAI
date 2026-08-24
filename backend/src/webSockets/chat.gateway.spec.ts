import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Cache } from 'cache-manager';
import { PrismaService } from 'prisma/prisma.service';
import { ChatGateway } from './chat.gateway';

describe('ChatGateway messaging authorization', () => {
  const roomEmit = jest.fn();
  const serverTo = jest.fn(() => ({ emit: roomEmit }));
  const clientEmit = jest.fn();
  const client = {
    data: { userId: 'me' },
    emit: clientEmit,
  };
  const cacheManager = {
    del: jest.fn(),
    get: jest.fn(),
  };
  const prisma = {
    friendship: { count: jest.fn() },
    chat: { findFirst: jest.fn(), create: jest.fn() },
    message: { create: jest.fn() },
  };
  let gateway: ChatGateway;

  beforeEach(() => {
    jest.clearAllMocks();
    gateway = new ChatGateway(
      prisma as unknown as PrismaService,
      {} as JwtService,
      {} as ConfigService,
      cacheManager as unknown as Cache,
    );
    gateway.server = { to: serverTo } as never;
  });

  it('rejects messages to non-friends without writing chat data', async () => {
    prisma.friendship.count.mockResolvedValue(0);

    await gateway.sendPrivateMessage(client as never, {
      to: 'stranger',
      message: 'hello',
    });

    expect(clientEmit).toHaveBeenCalledWith('messageError', {
      message: 'You can only message friends',
    });
    expect(prisma.chat.findFirst).not.toHaveBeenCalled();
    expect(prisma.chat.create).not.toHaveBeenCalled();
    expect(prisma.message.create).not.toHaveBeenCalled();
  });

  it('persists and delivers a message between friends', async () => {
    const createdAt = new Date('2026-08-24T10:00:00.000Z');
    prisma.friendship.count.mockResolvedValue(1);
    prisma.chat.findFirst.mockResolvedValue({ id: 'chat-1' });
    prisma.message.create.mockResolvedValue({ id: 'message-1', createdAt });
    cacheManager.get.mockResolvedValue(1);

    await gateway.sendPrivateMessage(client as never, {
      to: 'friend',
      message: 'hello',
    });

    expect(prisma.message.create).toHaveBeenCalledWith({
      data: {
        fromId: 'me',
        toId: 'friend',
        content: 'hello',
        chatId: 'chat-1',
      },
    });
    expect(clientEmit).toHaveBeenCalledWith('messageSent', {
      id: 'message-1',
      createdAt,
    });
    expect(serverTo).toHaveBeenCalledWith('user:friend');
    expect(roomEmit).toHaveBeenCalledWith('receiveMessage', {
      from: 'me',
      messageContent: 'hello',
      id: 'message-1',
    });
  });

  it('does not relay typing state to non-friends', async () => {
    prisma.friendship.count.mockResolvedValue(0);

    await gateway.handleTyping(client as never, { to: 'stranger' });
    await gateway.handleStopTyping(client as never, { to: 'stranger' });

    expect(serverTo).not.toHaveBeenCalled();
  });
});
