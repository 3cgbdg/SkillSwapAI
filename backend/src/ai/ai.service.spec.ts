import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';
import { PrismaService } from 'prisma/prisma.service';
import { RequestGateway } from 'src/webSockets/request.gateway';
import { buildMatchGraph } from './graphs/match.graph';
import { buildSkillsGraph } from './graphs/skills.graph';

jest.mock('./graphs/match.graph');
jest.mock('./graphs/skills.graph');
jest.mock('@langchain/openai', () => ({
  ChatOpenAI: jest.fn().mockImplementation(() => ({})),
}));

const mockedBuildMatchGraph = buildMatchGraph as jest.Mock;
const mockedBuildSkillsGraph = buildSkillsGraph as jest.Mock;

describe('AiService', () => {
  let service: AiService;
  let prisma: {
    user: { findMany: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
    skill: { createMany: jest.Mock };
  };
  let matchInvoke: jest.Mock;
  let skillsInvoke: jest.Mock;
  let notifyAiSuggestions: jest.Mock;

  beforeEach(async () => {
    matchInvoke = jest.fn();
    skillsInvoke = jest.fn();
    mockedBuildMatchGraph.mockReturnValue({ invoke: matchInvoke });
    mockedBuildSkillsGraph.mockReturnValue({ invoke: skillsInvoke });

    notifyAiSuggestions = jest.fn();

    prisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      skill: {
        createMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AiService],
    })
      .useMocker((token) => {
        if (token === PrismaService) return prisma;
        if (token === ConfigService)
          return {
            get: jest.fn().mockReturnValue(undefined),
            getOrThrow: jest.fn().mockReturnValue('test-openai-key'),
          };
        if (token === RequestGateway)
          return {
            notifyAiSuggestions,
            notifyMatchReady: jest.fn(),
            notifyMatchFailed: jest.fn(),
          };
        return {};
      })
      .compile();

    service = module.get<AiService>(AiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateBodyForActiveMatch', () => {
    it('throws BadRequestException when ids are missing', async () => {
      await expect(
        service.generateBodyForActiveMatch('', 'other'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws BadRequestException when both users are not found', async () => {
      prisma.user.findMany.mockResolvedValue([{ id: 'a' }]);

      await expect(
        service.generateBodyForActiveMatch('a', 'b'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('invokes the match graph and returns the generated plan', async () => {
      const u1 = { id: 'a', name: 'A', knownSkills: [], skillsToLearn: [] };
      const u2 = { id: 'b', name: 'B', knownSkills: [], skillsToLearn: [] };
      prisma.user.findMany.mockResolvedValue([u1, u2]);

      const generatedData = {
        compatibility: 80,
        aiExplanation: 'Great match',
        id: 'match-1',
        keyBenefits: ['a', 'b', 'c', 'd'],
        modules: [],
      };
      matchInvoke.mockResolvedValue({ result: generatedData });

      const result = await service.generateBodyForActiveMatch('a', 'b');

      expect(matchInvoke).toHaveBeenCalledWith({
        user1: {
          id: 'a',
          name: 'A',
          knownSkills: ['General Discussion'],
          skillsToLearn: ['New Insights'],
        },
        user2: {
          id: 'b',
          name: 'B',
          knownSkills: ['General Discussion'],
          skillsToLearn: ['New Insights'],
        },
      });
      expect(result).toEqual({ generatedData, other: u2 });
    });

    it('returns null when the graph produces no result', async () => {
      const u1 = { id: 'a', name: 'A', knownSkills: [], skillsToLearn: [] };
      const u2 = { id: 'b', name: 'B', knownSkills: [], skillsToLearn: [] };
      prisma.user.findMany.mockResolvedValue([u1, u2]);
      matchInvoke.mockResolvedValue({ result: undefined });

      const result = await service.generateBodyForActiveMatch('a', 'b');

      expect(result).toBeNull();
    });
  });

  describe('getAiSuggestionSkills', () => {
    it('throws BadRequestException when myId is missing', async () => {
      await expect(service.getAiSuggestionSkills('')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('throws UnauthorizedException when the user is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getAiSuggestionSkills('a')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('throws ForbiddenException within the 24h regeneration cooldown', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'a',
        skillsToLearn: [],
        knownSkills: [],
        lastSkillsGenerationDate: new Date(),
      });

      await expect(service.getAiSuggestionSkills('a')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('invokes the skills graph, persists suggestions, and notifies the gateway', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'a',
        skillsToLearn: [{ title: 'Guitar' }],
        knownSkills: [{ title: 'Python' }],
        lastSkillsGenerationDate: null,
      });
      const skills = ['A', 'B', 'C', 'D', 'E'];
      skillsInvoke.mockResolvedValue({ result: { skills } });

      const result = await service.getAiSuggestionSkills('a');

      expect(skillsInvoke).toHaveBeenCalledWith({
        skillsToLearn: ['Guitar'],
        knownSkills: ['Python'],
      });
      expect(prisma.skill.createMany).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'a' },
        data: {
          aiSuggestionSkills: skills,
          lastSkillsGenerationDate: expect.any(Date) as Date,
        },
      });
      expect(notifyAiSuggestions).toHaveBeenCalledWith('a', skills);
      expect(result).toEqual({
        data: skills,
        message: 'Skills successfully generated!',
      });
    });

    it('skips persistence and notification when the graph produces no skills', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'a',
        skillsToLearn: [],
        knownSkills: [],
        lastSkillsGenerationDate: null,
      });
      skillsInvoke.mockResolvedValue({ result: { skills: [] } });

      const result = await service.getAiSuggestionSkills('a');

      expect(prisma.skill.createMany).not.toHaveBeenCalled();
      expect(notifyAiSuggestions).not.toHaveBeenCalled();
      expect(result).toEqual({
        data: [],
        message: 'Skills successfully generated!',
      });
    });
  });
});
