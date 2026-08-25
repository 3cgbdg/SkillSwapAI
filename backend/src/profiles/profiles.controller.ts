import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { RequestWithUser } from 'types/auth';
import { Throttle } from '@nestjs/throttler';
import type { IReturnMessage, ReturnDataType } from 'types/general';

@Controller('profiles')
@UseGuards(AuthGuard('jwt'))
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.profilesService.findOne(id);
  }

  @Post('me/avatar/upload')
  @Throttle({ short: { limit: 10, ttl: 60_000 } })
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowed.includes(file.mimetype)) {
          cb(new BadRequestException('Only image files are allowed'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatarImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ): Promise<ReturnDataType<{ url: string }>> {
    if (!file) {
      throw new BadRequestException('Image data is missing');
    }
    return this.profilesService.updateProfileAvatarImage(file, req.user.id);
  }

  @Delete('me/avatar/delete')
  async deleteAvatarImage(
    @Req() req: RequestWithUser,
  ): Promise<IReturnMessage> {
    return this.profilesService.deleteProfileAvatarImage(req.user);
  }

  @Patch(':id')
  async updateProfile(
    @Param('id') id: string,
    @Body() dto: UpdateProfileDto,
    @Req() req: RequestWithUser,
  ): Promise<IReturnMessage> {
    // The service always scopes the update to req.user.id regardless of
    // this param, so this couldn't be used to write another user's
    // profile -- but silently accepting a 200 on a URL naming a different
    // user's id is a misleading contract that a future refactor could trust
    // by mistake. Reject the mismatch explicitly instead.
    if (id !== req.user.id) {
      throw new ForbiddenException('Cannot update another user’s profile');
    }
    return this.profilesService.updateProfile(dto, req.user);
  }
}
