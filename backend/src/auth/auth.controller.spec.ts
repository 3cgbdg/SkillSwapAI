import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CookiesService } from './cookies.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    })
      .useMocker(() => ({}))
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('logout', () => {
    let revokeRefreshToken: jest.Mock;
    let clearCookies: jest.Mock;

    beforeEach(async () => {
      revokeRefreshToken = jest.fn().mockResolvedValue(undefined);
      clearCookies = jest.fn();

      const module: TestingModule = await Test.createTestingModule({
        controllers: [AuthController],
      })
        .useMocker((token) => {
          if (token === AuthService) return { revokeRefreshToken };
          if (token === CookiesService) return { clearCookies };
          return {};
        })
        .compile();

      controller = module.get<AuthController>(AuthController);
    });

    it('revokes the refresh token and clears cookies when a refresh token is present', async () => {
      const req = {
        cookies: { refresh_token: 'a-real-refresh-token' },
      } as unknown as Request;
      const res = {} as Response;

      const result = await controller.logout(req, res);

      expect(revokeRefreshToken).toHaveBeenCalledWith('a-real-refresh-token');
      expect(clearCookies).toHaveBeenCalledWith(res);
      expect(result).toEqual({ message: 'Successfully logged out!' });
    });

    it('still clears cookies, without attempting revocation, when there is no refresh token cookie', async () => {
      const req = { cookies: {} } as unknown as Request;
      const res = {} as Response;

      await controller.logout(req, res);

      expect(revokeRefreshToken).not.toHaveBeenCalled();
      expect(clearCookies).toHaveBeenCalledWith(res);
    });
  });
});
