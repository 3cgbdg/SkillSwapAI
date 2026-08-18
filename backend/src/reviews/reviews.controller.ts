import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import type { RequestWithUser } from 'types/auth';
import type { ReturnDataType } from 'types/general';
import type { IReviewWithReviewer, IUserReviewsResult } from 'types/reviews';
import type { ISessionWithFriend } from 'types/sessions';

@Controller('reviews')
@UseGuards(AuthGuard('jwt'))
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async create(
    @Body() dto: CreateReviewDto,
    @Req() req: RequestWithUser,
  ): Promise<ReturnDataType<IReviewWithReviewer>> {
    return this.reviewsService.create(dto, req.user.id);
  }

  @Get('reviewable-sessions')
  async getReviewableSessions(
    @Req() req: RequestWithUser,
  ): Promise<ReturnDataType<ISessionWithFriend[]>> {
    return this.reviewsService.getReviewableSessions(req.user.id);
  }

  @Get('user/:id')
  async getUserReviews(
    @Param('id') id: string,
    @Query('take') take: string | undefined,
    @Query('skip') skip: string | undefined,
  ): Promise<ReturnDataType<IUserReviewsResult>> {
    const parsedTake = take !== undefined ? Number(take) : undefined;
    const parsedSkip = skip !== undefined ? Number(skip) : undefined;
    return this.reviewsService.getUserReviews(
      id,
      Number.isNaN(parsedTake) ? undefined : parsedTake,
      Number.isNaN(parsedSkip) ? undefined : parsedSkip,
    );
  }
}
